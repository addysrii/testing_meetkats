import { useState } from "react";
import { ChevronUp, Heart } from "lucide-react";
import {
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaLinkedin,
  FaYoutube,
} from "react-icons/fa";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [showBackToTop] = useState(true);

  const handleSubscribe = () => {
    // Handle newsletter subscription
    console.log("Subscribed with email:", email);
    setEmail("");
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-cyan-500 text-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Contact Details Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start mb-12">
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Details</h3>
            <div className="space-y-2 text-sm">
              <p>+91 95425 33574</p>
              <p>info@meetkats.com</p>
            </div>
          </div>
          <div className="mt-6 sm:mt-0">
            <h3 className="text-lg font-semibold mb-4">FOLLOW US ON</h3>
            <div className="flex space-x-4">
              <a
                href="#"
                className="w-10 h-10 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110"
                aria-label="Follow us on Facebook"
              >
                <FaFacebook className="w-5 h-5 invert" />
              </a>
              <a
                href="https://x.com/MeetKatsOrg"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110"
                aria-label="Follow us on Twitter"
              >
                <FaTwitter className="w-5 h-5 invert" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110"
                aria-label="Follow us on Instagram"
              >
                <FaInstagram className="w-5 h-5 invert" />
              </a>
              <a
                href="https://www.linkedin.com/company/meetkats/posts/?feedView=all"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110"
                aria-label="Follow us on LinkedIn"
              >
                <FaLinkedin className="w-5 h-5 invert" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110"
                aria-label="Follow us on YouTube"
              >
                <FaYoutube className="w-5 h-5 invert" />
              </a>
            </div>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          {/* For Users Column */}
          <div>
            <h4 className="text-base font-semibold mb-6 text-white">
              FOR USERS
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <a
                  href="#"
                  className="hover:text-cyan-200 transition-colors duration-200"
                >
                  Book Tickets
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-cyan-200 transition-colors duration-200"
                >
                  Explore Events
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-cyan-200 transition-colors duration-200"
                >
                  Discover Shows
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-cyan-200 transition-colors duration-200"
                >
                  Grab Discounts
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-cyan-200 transition-colors duration-200"
                >
                  MeetKats Lounge
                </a>
              </li>
            </ul>
          </div>

          {/* For Organisers Column */}
          <div>
            <h4 className="text-base font-semibold mb-6 text-white">
              FOR ORGANISERS
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <a
                  href="#"
                  className="hover:text-cyan-200 transition-colors duration-200"
                >
                  List Your Event
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-cyan-200 transition-colors duration-200"
                >
                  Register as Organiser
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-cyan-200 transition-colors duration-200"
                >
                  Promote Event
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-cyan-200 transition-colors duration-200"
                >
                  Boost Visibility
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-cyan-200 transition-colors duration-200"
                >
                  Organiser Care
                </a>
              </li>
            </ul>
          </div>

          {/* Quick Links Column */}
          <div>
            <h4 className="text-base font-semibold mb-6 text-white">
              QUICK LINKS
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <a
                  href="#"
                  className="hover:text-cyan-200 transition-colors duration-200"
                >
                  Home
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-cyan-200 transition-colors duration-200"
                >
                  Cancellation & Refund Policy
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-cyan-200 transition-colors duration-200"
                >
                  Help & FAQs
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-cyan-200 transition-colors duration-200"
                >
                  Term & Conditions
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-cyan-200 transition-colors duration-200"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-cyan-200 transition-colors duration-200"
                >
                  Announcement / Blogs
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-cyan-200 transition-colors duration-200"
                >
                  Partner With Us
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter Subscribe Column */}
          <div>
            <h4 className="text-base font-semibold mb-6 text-white">
              Newsletter Subscribe
            </h4>
            <div className="space-y-4">
              <input
                type="email"
                placeholder="Enter your e-mail address*"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-md  bg-opacity-20 backdrop-blur-sm border border-white border-opacity-30 text-white placeholder-white placeholder-opacity-70 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 focus:bg-opacity-30 transition-all duration-200"
              />
              <button
                onClick={handleSubscribe}
                className="bg-white text-cyan-500 px-6 py-2 rounded-md font-medium hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
              >
                SUBSCRIBE
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t border-cyan-400 border-opacity-30">
          <div className="flex flex-col sm:flex-row justify-between items-center text-sm">
            <p className="text-cyan-100 mb-4 sm:mb-0">
              © 2025 MeetKats. All Rights Reserved.
            </p>
            <div className="flex items-center space-x-1 text-cyan-100">
              <span>Handcrafted with</span>
              <Heart className="w-4 h-4 text-red-400 fill-current" />
              <span>in Kanpur - BHARAT</span>
            </div>
          </div>
        </div>
      </div>

      {/* Back to Top Button */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="absolute bottom-6 right-6 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full p-3 transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
          aria-label="Back to top"
        >
          <ChevronUp className="w-5 h-5 text-white" />
          <span className="sr-only">Back to top</span>
        </button>
      )}
    </footer>
  );
};

export default Footer;
