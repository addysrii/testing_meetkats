// src/services/eventService.js
import api from './api';
import ticketService from "./ticketService"
/**
 * Event Service - Handles all API requests related to events
 */
const eventService = {
  // Get all events with optional filters
  getEvents: async (filters = {}) => {
    try {
      const response = await api.get('/api/events', { params: filters });
      
      // Handle different response structures
      if (Array.isArray(response.data)) {
        return {
          data: response.data,
          success: true
        };
      }
      
      return {
        data: response.data?.events || response.data || [],
        categories: response.data?.categories || [],
        pagination: response.data?.pagination || {},
        success: true
      };
    } catch (error) {
      console.error('Error fetching events:', error);
      return {
        data: [],
        error: error.message || 'Failed to fetch events',
        success: false
      };
    }
  },
getUserBookings: async (filters = {}) => {
  try {
    console.log('EventService: Getting user bookings with filters:', filters);
    
    // Import ticketService to use its getUserBookings method
  
    
    // Call the ticketService method
    const response = await ticketService.getUserBookings(filters);
    
    console.log('EventService: User bookings response:', response);
    
    // Return the response in a consistent format
    return {
      success: true,
      data: response || []
    };
  } catch (error) {
    console.error('EventService: Error fetching user bookings:', error);
    
    // Return empty array on error to prevent UI crashes
    return {
      success: false,
      data: [],
      error: error.message
    };
  }
},
  // Get a specific event by ID
  getEvent: async (eventId) => {
    try {
      if (!eventId) {
        throw new Error('Invalid event ID');
      }
      
      console.log('Fetching event with ID:', eventId);
      
      // Make the API request with timeout
      const response = await api.get(`/api/events/${eventId}`, {
        timeout: 10000 // 10 second timeout
      });
      
      // If the API returns empty data, handle it gracefully
      if (!response.data) {
        throw new Error('No data received from server');
      }
      
      return {
        data: response.data?.data || response.data,
        success: true
      };
    } catch (error) {
      console.error(`Error fetching event ${eventId}:`, error);
      
      // Provide more detailed error handling
      let errorMessage = 'Failed to load event details';
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        if (error.response.status === 404) {
          errorMessage = 'Event not found';
        } else if (error.response.status === 403) {
          errorMessage = 'You do not have permission to view this event';
        } else if (error.response.data?.error) {
          errorMessage = error.response.data.error;
        }
      } else if (error.request) {
        // The request was made but no response was received
        errorMessage = 'Network error. Please check your connection and try again.';
      }
      
      return {
        data: null,
        error: errorMessage,
        success: false
      };
    }
  },
  getMyEvents: async () => {
    try {
      const response = await api.get('/api/events/my');
      
      return {
        data: response.data || [],
        success: true
      };
    } catch (error) {
      console.error('Error fetching my events:', error);
      return {
        data: [],
        error: error.message || 'Failed to fetch your events',
        success: false
      };
    }
  },
  downloadTicketPdf: async (ticketId) => {
  try {
    console.log('EventService: Downloading ticket PDF:', ticketId);
   
    // Call the ticketService method
    const response = await ticketService.downloadTicketPdf(ticketId);
    
    console.log('EventService: Download ticket PDF response received');
    return response;
  } catch (error) {
    console.error('EventService: Error downloading ticket PDF:', error);
    throw error;
  }
},
  // Create a new event
  createEvent: async (eventData) => {
    try {
      console.log('Creating event with data:', eventData);
      
      // Create a FormData object for sending both JSON data and files
      const formData = new FormData();
      
      // Append all the JSON fields to the FormData - USING THE CORRECT FIELD NAMES
      formData.append('name', eventData.title); // Backend expects 'name' not 'title'
      formData.append('description', eventData.description || '');
      formData.append('startDateTime', new Date(eventData.startDate).toISOString());
      
      if (eventData.endDate) {
        formData.append('endDateTime', new Date(eventData.endDate).toISOString());
      }
      
      formData.append('virtual', eventData.isOnline ? 'true' : 'false');
      formData.append('category', eventData.category || 'other');
      formData.append('visibility', eventData.isPrivate ? 'private' : 'public');
      
      if (eventData.maxAttendees) {
        formData.append('maxAttendees', eventData.maxAttendees.toString());
      }
      
      // Add location if this is not an online event
      if (!eventData.isOnline && eventData.location) {
        formData.append('location[name]', eventData.location);
        
        if (eventData.locationDetails) {
          if (eventData.locationDetails.address)
            formData.append('location[address]', eventData.locationDetails.address);
          if (eventData.locationDetails.city)
            formData.append('location[city]', eventData.locationDetails.city);
          if (eventData.locationDetails.state)
            formData.append('location[state]', eventData.locationDetails.state);
          if (eventData.locationDetails.country)
            formData.append('location[country]', eventData.locationDetails.country);
          if (eventData.locationDetails.postalCode)
            formData.append('location[postalCode]', eventData.locationDetails.postalCode);
        }
      }
      
      // Add custom fields if provided
      if (eventData.customFields && eventData.customFields.length > 0) {
        formData.append('customFields', JSON.stringify(eventData.customFields));
      }
      
      // Add cover image
      if (eventData.coverImage) {
        formData.append('coverImage', eventData.coverImage);
      }
      
      // Make the API request with the FormData
      const response = await api.post('/api/events', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Accept': 'application/json'
        },
        timeout: 60000 // 60 second timeout for upload
      });
      
      return {
        data: response.data,
        success: true
      };
    } catch (error) {
      console.error('Error creating event:', error);
      
      return {
        data: null,
        error: error.message || 'Failed to create event',
        success: false
      };
    }
  },

  // Update an event
  updateEvent: async (eventId, eventData) => {
    try {
      if (!eventId) {
        throw new Error('Invalid event ID');
      }
      
      // Create a FormData object for sending both JSON data and files
      const formData = new FormData();
      
      // Append all available fields to the FormData
      if (eventData.title) formData.append('name', eventData.title);
      if (eventData.description !== undefined) formData.append('description', eventData.description);
      if (eventData.startDate) formData.append('startDateTime', new Date(eventData.startDate).toISOString());
      if (eventData.endDate) formData.append('endDateTime', new Date(eventData.endDate).toISOString());
      if (eventData.isOnline !== undefined) formData.append('virtual', eventData.isOnline ? 'true' : 'false');
      if (eventData.category) formData.append('category', eventData.category);
      if (eventData.isPrivate !== undefined) formData.append('visibility', eventData.isPrivate ? 'private' : 'public');
      if (eventData.maxAttendees) formData.append('maxAttendees', eventData.maxAttendees.toString());
      
      // Add location if provided
      if (eventData.location) {
        formData.append('location[name]', eventData.location);
        
        if (eventData.locationDetails) {
          if (eventData.locationDetails.address)
            formData.append('location[address]', eventData.locationDetails.address);
          if (eventData.locationDetails.city)
            formData.append('location[city]', eventData.locationDetails.city);
          if (eventData.locationDetails.state)
            formData.append('location[state]', eventData.locationDetails.state);
          if (eventData.locationDetails.country)
            formData.append('location[country]', eventData.locationDetails.country);
          if (eventData.locationDetails.postalCode)
            formData.append('location[postalCode]', eventData.locationDetails.postalCode);
        }
      }
      
      // Add custom fields if provided
      if (eventData.customFields && eventData.customFields.length > 0) {
        formData.append('customFields', JSON.stringify(eventData.customFields));
      }
      
      // Add cover image if provided
      if (eventData.coverImage && typeof eventData.coverImage !== 'string') {
        formData.append('coverImage', eventData.coverImage);
      } else if (eventData.coverImageUrl) {
        formData.append('coverImageUrl', eventData.coverImageUrl);
      }
      
      if (eventData.keepExistingImage) {
        formData.append('keepExistingImage', 'true');
      }
      
      // Make the API request with the FormData
      const response = await api.put(`/api/events/${eventId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Accept': 'application/json'
        },
        timeout: 60000 // 60 second timeout for upload
      });
      
      return {
        data: response.data,
        success: true
      };
    } catch (error) {
      console.error(`Error updating event ${eventId}:`, error);
      
      return {
        data: null,
        error: error.message || 'Failed to update event',
        success: false
      };
    }
  },

  // Delete an event
  deleteEvent: async (eventId, deleteSeries = false) => {
    try {
      if (!eventId) {
        throw new Error('Invalid event ID');
      }
      
      const queryParams = deleteSeries ? { deleteSeries: 'true' } : {};
      const response = await api.delete(`/api/events/${eventId}`, { params: queryParams });
      
      return {
        data: response.data,
        success: true
      };
    } catch (error) {
      console.error(`Error deleting event ${eventId}:`, error);
      
      return {
        data: null,
        error: error.message || 'Failed to delete event',
        success: false
      };
    }
  },

  // Respond to an event (going, maybe, declined)
  respondToEvent: async (eventId, status, message = '') => {
    try {
      if (!eventId) {
        throw new Error('Invalid event ID');
      }
      
      if (!status || !['going', 'maybe', 'declined'].includes(status)) {
        throw new Error(`Invalid status: ${status}. Must be 'going', 'maybe', or 'declined'`);
      }
      
      const response = await api.post(`/api/events/${eventId}/respond`, { 
        status, 
        message 
      });
      
      return {
        data: response.data,
        success: true
      };
    } catch (error) {
      console.error(`Error responding to event ${eventId}:`, error);
      
      return {
        data: null,
        error: error.message || 'Failed to update response',
        success: false
      };
    }
  },

  // Get event attendees
  getEventAttendees: async (eventId, filters = {}) => {
    try {
      if (!eventId) {
        throw new Error('Invalid event ID');
      }
      
      const response = await api.get(`/api/events/${eventId}/attendees`, { params: filters });
      
      return {
        going: response.data?.going || [],
        maybe: response.data?.maybe || [],
        declined: response.data?.declined || [],
        pending: response.data?.pending || [],
        invited: response.data?.invited || [],
        hosts: response.data?.hosts || [],
        success: true
      };
    } catch (error) {
      console.error(`Error fetching attendees for event ${eventId}:`, error);
      
      return {
        going: [],
        maybe: [],
        declined: [],
        pending: [],
        invited: [],
        hosts: [],
        error: error.message || 'Failed to fetch attendees',
        success: false
      };
    }
  },

  // Invite users to an event
  inviteToEvent: async (eventId, userIds, message = '', role = 'attendee') => {
    try {
      if (!eventId) {
        throw new Error('Invalid event ID');
      }
      
      if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
        throw new Error('No users specified for invitation');
      }
      
      const response = await api.post(`/api/events/${eventId}/invite`, { 
        userIds, 
        message, 
        role 
      });
      
      return {
        data: response.data,
        success: true
      };
    } catch (error) {
      console.error(`Error inviting users to event ${eventId}:`, error);
      
      return {
        data: null,
        error: error.message || 'Failed to send invitations',
        success: false
      };
    }
  },

  // Get custom form for an event
  getCustomForm: async (eventId) => {
    try {
      if (!eventId) {
        throw new Error('Invalid event ID');
      }
      
      const response = await api.get(`/api/customevent/${eventId}/custom-form`);
      
      return {
        data: response.data,
        success: true
      };
    } catch (error) {
      console.error(`Error fetching custom form for event ${eventId}:`, error);
      
      // For form fetch, we expect 404 if no form exists
      if (error.response && error.response.status === 404) {
        return {
          data: null,
          success: false,
          notFound: true
        };
      }
      
      return {
        data: null,
        error: error.message || 'Failed to fetch custom form',
        success: false
      };
    }
  },

  // Add event to calendar
  addToCalendar: async (eventId) => {
    try {
      if (!eventId) {
        throw new Error('Invalid event ID');
      }
      
      const response = await api.post(`/api/events/${eventId}/calendar`, {
        provider: 'default',
        platform: navigator.userAgent.toLowerCase().includes('mobile') ? 'mobile' : 'web'
      });
      
      return {
        data: response.data,
        success: true
      };
    } catch (error) {
      console.error(`Error adding event ${eventId} to calendar:`, error);
      
      return {
        data: null,
        error: error.message || 'Failed to add to calendar',
        success: false
      };
    }
  },

  // Add comment to an event
  addEventComment: async (eventId, content) => {
    try {
      if (!eventId) {
        throw new Error('Invalid event ID');
      }
      
      if (!content || content.trim().length === 0) {
        throw new Error('Comment content is required');
      }
      
      const response = await api.post(`/api/events/${eventId}/comments`, { content });
      
      return {
        data: response.data,
        success: true
      };
    } catch (error) {
      console.error(`Error adding comment to event ${eventId}:`, error);
      
      return {
        data: null,
        error: error.message || 'Failed to add comment',
        success: false
      };
    }
  },

  // Get event comments
  getEventComments: async (eventId, page = 1, limit = 20) => {
    try {
      if (!eventId) {
        throw new Error('Invalid event ID');
      }
      
      const response = await api.get(`/api/events/${eventId}/comments`, { 
        params: { page, limit } 
      });
      
      return {
        comments: response.data?.comments || [],
        pagination: response.data?.pagination || {},
        success: true
      };
    } catch (error) {
      console.error(`Error fetching comments for event ${eventId}:`, error);
      
      return {
        comments: [],
        pagination: {},
        error: error.message || 'Failed to fetch comments',
        success: false
      };
    }
  },

  // Get event ticket types
  getEventTicketTypes: async (eventId) => {
    try {
      if (!eventId) {
        throw new Error('Invalid event ID');
      }
      
      // Try to use the public endpoint first
      try {
        const response = await api.get(`/api/events/${eventId}/ticket-types`);
        return {
          data: response.data,
          success: true
        };
      } catch (error) {
        // Fall back to booking endpoint if public one fails
        console.log('Falling back to bookings endpoint for ticket types');
        const response = await api.get(`/api/bookings/events/${eventId}/ticket-types`);
        return {
          data: response.data,
          success: true
        };
      }
    } catch (error) {
      console.error(`Error fetching ticket types for event ${eventId}:`, error);
      
      return {
        data: [],
        error: error.message || 'Failed to fetch ticket types',
        success: false
      };
    }
  },

  // Get similar events
  getSimilarEvents: async (eventId, limit = 5) => {
    try {
      if (!eventId) {
        throw new Error('Invalid event ID');
      }
      
      const response = await api.get(`/api/events/${eventId}/similar`, { 
        params: { limit } 
      });
      
      return {
        data: response.data,
        success: true
      };
    } catch (error) {
      console.error(`Error fetching similar events for event ${eventId}:`, error);
      
      return {
        data: [],
        error: error.message || 'Failed to fetch similar events',
        success: false
      };
    }
  }
};

export default eventService;
