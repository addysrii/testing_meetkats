import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProfileSetup = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Form data state
  const [profileData, setProfileData] = useState({
    headline: user?.headline || '',
    industry: user?.industry || '',
    profilePicture: user?.profilePicture || '',
    skills: user?.skills?.map(s => s.name) || [],
    newSkill: '',
    bio: user?.portfolio?.bio || '',
    workExperience: user?.portfolio?.workExperience || [],
    education: user?.portfolio?.education || []
  });

  // Current work experience being edited
  const [currentWork, setCurrentWork] = useState({
    company: '',
    position: '',
    description: '',
    startDate: '',
    endDate: '',
    current: false
  });

  // Current education being edited
  const [currentEducation, setCurrentEducation] = useState({
    institution: '',
    degree: '',
    field: '',
    startDate: '',
    endDate: '',
    current: false
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handleSkillAdd = () => {
    if (profileData.newSkill.trim() && !profileData.skills.includes(profileData.newSkill.trim())) {
      setProfileData(prev => ({
        ...prev,
        skills: [...prev.skills, prev.newSkill.trim()],
        newSkill: ''
      }));
    }
  };

  const handleSkillRemove = (skillToRemove) => {
    setProfileData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleWorkChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCurrentWork(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleEducationChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCurrentEducation(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleWorkAdd = () => {
    if (currentWork.company && currentWork.position && currentWork.startDate) {
      setProfileData(prev => ({
        ...prev,
        workExperience: [...prev.workExperience, currentWork]
      }));
      setCurrentWork({
        company: '',
        position: '',
        description: '',
        startDate: '',
        endDate: '',
        current: false
      });
    }
  };

  const handleEducationAdd = () => {
    if (currentEducation.institution && currentEducation.degree && currentEducation.startDate) {
      setProfileData(prev => ({
        ...prev,
        education: [...prev.education, currentEducation]
      }));
      setCurrentEducation({
        institution: '',
        degree: '',
        field: '',
        startDate: '',
        endDate: '',
        current: false
      });
    }
  };

  const handleWorkRemove = (index) => {
    setProfileData(prev => ({
      ...prev,
      workExperience: prev.workExperience.filter((_, i) => i !== index)
    }));
  };

  const handleEducationRemove = (index) => {
    setProfileData(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index)
    }));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileData(prev => ({
          ...prev,
          profilePicture: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      // Format skills for API
      const formattedSkills = profileData.skills.map(name => ({ name }));
      
      // Build portfolio data
      const portfolioData = {
        bio: profileData.bio,
        workExperience: profileData.workExperience,
        education: profileData.education
      };

      // Call API to update profile
      await updateUser({
        headline: profileData.headline,
        industry: profileData.industry,
        profilePicture: profileData.profilePicture,
        skills: formattedSkills,
        portfolio: portfolioData
      });

      // Navigate to dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error('Profile setup error:', error);
      setError(
        error.response?.data?.error || 
        'Failed to update profile. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    setCurrentStep(prev => prev + 1);
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  const skipToComplete = () => {
    handleSubmit();
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white shadow-md rounded-lg px-8 pt-6 pb-8 mb-4">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Complete Your Profile</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        
        {/* Progress Bar */}
        <div className="w-full mb-8">
          <div className="flex justify-between mb-1">
            <div 
              className={`flex items-center justify-center w-10 h-10 rounded-full ${currentStep >= 1 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'}`}
            >
              1
            </div>
            <div className="flex-1 h-1 mx-2 my-auto bg-gray-200">
              <div 
                className={`h-full ${currentStep >= 2 ? 'bg-blue-500' : 'bg-gray-200'}`}
                style={{ width: `${currentStep >= 2 ? '100%' : '0%'}` }}
              ></div>
            </div>
            <div 
              className={`flex items-center justify-center w-10 h-10 rounded-full ${currentStep >= 2 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'}`}
            >
              2
            </div>
            <div className="flex-1 h-1 mx-2 my-auto bg-gray-200">
              <div 
                className={`h-full ${currentStep >= 3 ? 'bg-blue-500' : 'bg-gray-200'}`}
                style={{ width: `${currentStep >= 3 ? '100%' : '0%'}` }}
              ></div>
            </div>
            <div 
              className={`flex items-center justify-center w-10 h-10 rounded-full ${currentStep >= 3 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'}`}
            >
              3
            </div>
          </div>
          <div className="flex justify-between text-xs text-gray-600">
            <span>Basic Info</span>
            <span>Experience</span>
            <span>Education</span>
          </div>
        </div>
        
        {/* Step 1: Basic Info */}
        {currentStep === 1 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="profilePicture">
                Profile Picture
              </label>
              <div className="flex items-center">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 mr-4">
                    {profileData.profilePicture ? (
                      <img 
                        src={profileData.profilePicture} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <label htmlFor="upload-photo" className="absolute bottom-0 right-3 bg-white rounded-full p-1 shadow-md cursor-pointer">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                  </label>
                  <input 
                    id="upload-photo" 
                    type="file" 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleFileUpload}
                  />
                </div>
                <div className="flex-1">
                  <p className="text-gray-700 text-sm mb-1">Upload a professional photo</p>
                  <p className="text-gray-500 text-xs">JPG, PNG or GIF, max 5MB</p>
                </div>
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="headline">
                Professional Headline
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="headline"
                name="headline"
                type="text"
                placeholder="e.g. Software Engineer at Tech Company"
                value={profileData.headline}
                onChange={handleChange}
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="industry">
                Industry
              </label>
              <select
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="industry"
                name="industry"
                value={profileData.industry}
                onChange={handleChange}
              >
                <option value="">Select an industry</option>
                <option value="Technology">Technology</option>
                <option value="Finance">Finance</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Education">Education</option>
                <option value="Manufacturing">Manufacturing</option>
                <option value="Retail">Retail</option>
                <option value="Media">Media</option>
                <option value="Entertainment">Entertainment</option>
                <option value="Marketing">Marketing</option>
                <option value="Other">Other</option>
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="bio">
                Bio
              </label>
              <textarea
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="bio"
                name="bio"
                rows="4"
                placeholder="Tell us about yourself"
                value={profileData.bio}
                onChange={handleChange}
              ></textarea>
            </div>
            
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Skills
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {profileData.skills.map((skill, index) => (
                  <div key={index} className="bg-gray-100 rounded-full px-3 py-1 text-sm flex items-center">
                    <span className="mr-1">{skill}</span>
                    <button 
                      type="button" 
                      onClick={() => handleSkillRemove(skill)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
              
              <div className="flex">
                <input
                  className="shadow appearance-none border rounded-l w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  type="text"
                  name="newSkill"
                  placeholder="Add a skill"
                  value={profileData.newSkill}
                  onChange={handleChange}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleSkillAdd())}
                />
                <button
                  type="button"
                  onClick={handleSkillAdd}
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-r focus:outline-none focus:shadow-outline"
                >
                  Add
                </button>
              </div>
            </div>
            
            <div className="flex justify-between">
              <button
                type="button"
                onClick={skipToComplete}
                className="text-blue-500 hover:text-blue-700 font-medium"
              >
                Skip for now
              </button>
              <button
                type="button"
                onClick={nextStep}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Next
              </button>
            </div>
          </div>
        )}
        
        {/* Step 2: Work Experience */}
        {currentStep === 2 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Work Experience</h2>
            
            {profileData.workExperience.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">Added Experience</h3>
                {profileData.workExperience.map((work, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg mb-3 relative">
                    <button
                      type="button"
                      onClick={() => handleWorkRemove(index)}
                      className="absolute top-2 right-2 text-gray-500 hover:text-red-500"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                    <h4 className="font-bold">{work.position}</h4>
                    <p>{work.company}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(work.startDate).toLocaleDateString()} - 
                      {work.current 
                        ? ' Present' 
                        : work.endDate ? ` ${new Date(work.endDate).toLocaleDateString()}` : ''}
                    </p>
                    {work.description && <p className="text-sm mt-1">{work.description}</p>}
                  </div>
                ))}
              </div>
            )}
            
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">Add Work Experience</h3>
              <div className="bg-white border border-gray-200 p-4 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="company">
                      Company
                    </label>
                    <input
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      id="company"
                      name="company"
                      type="text"
                      placeholder="Company name"
                      value={currentWork.company}
                      onChange={handleWorkChange}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="position">
                      Position
                    </label>
                    <input
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      id="position"
                      name="position"
                      type="text"
                      placeholder="Job title"
                      value={currentWork.position}
                      onChange={handleWorkChange}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="startDate">
                      Start Date
                    </label>
                    <input
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      id="startDate"
                      name="startDate"
                      type="date"
                      value={currentWork.startDate}
                      onChange={handleWorkChange}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="endDate">
                      End Date
                    </label>
                    <input
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      id="endDate"
                      name="endDate"
                      type="date"
                      value={currentWork.endDate}
                      onChange={handleWorkChange}
                      disabled={currentWork.current}
                    />
                    
                    <div className="flex items-center mt-2">
                      <input
                        id="current"
                        name="current"
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        checked={currentWork.current}
                        onChange={handleWorkChange}
                      />
                      <label htmlFor="current" className="ml-2 block text-sm text-gray-700">
                        I currently work here
                      </label>
                    </div>
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
                    Description
                  </label>
                  <textarea
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    id="description"
                    name="description"
                    rows="3"
                    placeholder="Describe your role and responsibilities"
                    value={currentWork.description}
                    onChange={handleWorkChange}
                  ></textarea>
                </div>
                
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleWorkAdd}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  >
                    Add Experience
                  </button>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between mt-6">
              <button
                type="button"
                onClick={prevStep}
                className="text-blue-500 hover:text-blue-700 font-medium"
              >
                Back
              </button>
              <div>
                <button
                  type="button"
                  onClick={skipToComplete}
                  className="text-blue-500 hover:text-blue-700 font-medium mr-4"
                >
                  Skip for now
                </button>
                <button
                  type="button"
                  onClick={nextStep}
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Step 3: Education */}
        {currentStep === 3 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Education</h2>
            
            {profileData.education.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">Added Education</h3>
                {profileData.education.map((edu, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg mb-3 relative">
                    <button
                      type="button"
                      onClick={() => handleEducationRemove(index)}
                      className="absolute top-2 right-2 text-gray-500 hover:text-red-500"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                    <h4 className="font-bold">{edu.degree}{edu.field ? `, ${edu.field}` : ''}</h4>
                    <p>{edu.institution}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(edu.startDate).toLocaleDateString()} - 
                      {edu.current 
                        ? ' Present' 
                        : edu.endDate ? ` ${new Date(edu.endDate).toLocaleDateString()}` : ''}
                    </p>
                  </div>
                ))}
              </div>
            )}
            
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">Add Education</h3>
              <div className="bg-white border border-gray-200 p-4 rounded-lg">
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="institution">
                    Institution
                  </label>
                  <input
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    id="institution"
                    name="institution"
                    type="text"
                    placeholder="School or university name"
                    value={currentEducation.institution}
                    onChange={handleEducationChange}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="degree">
                      Degree
                    </label>
                    <input
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      id="degree"
                      name="degree"
                      type="text"
                      placeholder="e.g. Bachelor's, Master's"
                      value={currentEducation.degree}
                      onChange={handleEducationChange}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="field">
                      Field of Study
                    </label>
                    <input
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      id="field"
                      name="field"
                      type="text"
                      placeholder="e.g. Computer Science"
                      value={currentEducation.field}
                      onChange={handleEducationChange}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="startDate">
                      Start Date
                    </label>
                    <input
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      id="startDate"
                      name="startDate"
                      type="date"
                      value={currentEducation.startDate}
                      onChange={handleEducationChange}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="endDate">
                      End Date
                    </label>
                    <input
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      id="endDate"
                      name="endDate"
                      type="date"
                      value={currentEducation.endDate}
                      onChange={handleEducationChange}
                      disabled={currentEducation.current}
                    />
                    
                    <div className="flex items-center mt-2">
                      <input
                        id="current-education"
                        name="current"
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        checked={currentEducation.current}
                        onChange={handleEducationChange}
                      />
                      <label htmlFor="current-education" className="ml-2 block text-sm text-gray-700">
                        I'm currently studying here
                      </label>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleEducationAdd}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  >
                    Add Education
                  </button>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between mt-6">
              <button
                type="button"
                onClick={prevStep}
                className="text-blue-500 hover:text-blue-700 font-medium"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Complete Profile'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileSetup;