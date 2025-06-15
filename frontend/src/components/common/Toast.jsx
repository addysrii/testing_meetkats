import React, { createContext, useContext, useState } from 'react';
import { X, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';

// Create context
const ToastContext = createContext(null);

// Base toast hook - this won't be exported directly
const useToastBase = () => useContext(ToastContext);

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

  // Add helper methods
  toast.info = (options) => toast({ ...options, status: 'info' });
  toast.success = (options) => toast({ ...options, status: 'success' });
  toast.warning = (options) => toast({ ...options, status: 'warning' });
  toast.error = (options) => toast({ ...options, status: 'error' });
  toast.closeAll = closeAll;
  toast.close = closeToast;

  // Status icons
  const statusIcons = {
    info: <Info className="w-5 h-5 text-blue-500" />,
    success: <CheckCircle className="w-5 h-5 text-green-500" />,
    warning: <AlertTriangle className="w-5 h-5 text-yellow-500" />,
    error: <AlertCircle className="w-5 h-5 text-red-500" />
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-3 w-full max-w-md pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`bg-white rounded-lg shadow-lg border-l-4 p-4 flex items-start pointer-events-auto animate-in slide-in-from-right duration-300 ${
              toast.status === 'info' ? 'border-blue-500' :
              toast.status === 'success' ? 'border-green-500' :
              toast.status === 'warning' ? 'border-yellow-500' :
              toast.status === 'error' ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <div className="flex-shrink-0 mr-3">
              {statusIcons[toast.status]}
            </div>
            <div className="flex-1 mr-2">
              {toast.title && (
                <h3 className="font-medium text-gray-900">{toast.title}</h3>
              )}
              {toast.description && (
                <div className="mt-1 text-sm text-gray-600">{toast.description}</div>
              )}
              {toast.action && (
                <div className="mt-2">{toast.action}</div>
              )}
            </div>
            {toast.isClosable && (
              <button
                onClick={() => closeToast(toast.id)}
                className="flex-shrink-0 text-gray-400 hover:text-gray-500 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 p-1 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

// Export the enhanced hook
export const useToast = () => {
  const toast = useToastBase();
  
  if (!toast) {
    console.warn('useToast was called outside of ToastProvider context');
    // Return a dummy function to prevent errors
    const dummy = () => null;
    dummy.info = () => null;
    dummy.success = () => null;
    dummy.warning = () => null;
    dummy.error = () => null;
    dummy.close = () => null;
    dummy.closeAll = () => null;
    return dummy;
  }
  
  return toast;
};