import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, X, Upload, Link as LinkIcon, Calendar, Tag } from 'lucide-react';
import api from '../../services/api';

const ProjectCreationPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [projectData, setProjectData] = useState({
    title: '',
    description: '',
    category: '',
    status: 'in-progress',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    tags: '',
    visibility: 'public'
  });
  const [links, setLinks] = useState([{ title: '', url: '' }]);
  const [attachments, setAttachments] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProjectData({ ...projectData, [name]: value });
  };

  const handleLinkChange = (index, field, value) => {
    const updatedLinks = [...links];
    updatedLinks[index] = { ...updatedLinks[index], [field]: value };
    setLinks(updatedLinks);
  };

  const addLink = () => {
    setLinks([...links, { title: '', url: '' }]);
  };

  const removeLink = (index) => {
    const filteredLinks = links.filter((_, i) => i !== index);
    setLinks(filteredLinks);
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setAttachments([...attachments, ...files]);
    
    // Generate previews for images
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setPreviewImages(prev => [...prev, { file: file.name, preview: e.target.result }]);
        };
        reader.readAsDataURL(file);
      } else {
        setPreviewImages(prev => [...prev, { file: file.name, preview: null }]);
      }
    });
  };

  const removeAttachment = (index) => {
    const newAttachments = [...attachments];
    newAttachments.splice(index, 1);
    setAttachments(newAttachments);
    
    const newPreviews = [...previewImages];
    newPreviews.splice(index, 1);
    setPreviewImages(newPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const formData = new FormData();
      
      // Add basic project info to FormData
      Object.keys(projectData).forEach(key => {
        formData.append(key, projectData[key]);
      });
      
      // Add links as JSON
      formData.append('links', JSON.stringify(links.filter(link => link.url)));
      
      // Add tags as array
      if (projectData.tags) {
        const tagsArray = projectData.tags.split(',').map(tag => tag.trim());
        formData.append('tags', JSON.stringify(tagsArray));
      }
      
      // Add attachments
      attachments.forEach(file => {
        formData.append('attachments', file);
      });
      
      // Submit the form
      const response = await api.createProject(formData);
      
      setLoading(false);
      navigate(`/portfolio/projects/${response._id}`);
    } catch (err) {
      console.error('Error creating project:', err);
      setError(err.response?.data?.error || 'Error creating project. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 overflow-auto bg-gray-100">
      <div className="md:pt-0 pt-16">
        <main className="max-w-4xl mx-auto p-4 md:p-6">
          {/* Header */}
          <div className="bg-white rounded-xl shadow-md mb-6 p-4 md:p-6 border-l-4 border-blue-500">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Create New Project</h1>
                <p className="text-gray-500">Showcase your work, skills, and accomplishments</p>
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
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                        Project Title *
                      </label>
                      <input
                        id="title"
                        name="title"
                        type="text"
                        required
                        value={projectData.title}
                        onChange={handleChange}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                        Description *
                      </label>
                      <textarea
                        id="description"
                        name="description"
                        rows={4}
                        required
                        value={projectData.description}
                        onChange={handleChange}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
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
                          value={projectData.category}
                          onChange={handleChange}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Select Category</option>
                          <option value="web-development">Web Development</option>
                          <option value="mobile-app">Mobile App</option>
                          <option value="design">Design</option>
                          <option value="data-science">Data Science</option>
                          <option value="machine-learning">Machine Learning</option>
                          <option value="research">Research</option>
                          <option value="writing">Writing</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      
                      <div>
                        <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                          Status
                        </label>
                        <select
                          id="status"
                          name="status"
                          value={projectData.status}
                          onChange={handleChange}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="planning">Planning</option>
                          <option value="in-progress">In Progress</option>
                          <option value="completed">Completed</option>
                          <option value="on-hold">On Hold</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                          Start Date
                        </label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Calendar className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            id="startDate"
                            name="startDate"
                            type="date"
                            value={projectData.startDate}
                            onChange={handleChange}
                            className="pl-10 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                          End Date
                        </label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Calendar className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            id="endDate"
                            name="endDate"
                            type="date"
                            value={projectData.endDate}
                            onChange={handleChange}
                            className="pl-10 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
                        Tags (comma separated)
                      </label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Tag className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          id="tags"
                          name="tags"
                          type="text"
                          value={projectData.tags}
                          onChange={handleChange}
                          placeholder="e.g. React, UI/UX, Portfolio"
                          className="pl-10 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="visibility" className="block text-sm font-medium text-gray-700">
                        Visibility
                      </label>
                      <select
                        id="visibility"
                        name="visibility"
                        value={projectData.visibility}
                        onChange={handleChange}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="public">Public (Everyone can see)</option>
                        <option value="connections">Connections Only</option>
                        <option value="private">Private (Only you)</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                {/* Links Section */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Project Links</h3>
                  
                  {links.map((link, index) => (
                    <div key={index} className="flex items-center space-x-2 mb-4">
                      <div className="flex-grow flex space-x-2">
                        <div className="w-1/3">
                          <input
                            type="text"
                            value={link.title}
                            onChange={(e) => handleLinkChange(index, 'title', e.target.value)}
                            placeholder="Link Title"
                            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div className="w-2/3 relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <LinkIcon className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type="url"
                            value={link.url}
                            onChange={(e) => handleLinkChange(index, 'url', e.target.value)}
                            placeholder="https://example.com"
                            className="pl-10 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeLink(index)}
                        className="p-2 text-gray-400 hover:text-red-500"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
                  
                  <button
                    type="button"
                    onClick={addLink}
                    className="mt-2 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Add Link
                  </button>
                </div>
                
                {/* Attachments Section */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Attachments</h3>
                  
                  <div className="space-y-4">
                    <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                      <div className="space-y-1 text-center">
                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="flex text-sm text-gray-600">
                          <label
                            htmlFor="file-upload"
                            className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                          >
                            <span>Upload a file</span>
                            <input
                              id="file-upload"
                              name="file-upload"
                              type="file"
                              className="sr-only"
                              multiple
                              onChange={handleFileChange}
                            />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500">
                          PNG, JPG, GIF, PDF up to 10MB
                        </p>
                      </div>
                    </div>
                    
                    {previewImages.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                        {previewImages.map((file, index) => (
                          <div key={index} className="relative">
                            {file.preview ? (
                              <img
                                src={file.preview}
                                alt={`Preview ${index}`}
                                className="h-24 w-full object-cover rounded-md"
                              />
                            ) : (
                              <div className="h-24 w-full bg-gray-100 flex items-center justify-center rounded-md">
                                <span className="text-sm text-gray-500">{file.file}</span>
                              </div>
                            )}
                            <button
                              type="button"
                              onClick={() => removeAttachment(index)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Form Actions */}
            <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate('/portfolio')}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
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
                    Create Project
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

export default ProjectCreationPage;