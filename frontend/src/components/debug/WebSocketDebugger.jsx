// src/components/debug/WebSocketDebugger.jsx
import React, { useState, useEffect } from 'react';

/**
 * A debugging component for WebSocket connections
 * This should only be used during development
 */
const WebSocketDebugger = ({ wsUrl, token }) => {
  const [status, setStatus] = useState('Not connected');
  const [logs, setLogs] = useState([]);
  const [manualUrl, setManualUrl] = useState(wsUrl || '');
  const [ws, setWs] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);

  // Add a log entry
  const addLog = (message, data = null, type = 'info') => {
    const timestamp = new Date().toISOString();
    setLogs(prev => [{
      id: Date.now() + Math.random(),
      timestamp,
      message,
      data: data ? JSON.stringify(data) : '',
      type
    }, ...prev.slice(0, 19)]); // Keep only last 20 logs
  };

  // Test a direct WebSocket connection
  const testConnection = (url) => {
    if (ws) {
      ws.close();
    }

    addLog(`Testing connection to ${url}`, null, 'info');
    setStatus('Connecting...');

    try {
      const socket = new WebSocket(url);
      setWs(socket);

      socket.onopen = (event) => {
        addLog('Connection established successfully', event, 'success');
        setStatus('Connected');
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          addLog('Received message', data, 'info');
        } catch (e) {
          addLog('Received non-JSON message', event.data, 'warning');
        }
      };

      socket.onerror = (event) => {
        addLog('Connection error', event, 'error');
        setStatus('Error');
      };

      socket.onclose = (event) => {
        addLog('Connection closed', { code: event.code, reason: event.reason }, 'warning');
        setStatus('Closed');
        setWs(null);
      };
    } catch (error) {
      addLog('Failed to create WebSocket', error.message, 'error');
      setStatus('Failed');
    }
  };

  // Close the current connection
  const closeConnection = () => {
    if (ws) {
      ws.close(1000, 'Closed by user');
      addLog('Connection closed by user', null, 'info');
    }
  };

  // Send a ping message
  const sendPing = () => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'ping', timestamp: Date.now() }));
      addLog('Ping sent', null, 'info');
    } else {
      addLog('Cannot send ping - connection not open', null, 'error');
    }
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [ws]);

  // Update manualUrl when wsUrl changes
  useEffect(() => {
    if (wsUrl) {
      setManualUrl(wsUrl);
    }
  }, [wsUrl]);

  return (
    <div className="fixed bottom-0 right-0 m-4 z-50 bg-gray-800 text-white rounded-lg shadow-lg overflow-hidden" style={{ maxWidth: '500px', maxHeight: isExpanded ? '80vh' : '40px' }}>
      <div 
        className="px-4 py-2 bg-gray-700 flex justify-between items-center cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center">
          <span className={`h-3 w-3 rounded-full mr-2 ${
            status === 'Connected' ? 'bg-green-500' : 
            status === 'Connecting...' ? 'bg-yellow-500' : 
            status === 'Error' || status === 'Failed' ? 'bg-red-500' : 
            'bg-gray-500'
          }`}></span>
          <h3 className="font-semibold">WebSocket Debugger ({status})</h3>
        </div>
        <span>{isExpanded ? '▼' : '▲'}</span>
      </div>
      
      {isExpanded && (
        <div className="p-4">
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">WebSocket URL</label>
            <div className="flex">
              <input 
                type="text" 
                value={manualUrl}
                onChange={(e) => setManualUrl(e.target.value)}
                className="flex-grow px-3 py-2 bg-gray-700 rounded-l text-white"
                placeholder="ws://localhost:3000/ws"
              />
              <button 
                onClick={() => testConnection(manualUrl)}
                className="px-3 py-2 bg-blue-600 text-white rounded-r hover:bg-blue-700"
              >
                Connect
              </button>
            </div>
          </div>
          
          <div className="mb-4 flex space-x-2">
            <button 
              onClick={() => testConnection(wsUrl || manualUrl)}
              className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
              disabled={!wsUrl && !manualUrl}
            >
              Test Default Connection
            </button>
            <button 
              onClick={closeConnection}
              className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
              disabled={!ws}
            >
              Close Connection
            </button>
            <button 
              onClick={sendPing}
              className="px-3 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700 text-sm"
              disabled={!ws || ws.readyState !== WebSocket.OPEN}
            >
              Send Ping
            </button>
          </div>
          
          <div>
            <h4 className="font-medium text-sm mb-2">Connection Logs:</h4>
            <div className="bg-gray-900 rounded p-2 h-60 overflow-y-auto text-xs">
              {logs.length === 0 ? (
                <p className="text-gray-500 italic">No logs yet. Try connecting to see logs.</p>
              ) : (
                logs.map(log => (
                  <div 
                    key={log.id} 
                    className={`mb-1 pb-1 border-b border-gray-800 ${
                      log.type === 'error' ? 'text-red-400' : 
                      log.type === 'success' ? 'text-green-400' : 
                      log.type === 'warning' ? 'text-yellow-400' : 
                      'text-gray-300'
                    }`}
                  >
                    <div className="flex justify-between">
                      <span className="font-mono">{new Date(log.timestamp).toLocaleTimeString()}</span>
                      <span className="font-semibold capitalize">{log.type}</span>
                    </div>
                    <div>{log.message}</div>
                    {log.data && <div className="mt-1 font-mono text-xs bg-gray-800 p-1 rounded">{log.data}</div>}
                  </div>
                ))
              )}
            </div>
          </div>
          
          <div className="mt-4 text-xs text-gray-400">
            <p>Network issues? Try these troubleshooting steps:</p>
            <ol className="list-decimal ml-4 mt-1">
              <li>Check if your backend server is running</li>
              <li>Verify CORS settings on your server</li>
              <li>Check for proper token/authentication</li>
              <li>Test with a different browser</li>
              <li>Check browser console for additional errors</li>
            </ol>
          </div>
        </div>
      )}
    </div>
  );
};

export default WebSocketDebugger;