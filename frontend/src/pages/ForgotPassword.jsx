import { useState } from "react";
import { Mail, ArrowLeft, CheckCircle, Loader2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setError("Please enter your email address");
      return;
    }
    
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setError("");
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 2000);
  };

  const handleBackToLogin = () => {
    setIsSubmitted(false);
    setEmail("");
    setError("");
    window.location.href = "/login"; // Redirect to login page
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-200 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-green-300 rounded-full opacity-15 animate-pulse" style={{animationDelay: '1s'}}></div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Main Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-green-100 p-8 transition-all duration-700 hover:shadow-3xl">
          
          {!isSubmitted ? (
            // Forgot Password Form
            <div className="space-y-6 animate-in fade-in duration-500">
              {/* Header */}
              <div className="text-center space-y-2">
                <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg animate-bounce">
                  <Mail className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Forgot Password?</h1>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Don't worry! Enter your email address and we'll send you a link to reset your password.
                </p>
              </div>

              {/* Form */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-gray-700 block">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSubmit(e)}
                      className="w-full px-4 py-3 pl-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all duration-300 placeholder-gray-400 bg-white/50 backdrop-blur-sm"
                      placeholder="Enter your email address"
                    />
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  </div>
                  {error && (
                    <p className="text-red-500 text-sm animate-in slide-in-from-left duration-300">
                      {error}
                    </p>
                  )}
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-300 hover:from-green-600 hover:to-green-700 hover:shadow-lg hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <span>Send Reset Link</span>
                  )}
                </button>
              </div>

              {/* Back to Login */}
              <div className="text-center pt-4">
                <button 
                  onClick={handleBackToLogin}
                  className="inline-flex items-center text-green-600 hover:text-green-700 font-medium transition-colors duration-200 group"
                >
                  <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
                  Back to Login
                </button>
              </div>
            </div>
          ) : (
            // Success Message
            <div className="text-center space-y-6 animate-in fade-in duration-500">
              <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto shadow-lg animate-bounce">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              
              <div className="space-y-3">
                <h1 className="text-3xl font-bold text-gray-800">Check Your Email</h1>
                <p className="text-gray-600 leading-relaxed">
                  We've sent a password reset link to
                </p>
                <p className="font-semibold text-green-600 bg-green-50 px-4 py-2 rounded-lg inline-block">
                  {email}
                </p>
                <p className="text-gray-500 text-sm">
                  Didn't receive the email? Check your spam folder or try again.
                </p>
              </div>

              <div className="space-y-3 pt-4">
                <button
                  onClick={() => handleSubmit({ preventDefault: () => {} })}
                  disabled={isLoading}
                  className="w-full bg-white border-2 border-green-500 text-green-600 py-3 px-6 rounded-xl font-semibold transition-all duration-300 hover:bg-green-50 hover:scale-105 disabled:opacity-70"
                >
                  Resend Email
                </button>
                
                <button 
                  onClick={handleBackToLogin}
                  className="inline-flex items-center text-green-600 hover:text-green-700 font-medium transition-colors duration-200 group"
                >
                  <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
                  Back to Login
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8 animate-in fade-in duration-700 delay-300">
          <p className="text-gray-500 text-sm">
            Need help? <a href="#" className="text-green-600 hover:text-green-700 font-medium transition-colors duration-200">Contact Support</a>
          </p>
        </div>
      </div>
    </div>
  );
}