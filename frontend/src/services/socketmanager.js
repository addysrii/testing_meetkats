// frontend/src/services/enhancedSocketManager.js
import { io } from 'socket.io-client';

class EnhancedSocketManager {
  constructor() {
    this.socket = null;
    this.eventHandlers = {};
    this.connectionStatus = 'DISCONNECTED';
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.statusListeners = [];
    this.lastMessages = {};
    this.debugMode = process.env.NODE_ENV === 'development';
    this.messageQueue = [];  // For storing messages when offline
    this.messageDeliveryCallbacks = new Map(); // For tracking message delivery
    this.typingTimeouts = {};  // For debouncing typing events
    this.pendingReadReceipts = new Set(); // Track read receipts that need to be sent
  }

  connect(token, url) {
    if (!token) {
      console.error('Cannot connect to Socket.IO: No authentication token provided');
      return;
    }

    // Determine server URL
    const serverUrl = url || this._getDefaultServerUrl();
    
    if (this.debugMode) {
      console.log(`Socket.IO: Connecting to ${serverUrl} with token: ${token.substring(0, 10)}...`);
    }

    // Close existing connection if any
    this._cleanup();

    try {
      // Connect with authentication token
      this.socket = io(serverUrl, {
        auth: { token },
        query: { token },
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 20000,
        transports: ['websocket', 'polling']
      });

      // Setup event handlers
      this._setupEventHandlers();

      return this.socket;
    } catch (error) {
      console.error('Socket.IO: Connection error', error);
      this._updateStatus('ERROR');
      return null;
    }
  }

  _getDefaultServerUrl() {
    // Use environment variable if available
    if (window.env && window.env.SOCKET_URL) {
      return window.env.SOCKET_URL;
    }
    
    // Try to use the current API URL without the path
    try {
      // Get the base URL from your API
      const apiBase = "https://myapp-nt8s.onrender.com"; // Replace with your actual API base URL
      return apiBase;
    } catch (e) {
      console.error('Error constructing socket URL:', e);
    }

    // Otherwise construct from window location
    const protocol = window.location.protocol === 'https:' ? 'https' : 'http';
    const host = window.location.hostname || 'localhost';
    const port = window.location.hostname === 'localhost' ? '3000' : '';
    
    return `${protocol}://${host}${port ? `:${port}` : ''}`;
  }

  _setupEventHandlers() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Socket.IO: Connected successfully with ID:', this.socket.id);
      this._updateStatus('CONNECTED');
      this.reconnectAttempts = 0;
      
      // Re-register all event handlers
      Object.entries(this.eventHandlers).forEach(([event, handlers]) => {
        handlers.forEach(handler => {
          if (typeof handler._rawHandler === 'function') {
            // Use the raw handler function directly with socket.on
            this.socket.on(event, handler._rawHandler);
          }
        });
      });
      
      // Request initial data from server
      this.emit('client_ready', { timestamp: new Date().toISOString() });
      
      // Process any queued messages
      this._processQueuedMessages();
      
      // Send any pending read receipts
      this._processPendingReadReceipts();
    });

    this.socket.on('connect_error', (error) => {
      this.reconnectAttempts++;
      this._updateStatus('ERROR');
      
      console.error(`Socket.IO: Connection error (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`, error.message);
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('Socket.IO: Maximum reconnection attempts reached');
      }
    });

    this.socket.on('disconnect', (reason) => {
      this._updateStatus('DISCONNECTED');
      console.log(`Socket.IO: Disconnected (${reason})`);
    });

    // Setup delivery confirmations
    this.socket.on('message_delivered', (data) => {
      if (this.debugMode) {
        console.log('Socket.IO: Message delivery confirmation received', data);
      }
      
      const { messageId, status } = data;
      
      // Call any registered delivery callbacks
      if (this.messageDeliveryCallbacks.has(messageId)) {
        this.messageDeliveryCallbacks.get(messageId)(status);
        this.messageDeliveryCallbacks.delete(messageId);
      }
    });

    // Debug events in development mode
    if (this.debugMode) {
      this.socket.onAny((event, ...args) => {
        console.log(`Socket.IO [Event]: ${event}`, args);
      });
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this._updateStatus('DISCONNECTED');
    }
  }

  _cleanup() {
    if (this.socket) {
      this.socket.off();
      this.socket.disconnect();
      this.socket = null;
    }
  }

  _updateStatus(status) {
    this.connectionStatus = status;
    
    // Notify all status listeners
    this.statusListeners.forEach(listener => {
      try {
        listener(status);
      } catch (error) {
        console.error('Socket.IO: Error in status listener', error);
      }
    });
  }

  // Process messages that were queued while offline
  _processQueuedMessages() {
    if (this.messageQueue.length > 0 && this.connectionStatus === 'CONNECTED') {
      console.log(`Socket.IO: Processing ${this.messageQueue.length} queued messages`);
      
      // Process each queued message
      while (this.messageQueue.length > 0) {
        const { event, data, resolve, reject } = this.messageQueue.shift();
        
        try {
          this.socket.emit(event, data, (response) => {
            if (response && response.error) {
              reject && reject(new Error(response.error));
            } else {
              resolve && resolve(response);
            }
          });
        } catch (error) {
          console.error(`Socket.IO: Error sending queued message (${event})`, error);
          reject && reject(error);
        }
      }
    }
  }

  // Process pending read receipts
  _processPendingReadReceipts() {
    if (this.pendingReadReceipts.size > 0 && this.connectionStatus === 'CONNECTED') {
      console.log(`Socket.IO: Processing ${this.pendingReadReceipts.size} pending read receipts`);
      
      // Process each pending read receipt
      for (const data of this.pendingReadReceipts) {
        try {
          this.socket.emit('read_message', data);
        } catch (error) {
          console.error('Socket.IO: Error sending pending read receipt', error);
        }
      }
      
      // Clear the pending read receipts
      this.pendingReadReceipts.clear();
    }
  }

  // Register an event handler with improved error handling
  on(event, handler) {
    if (!this.eventHandlers[event]) {
      this.eventHandlers[event] = [];
    }
    
    // Create a wrapper function that will update lastMessages and call the handler
    const wrappedHandler = (data) => {
      try {
        if (this.debugMode) {
          console.log(`Socket.IO: Event ${event} received`, data);
        }
        this.lastMessages[event] = data;
        handler(data);
      } catch (error) {
        console.error(`Socket.IO: Error in event handler for ${event}`, error);
      }
    };
    
    // Store the original handler for reconnection
    wrappedHandler._rawHandler = wrappedHandler;
    
    // Add to our handlers list
    this.eventHandlers[event].push(wrappedHandler);
    
    // If socket exists, register with the socket
    if (this.socket) {
      if (this.debugMode) {
        console.log(`Socket.IO: Registering handler for ${event}`);
      }
      this.socket.on(event, wrappedHandler);
    }
    
    // Return unsubscribe function
    return () => this.off(event, wrappedHandler);
  }

  // Register a handler that directly uses socket.io's API
  rawOn(event, handler) {
    if (this.socket) {
      if (this.debugMode) {
        console.log(`Socket.IO: Directly registering raw handler for ${event}`);
      }
      this.socket.on(event, handler);
      
      // Return function to remove listener
      return () => {
        if (this.socket) {
          this.socket.off(event, handler);
        }
      };
    }
    
    return () => {}; // No-op if no socket
  }

  // Remove an event handler
  off(event, handler) {
    if (!this.eventHandlers[event]) {
      return;
    }
    
    // Remove from our handler list
    this.eventHandlers[event] = this.eventHandlers[event].filter(h => h !== handler);
    
    // Remove from socket if it exists
    if (this.socket) {
      this.socket.off(event, handler._rawHandler || handler);
    }
  }

  // Emit an event with improved offline handling and delivery confirmation
  emit(event, data, options = {}) {
    const { waitForDelivery = false, timeout = 10000 } = options;
    
    return new Promise((resolve, reject) => {
      if (!this.socket || !this.socket.connected) {
        if (this.debugMode) {
          console.warn(`Socket.IO: Cannot emit "${event}" - not connected, queueing message`);
        }
        
        // Add message to queue if it's important
        if (event === 'send_message' || event === 'read_message') {
          this.messageQueue.push({ event, data, resolve, reject });
        } else {
          reject(new Error('Socket not connected'));
        }
        
        return;
      }
      
      try {
        if (this.debugMode) {
          console.log(`Socket.IO: Emitting event ${event}`, data);
        }
        
        // For messages that need delivery confirmation
        if (waitForDelivery && data.messageId) {
          const messageId = data.messageId;
          
          // Set up timeout for delivery confirmation
          const timeoutId = setTimeout(() => {
            if (this.messageDeliveryCallbacks.has(messageId)) {
              this.messageDeliveryCallbacks.delete(messageId);
              reject(new Error('Message delivery confirmation timeout'));
            }
          }, timeout);
          
          // Set up delivery callback
          this.messageDeliveryCallbacks.set(messageId, (status) => {
            clearTimeout(timeoutId);
            if (status === 'delivered') {
              resolve(status);
            } else {
              reject(new Error(`Message delivery failed: ${status}`));
            }
          });
        }
        
        // Emit the event
        this.socket.emit(event, data, (response) => {
          if (!waitForDelivery) {
            if (response && response.error) {
              reject(new Error(response.error));
            } else {
              resolve(response);
            }
          }
        });
      } catch (error) {
        console.error(`Socket.IO: Error emitting "${event}"`, error);
        reject(error);
      }
    });
  }

  // Subscribe to status changes
  onStatusChange(listener) {
    this.statusListeners.push(listener);
    
    // Call immediately with current status
    listener(this.connectionStatus);
    
    // Return unsubscribe function
    return () => {
      this.statusListeners = this.statusListeners.filter(l => l !== listener);
    };
  }

  // Join a chat room with confirmation
  joinChat(chatId) {
    if (this.debugMode) {
      console.log(`Socket.IO: Joining chat ${chatId}`);
    }
    return this.emit('join_chat', { chatId });
  }
  
  // Leave a chat room with confirmation
  leaveChat(chatId) {
    if (this.debugMode) {
      console.log(`Socket.IO: Leaving chat ${chatId}`);
    }
    return this.emit('leave_chat', { chatId });
  }
  
  // Send a new message with delivery confirmation
  sendMessage(chatId, message) {
    // Generate a client-side ID to track this message
    const clientMessageId = `client_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const enhancedMessage = { 
      ...message, 
      chatId,
      clientMessageId,
      sentAt: new Date().toISOString()
    };
    
    return this.emit('send_message', enhancedMessage, { waitForDelivery: true });
  }
  
  // Mark a message as read with improved offline handling
  markMessageRead(messageId, chatId) {
    const data = { messageId, chatId };
    
    // Store in pending read receipts if offline
    if (!this.isConnected()) {
      this.pendingReadReceipts.add(data);
      return Promise.resolve({ queued: true });
    }
    
    return this.emit('read_message', data);
  }
  
  // Send typing indicator with debounce to reduce network traffic
  sendTypingIndicator(chatId, isTyping) {
    // Clear any existing timeout for this chat
    if (this.typingTimeouts[chatId]) {
      clearTimeout(this.typingTimeouts[chatId]);
      delete this.typingTimeouts[chatId];
    }
    
    // If user stopped typing, send immediately
    if (!isTyping) {
      return this.emit('typing', { chatId, isTyping });
    }
    
    // If user is typing, debounce
    const debounceTime = 1000; // 1 second debounce
    this.typingTimeouts[chatId] = setTimeout(() => {
      this.emit('typing', { chatId, isTyping });
      delete this.typingTimeouts[chatId];
    }, debounceTime);
    
    return Promise.resolve({ debounced: true });
  }
  
  // Get current connection status
  getStatus() {
    return this.connectionStatus;
  }

  // Check if socket is currently connected
  isConnected() {
    return this.socket !== null && this.socket.connected && this.connectionStatus === 'CONNECTED';
  }

  // Get the last received message for an event
  getLastMessage(event) {
    return this.lastMessages[event] || null;
  }

  // Call-related methods
  startCall(chatId, callType, recipient) {
    return this.emit('call_started', {
      chatId,
      callType,
      recipient
    });
  }

  sendIceCandidate(callId, candidate, targetUserId) {
    return this.emit('call_ice_candidate', {
      callId,
      candidate,
      targetUserId
    });
  }

  sendSdpOffer(callId, sdp, targetUserId) {
    return this.emit('call_sdp_offer', {
      callId,
      sdp,
      targetUserId
    });
  }

  sendSdpAnswer(callId, sdp, targetUserId) {
    return this.emit('call_sdp_answer', {
      callId,
      sdp,
      targetUserId
    });
  }
  
  // Force a reconnection
  forceReconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
    
    const token = localStorage.getItem('token');
    if (token) {
      setTimeout(() => {
        this.connect(token);
      }, 1000);
    }
  }

  // Enable/disable debug mode
  setDebugMode(enabled) {
    this.debugMode = enabled;
  }
}

// Create a singleton instance
const enhancedSocketManager = new EnhancedSocketManager();

export default enhancedSocketManager;
