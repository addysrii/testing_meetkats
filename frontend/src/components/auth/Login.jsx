import React, { useState, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [focusedField, setFocusedField] = useState('');
  const { login, socialLogin } = useAuth();
  const navigate = useNavigate();

  // Memoized validation to prevent unnecessary re-renders
  const isEmailInput = useMemo(() => identifier.includes('@'), [identifier]);
  const isFormValid = useMemo(() => {
    return identifier.trim() && (isEmailInput ? password.trim() : true);
  }, [identifier, password, isEmailInput]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!isFormValid) return;
    
    setLoading(true);
    setError('');
  
    try {
      if (isEmailInput) {
        await login(identifier, password);
        navigate('/dashboard');
      } else {
        navigate('/phone-login', { state: { phoneNumber: identifier } });
        return;
      }
    } catch (error) {
      console.error('Login error:', error);
      
      if (error.response?.data?.error) {
        setError(error.response.data.error);
      } 
      else if (error.message) {
        setError(error.message);
      } 
      else {
        setError('Failed to login. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  }, [identifier, password, isEmailInput, isFormValid, login, navigate]);

  const handleGoogleLogin = useCallback(() => {
    socialLogin('google');
  }, [socialLogin]);

  const handleLinkedInLogin = useCallback(() => {
    socialLogin('linkedin');
  }, [socialLogin]);

  const handleInputFocus = useCallback((fieldName) => {
    setFocusedField(fieldName);
  }, []);

  const handleInputBlur = useCallback(() => {
    setFocusedField('');
  }, []);

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white/80 backdrop-blur-sm shadow-2xl rounded-2xl px-8 pt-8 pb-8 mb-4 border border-green-100 transition-all duration-300 hover:shadow-3xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back</h2>
          <p className="text-gray-600 text-sm">Sign in to continue to your account</p>
        </div>
        
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 text-red-700 px-4 py-3 rounded-r-lg relative mb-6 animate-slideDown" role="alert">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="text-sm">{error}</span>
            </div>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email/Phone Input */}
          <div className="space-y-2">
            <label className="block text-gray-700 text-sm font-semibold" htmlFor="identifier">
              Email or Phone Number
            </label>
            <div className="relative">
              <input
                className={`w-full px-4 py-3 border-2 rounded-xl bg-gray-50 text-gray-700 placeholder-gray-400 transition-all duration-200 focus:outline-none focus:bg-white ${
                  focusedField === 'identifier' 
                    ? 'border-green-400 shadow-lg ring-4 ring-green-100' 
                    : 'border-gray-200 hover:border-green-300'
                }`}
                id="identifier"
                type="text"
                placeholder="Enter your email or phone number"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                onFocus={() => handleInputFocus('identifier')}
                onBlur={handleInputBlur}
                required
              />
              <div className="absolute right-3 top-3">
                {isEmailInput ? (
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                ) : identifier.length > 0 ? (
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                ) : null}
              </div>
            </div>
          </div>
          
          {/* Password Input */}
          <div className="space-y-2">
            <label className="block text-gray-700 text-sm font-semibold" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <input
                className={`w-full px-4 py-3 border-2 rounded-xl bg-gray-50 text-gray-700 placeholder-gray-400 transition-all duration-200 focus:outline-none focus:bg-white ${
                  focusedField === 'password' 
                    ? 'border-green-400 shadow-lg ring-4 ring-green-100' 
                    : 'border-gray-200 hover:border-green-300'
                }`}
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => handleInputFocus('password')}
                onBlur={handleInputBlur}
                required={isEmailInput}
              />
              <div className="absolute right-3 top-3">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            </div>
            {!isEmailInput && identifier.length > 0 && (
              <p className="text-xs text-green-600 flex items-center mt-2 animate-fadeIn">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                Phone login - password not required
              </p>
            )}
          </div>
          
          {/* Submit Button */}
          <button
            className={`w-full py-3 px-4 rounded-xl font-semibold text-white transition-all duration-200 transform ${
              loading || !isFormValid
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl'
            }`}
            type="submit"
            disabled={loading || !isFormValid}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing in...
              </div>
            ) : (
              'Sign In'
            )}
          </button>
          
          {/* Divider */}
          <div className="flex items-center my-6">
            <hr className="flex-grow border-t border-gray-200" />
            <span className="px-4 text-gray-500 text-sm font-medium bg-white">or continue with</span>
            <hr className="flex-grow border-t border-gray-200" />
          </div>
          
          {/* Social Login Buttons */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center bg-white border-2 border-gray-200 rounded-xl shadow-sm px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-gray-100 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <svg className="h-5 w-5 mr-3" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" width="800px" height="800px" viewBox="-0.5 0 48 48" version="1.1"> 
                <title>Google-color</title> 
                <defs> </defs> 
                <g id="Icons" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd"> 
                  <g id="Color-" transform="translate(-401.000000, -860.000000)"> 
                    <g id="Google" transform="translate(401.000000, 860.000000)"> 
                      <path d="M9.82727273,24 C9.82727273,22.4757333 10.0804318,21.0144 10.5322727,19.6437333 L2.62345455,13.6042667 C1.08206818,16.7338667 0.213636364,20.2602667 0.213636364,24 C0.213636364,27.7365333 1.081,31.2608 2.62025,34.3882667 L10.5247955,28.3370667 C10.0772273,26.9728 9.82727273,25.5168 9.82727273,24" id="Fill-1" fill="#FBBC05"> </path> 
                      <path d="M23.7136364,10.1333333 C27.025,10.1333333 30.0159091,11.3066667 32.3659091,13.2266667 L39.2022727,6.4 C35.0363636,2.77333333 29.6954545,0.533333333 23.7136364,0.533333333 C14.4268636,0.533333333 6.44540909,5.84426667 2.62345455,13.6042667 L10.5322727,19.6437333 C12.3545909,14.112 17.5491591,10.1333333 23.7136364,10.1333333" id="Fill-2" fill="#EB4335"> </path> 
                      <path d="M23.7136364,37.8666667 C17.5491591,37.8666667 12.3545909,33.888 10.5322727,28.3562667 L2.62345455,34.3946667 C6.44540909,42.1557333 14.4268636,47.4666667 23.7136364,47.4666667 C29.4455,47.4666667 34.9177955,45.4314667 39.0249545,41.6181333 L31.5177727,35.8144 C29.3995682,37.1488 26.7323182,37.8666667 23.7136364,37.8666667" id="Fill-3" fill="#34A853"> </path> 
                      <path d="M46.1454545,24 C46.1454545,22.6133333 45.9318182,21.12 45.6113636,19.7333333 L23.7136364,19.7333333 L23.7136364,28.8 L36.3181818,28.8 C35.6879545,31.8912 33.9724545,34.2677333 31.5177727,35.8144 L39.0249545,41.6181333 C43.3393409,37.6138667 46.1454545,31.6490667 46.1454545,24" id="Fill-4" fill="#4285F4"> </path> 
                    </g> 
                  </g> 
                </g> 
              </svg>
              Continue with Google
            </button>
            
            <button
              type="button"
              onClick={handleLinkedInLogin}
              className="w-full flex items-center justify-center bg-[#0A66C2] rounded-xl shadow-sm px-6 py-3 text-sm font-medium text-white hover:bg-[#004182] hover:shadow-md focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <svg className="h-5 w-5 mr-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
              </svg>
              Continue with LinkedIn
            </button>
          </div>
        </form>
        
        {/* Footer Links */}
        <div className="text-center mt-8 space-y-2">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <Link to="/signup" className="text-green-600 hover:text-green-800 font-semibold transition-colors duration-200 hover:underline">
              Sign up
            </Link>
          </p>
          <p className="text-sm text-gray-600">
            <Link to="/forgot-password" className="text-green-600 hover:text-green-800 font-medium transition-colors duration-200 hover:underline">
              Forgot Password?
            </Link>
          </p>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        
        .shadow-3xl {
          box-shadow: 0 35px 60px -12px rgba(0, 0, 0, 0.25);
        }
      `}</style>
    </div>
  );
};

export default Login;