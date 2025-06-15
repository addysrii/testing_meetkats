// src/services/socketService.js
import io from 'socket.io-client';

const API_URL = 'https://new-backend-w86d.onrender.com';

class SocketService {
  constructor() {
    this.socket = null;
    this.handlers = {};
    this.connected = false;
  }
  
  async init() {
    try {
      if (this.socket) {
        return;
      }
      
      const token = localStorage.getItem('@auth_token');
      
      if (!token) {
        throw new Error('No authentication token available');
      }
      
      this.socket = io(API_URL, {
        path: '/socket.io/',
        transports: ['websocket'],
        auth: {
          token
        }
      });
      
      // Set up listeners
      this.socket.on('connect', () => {
        console.log('Socket connected');
        this.connected = true;
      });
      
      this.socket.on('disconnect', () => {
        console.log('Socket disconnected');
        this.connected = false;
      });
      
      this.socket.on('error', (error) => {
        console.error('Socket error:', error);
      });
      
      // Default message handler
      this.onEvent('new_message', (data) => {
        console.log('New message received:', data);
      });
      
      return this.socket;
    } catch (error) {
      console.error('Socket initialization error:', error);
      throw error;
    }
  }
  
  // Join a chat room
  joinChat(chatId) {
    if (!this.connected || !this.socket) {
      return Promise.reject(new Error('Socket not connected'));
    }
    
    return new Promise((resolve, reject) => {
      this.socket.emit('join_chat', { chatId }, (response) => {
        if (response && response.success) {
          resolve(response);
        } else {
          reject(new Error('Failed to join chat'));
        }
      });
    });
  }
  
  // Leave a chat room
  leaveChat(chatId) {
    if (!this.connected || !this.socket) {
      return;
    }
    
    this.socket.emit('leave_chat', { chatId });
  }
  
  // Send typing indicator
  sendTyping(chatId, isTyping) {
    if (!this.connected || !this.socket) {
      return;
    }
    
    this.socket.emit('typing', { chatId, isTyping });
  }
  
  // Mark messages as read
  markMessagesRead(chatId, messageIds) {
    if (!this.connected || !this.socket) {
      return;
    }
    
    this.socket.emit('read_messages', { chatId, messageIds });
  }
  
  // Update presence status
  updatePresence(status) {
    if (!this.connected || !this.socket) {
      return;
    }
    
    this.socket.emit('update_presence', { status, lastSeen: new Date() });
  }
  
  // Set up event handler
  onEvent(event, callback) {
    if (!this.socket) {
      this.handlers[event] = callback;
      return;
    }
    
    this.socket.on(event, callback);
    this.handlers[event] = callback;
  }
  
  // Remove event handler
  offEvent(event) {
    if (!this.socket) {
      delete this.handlers[event];
      return;
    }
    
    this.socket.off(event);
    delete this.handlers[event];
  }
  
  // Disconnect socket
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
    }
  }
}

// Create singleton instance
const socketService = new SocketService();

export default socketService;