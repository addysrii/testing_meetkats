// CashfreePayment.jsx
import React, { useEffect, useRef, useState } from 'react';
import { CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import ticketService from '../../services/ticketService';

const CashfreePayment = ({ 
  paymentData,
  bookingId,
  onSuccess,
  onCancel
}) => {
  const paymentContainerRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  
  useEffect(() => {
    // Skip if no payment data
    if (!paymentData || !paymentData.orderToken) {
      setError('Missing payment information. Please try again.');
      setLoading(false);
      return;
    }
    
    console.log('Initializing Cashfree payment with:', {
      orderId: paymentData.orderId,
      orderToken: paymentData.orderToken,
      cfOrderId: paymentData.cfOrderId
    });

    // Make sure Cashfree SDK is loaded
    if (!window.Cashfree) {
      const isProduction = process.env.NODE_ENV === 'production';
      const sdkUrl = isProduction
        ? 'https://sdk.cashfree.com/js/ui/2.0.0/cashfree.prod.js'
        : 'https://sdk.cashfree.com/js/ui/2.0.0/cashfree.sandbox.js';
      
      const script = document.createElement('script');
      script.src = sdkUrl;
      script.async = true;
      
      script.onload = initializeDropin;
      script.onerror = () => setError('Failed to load payment gateway. Please try again.');
      
      document.head.appendChild(script);
      
      return () => {
        // Clean up script on unmount
        document.head.removeChild(script);
      };
    } else {
      // SDK already loaded
      initializeDropin();
    }
  }, [paymentData]);
  
  const initializeDropin = () => {
    try {
      // Clear any previous content
      if (paymentContainerRef.current) {
        paymentContainerRef.current.innerHTML = '';
      }
      
      // Create new Cashfree instance
      const cashfree = new window.Cashfree();
      
      // Configure payment options
      const paymentOptions = {
        orderToken: paymentData.orderToken,
        onSuccess: handlePaymentSuccess,
        onFailure: handlePaymentFailure,
        onClose: handlePaymentClose,
        components: ["upi", "card", "nb", "app"], // Enable all payment methods
        style: {
          backgroundColor: "#ffffff",
          color: "#11385b",
          fontFamily: "Lato",
          fontSize: "14px",
          errorColor: "#ff0000",
          theme: "light" // or "dark"
        }
      };
      
      // Initialize payment form
      cashfree.initialiseDropin(paymentContainerRef.current, paymentOptions);
      setLoading(false);
    } catch (err) {
      console.error('Error initializing Cashfree SDK:', err);
      setError('Failed to initialize payment form. Please try again.');
      setLoading(false);
    }
  };
  
  const handlePaymentSuccess = (data) => {
    console.log('Payment success:', data);
    setStatusMessage('Payment successful! Redirecting...');
    
    // Verify payment on our server
    verifyPayment();
  };
  
  const handlePaymentFailure = (data) => {
    console.log('Payment failure:', data);
    setError(`Payment failed: ${data.order?.errorText || 'Unknown error'}`);
  };
  
  const handlePaymentClose = (data) => {
    console.log('Payment closed:', data);
  };
  
  const verifyPayment = async () => {
    try {
      setVerifying(true);
      
      // Get order ID from paymentData or localStorage
      const orderId = paymentData?.orderId || localStorage.getItem('pendingOrderId');
      const currentBookingId = bookingId || localStorage.getItem('pendingBookingId');
      
      if (!orderId) {
        throw new Error('Missing order ID for payment verification');
      }
      
      const result = await ticketService.verifyUpiPayment({
        orderId: orderId,
        bookingId: currentBookingId
      });
      
      if (result.success && result.status === 'PAYMENT_SUCCESS') {
        setStatusMessage('Payment successful! Redirecting...');
        setTimeout(() => onSuccess(result), 2000);
      } else {
        setStatusMessage('Payment verification in progress. Please wait...');
        // Retry after a delay
        setTimeout(verifyPayment, 3000);
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      setStatusMessage(error.message || 'Verification failed. Please try again.');
      setVerifying(false);
    }
  };
  
  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-orange-500 rounded-full animate-spin mb-4"></div>
        <p className="text-gray-600">Loading payment options...</p>
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 max-w-md mx-auto">
        <div className="flex items-start text-red-600 mb-4">
          <AlertCircle className="w-6 h-6 mr-2 flex-shrink-0" />
          <p>{error}</p>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="w-full mt-4 bg-orange-600 text-white py-2 px-4 rounded-md hover:bg-orange-700"
        >
          Try Another Payment Method
        </button>
      </div>
    );
  }
  
  // Success verification state
  if (verifying) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 max-w-md mx-auto">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 border-4 border-gray-200 border-t-green-500 rounded-full animate-spin"></div>
          </div>
          <h2 className="text-xl font-semibold mb-2">Verifying Payment</h2>
          <p className="text-gray-600 mb-4">{statusMessage}</p>
        </div>
      </div>
    );
  }
  
  // Default state: payment form
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 max-w-md mx-auto">
      <h2 className="text-xl font-bold text-center mb-4">Complete Your Payment</h2>
      
      {/* Payment container - Cashfree SDK will render here */}
      <div 
        ref={paymentContainerRef}
        className="border border-gray-200 rounded-md min-h-[300px] w-full mb-4"
      ></div>
      
      <button
        type="button"
        onClick={onCancel}
        className="w-full text-gray-500 py-2 px-4 text-sm hover:text-orange-600 border border-gray-200 rounded-md"
      >
        Cancel and Try Another Payment Method
      </button>
    </div>
  );
};

export default CashfreePayment;