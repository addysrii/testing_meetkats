import React, { memo } from 'react';
import { Shield, Camera, User, Share2, Lock, Users, FileText, Mail, MapPin, Eye } from 'lucide-react';

const PrivacyPolicy = memo(() => {
  const sections = [
    {
      id: 'information-collect',
      title: 'Information We Collect',
      icon: <Eye className="w-6 h-6" />,
      content: [
        {
          subtitle: '1. Camera Permission',
          icon: <Camera className="w-5 h-5" />,
          items: [
            'Used for scanning QR codes to check in at an event',
            'To make posts or send photos/videos',
            'Camera access is only activated when you choose to give permission'
          ]
        },
        {
          subtitle: '2. Personal Information',
          icon: <User className="w-5 h-5" />,
          items: [
            'Profile info, email, phone and some data regarding your personal portfolio is captured',
            'Information you provide when creating content',
            'Your chats are end-to-end encrypted'
          ]
        }
      ]
    },
    {
      id: 'how-we-use',
      title: 'How We Use Your Information',
      icon: <Share2 className="w-6 h-6" />,
      items: [
        'To provide social networking features',
        'To improve app functionality',
        'To communicate with you about the Service',
        'To create a pool of valuable connections for you'
      ]
    },
    {
      id: 'data-sharing',
      title: 'Data Sharing',
      icon: <Users className="w-6 h-6" />,
      content: 'Your data is being made available to the necessary partners who want to enhance your living standards.'
    },
    {
      id: 'data-security',
      title: 'Data Security',
      icon: <Lock className="w-6 h-6" />,
      items: [
        'We implement measures to protect your information',
        'We have a team of cyber security to look after all online hazards'
      ]
    },
    {
      id: 'user-rights',
      title: 'User Rights',
      icon: <Shield className="w-6 h-6" />,
      items: [
        'Access your personal data',
        'Request data deletion',
        'Update your information',
        'Allow or Block your location access'
      ]
    },
    {
      id: 'children-privacy',
      title: "Children's Privacy",
      icon: <Users className="w-6 h-6" />,
      items: [
        'Our service is not directed to children under 13',
        'We do not knowingly collect data from children'
      ]
    },
    {
      id: 'policy-changes',
      title: 'Changes to This Policy',
      icon: <FileText className="w-6 h-6" />,
      items: [
        'Updates will be posted with revision dates',
        'Continued use implies acceptance'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23f97316%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%221%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-30"></div>
      
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        {/* Header */}
        <header className="mb-8 sm:mb-12">
          <div className="bg-gradient-to-r from-green-500 to-green-400 text-white p-6 sm:p-8 lg:p-10 rounded-2xl shadow-2xl backdrop-blur-sm border border-green-200/20 transform hover:scale-[1.02] transition-all duration-300 hover:shadow-3xl">
            <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
              <Shield className="w-8 h-8 sm:w-10 sm:h-10 text-green-100" />
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">Privacy Policy</h1>
            </div>
            <p className="text-green-100 text-sm sm:text-base opacity-90">Last updated: 07/05/2025</p>
          </div>
        </header>
        
        {/* Introduction */}
        <div className="mb-8 sm:mb-12">
          <div className="bg-white/80 backdrop-blur-sm p-6 sm:p-8 rounded-2xl shadow-lg border border-green-100 hover:shadow-xl transition-all duration-300">
            <p className="text-green-700 font-medium text-base sm:text-lg lg:text-xl leading-relaxed">
              Meetkats is committed to protecting your privacy. This privacy policy explains how our social networking app handles your information.
            </p>
          </div>
        </div>
        
        {/* Content Sections */}
        <div className="space-y-6 sm:space-y-8">
          {sections.map((section, index) => (
            <section 
              key={section.id}
              className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-green-100 hover:shadow-xl transition-all duration-300 hover:border-green-200 group"
              style={{
                animationDelay: `${index * 100}ms`,
                animation: 'fadeInUp 0.6s ease-out forwards'
              }}
            >
              <div className="p-6 sm:p-8">
                <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <div className="flex-shrink-0 p-2 sm:p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-xl text-white group-hover:scale-110 transition-transform duration-300">
                    {section.icon}
                  </div>
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 group-hover:text-green-600 transition-colors duration-300">
                    {section.title}
                  </h2>
                </div>
                
                {section.content && typeof section.content === 'string' && (
                  <p className="text-gray-700 text-sm sm:text-base leading-relaxed pl-0 sm:pl-14">
                    {section.content}
                  </p>
                )}
                
                {section.items && (
                  <ul className="space-y-2 sm:space-y-3 pl-0 sm:pl-14">
                    {section.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-start gap-3 text-gray-700 text-sm sm:text-base leading-relaxed hover:text-gray-900 transition-colors duration-200">
                        <div className="flex-shrink-0 w-2 h-2 bg-green-400 rounded-full mt-2 sm:mt-2.5"></div>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
                
                {section.content && Array.isArray(section.content) && (
                  <div className="space-y-4 sm:space-y-6 pl-0 sm:pl-14">
                    {section.content.map((subsection, subIndex) => (
                      <div key={subIndex} className="bg-green-50/50 rounded-xl p-4 sm:p-6 border border-green-100/50">
                        <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                          <div className="flex-shrink-0 p-1.5 bg-green-200 rounded-lg text-green-600">
                            {subsection.icon}
                          </div>
                          <h3 className="text-lg sm:text-xl font-semibold text-green-700">
                            {subsection.subtitle}
                          </h3>
                        </div>
                        <ul className="space-y-2 sm:space-y-3">
                          {subsection.items.map((item, itemIndex) => (
                            <li key={itemIndex} className="flex items-start gap-3 text-gray-700 text-sm sm:text-base leading-relaxed">
                              <div className="flex-shrink-0 w-1.5 h-1.5 bg-green-400 rounded-full mt-2.5"></div>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          ))}
          
          {/* Contact Section */}
          <section className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 group">
            <div className="p-6 sm:p-8">
              <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div className="flex-shrink-0 p-2 sm:p-3 bg-white/20 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <Mail className="w-6 h-6" />
                </div>
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold">Contact Us</h2>
              </div>
              
              <p className="text-green-100 mb-4 sm:mb-6 text-sm sm:text-base leading-relaxed pl-0 sm:pl-14">
                For questions about this privacy policy, contact us at:
              </p>
              
              <div className="space-y-3 sm:space-y-4 pl-0 sm:pl-14">
                <div className="flex items-center gap-3 text-sm sm:text-base">
                  <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-green-200" />
                  <span className="font-semibold">Email:</span>
                  <a href="mailto:official@meetkats.com" className="underline hover:text-green-200 transition-colors duration-200">
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
          </section>
        </div>
        
        {/* Footer */}
        <footer className="text-center mt-12 sm:mt-16">
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-green-100">
            <p className="text-gray-600 text-sm sm:text-base">
              © 2025 Meetkats. All rights reserved.
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

PrivacyPolicy.displayName = 'PrivacyPolicy';

export default PrivacyPolicy;