import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Lock, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import api from "../services/api"; // Adjust the import based on your project structure
const ResetPasswordPage = () => {
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState(''); // 'success', 'error', ''
  const [message, setMessage] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);

  // Extract token from URL on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tokenParam = urlParams.get('token');
    if (tokenParam) {
      setToken(tokenParam);
    }
  }, []);

  // Password strength calculator
  const calculatePasswordStrength = (pwd) => {
    let strength = 0;
    if (pwd.length >= 8) strength += 25;
    if (/[a-z]/.test(pwd)) strength += 25;
    if (/[A-Z]/.test(pwd)) strength += 25;
    if (/[0-9]/.test(pwd) && /[^a-zA-Z0-9]/.test(pwd)) strength += 25;
    return strength;
  };

  useEffect(() => {
    setPasswordStrength(calculatePasswordStrength(password));
  }, [password]);

  const getStrengthColor = () => {
    if (passwordStrength <= 25) return 'bg-red-400';
    if (passwordStrength <= 50) return 'bg-yellow-400';
    if (passwordStrength <= 75) return 'bg-blue-400';
    return 'bg-green-500';
  };

  const getStrengthText = () => {
    if (passwordStrength <= 25) return 'Weak';
    if (passwordStrength <= 50) return 'Fair';
    if (passwordStrength <= 75) return 'Good';
    return 'Strong';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!token) {
      setStatus('error');
      setMessage('Invalid or missing reset token. Please check your email link.');
      return;
    }

    if (password !== confirmPassword) {
      setStatus('error');
      setMessage('Passwords do not match. Please try again.');
      return;
    }

    if (password.length < 8) {
      setStatus('error');
      setMessage('Password must be at least 8 characters long.');
      return;
    }

    setIsLoading(true);
    setStatus('');
    setMessage('');

    try {
      // Simulated API call - replace with actual implementation
    //   const response = await new Promise((resolve, reject) => {
    //     setTimeout(() => {
    //       if (Math.random() > 0.3) {
    //         resolve({ data: { success: true, message: 'Password reset successfully!' } });
    //       } else {
    //         reject(new Error('Failed to reset password. Please try again.'));
    //       }
    //     }, 2000);
    //   });

      // Actual API call would be:
      const response = await api.post('/auth/reset-password', {
        token: token,
        password: password
      });
      if(response.data.success) {
      setStatus('success');
      setMessage('Password reset successfully! You can now login with your new password.');
      }
      // Redirect to login after success (optional)
      window.location.href = '/login';
      
    } catch (error) {
      setStatus('error');
      setMessage(error.message || 'Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    // Navigate back to login page
    console.log('Navigate to login page');
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <button
          onClick={handleBackToLogin}
          className="cursor-pointer flex items-center gap-2 text-green-600 hover:text-green-700 mb-6 transition-colors duration-200 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" />
          Back to Login
        </button>

        {/* Main Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-green-100 p-8 transform hover:scale-[1.02] transition-all duration-300">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Reset Password</h1>
            <p className="text-gray-600">Enter your new password below</p>
          </div>

          {/* Status Messages */}
          {status && (
            <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 animate-in slide-in-from-top-2 duration-300 ${
              status === 'success' 
                ? 'bg-green-50 border border-green-200 text-green-800' 
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}>
              {status === 'success' ? (
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
              )}
              <span className="text-sm">{message}</span>
            </div>
          )}

          {/* Form */}
          <div className="space-y-6">
            {/* New Password */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                  placeholder="Enter your new password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="cursor-pointer absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors duration-200"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              
              {/* Password Strength Indicator */}
              {password && (
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600">Password Strength</span>
                    <span className={`text-xs font-medium ${
                      passwordStrength <= 25 ? 'text-red-600' :
                      passwordStrength <= 50 ? 'text-yellow-600' :
                      passwordStrength <= 75 ? 'text-blue-600' : 'text-green-600'
                    }`}>
                      {getStrengthText()}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${getStrengthColor()}`}
                      style={{ width: `${passwordStrength}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                  placeholder="Confirm your new password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors duration-200"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              
              {/* Password Match Indicator */}
              {confirmPassword && (
                <div className="flex items-center gap-2">
                  {password === confirmPassword ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-500" />
                  )}
                  <span className={`text-xs ${
                    password === confirmPassword ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {password === confirmPassword ? 'Passwords match' : 'Passwords do not match'}
                  </span>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading || !token || password !== confirmPassword || password.length < 8}
              className="cursor-pointer w-full bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-green-600 hover:to-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Resetting Password...
                </div>
              ) : (
                'Reset Password'
              )}
            </button>
          </div>

          {/* Security Note */}
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800">
              <strong>Security Tip:</strong> Choose a strong password with at least 8 characters, including uppercase, lowercase, numbers, and special characters.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-gray-600">
          Remember your password? 
          <button 
            onClick={handleBackToLogin}
            className="text-green-600 hover:text-green-700 font-medium ml-1 transition-colors duration-200"
          >
            Sign in instead
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;