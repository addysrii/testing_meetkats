import { Linkedin, Twitter, Instagram } from "lucide-react";
import React from "react";
import { Card, CardContent } from "./../../components/ui/card";
import { Separator } from "./../../components/ui/separator";

const Footer = () => {
  const socialIcons = [
    { Icon: Linkedin, label: "LinkedIn",href:"https://www.linkedin.com/company/meetkats/" },
    { Icon: Instagram, label: "Instagram",href:"https://www.instagram.com/meetkats?igsh=MmlvdXh0Zmp0cGJ6" },
    { Icon: Twitter, label: "Twitter",href:"https://x.com/MeetKatsOrg" }
  ];

  const contactInfo = [
    { label: "Email", value: "official@meetkats.com" },
    // { label: "Phone", value: "+91 987654321" },
    { label: "Address", value: "237/3C ROOMA KANPUR" },
  ];

  const links = [
    { label: "Privacy Policy", href: "/privacypolicy" },
    { label: "Terms of Service", href: "/termsandconditons" },
    { label: "Refund Policy", href: "/refundpolicy" }
  ];

  return (
    <div id="footer" className="w-full px-4 sm:px-6 md:px-12 lg:px-24">
  <Card style={{backgroundColor:'rgba(209, 224, 198, 1)'}} className="w-full border-none rounded-t-3xl shadow-none">
    <CardContent className="p-6 md:p-10 lg:p-12">
      {/* Top Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mb-10">
        {/* Social Media */}
        <div className="flex flex-col space-y-4">
          <h3 style={{backgroundColor:"rgba(154, 190, 128, 1)"}} className="text-lg font-semibold text-green-800  w-fit px-2 py-1 rounded">
            Connect with us
          </h3>
          <div className="flex items-center space-x-4">
            {socialIcons.map(({ Icon, label, href }) => (
              <div 
                key={label}
                className="w-8 h-8 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
                aria-label={label}
              >
                <a href={href} className="flex items-center justify-center" target="_blank" rel="noopener noreferrer">
                  <Icon className="w-4 h-4 text-green-700" />
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Info */}
        <div className="flex flex-col space-y-4">
          <h3 style={{backgroundColor:"rgba(154, 190, 128, 1)"}} className="text-lg font-semibold text-green-800  w-fit px-2 py-1 rounded">
            Contact us
          </h3>
          <div className="space-y-3">
            {contactInfo.map(({ label, value }) => (
              <div key={label} className="text-green-800">
                <span className="font-medium">{label}: </span>
                {value}
              </div>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div className="flex flex-col space-y-4">
          <h3 style={{backgroundColor:"rgba(154, 190, 128, 1)"}} className="text-lg font-semibold text-green-800  w-fit px-2 py-1 rounded">
            Quick Links
          </h3>
          <div className="flex flex-col space-y-2">
            {links.map(({ label, href }) => (
              <a 
                key={label}
                href={href}
                className="text-green-700 hover:text-green-900 hover:underline transition-all"
              >
                {label}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <Separator className="w-full h-px bg-green-700/20 mb-6" />
      
      <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
        <div className="text-green-800 text-sm md:text-base">
          © {new Date().getFullYear()} Meetkats. All Rights Reserved.
        </div>
        
        <div className="flex space-x-4 text-sm md:text-base">
          {links.slice(0, 2).map(({ label, href }) => (
            <a 
              key={label}
              href={href}
              className="text-green-700 hover:text-green-900 hover:underline transition-all"
            >
              {label}
            </a>
          ))}
        </div>
      </div>
    </CardContent>
  </Card>
</div>
  );
};

export default Footer;