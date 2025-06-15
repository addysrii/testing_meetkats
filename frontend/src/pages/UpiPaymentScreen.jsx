import { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  CheckCircle, 
  Copy, 
  Info, 
  RefreshCw, 
  Smartphone
} from 'lucide-react';
import { QRCode } from 'react-qrcode-logo';
import ticketService from '../services/ticketService';

/**
 * Enhanced UPI Payment screen with better error handling and offline detection
 */
const UpiPaymentScreen = ({ 
  paymentData,
  bookingId,
  onSuccess,
  onCancel
}) => {
  const [copied, setCopied] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [countdown, setCountdown] = useState(300); // 5 minutes
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [retryCount, setRetryCount] = useState(0);
  
  // Detect network status
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  // Start countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  // Start payment status polling
  useEffect(() => {
    if (isOffline) return; // Don't poll if offline
    
    let pollingInterval;
    
    const startPolling = () => {
      pollingInterval = setInterval(async () => {
        try {
          await checkPaymentStatus();
        } catch (error) {
          console.error('Payment status check error:', error);
          // Increase retry count if there are errors
          setRetryCount(prev => prev + 1);
          
          // If too many retries, stop polling to conserve resources
          if (retryCount > 5) {
            console.log('Too many failed retries, stopping automatic polling');
            clearInterval(pollingInterval);
            setStatusMessage('Payment verification is having trouble. Please click "I\'ve Completed the Payment" when done.');
          }
        }
      }, 5000); // Check every 5 seconds
    };
    
    startPolling();
    
    // Log payment data for debugging
    console.log('UPI Payment Data received:', {
      paymentLink: paymentData?.paymentLink,
      upiDataLink: paymentData?.upiData?.paymentLink,
      orderId: paymentData?.orderId,
      cfOrderId: paymentData?.cfOrderId
    });
    
    // Clean up on unmount
    return () => {
      if (pollingInterval) clearInterval(pollingInterval);
    };
  }, [isOffline, paymentData?.orderId, bookingId]);
  
  // Format countdown time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  // Check payment status
  const checkPaymentStatus = async () => {
    if (!paymentData?.orderId) return;
    
    try {
      console.log(`Checking payment status for order: ${paymentData.orderId}`);
      const result = await ticketService.checkUpiPaymentStatus(paymentData.orderId);
      
      if (result.success && result.status === 'PAYMENT_SUCCESS') {
        setStatusMessage('Payment successful! Redirecting...');
        
        // Delay to show success message
        setTimeout(() => onSuccess(result), 2000);
      }
    } catch (error) {
      console.error('Payment status check error:', error);
      throw error; // Re-throw to be handled by the caller
    }
  };
  
  // Manually verify payment
  const verifyPayment = async () => {
    if (isOffline) {
      setStatusMessage('You are currently offline. Please check your internet connection and try again.');
      return;
    }
    
    try {
      setVerifying(true);
      setStatusMessage('Verifying payment...');
      
      // Get order ID from paymentData or localStorage
      const orderId = paymentData?.orderId || localStorage.getItem('pendingOrderId');
      const currentBookingId = bookingId || localStorage.getItem('pendingBookingId');
      
      if (!orderId) {
        throw new Error('Missing order ID for payment verification');
      }
      
      // Set payment attempted flag to show different UI
      setPaymentAttempted(true);
      
      const result = await ticketService.verifyUpiPayment({
        orderId: orderId,
        bookingId: currentBookingId
      });
      
      if (result.success && result.status === 'PAYMENT_SUCCESS') {
        setStatusMessage('Payment successful! Redirecting...');
        setTimeout(() => onSuccess(result), 2000);
      } else {
        setStatusMessage('Payment not confirmed yet. If you have completed the payment, please wait a moment and try again.');
        setVerifying(false);
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      setStatusMessage(error.message || 'Verification failed. Please try again.');
      setVerifying(false);
    }
  };
  
  // Copy UPI ID to clipboard
  const copyUpiLink = () => {
    if (paymentData.upiData?.upiUrl) {
      navigator.clipboard.writeText(paymentData.upiData.upiUrl)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 3000);
        })
        .catch(err => {
          console.error('Failed to copy:', err);
          setStatusMessage('Failed to copy to clipboard');
        });
    }
  };
  
  // Open UPI app directly
  const openUpiApp = () => {
    if (paymentData.upiData?.upiUrl) {
      window.location.href = paymentData.upiData.upiUrl;
    } else {
      // Use Cashfree payment link as fallback
      window.open(paymentData.paymentLink, '_blank');
    }
  };
  
  // Open Cashfree payment link
  const openPaymentLink = () => {
    window.open(paymentData.paymentLink, '_blank');
  };
  
  // Handle session expired
  if (countdown <= 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 max-w-md mx-auto">
        <div className="text-center py-6">
          <div className="text-red-600 mb-4 font-bold">Payment session expired</div>
          <p className="text-gray-600 mb-4">
            The payment session has expired. Please restart the booking process.
          </p>
          <button
            type="button"
            onClick={onCancel}
            className="bg-orange-600 text-white py-2 px-6 rounded-md hover:bg-orange-700"
          >
            Start Over
          </button>
        </div>
      </div>
    );
  }
  
  // Handle network offline
  if (isOffline) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 max-w-md mx-auto">
        <div className="text-center py-6">
          <div className="text-orange-600 mb-4 font-bold">You're offline</div>
          <p className="text-gray-600 mb-4">
            Please check your internet connection to continue with the payment.
          </p>
          <button
            type="button"
            onClick={onCancel}
            className="bg-orange-600 text-white py-2 px-6 rounded-md hover:bg-orange-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 max-w-md mx-auto">
      <div className="flex items-center mb-4">
        <button 
          onClick={onCancel} 
          className="text-orange-600 hover:text-orange-900 flex items-center"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          <span>Back</span>
        </button>
        <h2 className="text-xl font-bold text-center flex-1 pr-7">Complete UPI Payment</h2>
      </div>
      
      <div className="text-center mb-6">
        <div className="text-sm text-gray-500 mb-1">Payment expires in</div>
        <div className="text-xl font-medium text-orange-600">{formatTime(countdown)}</div>
      </div>
      
      {/* QR Code Section */}
      {paymentData.upiData?.upiUrl && (
        <div className="flex flex-col items-center mb-6">
          <div className="bg-orange-50 p-3 rounded-lg mb-4">
            <QRCode 
              value={paymentData.upiData.upiUrl} 
              size={200} 
              level="H" 
              includeMargin={true}
              logoImage="/images/logo-icon.png"
              logoWidth={40}
              logoHeight={40}
            />
          </div>
          <p className="text-sm text-gray-600 text-center">
            Scan this QR code with any UPI app to pay
          </p>
        </div>
      )}
      
      {/* Action Buttons */}
      <div className="space-y-4 mb-6">
        <button
          type="button"
          onClick={openUpiApp}
          className="w-full flex items-center justify-center bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700"
        >
          <Smartphone className="w-5 h-5 mr-2" />
          Pay via UPI App
        </button>
        
        <button
          type="button"
          onClick={openPaymentLink}
          className="w-full flex items-center justify-center bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700"
        >
          Pay on Cashfree
        </button>
        
        {paymentData.upiData?.upiUrl && (
          <div className="relative flex items-center mt-3">
            <input
              type="text"
              value={paymentData.upiData.upiUrl}
              readOnly
              className="w-full bg-gray-100 border border-gray-300 rounded-md py-2 px-3 pr-10 text-sm"
            />
            <button
              type="button"
              onClick={copyUpiLink}
              className="absolute right-2 text-gray-500 hover:text-gray-700"
              title="Copy UPI link"
            >
              {copied ? 
                <CheckCircle className="w-5 h-5 text-green-500" /> : 
                <Copy className="w-5 h-5" />
              }
            </button>
          </div>
        )}
      </div>
      
      {/* Payment amount reminder */}
      <div className="bg-orange-50 p-4 rounded-lg mb-6 text-center">
        <p className="text-orange-800 font-medium">Amount: ₹{paymentData.amount}</p>
        <p className="text-sm text-orange-600">Booking ID: {bookingId}</p>
      </div>
      
      {/* Payment Verification */}
      <div className="border-t border-gray-200 pt-4">
        {statusMessage && (
          <div className={`text-sm text-center mb-4 ${
            statusMessage.includes('successful') ? 'text-green-600' : 'text-orange-600'
          }`}>
            {statusMessage}
          </div>
        )}
        
        <button
          type="button"
          onClick={verifyPayment}
          disabled={verifying}
          className={`w-full flex items-center justify-center py-3 px-4 rounded-md ${
            verifying 
              ? 'bg-gray-300 cursor-not-allowed' 
              : 'bg-orange-600 hover:bg-orange-700 text-white'
          }`}
        >
          {verifying ? (
            <>
              <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin mr-2"></div>
              Verifying Payment...
            </>
          ) : (
            <>
              <RefreshCw className="w-5 h-5 mr-2" />
              I've Completed the Payment
            </>
          )}
        </button>
        
        <button
          type="button"
          onClick={onCancel}
          className="w-full text-gray-600 py-2 px-4 mt-3 text-sm hover:text-orange-600"
        >
          Cancel and Try Another Payment Method
        </button>
      </div>
      
      {/* Help Info */}
      <div className="mt-4 flex items-start text-xs text-gray-500">
        <Info className="w-4 h-4 text-orange-400 mr-2 flex-shrink-0 mt-0.5" />
        <p>
          If you've already made the payment but it's not being detected, 
          click "I've Completed the Payment" to manually verify.
        </p>
      </div>
    </div>
  );
};

export default UpiPaymentScreen;