import React, { memo } from 'react';
import { FileText, Shield, Users, Lock, CreditCard, AlertTriangle, Gavel, Mail, MapPin, CheckCircle } from 'lucide-react';

const TermsAndConditions = memo(() => {
  const termsData = [
    {
      icon: <Users className="w-5 h-5" />,
      text: "You must be 13 years or older to use the App. You agree not to misuse our services."
    },
    {
      icon: <Shield className="w-5 h-5" />,
      text: "You agree not to misuse our service, interfere with normal operations, hack, or violate any local, state, national, or international law."
    },
    {
      icon: <Lock className="w-5 h-5" />,
      text: "Keep your password safe. You are responsible for activities under your account."
    },
    {
      icon: <MapPin className="w-5 h-5" />,
      text: "We shall have complete access to your location and any data shared from your account."
    },
    {
      icon: <FileText className="w-5 h-5" />,
      text: "Data entered at the time of sign-up shall also be accessed by the company, if need be."
    },
    {
      icon: <CreditCard className="w-5 h-5" />,
      text: "Certain features are only unlocked after subscription. Payments are only acceptable through proper gateways."
    },
    {
      icon: <AlertTriangle className="w-5 h-5" />,
      text: "Any kind of vulgarity on the app may lead to suspension of the account."
    },
    {
      icon: <Shield className="w-5 h-5" />,
      text: "If any fraud event is found on any user's end, the account shall be suspended, and required actions will be undertaken against the account."
    },
    {
      icon: <AlertTriangle className="w-5 h-5" />,
      text: "We are not responsible for any data loss or indirect, incidental, or consequential damages arising from your use of the app."
    },
    {
      icon: <FileText className="w-5 h-5" />,
      text: "All intellectual property rights in the app and its content belong to MeetKats. Unauthorized use is prohibited."
    },
    {
      icon: <Gavel className="w-5 h-5" />,
      text: "We reserve the right to suspend or terminate your access to the app, with/without any notice, at our sole discretion if you violate these Terms."
    },
    {
      icon: <CheckCircle className="w-5 h-5" />,
      text: "We may update these Terms from time to time. Continued use of the app means you accept the new Terms."
    },
    {
      icon: <Gavel className="w-5 h-5" />,
      text: "These Terms are governed by the laws of India."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%2310b981%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%221%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-30"></div>
      
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        {/* Header */}
        <header className="mb-8 sm:mb-12">
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6 sm:p-8 lg:p-10 rounded-2xl shadow-2xl backdrop-blur-sm border border-green-200/20 transform hover:scale-[1.02] transition-all duration-300 hover:shadow-3xl">
            <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
              <FileText className="w-8 h-8 sm:w-10 sm:h-10 text-green-100" />
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">Terms & Conditions</h1>
            </div>
            <p className="text-green-100 text-sm sm:text-base opacity-90">Last updated: 07/05/2025</p>
          </div>
        </header>
        
        {/* Introduction */}
        <div className="mb-8 sm:mb-12">
          <div 
            className="bg-white/80 backdrop-blur-sm p-6 sm:p-8 rounded-2xl shadow-lg border border-green-100 hover:shadow-xl transition-all duration-300"
            style={{
              animation: 'fadeInUp 0.6s ease-out forwards'
            }}
          >
            <p className="text-gray-700 text-base sm:text-lg lg:text-xl leading-relaxed">
              Welcome to <span className="font-bold text-green-600">MeetKats!</span> These Terms and Conditions govern your use of{' '}
              <span className="font-semibold text-green-700">MEETKATS CREATIONS PRIVATE LIMITED</span>, a mobile and web application operated by us. 
              By downloading or using our app, you agree to these terms.
            </p>
          </div>
        </div>
        
        {/* Terms of Use Section */}
        <section 
          className="mb-8 sm:mb-12"
          style={{
            animationDelay: '200ms',
            animation: 'fadeInUp 0.6s ease-out forwards'
          }}
        >
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-green-100 hover:shadow-xl transition-all duration-300 hover:border-green-200 group">
            <div className="p-6 sm:p-8">
              <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
                <div className="flex-shrink-0 p-2 sm:p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl text-white group-hover:scale-110 transition-transform duration-300">
                  <Gavel className="w-6 h-6" />
                </div>
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 group-hover:text-green-600 transition-colors duration-300">
                  Terms of Use
                </h2>
              </div>
              
              <div className="space-y-4 sm:space-y-6">
                {termsData.map((term, index) => (
                  <div 
                    key={index}
                    className="bg-green-50/50 rounded-xl p-4 sm:p-6 border border-green-100/50 hover:bg-green-50/80 hover:border-green-200/80 transition-all duration-300 group/item"
                    style={{
                      animationDelay: `${300 + index * 50}ms`,
                      animation: 'fadeInUp 0.6s ease-out forwards'
                    }}
                  >
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="flex-shrink-0 p-2 bg-green-200 rounded-lg text-green-600 group-hover/item:bg-green-300 group-hover/item:scale-110 transition-all duration-300">
                        {term.icon}
                      </div>
                      <p className="text-gray-700 text-sm sm:text-base leading-relaxed group-hover/item:text-gray-900 transition-colors duration-200">
                        {term.text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
        
        {/* Contact Section */}
        <section 
          className="mb-8"
          style={{
            animationDelay: '400ms',
            animation: 'fadeInUp 0.6s ease-out forwards'
          }}
        >
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 group">
            <div className="p-6 sm:p-8">
              <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div className="flex-shrink-0 p-2 sm:p-3 bg-white/20 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <Mail className="w-6 h-6" />
                </div>
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold">Contact Us</h2>
              </div>
              
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center gap-3 text-sm sm:text-base">
                  <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-green-200" />
                  <span className="font-semibold">Email:</span>
                  <a 
                    href="mailto:official@meetkats.com" 
                    className="underline hover:text-green-200 transition-colors duration-200 hover:no-underline"
                  >
                    official@meetkats.com
                  </a>
                </div>
                <div className="flex items-start gap-3 text-sm sm:text-base">
                  <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-green-200 mt-0.5" />
                  <span className="font-semibold">Address:</span>
                  <span>237/3C ROOMA KANPUR</span>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Footer */}
        <footer 
          className="text-center"
          style={{
            animationDelay: '500ms',
            animation: 'fadeInUp 0.6s ease-out forwards'
          }}
        >
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-green-100">
            <p className="text-gray-600 text-sm sm:text-base">
              © 2025 MeetKats. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
      
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
});

TermsAndConditions.displayName = 'TermsAndConditions';

export default TermsAndConditions;