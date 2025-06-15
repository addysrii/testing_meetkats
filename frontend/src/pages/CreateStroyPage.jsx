import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import storyService from '../services/storyService';

const CreateStoryPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [storyFile, setStoryFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [content, setContent] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fileType, setFileType] = useState(null);
  const [activeFilter, setActiveFilter] = useState('none');
  const [textPosition, setTextPosition] = useState('bottom'); // 'top', 'middle', 'bottom'
  const [textColor, setTextColor] = useState('#ffffff');
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const filters = [
    { name: 'none', label: 'Normal' },
    { name: 'warm', label: 'Warm', class: 'filter-warm' },
    { name: 'cool', label: 'Cool', class: 'filter-cool' },
    { name: 'vintage', label: 'Vintage', class: 'filter-vintage' },
    { name: 'grayscale', label: 'B&W', class: 'filter-grayscale' },
    { name: 'sepia', label: 'Sepia', class: 'filter-sepia' }
  ];

  const textColors = [
    '#ffffff', // white
    '#000000', // black
    '#FF8C38', // orange
    '#3B82F6', // blue
    '#10B981', // green
    '#EF4444', // red
    '#EC4899', // pink
    '#F59E0B', // yellow
  ];

  // Simulated upload progress
  useEffect(() => {
    if (isUploading) {
      const timer = setInterval(() => {
        setUploadProgress(prevProgress => {
          if (prevProgress >= 100) {
            clearInterval(timer);
            return 100;
          }
          return prevProgress + 5;
        });
      }, 150);

      return () => {
        clearInterval(timer);
      };
    }
  }, [isUploading]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      setError('Please select an image or video file');
      return;
    }

    // Validate file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      setError('File too large. Maximum size is 50MB.');
      return;
    }

    setFileType(file.type.startsWith('image/') ? 'image' : 'video');
    setStoryFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setError(null);
  };

  const handleCreateStory = async () => {
    if (!storyFile) {
      setError('Please select a file for your story');
      return;
    }
  
    try {
      setIsUploading(true);
      
      // Create story data object with all metadata
      const storyData = {
        content: content || 'My Story',
        filter: activeFilter,
        textPosition: textPosition,
        textColor: textColor
      };
  
      // Send to server - pass storyData and media file separately as expected by storyService
      const response = await storyService.createStory(storyData, storyFile);
      
      // Navigate back to dashboard after successful creation
      navigate('/dashboard');
    } catch (error) {
      console.error('Error creating story:', error);
      setError(error.response?.data?.error || 'Failed to create story');
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 shadow-md">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <button 
              onClick={() => navigate('/dashboard')}
              className="text-white hover:text-orange-100"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <h1 className="text-white font-bold text-xl">Create Story</h1>
            <div className="w-6"></div> {/* Empty div for centering */}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-md">
        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Story Preview */}
          <div className="relative bg-black h-96 flex items-center justify-center">
            {!previewUrl && (
              <div className="text-center p-8">
                <div 
                  className="w-20 h-20 mx-auto mb-4 bg-orange-500 rounded-full flex items-center justify-center cursor-pointer"
                  onClick={triggerFileInput}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <p className="text-white">Tap to add a photo or video</p>
                <p className="text-gray-400 text-sm mt-2">Share a highlight from your day</p>
              </div>
            )}
            
            {previewUrl && (
              <div className={`relative w-full h-full ${activeFilter !== 'none' ? filters.find(f => f.name === activeFilter).class : ''}`}>
                {fileType === 'image' ? (
                  <img 
                    src={previewUrl} 
                    alt="Story preview" 
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <video 
                    src={previewUrl} 
                    className="w-full h-full object-contain" 
                    controls
                  />
                )}
                
                {/* Text overlay */}
                {content && (
                  <div 
                    className={`absolute ${
                      textPosition === 'top' ? 'top-4' :
                      textPosition === 'middle' ? 'top-1/2 transform -translate-y-1/2' :
                      'bottom-4'
                    } left-0 right-0 px-4 text-center`}
                  >
                    <p style={{ color: textColor }} className="text-xl font-bold text-shadow-sm">
                      {content}
                    </p>
                  </div>
                )}
                
                {/* Replace button */}
                <button
                  onClick={triggerFileInput}
                  className="absolute top-4 right-4 bg-black bg-opacity-60 rounded-full p-2 text-white"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
              </div>
            )}
            
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*,video/*"
              className="hidden"
            />
          </div>
          
          {/* Error message */}
          {error && (
            <div className="bg-red-50 text-red-500 p-3 text-sm">
              {error}
            </div>
          )}
          
          {/* Story Options */}
          <div className="p-4 space-y-4">
            {/* Content Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Add a caption
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write something..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                rows="2"
              ></textarea>
            </div>
            
            {/* Filters */}
            {previewUrl && fileType === 'image' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filters
                </label>
                <div className="flex space-x-3 overflow-x-auto pb-2">
                  {filters.map((filter) => (
                    <button
                      key={filter.name}
                      onClick={() => setActiveFilter(filter.name)}
                      className={`flex-shrink-0 text-center focus:outline-none ${
                        activeFilter === filter.name ? 'bg-orange-100 text-orange-600' : 'text-gray-600'
                      } rounded-lg px-3 py-1`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Text Position */}
            {previewUrl && content && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Text Position
                </label>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setTextPosition('top')}
                    className={`flex-1 py-1 px-3 ${
                      textPosition === 'top' ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-600'
                    } rounded-lg`}
                  >
                    Top
                  </button>
                  <button
                    onClick={() => setTextPosition('middle')}
                    className={`flex-1 py-1 px-3 ${
                      textPosition === 'middle' ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-600'
                    } rounded-lg`}
                  >
                    Middle
                  </button>
                  <button
                    onClick={() => setTextPosition('bottom')}
                    className={`flex-1 py-1 px-3 ${
                      textPosition === 'bottom' ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-600'
                    } rounded-lg`}
                  >
                    Bottom
                  </button>
                </div>
              </div>
            )}
            
            {/* Text Color */}
            {previewUrl && content && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Text Color
                </label>
                <div className="flex flex-wrap gap-2">
                  {textColors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setTextColor(color)}
                      className={`h-8 w-8 rounded-full focus:outline-none ${
                        textColor === color ? 'ring-2 ring-offset-2 ring-orange-500' : ''
                      }`}
                      style={{ backgroundColor: color }}
                    ></button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Create Button */}
            <div className="pt-4">
              {isUploading ? (
                <div className="space-y-2">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-orange-500 h-2.5 rounded-full" 
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-center text-gray-500">Uploading... {uploadProgress}%</p>
                </div>
              ) : (
                <button
                  onClick={handleCreateStory}
                  disabled={!previewUrl}
                  className={`w-full py-3 rounded-lg font-medium ${
                    previewUrl 
                      ? 'bg-orange-500 hover:bg-orange-600 text-white' 
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Share to Story
                </button>
              )}
            </div>
          </div>
        </div>
        
        {/* Privacy Note */}
        <div className="mt-6 text-center text-gray-500 text-xs">
          Your story will be visible for 24 hours. 
          <button className="ml-1 text-orange-500 hover:underline">
            Adjust privacy settings
          </button>
        </div>
      </div>
      
      {/* CSS for filters */}
      <style jsx>{`
        .filter-warm {
          filter: sepia(0.3) saturate(1.5) brightness(1.1);
        }
        .filter-cool {
          filter: hue-rotate(-30deg) saturate(1.2);
        }
        .filter-vintage {
          filter: sepia(0.3) contrast(1.1) brightness(0.9);
        }
        .filter-grayscale {
          filter: grayscale(1);
        }
        .filter-sepia {
          filter: sepia(0.8);
        }
        .text-shadow-sm {
          text-shadow: 0 1px 3px rgba(0, 0, 0, 0.7);
        }
      `}</style>
    </div>
  );
};

export default CreateStoryPage;