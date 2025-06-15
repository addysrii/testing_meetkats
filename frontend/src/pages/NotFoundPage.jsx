import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

const NotFoundPage = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {user && <Navbar />}
      
      <div className="flex-grow flex items-center justify-center">
        <div className="max-w-md px-4 py-10 text-center">
          <h1 className="text-9xl font-bold text-blue-600">404</h1>
          <h2 className="text-3xl font-bold text-gray-900 mt-4">Page Not Found</h2>
          <p className="text-gray-600 mt-2">The page you are looking for doesn't exist or has been moved.</p>
          <div className="mt-8">
            <Link 
              to={user ? "/dashboard" : "/login"} 
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md"
            >
              {user ? "Back to Dashboard" : "Go to Login"}
            </Link>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default NotFoundPage;