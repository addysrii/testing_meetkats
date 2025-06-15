// src/pages/CustomFormCreatorPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import customEventService from '../services/customeventService';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer'; // Updated to common/Footer
import eventService from '../services/eventService';

const CustomFormCreatorPage = () => {
  const { eventId } = useParams();
  const { user, token } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [event, setEvent] = useState(null);
  const [existingForm, setExistingForm] = useState(null);
  
  // Form state
  const [formTitle, setFormTitle] = useState('Registration Form');
  const [formDescription, setFormDescription] = useState('');
  const [formSections, setFormSections] = useState([
    { sectionId: 'section-' + Date.now(), title: 'Basic Information', description: '', order: 0 }
  ]);
  const [formFields, setFormFields] = useState([]);
  const [formSettings, setFormSettings] = useState({
    allowSubmissionAfterStart: true,
    notifyOnSubmission: true,
    autoApprove: true,
    maxSubmissions: null,
    preventDuplicateSubmissions: true
  });
  
  useEffect(() => {
    const fetchEventAndForm = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // First fetch event details to check permissions
        const eventResponse = await eventService.getEvent(eventId);
        
        // Check if we got an error response
        if (eventResponse.error) {
          throw new Error(eventResponse.error);
        }
        
        // Get the event data (normalized by the service)
        const eventData = eventResponse.data;
        
        if (!eventData) {
          throw new Error('Failed to fetch event details');
        }
        
        setEvent(eventData);
        // Check if the user is the creator or a host
        const isCreator = eventData.createdBy && eventData.createdBy._id === user.id;
        console.log("creator", eventData.createdBy._id)
        console.log(user.id)
        const isHost = eventData.attendees && eventData.attendees.some(
          a => a.user === user.id && a.role === 'host'
        );
        
        if (!isCreator && !isHost) {
          setError('You do not have permission to create a custom form for this event');
          setLoading(false);
          return;
        }
        
        // Check if a form already exists
        try {
          const formResponse = await customEventService.getCustomForm(eventId);
          setExistingForm(formResponse);
          
          // Pre-populate form fields if a form exists
          if (formResponse) {
            setFormTitle(formResponse.title || 'Registration Form');
            setFormDescription(formResponse.description || '');
            setFormSections(formResponse.sections && formResponse.sections.length > 0 
              ? formResponse.sections 
              : [{ sectionId: 'section-' + Date.now(), title: 'Basic Information', description: '', order: 0 }]);
            setFormFields(formResponse.fields || []);
            setFormSettings(formResponse.settings || {
              allowSubmissionAfterStart: true,
              notifyOnSubmission: true,
              autoApprove: true,
              preventDuplicateSubmissions: true
            });
          }
        } catch (formError) {
          // It's okay if the form doesn't exist yet
          console.log('No existing form found, creating new one');
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching event or form:', error);
        setError('Failed to load event data. Please try again.');
        setLoading(false);
      }
    };
    
    fetchEventAndForm();
  }, [eventId, token, user.id]);
  
  const handleAddSection = () => {
    const newSection = {
      sectionId: 'section-' + Date.now(),
      title: 'New Section',
      description: '',
      order: formSections.length
    };
    
    setFormSections([...formSections, newSection]);
  };
  
  const handleUpdateSection = (index, field, value) => {
    const updatedSections = [...formSections];
    updatedSections[index] = {
      ...updatedSections[index],
      [field]: value
    };
    setFormSections(updatedSections);
  };
  
  const handleDeleteSection = (index) => {
    // Check if section has fields
    const hasFields = formFields.some(field => 
      field.uiConfig && field.uiConfig.section === formSections[index].sectionId
    );
    
    if (hasFields) {
      if (!window.confirm('This section contains fields. Deleting it will also delete those fields. Continue?')) {
        return;
      }
      
      // Remove fields from this section
      const updatedFields = formFields.filter(field => 
        !field.uiConfig || field.uiConfig.section !== formSections[index].sectionId
      );
      setFormFields(updatedFields);
    }
    
    const updatedSections = formSections.filter((_, i) => i !== index);
    setFormSections(updatedSections);
  };
  
  const handleAddField = (sectionId) => {
    const newField = {
      fieldId: 'field-' + Date.now(),
      label: 'New Field',
      type: 'text',
      placeholder: '',
      required: false,
      uiConfig: {
        width: 'full',
        section: sectionId,
        order: formFields.filter(f => 
          f.uiConfig && f.uiConfig.section === sectionId
        ).length
      }
    };
    
    setFormFields([...formFields, newField]);
  };
  
  const handleUpdateField = (index, field, value) => {
    const updatedFields = [...formFields];
    
    // Special handling for type changes
    if (field === 'type') {
      // Reset field-specific properties when changing type
      const currentType = updatedFields[index].type;
      
      // Remove options from non-choice fields
      if (currentType === 'select' || currentType === 'multiselect' || 
          currentType === 'radio' || currentType === 'checkbox') {
        if (value !== 'select' && value !== 'multiselect' && 
            value !== 'radio' && value !== 'checkbox') {
          delete updatedFields[index].options;
        }
      }
      
      // Add options when changing to choice fields
      if ((value === 'select' || value === 'multiselect' || 
           value === 'radio' || value === 'checkbox') && 
          !updatedFields[index].options) {
        updatedFields[index].options = [
          { label: 'Option 1', value: 'option1' },
          { label: 'Option 2', value: 'option2' }
        ];
      }
      
      // Add fileConfig when changing to file type
      if (value === 'file' && !updatedFields[index].fileConfig) {
        updatedFields[index].fileConfig = {
          maxSize: 5 * 1024 * 1024, // 5MB
          allowedTypes: ['application/pdf', 'image/jpeg', 'image/png'],
          multiple: false
        };
      }
    }
    
    // Handle options update
    if (field.startsWith('option-')) {
      const [, optionIndex, optionField] = field.split('-');
      
      if (!updatedFields[index].options) {
        updatedFields[index].options = [];
      }
      
      if (!updatedFields[index].options[optionIndex]) {
        updatedFields[index].options[optionIndex] = { label: '', value: '' };
      }
      
      updatedFields[index].options[optionIndex][optionField] = value;
    } else {
      // Regular field update
      updatedFields[index] = {
        ...updatedFields[index],
        [field]: value
      };
    }
    
    setFormFields(updatedFields);
  };
  
  const handleAddOption = (fieldIndex) => {
    const updatedFields = [...formFields];
    
    if (!updatedFields[fieldIndex].options) {
      updatedFields[fieldIndex].options = [];
    }
    
    updatedFields[fieldIndex].options.push({
      label: `Option ${updatedFields[fieldIndex].options.length + 1}`,
      value: `option${updatedFields[fieldIndex].options.length + 1}`
    });
    
    setFormFields(updatedFields);
  };
  
  const handleDeleteOption = (fieldIndex, optionIndex) => {
    const updatedFields = [...formFields];
    updatedFields[fieldIndex].options = updatedFields[fieldIndex].options.filter((_, i) => i !== optionIndex);
    setFormFields(updatedFields);
  };
  
  const handleDeleteField = (index) => {
    const updatedFields = formFields.filter((_, i) => i !== index);
    setFormFields(updatedFields);
  };
  
  const handleUpdateSettings = (field, value) => {
    setFormSettings({
      ...formSettings,
      [field]: value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const formData = {
        title: formTitle,
        description: formDescription,
        sections: formSections,
        fields: formFields,
        settings: formSettings
      };
      
      let response;
      
      if (existingForm) {
        // Update existing form
        response = await customEventService.updateCustomForm(eventId, existingForm._id, formData);
        setSuccess('Form updated successfully!');
      } else {
        // Create new form
        response = await customEventService.createCustomForm(eventId, formData);
        setExistingForm(response.form);
        setSuccess('Form created successfully!');
      }
      
      console.log('Form saved:', response);
      
      // Scroll to top to show success message
      window.scrollTo(0, 0);
    } catch (error) {
      console.error('Error saving form:', error);
      setError(error.response?.data?.error || 'Failed to save form. Please try again.');
      
      // Scroll to top to show error message
      window.scrollTo(0, 0);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading && !event) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
        </div>
        <Footer />
      </div>
    );
  }
  
  if (error && !event) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />
        <div className="flex-grow container mx-auto px-4 py-8">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
          <button
            onClick={() => navigate('/events')}
            className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-4 rounded"
          >
            Back to Events
          </button>
        </div>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-orange-50 via-white to-red-50">
      {/* <Navbar /> */}
      <div className="flex-grow container mx-auto px-4 md:px-8 lg:px-24 py-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 bg-white rounded-2xl shadow-sm border border-orange-100 p-6">
          <div className="mb-4 md:mb-0">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-500 bg-clip-text text-transparent">
              Custom Registration Form
            </h1>
            <h2 className="text-gray-600 mt-2 text-lg font-medium">For event: {event?.name}</h2>
          </div>
          <button
            onClick={() => navigate(`/events/${eventId}`)}
            className="group bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 py-3 px-6 rounded-xl font-medium transition-all duration-300 shadow-sm hover:shadow-md transform hover:scale-105 flex items-center space-x-2"
          >
            <svg className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Back to Event</span>
          </button>
        </div>
        
        {/* Alert Messages */}
        {error && (
          <div className="bg-gradient-to-r from-red-50 to-red-100 border-l-4 border-red-400 text-red-700 px-6 py-4 rounded-xl relative mb-6 shadow-sm animate-fadeIn" role="alert">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div>
                <strong className="font-bold">Error: </strong>
                <span className="block sm:inline">{error}</span>
              </div>
            </div>
          </div>
        )}
        
        {success && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-100 border-l-4 border-green-400 text-green-700 px-6 py-4 rounded-xl relative mb-6 shadow-sm animate-fadeIn" role="alert">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div>
                <strong className="font-bold">Success: </strong>
                <span className="block sm:inline">{success}</span>
              </div>
            </div>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="bg-white shadow-xl rounded-2xl border border-orange-100 overflow-hidden">
          {/* Form Title and Description */}
          <div className="bg-gradient-to-r from-orange-500 to-red-500 px-8 py-6">
            <h2 className="text-2xl font-bold text-white mb-2 flex items-center">
              <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Form Settings
            </h2>
          </div>
          
          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="space-y-2">
                <label className="block text-gray-800 text-sm font-semibold mb-2" htmlFor="formTitle">
                  Form Title
                </label>
                <input
                  id="formTitle"
                  type="text"
                  className="w-full px-4 py-3 text-gray-700 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 hover:border-orange-300"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="block text-gray-800 text-sm font-semibold mb-2" htmlFor="formDescription">
                  Form Description
                </label>
                <textarea
                  id="formDescription"
                  className="w-full px-4 py-3 text-gray-700 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 hover:border-orange-300 resize-none"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  rows="3"
                />
              </div>
            </div>
          </div>
          
          {/* Form Settings */}
          <div className="bg-gradient-to-r from-orange-500 to-red-500 px-8 py-6">
            <h2 className="text-2xl font-bold text-white flex items-center">
              <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
              </svg>
              Registration Settings
            </h2>
          </div>
          
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <label className="flex items-center p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border border-orange-100 hover:shadow-md transition-all duration-300 cursor-pointer group">
                  <input
                    id="allowSubmissionAfterStart"
                    type="checkbox"
                    className="h-5 w-5 text-orange-600 focus:ring-orange-500 border-gray-300 rounded transition-all duration-300"
                    checked={formSettings.allowSubmissionAfterStart || false}
                    onChange={(e) => handleUpdateSettings('allowSubmissionAfterStart', e.target.checked)}
                  />
                  <span className="ml-3 text-sm font-medium text-gray-700 group-hover:text-orange-700 transition-colors duration-300">
                    Allow registrations after event starts
                  </span>
                </label>
                
                <label className="flex items-center p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border border-orange-100 hover:shadow-md transition-all duration-300 cursor-pointer group">
                  <input
                    id="notifyOnSubmission"
                    type="checkbox"
                    className="h-5 w-5 text-orange-600 focus:ring-orange-500 border-gray-300 rounded transition-all duration-300"
                    checked={formSettings.notifyOnSubmission || false}
                    onChange={(e) => handleUpdateSettings('notifyOnSubmission', e.target.checked)}
                  />
                  <span className="ml-3 text-sm font-medium text-gray-700 group-hover:text-orange-700 transition-colors duration-300">
                    Notify me when someone registers
                  </span>
                </label>
                
                <label className="flex items-center p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border border-orange-100 hover:shadow-md transition-all duration-300 cursor-pointer group">
                  <input
                    id="autoApprove"
                    type="checkbox"
                    className="h-5 w-5 text-orange-600 focus:ring-orange-500 border-gray-300 rounded transition-all duration-300"
                    checked={formSettings.autoApprove || false}
                    onChange={(e) => handleUpdateSettings('autoApprove', e.target.checked)}
                  />
                  <span className="ml-3 text-sm font-medium text-gray-700 group-hover:text-orange-700 transition-colors duration-300">
                    Auto-approve registrations
                  </span>
                </label>
                
                <label className="flex items-center p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border border-orange-100 hover:shadow-md transition-all duration-300 cursor-pointer group">
                  <input
                    id="preventDuplicateSubmissions"
                    type="checkbox"
                    className="h-5 w-5 text-orange-600 focus:ring-orange-500 border-gray-300 rounded transition-all duration-300"
                    checked={formSettings.preventDuplicateSubmissions || false}
                    onChange={(e) => handleUpdateSettings('preventDuplicateSubmissions', e.target.checked)}
                  />
                  <span className="ml-3 text-sm font-medium text-gray-700 group-hover:text-orange-700 transition-colors duration-300">
                    Prevent duplicate registrations
                  </span>
                </label>
              </div>
              
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border border-orange-100 p-4">
                  <label htmlFor="maxSubmissions" className="block text-sm font-semibold text-gray-800 mb-2">
                    Maximum Registrations
                  </label>
                  <input
                    id="maxSubmissions"
                    type="number"
                    min="0"
                    className="w-full px-4 py-3 text-gray-700 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
                    value={formSettings.maxSubmissions || 0}
                    onChange={(e) => handleUpdateSettings('maxSubmissions', parseInt(e.target.value) || 0)}
                    placeholder="0 = unlimited"
                  />
                  <p className="text-xs text-gray-500 mt-2">Set to 0 for unlimited registrations</p>
                </div>
                
                <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border border-orange-100 p-4">
                  <label htmlFor="submissionDeadline" className="block text-sm font-semibold text-gray-800 mb-2">
                    Registration Deadline
                  </label>
                  <input
                    id="submissionDeadline"
                    type="datetime-local"
                    className="w-full px-4 py-3 text-gray-700 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
                    value={formSettings.submissionDeadline || ''}
                    onChange={(e) => handleUpdateSettings('submissionDeadline', e.target.value)}
                  />
                  <p className="text-xs text-gray-500 mt-2">Optional deadline for registrations</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Form Sections */}
          <div className="bg-gradient-to-r from-orange-500 to-red-500 px-8 py-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white flex items-center">
                <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Form Sections
              </h2>
              <button
                type="button"
                className="group bg-white hover:bg-gray-50 text-orange-600 py-2 px-4 rounded-xl text-sm font-semibold flex items-center space-x-2 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105"
                onClick={handleAddSection}
              >
                <svg className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Add Section</span>
              </button>
            </div>
          </div>
          
          <div className="p-8 space-y-6">
            {formSections.map((section, index) => (
              <div key={section.sectionId} className="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl border border-orange-200 overflow-hidden shadow-lg">
                <div className="bg-gradient-to-r from-orange-100 to-red-100 px-6 py-4 border-b border-orange-200">
                  <div className="flex justify-between items-start">
                    <div className="flex-grow mr-4">
                      <input
                        type="text"
                        className="text-xl font-bold w-full px-4 py-2 bg-white border border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
                        value={section.title}
                        onChange={(e) => handleUpdateSection(index, 'title', e.target.value)}
                        placeholder="Section Title"
                        required
                      />
                    </div>
                    <button
                      type="button"
                      className="group text-gray-500 hover:text-red-500 p-2 rounded-xl hover:bg-white transition-all duration-300"
                      onClick={() => handleDeleteSection(index)}
                      title="Delete Section"
                    >
                      <svg className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                  <div className="mt-3">
                    <input
                      type="text"
                      className="w-full px-4 py-2 bg-white border border-orange-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
                      value={section.description}
                      onChange={(e) => handleUpdateSection(index, 'description', e.target.value)}
                      placeholder="Section Description (optional)"
                    />
                  </div>
                </div>
                
                {/* Fields in this section */}
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-4 text-orange-700 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
                    </svg>
                    Fields in this section
                  </h3>
                  
                  <div className="space-y-4">
                    {formFields.filter(field => 
                      field.uiConfig && field.uiConfig.section === section.sectionId
                    ).map((field, fieldIndex) => {
                      const globalFieldIndex = formFields.findIndex(f => f.fieldId === field.fieldId);
                      return (
                        <div key={field.fieldId} className="bg-white rounded-xl p-6 border border-orange-200 shadow-sm hover:shadow-md transition-all duration-300">
                          <div className="flex justify-between items-center mb-4">
                            <div className="font-semibold text-orange-700 text-lg flex items-center">
                              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              {field.label || 'Unnamed Field'}
                            </div>
                            <button
                              type="button"
                              className="group text-gray-500 hover:text-red-500 p-2 rounded-xl hover:bg-red-50 transition-all duration-300"
                              onClick={() => handleDeleteField(globalFieldIndex)}
                              title="Delete Field"
                            >
                              <svg className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <label className="block text-sm font-semibold text-gray-700">Field Label</label>
                              <input
                                type="text"
                                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
                                value={field.label || ''}
                                onChange={(e) => handleUpdateField(globalFieldIndex, 'label', e.target.value)}
                                placeholder="Field Label"
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="block text-sm font-semibold text-gray-700">Field Type</label>
                              <select
                                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
                                value={field.type}
                                onChange={(e) => handleUpdateField(globalFieldIndex, 'type', e.target.value)}
                              >
                                <option value="text">Text</option>
                                <option value="number">Number</option>
                                <option value="email">Email</option>
                                <option value="date">Date</option>
                                <option value="time">Time</option>
                                <option value="select">Dropdown</option>
                                <option value="multiselect">Multi-select</option>
                                <option value="checkbox">Checkbox</option>
                                <option value="radio">Radio Button</option>
                                <option value="textarea">Text Area</option>
                                <option value="file">File Upload</option>
                                <option value="phone">Phone Number</option>
                              </select>
                            </div>
                            <div className="space-y-2">
                              <label className="block text-sm font-semibold text-gray-700">Placeholder</label>
                              <input
                                type="text"
                                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
                                value={field.placeholder || ''}
                                onChange={(e) => handleUpdateField(globalFieldIndex, 'placeholder', e.target.value)}
                                placeholder="Placeholder text"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="block text-sm font-semibold text-gray-700">Help Text</label>
                              <input
                                type="text"
                                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
                                value={field.helpText || ''}
                                onChange={(e) => handleUpdateField(globalFieldIndex, 'helpText', e.target.value)}
                                placeholder="Help text (optional)"
                              />
                            </div>
                            <div className="flex items-center justify-center">
                              <label className="flex items-center p-3 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border border-orange-100 cursor-pointer group hover:shadow-sm transition-all duration-300">
                                <input
                                  type="checkbox"
                                  className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded transition-all duration-300"
                                  checked={field.required || false}
                                  onChange={(e) => handleUpdateField(globalFieldIndex, 'required', e.target.checked)}
                                  id={`required-${field.fieldId}`}
                                />
                                <span className="ml-2 text-sm font-medium text-gray-700 group-hover:text-orange-700 transition-colors duration-300">
                                  Required field
                                </span>
                              </label>
                            </div>
                            <div className="space-y-2">
                              <label className="block text-sm font-semibold text-gray-700">Width</label>
                              <select
                                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
                                value={(field.uiConfig && field.uiConfig.width) || 'full'}
                                onChange={(e) => {
                                  const updatedUiConfig = { ...(field.uiConfig || {}), width: e.target.value };
                                  handleUpdateField(globalFieldIndex, 'uiConfig', updatedUiConfig);
                                }}
                              >
                                <option value="full">Full Width</option>
                                <option value="half">Half Width</option>
                                <option value="third">One Third</option>
                              </select>
                            </div>
                          </div>
                          
                          {/* Options for select, multiselect, checkbox, radio */}
                          {(field.type === 'select' || field.type === 'multiselect' || 
                           field.type === 'checkbox' || field.type === 'radio') && (
                            <div className="mt-6 p-4 bg-gradient-to-r from-gray-50 to-orange-50 rounded-xl border border-orange-100">
                              <div className="flex justify-between items-center mb-4">
                                <label className="text-sm font-semibold text-gray-700 flex items-center">
                                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                                  </svg>
                                  Options
                                </label>
                                <button
                                  type="button"
                                  className="group bg-orange-100 hover:bg-orange-200 text-orange-700 py-2 px-3 rounded-lg text-xs font-semibold flex items-center space-x-1 transition-all duration-300 shadow-sm hover:shadow-md"
                                  onClick={() => handleAddOption(globalFieldIndex)}
                                >
                                  <svg className="w-3 h-3 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                  </svg>
                                  <span>Add Option</span>
                                </button>
                              </div>
                              <div className="space-y-3">
                                {field.options && field.options.map((option, optionIndex) => (
                                  <div key={`option-${optionIndex}`} className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-200">
                                    <div className="flex-grow grid grid-cols-2 gap-3">
                                      <input
                                        type="text"
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
                                        value={option.label || ''}
                                        onChange={(e) => handleUpdateField(
                                          globalFieldIndex, 
                                          `option-${optionIndex}-label`, 
                                          e.target.value
                                        )}
                                        placeholder="Label"
                                      />
                                      <input
                                        type="text"
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
                                        value={option.value || ''}
                                        onChange={(e) => handleUpdateField(
                                          globalFieldIndex, 
                                          `option-${optionIndex}-value`, 
                                          e.target.value
                                        )}
                                        placeholder="Value"
                                      />
                                    </div>
                                    <button
                                      type="button"
                                      className="group text-gray-500 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition-all duration-300"
                                      onClick={() => handleDeleteOption(globalFieldIndex, optionIndex)}
                                    >
                                      <svg className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                      </svg>
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {/* File upload configuration */}
                          {field.type === 'file' && (
                            <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                              <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center">
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                                File Upload Settings
                              </h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <label className="block text-sm font-medium text-gray-700">Max File Size (bytes)</label>
                                  <input
                                    type="number"
                                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                                    value={(field.fileConfig && field.fileConfig.maxSize) || 5242880}
                                    onChange={(e) => {
                                      const fileConfig = { ...(field.fileConfig || {}), maxSize: parseInt(e.target.value) };
                                      handleUpdateField(globalFieldIndex, 'fileConfig', fileConfig);
                                    }}
                                    placeholder="Max file size in bytes"
                                  />
                                  <p className="text-xs text-gray-500">
                                    {((field.fileConfig?.maxSize || 5242880) / (1024 * 1024)).toFixed(1)} MB
                                  </p>
                                </div>
                                <div className="flex items-center justify-center">
                                  <label className="flex items-center p-3 bg-white rounded-lg border border-blue-200 cursor-pointer group hover:shadow-sm transition-all duration-300">
                                    <input
                                      type="checkbox"
                                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-all duration-300"
                                      checked={(field.fileConfig && field.fileConfig.multiple) || false}
                                      onChange={(e) => {
                                        const fileConfig = { ...(field.fileConfig || {}), multiple: e.target.checked };
                                        handleUpdateField(globalFieldIndex, 'fileConfig', fileConfig);
                                      }}
                                      id={`file-multiple-${field.fieldId}`}
                                    />
                                    <span className="ml-2 text-sm font-medium text-gray-700 group-hover:text-blue-700 transition-colors duration-300">
                                      Allow multiple files
                                    </span>
                                  </label>
                                </div>
                                <div className="col-span-2 space-y-2">
                                  <label className="block text-sm font-medium text-gray-700">Allowed File Types</label>
                                  <input
                                    type="text"
                                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                                    value={(field.fileConfig && field.fileConfig.allowedTypes) ? field.fileConfig.allowedTypes.join(', ') : ''}
                                    onChange={(e) => {
                                      const types = e.target.value.split(',').map(type => type.trim()).filter(Boolean);
                                      const fileConfig = { ...(field.fileConfig || {}), allowedTypes: types };
                                      handleUpdateField(globalFieldIndex, 'fileConfig', fileConfig);
                                    }}
                                    placeholder="application/pdf, image/jpeg, image/png"
                                  />
                                  <p className="text-xs text-gray-500">Comma-separated list of MIME types</p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>  
                      );
                    })}
                    
                    <button
                      type="button"
                      className="group w-full py-4 px-6 border-2 border-dashed border-orange-300 text-orange-600 hover:bg-orange-50 hover:border-orange-400 rounded-xl text-sm font-medium transition-all duration-300 flex items-center justify-center space-x-2"
                      onClick={() => handleAddField(section.sectionId)}
                    >
                      <svg className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      <span>Add a field to this section</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Form Preview placeholder */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-500 px-8 py-6">
            <h2 className="text-2xl font-bold text-white flex items-center">
              <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Form Preview
            </h2>
          </div>
          
          <div className="p-8">
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-dashed border-blue-300 p-8 rounded-2xl text-center">
              <svg className="w-16 h-16 mx-auto text-blue-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Form Preview Coming Soon</h3>
              <p className="text-gray-600">
                You can view your form by navigating to the event page after saving your changes.
              </p>
            </div>
          </div>
          
          {/* Form Actions */}
          <div className="bg-gradient-to-r from-gray-100 to-gray-200 px-8 py-6">
            <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <button
                type="button"
                className="group bg-white hover:bg-gray-50 text-gray-700 font-semibold py-3 px-6 rounded-xl border border-gray-300 transition-all duration-300 shadow-sm hover:shadow-md flex items-center space-x-2"
                onClick={() => navigate(`/events/${eventId}`)}
              >
                <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Cancel</span>
              </button>
              <div className="flex space-x-3">
                <button
                  type="button"
                  className="group bg-white hover:bg-gray-50 text-orange-600 border-2 border-orange-500 font-semibold py-3 px-6 rounded-xl transition-all duration-300 shadow-sm hover:shadow-md flex items-center space-x-2"
                  onClick={() => {
                    if (window.confirm('Are you sure you want to reset all changes?')) {
                      window.location.reload();
                    }
                  }}
                >
                  <svg className="w-4 h-4 group-hover:rotate-180 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Reset</span>
                </button>
                <button
                  type="submit"
                  className="group bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center space-x-2"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin w-5 h-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Save Form</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
      <Footer />
      
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default CustomFormCreatorPage;
