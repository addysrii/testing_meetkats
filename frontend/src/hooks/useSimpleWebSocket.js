// // // useWebSocket.js
// // import { useState, useEffect, useRef, useCallback } from 'react';

// // const useWebSocket = (url, options = {}) => {
// //   const [status, setStatus] = useState('CONNECTING');
// //   const [lastMessage, setLastMessage] = useState(null);
// //   const [error, setError] = useState(null);
// //   const socketRef = useRef(null);
// //   const reconnectTimeoutRef = useRef(null);
// //   const reconnectAttemptsRef = useRef(0);
// //   const MAX_RECONNECT_ATTEMPTS = options.maxReconnectAttempts || 5;
// //   const RECONNECT_INTERVAL = options.reconnectInterval || 3000;
  
// //   // Message handlers
// //   const messageHandlers = useRef({});
  
// //   // Register a message handler
// //   const registerHandler = useCallback((type, handler) => {
// //     if (!type || typeof handler !== 'function') {
// //       console.error('Invalid handler registration attempt', { type, handler });
// //       return () => {}; // Return empty cleanup function
// //     }
    
// //     console.log(`Registering handler for message type: ${type}`);
// //     messageHandlers.current[type] = handler;
    
// //     // Return unregister function
// //     return () => {
// //       console.log(`Unregistering handler for message type: ${type}`);
// //       delete messageHandlers.current[type];
// //     };
// //   }, []);
  
// //   // Send a message
// //   const sendMessage = useCallback((data) => {
// //     if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
// //       console.warn('WebSocket is not connected');
// //       return false;
// //     }
    
// //     try {
// //       const message = typeof data === 'string' ? data : JSON.stringify(data);
// //       socketRef.current.send(message);
// //       return true;
// //     } catch (err) {
// //       console.error('Error sending message:', err);
// //       return false;
// //     }
// //   }, []);
  
// //   // Connect to WebSocket
// //   const connect = useCallback(() => {
// //     // Clear any existing reconnect timeout
// //     if (reconnectTimeoutRef.current) {
// //       clearTimeout(reconnectTimeoutRef.current);
// //       reconnectTimeoutRef.current = null;
// //     }
    
// //     // Close existing connection if any
// //     if (socketRef.current) {
// //       socketRef.current.close();
// //     }
    
// //     try {
// //       console.log(`Connecting to WebSocket: ${url}`);
// //       setStatus('CONNECTING');
      
// //       const socket = new WebSocket(url);
// //       socketRef.current = socket;
      
// //       socket.onopen = () => {
// //         console.log('WebSocket connection established');
// //         setStatus('OPEN');
// //         setError(null);
// //         reconnectAttemptsRef.current = 0;
        
// //         // Send an initial presence message if needed
// //         if (options.sendPresence) {
// //           sendMessage({ type: 'presence', status: 'online' });
// //         }
// //       };
      
// //       socket.onmessage = (event) => {
// //         try {
// //           const data = JSON.parse(event.data);
// //           setLastMessage(data);
          
// //           // Process using registered handlers
// //           if (data.type && messageHandlers.current[data.type]) {
// //             messageHandlers.current[data.type](data.data || data);
// //           }
// //         } catch (err) {
// //           console.error('Error parsing message:', err);
// //         }
// //       };
      
// //       socket.onerror = (event) => {
// //         console.error('WebSocket error:', event);
// //         setStatus('ERROR');
// //         setError('Connection error occurred');
// //       };
      
// //       socket.onclose = (event) => {
// //         console.log(`WebSocket closed: ${event.code} ${event.reason}`);
// //         setStatus('CLOSED');
        
// //         // Don't reconnect if closed cleanly or max attempts reached
// //         const isCleanClose = event.code === 1000 || event.code === 1001;
        
// //         if (!isCleanClose && reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
// //           const delay = RECONNECT_INTERVAL * Math.pow(1.5, reconnectAttemptsRef.current);
// //           console.log(`Reconnecting in ${delay}ms (attempt ${reconnectAttemptsRef.current + 1})`);
          
// //           reconnectTimeoutRef.current = setTimeout(() => {
// //             reconnectAttemptsRef.current++;
// //             connect();
// //           }, delay);
// //         } else if (reconnectAttemptsRef.current >= MAX_RECONNECT_ATTEMPTS) {
// //           setError('Maximum reconnection attempts reached');
// //         }
// //       };
// //     } catch (err) {
// //       console.error('Error creating WebSocket:', err);
// //       setStatus('ERROR');
// //       setError('Failed to establish connection');
// //     }
// //   }, [url, options.sendPresence, sendMessage]);
  
// //   // Disconnect from WebSocket
// //   const disconnect = useCallback(() => {
// //     if (reconnectTimeoutRef.current) {
// //       clearTimeout(reconnectTimeoutRef.current);
// //       reconnectTimeoutRef.current = null;
// //     }
    
// //     if (socketRef.current) {
// //       socketRef.current.close(1000, 'Intentional disconnect');
// //       socketRef.current = null;
// //     }
// //   }, []);
  
// //   // Initial connection
// //   useEffect(() => {
// //     if (!url) {
// //       setStatus('CLOSED');
// //       setError('No WebSocket URL provided');
// //       return;
// //     }
    
// //     connect();
    
// //     // Setup ping interval to keep connection alive
// //     const pingInterval = setInterval(() => {
// //       if (status === 'OPEN') {
// //         sendMessage({ type: 'ping', timestamp: Date.now() });
// //       }
// //     }, options.pingInterval || 30000);
    
// //     // Cleanup function
// //     return () => {
// //       console.log('Cleaning up WebSocket connection');
// //       clearInterval(pingInterval);
// //       disconnect();
// //     };
// //   }, [url, connect, disconnect, status, options.pingInterval, sendMessage]);
  
// //   // Always ensure all functions are defined
// //   return {
// //     status,
// //     lastMessage,
// //     error,
// //     sendMessage: sendMessage || (() => false),
// //     registerHandler: registerHandler || (() => () => {})
// //   };
// // };

// // export default useWebSocket;
// // useWebSocket.js
// import { useState, useEffect, useRef, useCallback } from 'react';

// const useWebSimpleSocket = (url, options = {}) => {
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
//     // Clear any existing reconnect timeout
//     if (reconnectTimeoutRef.current) {
//       clearTimeout(reconnectTimeoutRef.current);
//       reconnectTimeoutRef.current = null;
//     }
    
//     // Close existing connection if any
//     if (socketRef.current) {
//       socketRef.current.close();
//     }
    
//     try {
//       console.log(`Connecting to WebSocket: ${url}`);
//       setStatus('CONNECTING');
      
//       const socket = new WebSocket(url);
//       socketRef.current = socket;
      
//       socket.onopen = () => {
//         console.log('WebSocket connection established');
//         setStatus('OPEN');
//         setError(null);
//         reconnectAttemptsRef.current = 0;
        
//         // Send an initial presence message if needed
//         if (options.sendPresence) {
//           sendMessage({ type: 'presence', status: 'online' });
//         }
//       };
      
//       socket.onmessage = (event) => {
//         try {
//           const data = JSON.parse(event.data);
//           setLastMessage(data);
          
//           // Process using registered handlers
//           if (data.type && messageHandlers.current[data.type]) {
//             messageHandlers.current[data.type](data.data || data);
//           }
//         } catch (err) {
//           console.error('Error parsing message:', err);
//         }
//       };
      
//       socket.onerror = (event) => {
//         console.error('WebSocket error:', event);
//         setStatus('ERROR');
//         setError('Connection error occurred');
//       };
      
//       socket.onclose = (event) => {
//         console.log(`WebSocket closed: ${event.code} ${event.reason}`);
//         setStatus('CLOSED');
        
//         // Don't reconnect if closed cleanly or max attempts reached
//         const isCleanClose = event.code === 1000 || event.code === 1001;
        
//         if (!isCleanClose && reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
//           const delay = RECONNECT_INTERVAL * Math.pow(1.5, reconnectAttemptsRef.current);
//           console.log(`Reconnecting in ${delay}ms (attempt ${reconnectAttemptsRef.current + 1})`);
          
//           reconnectTimeoutRef.current = setTimeout(() => {
//             reconnectAttemptsRef.current++;
//             connect();
//           }, delay);
//         } else if (reconnectAttemptsRef.current >= MAX_RECONNECT_ATTEMPTS) {
//           setError('Maximum reconnection attempts reached');
//         }
//       };
//     } catch (err) {
//       console.error('Error creating WebSocket:', err);
//       setStatus('ERROR');
//       setError('Failed to establish connection');
//     }
//   }, [url, options.sendPresence, sendMessage]);
  
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
  
//   // Initial connection
//   useEffect(() => {
//     if (!url) {
//       setStatus('CLOSED');
//       setError('No WebSocket URL provided');
//       return;
//     }
    
//     connect();
    
//     // Setup ping interval to keep connection alive
//     const pingInterval = setInterval(() => {
//       if (status === 'OPEN') {
//         sendMessage({ type: 'ping', timestamp: Date.now() });
//       }
//     }, options.pingInterval || 30000);
    
//     // Cleanup function
//     return () => {
//       console.log('Cleaning up WebSocket connection');
//       clearInterval(pingInterval);
//       disconnect();
//     };
//   }, [url, connect, disconnect, status, options.pingInterval, sendMessage]);
  
//   // Always ensure all functions are defined
//   return {
//     status,
//     lastMessage,
//     error,
//     sendMessage: sendMessage || (() => false),
//     registerHandler: registerHandler || (() => () => {})
//   };
// };

// export default useWebSimpleSocket;