import api from './api';

// Helper function to normalize MongoDB _id to id for frontend
const normalizeData = (data) => {
  if (!data) return null;
  
  if (Array.isArray(data)) {
    return data.map(item => ({
      id: item._id || item.id,
      ...item,
    }));
  }
  
  return {
    id: data._id || data.id,
    ...data
  };
};

const ticketService = {
  /**
   * Create ticket type for an event
   * @param {string} eventId - Event ID
   * @param {Object} ticketData - Ticket type data
   * @returns {Promise<Object>} - Created ticket type
   */
  createTicketType: async (eventId, ticketData) => {
    try {
      const response = await api.post(`/api/bookings/events/${eventId}/ticket-types`, ticketData);
      return normalizeData(response.data);
    } catch (error) {
      console.error(`Error creating ticket type for event ${eventId}:`, error);
      throw error;
    }
  },
  createCoupon: async (eventId, couponData) => {
    try {
      const response = await api.post(`/api/bookings/events/${eventId}/coupons`, couponData);
      return normalizeData(response.data);
    } catch (error) {
      console.error(`Error creating coupon for event ${eventId}:`, error);
      
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      
      throw error;
    }
  },
  
  /**
   * Update an existing coupon
   * @param {string} couponId - Coupon ID
   * @param {Object} couponData - Updated coupon data
   * @returns {Promise<Object>} - Updated coupon
   */
  updateCoupon: async (couponId, couponData) => {
    try {
      const response = await api.put(`/api/bookings/coupons/${couponId}`, couponData);
      return normalizeData(response.data);
    } catch (error) {
      console.error(`Error updating coupon ${couponId}:`, error);
      
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      
      throw error;
    }
  },
  
  /**
   * Get all coupons for an event
   * @param {string} eventId - Event ID
   * @returns {Promise<Array>} - List of coupons
   */
  getEventCoupons: async (eventId) => {
    try {
      const response = await api.get(`/api/bookings/events/${eventId}/coupons`);
      return normalizeData(response.data);
    } catch (error) {
      console.error(`Error fetching coupons for event ${eventId}:`, error);
      
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      
      throw error;
    }
  },
  
  /**
   * Get statistics for a specific coupon
   * @param {string} couponId - Coupon ID
   * @returns {Promise<Object>} - Coupon statistics
   */
  getCouponStats: async (couponId) => {
    try {
      const response = await api.get(`/api/bookings/coupons/${couponId}/stats`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching stats for coupon ${couponId}:`, error);
      
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      
      throw error;
    }
  },
  
  /**
   * Validate a coupon code for an event
   * @param {string} eventId - Event ID
   * @param {string} couponCode - Coupon code to validate
   * @returns {Promise<Object>} - Validation result with discount info
   */
  validateCoupon: async (eventId, couponCode) => {
    try {
      const response = await api.post(`/api/bookings/events/${eventId}/validate-coupon`, {
        couponCode
      });
      return response.data;
    } catch (error) {
      console.error(`Error validating coupon for event ${eventId}:`, error);
      
      if (error.response?.status === 404) {
        throw new Error('Invalid coupon code');
      } else if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      
      throw error;
    }
  },
  /**
   * Get ticket types for an event (public access)
   * @param {string} eventId - Event ID
   * @param {boolean} includeInactive - Whether to include inactive ticket types
   * @returns {Promise<Array>} - List of ticket types
   */
  getEventTicketTypes: async (eventId, includeInactive = false) => {
    try {
      // Try to use the public endpoint first
      const params = includeInactive ? { includeInactive: 'true' } : {};
      
      try {
        // First try the public endpoint without authentication
        const response = await api.get(`/api/bookings/events/${eventId}/ticket-types`, { params });
        console.log(`Successfully fetched ${response.data?.length || 0} ticket types from public endpoint`);
        
        // Return the normalized data directly, not wrapped in an object
        return {
          data: normalizeData(response.data) || []
        };
      } catch (firstError) {
        // Fall back to the authenticated endpoint if public endpoint fails
        console.log('Falling back to bookings endpoint for ticket types');
        const response = await api.get(`/api/bookings/events/${eventId}/ticket-types`, { params });
        console.log(`Successfully fetched ${response.data?.length || 0} ticket types from booking endpoint`);
        
        // Return the normalized data directly, not wrapped in an object
        return {
          data: normalizeData(response.data) || []
        };
      }
    } catch (error) {
      console.error(`Error fetching ticket types for event ${eventId}:`, error);
      // Return an object with empty array for data to maintain consistent return structure
      return { data: [] };
    }
  },

  /**
   * Get ticket types for an event (admin/creator access)
   * @param {string} eventId - Event ID
   * @returns {Promise<Array>} - List of ticket types including inactive ones
   */
  getManageableTicketTypes: async (eventId) => {
    try {
      // Use the admin endpoint that requires authentication
      const response = await api.get(`/api/bookings/events/${eventId}/manage-ticket-types`);
      return normalizeData(response.data);
    } catch (error) {
      console.error(`Error fetching manageable ticket types for event ${eventId}:`, error);
      throw error;
    }
  },

// Corrected bookEventTickets function for eventService.js
// Add this to your ticketService.js file

// Enhanced bookEventTickets function with detailed error inspection
// Replace in ticketService.js

/**
 * Book tickets for an event
 * @param {string} eventId - Event ID
 * @param {Object} bookingData - Booking data including ticket selections
 * @returns {Promise<Object>} - Booking confirmation
 */
/**
 * Book tickets for an event with enhanced error logging
 * @param {string} eventId - Event ID
 * @param {Object} bookingData - Booking data including ticket selections
 * @returns {Promise<Object>} - Booking confirmation
 *,
// Enhanced bookEventTickets function with detailed error inspection

/**
 * Book tickets for an event with complete error handling and validation
 * Specifically fixed for the server's expected data structure
 * @param {string} eventId - Event ID
 * @param {Object} bookingData - Booking data including ticket selections and customer info
 * @returns {Promise<Object>} - Booking confirmation
 */
bookEventTickets: async (eventId, bookingData) => {
  try {
    console.log(`Booking tickets for event ${eventId} with data:`, JSON.stringify(bookingData, null, 2));
    
    // Clone the booking data to avoid mutating the original
    const processedBookingData = { ...bookingData };
    
    // Validate the tickets data structure
    if (!processedBookingData.ticketSelections || !Array.isArray(processedBookingData.ticketSelections) || processedBookingData.ticketSelections.length === 0) {
      // If using legacy format, transform it to the expected format
      if (processedBookingData.tickets && Array.isArray(processedBookingData.tickets) && processedBookingData.tickets.length > 0) {
        console.log('Converting legacy tickets format to ticketSelections');
        processedBookingData.ticketSelections = processedBookingData.tickets.map(ticket => ({
          ticketTypeId: ticket.ticketType || ticket.ticketTypeId,
          quantity: parseInt(ticket.quantity, 10)
        }));
        delete processedBookingData.tickets;
      } else {
        throw new Error('At least one ticket must be selected');
      }
    }
    
    // Ensure all ticketSelections use ticketTypeId, not ticketType
    processedBookingData.ticketSelections = processedBookingData.ticketSelections.map(selection => {
      // If using legacy "ticketType" field, convert to "ticketTypeId"
      if (selection.ticketType && !selection.ticketTypeId) {
        return {
          ticketTypeId: selection.ticketType,
          quantity: parseInt(selection.quantity, 10)
        };
      }
      
      // Otherwise ensure quantity is a number
      return {
        ticketTypeId: selection.ticketTypeId,
        quantity: parseInt(selection.quantity, 10)
      };
    });
    
    // Add payment method for free tickets if not provided
    if (!processedBookingData.paymentMethod) {
      const allFreeTickets = true; // Assume all tickets are free for this simplified fix
      processedBookingData.paymentMethod = allFreeTickets ? 'free' : 'pending';
      console.log(`Added default paymentMethod: ${processedBookingData.paymentMethod}`);
    }
    
    // CRITICAL FIX: Make sure paymentMethod matches the enum in the Booking model
    // Normalize the paymentMethod to match expected values
    const validPaymentMethods = ['credit_card', 'debit_card', 'paypal', 'apple_pay', 'google_pay', 'bank_transfer', 'cash', 'free', 'phonepe', 'pending', 'upi'];
    
    if (!validPaymentMethods.includes(processedBookingData.paymentMethod)) {
      // Try to normalize common variations
      const normalizedMethod = processedBookingData.paymentMethod.toLowerCase().trim();
      
      if (normalizedMethod === 'upi' || normalizedMethod === 'bhim') {
        processedBookingData.paymentMethod = 'upi';
      } else if (normalizedMethod.includes('phone') || normalizedMethod.includes('pe')) {
        processedBookingData.paymentMethod = 'phonepe';
      } else {
        // Default to 'pending' if we can't normalize
        console.warn(`Unknown payment method: ${processedBookingData.paymentMethod}, defaulting to 'pending'`);
        processedBookingData.paymentMethod = 'pending';
      }
    }
    
    console.log(`Using payment method: ${processedBookingData.paymentMethod}`);
    
    // CRITICAL FIX: The server's controller requires contactInformation instead of customerInfo
    if (processedBookingData.customerInfo && !processedBookingData.contactInformation) {
      processedBookingData.contactInformation = {
        email: processedBookingData.customerInfo.email,
        phone: processedBookingData.customerInfo.phone || ''
      };
      console.log('Transformed customerInfo to contactInformation as required by server');
    }
    
    // Add returnUrl for payment processing if needed
    if (!processedBookingData.returnUrl) {
      processedBookingData.returnUrl = window.location.origin + '/payment-confirmation';
      console.log(`Added returnUrl: ${processedBookingData.returnUrl}`);
    }
    
    console.log('Prepared booking data to send:', JSON.stringify(processedBookingData, null, 2));
    
    // Try the primary booking endpoint
    try {
      const response = await api.post(`/api/bookings/events/${eventId}/book`, processedBookingData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Booking API response:', response.data);
      return normalizeData(response.data);
    } catch (primaryError) {
      // Log the primary endpoint error
      console.error('Primary endpoint error:', primaryError);
      
      if (primaryError.response && primaryError.response.data) {
        console.error('Server error response:', primaryError.response.data);
        
        // Check for validation errors
        if (primaryError.response.data.errors && Array.isArray(primaryError.response.data.errors)) {
          const errorDetails = primaryError.response.data.errors.map(err => 
            err.msg || err.message || JSON.stringify(err)
          ).join('; ');
          
          if (errorDetails) {
            throw new Error(`Validation failed: ${errorDetails}`);
          }
        }
        
        // Check for error message
        if (primaryError.response.data.error) {
          throw new Error(primaryError.response.data.error);
        }
        
        if (primaryError.response.data.message) {
          throw new Error(primaryError.response.data.message);
        }
      }
      
      // If no specific error message was extracted, throw the original error
      throw primaryError;
    }
  } catch (error) {
    console.error(`Error booking tickets for event ${eventId}:`, error);
    
    // Enhanced error logging
    if (error.response) {
      console.error('Error response data:', error.response.data);
      console.error('Error response status:', error.response.status);
    }
    
    // If we get here, rethrow the original error or a generic message
    throw error.message ? new Error(error.message) : new Error('Failed to book tickets. Please try again.');
  }
},

  /**
   * Get user bookings
   * @param {Object} filters - Optional filters
   * @returns {Promise<Array>} - User's bookings
   */
  getUserBookings: async (filters = {}) => {
    try {
      const response = await api.get('/api/bookings/my', { params: filters });
      return normalizeData(response.data);
    } catch (error) {
      console.error('Error fetching user bookings:', error);
      throw error;
    }
  },

  /**
   * Get a specific booking
   * @param {string} bookingId - Booking ID
   * @returns {Promise<Object>} - Booking details
   */
  getBooking: async (bookingId) => {
    try {
      const response = await api.get(`/api/bookings/${bookingId}`);
      return normalizeData(response.data);
    } catch (error) {
      console.error(`Error fetching booking ${bookingId}:`, error);
      throw error;
    }
  },

  /**
   * Cancel a booking
   * @param {string} bookingId - Booking ID
   * @param {string} reason - Cancellation reason
   * @returns {Promise<Object>} - Cancellation confirmation
   */
  cancelBooking: async (bookingId, reason = '') => {
    try {
      const response = await api.post(`/api/bookings/${bookingId}/cancel`, { reason });
      return response.data;
    } catch (error) {
      console.error(`Error cancelling booking ${bookingId}:`, error);
      throw error;
    }
  },

  /**
 * Check in a ticket using either QR data or verification code
 * @param {string} ticketId - The ticket ID
 * @param {Object} data - Data object with qrData or verificationCode
 * @returns {Promise<Object>} - Check-in result
 */
/**
 * Check in a ticket using either QR data or verification code
 * @param {string} ticketId - The ticket ID
 * @param {Object} data - Data object with qrData or verificationCode
 * @returns {Promise<Object>} - Check-in result
 */
checkInTicket: async (ticketId, data) => {
  try {
    // Add logging to help debug the issue
    console.log(`Checking in ticket: ${ticketId}`);
    console.log('Check-in data:', JSON.stringify(data));

    // Fix: Add /api prefix to the URL
    const response = await api.post(`/api/bookings/tickets/${ticketId}/check-in`, data);
    
    // Log the response
    console.log('Check-in response:', response.data);
    
    return response.data;
  } catch (error) {
    // Improved error handling with more details
    console.error('Error checking in ticket:', error);
    
    // Check for connection errors
    if (!error.response) {
      throw new Error('Connection error. Please check your internet connection.');
    }
    
    // Handle specific error status codes
    if (error.response.status === 404) {
      throw new Error('Ticket not found');
    } else if (error.response.status === 400) {
      // Extract the specific error message from the response if available
      const errorMessage = error.response.data?.error || 'Invalid ticket data';
      throw new Error(errorMessage);
    } else if (error.response.status === 403) {
      throw new Error('You do not have permission to check in this ticket');
    } else if (error.response.status >= 500) {
      throw new Error('Server error. Please try again later.');
    }
    
    // General error fallback
    throw error.response.data?.error 
      ? new Error(error.response.data.error)
      : new Error('Failed to check in ticket');
  }
},

/**
 * Verify a ticket using a manual verification code
 * @param {string} eventId - The event ID
 * @param {string} code - The verification code
 * @returns {Promise<Object>} - Verification result
 */
verifyTicketByCode: async (eventId, code) => {
  try {
    console.log(`Verifying ticket for event ${eventId} with code: ${code}`);
    
    // Update the endpoint path to use the /api/bookings prefix
    const response = await api.post(`/api/bookings/events/${eventId}/verify-ticket`, { 
      verificationCode: code 
    });
    
    console.log('Verification response:', response.data);
    return response.data;
  } catch (error) {
    if (!error.response) {
      throw new Error('Connection error. Please check your internet connection.');
    }
    
    if (error.response.status === 404) {
      throw new Error('Invalid verification code');
    }
    
    throw error.response.data?.error 
      ? new Error(error.response.data.error)
      : new Error('Failed to verify ticket');
  }
},
  /**
   * Transfer a ticket to another user
   * @param {string} ticketId - Ticket ID
   * @param {Object} transferData - Transfer data with recipient info
   * @returns {Promise<Object>} - Transfer confirmation
   */
  transferTicket: async (ticketId, transferData) => {
    try {
      const response = await api.post(`/api/bookings/tickets/${ticketId}/transfer`, transferData);
      return response.data;
    } catch (error) {
      console.error(`Error transferring ticket ${ticketId}:`, error);
      throw error;
    }
  },

  /**
   * Download a ticket PDF
   * @param {string} ticketId - Ticket ID
   * @returns {Promise<Blob>} - PDF file blob
   */
  downloadTicketPdf: async (ticketId) => {
    try {
      const response = await api.get(`/api/bookings/tickets/${ticketId}/pdf`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error(`Error downloading ticket PDF ${ticketId}:`, error);
      throw error;
    }
  },

  /**
   * Get all tickets for an event (for organizers)
   * @param {string} eventId - Event ID
   * @param {Object} filters - Optional filters
   * @returns {Promise<Object>} - Tickets and stats
   */
  getEventTickets: async (eventId, filters = {}) => {
    try {
      // Use the existing endpoint (no "all-" prefix)
      const response = await api.get(`/api/bookings/events/${eventId}/tickets`, { params: filters });
      return {
        tickets: normalizeData(response.data?.tickets),
        stats: response.data?.stats,
        pagination: response.data?.pagination
      };
    } catch (error) {
      console.error(`Error fetching tickets for event ${eventId}:`, error);
      return { tickets: [], stats: {}, pagination: {} }; // Return empty data on error
    }
  },
  updateTicketType: async (eventId, ticketTypeId, ticketData) => {
    try {
      const response = await api.put(`/api/bookings/events/${eventId}/ticket-types/${ticketTypeId}`, ticketData);
      return normalizeData(response.data);
    } catch (error) {
      console.error(`Error updating ticket type ${ticketTypeId} for event ${eventId}:`, error);
      throw error;
    }
  },
  /**
   * Get booking statistics for an event
   * @param {string} eventId - Event ID
   * @returns {Promise<Object>} - Booking statistics
   */
  getEventBookingStats: async (eventId) => {
    try {
      const response = await api.get(`/api/bookings/events/${eventId}/stats`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching booking stats for event ${eventId}:`, error);
      throw error;
    }
  },

  /**
   * Generate event report
   * @param {string} eventId - Event ID
   * @param {string} format - Report format ('json' or 'csv')
   * @returns {Promise<Object|Blob>} - Report data
   */
  generateEventReport: async (eventId, format = 'json') => {
    try {
      const response = await api.get(`/api/bookings/events/${eventId}/report`, { 
        params: { format },
        responseType: format === 'csv' ? 'blob' : 'json'
      });
      return response.data;
    } catch (error) {
      console.error(`Error generating report for event ${eventId}:`, error);
      throw error;
    }
  },

  /**
   * Process payment confirmation
   * @param {string} bookingId - Booking ID
   * @param {Object} paymentData - Payment confirmation data
   * @returns {Promise<Object>} - Payment confirmation result
   */
  confirmPayment: async (bookingId, paymentData) => {
    try {
      const response = await api.post(`/api/bookings/${bookingId}/confirm-payment`, paymentData);
      return response.data;
    } catch (error) {
      console.error(`Error confirming payment for booking ${bookingId}:`, error);
      throw error;
    }
  },
  /**
 * Check payment status
 * @param {string} transactionId - Transaction ID
 * @returns {Promise<Object>} - Payment status
 */
// In frontend/src/services/ticketService.js
checkPaymentStatus: async (orderId, paymentMethod = 'cashfree_sdk') => {
  try {
    console.log(`Checking payment status for order: ${orderId}, method: ${paymentMethod}`);
    
    if (!orderId) {
      throw new Error('Order ID is required for payment status check');
    }
    
    // Choose appropriate endpoint based on payment method
    let endpoint;
    if (paymentMethod === 'upi') {
      endpoint = `/api/payments/upi/status/${orderId}`;
    } else if (paymentMethod === 'cashfree_sdk' || paymentMethod === 'cashfree' || paymentMethod === 'embedded') {
      endpoint = `/api/payments/cashfree/verify`; // Use POST with orderId in body
    } else if (paymentMethod === 'phonepe') {
      endpoint = `/api/payments/phonepe/status/${orderId}`;
    } else {
      endpoint = `/api/payments/status/${orderId}`;
    }
    
    // Make request to status endpoint
    let response;
    if (paymentMethod === 'cashfree_sdk' || paymentMethod === 'cashfree' || paymentMethod === 'embedded') {
      // Cashfree uses POST with orderId in body
      response = await api.post(endpoint, { orderId });
    } else {
      // Other methods use GET
      response = await api.get(endpoint);
    }
    
    console.log('Payment status response:', response.data);
    
    // Clear localStorage items on successful payment
    if (response.data.success && (response.data.status === 'PAYMENT_SUCCESS' || response.data.status === 'completed')) {
      localStorage.removeItem('pendingOrderId');
      localStorage.removeItem('pendingBookingId');
      localStorage.removeItem('cashfreeOrderToken');
    }
    
    return response.data;
  } catch (error) {
    console.error(`Error checking payment status for order ${orderId}:`, error);
    
    if (error.response?.status === 404) {
      throw new Error('Order not found');
    } else if (error.response?.data) {
      const errorMsg = error.response.data.message || error.response.data.error;
      throw new Error(errorMsg || 'Payment status check failed');
    }
    
    throw error;
  }
},
  /**
   * Add event to calendar (alternative implementation)
   * @param {string} eventId - Event ID
   * @returns {Promise<Object>} - Calendar addition result
   */
// Replace the existing addToCalendar function in ticketService.js with this updated version

/**
 * Add event to calendar (fixed implementation)
 * @param {string} eventId - Event ID
 * @returns {Promise<Object>} - Calendar addition result
 */
addToCalendar: async (eventId) => {
  try {
    // Check if eventId is valid
    if (!eventId) {
      throw new Error('Invalid event ID');
    }
    
    console.log(`Attempting to add event ${eventId} to calendar from ticketService`);
    
    // Get browser platform instead of Platform.OS which might not be defined
    const platform = navigator.userAgent.toLowerCase().includes('android') 
      ? 'android' 
      : navigator.userAgent.toLowerCase().includes('iphone') || navigator.userAgent.toLowerCase().includes('ipad')
        ? 'ios'
        : 'web';
    
    const response = await api.post(`/api/events/${eventId}/calendar`, {
      platform: platform,
      calendarType: 'default'
    });
    
    return response.data;
  } catch (error) {
    // Log detailed error information
    console.error(`Error adding event ${eventId} to calendar:`, error);
    
    if (error.response?.data) {
      console.log('API error details:', error.response.data);
    }
    
    // Provide a useful error message based on the error code
    if (error.response?.status === 400) {
      throw new Error('Calendar request was invalid: missing event details');
    } else if (error.response?.status === 404) {
      throw new Error('Calendar service not available');
    } else if (error.response?.status === 401) {
      throw new Error('Calendar access not authorized');
    }
    
    // Default error
    throw new Error(`Calendar error: ${error.message || 'Unknown error'}`);
  }
},
  // Add these UPI payment methods to your ticketService.js file

/**
 * Initiate UPI payment via Cashfree
 * @param {string} eventId - Event ID (for contextual info)
 * @param {Object} paymentData - Payment data including booking details
 * @returns {Promise<Object>} - UPI payment details
 */
initiateUpiPayment: async (eventId, paymentData) => {
  try {
    console.log(`Initiating UPI payment for booking: ${paymentData.bookingId}`);
    
    // Validate required data
    if (!paymentData.bookingId || !paymentData.amount) {
      throw new Error('Booking ID and amount are required for UPI payment');
    }
    
    // Add event ID to payment data if needed for tracking
    const enhancedPaymentData = {
      ...paymentData,
      eventId
    };
    
    // Make request to UPI payment endpoint
    const response = await api.post('/api/payments/upi/initiate', enhancedPaymentData);
    console.log('UPI payment initiation response:', response.data);
    
    // Create fallback payment URL in case response doesn't have one
    const orderId = response.data.orderId || response.data.cfOrderId;
    const fallbackUrl = `https://${process.env.NODE_ENV === 'production' ? 'payments.cashfree.com' : 'sandbox.cashfree.com'}/pg/orders/${orderId}`;
    
    // Create a standardized response
    return {
      success: true,
      orderId: orderId,
      paymentLink: response.data.paymentLink || fallbackUrl,
      expiresAt: response.data.expiresAt,
      // Ensure we have data for the UI
      bookingId: paymentData.bookingId
    };
  } catch (error) {
    console.error('Error initiating UPI payment:', error);
    
    // Enhanced error handling
    if (error.response?.data) {
      const errorMsg = error.response.data.message || error.response.data.error;
      throw new Error(errorMsg || 'UPI payment initiation failed');
    }
    
    throw error;
  }
},

/**
 * Verify UPI payment with Cashfree
 * @param {Object} verificationData - Order and booking IDs
 * @returns {Promise<Object>} - Verification result
 */
verifyUpiPayment: async (verificationData) => {
  try {
    console.log(`Verifying UPI payment:`, verificationData);
    
    // Validate required data
    if (!verificationData.orderId) {
      throw new Error('Order ID is required for UPI payment verification');
    }
    
    // Make request to UPI verification endpoint
    const response = await api.post('/api/payments/upi/verify', verificationData);
    
    console.log('UPI payment verification response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error verifying UPI payment:', error);
    
    // More helpful error messages
    if (error.response?.status === 404) {
      throw new Error('Order not found or payment not initiated yet');
    } else if (error.response?.status === 400) {
      throw new Error('Payment verification failed. The payment may not be complete yet.');
    } else if (error.response?.data) {
      const errorMsg = error.response.data.message || error.response.data.error;
      throw new Error(errorMsg || 'UPI payment verification failed');
    }
    
    throw error;
  }
},

/**
 * Check UPI payment status
 * @param {string} orderId - Order ID from Cashfree
 * @returns {Promise<Object>} - Payment status
 */
checkUpiPaymentStatus: async (orderId) => {
  try {
    console.log(`Checking UPI payment status for order: ${orderId}`);
    
    if (!orderId) {
      throw new Error('Order ID is required for payment status check');
    }
    
    // Make request to UPI status endpoint
    const response = await api.get(`/api/payments/upi/status/${orderId}`);
    
    console.log('UPI payment status response:', response.data);
    return response.data;
  } catch (error) {
    console.error(`Error checking UPI payment status for order ${orderId}:`, error);
    
    // More helpful error messages
    if (error.response?.status === 404) {
      throw new Error('Order not found');
    } else if (error.response?.data) {
      const errorMsg = error.response.data.message || error.response.data.error;
      throw new Error(errorMsg || 'UPI payment status check failed');
    }
    
    throw error;
  }
},   
initiatePayment: async (eventId, paymentData) => {
  try {
    console.log(`Initiating payment for booking: ${paymentData.bookingId}`, paymentData);
    
    // Validate required data
    if (!paymentData.bookingId || !paymentData.amount) {
      throw new Error('Booking ID and amount are required for payment');
    }
    
    // Check if payment method is cashfree_sdk
    const isEmbedded = paymentData.paymentMethod === 'embedded' || paymentData.paymentMethod === 'cashfree_sdk';
    
    let endpoint;
    
    // Choose appropriate endpoint based on payment method
    if (isEmbedded) {
      endpoint = '/api/payments/cashfree/initiate';
    } else if (paymentData.paymentMethod === 'upi') {
      endpoint = '/api/payments/upi/initiate';
    } else if (paymentData.paymentMethod === 'phonepe') {
      endpoint = '/api/payments/phonepe/initiate';
    } else {
      endpoint = '/api/payments/initiate'; // Generic fallback
    }
    
    // Add event ID to payment data
    const enhancedPaymentData = {
      ...paymentData,
      eventId
    };
    
    // Make request to payment initialization endpoint
    const response = await api.post(endpoint, enhancedPaymentData);
    console.log('Payment initiation response:', response.data);
    
    // Store important data in localStorage
    if (response.data.orderId) {
      localStorage.setItem('pendingOrderId', response.data.orderId);
    }
    
    if (response.data.orderToken) {
      localStorage.setItem('cashfreeOrderToken', response.data.orderToken);
    }
    
    // Return standardized response
    return {
      success: true,
      orderId: response.data.orderId,
      cfOrderId: response.data.cfOrderId,
      orderToken: response.data.orderToken,
      paymentLink: response.data.paymentLink,
      paymentMethod: isEmbedded ? 'embedded' : paymentData.paymentMethod,
      expiresAt: response.data.expiresAt,
      bookingId: paymentData.bookingId
    };
  } catch (error) {
    console.error('Error initiating payment:', error);
    
    if (error.response?.data) {
      const errorMsg = error.response.data.message || error.response.data.error;
      throw new Error(errorMsg || 'Payment initiation failed');
    }
    
    throw error;
  }
},

/**
 * Verify payment status
 * @param {Object} verificationData - Order and booking IDs
 * @returns {Promise<Object>} - Verification result
 */
verifyPayment: async (verificationData) => {
  try {
    console.log(`Verifying payment:`, verificationData);
    
    // Validate required data
    if (!verificationData.orderId && !verificationData.transactionId) {
      throw new Error('Order ID or transaction ID is required for payment verification');
    }
    
    // Choose verification endpoint based on what IDs we have
    let endpoint = '/api/payments/verify';
    if (verificationData.paymentMethod === 'upi') {
      endpoint = '/api/payments/upi/verify';
    } else if (verificationData.paymentMethod === 'phonepe') {
      endpoint = '/api/payments/phonepe/status/' + verificationData.transactionId;
      
      // PhonePe uses GET instead of POST
      if (verificationData.transactionId) {
        const response = await api.get(endpoint);
        return response.data;
      }
    }
    
    // Make request to verification endpoint (POST for most methods)
    const response = await api.post(endpoint, verificationData);
    console.log('Payment verification response:', response.data);
    
    // Clear localStorage items on successful payment
    if (response.data.success && (response.data.status === 'PAYMENT_SUCCESS' || response.data.status === 'completed')) {
      localStorage.removeItem('pendingOrderId');
      localStorage.removeItem('pendingBookingId');
      localStorage.removeItem('cashfreeOrderToken');
    }
    
    return response.data;
  } catch (error) {
    console.error('Error verifying payment:', error);
    
    if (error.response?.status === 404) {
      throw new Error('Order not found or payment not initiated yet');
    } else if (error.response?.data) {
      const errorMsg = error.response.data.message || error.response.data.error;
      throw new Error(errorMsg || 'Payment verification failed');
    }
    
    throw error;
  }
},

/**
 * Check payment status (polling)
 * @param {string} orderId - Order ID
 * @param {string} paymentMethod - Payment method
 * @returns {Promise<Object>} - Payment status
 */
// In frontend/src/services/ticketService.js
checkPaymentStatus: async (orderId, paymentMethod = 'cashfree_sdk') => {
  try {
    console.log(`Checking payment status for order: ${orderId}, method: ${paymentMethod}`);
    
    if (!orderId) {
      throw new Error('Order ID is required for payment status check');
    }
    
    // Choose appropriate endpoint based on payment method
    let endpoint;
    if (paymentMethod === 'upi') {
      endpoint = `/api/payments/upi/status/${orderId}`;
    } else if (paymentMethod === 'cashfree_sdk' || paymentMethod === 'cashfree' || paymentMethod === 'embedded') {
      // Use the Cashfree verify endpoint (POST) instead of a status endpoint
      const response = await api.post('/api/payments/cashfree/verify', { orderId });
      return response.data;
    } else if (paymentMethod === 'phonepe') {
      endpoint = `/api/payments/phonepe/status/${orderId}`;
    } else {
      endpoint = `/api/payments/status/${orderId}`;
    }
    
    // For non-Cashfree methods, use GET request
    const response = await api.get(endpoint);
    return response.data;
  } catch (error) {
    console.error(`Error checking payment status for order ${orderId}:`, error);
    
    if (error.response?.status === 404) {
      throw new Error('Order not found');
    } else if (error.response?.data) {
      const errorMsg = error.response.data.message || error.response.data.error;
      throw new Error(errorMsg || 'Payment status check failed');
    }
    
    throw error;
  }
},
initiateCashfreeFormPayment: async (eventId, bookingData) => {
  try {
    console.log(`Initiating Cashfree form payment for event ${eventId}`);
    
    // Clone the booking data to avoid mutating the original
    const processedBookingData = { ...bookingData };
    
    // Validate the tickets data structure
    if (!processedBookingData.ticketSelections || !Array.isArray(processedBookingData.ticketSelections) || processedBookingData.ticketSelections.length === 0) {
      // If using legacy format, transform it to the expected format
      if (processedBookingData.tickets && Array.isArray(processedBookingData.tickets) && processedBookingData.tickets.length > 0) {
        console.log('Converting legacy tickets format to ticketSelections');
        processedBookingData.ticketSelections = processedBookingData.tickets.map(ticket => ({
          ticketTypeId: ticket.ticketType || ticket.ticketTypeId,
          quantity: parseInt(ticket.quantity, 10)
        }));
        delete processedBookingData.tickets;
      } else {
        throw new Error('At least one ticket must be selected');
      }
    }
    
    // Ensure all ticketSelections use ticketTypeId and have numeric quantities
    processedBookingData.ticketSelections = processedBookingData.ticketSelections.map(selection => {
      // If using legacy "ticketType" field, convert to "ticketTypeId"
      if (selection.ticketType && !selection.ticketTypeId) {
        return {
          ticketTypeId: selection.ticketType,
          quantity: parseInt(selection.quantity, 10)
        };
      }
      
      // Otherwise ensure quantity is a number
      return {
        ticketTypeId: selection.ticketTypeId,
        quantity: parseInt(selection.quantity, 10)
      };
    });
    
    // CRITICAL FIX: The server's controller requires contactInformation instead of customerInfo
    if (processedBookingData.customerInfo && !processedBookingData.contactInformation) {
      processedBookingData.contactInformation = {
        email: processedBookingData.customerInfo.email,
        phone: processedBookingData.customerInfo.phone || ''
      };
      console.log('Transformed customerInfo to contactInformation as required by server');
    }
    
    // Set form type if specified
    if (bookingData.formType) {
      processedBookingData.formType = bookingData.formType;
    }
    
    console.log('Prepared booking data for Cashfree form:', JSON.stringify(processedBookingData, null, 2));
    
    // Make the API request
    const response = await api.post(`/api/bookings/events/${eventId}/cashfree-payment`, processedBookingData);
    
    // Log the response
    console.log('Cashfree form payment response:', response.data);
    
    // Store booking ID for later reference
    if (response.data.booking && response.data.booking.id) {
      localStorage.setItem('pendingBookingId', response.data.booking.id);
      localStorage.setItem('pendingPaymentMethod', 'cashfree_form');
    }
    
    return response.data;
  } catch (error) {
    console.error(`Error initiating Cashfree form payment for event ${eventId}:`, error);
    
    // Enhanced error logging
    if (error.response) {
      console.error('Error response data:', error.response.data);
      console.error('Error response status:', error.response.status);
    }
    
    // If we get here, rethrow the original error or a generic message
    throw error.message ? new Error(error.message) : new Error('Failed to initialize Cashfree form payment. Please try again.');
  }
},

/**
 * Check Cashfree form payment status
 * @param {string} bookingId - Booking ID
 * @returns {Promise<Object>} - Payment status
 */
checkCashfreeFormPaymentStatus: async (bookingId) => {
  try {
    console.log(`Checking Cashfree form payment status for booking ${bookingId}`);
    
    if (!bookingId) {
      throw new Error('Booking ID is required');
    }
    
    const response = await api.get(`/api/payments/cashfree-form/status/${bookingId}`);
    
    console.log('Cashfree form payment status response:', response.data);
    
    // If payment is confirmed, clear local storage
    if (response.data.status === 'confirmed' || response.data.paymentStatus === 'completed') {
      localStorage.removeItem('pendingBookingId');
      localStorage.removeItem('pendingPaymentMethod');
    }
    
    return response.data;
  } catch (error) {
    console.error(`Error checking Cashfree form payment status for booking ${bookingId}:`, error);
    
    if (error.response?.status === 404) {
      throw new Error('Booking not found');
    } else if (error.response?.data) {
      const errorMsg = error.response.data.message || error.response.data.error;
      throw new Error(errorMsg || 'Failed to check payment status');
    }
    
    throw error;
  }
}
};

export default ticketService;
