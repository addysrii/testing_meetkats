// pages/PaymentSuccessPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { CheckCircle, Calendar, Download, Share, User, AlertCircle } from 'lucide-react';
import ticketService from '../services/ticketService';
import { useToast } from '../components/common/Toast';

const PaymentSuccessPage = () => {
  const { bookingId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();
  
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Get query parameters
  const queryParams = new URLSearchParams(location.search);
  const transactionId = queryParams.get('transaction_id') || queryParams.get('cf_order_id');
  // Support both formats of order/payment IDs
  const effectiveBookingId = bookingId || queryParams.get('bookingId');
  
  // When the page loads, get the booking details from localStorage if not in URL
  useEffect(() => {
    const pendingBookingId = localStorage.getItem('pendingBookingId');
    const pendingPaymentMethod = localStorage.getItem('pendingPaymentMethod');
    
    const fetchBookingData = async () => {
      try {
        setLoading(true);
        
        // If the booking ID is not in the URL or localStorage, show an error
        if (!effectiveBookingId && !pendingBookingId) {
          setError('Booking information not found. Please check your tickets in the "My Tickets" section.');
          setLoading(false);
          return;
        }
        
        // Use the booking ID from the URL, query params, or localStorage
        const bookingIdToFetch = effectiveBookingId || pendingBookingId;
        
        // Verify the payment status if we have a transaction ID
        if ((transactionId || (booking && (booking.paymentInfo?.transactionId || booking.paymentInfo?.orderId))) && 
            (pendingPaymentMethod === 'cashfree_form' || pendingPaymentMethod === 'phonepe')) {
          
          // Use the appropriate verification method based on payment method
          if (pendingPaymentMethod === 'cashfree_form') {
            await ticketService.checkCashfreeFormPaymentStatus(bookingIdToFetch);
          } else if (pendingPaymentMethod === 'phonepe') {
            await ticketService.checkPaymentStatus(transactionId || booking.paymentInfo?.transactionId);
          }
        }
        
        // Get the booking data
        const bookingResponse = await ticketService.getBooking(bookingIdToFetch);
        setBooking(bookingResponse);
        
        // Clear localStorage after successful fetch
        localStorage.removeItem('pendingBookingId');
        localStorage.removeItem('pendingPaymentMethod');
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching booking data:', err);
        setError(err.message || 'Failed to load booking information');
        setLoading(false);
      }
    };
    
    fetchBookingData();
  }, [effectiveBookingId, transactionId]);
  
  const handleDownloadTickets = async () => {
    try {
      if (!booking || !booking.tickets || !booking.tickets[0]) {
        toast.error({ description: 'No tickets available for download' });
        return;
      }
      
      // For simplicity, we're downloading the first ticket
      // In a real app, you might want to allow downloading all tickets
      const ticketId = booking.tickets[0]._id || booking.tickets[0].id;
      
      const pdfBlob = await ticketService.downloadTicketPdf(ticketId);
      
      // Create a URL for the PDF blob
      const pdfUrl = URL.createObjectURL(pdfBlob);
      
      // Create a temporary link to download the PDF
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = `ticket-${booking.bookingNumber || 'download'}.pdf`;
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      URL.revokeObjectURL(pdfUrl);
      
      toast.success({ description: 'Ticket downloaded successfully' });
    } catch (err) {
      console.error('Error downloading ticket:', err);
      toast.error({ description: 'Failed to download ticket. Please try again.' });
    }
  };
  
  const handleAddToCalendar = async () => {
    try {
      if (!booking || !booking.event || !booking.event._id) {
        toast.error({ description: 'Event information not available' });
        return;
      }
      
      await ticketService.addToCalendar(booking.event._id);
      toast.success({ description: 'Event added to your calendar' });
    } catch (err) {
      console.error('Error adding to calendar:', err);
      toast.error({ description: 'Failed to add event to calendar. Please try again.' });
    }
  };
  
  const handleShareEvent = () => {
    if (navigator.share) {
      navigator.share({
        title: booking.event?.name || 'Event Ticket',
        text: `I'm attending ${booking.event?.name || 'an event'}!`,
        url: window.location.origin + `/events/${booking.event?._id}`
      }).catch((error) => console.log('Error sharing', error));
    } else {
      // Fallback for browsers that don't support the Web Share API
      toast.info({ description: 'Copy the URL to share this event' });
    }
  };
  
  // While loading
  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="text-center">
          <div className="w-16 h-16 border-t-4 border-orange-500 border-solid rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying your payment...</p>
        </div>
      </div>
    );
  }
  
  // If there was an error
  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="flex justify-center space-x-4">
            <Link
              to="/tickets"
              className="px-5 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              View My Tickets
            </Link>
            <Link
              to="/events"
              className="px-5 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
            >
              Browse Events
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  // If booking is not confirmed
  if (booking && booking.status !== 'confirmed') {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <AlertCircle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Pending</h1>
          <p className="text-gray-600 mb-6">
            Your booking has been created, but we're still confirming your payment. 
            This may take a few minutes.
          </p>
          <div className="flex justify-center space-x-4">
            <Link
              to="/tickets"
              className="px-5 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              View My Tickets
            </Link>
            <button
              onClick={() => window.location.reload()}
              className="px-5 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
            >
              Check Again
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // Success view
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Success Header */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-8 text-center text-white">
          <CheckCircle className="w-16 h-16 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Payment Successful!</h1>
          <p className="text-white/85">
            Your booking has been confirmed and your tickets are ready.
          </p>
        </div>
        
        {/* Booking Details */}
        <div className="p-6">
          <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6 flex items-start">
            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <p className="font-medium text-green-800">Booking Confirmed</p>
              <p className="text-sm text-green-700">
                Booking #{booking?.bookingNumber || 'Confirmed'} | Transaction #{booking?.paymentInfo?.transactionId || transactionId || 'Processed'}
              </p>
              <p className="text-sm text-green-700 mt-1">
                A confirmation has been sent to your email address.
              </p>
            </div>
          </div>
          
          {/* Event Info */}
          <div className="border-b border-gray-200 pb-4 mb-4">
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              {booking?.event?.name || 'Event'}
            </h2>
            <div className="flex items-center text-sm text-gray-600 mb-2">
              <Calendar className="w-4 h-4 mr-2 text-gray-500" />
              <span>
                {booking?.event?.startDateTime 
                  ? new Date(booking.event.startDateTime).toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })
                  : 'Date and time information not available'}
              </span>
            </div>
            <div className="flex items-start text-sm text-gray-600">
              <User className="w-4 h-4 mr-2 mt-0.5 text-gray-500" />
              <span>
                {booking?.ticketCount || 0} {booking?.ticketCount === 1 ? 'ticket' : 'tickets'} for {booking?.contactInformation?.email || 'you'}
              </span>
            </div>
          </div>
          
          {/* Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button
              onClick={handleDownloadTickets}
              className="flex items-center justify-center bg-orange-600 text-white py-2 px-4 rounded-md hover:bg-orange-700"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Tickets
            </button>
            <button
              onClick={handleAddToCalendar}
              className="flex items-center justify-center bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Add to Calendar
            </button>
            <button
              onClick={handleShareEvent}
              className="flex items-center justify-center bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50"
            >
              <Share className="w-4 h-4 mr-2" />
              Share Event
            </button>
          </div>
        </div>
        
        {/* Footer Navigation */}
        <div className="bg-gray-50 p-6 flex flex-wrap justify-center sm:justify-between gap-4">
          <Link
            to="/tickets"
            className="inline-flex items-center px-5 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
          >
            View My Tickets
          </Link>
          <Link
            to="/events"
            className="inline-flex items-center px-5 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
          >
            Browse More Events
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;