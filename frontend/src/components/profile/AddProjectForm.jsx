
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { FaUpload, FaTimes, FaPlus } from 'react-icons/fa';

const AddProjectForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    status: 'in-progress',
    startDate: '',
    endDate: '',
    visibility: 'public',
    tags: [],
    links: []
  });
  const [attachments, setAttachments] = useState([]);
  const [imagePreview, setImagePreview] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [currentTag, setCurrentTag] = useState('');
  const [currentLink, setCurrentLink] = useState({ title: '', url: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  const handleAttachmentChange = (e) => {
    const newFiles = Array.from(e.target.files);
    
    // Create previews for images
    const newPreviews = newFiles.map(file => {
      if (file.type.startsWith('image/')) {
        return URL.createObjectURL(file);
      }
      return null;
    });
    
    setAttachments([...attachments, ...newFiles]);
    setImagePreview([...imagePreview, ...newPreviews]);
  };

  const removeAttachment = (index) => {
    const newAttachments = [...attachments];
    const newPreviews = [...imagePreview];
    
    // Release URL object to avoid memory leaks
    if (newPreviews[index]) {
      URL.revokeObjectURL(newPreviews[index]);
    }
    
    newAttachments.splice(index, 1);
    newPreviews.splice(index, 1);
    
    setAttachments(newAttachments);
    setImagePreview(newPreviews);
  };

  const addTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, currentTag.trim()]
      });
      setCurrentTag('');
    }
  };

  const removeTag = (tag) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(t => t !== tag)
    });
  };

  const handleLinkChange = (e) => {
    const { name, value } = e.target;
    setCurrentLink({ ...currentLink, [name]: value });
  };

  const addLink = () => {
    if (currentLink.title && currentLink.url) {
      setFormData({
        ...formData,
        links: [...formData.links, { ...currentLink }]
      });
      setCurrentLink({ title: '', url: '' });
    }
  };

  const removeLink = (index) => {
    const newLinks = [...formData.links];
    newLinks.splice(index, 1);
    setFormData({ ...formData, links: newLinks });
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.category.trim()) newErrors.category = 'Category is required';
    if (!formData.startDate) newErrors.startDate = 'Start date is required';
    
    // If endDate is provided, make sure it's after startDate
    if (formData.endDate && new Date(formData.endDate) <= new Date(formData.startDate)) {
      newErrors.endDate = 'End date must be after start date';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

 // Updated form submission function with better debugging and error handling
const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      // Create FormData object for file upload
      const projectFormData = new FormData();
      
      // Explicitly check title
      if (!formData.title || !formData.title.trim()) {
        setErrors({ title: 'Title is required' });
        setLoading(false);
        return;
      }
      
      // Explicitly add title first to ensure it's in the FormData
      projectFormData.append('title', formData.title.trim());
      
      // Add all other text fields
      for (const [key, value] of Object.entries(formData)) {
        // Skip title since we already added it
        if (key === 'title') continue;
        
        if (key === 'tags' || key === 'links') {
          projectFormData.append(key, JSON.stringify(value));
        } else if (value !== undefined && value !== null) {
          projectFormData.append(key, value);
        }
      }
      
      // Debug: Log the form data being sent
      console.log('Form data being submitted:');
      for (const [key, value] of projectFormData.entries()) {
        console.log(`${key}: ${typeof value === 'string' ? value : '[File or complex data]'}`);
      }
      
      // Add all attachments
      attachments.forEach(file => {
        projectFormData.append('attachments', file);
      });
      
      const response = await api.createProject(projectFormData);
      console.log('Project created successfully:', response);
      navigate('/portfolio');
    } catch (err) {
      console.error('Error creating project:', err);
      
      // Handle API error responses
      if (err.response) {
        const { data } = err.response;
        console.error('Server error data:', data);
        
        if (data.errors) {
          // Map server validation errors to form errors
          const serverErrors = {};
          Object.entries(data.errors).forEach(([field, error]) => {
            serverErrors[field] = error.message || 'Invalid value';
          });
          setErrors(serverErrors);
        } else {
          setErrors({ submit: data.error || 'Failed to create project. Please try again.' });
        }
      } else if (err.message) {
        setErrors({ submit: `Error: ${err.message}` });
      } else {
        setErrors({ submit: 'Failed to create project. Please try again.' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Add New Project</h1>
        
        {errors.submit && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
            {errors.submit}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Basic Information</h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Project Title*
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
                  placeholder="Enter project title"
                />
                {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title}</p>}
              </div>
              
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  Category*
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded-lg ${
                    errors.category ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select a category</option>
                  <option value="web-development">Web Development</option>
                  <option value="mobile-app">Mobile App</option>
                  <option value="design">Design</option>
                  <option value="data-science">Data Science</option>
                  <option value="machine-learning">Machine Learning</option>
                  <option value="research">Research</option>
                  <option value="writing">Writing</option>
                  <option value="other">Other</option>
                </select>
                {errors.category && <p className="mt-1 text-sm text-red-500">{errors.category}</p>}
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description*
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={5}
                  className={`w-full p-2 border rounded-lg ${
                    errors.description ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Describe your project"
                ></textarea>
                {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description}</p>}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date*
                  </label>
                  <input
                    type="date"
                    id="startDate"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    className={`w-full p-2 border rounded-lg ${
                      errors.startDate ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.startDate && <p className="mt-1 text-sm text-red-500">{errors.startDate}</p>}
                </div>
                
                <div>
                  <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                    End Date (leave blank if ongoing)
                  </label>
                  <input
                    type="date"
                    id="endDate"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    className={`w-full p-2 border rounded-lg ${
                      errors.endDate ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.endDate && <p className="mt-1 text-sm text-red-500">{errors.endDate}</p>}
                </div>
              </div>
              
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                >
                  <option value="planned">Planned</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
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
            </div>
          </div>
          
          {/* Tags */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Tags</h2>
            
            <div className="flex">
              <input
                type="text"
                value={currentTag}
                onChange={(e) => setCurrentTag(e.target.value)}
                className="flex-1 p-2 border border-gray-300 rounded-l-lg"
                placeholder="Add a tag"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              />
              <button
                type="button"
                onClick={addTag}
                className="px-4 py-2 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700"
              >
                Add
              </button>
            </div>
            
            {formData.tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <div key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full flex items-center">
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-2 text-blue-800 hover:text-blue-600"
                    >
                      <FaTimes size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Links */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Links</h2>
            
            <div className="grid grid-cols-5 gap-2">
              <input
                type="text"
                name="title"
                value={currentLink.title}
                onChange={handleLinkChange}
                className="col-span-2 p-2 border border-gray-300 rounded-lg"
                placeholder="Link Title (e.g. GitHub, Demo)"
              />
              <input
                type="url"
                name="url"
                value={currentLink.url}
                onChange={handleLinkChange}
                className="col-span-2 p-2 border border-gray-300 rounded-lg"
                placeholder="URL (https://...)"
              />
              <button
                type="button"
                onClick={addLink}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <FaPlus />
              </button>
            </div>
            
            {formData.links.length > 0 && (
              <div className="mt-3 space-y-2">
                {formData.links.map((link, index) => (
                  <div key={index} className="flex items-center justify-between p-2 border border-gray-200 rounded-lg">
                    <div>
                      <span className="font-medium text-gray-700">{link.title}: </span>
                      <a 
                        href={link.url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-blue-600 hover:underline"
                      >
                        {link.url}
                      </a>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeLink(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <FaTimes />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Attachments */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Attachments</h2>
            
            <div className="border-2 border-dashed border-gray-300 p-8 text-center rounded-lg">
              <input
                type="file"
                id="attachments"
                onChange={handleAttachmentChange}
                multiple
                className="hidden"
              />
              <label 
                htmlFor="attachments" 
                className="cursor-pointer flex flex-col items-center"
              >
                <FaUpload className="text-gray-400 text-4xl mb-2" />
                <span className="text-gray-500">Click to upload images or files</span>
                <span className="text-xs text-gray-400 mt-1">Upload up to 5 files (10MB each)</span>
              </label>
            </div>
            
            {/* Preview for image attachments */}
            {imagePreview.length > 0 && (
              <div className="mt-4 grid grid-cols-4 gap-4">
                {imagePreview.map((preview, index) => (
                  <div key={index} className="relative">
                    {preview ? (
                      <img
                        src={preview}
                        alt={`Preview ${index}`}
                        className="h-24 w-24 object-cover rounded-lg border"
                      />
                    ) : (
                      <div className="h-24 w-24 bg-gray-100 flex items-center justify-center rounded-lg border">
                        <span className="text-gray-500 text-xs">
                          {attachments[index].name.slice(0, 15)}
                          {attachments[index].name.length > 15 ? '...' : ''}
                        </span>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => removeAttachment(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                    >
                      <FaTimes size={12} />
                    </button>
                  </div>
                ))}
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
              className={`px-6 py-2 bg-blue-600 text-white rounded-lg ${
                loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-700'
              }`}
            >
              {loading ? 'Saving...' : 'Save Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProjectForm;