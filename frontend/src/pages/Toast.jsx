// Create a Toast component (if you don't have one already)
// Save this in components/ui/Toast.jsx

import React, { createContext, useContext, useState, useEffect } from 'react';
import { X } from 'lucide-react';

// Create context
const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  // Add a new toast
  const toast = (options) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast = {
      id,
      title: options.title || '',
      description: options.description || '',
      status: options.status || 'info', // info, success, warning, error
      duration: options.duration || 5000,
      isClosable: options.isClosable !== undefined ? options.isClosable : true,
      action: options.action || null
    };

    setToasts((prevToasts) => [...prevToasts, newToast]);

    // Auto close toast after duration
    if (newToast.duration) {
      setTimeout(() => {
        closeToast(id);
      }, newToast.duration);
    }

    return id;
  };

  // Close a specific toast
  const closeToast = (id) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  };

  // Close all toasts
  const closeAll = () => {
    setToasts([]);
  };

  // Add the close function to the toast object for convenience
  toast.close = closeToast;
  toast.closeAll = closeAll;

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="toast-container fixed top-4 right-4 z-50 flex flex-col gap-3 w-full max-w-md">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`toast bg-white rounded-lg shadow-lg border-l-4 p-4 flex items-start w-full ${
              toast.status === 'info' ? 'border-blue-500' :
              toast.status === 'success' ? 'border-green-500' :
              toast.status === 'warning' ? 'border-yellow-500' :
              toast.status === 'error' ? 'border-red-500' : 'border-gray-300'
            } transform transition-all duration-300 animate-in slide-in-from-right`}
          >
            <div className="flex-1 mr-4">
              <div className="font-bold">{toast.title}</div>
              <div className="text-gray-700 text-sm mt-1">{toast.description}</div>
              {toast.action && (
                <div className="mt-3">{toast.action}</div>
              )}
            </div>
            {toast.isClosable && (
              <button
                onClick={() => closeToast(toast.id)}
                className="text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                <X size={18} />
              </button>
            )}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

