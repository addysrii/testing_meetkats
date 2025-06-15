import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import api from '../services/api';

const SettingsPage = () => {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('account');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Account settings state
  const [accountSettings, setAccountSettings] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    email: '',
    phoneNumber: ''
  });

  // Privacy settings state
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: 'public',
    storyVisibility: 'followers',
    messagePermission: 'everyone',
    activityStatus: 'everyone',
    searchability: true
  });

  // Notification settings state
  const [notificationSettings, setNotificationSettings] = useState({
    email: {
      messages: true,
      connections: true,
      mentions: true,
      events: true,
      jobs: true,
      marketing: false
    },
    push: {
      messages: true,
      connections: true,
      mentions: true,
      events: true,
      jobs: true
    },
    inApp: {
      messages: true,
      connections: true,
      mentions: true,
      events: true,
      jobs: true
    }
  });

  // Initialize form data from user object
  useEffect(() => {
    if (user) {
      setAccountSettings(prev => ({
        ...prev,
        email: user.email || '',
        phoneNumber: user.phoneNumber || ''
      }));

      if (user.privacy) {
        setPrivacySettings({
          profileVisibility: user.privacy.profileVisibility || 'public',
          storyVisibility: user.privacy.storyVisibility || 'followers',
          messagePermission: user.privacy.messagePermission || 'everyone',
          activityStatus: user.privacy.activityStatus || 'everyone',
          searchability: user.privacy.searchability !== undefined ? user.privacy.searchability : true
        });
      }

      if (user.notificationPreferences) {
        setNotificationSettings(user.notificationPreferences);
      }
    }
  }, [user]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  // Handle account settings changes
  const handleAccountChange = (e) => {
    const { name, value } = e.target;
    setAccountSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle privacy settings changes
  const handlePrivacyChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPrivacySettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle notification settings changes
  const handleNotificationChange = (e) => {
    const { name, checked } = e.target;
    const [category, type] = name.split('.');
    
    setNotificationSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [type]: checked
      }
    }));
  };

  // Update account settings
  const updateAccountSettings = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Validate passwords match for password change
      if (accountSettings.newPassword) {
        if (!accountSettings.currentPassword) {
          setError('Current password is required to set a new password');
          setLoading(false);
          return;
        }
        
        if (accountSettings.newPassword !== accountSettings.confirmPassword) {
          setError('New passwords do not match');
          setLoading(false);
          return;
        }
      }

      // Create update data
      const updateData = {};
      
      if (accountSettings.newPassword) {
        updateData.password = accountSettings.newPassword;
        updateData.currentPassword = accountSettings.currentPassword;
      }

      if (accountSettings.email !== user.email) {
        updateData.email = accountSettings.email;
      }

      // Only proceed if there are changes
      if (Object.keys(updateData).length === 0) {
        setError('No changes to update');
        setLoading(false);
        return;
      }

      const updatedUser = await api.updateProfile(updateData);
      
      // Update user context
      updateUser(updatedUser);
      
      // Clear sensitive fields
      setAccountSettings(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
      
      setSuccess('Account settings updated successfully');
      setLoading(false);
    } catch (error) {
      console.error('Error updating account settings:', error);
      setError(error.response?.data?.error || 'Failed to update account settings');
      setLoading(false);
    }
  };

  // Update privacy settings
  const updatePrivacySettings = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await api.updatePrivacySettings(privacySettings);
      
      // Update user context with new privacy settings
      updateUser({
        privacy: privacySettings
      });
      
      setSuccess('Privacy settings updated successfully');
      setLoading(false);
    } catch (error) {
      console.error('Error updating privacy settings:', error);
      setError(error.response?.data?.error || 'Failed to update privacy settings');
      setLoading(false);
    }
  };

  // Update notification settings
  const updateNotificationSettings = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // This would be implemented in a real API
      // For now just simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update user context with new notification settings
      updateUser({
        notificationPreferences: notificationSettings
      });
      
      setSuccess('Notification settings updated successfully');
      setLoading(false);
    } catch (error) {
      console.error('Error updating notification settings:', error);
      setError(error.response?.data?.error || 'Failed to update notification settings');
      setLoading(false);
    }
  };

  // Delete account
  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete your account? This action cannot be undone and will permanently delete all your data."
    );

    if (confirmed) {
      try {
        setLoading(true);
        // This would be implemented in a real API
        // For now just log out the user
        await logout();
        navigate('/login');
      } catch (error) {
        console.error('Error deleting account:', error);
        setError(error.response?.data?.error || 'Failed to delete account');
        setLoading(false);
      }
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Navbar user={user} onLogout={logout} />
      
      <div className="container mx-auto px-4 py-8 flex-grow">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {/* Settings Tabs */}
          <div className="bg-gray-50 px-4 py-4 border-b border-gray-200">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveTab('account')}
                className={`px-4 py-2 text-sm font-medium rounded-md ${
                  activeTab === 'account'
                    ? 'bg-blue-100 text-blue-600'
                    : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                Account
              </button>
              <button
                onClick={() => setActiveTab('privacy')}
                className={`px-4 py-2 text-sm font-medium rounded-md ${
                  activeTab === 'privacy'
                    ? 'bg-blue-100 text-blue-600'
                    : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                Privacy
              </button>
              <button
                onClick={() => setActiveTab('notifications')}
                className={`px-4 py-2 text-sm font-medium rounded-md ${
                  activeTab === 'notifications'
                    ? 'bg-blue-100 text-blue-600'
                    : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                Notifications
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={`px-4 py-2 text-sm font-medium rounded-md ${
                  activeTab === 'security'
                    ? 'bg-blue-100 text-blue-600'
                    : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                Security
              </button>
            </div>
          </div>
          
          {/* Status Messages */}
          {success && (
            <div className="m-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
              {success}
            </div>
          )}
          
          {error && (
            <div className="m-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          
          {/* Account Settings */}
          {activeTab === 'account' && (
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Account Settings</h2>
              
              <form onSubmit={updateAccountSettings}>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-700 mb-4">Basic Information</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="firstName">
                          First Name
                        </label>
                        <input
                          type="text"
                          id="firstName"
                          value={user.firstName}
                          disabled
                          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight bg-gray-100"
                        />
                        <p className="text-xs text-gray-500 mt-1">To change your name, go to the profile page</p>
                      </div>
                      
                      <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="lastName">
                          Last Name
                        </label>
                        <input
                          type="text"
                          id="lastName"
                          value={user.lastName}
                          disabled
                          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight bg-gray-100"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-gray-700 mb-4">Contact Information</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                          Email Address
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={accountSettings.email}
                          onChange={handleAccountChange}
                          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="phoneNumber">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          id="phoneNumber"
                          name="phoneNumber"
                          value={accountSettings.phoneNumber}
                          onChange={handleAccountChange}
                          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-gray-700 mb-4">Change Password</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="currentPassword">
                          Current Password
                        </label>
                        <input
                          type="password"
                          id="currentPassword"
                          name="currentPassword"
                          value={accountSettings.currentPassword}
                          onChange={handleAccountChange}
                          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="newPassword">
                          New Password
                        </label>
                        <input
                          type="password"
                          id="newPassword"
                          name="newPassword"
                          value={accountSettings.newPassword}
                          onChange={handleAccountChange}
                          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="confirmPassword">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          id="confirmPassword"
                          name="confirmPassword"
                          value={accountSettings.confirmPassword}
                          onChange={handleAccountChange}
                          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8">
                  <button
                    type="submit"
                    className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md shadow-md mr-2"
                    disabled={loading}
                  >
                    {loading ? 'Updating...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          )}
          
          {/* Privacy Settings */}
          {activeTab === 'privacy' && (
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Privacy Settings</h2>
              
              <form onSubmit={updatePrivacySettings}>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-700 mb-4">Profile Visibility</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="profileVisibility">
                          Who can see your profile?
                        </label>
                        <select
                          id="profileVisibility"
                          name="profileVisibility"
                          value={privacySettings.profileVisibility}
                          onChange={handlePrivacyChange}
                          className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="public">Everyone (Public)</option>
                          <option value="connections">Connections Only</option>
                          <option value="private">Only Me (Private)</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="storyVisibility">
                          Who can see your stories?
                        </label>
                        <select
                          id="storyVisibility"
                          name="storyVisibility"
                          value={privacySettings.storyVisibility}
                          onChange={handlePrivacyChange}
                          className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="public">Everyone (Public)</option>
                          <option value="followers">Followers</option>
                          <option value="connections">Connections Only</option>
                          <option value="private">Only Me (Private)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-gray-700 mb-4">Communication Privacy</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="messagePermission">
                          Who can send you messages?
                        </label>
                        <select
                          id="messagePermission"
                          name="messagePermission"
                          value={privacySettings.messagePermission}
                          onChange={handlePrivacyChange}
                          className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="everyone">Everyone</option>
                          <option value="followers">Followers</option>
                          <option value="connections">Connections Only</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="activityStatus">
                          Who can see your activity status?
                        </label>
                        <select
                          id="activityStatus"
                          name="activityStatus"
                          value={privacySettings.activityStatus}
                          onChange={handlePrivacyChange}
                          className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="everyone">Everyone</option>
                          <option value="connections">Connections Only</option>
                          <option value="nobody">Nobody</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-gray-700 mb-4">Discovery Settings</h3>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="searchability"
                        name="searchability"
                        checked={privacySettings.searchability}
                        onChange={handlePrivacyChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label className="ml-2 block text-gray-700" htmlFor="searchability">
                        Allow others to find you by email or phone number
                      </label>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8">
                  <button
                    type="submit"
                    className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md shadow-md mr-2"
                    disabled={loading}
                  >
                    {loading ? 'Updating...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          )}
          
          {/* Notification Settings */}
          {activeTab === 'notifications' && (
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Notification Settings</h2>
              
              <form onSubmit={updateNotificationSettings}>
                <div className="space-y-8">
                  <div>
                    <h3 className="text-lg font-medium text-gray-700 mb-4">Email Notifications</h3>
                    
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="email.messages"
                          name="email.messages"
                          checked={notificationSettings.email.messages}
                          onChange={handleNotificationChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label className="ml-2 block text-gray-700" htmlFor="email.messages">
                          New messages
                        </label>
                      </div>
                      
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="email.connections"
                          name="email.connections"
                          checked={notificationSettings.email.connections}
                          onChange={handleNotificationChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label className="ml-2 block text-gray-700" htmlFor="email.connections">
                          Connection requests
                        </label>
                      </div>
                      
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="email.mentions"
                          name="email.mentions"
                          checked={notificationSettings.email.mentions}
                          onChange={handleNotificationChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label className="ml-2 block text-gray-700" htmlFor="email.mentions">
                          Mentions and tags
                        </label>
                      </div>
                      
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="email.events"
                          name="email.events"
                          checked={notificationSettings.email.events}
                          onChange={handleNotificationChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label className="ml-2 block text-gray-700" htmlFor="email.events">
                          Event invitations and updates
                        </label>
                      </div>
                      
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="email.jobs"
                          name="email.jobs"
                          checked={notificationSettings.email.jobs}
                          onChange={handleNotificationChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label className="ml-2 block text-gray-700" htmlFor="email.jobs">
                          Job recommendations
                        </label>
                      </div>
                      
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="email.marketing"
                          name="email.marketing"
                          checked={notificationSettings.email.marketing}
                          onChange={handleNotificationChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label className="ml-2 block text-gray-700" htmlFor="email.marketing">
                          Marketing emails and promotions
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-gray-700 mb-4">Push Notifications</h3>
                    
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="push.messages"
                          name="push.messages"
                          checked={notificationSettings.push.messages}
                          onChange={handleNotificationChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label className="ml-2 block text-gray-700" htmlFor="push.messages">
                          New messages
                        </label>
                      </div>
                      
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="push.connections"
                          name="push.connections"
                          checked={notificationSettings.push.connections}
                          onChange={handleNotificationChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label className="ml-2 block text-gray-700" htmlFor="push.connections">
                          Connection requests
                        </label>
                      </div>
                      
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="push.mentions"
                          name="push.mentions"
                          checked={notificationSettings.push.mentions}
                          onChange={handleNotificationChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label className="ml-2 block text-gray-700" htmlFor="push.mentions">
                          Mentions and tags
                        </label>
                      </div>
                      
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="push.events"
                          name="push.events"
                          checked={notificationSettings.push.events}
                          onChange={handleNotificationChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label className="ml-2 block text-gray-700" htmlFor="push.events">
                          Event invitations and updates
                        </label>
                      </div>
                      
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="push.jobs"
                          name="push.jobs"
                          checked={notificationSettings.push.jobs}
                          onChange={handleNotificationChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label className="ml-2 block text-gray-700" htmlFor="push.jobs">
                          Job recommendations
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-gray-700 mb-4">In-App Notifications</h3>
                    
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="inApp.messages"
                          name="inApp.messages"
                          checked={notificationSettings.inApp.messages}
                          onChange={handleNotificationChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label className="ml-2 block text-gray-700" htmlFor="inApp.messages">
                          New messages
                        </label>
                      </div>
                      
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="inApp.connections"
                          name="inApp.connections"
                          checked={notificationSettings.inApp.connections}
                          onChange={handleNotificationChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label className="ml-2 block text-gray-700" htmlFor="inApp.connections">
                          Connection requests
                        </label>
                      </div>
                      
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="inApp.mentions"
                          name="inApp.mentions"
                          checked={notificationSettings.inApp.mentions}
                          onChange={handleNotificationChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label className="ml-2 block text-gray-700" htmlFor="inApp.mentions">
                          Mentions and tags
                        </label>
                      </div>
                      
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="inApp.events"
                          name="inApp.events"
                          checked={notificationSettings.inApp.events}
                          onChange={handleNotificationChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label className="ml-2 block text-gray-700" htmlFor="inApp.events">
                          Event invitations and updates
                        </label>
                      </div>
<div className="flex items-center">
  <input
    type="checkbox"
    id="inApp.jobs"
    name="inApp.jobs"
    checked={notificationSettings.inApp.jobs}
    onChange={handleNotificationChange}
    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
  />
  <label className="ml-2 block text-gray-700" htmlFor="inApp.jobs">
    Job recommendations
  </label>
</div>
</div>
</div>

<div className="mt-8">
  <button
    type="submit"
    className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md shadow-md mr-2"
    disabled={loading}
  >
    {loading ? 'Updating...' : 'Save Changes'}
  </button>
</div>
</div>
</form>
</div>
)}

{/* Security Settings */}
{activeTab === 'security' && (
<div className="p-6">
  <h2 className="text-xl font-semibold text-gray-800 mb-6">Security Settings</h2>
  
  <div className="space-y-6">
    <div>
      <h3 className="text-lg font-medium text-gray-700 mb-4">Login Security</h3>
      
      <div className="space-y-4">
        <div>
          <h4 className="font-medium text-gray-800">Two-Factor Authentication</h4>
          <p className="text-gray-600 text-sm mb-2">Add an extra layer of security to your account</p>
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md shadow-md"
            onClick={() => alert('This would enable 2FA in a real application')}
          >
            Enable 2FA
          </button>
        </div>
        
        <div>
          <h4 className="font-medium text-gray-800">Login History</h4>
          <p className="text-gray-600 text-sm mb-2">Review your recent login activity</p>
          <button
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md shadow-md"
            onClick={() => alert('This would show login history in a real application')}
          >
            View Login History
          </button>
        </div>
      </div>
    </div>
    
    <div>
      <h3 className="text-lg font-medium text-gray-700 mb-4">Device Management</h3>
      <p className="text-gray-600 text-sm mb-2">Manage devices that are currently logged into your account</p>
      <button
        className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md shadow-md"
        onClick={() => alert('This would show device management in a real application')}
      >
        Manage Devices
      </button>
    </div>
    
    <div>
      <h3 className="text-lg font-medium text-gray-700 mb-4">Data Export</h3>
      <p className="text-gray-600 text-sm mb-2">Download a copy of your data</p>
      <button
        className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md shadow-md"
        onClick={() => alert('This would initiate data export in a real application')}
      >
        Request Data Export
      </button>
    </div>
    
    <div>
      <h3 className="text-lg font-medium text-red-700 mb-4">Delete Account</h3>
      <p className="text-gray-600 text-sm mb-2">Permanently delete your account and all of your data</p>
      <button
        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md shadow-md"
        onClick={handleDeleteAccount}
      >
        Delete Account
      </button>
    </div>
  </div>
</div>
)}
</div>
</div>

<Footer />
</div>
);
};

export default SettingsPage;