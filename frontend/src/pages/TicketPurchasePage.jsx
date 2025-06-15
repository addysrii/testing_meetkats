import React, { useState, useEffect, Suspense } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  CreditCard, 
  Smartphone, 
  CheckCircle, 
  XCircle,
  Ticket,
  Calendar,
  Clock,
  ShoppingBag,
  Tag,
  Info,
  AlertCircle,
  ChevronsUp,
  ChevronsDown,
  Gift,
  Share2,
  Download,
  Percent,
  RefreshCcw,
  MapPin,
  Copy
} from 'lucide-react';
import eventService from '../services/eventService';
import ticketService from '../services/ticketService';

// Use dynamic import for Cashfree component to avoid loading it unnecessarily
const CashfreePayment = React.lazy(() => import('../components/payment/CashfreeButton'));

const TicketPurchasePage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  
  const [event, setEvent] = useState(null);
  const [ticketTypes, setTicketTypes] = useState([]);
  const [selectedTickets, setSelectedTickets] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [originalAmount, setOriginalAmount] = useState(0);
  const [serviceFee, setServiceFee] = useState(0); // Added service fee state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [checkoutStep, setCheckoutStep] = useState('select'); // select, payment, confirmation
  const [customerInfo, setCustomerInfo] = useState({ email: '', phone: '', name: '' });
  const [paymentMethod, setPaymentMethod] = useState('cashfree_sdk');
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [bookingId, setBookingId] = useState(null);
  
  // State variables for coupon functionality
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [discount, setDiscount] = useState(0);
  
  // State for additional user preferences
  const [specialRequests, setSpecialRequests] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showTicketDetails, setShowTicketDetails] = useState(true);
  const [transactionId, setTransactionId] = useState(null);
  const [paymentPolling, setPaymentPolling] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  // Check for successful payment on initial load or when returning from payment gateway
  useEffect(() => {
    const checkPaymentStatus = async () => {
      // Get stored order ID and booking ID from localStorage
      const storedOrderId = localStorage.getItem('pendingOrderId');
      const storedBookingId = localStorage.getItem('pendingBookingId');
      
      if (storedOrderId && storedBookingId) {
        try {
          setPaymentPolling(true);
          console.log('Checking payment status for order:', storedOrderId);
          
          // Check payment status with the API
          const status = await ticketService.checkCashfreeFormPaymentStatus(storedOrderId, 'cashfree_sdk');
          
          if (status && (status.status === 'PAYMENT_SUCCESS' || status.status === 'completed')) {
            console.log('Payment successful for order:', storedOrderId);
            setPaymentStatus('success');
            setSuccessMessage('Payment successful! Redirecting to confirmation page...');
            
            // Clear localStorage
            localStorage.removeItem('pendingOrderId');
            localStorage.removeItem('pendingBookingId');
            localStorage.removeItem('cashfreeOrderToken');
            
            // Redirect to confirmation page
            setTimeout(() => {
              navigate(`/tickets/confirmation/${storedBookingId}`);
            }, 1500);
          }
        } catch (err) {
          console.error('Error checking payment status:', err);
        } finally {
          setPaymentPolling(false);
        }
      }
    };
    
    checkPaymentStatus();
  }, [navigate]);
  
  // Fetch event and ticket types on component mount
  useEffect(() => {
    const fetchEventData = async () => {
      try {
        setLoading(true);
        
        // Fetch event details
        const eventData = await eventService.getEvent(eventId);
        setEvent(eventData);
        
        // Fetch available ticket types
        const ticketsData = await ticketService.getEventTicketTypes(eventId);
        
        // Filter out inactive or sold out tickets
        const availableTickets = ticketsData?.data?.filter(
          ticket => ticket.isActive && (ticket.quantity > ticket.quantitySold || ticket.quantity === -1)
        ) || [];
        
        setTicketTypes(availableTickets);
        
        // Initialize selected tickets array
        setSelectedTickets(
          availableTickets.map(ticket => ({
            ticketTypeId: ticket.id,
            quantity: 0,
            name: ticket.name,
            price: ticket.price,
            maxQuantity: ticket.maxPerUser || 10,
            description: ticket.description || ''
          }))
        );
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching event data:', err);
        setError('Failed to load event data. Please try again.');
        setLoading(false);
      }
    };
    
    fetchEventData();
  }, [eventId]);
  // Calculate total amount whenever selected tickets or applied coupon change
  useEffect(() => {
    let subtotal = 0;
    
    selectedTickets.forEach(ticket => {
      subtotal += ticket.price * ticket.quantity;
    });
    
    setOriginalAmount(subtotal);
    
    // Calculate service fee (20% of subtotal)
    const calculatedServiceFee = subtotal * 0.2;
    setServiceFee(calculatedServiceFee);
    
    // Calculate the total before discount (subtotal + service fee)
    const totalBeforeDiscount = subtotal + calculatedServiceFee;
    
    // Apply discount if coupon is active
    if (appliedCoupon) {
      if (appliedCoupon.discountType === 'percentage') {
        // Apply percentage discount to the total (subtotal + service fee)
        const discountValue = totalBeforeDiscount * (appliedCoupon.discountValue / 100);
        setDiscount(discountValue);
        setTotalAmount(totalBeforeDiscount - discountValue);
      } else if (appliedCoupon.discountType === 'fixed') {
        setDiscount(appliedCoupon.discountValue);
        // Apply fixed discount to the total (ensure total doesn't go negative)
        setTotalAmount(Math.max(0, totalBeforeDiscount - appliedCoupon.discountValue));
      } else {
        setTotalAmount(totalBeforeDiscount);
        setDiscount(0);
      }
    } else {
      // No coupon
      setTotalAmount(totalBeforeDiscount);
      setDiscount(0);
    }
  }, [selectedTickets, appliedCoupon]);

  // Continuous payment status check
  useEffect(() => {
    let intervalId;
    
    if (paymentPolling && transactionId) {
      intervalId = setInterval(async () => {
        try {
          console.log('Polling payment status for transaction:', transactionId);
          
          const status = await ticketService.checkPaymentStatus(transactionId, paymentMethod);
          
          if (status && (status.status === 'PAYMENT_SUCCESS' || status.status === 'completed')) {
            clearInterval(intervalId);
            setPaymentPolling(false);
            setPaymentStatus('success');
            setSuccessMessage('Payment successful! Redirecting to confirmation page...');
            
            // Redirect to confirmation page
            if (bookingId) {
              // Clear localStorage first
              localStorage.removeItem('pendingOrderId');
              localStorage.removeItem('pendingBookingId');
              localStorage.removeItem('cashfreeOrderToken');
              
              setTimeout(() => {
                navigate(`/tickets/confirmation/${bookingId}`);
              }, 1500);
            }
          } else if (status && (status.status === 'PAYMENT_FAILED' || status.status === 'failed')) {
            clearInterval(intervalId);
            setPaymentPolling(false);
            setPaymentStatus('failed');
            setError('Payment failed. Please try again.');
          }
        } catch (err) {
          console.error('Error checking payment status:', err);
        }
      }, 3000); // Check every 3 seconds
    }
    
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [paymentPolling, transactionId, bookingId, navigate, paymentMethod]);
  // Update ticket quantity
  const handleQuantityChange = (index, quantity) => {
    const updatedTickets = [...selectedTickets];
    updatedTickets[index].quantity = quantity;
    setSelectedTickets(updatedTickets);
  };
  
  // Handle customer info change
  const handleInfoChange = (e) => {
    const { name, value } = e.target;
    setCustomerInfo(prev => ({ ...prev, [name]: value }));
    const { phone, values } = e.target;
    setCustomerInfo(prev => ({ ...prev, [phone]: values }));
  };
  
  // Apply coupon code
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code');
      return;
    }
    
    try {
      setCouponLoading(true);
      setCouponError(null);
      
      // Call the API to validate the coupon
      const couponResult = await ticketService.validateCoupon(eventId, couponCode);
      
      if (couponResult && couponResult.valid) {
        setAppliedCoupon({
          code: couponCode,
          discountType: couponResult.coupon?.discountPercentage ? 'percentage' : 'fixed',
          discountValue: couponResult.coupon?.discountPercentage || 0,
          name: couponResult.coupon?.name || couponCode
        });
        setCouponCode('');
      } else {
        setCouponError(couponResult.error || 'Invalid coupon code');
      }
    } catch (err) {
      console.error('Error validating coupon:', err);
      setCouponError(err.message || 'Failed to validate coupon');
    } finally {
      setCouponLoading(false);
    }
  };
  
  // Remove applied coupon
  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponError(null);
  };
  // Proceed to payment step
  const proceedToPayment = async () => {
    // Validate ticket selection
    const hasSelectedTickets = selectedTickets.some(ticket => ticket.quantity > 0);
    
    if (!hasSelectedTickets) {
      setError('Please select at least one ticket');
      return;
    }
    
    if (!customerInfo.email || !customerInfo.phone) {
      setError('Please provide your contact information');
      return;
    }
    
    if (!acceptedTerms) {
      setError('Please accept the terms and conditions');
      return;
    }
    
    // Clear any previous errors
    setError(null);
    
    try {
      setPaymentProcessing(true);
      
      // Create booking object to send
      const bookingData = {
        ticketSelections: selectedTickets
          .filter(ticket => ticket.quantity > 0)
          .map(ticket => ({
            ticketTypeId: ticket.ticketTypeId,
            quantity: ticket.quantity
          })),
        paymentMethod: 'cashfree_sdk',
        contactInformation: customerInfo,
        specialRequests: specialRequests || '',
        serviceFee: serviceFee // Include service fee in booking data
      };
      
      // Add coupon if applied
      if (appliedCoupon) {
        bookingData.promoCode = appliedCoupon.code;
      }
      
      // Create booking with the API
      const booking = await ticketService.bookEventTickets(eventId, bookingData);
      
      if (booking && booking.booking && booking.booking.id) {
        // Store booking ID
        setBookingId(booking.booking.id);
        
        // Move to payment step
        setCheckoutStep('payment');
      } else {
        throw new Error('Failed to create booking');
      }
    } catch (err) {
      console.error('Error creating booking:', err);
      setError(err.message || 'Failed to create booking. Please try again.');
    } finally {
      setPaymentProcessing(false);
    }
  };
  
  // Go back to previous step
  const goBack = () => {
    if (checkoutStep === 'payment') {
      setCheckoutStep('select');
    } else if (checkoutStep === 'confirmation') {
      setCheckoutStep('payment');
    } else {
      navigate(`/events/${eventId}`);
    }
  };
  // Handle successful payment
  const handlePaymentSuccess = (paymentResult) => {
    console.log('Payment successful:', paymentResult);
    setPaymentProcessing(false);
    setPaymentStatus('success');
    setSuccessMessage('Payment successful! Redirecting to confirmation page...');
    
    // Redirect to confirmation page
    if (bookingId) {
      // Clear localStorage first
      localStorage.removeItem('pendingOrderId');
      localStorage.removeItem('pendingBookingId');
      localStorage.removeItem('cashfreeOrderToken');
      
      setTimeout(() => {
        navigate(`/tickets/confirmation/${bookingId}`);
      }, 1500);
    }
  };
  
  // Handle payment failure
  const handlePaymentFailure = (error) => {
    console.error('Payment failed:', error);
    setError('Payment could not be completed. Please try again.');
    setPaymentProcessing(false);
    setPaymentStatus('failed');
  };
  
  // Handle payment cancellation
  const handlePaymentCancel = () => {
    setPaymentProcessing(false);
    setPaymentStatus('cancelled');
  };
  
  // Initiate UPI payment
  const handleUpiPayment = async () => {
    try {
      setPaymentProcessing(true);
      setError(null);
      
      // Create UPI payment request
      const paymentData = {
        bookingId,
        amount: totalAmount,
        eventName: event?.name || 'Event Tickets',
        customerName: customerInfo.name,
        customerPhone: customerInfo.phone,
        customerEmail: customerInfo.email
      };
      
      const result = await ticketService.initiateUpiPayment(eventId, paymentData);
      
      if (result && result.success) {
        // Set transaction ID for polling
        setTransactionId(result.orderId);
        setPaymentPolling(true);
        
        // Store in localStorage for recovery if page is closed/refreshed
        localStorage.setItem('pendingOrderId', result.orderId);
        localStorage.setItem('pendingBookingId', bookingId);
        
        // Open payment link in new tab if available
        if (result.paymentLink) {
          window.open(result.paymentLink, '_blank');
        }
      } else {
        throw new Error('Failed to initiate UPI payment');
      }
    } catch (err) {
      console.error('Error initiating UPI payment:', err);
      setError(err.message || 'Failed to initiate UPI payment. Please try again.');
      setPaymentProcessing(false);
    }
  };
  // Format currency for display
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };
  
  // Format time for display
  const formatTime = (dateString) => {
    if (!dateString) return '';
    
    const options = { hour: '2-digit', minute: '2-digit', hour12: true };
    return new Date(dateString).toLocaleTimeString('en-US', options);
  };
  
  // Copy booking ID to clipboard
  const copyBookingId = () => {
    if (bookingId) {
      navigator.clipboard.writeText(bookingId);
      setSuccessMessage('Booking ID copied to clipboard!');
      setTimeout(() => setSuccessMessage(''), 2000);
    }
  };
  // Loading state
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="w-10 h-10 border-t-4 border-b-4 border-orange-500 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }
  
  // Error state - when the event cannot be loaded
  if (error && !event) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <XCircle className="w-5 h-5 text-red-500 mr-2" />
            <p className="text-red-600">{error}</p>
          </div>
        </div>
        <button
          onClick={() => navigate('/events')}
          className="mt-4 inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Browse Events
        </button>
      </div>
    );
  }
  
  // If payment was successful, show success message and redirection
  if (paymentStatus === 'success' && successMessage) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-green-50 border border-green-200 rounded-md p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-green-800 mb-2">Payment Successful!</h2>
          <p className="text-green-700 mb-4">{successMessage}</p>
          <div className="w-8 h-8 border-t-4 border-b-4 border-green-500 rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={goBack}
          className="inline-flex items-center text-orange-600 hover:text-orange-700"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {checkoutStep === 'select' ? 'Back to Event' : 'Back'}
        </button>
        
        <h1 className="text-2xl font-bold mt-2">
          {checkoutStep === 'select' ? 'Select Tickets' : 
           checkoutStep === 'payment' ? 'Complete Payment' : 
           'Payment Confirmation'}
        </h1>
      </div>
      
      {/* Checkout Progress Indicator */}
      <div className="mb-8 hidden md:block">
        <div className="flex justify-between">
          <div className="relative w-full">
            <div className="h-1 bg-gray-200 absolute w-full top-3"></div>
            <div className="flex justify-between relative">
              <div className="flex flex-col items-center">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center z-10 ${
                  checkoutStep === 'select' ? 'bg-orange-600 text-white' : 'bg-green-500 text-white'
                }`}>
                  {checkoutStep === 'select' ? '1' : <CheckCircle className="w-4 h-4" />}
                </div>
                <span className="text-sm mt-1 font-medium">Select</span>
              </div>
              
              <div className="flex flex-col items-center">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center z-10 ${
                  checkoutStep === 'select' ? 'bg-gray-300' : 
                  checkoutStep === 'payment' ? 'bg-orange-600 text-white' : 'bg-green-500 text-white'
                }`}>
                  {checkoutStep === 'confirmation' ? <CheckCircle className="w-4 h-4" /> : '2'}
                </div>
                <span className="text-sm mt-1 font-medium">Payment</span>
              </div>
              
              <div className="flex flex-col items-center">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center z-10 ${
                  checkoutStep === 'confirmation' ? 'bg-orange-600 text-white' : 'bg-gray-300'
                }`}>
                  3
                </div>
                <span className="text-sm mt-1 font-medium">Confirmation</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Success message */}
      {successMessage && paymentStatus !== 'success' && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
          <div className="flex">
            <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
            <p className="text-green-600">{successMessage}</p>
          </div>
        </div>
      )}
      
      {/* Error display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <div className="flex">
            <XCircle className="w-5 h-5 text-red-500 mr-2" />
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      )}
      
      {/* Payment status display */}
      {paymentStatus === 'failed' && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <div className="flex">
            <XCircle className="w-5 h-5 text-red-500 mr-2" />
            <p className="text-red-600">Payment failed. Please try again or choose a different payment method.</p>
          </div>
        </div>
      )}
      
      {paymentStatus === 'cancelled' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
          <div className="flex">
            <AlertCircle className="w-5 h-5 text-yellow-500 mr-2" />
            <p className="text-yellow-600">Payment was cancelled. Please try again when you're ready.</p>
          </div>
        </div>
      )}
      
      {/* Payment polling indicator */}
      {paymentPolling && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
          <div className="flex items-center">
            <div className="w-5 h-5 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin mr-2"></div>
            <p className="text-blue-600">Checking payment status... Please keep this page open.</p>
          </div>
        </div>
      )}
      {/* Event Details */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex flex-col md:flex-row">
          {event?.coverImage?.url && (
            <div className="md:w-1/3 mb-4 md:mb-0 md:pr-4">
              <img 
                src={event.coverImage.url} 
                alt={event.name} 
                className="w-full h-48 object-cover rounded-md"
              />
            </div>
          )}
          
          <div className="md:w-2/3">
            <h2 className="text-xl font-semibold">{event?.name}</h2>
            
            <div className="flex flex-col space-y-2 mt-3">
              <div className="flex items-center text-gray-600">
                <Calendar className="w-4 h-4 mr-2 text-orange-500" />
                <span>{formatDate(event?.startDateTime)}</span>
              </div>
              
              <div className="flex items-center text-gray-600">
                <Clock className="w-4 h-4 mr-2 text-orange-500" />
                <span>{formatTime(event?.startDateTime)} - {event?.endDateTime ? formatTime(event?.endDateTime) : 'Until Conclusion'}</span>
              </div>
              
              {event?.venue && (
                <div className="flex items-center text-gray-600">
                  <MapPin className="w-4 h-4 mr-2 text-orange-500" />
                  <span>{event.venue}</span>
                </div>
              )}
              
              <div className="flex items-center text-gray-600">
                <Ticket className="w-4 h-4 mr-2 text-orange-500" />
                <span>
                  {ticketTypes.length === 0 
                    ? 'No tickets available' 
                    : `${ticketTypes.length} ticket type${ticketTypes.length !== 1 ? 's' : ''} available`
                  }
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Ticket Selection Step */}
      {checkoutStep === 'select' && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              {/* Ticket Selection */}
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Select Tickets</h3>
                  <button 
                    onClick={() => setShowTicketDetails(!showTicketDetails)}
                    className="text-orange-600 flex items-center text-sm"
                  >
                    {showTicketDetails ? (
                      <>
                        <ChevronsUp className="w-4 h-4 mr-1" />
                        Hide Details
                      </>
                    ) : (
                      <>
                        <ChevronsDown className="w-4 h-4 mr-1" />
                        Show Details
                      </>
                    )}
                  </button>
                </div>
                
                {ticketTypes.length === 0 ? (
                  <p className="text-gray-600">No tickets available for this event.</p>
                ) : (
                  <div className="space-y-4">
                    {ticketTypes.map((ticket, index) => (
                      <div 
                        key={ticket.id} 
                        className="border border-gray-200 rounded-lg p-4 hover:border-orange-300 transition-colors"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="font-medium text-lg">{ticket.name}</div>
                            
                            {/* Only show description if showTicketDetails is true */}
                            {showTicketDetails && ticket.description && (
                              <div className="text-sm text-gray-600 mt-1">{ticket.description}</div>
                            )}
                            
                            <div className="mt-2 font-semibold text-orange-600">{formatCurrency(ticket.price)}</div>
                            
                            {/* Show remaining tickets if limited */}
                            {ticket.quantity !== -1 && ticket.quantity - ticket.quantitySold < 20 && (
                              <div className="mt-1 text-xs text-red-600 flex items-center">
                                <AlertCircle className="w-3 h-3 mr-1" />
                                Only {ticket.quantity - ticket.quantitySold} left
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center">
                            <button
                              onClick={() => handleQuantityChange(index, Math.max(0, selectedTickets[index].quantity - 1))}
                              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-l-md transition-colors"
                              disabled={selectedTickets[index].quantity === 0}
                            >
                              -
                            </button>
                            <span className="bg-white border-t border-b border-gray-200 px-4 py-1">{selectedTickets[index].quantity}</span>
                            <button
                              onClick={() => handleQuantityChange(index, Math.min(selectedTickets[index].maxQuantity, selectedTickets[index].quantity + 1))}
                              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-r-md transition-colors"
                              disabled={selectedTickets[index].quantity >= selectedTickets[index].maxQuantity}
                            >
                              +
                            </button>
                          </div>
                        </div>
                        
                        {selectedTickets[index].quantity > 0 && (
                          <div className="mt-2 text-sm text-right">
                            Subtotal: {formatCurrency(selectedTickets[index].price * selectedTickets[index].quantity)}
                          </div>
                        )}
                      </div>
                    ))}
                    </div>
                  )}
                </div>
                
                {/* Customer Info */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                  <h3 className="text-lg font-semibold mb-4">Your Contact Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="name" className="block text-gray-700 mb-1">Full Name</label>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        value={customerInfo.name}
                        onChange={handleInfoChange}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                        placeholder="Your full name"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="block text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        value={customerInfo.email}
                        onChange={handleInfoChange}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                        required
                        placeholder="you@example.com"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="phone" className="block text-gray-700 mb-1">Phone Number <span className="text-red-500">*</span></label>
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={customerInfo.phone}
                        onChange={handleInfoChange}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                        required
                        placeholder="10-digit mobile number"
                      />
                    </div>
                  </div>
                  
                  {/* Special Requests */}
                  <div className="mt-4">
                    <label htmlFor="specialRequests" className="block text-gray-700 mb-1">Special Requests (optional)</label>
                    <textarea
                      id="specialRequests"
                      name="specialRequests"
                      value={specialRequests}
                      onChange={(e) => setSpecialRequests(e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      rows="3"
                      placeholder="Any special accommodations or requests"
                    />
                  </div>
                </div>
              </div>
              
{/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
                <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
                
                <div className="space-y-2 mb-4">
                  {selectedTickets
                    .filter(ticket => ticket.quantity > 0)
                    .map((ticket, index) => (
                      <div key={index} className="flex justify-between">
                        <div>
                          {ticket.name} x {ticket.quantity}
                        </div>
                        <div>{formatCurrency(ticket.price * ticket.quantity)}</div>
                      </div>
                    ))
                  }
                </div>
                
                {/* Coupon Code Input */}
                <div className="border-t border-gray-200 pt-4 mb-4">
                  <div className="flex mb-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="Enter coupon code"
                      className="flex-1 border border-gray-300 rounded-l-md px-3 py-2"
                      disabled={couponLoading || appliedCoupon}
                    />
                    
                    {appliedCoupon ? (
                      <button
                        onClick={handleRemoveCoupon}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-r-md px-3"
                      >
                        Remove
                      </button>
                    ) : (
                      <button
                        onClick={handleApplyCoupon}
                        disabled={!couponCode.trim() || couponLoading}
                        className={`rounded-r-md px-3 ${
                          !couponCode.trim() || couponLoading
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-orange-600 hover:bg-orange-700 text-white'
                        }`}
                      >
                        {couponLoading ? (
                          <div className="w-4 h-4 border-t-2 border-white rounded-full animate-spin"></div>
                        ) : 'Apply'}
                      </button>
                    )}
                  </div>
                  
                  {couponError && (
                    <p className="text-red-600 text-sm">{couponError}</p>
                  )}
                  
                  {appliedCoupon && (
                    <div className="bg-green-50 border border-green-200 rounded-md p-2 flex items-center">
                      <Tag className="w-4 h-4 text-green-600 mr-2" />
                      <div className="flex-1">
                        <p className="text-sm text-green-800">
                          {appliedCoupon.name} applied
                          {appliedCoupon.discountType === 'percentage' && ` (${appliedCoupon.discountValue}% off)`}
                          {appliedCoupon.discountType === 'fixed' && ` (${formatCurrency(appliedCoupon.discountValue)} off)`}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Price Details with Service Fee */}
                <div className="space-y-2 border-t border-gray-200 pt-4">
                  <div className="flex justify-between">
                    <div className="text-gray-600">Subtotal</div>
                    <div>{formatCurrency(originalAmount)}</div>
                  </div>
                  
                  {/* Service Fee (20%) */}
                  <div className="flex justify-between">
                    <div className="text-gray-600">Service Fee (20%)</div>
                    <div>{formatCurrency(serviceFee)}</div>
                  </div>
                  
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <div>Discount</div>
                      <div>-{formatCurrency(discount)}</div>
                    </div>
                  )}
                  
                  <div className="flex justify-between border-t border-gray-200 pt-2 font-bold text-lg">
                    <div>Total</div>
                    <div>{formatCurrency(totalAmount)}</div>
                  </div>
                </div>
                
                {/* Terms and Conditions */}
                <div className="mt-4 mb-4">
                  <label className="flex items-start">
                    <input
                      type="checkbox"
                      checked={acceptedTerms}
                      onChange={(e) => setAcceptedTerms(e.target.checked)}
                      className="mt-1 mr-2"
                    />
                    <span className="text-sm text-gray-600">
                      I agree to the <a href="/termsandconditons" target="_blank" className="text-orange-600 hover:underline">Terms and Conditions</a>, <a href="/privacypolicy" target="_blank" className="text-orange-600 hover:underline">Privacy Policy</a>, and <a href="/refundpolicy" target="_blank" className="text-orange-600 hover:underline">Refund Policy</a>.
                    </span>
                  </label>
                </div>
                
                {/* Actions */}
                <button
                  onClick={proceedToPayment}
                  disabled={
                    !selectedTickets.some(ticket => ticket.quantity > 0) || 
                    !customerInfo.email || 
                    !customerInfo.phone || 
                    !acceptedTerms ||
                    paymentProcessing
                  }
                  className={`w-full inline-flex items-center justify-center px-6 py-3 rounded-md text-white ${
                    !selectedTickets.some(ticket => ticket.quantity > 0) || 
                    !customerInfo.email || 
                    !customerInfo.phone ||
                    !acceptedTerms ||
                    paymentProcessing
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-orange-600 hover:bg-orange-700'
                  }`}
                >
                  {paymentProcessing ? (
                    <>
                      <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-5 h-5 mr-2" />
                      Proceed to Payment
                    </>
                  )}
                </button>
                
                {/* Secure Transaction Notice */}
                <div className="mt-4 flex items-center justify-center text-sm text-gray-500">
                  <Info className="w-4 h-4 mr-1" />
                  Secure transaction via Cashfree
                </div>
              </div>
            </div>
          </div>
        </>
      )}
      {/* Payment Step */}
      {checkoutStep === 'payment' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">Select Payment Method</h3>
              
              <div className="space-y-4 mb-6">
                <label className="flex items-center p-4 border border-gray-200 rounded-md cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cashfree_sdk"
                    checked={paymentMethod === 'cashfree_sdk'}
                    onChange={() => setPaymentMethod('cashfree_sdk')}
                    className="mr-2"
                  />
                  <CreditCard className="w-5 h-5 text-orange-500 mr-2" />
                  <span>Cashfree (Credit/Debit Cards, UPI, Netbanking)</span>
                </label>
                
{/*                 <label className="flex items-center p-4 border border-gray-200 rounded-md cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="upi"
                    checked={paymentMethod === 'upi'}
                    onChange={() => setPaymentMethod('upi')}
                    className="mr-2"
                  />
                  <Smartphone className="w-5 h-5 text-orange-500 mr-2" />
                  <span>UPI Payment (PhonePe, Google Pay, Paytm)</span>
                </label> */}
              </div>
              
              {/* Pricing Information in Payment Step with Service Fee */}
              <div className="bg-gray-50 rounded-md p-4 mb-6">
                <div className="flex justify-between mb-2">
                  <div className="text-gray-600">Subtotal:</div>
                  <div>{formatCurrency(originalAmount)}</div>
                </div>
                
                <div className="flex justify-between mb-2">
                  <div className="text-gray-600">Service Fee (20%):</div>
                  <div>{formatCurrency(serviceFee)}</div>
                </div>
                
                {discount > 0 && (
                  <div className="flex justify-between mb-2 text-green-600">
                    <div>Discount:</div>
                    <div>-{formatCurrency(discount)}</div>
                  </div>
                )}
                
                <div className="flex justify-between font-semibold pt-2 border-t border-gray-200">
                  <div>Total:</div>
                  <div>{formatCurrency(totalAmount)}</div>
                </div>
              </div>
              {paymentMethod === 'cashfree_sdk' && (
                <Suspense fallback={<div className="flex justify-center my-8"><div className="w-10 h-10 border-t-4 border-b-4 border-orange-500 rounded-full animate-spin"></div></div>}>
                  <CashfreePayment
                    amount={totalAmount}
                    bookingId={bookingId || 'pending'}
                    eventName={event?.name || 'Event Tickets'}
                    onSuccess={handlePaymentSuccess}
                    onFailure={handlePaymentFailure}
                    onCancel={handlePaymentCancel}
                  />
                </Suspense>
              )}
              
              {paymentMethod === 'upi' && (
                <div className="bg-white border border-gray-200 rounded-md p-6">
                  <h4 className="font-medium mb-4">UPI Payment</h4>
                  
                  <div className="bg-gray-50 rounded-md p-4 mb-4 text-center">
                    <p className="text-gray-700 mb-2">Scan the QR code using any UPI app</p>
                    <div className="flex justify-center mb-2">
                      {/* Placeholder for QR code */}
                      <div className="w-48 h-48 bg-gray-200 rounded-md flex items-center justify-center">
                        <span className="text-gray-500">QR Code</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">or pay using UPI ID</p>
                    <div className="flex items-center justify-center mt-2">
                      <span className="bg-gray-200 text-gray-800 px-3 py-1 rounded font-mono">example@ybl</span>
                      <button className="ml-2 text-orange-600 hover:text-orange-700">
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <button 
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-md flex items-center justify-center"
                    onClick={handleUpiPayment}
                    disabled={paymentProcessing}
                  >
                    {paymentProcessing ? (
                      <>
                        <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin mr-2"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <Smartphone className="w-5 h-5 mr-2" />
                        Pay ₹{totalAmount.toFixed(2)} with UPI
                      </>
                    )}
                  </button>
                </div>
              )}
              
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  By proceeding with payment, you agree to our <a href="/termsandconditons" className="text-orange-600 hover:underline">Terms and Conditions</a> and <a href="/refundpolicy" className="text-orange-600 hover:underline">Refund Policy</a>.
                </p>
              </div>
            </div>
          </div>
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
              <h3 className="text-lg font-semibold mb-4">Booking Details</h3>
              
              {/* Event Summary */}
              <div className="mb-4 pb-4 border-b border-gray-200">
                <h4 className="font-medium text-gray-800">{event?.name}</h4>
                <div className="flex items-center text-gray-600 mt-2">
                  <Calendar className="w-4 h-4 mr-2 text-orange-500" />
                  <span>{formatDate(event?.startDateTime)}</span>
                </div>
                <div className="flex items-center text-gray-600 mt-1">
                  <Clock className="w-4 h-4 mr-2 text-orange-500" />
                  <span>{formatTime(event?.startDateTime)}</span>
                </div>
                {event?.venue && (
                  <div className="flex items-center text-gray-600 mt-1">
                    <MapPin className="w-4 h-4 mr-2 text-orange-500" />
                    <span>{event.venue}</span>
                  </div>
                )}
              </div>
              
              {/* Ticket Summary */}
              <div className="mb-4">
                <h4 className="font-medium text-gray-800 mb-2">Your Tickets</h4>
                
                <div className="space-y-2">
                  {selectedTickets
                    .filter(ticket => ticket.quantity > 0)
                    .map((ticket, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <div className="flex items-center">
                          <Ticket className="w-4 h-4 mr-1 text-orange-500" />
                          {ticket.name} x {ticket.quantity}
                        </div>
                        <div>{formatCurrency(ticket.price * ticket.quantity)}</div>
                      </div>
                    ))
                  }
                </div>
              </div>
              
              {/* Display Applied Coupon */}
              {appliedCoupon && (
                <div className="mb-4 pb-4 border-b border-gray-200">
                  <div className="flex items-center">
                    <Tag className="w-4 h-4 mr-1 text-orange-500" />
                    <h4 className="font-medium text-gray-800">Applied Coupon</h4>
                  </div>
                  <div className="mt-2 bg-orange-50 border border-orange-200 rounded-md p-2">
                    <div className="flex justify-between items-center">
                      <div className="text-sm font-medium">{appliedCoupon.name}</div>
                      <div className="text-sm text-orange-600">
                        {appliedCoupon.discountType === 'percentage' ? 
                          `${appliedCoupon.discountValue}% off` : 
                          formatCurrency(appliedCoupon.discountValue)
                        }
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Payment Details with Service Fee */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <div className="text-gray-600">Subtotal</div>
                  <div>{formatCurrency(originalAmount)}</div>
                </div>
                
                <div className="flex justify-between text-sm">
                  <div className="text-gray-600">Service Fee (20%)</div>
                  <div>{formatCurrency(serviceFee)}</div>
                </div>
                
                {discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <div>Discount</div>
                    <div>-{formatCurrency(discount)}</div>
                  </div>
                )}
                
                <div className="flex justify-between border-t border-gray-200 pt-2 font-bold">
                  <div>Total</div>
                  <div>{formatCurrency(totalAmount)}</div>
                </div>
              </div>
              
              {/* Booking ID (if available) */}
              {bookingId && (
                <div className="mt-4 p-3 bg-gray-50 rounded-md">
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-600">Booking ID:</div>
                    <div className="flex items-center">
                      <span className="text-sm font-mono">{bookingId.substring(0, 8)}...</span>
                      <button 
                        onClick={copyBookingId} 
                        className="ml-1 text-orange-600 hover:text-orange-700"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketPurchasePage;
