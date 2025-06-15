import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { FaUpload, FaTimes } from 'react-icons/fa';

const AddAchievementForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    dateAchieved: '',
    issuer: '',
    expirationDate: '',
    certificateUrl: '',
    verificationUrl: '',
    visibility: 'public',
    featured: false
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setImage(e.target.files[0]);
      setImagePreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  const removeImage = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setImage(null);
    setImagePreview(null);
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.issuer.trim()) newErrors.issuer = 'Issuer is required';
    if (!formData.dateAchieved) newErrors.dateAchieved = 'Achievement date is required';
    
    // If expiration date is provided, make sure it's after achievement date
    if (formData.expirationDate && new Date(formData.expirationDate) <= new Date(formData.dateAchieved)) {
      newErrors.expirationDate = 'Expiration date must be after achievement date';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      // Create FormData object for file upload
      const achievementFormData = new FormData();
      
      // Add all fields
      for (const [key, value] of Object.entries(formData)) {
        achievementFormData.append(key, value);
      }
      
      // Add image if present
      if (image) {
        achievementFormData.append('image', image);
      }
      
      await api.createAchievement(achievementFormData);
      navigate('/portfolio');
    } catch (err) {
      console.error('Error creating achievement:', err);
      setErrors({ submit: 'Failed to create achievement. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Add Achievement or Certification</h1>
        
        {errors.submit && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
            {errors.submit}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Title*
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded-lg ${
                    errors.title ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="E.g. AWS Certified Developer, Google Analytics Certificate"
                />
                {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title}</p>}
              </div>
              
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Select a category</option>
                  <option value="certification">Professional Certification</option>
                  <option value="course">Course Completion</option>
                  <option value="award">Award</option>
                  <option value="honor">Honor</option>
                  <option value="publication">Publication</option>
                  <option value="patent">Patent</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="issuer" className="block text-sm font-medium text-gray-700 mb-1">
                  Issuer*
                </label>
                <input
                  type="text"
                  id="issuer"
                  name="issuer"
                  value={formData.issuer}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded-lg ${
                    errors.issuer ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Organization that issued the credential"
                />
                {errors.issuer && <p className="mt-1 text-sm text-red-500">{errors.issuer}</p>}
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  placeholder="Brief description of the achievement"
                ></textarea>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="dateAchieved" className="block text-sm font-medium text-gray-700 mb-1">
                    Issue Date*
                  </label>
                  <input
                    type="date"
                    id="dateAchieved"
                    name="dateAchieved"
                    value={formData.dateAchieved}
                    onChange={handleChange}
                    className={`w-full p-2 border rounded-lg ${
                      errors.dateAchieved ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.dateAchieved && <p className="mt-1 text-sm text-red-500">{errors.dateAchieved}</p>}
                </div>
                
                <div>
                  <label htmlFor="expirationDate" className="block text-sm font-medium text-gray-700 mb-1">
                    Expiration Date (if applicable)
                  </label>
                  <input
                    type="date"
                    id="expirationDate"
                    name="expirationDate"
                    value={formData.expirationDate}
                    onChange={handleChange}
                    className={`w-full p-2 border rounded-lg ${
                      errors.expirationDate ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.expirationDate && <p className="mt-1 text-sm text-red-500">{errors.expirationDate}</p>}
                </div>
              </div>
              
              <div>
                <label htmlFor="certificateUrl" className="block text-sm font-medium text-gray-700 mb-1">
                  Certificate URL
                </label>
                <input
                  type="url"
                  id="certificateUrl"
                  name="certificateUrl"
                  value={formData.certificateUrl}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  placeholder="Link to view certificate (optional)"
                />
              </div>
              
              <div>
                <label htmlFor="verificationUrl" className="block text-sm font-medium text-gray-700 mb-1">
                  Verification URL
                </label>
                <input
                  type="url"
                  id="verificationUrl"
                  name="verificationUrl"
                  value={formData.verificationUrl}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  placeholder="Link to verify credential (optional)"
                />
              </div>
              
              <div>
                <label htmlFor="visibility" className="block text-sm font-medium text-gray-700 mb-1">
                  Visibility
                </label>
                <select
                  id="visibility"
                  name="visibility"
                  value={formData.visibility}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                >
                  <option value="public">Public (Everyone)</option>
                  <option value="connections">Connections Only</option>
                  <option value="private">Private (Only Me)</option>
                </select>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="featured"
                  name="featured"
                  checked={formData.featured}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="featured" className="ml-2 block text-sm text-gray-700">
                  Feature on my profile
                </label>
              </div>
            </div>
          </div>
          
          {/* Image Upload */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Certificate Image or Badge</h2>
            
            <div className="border-2 border-dashed border-gray-300 p-8 text-center rounded-lg">
              <input
                type="file"
                id="achievementImage"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              <label 
                htmlFor="achievementImage" 
                className="cursor-pointer flex flex-col items-center"
              >
                <FaUpload className="text-gray-400 text-4xl mb-2" />
                <span className="text-gray-500">Click to upload certificate image or badge</span>
                <span className="text-xs text-gray-400 mt-1">(PNG, JPG, GIF up to 5MB)</span>
              </label>
            </div>
            
            {/* Image Preview */}
            {imagePreview && (
              <div className="mt-4 flex justify-center">
                <div className="relative inline-block">
                  <img
                    src={imagePreview}
                    alt="Certificate Preview"
                    className="max-h-60 rounded-lg border"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                  >
                    <FaTimes size={12} />
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* Submit Buttons */}
          <div className="flex justify-end space-x-3">
<button
type="button"
onClick={() => navigate('/portfolio')}
className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
>
Cancel
</button>
<button
type="submit"
disabled={loading}
className={`px-6 py-2 bg-blue-600 text-white rounded-lg ${  loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-700'               }`}
>
{loading ? 'Saving...' : 'Save Achievement'}
</button>
</div>
</form>
</div>
</div>
);
};
export default AddAchievementForm