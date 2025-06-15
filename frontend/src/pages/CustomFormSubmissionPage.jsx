// src/pages/CustomFormSubmissionPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import customEventService from '../services/customeventService';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import eventService from '../services/eventService';

const CustomFormSubmissionPage = () => {
  const { eventId } = useParams();
  const { user, token } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [event, setEvent] = useState(null);
  const [form, setForm] = useState(null);
  const [existingSubmission, setExistingSubmission] = useState(null);
  
  // Form response state
  const [responses, setResponses] = useState([]);
  const fileInputRefs = useRef({});
  
// The specific section to fix in CustomFormSubmissionPage.jsx

useEffect(() => {
    const fetchEventAndForm = async () => {
      try {
        // Check if user is authenticated
        if (!user) {
          setError("You must be logged in to access this form.");
          setLoading(false);
          return;
        }
        
        setLoading(true);
        setError(null);
        
        // First fetch event details
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
        
        // Check if the event has already started and passed the registration deadline
        const now = new Date();
        const startDateTime = new Date(eventData.startDateTime);
        
        if (!eventData.settings?.allowSubmissionAfterStart && now > startDateTime) {
          setError('Registration for this event has closed as the event has already started.');
          setLoading(false);
          return;
        }
        
        if (eventData.settings?.submissionDeadline && now > new Date(eventData.settings.submissionDeadline)) {
          setError('Registration for this event has closed as the submission deadline has passed.');
          setLoading(false);
          return;
        }
        
        // Check if the event is full
        if (eventData.settings?.maxSubmissions && 
            eventData.attendeeCounts?.going >= eventData.settings.maxSubmissions) {
          setError('This event has reached its maximum capacity of registrations.');
          setLoading(false);
          return;
        }
        
        // Fetch the form for this event
        try {
          const formResponse = await customEventService.getCustomForm(eventId);
          setForm(formResponse);
          
          // Initialize responses array based on form fields
          if (formResponse && formResponse.fields) {
            const initialResponses = formResponse.fields.map(field => ({
              fieldId: field.fieldId,
              value: field.type === 'checkbox' ? [] : '',
              files: []
            }));
            setResponses(initialResponses);
          }
        } catch (formError) {
          console.error('Form fetch error:', formError);
          setError(formError.response?.data?.error || 'No registration form found for this event.');
          setLoading(false);
          return;
        }
        
        // Check if user has already submitted a response
        try {
          if (user?.id) {
            const submissionResponse = await customEventService.getMySubmission(eventId);
            setExistingSubmission(submissionResponse);
            
            if (submissionResponse && submissionResponse.responses && form) {
              const prefilledResponses = form.fields.map(field => {
                const existingResponse = submissionResponse.responses.find(r => r.fieldId === field.fieldId);
                return {
                  fieldId: field.fieldId,
                  value: existingResponse ? existingResponse.value : (field.type === 'checkbox' ? [] : ''),
                  files: existingResponse?.files || []
                };
              });
              setResponses(prefilledResponses);
            }
          }
        } catch (submissionError) {
          console.log('No existing submission found:', submissionError);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error in fetchEventAndForm:', error);
        setError(error.message || 'Failed to load event data. Please try again.');
        setLoading(false);
      }
    };
    
    fetchEventAndForm();
  }, [eventId, token, user]);
  
  
  const handleCheckboxChange = (fieldId, optionValue, checked) => {
    setResponses(prevResponses => {
      return prevResponses.map(response => {
        if (response.fieldId === fieldId) {
          let newValue = [...(response.value || [])];
          
          if (checked) {
            if (!newValue.includes(optionValue)) {
              newValue.push(optionValue);
            }
          } else {
            newValue = newValue.filter(v => v !== optionValue);
          }
          
          return { ...response, value: newValue };
        }
        return response;
      });
    });
  };
  const handleResponseChange = (fieldId, value) => {
    setResponses(prevResponses => {
      return prevResponses.map(response => {
        if (response.fieldId === fieldId) {
          return { ...response, value };
        }
        return response;
      });
    });
  }; 
  const handleFileUpload = async (fieldId, files) => {
    if (!files || files.length === 0) return;
    
    const field = form.fields.find(f => f.fieldId === fieldId);
    if (!field) return;
    
    // Check if file type is allowed
    if (field.fileConfig && field.fileConfig.allowedTypes && field.fileConfig.allowedTypes.length > 0) {
      for (let i = 0; i < files.length; i++) {
        if (!field.fileConfig.allowedTypes.includes(files[i].type)) {
          setError(`File type ${files[i].type} is not allowed for this field. Allowed types: ${field.fileConfig.allowedTypes.join(', ')}`);
          return;
        }
      }
    }
    
    // Check file size limit
    if (field.fileConfig && field.fileConfig.maxSize) {
      for (let i = 0; i < files.length; i++) {
        if (files[i].size > field.fileConfig.maxSize) {
          setError(`File size exceeds the maximum allowed size of ${(field.fileConfig.maxSize / 1024 / 1024).toFixed(2)} MB`);
          return;
        }
      }
    }
    
    setError(null);
    
    try {
      const uploadedFiles = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Create form data for file upload
        const formData = new FormData();
        formData.append('file', file);
        formData.append('fieldId', fieldId);
        
        try {
          const uploadResult = await customEventService.uploadFormFile(eventId, file, fieldId);
          
          if (uploadResult && uploadResult.file) {
            uploadedFiles.push(uploadResult.file);
          }
        } catch (error) {
          console.error('File upload failed:', error);
          setError(`Failed to upload file: ${file.name}`);
          return;
        }
      }
      
      // Update responses with uploaded files
      setResponses(prevResponses => {
        return prevResponses.map(response => {
          if (response.fieldId === fieldId) {
            return { 
              ...response, 
              files: [...(response.files || []), ...uploadedFiles]
            };
          }
          return response;
        });
      });
    } catch (error) {
      console.error('File upload process failed:', error);
      setError('Failed to upload files. Please try again.');
    }
  };
  
  const handleRemoveFile = (fieldId, fileIndex) => {
    setResponses(prevResponses => {
      return prevResponses.map(response => {
        if (response.fieldId === fieldId) {
          const updatedFiles = [...(response.files || [])];
          updatedFiles.splice(fileIndex, 1);
          return { ...response, files: updatedFiles };
        }
        return response;
      });
    });
  };
  
  const validateResponses = () => {
    if (!form || !form.fields) return false;
    
    let isValid = true;
    let errorMessage = '';
    
    for (const field of form.fields) {
      if (field.required) {
        const response = responses.find(r => r.fieldId === field.fieldId);
        
        if (!response) {
          isValid = false;
          errorMessage = `Missing required field: ${field.label}`;
          break;
        }
        
        switch (field.type) {
          case 'text':
          case 'email':
          case 'number':
          case 'date':
          case 'time':
          case 'textarea':
          case 'phone':
          case 'select':
          case 'radio':
            if (!response.value) {
              isValid = false;
              errorMessage = `Please fill out the required field: ${field.label}`;
            }
            break;
          case 'checkbox':
          case 'multiselect':
            if (!response.value || !Array.isArray(response.value) || response.value.length === 0) {
              isValid = false;
              errorMessage = `Please select at least one option for: ${field.label}`;
            }
            break;
          case 'file':
            if (!response.files || response.files.length === 0) {
              isValid = false;
              errorMessage = `Please upload a file for: ${field.label}`;
            }
            break;
          default:
            break;
        }
        
        if (!isValid) break;
      }
      
      // Additional validation for email fields
      if (field.type === 'email' && responses.value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(response.value)) {
          isValid = false;
          errorMessage = `Please enter a valid email address for: ${field.label}`;
          break;
        }
      }
      
      // Additional validation for phone fields
      if (field.type === 'phone' && responses.value) {
        const phoneRegex = /^\+?[0-9\s\-()]{8,20}$/;
        if (!phoneRegex.test(response.value)) {
          isValid = false;
          errorMessage = `Please enter a valid phone number for: ${field.label}`;
          break;
        }
      }
    }
    
    if (!isValid) {
      setError(errorMessage);
    } else {
      setError(null);
    }
    
    return isValid;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateResponses()) {
      window.scrollTo(0, 0);
      return;
    }
    
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    
    try {
      const submissionData = {
        responses: responses.map(response => ({
          fieldId: response.fieldId,
          value: response.value,
          files: response.files
        }))
      };
      
      const response = await customEventService.submitCustomForm(eventId, submissionData);
      
      setSuccess(response.message || 'Your registration has been submitted successfully!');
      setExistingSubmission(response.submission);
      
      // Scroll to top to show success message
      window.scrollTo(0, 0);
    } catch (error) {
      console.error('Error submitting form:', error);
      setError(error.response?.data?.error || 'Failed to submit registration. Please try again.');
      
      // Scroll to top to show error message
      window.scrollTo(0, 0);
    } finally {
      setSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        {/* <Navbar /> */}
        <div className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
        <Footer />
      </div>
    );
  }
  
  if (error && !form) {
    return (
      <div className="min-h-screen flex flex-col">
        {/* <Navbar /> */}
        <div className="flex-grow container mx-auto px-4 py-8">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
          <button
            onClick={() => navigate(`/events/${eventId}`)}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded"
          >
            Back to Event Details
          </button>
        </div>
        <Footer />
      </div>
    );
  }
  
  if (existingSubmission && form.settings.preventDuplicateSubmissions) {
    return (
      <div className="min-h-screen flex flex-col">
        {/* <Navbar /> */}
        <div className="flex-grow container mx-auto px-4 py-8">
          <div className="bg-white shadow-md rounded-lg p-6 max-w-3xl mx-auto">
            <div className="flex items-center justify-center mb-4">
              <span className="text-green-500 text-5xl">✓</span>
            </div>
            <h1 className="text-2xl font-bold text-center mb-4">Registration Already Submitted</h1>
            <p className="text-center mb-6">
              You have already submitted a registration for this event. Multiple submissions are not allowed.
            </p>
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h2 className="text-lg font-medium mb-2">Your submission status:</h2>
              <div className="flex items-center justify-center">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  existingSubmission.status === 'approved' ? 'bg-green-100 text-green-800' :
                  existingSubmission.status === 'rejected' ? 'bg-red-100 text-red-800' :
                  existingSubmission.status === 'waitlisted' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {existingSubmission.status.charAt(0).toUpperCase() + existingSubmission.status.slice(1)}
                </span>
              </div>
              {existingSubmission.reviewNotes && (
                <div className="mt-4">
                  <h3 className="text-md font-medium">Notes from organizer:</h3>
                  <p className="italic mt-1">{existingSubmission.reviewNotes}</p>
                </div>
              )}
            </div>
            <div className="flex justify-center">
              <button
                onClick={() => navigate(`/events/${eventId}`)}
                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded"
              >
                Back to Event Details
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
  
  // Group fields by section
  const fieldsBySection = {};
  if (form && form.fields) {
    form.fields.forEach(field => {
      const sectionId = field.uiConfig?.section || 'default';
      if (!fieldsBySection[sectionId]) {
        fieldsBySection[sectionId] = [];
      }
      fieldsBySection[sectionId].push(field);
    });
  }
  
  // Sort sections by order
  const sortedSections = [...(form?.sections || [])].sort((a, b) => a.order - b.order);
  
  return (
    <div className="min-h-screen flex flex-col">
      {/* <Navbar /> */}
      <div className="flex-grow container mx-auto px-4 py-8">
        <div className="bg-white shadow-md rounded-lg p-6 max-w-3xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold">{form?.title || 'Registration Form'}</h1>
              <h2 className="text-gray-600">For event: {event?.name}</h2>
            </div>
            <button
              onClick={() => navigate(`/events/${eventId}`)}
              className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded text-sm"
            >
              Back to Event
            </button>
          </div>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          
          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
              <strong className="font-bold">Success: </strong>
              <span className="block sm:inline">{success}</span>
            </div>
          )}
          
          {form?.description && (
            <div className="mb-6">
              <p className="text-gray-700">{form.description}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            {/* Form sections and fields */}
            {sortedSections.map((section) => (
              <div key={section.sectionId} className="mb-8">
                <div className="border-b pb-2 mb-4">
                  <h3 className="text-lg font-semibold">{section.title}</h3>
                  {section.description && (
                    <p className="text-sm text-gray-600 mt-1">{section.description}</p>
                  )}
                </div>
                
                <div className="space-y-4">
                  {fieldsBySection[section.sectionId]?.sort((a, b) => 
                    (a.uiConfig?.order || 0) - (b.uiConfig?.order || 0)
                  ).map((field) => (
                    <FormField
                      key={field.fieldId}
                      field={field}
                      response={responses.find(r => r.fieldId === field.fieldId)}
                      onChange={handleResponseChange}
                      onCheckboxChange={handleCheckboxChange}
                      onFileUpload={handleFileUpload}
                      onRemoveFile={handleRemoveFile}
                      fileInputRef={ref => fileInputRefs.current[field.fieldId] = ref}
                    />
                  ))}
                </div>
              </div>
            ))}
            
            {/* Default section for fields without a section */}
            {fieldsBySection['default']?.length > 0 && (
              <div className="mb-8">
                <div className="border-b pb-2 mb-4">
                  <h3 className="text-lg font-semibold">Additional Information</h3>
                </div>
                
                <div className="space-y-4">
                  {fieldsBySection['default']?.map((field) => (
                    <FormField
                      key={field.fieldId}
                      field={field}
                      response={responses.find(r => r.fieldId === field.fieldId)}
                      onChange={handleResponseChange}
                      onCheckboxChange={handleCheckboxChange}
                      onFileUpload={handleFileUpload}
                      onRemoveFile={handleRemoveFile}
                      fileInputRef={ref => fileInputRefs.current[field.fieldId] = ref}
                    />
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex justify-between mt-8">
              <button
                type="button"
                onClick={() => navigate(`/events/${eventId}`)}
                className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded flex items-center"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  'Submit Registration'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
};

// Form Field Component
const FormField = ({ 
  field, 
  response, 
  onChange, 
  onCheckboxChange, 
  onFileUpload, 
  onRemoveFile,
  fileInputRef
}) => {
  // Set width class based on field config
  const widthClass = field.uiConfig?.width === 'half' ? 'md:w-1/2' : 
                    field.uiConfig?.width === 'third' ? 'md:w-1/3' : 'w-full';
  
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileUpload(field.fieldId, e.target.files);
      // Reset the file input
      e.target.value = '';
    }
  };
  
  return (
    <div className={`mb-4 ${widthClass}`}>
      <label 
        className="block text-gray-700 text-sm font-bold mb-2" 
        htmlFor={field.fieldId}
      >
        {field.label}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {field.helpText && (
        <p className="text-xs text-gray-500 mb-1">{field.helpText}</p>
      )}
      
      {/* Text Input */}
      {field.type === 'text' && (
        <input
          type="text"
          id={field.fieldId}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          placeholder={field.placeholder || ''}
          value={response?.value || ''}
          onChange={(e) => onChange(field.fieldId, e.target.value)}
          required={field.required}
        />
      )}
      
      {/* Email Input */}
      {field.type === 'email' && (
        <input
          type="email"
          id={field.fieldId}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          placeholder={field.placeholder || 'Enter your email address'}
          value={response?.value || ''}
          onChange={(e) => onChange(field.fieldId, e.target.value)}
          required={field.required}
        />
      )}
      
      {/* Number Input */}
      {field.type === 'number' && (
        <input
          type="number"
          id={field.fieldId}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          placeholder={field.placeholder || ''}
          value={response?.value || ''}
          onChange={(e) => onChange(field.fieldId, e.target.value)}
          required={field.required}
        />
      )}
      
      {/* Date Input */}
      {field.type === 'date' && (
        <input
          type="date"
          id={field.fieldId}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          value={response?.value || ''}
          onChange={(e) => onChange(field.fieldId, e.target.value)}
          required={field.required}
        />
      )}
      
      {/* Time Input */}
      {field.type === 'time' && (
        <input
          type="time"
          id={field.fieldId}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          value={response?.value || ''}
          onChange={(e) => onChange(field.fieldId, e.target.value)}
          required={field.required}
        />
      )}
      
      {/* Phone Input */}
      {field.type === 'phone' && (
        <input
          type="tel"
          id={field.fieldId}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          placeholder={field.placeholder || 'Enter your phone number'}
          value={response?.value || ''}
          onChange={(e) => onChange(field.fieldId, e.target.value)}
          required={field.required}
        />
      )}
      
      {/* Textarea */}
      {field.type === 'textarea' && (
        <textarea
          id={field.fieldId}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          placeholder={field.placeholder || ''}
          value={response?.value || ''}
          onChange={(e) => onChange(field.fieldId, e.target.value)}
          required={field.required}
          rows="4"
        />
      )}
      
      {/* Select Dropdown */}
      {field.type === 'select' && (
        <select
          id={field.fieldId}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          value={response?.value || ''}
          onChange={(e) => onChange(field.fieldId, e.target.value)}
          required={field.required}
        >
          <option value="">{field.placeholder || 'Select an option'}</option>
          {field.options?.map((option, index) => (
            <option key={index} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      )}
      
      {/* Multi-select */}
      {field.type === 'multiselect' && (
        <div className="mt-1">
          {field.options?.map((option, index) => (
            <div key={index} className="flex items-center mb-2">
              <input
                type="checkbox"
                id={`${field.fieldId}-${option.value}`}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                checked={(response?.value || []).includes(option.value)}
                onChange={(e) => onCheckboxChange(field.fieldId, option.value, e.target.checked)}
              />
              <label htmlFor={`${field.fieldId}-${option.value}`} className="ml-2 block text-sm text-gray-700">
                {option.label}
              </label>
            </div>
          ))}
        </div>
      )}
      
      {/* Radio Buttons */}
      {field.type === 'radio' && (
        <div className="mt-1">
          {field.options?.map((option, index) => (
            <div key={index} className="flex items-center mb-2">
              <input
                type="radio"
                id={`${field.fieldId}-${option.value}`}
                name={field.fieldId}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                value={option.value}
                checked={response?.value === option.value}
                onChange={(e) => onChange(field.fieldId, e.target.value)}
                required={field.required}
              />
              <label htmlFor={`${field.fieldId}-${option.value}`} className="ml-2 block text-sm text-gray-700">
                {option.label}
              </label>
            </div>
          ))}
        </div>
      )}
      
      {/* Checkboxes */}
      {field.type === 'checkbox' && (
        <div className="mt-1">
          {field.options?.map((option, index) => (
            <div key={index} className="flex items-center mb-2">
              <input
                type="checkbox"
                id={`${field.fieldId}-${option.value}`}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                checked={(response?.value || []).includes(option.value)}
                onChange={(e) => onCheckboxChange(field.fieldId, option.value, e.target.checked)}
              />
              <label htmlFor={`${field.fieldId}-${option.value}`} className="ml-2 block text-sm text-gray-700">
                {option.label}
              </label>
            </div>
          ))}
        </div>
      )}
      
      {/* File Upload */}
      {field.type === 'file' && (
        <div>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
            <div className="space-y-1 text-center">
              <div className="text-gray-400 text-2xl">📁</div>
              <div className="flex text-sm text-gray-600">
                <label
                  htmlFor={field.fieldId}
                  className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                >
                  <span>Upload a file</span>
                  <input
                    id={field.fieldId}
                    name={field.fieldId}
                    type="file"
                    className="sr-only"
                    onChange={handleFileChange}
                    ref={fileInputRef}
                    multiple={field.fileConfig?.multiple || false}
                    accept={field.fileConfig?.allowedTypes?.join(',')}
                    required={field.required && (!response?.files || response.files.length === 0)}
                  />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">
                {field.fileConfig?.allowedTypes?.length > 0
                  ? `Allowed file types: ${field.fileConfig.allowedTypes.map(type => type.split('/')[1]).join(', ')}`
                  : 'Any file type allowed'}
                {field.fileConfig?.maxSize && ` up to ${(field.fileConfig.maxSize / 1024 / 1024).toFixed(2)} MB`}
              </p>
            </div>
          </div>
          
          {/* Uploaded files list */}
          {response?.files && response.files.length > 0 && (
            <div className="mt-3">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Uploaded Files:</h4>
              <ul className="space-y-2">
                {response.files.map((file, index) => (
                  <li key={index} className="flex items-center justify-between bg-gray-100 rounded-md p-2">
                    <div className="flex items-center overflow-hidden">
                      <span className="truncate">{file.filename}</span>
                    </div>
                    <button
                      type="button"
                      className="ml-2 text-red-500 hover:text-red-700"
                      onClick={() => onRemoveFile(field.fieldId, index)}
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CustomFormSubmissionPage;
