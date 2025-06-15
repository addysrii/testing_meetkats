import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const CashfreePayment = ({
  amount,
  bookingId,
  eventName,
  onSuccess,
  onFailure,
  onCancel
}) => {
  const [cashfree, setCashfree] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [mode, setMode] = useState('sandbox');

  useEffect(() => {
    const waitForCashfree = () =>
      new Promise((resolve, reject) => {
        const maxWait = 10000;
        const intervalTime = 100;
        let waited = 0;

        const interval = setInterval(() => {
          if (window.Cashfree) {
            clearInterval(interval);
            resolve(window.Cashfree);
          } else {
            waited += intervalTime;
            if (waited >= maxWait) {
              clearInterval(interval);
              reject(new Error('Cashfree SDK script did not load in time'));
            }
          }
        }, intervalTime);
      });

    const initializeSDK = async () => {
      try {
        const Cashfree = await waitForCashfree();
        const currentMode =
     'production'
        
        setMode(currentMode);

        const instance = new Cashfree({
          mode: currentMode === 'production' ? 'PROD' : 'TEST'
        });
        setCashfree(instance);
        console.log('Cashfree SDK initialized');
      } catch (error) {
        console.error('Failed to initialize Cashfree SDK:', error);
      }
    };

    initializeSDK();
  }, []);

  const handlePayment = async () => {
    if (!cashfree) {
      alert('Payment system is still loading. Please wait...');
      return;
    }

    try {
      setProcessing(true);

      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : {};

      const response = await api.post('/api/payments/cashfree/initiate', {
        amount,
        bookingId,
        eventName: eventName || 'Event Booking',
        customerName: user.firstName
          ? `${user.firstName} ${user.lastName || ''}`.trim()
          : 'Customer',
        customerEmail: user.email || 'customer@example.com',
        customerPhone: user.phone || '9999999999'
      });

      if (!response.data.orderToken) {
        throw new Error('No payment session received');
      }

      console.log('Payment initiated:', response.data);
      setOrderId(response.data.orderId);

      localStorage.setItem('pendingOrderId', response.data.orderId);
      localStorage.setItem('pendingBookingId', bookingId);

      const checkoutOptions = {
        paymentSessionId: response.data.orderToken,
        redirectTarget: '_modal',
        mode: mode // REQUIRED by PG SDK v3
      };

      const result = await cashfree.checkout(checkoutOptions);
      console.log('Checkout result:', result);

      if (result.error) {
        console.error('Payment error:', result.error);
        onFailure(result.error);
      } else {
        // Add a small delay before verifying payment
        setTimeout(async () => {
          try {
            const verifyResponse = await api.post(
              '/api/payments/cashfree/verify',
              { orderId: response.data.orderId }
            );

            if (verifyResponse.data.status === 'PAYMENT_SUCCESS') {
              localStorage.removeItem('pendingOrderId');
              localStorage.removeItem('pendingBookingId');
              onSuccess(verifyResponse.data);
            } else {
              onFailure(new Error('Payment not completed'));
            }
          } catch (error) {
            console.error('Verification error:', error);
            onFailure(error);
          }
        }, 2000);
      }
    } catch (error) {
      console.error('Payment error:', error);
      onFailure(error);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="w-full">
      <button
        onClick={handlePayment}
        disabled={processing || !cashfree}
        className={`w-full py-3 px-4 rounded-md font-medium transition-colors ${
          processing || !cashfree
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-orange-600 text-white hover:bg-orange-700'
        }`}
      >
        {processing ? (
          <span className="flex items-center justify-center">
            <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></span>
            Processing...
          </span>
        ) : (
          `Pay ₹${amount} with Cashfree`
        )}
      </button>
    </div>
  );
};

export default CashfreePayment;
