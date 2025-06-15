import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProfileSetup from '../components/auth/ProfileSetup';
import { useAuth } from '../context/AuthContext';

const ProfileSetupPage = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ProfileSetup />
      </div>
    </div>
  );
};

export default ProfileSetupPage;