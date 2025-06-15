// // Create a new file: src/services/websocketService.js

// let socket = null;
// let reconnectTimer = null;
// let messageHandlers = [];
// let connectionStatusHandlers = [];

// const WebSocketService = {
//   // Connect to WebSocket server
//   connect: (url) => {
//     if (socket) {
//       socket.close();
//     }
    
//     console.log('WebSocketService: Connecting to', url);
    
//     try {
//       socket = new WebSocket(url);
      
//       socket.onopen = () => {
//         console.log('WebSocketService: Connection established');
//         notifyStatusChange('OPEN');
//       };
      
//       socket.onmessage = (event) => {
//         try {
//           const data = JSON.parse(event.data);
//           console.log('WebSocketService: Received message', data);
//           notifyMessageHandlers(data);
//         } catch (error) {
//           console.error('WebSocketService: Error parsing message', error);
//         }
//       };
      
//       socket.onerror = (event) => {
//         console.error('WebSocketService: Error occurred');
//         notifyStatusChange('ERROR');
//       };
      
//       socket.onclose = (event) => {
//         console.log(`WebSocketService: Connection closed (${event.code})`);
//         notifyStatusChange('CLOSED');
        
//         // Attempt to reconnect unless it was a clean close
//         if (event.code !== 1000 && event.code !== 1001) {
//           scheduleReconnect(url);
//         }
//       };
      
//       return true;
//     } catch (error) {
//       console.error('WebSocketService: Failed to create WebSocket', error);
//       notifyStatusChange('ERROR');
//       scheduleReconnect(url);
//       return false;
//     }
//   },
  
//   // Disconnect from server
//   disconnect: () => {
//     if (reconnectTimer) {
//       clearTimeout(reconnectTimer);
//       reconnectTimer = null;
//     }
    
//     if (socket) {
//       socket.close(1000, 'User disconnected');
//       socket = null;
//     }
    
//     notifyStatusChange('CLOSED');
//   },
  
//   // Send a message
//   sendMessage: (data) => {
//     if (!socket || socket.readyState !== WebSocket.OPEN) {
//       console.warn('WebSocketService: Cannot send message - not connected');
//       return false;
//     }
    
//     try {
//       const message = typeof data === 'string' ? data : JSON.stringify(data);
//       socket.send(message);
//       return true;
//     } catch (error) {
//       console.error('WebSocketService: Error sending message', error);
//       return false;
//     }
//   },
  
//   // Check connection status
//   isConnected: () => {
//     return socket && socket.readyState === WebSocket.OPEN;
//   },
  
//   // Add message handler
//   addMessageHandler: (handler) => {
//     messageHandlers.push(handler);
//     return () => {
//       messageHandlers = messageHandlers.filter(h => h !== handler);
//     };
//   },
  
//   // Add connection status handler
//   addStatusHandler: (handler) => {
//     connectionStatusHandlers.push(handler);
//     // Call immediately with current status
//     if (socket) {
//       let status = 'CLOSED';
//       if (socket.readyState === WebSocket.CONNECTING) status = 'CONNECTING';
//       if (socket.readyState === WebSocket.OPEN) status = 'OPEN';
      
//       handler(status);
//     } else {
//       handler('CLOSED');
//     }
    
//     return () => {
//       connectionStatusHandlers = connectionStatusHandlers.filter(h => h !== handler);
//     };
//   }
// };

// // Helper functions
// function scheduleReconnect(url) {
//   if (reconnectTimer) {
//     clearTimeout(reconnectTimer);
//   }
  
//   reconnectTimer = setTimeout(() => {
//     console.log('WebSocketService: Attempting to reconnect...');
//     WebSocketService.connect(url);
//   }, 3000);
// }

// function notifyMessageHandlers(data) {
//   messageHandlers.forEach(handler => {
//     try {
//       handler(data);
//     } catch (error) {
//       console.error('WebSocketService: Error in message handler', error);
//     }
//   });
// }

// function notifyStatusChange(status) {
//   connectionStatusHandlers.forEach(handler => {
//     try {
//       handler(status);
//     } catch (error) {
//       console.error('WebSocketService: Error in status handler', error);
//     }
//   });
// }

// export default WebSocketService;