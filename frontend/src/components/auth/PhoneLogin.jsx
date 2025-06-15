import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const PhoneLogin = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [step, setStep] = useState(1); // 1: Enter phone, 2: Enter verification code
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);
  
  const { sendPhoneVerification, verifyPhone } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // If phone number was passed from login page
    if (location.state?.phoneNumber) {
      setPhoneNumber(location.state.phoneNumber);
    }
  }, [location.state]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const formatPhoneNumber = (number) => {
    // Basic phone number formatting - you may want to use a library for this
    return number.replace(/[^\d+]/g, '');
  };

  const handleSendCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const formattedPhone = formatPhoneNumber(phoneNumber);
    if (!formattedPhone) {
      setError('Please enter a valid phone number');
      setLoading(false);
      return;
    }

    try {
      await sendPhoneVerification(formattedPhone);
      setStep(2);
      setCountdown(60); // 60 second countdown for resending code
    } catch (error) {
      console.error('Send verification code error:', error);
      setError(
        error.response?.data?.error || 
        'Failed to send verification code. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!verificationCode || verificationCode.length < 4) {
      setError('Please enter a valid verification code');
      setLoading(false);
      return;
    }

    try {
      const formattedPhone = formatPhoneNumber(phoneNumber);
      await verifyPhone(formattedPhone, verificationCode);
      navigate('/profile-setup');
    } catch (error) {
      console.error('Verify code error:', error);
      setError(
        error.response?.data?.error || 
        'Invalid verification code. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="bg-white shadow-md rounded-lg px-8 pt-6 pb-8 mb-4">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          {step === 1 ? 'Enter Your Phone Number' : 'Verify Your Phone'}
        </h2>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        
        {step === 1 ? (
          <form onSubmit={handleSendCode}>
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="phoneNumber">
                Phone Number
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="phoneNumber"
                type="tel"
                placeholder="+1 (555) 123-4567"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Include country code, e.g. +1 for US
              </p>
            </div>
            
            <div className="flex items-center justify-between mb-6">
              <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
                type="submit"
                disabled={loading}
              >
                {loading ? 'Sending Code...' : 'Send Verification Code'}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleVerifyCode}>
            <div className="mb-2">
              <p className="text-gray-600 text-sm">
                We sent a verification code to <strong>{phoneNumber}</strong>
              </p>
            </div>
            
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="verificationCode">
                Verification Code
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-center text-2xl letter-spacing-wide"
                id="verificationCode"
                type="text"
                placeholder="• • • • • •"
                maxLength="6"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/[^0-9]/g, ''))}
                required
              />
            </div>
            
            <div className="flex items-center justify-between mb-6">
              <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
                type="submit"
                disabled={loading}
              >
                {loading ? 'Verifying...' : 'Verify Code'}
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <button
                type="button"
                className={`text-blue-500 hover:text-blue-700 text-sm font-medium ${countdown > 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={handleSendCode}
                disabled={countdown > 0 || loading}
              >
                {countdown > 0 ? `Resend code in ${countdown}s` : 'Resend code'}
              </button>
              
              <button
                type="button"
                className="text-gray-500 hover:text-gray-700 text-sm font-medium"
                onClick={() => setStep(1)}
              >
                Change phone number
              </button>
            </div>
          </form>
        )}
        
        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            Want to use email instead?{' '}
            <Link to="/signup" className="text-blue-500 hover:text-blue-700 font-medium">
              Sign up with email
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PhoneLogin;