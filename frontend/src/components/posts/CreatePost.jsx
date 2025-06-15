import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Sidebar from '../common/Navbar';
import api from '../../services/api';
import postService from '../../services/postService';

const CreatePost = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [content, setContent] = useState('');
  const [mediaType, setMediaType] = useState(null); // 'photo', 'video', 'event'
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [eventDetails, setEventDetails] = useState({
    title: '',
    date: '',
    location: '',
    description: ''
  });
  const [showEventForm, setShowEventForm] = useState(false);

  // File input ref
  const fileInputRef = React.useRef(null);

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  const handleContentChange = (e) => {
    setContent(e.target.value);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setMediaFile(file);

    // Create a preview URL
    const previewUrl = URL.createObjectURL(file);
    setMediaPreview(previewUrl);
  };

  const triggerFileInput = (type) => {
    setMediaType(type);
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleEventClick = () => {
    setMediaType('event');
    setShowEventForm(true);
  };

  const handleEventInputChange = (e) => {
    const { name, value } = e.target;
    setEventDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const removeMedia = () => {
    setMediaType(null);
    setMediaFile(null);
    setMediaPreview(null);
    setShowEventForm(false);
  };

  const handleSubmit = async () => {
    if (!content && !mediaFile && mediaType !== 'event') {
      alert('Please add some content to your post');
      return;
    }

    if (mediaType === 'event' && !eventDetails.title) {
      alert('Please add a title for your event');
      return;
    }

    setIsSubmitting(true);

    try {
      // Create a post data object
      const postData = {
        content,
        type: mediaType || 'text'
      };
      
      // Add event details if applicable
      if (mediaType === 'event') {
        postData.eventDetails = JSON.stringify(eventDetails);
      }

      // Submit using the correct pattern for the service
      const response = mediaFile 
        ? await postService.createPost(postData, [mediaFile]) // Pass as array for multiple file support
        : await postService.createPost(postData);
      
      // Redirect to feed/dashboard on success
      navigate('/dashboard');
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Failed to create post. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/dashboard');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      {/* <Sidebar user={user} /> */}
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="md:pl-0 pl-0 md:pt-0 pt-16"> {/* Adjusted for sidebar */}
          <main className="max-w-3xl mx-auto p-4 md:p-6">
            {/* Back Button */}
            <div className="mb-4">
              <button 
                onClick={() => navigate(-1)}
                className="flex items-center text-gray-600 hover:text-orange-500"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back
              </button>
            </div>
            
            {/* Create Post Card */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-2">Create Post</h2>
                <p className="text-gray-500">Share updates, photos, videos or events with your network</p>
              </div>
              
              {/* Create post section */}
              <div className="bg-orange-50 rounded-xl p-6 mb-6">
                <div className="flex space-x-3">
                  <div className="flex-shrink-0">
                    <div className="h-12 w-12 rounded-lg overflow-hidden">
                      {user?.profileImage ? (
                        <img
                          src={user.profileImage}
                          alt="Profile"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center bg-orange-200 text-orange-600 font-bold">
                          {user?.firstName?.charAt(0)}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex-grow">
                    <textarea 
                      className="w-full border border-gray-200 rounded-lg px-4 py-2 h-32 resize-none focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder={`What's on your mind, ${user?.firstName}?`}
                      value={content}
                      onChange={handleContentChange}
                    ></textarea>
                    
                    {/* Media Preview */}
                    {mediaPreview && mediaType !== 'event' && (
                      <div className="mt-3 relative">
                        <div className="rounded-lg overflow-hidden border border-gray-200">
                          {mediaType === 'photo' ? (
                            <img src={mediaPreview} alt="Upload preview" className="max-h-64 w-auto mx-auto" />
                          ) : mediaType === 'video' ? (
                            <video src={mediaPreview} controls className="max-h-64 w-auto mx-auto"></video>
                          ) : null}
                        </div>
                        <button 
                          onClick={removeMedia}
                          className="absolute top-2 right-2 bg-gray-800 bg-opacity-70 text-white rounded-full p-1"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    )}
                    
                    {/* Event Form */}
                    {showEventForm && (
                      <div className="mt-3 bg-white p-4 rounded-lg border border-gray-200">
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="font-medium text-gray-900">Event Details</h4>
                          <button 
                            onClick={removeMedia}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                        <div className="space-y-3">
                          <div>
                            <label htmlFor="event-title" className="block text-sm font-medium text-gray-700 mb-1">
                              Event Title*
                            </label>
                            <input
                              type="text"
                              id="event-title"
                              name="title"
                              value={eventDetails.title}
                              onChange={handleEventInputChange}
                              className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                              placeholder="Enter event title"
                            />
                          </div>
                          <div>
                            <label htmlFor="event-date" className="block text-sm font-medium text-gray-700 mb-1">
                              Date and Time
                            </label>
                            <input
                              type="datetime-local"
                              id="event-date"
                              name="date"
                              value={eventDetails.date}
                              onChange={handleEventInputChange}
                              className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                            />
                          </div>
                          <div>
                            <label htmlFor="event-location" className="block text-sm font-medium text-gray-700 mb-1">
                              Location
                            </label>
                            <input
                              type="text"
                              id="event-location"
                              name="location"
                              value={eventDetails.location}
                              onChange={handleEventInputChange}
                              className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                              placeholder="Enter location"
                            />
                          </div>
                          <div>
                            <label htmlFor="event-description" className="block text-sm font-medium text-gray-700 mb-1">
                              Description
                            </label>
                            <textarea
                              id="event-description"
                              name="description"
                              value={eventDetails.description}
                              onChange={handleEventInputChange}
                              className="w-full border border-gray-200 rounded-lg px-3 py-2 h-20 resize-none focus:outline-none focus:ring-2 focus:ring-orange-500"
                              placeholder="Enter event description"
                            ></textarea>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Hidden file input */}
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      className="hidden"
                      accept={mediaType === 'photo' ? 'image/*' : mediaType === 'video' ? 'video/*' : ''}
                      onChange={handleFileSelect}
                    />
                    
                    <div className="flex mt-3 pt-3 border-t border-gray-200 justify-between">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => triggerFileInput('photo')}
                          className={`flex items-center justify-center py-1 px-2 rounded ${
                            mediaType === 'photo' 
                              ? 'bg-orange-100 text-orange-600' 
                              : 'text-orange-500 hover:text-orange-600'
                          }`}
                          disabled={mediaType && mediaType !== 'photo'}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          Photo
                        </button>
                        <button 
                          onClick={() => triggerFileInput('video')}
                          className={`flex items-center justify-center py-1 px-2 rounded ${
                            mediaType === 'video' 
                              ? 'bg-orange-100 text-orange-600' 
                              : 'text-orange-500 hover:text-orange-600'
                          }`}
                          disabled={mediaType && mediaType !== 'video'}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          Video
                        </button>
                        <button 
                          onClick={handleEventClick}
                          className={`flex items-center justify-center py-1 px-2 rounded ${
                            mediaType === 'event' 
                              ? 'bg-orange-100 text-orange-600' 
                              : 'text-orange-500 hover:text-orange-600'
                          }`}
                          disabled={mediaType && mediaType !== 'event'}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          Event
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex justify-end space-x-3">
                <button 
                  onClick={handleCancel}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className={`px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md flex items-center ${
                    isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
                  }`}
                >
                  {isSubmitting && (
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  {isSubmitting ? 'Posting...' : 'Post'}
                </button>
              </div>
            </div>
            
            {/* Post Guidelines */}
            <div className="mt-6 bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Posting Guidelines</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-orange-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Share professional content relevant to your industry
                </li>
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-orange-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Use appropriate language and tone
                </li>
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-orange-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Respect copyright and intellectual property
                </li>
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-orange-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Tag relevant topics for better visibility
                </li>
              </ul>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default CreatePost;