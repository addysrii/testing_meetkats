// src/pages/CustomFormSubmissionsPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import customEventService from '../services/customeventService';
import api from '../services/api'; // Import your API service
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

const CustomFormSubmissionsPage = () => {
  const { eventId } = useParams();
  const { user, token } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [event, setEvent] = useState(null);
  const [form, setForm] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [totalSubmissions, setTotalSubmissions] = useState(0);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [viewingSubmission, setViewingSubmission] = useState(false);
  
  // Pagination and filtering state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [status, setStatus] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('submittedAt');
  const [sortOrder, setSortOrder] = useState('desc');
  
  useEffect(() => {
    const fetchEventAndForm = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // First fetch event details using the API service
        const eventResponse = await api.get(`/api/events/${eventId}`);
        const eventData = eventResponse.data;
        console.log(eventData);
        setEvent(eventData);
        
        // Check if the user is the creator or a host
        const isCreator = eventData.createdBy && eventData.createdBy._id === user.id;
        const isHost = eventData.attendees && eventData.attendees.some(
          a => a.user === user.id && a.role === 'host'
        );
        
        if (!isCreator && !isHost) {
          setError('You do not have permission to view submissions for this event');
          setLoading(false);
          return;
        }
        
        // Check if a form exists
        try {
          const formResponse = await customEventService.getCustomForm(eventId);
          setForm(formResponse);
        } catch (formError) {
          console.error('Form fetch error:', formError);
          setError('No registration form found for this event.');
          setLoading(false);
          return;
        }
        
        // Fetch submissions
        await fetchSubmissions();
      } catch (error) {
        console.error('Error fetching event or form:', error);
        
        // Better error handling
        if (error.response) {
          // Server responded with error status
          const status = error.response.status;
          const message = error.response.data?.error || error.response.data?.message || 'Unknown error';
          
          if (status === 404) {
            setError('Event not found');
          } else if (status === 403) {
            setError('You do not have permission to view this event');
          } else {
            setError(`Error loading event: ${message}`);
          }
        } else if (error.request) {
          // Network error
          setError('Network error. Please check your connection and try again.');
        } else {
          // Other error
          setError('Failed to load event data. Please try again.');
        }
        
        setLoading(false);
      }
    };
    
    if (eventId && user && token) {
      fetchEventAndForm();
    }
  }, [eventId, token, user.id]);
  
  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      
      // Build query params
      const params = { page, limit };
      if (status) params.status = status;
      if (searchQuery) params.search = searchQuery;
      if (sortBy) params.sortBy = sortBy;
      if (sortOrder) params.sortOrder = sortOrder;
      
      const response = await customEventService.getFormSubmissions(eventId, params);
      
      setSubmissions(response.submissions || []);
      setTotalSubmissions(response.pagination?.total || 0);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching submissions:', error);
      setError('Failed to load submissions. Please try again.');
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (event && form) {
      fetchSubmissions();
    }
  }, [page, limit, status, sortBy, sortOrder, eventId]);
  
  const handleStatusChange = (newStatus) => {
    setStatus(newStatus);
    setPage(1); // Reset to first page when changing filters
  };
  
  const handleSort = (field) => {
    if (sortBy === field) {
      // Toggle sort order
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new sort field and default to descending
      setSortBy(field);
      setSortOrder('desc');
    }
  };
  
  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1); // Reset to first page when searching
    fetchSubmissions();
  };
  
  const handleViewSubmission = (submission) => {
    setSelectedSubmission(submission);
    setViewingSubmission(true);
  };
  
  const handleUpdateStatus = async (submissionId, newStatus) => {
    try {
      setLoading(true);
      
      const response = await customEventService.updateSubmissionStatus(
        eventId, 
        submissionId, 
        newStatus, 
        ''  // No review notes for now
      );
      
      setSuccess(response.message || `Submission ${newStatus} successfully`);
      
      // Update the submission in the list
      setSubmissions(prevSubmissions => 
        prevSubmissions.map(s => 
          s._id === submissionId ? { ...s, status: newStatus } : s
        )
      );
      
      // If viewing a submission, update the selected submission too
      if (selectedSubmission && selectedSubmission._id === submissionId) {
        setSelectedSubmission({ ...selectedSubmission, status: newStatus });
      }
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
      
      setLoading(false);
    } catch (error) {
      console.error('Error updating submission status:', error);
      setError('Failed to update submission status. Please try again.');
      setLoading(false);
      
      // Clear error message after 5 seconds
      setTimeout(() => setError(null), 5000);
    }
  };
  
  const renderSubmissionDetails = () => {
    if (!selectedSubmission) return null;
    
    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-full overflow-auto">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Submission Details</h2>
              <button
                onClick={() => setViewingSubmission(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                &times;
              </button>
            </div>
            
            <div className="mb-4 flex items-center">
              <div className="mr-4">
                <img 
                  src={selectedSubmission.user.profileImage || 'https://via.placeholder.com/60'} 
                  alt={selectedSubmission.user.firstName}
                  className="h-16 w-16 rounded-full object-cover"
                />
              </div>
              <div>
                <h3 className="text-lg font-semibold">
                  {selectedSubmission.user.firstName} {selectedSubmission.user.lastName}
                </h3>
                <p className="text-gray-600">@{selectedSubmission.user.username}</p>
                {selectedSubmission.user.email && (
                  <p className="text-gray-600 flex items-center">
                    <span className="mr-1">✉️</span>
                    {selectedSubmission.user.email}
                  </p>
                )}
                {selectedSubmission.user.phone && (
                  <p className="text-gray-600 flex items-center">
                    <span className="mr-1">📱</span>
                    {selectedSubmission.user.phone}
                  </p>
                )}
              </div>
            </div>
            
            <div className="mb-4 flex justify-between items-center">
              <div>
                <span className="text-gray-700">Submitted: </span>
                <span className="font-medium">
                  {new Date(selectedSubmission.submittedAt).toLocaleString()}
                </span>
              </div>
              <div>
                <span className="mr-2">Status:</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  selectedSubmission.status === 'approved' ? 'bg-green-100 text-green-800' :
                  selectedSubmission.status === 'rejected' ? 'bg-red-100 text-red-800' :
                  selectedSubmission.status === 'waitlisted' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {selectedSubmission.status.charAt(0).toUpperCase() + selectedSubmission.status.slice(1)}
                </span>
              </div>
            </div>
            
            {selectedSubmission.reviewedAt && (
              <div className="mb-4 bg-gray-50 p-3 rounded">
                <div className="flex justify-between">
                  <span className="text-gray-700">
                    Reviewed by: {selectedSubmission.reviewedBy?.firstName} {selectedSubmission.reviewedBy?.lastName}
                  </span>
                  <span className="text-gray-700">
                    {new Date(selectedSubmission.reviewedAt).toLocaleString()}
                  </span>
                </div>
                {selectedSubmission.reviewNotes && (
                  <div className="mt-2">
                    <span className="text-gray-700">Notes: </span>
                    <span>{selectedSubmission.reviewNotes}</span>
                  </div>
                )}
              </div>
            )}
            
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-3">Form Responses</h3>
              
              {form && form.sections && selectedSubmission.responses && (
                <div className="space-y-6">
                  {form.sections.map(section => (
                    <div key={section.sectionId} className="border rounded-lg p-4">
                      <h4 className="font-medium mb-2">{section.title}</h4>
                      <div className="space-y-4">
                        {form.fields
                          .filter(field => field.uiConfig && field.uiConfig.section === section.sectionId)
                          .map(field => {
                            const response = selectedSubmission.responses.find(r => r.fieldId === field.fieldId);
                            if (!response) return null;
                            
                            return (
                              <div key={field.fieldId} className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                <div className="font-medium">{field.label}:</div>
                                <div className="md:col-span-2">
                                  {renderFieldValue(field, response)}
                                </div>
                              </div>
                            );
                          })
                        }
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {selectedSubmission.status === 'submitted' && (
              <div className="mt-6 flex justify-end space-x-4">
                <button
                  onClick={() => handleUpdateStatus(selectedSubmission._id, 'approved')}
                  className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded flex items-center"
                  disabled={loading}
                >
                  {loading ? 'Processing...' : '✓ Approve'}
                </button>
                <button
                  onClick={() => handleUpdateStatus(selectedSubmission._id, 'rejected')}
                  className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded flex items-center"
                  disabled={loading}
                >
                  {loading ? 'Processing...' : '✕ Reject'}
                </button>
                <button
                  onClick={() => handleUpdateStatus(selectedSubmission._id, 'waitlisted')}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-4 rounded flex items-center"
                  disabled={loading}
                >
                  {loading ? 'Processing...' : '⏱ Waitlist'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };
  
  const renderFieldValue = (field, response) => {
    if (!response) return <span className="text-gray-500">No response</span>;
    
    switch (field.type) {
      case 'text':
      case 'email':
      case 'number':
      case 'phone':
      case 'date':
      case 'time':
      case 'textarea':
        return <span>{response.value || 'N/A'}</span>;
        
      case 'select':
      case 'radio':
        const option = field.options?.find(o => o.value === response.value);
        return <span>{option ? option.label : response.value}</span>;
        
      case 'checkbox':
      case 'multiselect':
        if (!response.value || !Array.isArray(response.value) || response.value.length === 0) {
          return <span className="text-gray-500">None selected</span>;
        }
        
        return (
          <ul className="list-disc list-inside">
            {response.value.map((value, index) => {
              const option = field.options?.find(o => o.value === value);
              return <li key={index}>{option ? option.label : value}</li>;
            })}
          </ul>
        );
        
      case 'file':
        if (!response.files || !Array.isArray(response.files) || response.files.length === 0) {
          return <span className="text-gray-500">No files uploaded</span>;
        }
        
        return (
          <ul className="space-y-1">
            {response.files.map((file, index) => (
              <li key={index}>
                <a 
                  href={file.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline flex items-center"
                >
                  <span className="mr-1">📄</span>
                  {file.filename || 'File ' + (index + 1)}
                </a>
              </li>
            ))}
          </ul>
        );
        
      default:
        return <span>{JSON.stringify(response.value)}</span>;
    }
  };
  
  if (loading && !event) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
        <Footer />
      </div>
    );
  }
  
  if (error && !event) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
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
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-grow container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Registration Submissions</h1>
            <h2 className="text-gray-600">For event: {event?.name}</h2>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => navigate(`/events/${eventId}/form/create`)}
              className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded text-sm"
            >
              Edit Form
            </button>
            <button
              onClick={() => navigate(`/events/${eventId}`)}
              className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded text-sm"
            >
              Back to Event
            </button>
          </div>
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
        
        <div className="bg-white shadow-md rounded-lg p-6">
          {/* Submission Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-800">Total Submissions</p>
                  <p className="text-2xl font-bold text-blue-800">{totalSubmissions}</p>
                </div>
                <span className="text-blue-500 text-3xl">📝</span>
              </div>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-800">Approved</p>
                  <p className="text-2xl font-bold text-green-800">
                    {submissions.filter(s => s.status === 'approved').length}
                  </p>
                </div>
                <span className="text-green-500 text-3xl">✅</span>
              </div>
            </div>
            
            <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-yellow-800">Pending</p>
                  <p className="text-2xl font-bold text-yellow-800">
                    {submissions.filter(s => s.status === 'submitted').length}
                  </p>
                </div>
                <span className="text-yellow-500 text-3xl">⏱</span>
              </div>
            </div>
            
            <div className="bg-red-50 rounded-lg p-4 border border-red-200">
              <div className="flex items-center justify-between">
              <div>
                  <p className="text-sm text-red-800">Rejected</p>
                  <p className="text-2xl font-bold text-red-800">
                    {submissions.filter(s => s.status === 'rejected').length}
                  </p>
                </div>
                <span className="text-red-500 text-3xl">❌</span>
              </div>
            </div>
          </div>
          
          {/* Filters and Search */}
          <div className="flex flex-col md:flex-row justify-between mb-6">
            <div className="flex space-x-2 mb-4 md:mb-0">
              <button
                onClick={() => handleStatusChange('')}
                className={`px-3 py-1 rounded ${
                  status === '' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                All
              </button>
              <button
                onClick={() => handleStatusChange('submitted')}
                className={`px-3 py-1 rounded ${
                  status === 'submitted' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Pending
              </button>
              <button
                onClick={() => handleStatusChange('approved')}
                className={`px-3 py-1 rounded ${
                  status === 'approved' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Approved
              </button>
              <button
                onClick={() => handleStatusChange('rejected')}
                className={`px-3 py-1 rounded ${
                  status === 'rejected' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Rejected
              </button>
              <button
                onClick={() => handleStatusChange('waitlisted')}
                className={`px-3 py-1 rounded ${
                  status === 'waitlisted' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Waitlisted
              </button>
            </div>
            
            <form onSubmit={handleSearch} className="flex">
              <input
                type="text"
                placeholder="Search name or email..."
                className="shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button
                type="submit"
                className="ml-2 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
              >
                🔍
              </button>
            </form>
          </div>
          
          {/* Submissions Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr className="w-full bg-gray-100 border-b">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      onClick={() => handleSort('user.firstName')}
                      className="flex items-center focus:outline-none"
                    >
                      Attendee
                      {sortBy === 'user.firstName' && (
                        <span className="ml-1">
                          {sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      onClick={() => handleSort('status')}
                      className="flex items-center focus:outline-none"
                    >
                      Status
                      {sortBy === 'status' && (
                        <span className="ml-1">
                          {sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      onClick={() => handleSort('submittedAt')}
                      className="flex items-center focus:outline-none"
                    >
                      Submitted
                      {sortBy === 'submittedAt' && (
                        <span className="ml-1">
                          {sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {submissions.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                      No submissions found
                    </td>
                  </tr>
                ) : (
                  submissions.map((submission) => (
                    <tr key={submission._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <img
                              className="h-10 w-10 rounded-full object-cover"
                              src={submission.user.profileImage || 'https://via.placeholder.com/40'}
                              alt=""
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {submission.user.firstName} {submission.user.lastName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {submission.user.email || '@' + submission.user.username}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          submission.status === 'approved' ? 'bg-green-100 text-green-800' :
                          submission.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          submission.status === 'waitlisted' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(submission.submittedAt).toLocaleDateString()} at {new Date(submission.submittedAt).toLocaleTimeString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleViewSubmission(submission)}
                          className="text-indigo-600 hover:text-indigo-900 mr-3"
                        >
                          👁️ View
                        </button>
                        
                        {submission.status === 'submitted' && (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(submission._id, 'approved')}
                              className="text-green-600 hover:text-green-900 mr-3"
                            >
                              ✓ Approve
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(submission._id, 'rejected')}
                              className="text-red-600 hover:text-red-900"
                            >
                              ✕ Reject
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {totalSubmissions > 0 && (
            <div className="flex items-center justify-between mt-6">
              <div className="flex items-center">
                <span className="text-sm text-gray-700">
                  Showing <span className="font-medium">{(page - 1) * limit + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(page * limit, totalSubmissions)}
                  </span>{' '}
                  of <span className="font-medium">{totalSubmissions}</span> results
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setPage(page > 1 ? page - 1 : 1)}
                  disabled={page <= 1}
                  className={`px-3 py-1 rounded ${
                    page <= 1
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Previous
                </button>
                <div className="px-3 py-1 bg-blue-500 text-white rounded">
                  {page}
                </div>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page * limit >= totalSubmissions}
                  className={`px-3 py-1 rounded ${
                    page * limit >= totalSubmissions
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Modal for viewing submission details */}
      {viewingSubmission && renderSubmissionDetails()}
      
      <Footer />
    </div>
  );
};

export default CustomFormSubmissionsPage;
