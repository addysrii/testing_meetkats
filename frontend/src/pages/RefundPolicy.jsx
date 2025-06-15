import React, { memo } from 'react';
import { RefreshCw, Clock, CreditCard, AlertCircle, Calendar, Users, Mail, MapPin, CheckCircle, XCircle, Percent } from 'lucide-react';

const RefundPolicy = memo(() => {
  const refundPolicies = [
    {
      icon: <CreditCard className="w-5 h-5" />,
      text: "Subscription fees are refundable only if you experience technical issues that prevent use of the app's core features and we cannot resolve them.",
      category: "subscription"
    },
    {
      icon: <Clock className="w-5 h-5" />,
      text: "Refunds, if any available, for any technical failure preventing access to service must be requested within 7 days of purchase.",
      category: "timeframe"
    },
    {
      icon: <XCircle className="w-5 h-5" />,
      text: "Refunds are not available for partial months of service.",
      category: "restriction"
    },
    {
      icon: <CheckCircle className="w-5 h-5" />,
      text: "Only a valid reason for cancellation shall be entertained.",
      category: "requirement"
    },
    {
      icon: <XCircle className="w-5 h-5" />,
      text: "If you cancel your ticket on the day of the event, no refund will be delivered to you.",
      category: "event",
      highlight: "0% refund"
    },
    {
      icon: <Percent className="w-5 h-5" />,
      text: "If you cancel your ticket 48 hours before the event, you will receive 50% of the total purchase amount as refund.",
      category: "event",
      highlight: "50% refund"
    },
    {
      icon: <Percent className="w-5 h-5" />,
      text: "If you cancel your ticket 4 days before the event, you will receive 75% of the total purchase amount as refund.",
      category: "event",
      highlight: "75% refund"
    },
    {
      icon: <Percent className="w-5 h-5" />,
      text: "If you cancel your ticket a week before the event, you will receive 90% of the total purchase amount as refund. 10% service charges.",
      category: "event",
      highlight: "90% refund"
    },
    {
      icon: <Users className="w-5 h-5" />,
      text: "If a bulk booking is made, one cancelled ticket will lead to the cancellation of the entire order.",
      category: "bulk"
    },
    {
      icon: <Mail className="w-5 h-5" />,
      text: "To request a refund, write an email to official@meetkats.com with your account ID, purchase receipt, and a brief explanation of the issue.",
      category: "process"
    },
    {
      icon: <Clock className="w-5 h-5" />,
      text: "Approved refunds will be processed and credited within 7–10 business days to the original method of payment.",
      category: "processing"
    },
    {
      icon: <RefreshCw className="w-5 h-5" />,
      text: "We reserve the right to update this refund policy at any time.",
      category: "updates"
    }
  ];

  const getCategoryColor = (category) => {
    switch (category) {
      case 'event':
        return 'from-blue-500 to-indigo-500';
      case 'subscription':
        return 'from-purple-500 to-violet-500';
      case 'timeframe':
        return 'from-amber-500 to-orange-500';
      case 'restriction':
        return 'from-red-500 to-rose-500';
      case 'requirement':
        return 'from-green-500 to-emerald-500';
      case 'bulk':
        return 'from-cyan-500 to-teal-500';
      case 'process':
        return 'from-indigo-500 to-blue-500';
      case 'processing':
        return 'from-slate-500 to-gray-500';
      case 'updates':
        return 'from-violet-500 to-purple-500';
      default:
        return 'from-blue-500 to-indigo-500';
    }
  };

  const getCategoryBg = (category) => {
    switch (category) {
      case 'event':
        return 'bg-blue-50/50 border-blue-100/50';
      case 'subscription':
        return 'bg-purple-50/50 border-purple-100/50';
      case 'timeframe':
        return 'bg-amber-50/50 border-amber-100/50';
      case 'restriction':
        return 'bg-red-50/50 border-red-100/50';
      case 'requirement':
        return 'bg-green-50/50 border-green-100/50';
      case 'bulk':
        return 'bg-cyan-50/50 border-cyan-100/50';
      case 'process':
        return 'bg-indigo-50/50 border-indigo-100/50';
      case 'processing':
        return 'bg-slate-50/50 border-slate-100/50';
      case 'updates':
        return 'bg-violet-50/50 border-violet-100/50';
      default:
        return 'bg-blue-50/50 border-blue-100/50';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%233b82f6%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%221%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-30"></div>
      
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        {/* Header */}
        <header className="mb-8 sm:mb-12">
          <div className="bg-gradient-to-r from-green-600 to-green-600 text-white p-6 sm:p-8 lg:p-10 rounded-2xl shadow-2xl backdrop-blur-sm border border-blue-200/20 transform hover:scale-[1.02] transition-all duration-300 hover:shadow-3xl">
            <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
              <RefreshCw className="w-8 h-8 sm:w-10 sm:h-10 text-blue-100" />
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">Refund Policy</h1>
            </div>
            <p className="text-blue-100 text-sm sm:text-base opacity-90">Last updated: 07/05/2025</p>
          </div>
        </header>
        
        {/* Introduction */}
        <div className="mb-8 sm:mb-12">
          <div 
            className="bg-white/80 backdrop-blur-sm p-6 sm:p-8 rounded-2xl shadow-lg border border-blue-100 hover:shadow-xl transition-all duration-300"
            style={{
              animation: 'fadeInUp 0.6s ease-out forwards'
            }}
          >
            <p className="text-gray-700 text-base sm:text-lg lg:text-xl leading-relaxed mb-4">
              Thank you for using <span className="font-bold text-green-600">MeetKats!</span> If you are not completely satisfied with your purchase, we're here to help.
            </p>
            <p className="text-gray-600 text-sm sm:text-base lg:text-lg leading-relaxed">
              This refund policy outlines the conditions under which refunds may be issued for purchases made through MeetKats.
            </p>
          </div>
        </div>
        
        {/* Event Cancellation Timeline */}
        <section 
          className="mb-8 sm:mb-12"
          style={{
            animationDelay: '200ms',
            animation: 'fadeInUp 0.6s ease-out forwards'
          }}
        >
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-blue-100 hover:shadow-xl transition-all duration-300 hover:border-blue-200 group">
            <div className="p-6 sm:p-8">
              <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
                <div className="flex-shrink-0 p-2 sm:p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl text-white group-hover:scale-110 transition-transform duration-300">
                  <Calendar className="w-6 h-6" />
                </div>
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors duration-300">
                  Event Cancellation Timeline
                </h2>
              </div>
              
              <div className="grid gap-4 sm:gap-6">
                <div className="bg-gradient-to-r from-red-500 to-rose-500 text-white p-4 sm:p-6 rounded-xl shadow-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <Calendar className="w-5 h-5" />
                    <span className="font-bold text-lg">Same Day Cancellation</span>
                  </div>
                  <p className="text-red-100">No refund available</p>
                </div>
                
                <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-4 sm:p-6 rounded-xl shadow-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <Clock className="w-5 h-5" />
                    <span className="font-bold text-lg">48 Hours Before</span>
                  </div>
                  <p className="text-orange-100">50% refund of total amount</p>
                </div>
                
                <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white p-4 sm:p-6 rounded-xl shadow-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <Calendar className="w-5 h-5" />
                    <span className="font-bold text-lg">4 Days Before</span>
                  </div>
                  <p className="text-amber-100">75% refund of total amount</p>
                </div>
                
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-4 sm:p-6 rounded-xl shadow-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-bold text-lg">1 Week Before</span>
                  </div>
                  <p className="text-green-100">90% refund (10% service charges apply)</p>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Refund Policies Section */}
        <section 
          className="mb-8 sm:mb-12"
          style={{
            animationDelay: '300ms',
            animation: 'fadeInUp 0.6s ease-out forwards'
          }}
        >
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-blue-100 hover:shadow-xl transition-all duration-300 hover:border-blue-200 group">
            <div className="p-6 sm:p-8">
              <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
                <div className="flex-shrink-0 p-2 sm:p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl text-white group-hover:scale-110 transition-transform duration-300">
                  <CreditCard className="w-6 h-6" />
                </div>
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors duration-300">
                  Refund Policies & Terms
                </h2>
              </div>
              
              <div className="space-y-4 sm:space-y-6">
                {refundPolicies.map((policy, index) => (
                  <div 
                    key={index}
                    className={`${getCategoryBg(policy.category)} rounded-xl p-4 sm:p-6 border hover:shadow-md transition-all duration-300 group/item`}
                    style={{
                      animationDelay: `${400 + index * 50}ms`,
                      animation: 'fadeInUp 0.6s ease-out forwards'
                    }}
                  >
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className={`flex-shrink-0 p-2 bg-gradient-to-r ${getCategoryColor(policy.category)} rounded-lg text-white group-hover/item:scale-110 transition-all duration-300`}>
                        {policy.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-700 text-sm sm:text-base leading-relaxed group-hover/item:text-gray-900 transition-colors duration-200">
                          {policy.text.includes('official@meetkats.com') ? (
                            <>
                              {policy.text.split('official@meetkats.com')[0]}
                              <a 
                                href="mailto:official@meetkats.com" 
                                className="font-bold text-blue-600 hover:text-blue-800 underline hover:no-underline transition-colors duration-200"
                              >
                                official@meetkats.com
                              </a>
                              {policy.text.split('official@meetkats.com')[1]}
                            </>
                          ) : (
                            policy.text
                          )}
                        </p>
                        {policy.highlight && (
                          <div className="mt-2">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${getCategoryColor(policy.category)} text-white`}>
                              {policy.highlight}
                            </span>
                          </div>
                        )}
                      </div>
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
            animationDelay: '500ms',
            animation: 'fadeInUp 0.6s ease-out forwards'
          }}
        >
          <div className="bg-gradient-to-r from-green-600 to-green-600 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 group">
            <div className="p-6 sm:p-8">
              <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div className="flex-shrink-0 p-2 sm:p-3 bg-white/20 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <Mail className="w-6 h-6" />
                </div>
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold">Contact Us</h2>
              </div>
              
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center gap-3 text-sm sm:text-base">
                  <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-blue-200" />
                  <span className="font-semibold">Email:</span>
                  <a 
                    href="mailto:official@meetkats.com" 
                    className="underline hover:text-blue-200 transition-colors duration-200 hover:no-underline"
                  >
                    official@meetkats.com
                  </a>
                </div>
                <div className="flex items-start gap-3 text-sm sm:text-base">
                  <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-blue-200 mt-0.5" />
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
            animationDelay: '600ms',
            animation: 'fadeInUp 0.6s ease-out forwards'
          }}
        >
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-blue-100">
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
      `}
      </style>
    </div>
  );
});

RefundPolicy.displayName = 'RefundPolicy';

export default RefundPolicy;