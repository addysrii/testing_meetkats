// src/components/Footer/Footer.jsx
import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-orange-600 to-orange-700 text-white py-4 px-4 mt-auto">
      <div className="max-w-7xl mx-auto text-center text-sm">
        <p>
          © 2025 MeetKats •{' '}
          <a
            href="/privacypolicy"
            className="hover:underline hover:text-orange-300 transition"
          >
            Privacy Policy
          </a>{' '}
          •{' '}
          <a
            href="/termsandconditions"
            className="hover:underline hover:text-orange-300 transition"
          >
            Terms of Service
          </a>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
