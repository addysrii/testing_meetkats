// // useWebSocket.js
// import { useState, useEffect, useRef, useCallback } from 'react';

// const useWebSocket = (url, options = {}) => {
//   const [status, setStatus] = useState('CONNECTING');
//   const [lastMessage, setLastMessage] = useState(null);
//   const [error, setError] = useState(null);
//   const socketRef = useRef(null);
//   const reconnectTimeoutRef = useRef(null);
//   const reconnectAttemptsRef = useRef(0);
//   const MAX_RECONNECT_ATTEMPTS = options.maxReconnectAttempts || 5;
//   const RECONNECT_INTERVAL = options.reconnectInterval || 3000;
  
//   // Message handlers
//   const messageHandlers = useRef({});
  
//   // Register a message handler
//   const registerHandler = useCallback((type, handler) => {
//     if (!type || typeof handler !== 'function') {
//       console.error('Invalid handler registration attempt', { type, handler });
//       return () => {}; // Return empty cleanup function
//     }
    
//     console.log(`Registering handler for message type: ${type}`);
//     messageHandlers.current[type] = handler;
    
//     // Return unregister function
//     return () => {
//       console.log(`Unregistering handler for message type: ${type}`);
//       delete messageHandlers.current[type];
//     };
//   }, []);
  
//   // Send a message
//   const sendMessage = useCallback((data) => {
//     if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
//       console.warn('WebSocket is not connected');
//       return false;
//     }
    
//     try {
//       const message = typeof data === 'string' ? data : JSON.stringify(data);
//       socketRef.current.send(message);
//       return true;
//     } catch (err) {
//       console.error('Error sending message:', err);
//       return false;
//     }
//   }, []);
  
//   // Connect to WebSocket
//   const connect = useCallback(() => {
//     // Don't attempt to connect if component is unmounted
//     if (!isMounted.current) {
//       console.log('Skipping connection attempt - component not mounted');
//       return;
//     }
    
//     // Clear any existing reconnect timeout
//     if (reconnectTimeoutRef.current) {
//       clearTimeout(reconnectTimeoutRef.current);
//       reconnectTimeoutRef.current = null;
//     }
    
//     // Close existing connection if any
//     if (socketRef.current) {
//       try {
//         if (socketRef.current.readyState !== WebSocket.CLOSED) {
//           socketRef.current.close(1000, 'New connection starting');
//         }
//       } catch (err) {
//         console.warn('Error closing existing socket:', err);
//       }
//       socketRef.current = null;
//     }
    
//     try {
//       console.log(`Connecting to WebSocket: ${url}`);
//       setStatus('CONNECTING');
      
//       // Add connection attempt logging
//       console.log(`Connection attempt #${reconnectAttemptsRef.current + 1}`);
      
//       const socket = new WebSocket(url);
//       socketRef.current = socket;
      
//       // Add timeout to detect stalled connection attempts
//       const connectionTimeoutId = setTimeout(() => {
//         if (socket.readyState !== WebSocket.OPEN && isMounted.current) {
//           console.warn('Connection attempt timed out after 5 seconds');
//           try {
//             socket.close(4000, 'Connection timeout');
//           } catch (err) {
//             console.warn('Error closing timed out socket:', err);
//           }
//         }
//       }, 5000);
      
//       socket.onopen = () => {
//         clearTimeout(connectionTimeoutId);
//         console.log('WebSocket connection established');
//         setStatus('OPEN');
//         setError(null);
//         reconnectAttemptsRef.current = 0;
        
//         // Send an initial presence message if needed
//         if (options.sendPresence && isMounted.current) {
//           setTimeout(() => {
//             sendMessage({ type: 'presence', status: 'online' });
//           }, 500); // Small delay to ensure connection is stable
//         }
//       };
      
//       socket.onmessage = (event) => {
//         if (!isMounted.current) return;
        
//         try {
//           const data = JSON.parse(event.data);
//           setLastMessage(data);
//           console.log('Received message:', data);
          
//           // Process using registered handlers
//           if (data.type && messageHandlers.current[data.type]) {
//             messageHandlers.current[data.type](data.data || data);
//           }
//         } catch (err) {
//           console.error('Error parsing message:', err);
//         }
//       };
      
//       socket.onerror = (event) => {
//         clearTimeout(connectionTimeoutId);
//         console.error('WebSocket error:', event);
        
//         if (isMounted.current) {
//           setStatus('ERROR');
//           setError('Connection error occurred');
//         }
//       };
      
//       socket.onclose = (event) => {
//         clearTimeout(connectionTimeoutId);
//         console.log(`WebSocket closed: ${event.code} ${event.reason || 'No reason provided'}`);
        
//         if (!isMounted.current) {
//           console.log('Ignoring close event - component not mounted');
//           return;
//         }
        
//         setStatus('CLOSED');
        
//         // Don't reconnect if closed cleanly or max attempts reached
//         const isCleanClose = event.code === 1000 || event.code === 1001;
        
//         if (!isCleanClose && reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS && isMounted.current) {
//           const delay = RECONNECT_INTERVAL * Math.pow(1.5, reconnectAttemptsRef.current);
//           console.log(`Reconnecting in ${delay}ms (attempt ${reconnectAttemptsRef.current + 1})`);
          
//           reconnectTimeoutRef.current = setTimeout(() => {
//             reconnectAttemptsRef.current++;
//             if (isMounted.current) {
//               connect();
//             }
//           }, delay);
//         } else if (reconnectAttemptsRef.current >= MAX_RECONNECT_ATTEMPTS) {
//           setError('Maximum reconnection attempts reached');
//         }
//       };
//     } catch (err) {
//       console.error('Error creating WebSocket:', err);
//       if (isMounted.current) {
//         setStatus('ERROR');
//         setError('Failed to establish connection');
//       }
//     }
//   }, [url, options.sendPresence, sendMessage, MAX_RECONNECT_ATTEMPTS, RECONNECT_INTERVAL]);
  
//   // Disconnect from WebSocket
//   const disconnect = useCallback(() => {
//     if (reconnectTimeoutRef.current) {
//       clearTimeout(reconnectTimeoutRef.current);
//       reconnectTimeoutRef.current = null;
//     }
    
//     if (socketRef.current) {
//       socketRef.current.close(1000, 'Intentional disconnect');
//       socketRef.current = null;
//     }
//   }, []);
  
//   // Track component mount status
//   const isMounted = useRef(true);
  
//   // Initial connection
//   useEffect(() => {
//     isMounted.current = true;
    
//     if (!url) {
//       setStatus('CLOSED');
//       setError('No WebSocket URL provided');
//       return;
//     }
    
//     // Add a slight delay before connecting to prevent connection cycles
//     const connectTimer = setTimeout(() => {
//       if (isMounted.current) {
//         console.log('Delayed connection starting...');
//         connect();
//       }
//     }, 500);
    
//     // Setup ping interval to keep connection alive
//     const pingInterval = setInterval(() => {
//       if (status === 'OPEN' && isMounted.current) {
//         sendMessage({ type: 'ping', timestamp: Date.now() });
//       }
//     }, options.pingInterval || 30000);
    
//     // Cleanup function
//     return () => {
//       console.log('Cleaning up WebSocket connection - component unmounting');
//       isMounted.current = false;
//       clearTimeout(connectTimer);
//       clearInterval(pingInterval);
      
//       // Use a clean disconnect with a close reason
//       if (socketRef.current) {
//         console.log('Closing socket due to component unmount');
//         socketRef.current.close(1000, 'Component unmounted');
//       }
//     };
//   }, [url, connect, status, options.pingInterval, sendMessage]);
  
//   // Always ensure all functions are defined
//   return {
//     status,
//     lastMessage,
//     error,
//     sendMessage: sendMessage || (() => false),
//     registerHandler: registerHandler || (() => () => {})
//   };
// };

// export default useWebSocket;