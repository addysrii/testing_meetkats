// pages/PaymentFailurePage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, RefreshCw } from 'lucide-react';
import ticketService from '../services/ticketService';
import { useToast } from '../components/common/Toast';

const PaymentFailurePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();
  
  // Get query parameters
  const queryParams = new URLSearchParams(location.search);
  const error = queryParams.get('error') || 'Your payment was not completed';
  const bookingId = queryParams.get('bookingId') || localStorage.getItem('pendingBookingId');
  const transactionId = queryParams.get('transactionId') || queryParams.get('transaction_id');
  
  const [verifying, setVerifying] = useState(false);
  
  // Attempt to verify the payment one more time (in case it was processed but the redirect failed)
  const retryPaymentVerification = async () => {
    setVerifying(true);
    
    try {
      // Skip verification if there's no booking ID or transaction ID
      if (!bookingId && !transactionId) {
        toast.error({ description: 'Cannot verify payment without booking or transaction information' });
        setVerifying(false);
        return;
      }
      
      let result;
      
      // If we have a transaction ID, check using PhonePe method
      if (transactionId) {
        result = await ticketService.checkPaymentStatus(transactionId);
      } 
      // If we have a booking ID and payment method was Cashfree form
      else if (bookingId && localStorage.getItem('pendingPaymentMethod') === 'cashfree_form') {
        result = await ticketService.checkCashfreeFormPaymentStatus(bookingId);
      }
      // Otherwise, try to get the booking and check its status
      else if (bookingId) {
        const bookingResponse = await ticketService.getBooking(bookingId);
        
        if (bookingResponse.status === 'confirmed') {
          // If the booking is already confirmed, redirect to success page
          navigate(`/payment-success?bookingId=${bookingId}`);
          return;
        }
      }
      
      // If payment was actually successful, redirect to success page
      if (result && (result.status === 'PAYMENT_SUCCESS' || result.paymentStatus === 'completed')) {
        toast.success({ description: 'Payment verified successfully!' });
        navigate(`/payment-success?bookingId=${bookingId || result.bookingId}`);
        return;
      }
      
      // If payment still failed, show error
      toast.error({ description: 'Payment verification failed. The payment was not completed.' });
      setVerifying(false);
    } catch (err) {
      console.error('Error verifying payment:', err);
      toast.error({ description: 'Failed to verify payment status' });
      setVerifying(false);
    }
  };
  
  // Handle trying again
  const handleTryAgain = () => {
    // If we have a booking ID, redirect back to checkout
    if (bookingId) {
      navigate(`/events/${localStorage.getItem('pendingEventId') || ''}/tickets?bookingId=${bookingId}`);
    } else {
      // Otherwise go to events list
      navigate('/events');
    }
  };
  
  // Clear localStorage on component mount - no need to keep pending booking data
  useEffect(() => {
    // Don't clear right away, only if verification fails
    if (!verifying) {
      // We'll keep pendingBookingId for possible retry
      // localStorage.removeItem('pendingBookingId');
      localStorage.removeItem('pendingPaymentMethod');
    }
  }, [verifying]);
  
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-500 to-rose-600 p-8 text-center text-white">
          <AlertTriangle className="w-16 h-16 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Payment Failed</h1>
          <p className="text-white/85">
            We couldn't complete your payment for this booking.
          </p>
        </div>
        
        {/* Details */}
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <p className="text-red-700 font-medium">{error}</p>
            {bookingId && (
              <p className="text-sm text-red-600 mt-1">Booking #{bookingId}</p>
            )}
          </div>
          
          <h2 className="text-lg font-semibold text-gray-900 mb-3">What would you like to do?</h2>
          
          <div className="space-y-4">
            <div className="border border-gray-200 rounded-md p-4">
              <h3 className="font-medium text-gray-800 mb-2">Verify payment status</h3>
              <p className="text-sm text-gray-600 mb-3">
                If you completed the payment but were redirected here, try verifying the payment status again. 
                Sometimes there can be delays in processing.
              </p>
              <button
                onClick={retryPaymentVerification}
                disabled={verifying}
                className="w-full flex justify-center items-center bg-orange-600 text-white rounded-md py-2 hover:bg-orange-700 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {verifying ? (
                  <>
                    <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin mr-2"></div>
                    Verifying...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Verify Payment Status
                  </>
                )}
              </button>
            </div>
            
            <div className="border border-gray-200 rounded-md p-4">
              <h3 className="font-medium text-gray-800 mb-2">Try another payment method</h3>
              <p className="text-sm text-gray-600 mb-3">
                Return to checkout and try completing your booking again with a different payment method.
              </p>
              <button
                onClick={handleTryAgain}
                className="w-full bg-gray-100 text-gray-800 rounded-md py-2 hover:bg-gray-200"
              >
                Try Again
              </button>
            </div>
            
            <div className="border border-gray-200 rounded-md p-4">
              <h3 className="font-medium text-gray-800 mb-2">Contact support</h3>
              <p className="text-sm text-gray-600 mb-3">
                If you're still having issues, please contact our support team for assistance.
              </p>
              <a
                href="mailto:support@example.com"
                className="block w-full text-center bg-gray-100 text-gray-800 rounded-md py-2 hover:bg-gray-200"
              >
                Contact Support
              </a>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="bg-gray-50 p-6 flex justify-between">
          <Link
            to="/"
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Home
          </Link>
          
          <Link
            to="/events"
            className="text-orange-600 hover:text-orange-700 font-medium"
          >
            Browse Events
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailurePage;