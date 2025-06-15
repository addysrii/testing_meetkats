// pages/PaymentResponsePage.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ticketService from '../services/ticketService';
import { useToast } from '../components/common/Toast';

/**
 * PaymentResponsePage is a router component that handles redirects from payment gateways
 * It processes all types of payment responses and redirects to the appropriate page
 */
const PaymentResponsePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();
  
  const [processingPayment, setProcessingPayment] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    // Extract query parameters
    const queryParams = new URLSearchParams(location.search);
    
    // Get booking ID from either query params or localStorage
    const bookingId = queryParams.get('booking_id') || 
                      queryParams.get('order_id') || 
                      localStorage.getItem('pendingBookingId');
    
    // Get transaction ID from query params
    const transactionId = queryParams.get('transaction_id') || 
                          queryParams.get('txnId') || 
                          queryParams.get('cf_payment_id');
    
    // Payment status from Cashfree or other gateways
    const paymentStatus = queryParams.get('status') || 
                          queryParams.get('payment_status') || 
                          queryParams.get('txStatus');
    
    // Get payment method from localStorage
    const paymentMethod = localStorage.getItem('pendingPaymentMethod') || 'cashfree_form';
    
    // Debug log information
    console.log('Processing payment response:', {
      paymentMethod,
      bookingId,
      transactionId,
      paymentStatus,
      queryParams: Object.fromEntries(queryParams.entries())
    });
    
    // Function to validate payment with backend
    const validatePayment = async () => {
      try {
        // If we have an obvious failure status, redirect to failure page immediately
        if (paymentStatus === 'FAILED' || 
            paymentStatus === 'FAILURE' || 
            paymentStatus === 'CANCELLED') {
          
          // Get error message
          const errorMessage = queryParams.get('error_message') || 
                               queryParams.get('error') || 
                               'Payment was not successful';
          
          // Redirect to failure page
          navigate(`/payment-failure?error=${encodeURIComponent(errorMessage)}&bookingId=${bookingId || ''}`);
          return;
        }
        
        // Otherwise verify with backend
        if (bookingId) {
          // If bookingId provided, verify through appropriate method
          const method = paymentMethod === 'cashfree_form' 
            ? 'checkCashfreeFormPaymentStatus' 
            : 'checkPaymentStatus';
          
          // Call appropriate verification method
          const result = await ticketService[method](bookingId);
          
          // If payment verified as successful, redirect to success page
          if (result.success || result.status === 'PAYMENT_SUCCESS' || result.paymentStatus === 'completed') {
            toast.success({ description: 'Payment completed successfully!' });
            
            // Clear localStorage since transaction is complete
            localStorage.removeItem('pendingBookingId');
            localStorage.removeItem('pendingPaymentMethod');
            
            // Redirect to success page
            navigate(`/payment-success${bookingId ? `?bookingId=${bookingId}` : ''}`);
          } else {
            // Otherwise redirect to failure page
            const errorMessage = result.message || 'Payment verification failed';
            navigate(`/payment-failure?error=${encodeURIComponent(errorMessage)}&bookingId=${bookingId || ''}`);
          }
        } else if (transactionId) {
          // If only transaction ID is provided, verify through phonepe method
          const result = await ticketService.checkPaymentStatus(transactionId);
          
          if (result.success || result.status === 'PAYMENT_SUCCESS') {
            toast.success({ description: 'Payment completed successfully!' });
            
            // Clear localStorage
            localStorage.removeItem('pendingBookingId');
            localStorage.removeItem('pendingPaymentMethod');
            
            // Redirect to success page
            navigate(`/payment-success${result.bookingId ? `?bookingId=${result.bookingId}` : ''}`);
          } else {
            // Otherwise redirect to failure page
            const errorMessage = result.message || 'Payment verification failed';
            navigate(`/payment-failure?error=${encodeURIComponent(errorMessage)}&transactionId=${transactionId}`);
          }
        } else {
          // No booking ID or transaction ID provided, redirect to failure
          setError('Missing booking information. Cannot verify payment.');
          
          // After a delay, redirect to failure page
          setTimeout(() => {
            navigate('/payment-failure?error=Missing+booking+information');
          }, 3000);
        }
      } catch (err) {
        console.error('Error verifying payment:', err);
        setError(err.message || 'Payment verification failed');
        
        // After a delay, redirect to failure page
        setTimeout(() => {
          navigate(`/payment-failure?error=${encodeURIComponent(err.message || 'Payment verification failed')}`);
        }, 3000);
      } finally {
        setProcessingPayment(false);
      }
    };
    
    // Initiate payment verification
    validatePayment();
  }, [location.search, navigate, toast]);
  
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        {processingPayment ? (
          <>
            <div className="w-16 h-16 border-t-4 border-orange-500 border-solid rounded-full animate-spin mx-auto mb-4"></div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Processing Payment</h1>
            <p className="text-gray-600">
              Please wait while we verify your payment. This may take a few moments...
            </p>
          </>
        ) : error ? (
          <>
            <h1 className="text-xl font-bold text-red-600 mb-2">Payment Verification Error</h1>
            <p className="text-gray-600 mb-4">{error}</p>
            <p className="text-gray-500">Redirecting to payment failure page...</p>
          </>
        ) : (
          <p className="text-gray-600">Redirecting...</p>
        )}
      </div>
    </div>
  );
};

export default PaymentResponsePage;