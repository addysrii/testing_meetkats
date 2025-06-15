import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import userService from '../services/userService';
import { FaCamera, FaLinkedin, FaTwitter, FaGlobe, FaTimes } from 'react-icons/fa';
import Loader from '../components/common/Loader';
import Sidebar from '../components/common/Navbar';
import { useAuth } from '../context/AuthContext';

const EditProfilePage = () => {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  
  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    headline: '',
    email: '',
    phone: '',  // Changed from phoneNumber to phone to match API structure
    location: {
      address: '',
      city: '',
      state: '',
      country: '',
      coordinates: [0, 0], // Added coordinates for completeness
    },
    bio: '',  // Changed from about to bio to match API structure
    socialLinks: [], // Changed to array format to match API structure
    skills: []
  });
  
  // Profile picture state
  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState('');
  
  // Skills input state
  const [skillsInput, setSkillsInput] = useState('');
  const [skillsList, setSkillsList] = useState([]);
  
  // Fetch current user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        
        // Get current user info
        const userInfo = await userService.getCurrentUser();
        setCurrentUser(userInfo);
        
        // Initialize form with existing data
        setFormData({
          firstName: userInfo.firstName || '',
          lastName: userInfo.lastName || '',
          headline: userInfo.headline || '',
          email: userInfo.email || '',
          phone: userInfo.phone || '',
          location: {
            address: userInfo.location?.address || '',
            city: userInfo.location?.city || '',
            state: userInfo.location?.state || '',
            country: userInfo.location?.country || '',
            coordinates: userInfo.location?.coordinates || [0, 0],
          },
          bio: userInfo.bio || '',
          socialLinks: userInfo.socialLinks?.length ? userInfo.socialLinks : [],
          skills: []
        });
        
        // Transform social links for the form
        const socialLinksObj = {
          linkedin: '',
          twitter: '',
          website: ''
        };
        
        if (userInfo.socialLinks?.length) {
          userInfo.socialLinks.forEach(link => {
            if (link.url?.includes('linkedin.com')) {
              socialLinksObj.linkedin = link.url;
            } else if (link.url?.includes('twitter.com')) {
              socialLinksObj.twitter = link.url;
            } else {
              socialLinksObj.website = link.url;
            }
          });
        }
        
        // Set skillsList for the UI
        if (userInfo.skills?.length) {
          if (typeof userInfo.skills[0] === 'string') {
            // Handle skills stored as strings/IDs
            setSkillsList(userInfo.skills.map((skill, index) => ({
              id: skill,
              name: `Skill ${index + 1}`
            })));
          } else {
            // Handle skills stored as objects
            setSkillsList(userInfo.skills.map(skill => ({
              id: skill.id || skill._id,
              name: skill.name
            })));
          }
        }
        
        if (userInfo.profileImage) {
          setProfilePicturePreview(userInfo.profileImage);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setLoading(false);
        setFormErrors({
          api: 'Failed to load your profile data. Please try refreshing the page.'
        });
      }
    };
    
    fetchUserData();
  }, []);
  
  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Handle nested objects (location)
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear error for this field if exists
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };
  
  // Handle social link changes
  const handleSocialLinkChange = (type, value) => {
    // Find existing link of this type or create new one
    const updatedLinks = [...formData.socialLinks];
    const existingIndex = updatedLinks.findIndex(link => 
      (type === 'linkedin' && link.url?.includes('linkedin.com')) ||
      (type === 'twitter' && link.url?.includes('twitter.com')) ||
      (type === 'website' && !link.url?.includes('linkedin.com') && !link.url?.includes('twitter.com'))
    );
    
    if (value) {
      // Add or update link
      if (existingIndex >= 0) {
        updatedLinks[existingIndex] = { 
          ...updatedLinks[existingIndex],
          url: value,
          platform: type
        };
      } else {
        updatedLinks.push({
          url: value,
          platform: type,
          isPublic: true
        });
      }
    } else {
      // Remove link if value is empty
      if (existingIndex >= 0) {
        updatedLinks.splice(existingIndex, 1);
      }
    }
    
    setFormData(prev => ({
      ...prev,
      socialLinks: updatedLinks
    }));
    
    // Clear errors
    if (formErrors.socialLinks) {
      setFormErrors(prev => ({
        ...prev,
        socialLinks: {
          ...prev.socialLinks,
          [type]: ''
        }
      }));
    }
  };
  
  // Handle profile picture change
  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setFormErrors(prev => ({
          ...prev,
          profilePicture: 'File size exceeds 5MB limit'
        }));
        return;
      }
      
      setProfilePicture(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicturePreview(reader.result);
      };
      reader.readAsDataURL(file);
      
      // Clear error if exists
      if (formErrors.profilePicture) {
        setFormErrors(prev => ({
          ...prev,
          profilePicture: ''
        }));
      }
    }
  };
  
  // Handle skills input
  const handleSkillsInputChange = (e) => {
    setSkillsInput(e.target.value);
  };
  
  // Add a skill to the list
  const addSkill = () => {
    if (skillsInput.trim()) {
      // Check if already exists
      if (!skillsList.some(skill => skill.name.toLowerCase() === skillsInput.trim().toLowerCase())) {
        const newSkill = {
          id: `temp-${Date.now()}`,
          name: skillsInput.trim()
        };
        
        setSkillsList([...skillsList, newSkill]);
      }
      setSkillsInput('');
    }
  };
  
  // Remove a skill from the list
  const removeSkill = (skillId) => {
    setSkillsList(skillsList.filter(skill => skill.id !== skillId));
  };
  
  // Handle Enter key in skills input
  const handleSkillsKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill();
    }
  };
  
  // Validate form
  const validateForm = () => {
    const errors = {};
    
    if (!formData.firstName.trim()) errors.firstName = 'First name is required';
    if (!formData.lastName.trim()) errors.lastName = 'Last name is required';
    
    // Email validation
    if (formData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        errors.email = 'Please enter a valid email address';
      }
    }
    
    // URL validations for social links
    const urlRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w.-]*)*\/?$/;
    
    formData.socialLinks.forEach(link => {
      if (link.url && !urlRegex.test(link.url)) {
        if (!errors.socialLinks) errors.socialLinks = {};
        errors.socialLinks[link.platform] = 'Please enter a valid URL';
      }
    });
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setSaving(true);
      
      // Prepare data for API
      const profileData = {
        ...formData,
        // Add skills from our UI list
        skills: skillsList.map(skill => skill.name)
      };
      
      // If there's a new profile picture, we need to handle it separately
      if (profilePicture) {
        const formDataWithImage = new FormData();
        
        // Add the profile picture
        formDataWithImage.append('profileImage', profilePicture);
        
        // Add other fields
        Object.entries(profileData).forEach(([key, value]) => {
          // Skip the profilePicture field to avoid conflicts
          if (key === 'profilePicture') return;
          
          if (typeof value === 'object' && value !== null) {
            formDataWithImage.append(key, JSON.stringify(value));
          } else {
            formDataWithImage.append(key, value);
          }
        });
        
        // Use userService to update profile with image
      }
        // If no new profile picture, use the regular update method
        await userService.updateProfile(profileData);
      
      
      setSaving(false);
      
      // Navigate back to profile page
      navigate(`/profile/${currentUser.id || currentUser._id}`);
    } catch (error) {
      console.error('Error updating profile:', error);
      setSaving(false);
      
      // Handle API error
      setFormErrors({
        api: error.message || 'An error occurred while updating your profile. Please try again.'
      });
    }
  };
  
  // Helper to get social link value
  const getSocialLinkValue = (type) => {
    const link = formData.socialLinks.find(link => {
      if (type === 'linkedin') return link.url?.includes('linkedin.com');
      if (type === 'twitter') return link.url?.includes('twitter.com');
      if (type === 'website') return !link.url?.includes('linkedin.com') && !link.url?.includes('twitter.com');
      return false;
    });
    return link?.url || '';
  };
  
  if (loading) {
    return (
      <div className="flex h-screen bg-orange-50">
        <Sidebar user={authUser || {}} />
        <div className="flex-1 overflow-auto">
          <div className="md:pl-0 pl-0 md:pt-0 pt-16 flex justify-center items-center h-64">
            <Loader />
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex h-screen bg-orange-50">
      <Sidebar user={authUser || {}} />
      <div className="flex-1 overflow-auto">
        <div className="md:pl-0 pl-0 md:pt-0 pt-16">
          <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-800">Edit Profile</h1>
              <Link 
                to={`/profile/${currentUser?.id || currentUser?._id || ''}`}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </Link>
            </div>
            
            {formErrors.api && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                {formErrors.api}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Profile Picture Section */}
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Profile Picture</h2>
                  <div className="flex items-center">
                    <div className="relative">
                      <img 
                        src={profilePicturePreview || 'https://via.placeholder.com/128'} 
                        alt="Profile Preview" 
                        className="h-32 w-32 rounded-full object-cover"
                      />
                      <label className="absolute bottom-0 right-0 bg-orange-500 text-white p-2 rounded-full cursor-pointer">
                        <FaCamera />
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={handleProfilePictureChange} 
                          className="hidden"
                        />
                      </label>
                    </div>
                    <div className="ml-6">
                      <p className="text-sm text-gray-600">
                        Upload a clear, professional photo of yourself.
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        JPG, PNG or GIF, max 5MB.
                      </p>
                      {formErrors.profilePicture && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.profilePicture}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Basic Information */}
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                        First Name*
                      </label>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 ${
                          formErrors.firstName ? 'border-red-300' : ''
                        }`}
                      />
                      {formErrors.firstName && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.firstName}</p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                        Last Name*
                      </label>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 ${
                          formErrors.lastName ? 'border-red-300' : ''
                        }`}
                      />
                      {formErrors.lastName && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.lastName}</p>
                      )}
                    </div>
                    
                    <div className="md:col-span-2">
                      <label htmlFor="headline" className="block text-sm font-medium text-gray-700">
                        Professional Headline
                      </label>
                      <input
                        type="text"
                        id="headline"
                        name="headline"
                        value={formData.headline}
                        onChange={handleChange}
                        placeholder="e.g., Full Stack Developer at Tech Company"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        A short description of your professional role or expertise
                      </p>
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        Email Address
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 ${
                          formErrors.email ? 'border-red-300' : ''
                        }`}
                      />
                      {formErrors.email && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Location Information */}
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Location</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label htmlFor="location.address" className="block text-sm font-medium text-gray-700">
                        Address
                      </label>
                      <input
                        type="text"
                        id="location.address"
                        name="location.address"
                        value={formData.location.address}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="location.city" className="block text-sm font-medium text-gray-700">
                        City
                      </label>
                      <input
                        type="text"
                        id="location.city"
                        name="location.city"
                        value={formData.location.city}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="location.state" className="block text-sm font-medium text-gray-700">
                        State/Province
                      </label>
                      <input
                        type="text"
                        id="location.state"
                        name="location.state"
                        value={formData.location.state}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="location.country" className="block text-sm font-medium text-gray-700">
                        Country
                      </label>
                      <input
                        type="text"
                        id="location.country"
                        name="location.country"
                        value={formData.location.country}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* About/Bio */}
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">About</h2>
                  <div>
                    <textarea
                      id="bio"
                      name="bio"
                      rows={6}
                      value={formData.bio}
                      onChange={handleChange}
                      placeholder="Tell us about yourself, your background, expertise, and professional interests..."
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                    />
                  </div>
                </div>
              </div>
              
              {/* Social Links */}
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Social Links</h2>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="linkedin" className="flex items-center text-sm font-medium text-gray-700">
                        <FaLinkedin className="mr-2 text-blue-700" /> LinkedIn Profile
                      </label>
                      <input
                        type="url"
                        id="linkedin"
                        value={getSocialLinkValue('linkedin')}
                        onChange={(e) => handleSocialLinkChange('linkedin', e.target.value)}
                        placeholder="https://linkedin.com/in/your-profile"
                        className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 ${
                          formErrors.socialLinks?.linkedin ? 'border-red-300' : ''
                        }`}
                      />
                      {formErrors.socialLinks?.linkedin && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.socialLinks.linkedin}</p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="twitter" className="flex items-center text-sm font-medium text-gray-700">
                        <FaTwitter className="mr-2 text-blue-400" /> Twitter Profile
                      </label>
                      <input
                        type="url"
                        id="twitter"
                        value={getSocialLinkValue('twitter')}
                        onChange={(e) => handleSocialLinkChange('twitter', e.target.value)}
                        placeholder="https://twitter.com/your-handle"
                        className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 ${
                          formErrors.socialLinks?.twitter ? 'border-red-300' : ''
                        }`}
                      />
                      {formErrors.socialLinks?.twitter && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.socialLinks.twitter}</p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="website" className="flex items-center text-sm font-medium text-gray-700">
                        <FaGlobe className="mr-2 text-gray-600" /> Personal Website
                      </label>
                      <input
                        type="url"
                        id="website"
                        value={getSocialLinkValue('website')}
                        onChange={(e) => handleSocialLinkChange('website', e.target.value)}
                        placeholder="https://your-website.com"
                        className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 ${
                          formErrors.socialLinks?.website ? 'border-red-300' : ''
                        }`}
                      />
                      {formErrors.socialLinks?.website && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.socialLinks.website}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Skills */}
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Skills</h2>
                  
                  {/* Skills input */}
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="flex-grow">
                      <input
                        type="text"
                        id="skillsInput"
                        value={skillsInput}
                        onChange={handleSkillsInputChange}
                        onKeyDown={handleSkillsKeyDown}
                        placeholder="Add a skill (e.g., React, JavaScript, UX Design)"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={addSkill}
                      className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                    >
                      Add
                    </button>
                  </div>
                  
                  {/* Skills list */}
                  {skillsList.length > 0 ? (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {skillsList.map(skill => (
                        <div 
                          key={skill.id} 
                          className="bg-orange-50 rounded-full px-4 py-2 text-gray-700 border border-orange-200 flex items-center"
                        >
                          {skill.name}
                          <button
                            type="button"
                            onClick={() => removeSkill(skill.id)}
                            className="ml-2 text-gray-500 hover:text-red-500"
                          >
                            <FaTimes size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 italic">No skills added yet. Add some skills to showcase your expertise.</p>
                  )}
                  
                  <p className="mt-4 text-xs text-gray-500">
                    List your professional skills, technologies, or areas of expertise
                  </p>
                </div>
              </div>
              
              {/* Submit Buttons */}
              <div className="flex justify-end space-x-4">
                <Link 
                  to={`/profile/${currentUser?.id || currentUser?._id || ''}`}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={saving}
                  className={`px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 ${
                    saving ? 'opacity-75 cursor-not-allowed' : ''
                  }`}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfilePage;