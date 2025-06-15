import { useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';

const useSocketIO = (url, token, options = {}) => {
  const [status, setStatus] = useState('DISCONNECTED');
  const [error, setError] = useState(null);
  const [lastMessage, setLastMessage] = useState(null);
  const socketRef = useRef(null);
  const eventHandlersRef = useRef({});
  const isMounted = useRef(true);
  const reconnectTimerRef = useRef(null);

  // Comprehensive error diagnosis
  const diagnoseConnectionError = (error) => {
    // Safely handle potential undefined error
    if (!error || typeof error !== 'object') {
      return 'Unknown connection error';
    }

    const errorMessage = error.message || '';
    const errorName = error.name || '';

    const errorDiagnosis = [
      {
        pattern: /websocket/i,
        message: 'WebSocket connection failed. Check server configuration and network.'
      },
      {
        pattern: /token/i,
        message: 'Authentication failed. Please log in again.'
      },
      {
        pattern: /closed before/i,
        message: 'Connection closed prematurely. Check server availability.'
      },
      {
        pattern: /network/i,
        message: 'Network error. Please check your internet connection.'
      }
    ];

    const matchedDiagnosis = errorDiagnosis.find(diag => 
      diag.pattern.test(errorMessage) || diag.pattern.test(errorName)
    );

    return matchedDiagnosis 
      ? matchedDiagnosis.message 
      : `Connection error: ${errorMessage || 'Unknown issue'}`;
  };

  // Adaptive connection configuration
  const getConnectionOptions = useCallback(() => {
    return {
      auth: { 
        token,
        tokenType: 'Bearer'
      },
      query: { 
        token,
        client: 'web',
        debug: true
      },
      reconnection: true,
      reconnectionAttempts: options.maxReconnectAttempts || 5,
      reconnectionDelay: (attempt) => {
        const baseDelay = 1000;
        const delay = baseDelay * Math.pow(2, attempt);
        return Math.min(delay, 30000) + Math.random() * 1000;
      },
      timeout: options.timeout || 20000,
      transports: ['websocket', 'polling'],
      path: options.socketPath || '/socket.io/',
      forceNew: true,
      withCredentials: false
    };
  }, [token, options]);

  // Initialize socket connection
  const initSocket = useCallback(() => {
    // Clear any existing connection
    if (socketRef.current) {
      try {
        socketRef.current.disconnect();
      } catch (e) {
        console.warn('Error during previous socket disconnect:', e);
      }
    }

    // Validate inputs
    if (!url || !token) {
      setStatus('DISCONNECTED');
      setError('Missing connection parameters');
      return null;
    }

    try {
      console.log(`Attempting Socket.IO connection to: ${url}`);
      
      // Create new socket instance
      const newSocket = io(url, getConnectionOptions());

      // Connection event handlers
      newSocket.on('connect', () => {
        if (!isMounted.current) return;
        console.log('✅ Socket.IO connected successfully');
        setStatus('CONNECTED');
        setError(null);
        
        // Clear any existing reconnect timer
        if (reconnectTimerRef.current) {
          clearTimeout(reconnectTimerRef.current);
          reconnectTimerRef.current = null;
        }
      });

      newSocket.on('connect_error', (err) => {
        if (!isMounted.current) return;
        
        console.error('❌ Socket.IO connection error:', err);
        
        const diagnosticError = diagnoseConnectionError(err);
        setStatus('ERROR');
        setError(diagnosticError);

        // Attempt reconnection with delay
        reconnectTimerRef.current = setTimeout(() => {
          if (isMounted.current) {
            newSocket.connect();
          }
        }, 3000);
      });

      newSocket.on('disconnect', (reason) => {
        if (!isMounted.current) return;
        
        console.log(`🔌 Socket.IO disconnected: ${reason}`);
        setStatus('DISCONNECTED');
        
        // Intelligent reconnection
        if (reason === 'io server disconnect') {
          // Server explicitly disconnected us
          reconnectTimerRef.current = setTimeout(() => {
            if (isMounted.current) {
              newSocket.connect();
            }
          }, 1000);
        }
      });

      // Debug-friendly event proxy
      newSocket.onAny((eventName, ...args) => {
        if (!isMounted.current) return;
        
        // Log all incoming events for debugging
        console.log(`📬 Received event: ${eventName}`, args);
        
        setLastMessage({ event: eventName, data: args[0] });
        
        // Call any registered handlers for this event
        if (eventHandlersRef.current[eventName]) {
          eventHandlersRef.current[eventName](...args);
        }
      });

      return newSocket;
    } catch (err) {
      console.error('❌ Fatal Socket.IO initialization error:', err);
      setStatus('ERROR');
      setError(`Initialization failed: ${err.message}`);
      return null;
    }
  }, [url, token, getConnectionOptions, diagnoseConnectionError]);

  // Socket initialization effect
  useEffect(() => {
    isMounted.current = true;
    
    // Delayed initialization to prevent rapid reconnects
    const initTimer = setTimeout(() => {
      socketRef.current = initSocket();
    }, 500);
    
    // Cleanup function
    return () => {
      isMounted.current = false;
      clearTimeout(initTimer);
      
      if (socketRef.current) {
        console.log('🚫 Disconnecting Socket.IO - component unmounting');
        socketRef.current.disconnect();
        socketRef.current = null;
      }

      // Clear any pending reconnect timer
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
      }
    };
  }, [initSocket]);

  // Emit an event with enhanced error handling
  const emit = useCallback((eventName, data, callback) => {
    if (!socketRef.current || !socketRef.current.connected) {
      console.warn(`⚠️ Cannot emit ${eventName} - socket not connected`);
      return false;
    }
    
    try {
      if (callback) {
        socketRef.current.emit(eventName, data, (response) => {
          console.log(`✉️ Event ${eventName} response:`, response);
          callback(response);
        });
      } else {
        socketRef.current.emit(eventName, data);
      }
      console.log(`✉️ Emitted event: ${eventName}`, data);
      return true;
    } catch (err) {
      console.error(`❌ Error emitting ${eventName}:`, err);
      return false;
    }
  }, []);

  // Event handler registration with validation
  const on = useCallback((eventName, handler) => {
    if (!eventName || typeof handler !== 'function') {
      console.error('❌ Invalid event registration', { eventName, handler });
      return () => {}; // Empty cleanup function
    }
    
    console.log(`🔔 Registering handler for event: ${eventName}`);
    eventHandlersRef.current[eventName] = handler;
    
    // Return unregister function
    return () => {
      console.log(`🔇 Unregistering handler for event: ${eventName}`);
      delete eventHandlersRef.current[eventName];
    };
  }, []);

  // Additional utility methods
  const joinRoom = useCallback((roomId) => {
    return emit('join_chat', roomId);
  }, [emit]);

  const leaveRoom = useCallback((roomId) => {
    return emit('leave_chat', roomId);
  }, [emit]);

  const connect = useCallback(() => {
    if (!socketRef.current) return false;
    socketRef.current.connect();
    return true;
  }, []);

  const disconnect = useCallback(() => {
    if (!socketRef.current) return false;
    socketRef.current.disconnect();
    return true;
  }, []);

  return {
    status,
    error,
    lastMessage,
    emit,
    on,
    joinRoom,
    leaveRoom,
    connect,
    disconnect,
    diagnoseError: diagnoseConnectionError,
    socket: socketRef.current
  };
};

export default useSocketIO;