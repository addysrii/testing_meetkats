import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, X, Calendar, Upload, Award, Link as LinkIcon } from 'lucide-react';
import api from '../../services/api';

const AchievementCreationPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [achievementData, setAchievementData] = useState({
    title: '',
    description: '',
    category: '',
    issuer: '',
    dateAchieved: new Date().toISOString().split('T')[0],
    expirationDate: '',
    certificateUrl: '',
    verificationUrl: '',
    visibility: 'public',
    featured: false
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAchievementData({
      ...achievementData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setImageFile(file);
    
    // Generate preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const formData = new FormData();
      
      // Add achievement data to form
      Object.keys(achievementData).forEach(key => {
        formData.append(key, achievementData[key]);
      });
      
      // Add image if selected
      if (imageFile) {
        formData.append('image', imageFile);
      }
      
      // Submit the form
      const response = await api.createAchievement(formData);
      
      setLoading(false);
      navigate(`/portfolio/achievements/${response._id}`);
    } catch (err) {
      console.error('Error creating achievement:', err);
      setError(err.response?.data?.error || 'Error creating achievement. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 overflow-auto bg-gray-100">
      <div className="md:pt-0 pt-16">
        <main className="max-w-4xl mx-auto p-4 md:p-6">
          {/* Header */}
          <div className="bg-white rounded-xl shadow-md mb-6 p-4 md:p-6 border-l-4 border-purple-500">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Add New Achievement</h1>
                <p className="text-gray-500">Showcase your certifications, awards, and accomplishments</p>
              </div>
              <div className="flex space-x-2">
                <button 
                  onClick={() => navigate('/portfolio')}
                  className="p-2 rounded-lg text-gray-500 hover:bg-gray-100"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <X className="h-5 w-5 text-red-500" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-6">
              <div className="grid grid-cols-1 gap-6">
                {/* Basic Info Section */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Achievement Information</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                        Achievement Title *
                      </label>
                      <input
                        id="title"
                        name="title"
                        type="text"
                        required
                        value={achievementData.title}
                        onChange={handleChange}
                        placeholder="e.g. AWS Certified Developer, Design Excellence Award"
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                        Description
                      </label>
                      <textarea
                        id="description"
                        name="description"
                        rows={3}
                        value={achievementData.description}
                        onChange={handleChange}
                        placeholder="Describe what this achievement represents and how you earned it"
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                          Category
                        </label>
                        <select
                          id="category"
                          name="category"
                          value={achievementData.category}
                          onChange={handleChange}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                        >
                          <option value="">Select Category</option>
                          <option value="certification">Certification</option>
                          <option value="award">Award</option>
                          <option value="education">Education</option>
                          <option value="course">Course Completion</option>
                          <option value="recognition">Recognition</option>
                          <option value="publication">Publication</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      
                      <div>
                        <label htmlFor="issuer" className="block text-sm font-medium text-gray-700">
                          Issuing Organization
                        </label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Award className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            id="issuer"
                            name="issuer"
                            type="text"
                            value={achievementData.issuer}
                            onChange={handleChange}
                            placeholder="e.g. AWS, Coursera, University"
                            className="pl-10 block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="dateAchieved" className="block text-sm font-medium text-gray-700">
                          Date Achieved *
                        </label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Calendar className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            id="dateAchieved"
                            name="dateAchieved"
                            type="date"
                            required
                            value={achievementData.dateAchieved}
                            onChange={handleChange}
                            className="pl-10 block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label htmlFor="expirationDate" className="block text-sm font-medium text-gray-700">
                          Expiration Date (if applicable)
                        </label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Calendar className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            id="expirationDate"
                            name="expirationDate"
                            type="date"
                            value={achievementData.expirationDate}
                            onChange={handleChange}
                            className="pl-10 block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="certificateUrl" className="block text-sm font-medium text-gray-700">
                          Certificate URL
                        </label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <LinkIcon className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            id="certificateUrl"
                            name="certificateUrl"
                            type="url"
                            value={achievementData.certificateUrl}
                            onChange={handleChange}
                            placeholder="https://example.com/certificate"
                            className="pl-10 block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label htmlFor="verificationUrl" className="block text-sm font-medium text-gray-700">
                          Verification URL
                        </label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <LinkIcon className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            id="verificationUrl"
                            name="verificationUrl"
                            type="url"
                            value={achievementData.verificationUrl}
                            onChange={handleChange}
                            placeholder="https://example.com/verify"
                            className="pl-10 block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="visibility" className="block text-sm font-medium text-gray-700">
                        Visibility
                      </label>
                      <select
                        id="visibility"
                        name="visibility"
                        value={achievementData.visibility}
                        onChange={handleChange}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                      >
                        <option value="public">Public (Everyone can see)</option>
                        <option value="connections">Connections Only</option>
                        <option value="private">Private (Only you)</option>
                      </select>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        id="featured"
                        name="featured"
                        type="checkbox"
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                        checked={achievementData.featured}
                        onChange={handleChange}
                      />
                      <label htmlFor="featured" className="ml-2 block text-sm text-gray-700">
                        Feature this achievement on your profile
                      </label>
                    </div>
                  </div>
                </div>
                
                {/* Image Upload Section */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Badge or Certificate Image</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                    <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                      <div className="space-y-1 text-center">
                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="flex text-sm text-gray-600">
                          <label
                            htmlFor="image-upload"
                            className="relative cursor-pointer rounded-md font-medium text-purple-600 hover:text-purple-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-purple-500"
                          >
                            <span>Upload an image</span>
                            <input
                              id="image-upload"
                              name="image"
                              type="file"
                              className="sr-only"
                              accept="image/*"
                              onChange={handleImageChange}
                            />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500">
                          PNG, JPG, GIF up to 5MB
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex justify-center">
                      {imagePreview ? (
                        <div className="relative">
                          <img
                            src={imagePreview}
                            alt="Certificate Preview"
                            className="h-40 w-auto object-contain rounded-md"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setImagePreview(null);
                              setImageFile(null);
                            }}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-40 w-full bg-gray-100 rounded-md">
                          <p className="text-sm text-gray-500">No image selected</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Form Actions */}
            <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate('/portfolio')}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Add Achievement
                  </>
                )}
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
};

export default AchievementCreationPage;