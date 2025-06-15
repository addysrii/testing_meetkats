import React, { useState, useRef, useEffect } from 'react';

const MessageInput = ({ 
  onSendMessage, 
  onTyping, 
  chatId,
  onReply,
  replyingTo,
  onCancelReply,
  disabled = false 
}) => {
  const [message, setMessage] = useState('');
  const [showAttachmentOptions, setShowAttachmentOptions] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const recordingIntervalRef = useRef(null);
  const attachmentMenuRef = useRef(null);
  const messageInputRef = useRef(null);

  // Reset component state when chat changes
  useEffect(() => {
    setMessage('');
    setShowAttachmentOptions(false);
    setIsRecording(false);
    setRecordingTime(0);
    setSelectedFile(null);
    setFilePreview(null);
    setUploadProgress(0);
    setIsUploading(false);
    
    // Clear any running timers/intervals
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
    }
  }, [chatId]);

  // Focus input when replying to a message
  useEffect(() => {
    if (replyingTo && messageInputRef.current) {
      messageInputRef.current.focus();
    }
  }, [replyingTo]);

  // Handle clicking outside attachment menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (attachmentMenuRef.current && !attachmentMenuRef.current.contains(event.target)) {
        setShowAttachmentOptions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle typing indicator
  useEffect(() => {
    if (message && !isTyping) {
      setIsTyping(true);
      onTyping(true);
    }
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    if (message) {
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        onTyping(false);
      }, 3000);
    } else if (isTyping) {
      setIsTyping(false);
      onTyping(false);
    }
    
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [message, isTyping, onTyping]);

  // Handle file selection with type checking and size limits
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Check file size (limit to 20MB)
    if (file.size > 20 * 1024 * 1024) {
      alert('File size exceeds 20MB limit. Please select a smaller file.');
      return;
    }
    
    // Check file type
    if (file.type.startsWith('image/')) {
      // For images, check dimensions
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      
      img.onload = () => {
        // Free memory
        URL.revokeObjectURL(objectUrl);
        
        setSelectedFile(file);
        createFilePreview(file);
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        alert('Invalid image file. Please select another file.');
      };
      
      img.src = objectUrl;
    } else if (file.type.startsWith('video/')) {
      // For videos, check duration (client-side check)
      const video = document.createElement('video');
      const objectUrl = URL.createObjectURL(file);
      
      video.onloadedmetadata = () => {
        URL.revokeObjectURL(objectUrl);
        
        // Check if video is too long (limit to 2 minutes for chats)
        if (video.duration > 120) {
          alert('Video is too long. Please select a video shorter than 2 minutes.');
          return;
        }
        
        setSelectedFile(file);
        createFilePreview(file);
      };
      
      video.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        alert('Invalid video file. Please select another file.');
      };
      
      video.src = objectUrl;
    } else if (file.type.startsWith('application/') || file.type.startsWith('text/')) {
      // For documents, just check size
      setSelectedFile(file);
      createFilePreview(file);
    } else {
      alert('Unsupported file type. Please select an image, video, or document file.');
    }
  };

  // Create file preview based on type
  const createFilePreview = (file) => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview({
          url: reader.result,
          type: 'image',
          name: file.name,
          size: file.size
        });
      };
      reader.readAsDataURL(file);
    } else if (file.type.startsWith('video/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview({
          url: reader.result,
          type: 'video',
          name: file.name,
          size: file.size
        });
      };
      reader.readAsDataURL(file);
    } else {
      // For documents, just store name and size
      setFilePreview({
        url: null,
        type: 'file',
        name: file.name,
        size: file.size
      });
    }
  };

  // Handle message submission with progress monitoring
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if ((!message.trim() && !selectedFile) || isRecording || disabled) return;
    
    try {
      let messageType = 'text';
      let attachment = null;
      let replyToId = replyingTo ? replyingTo._id : null;
      
      if (selectedFile) {
        setIsUploading(true);
        setUploadProgress(0);
        
        if (selectedFile.type.startsWith('image/')) {
          messageType = 'image';
        } else if (selectedFile.type.startsWith('video/')) {
          messageType = 'video';
        } else {
          messageType = 'file';
        }
        attachment = selectedFile;
      }
      
      // Create FormData for message with or without attachment
      const formData = new FormData();
      formData.append('content', message);
      formData.append('messageType', messageType);
      
      if (attachment) {
        formData.append('media', attachment);
      }
      
      if (replyToId) {
        formData.append('replyTo', replyToId);
      }
      
      // Use axios progress tracking
      const config = {
        onUploadProgress: progressEvent => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
      };
      
      // Pass formData and config to sendMessage function
      const success = await onSendMessage(message, messageType, attachment, replyToId, formData, config);
      
      if (success) {
        setMessage('');
        setSelectedFile(null);
        setFilePreview(null);
        setUploadProgress(0);
        setIsUploading(false);
        
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        
        // Clear reply state
        if (replyingTo && onCancelReply) {
          onCancelReply();
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setIsUploading(false);
      alert('Failed to send message. Please try again.');
    }
  };

  // Toggle voice recording
  const toggleRecording = () => {
    if (isRecording) {
      // Stop recording
      clearInterval(recordingIntervalRef.current);
      setIsRecording(false);
      setRecordingTime(0);
      
      // In a real app, we would process the audio recording here
      alert('Voice recording feature would be implemented in a production app.');
    } else {
      // Start recording
      setIsRecording(true);
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    }
  };

  // Format recording time
  const formatRecordingTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Remove selected file
  const removeFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Helper to format file size
  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    const kb = bytes / 1024;
    if (kb < 1024) {
      return `${Math.round(kb * 10) / 10} KB`;
    }
    const mb = kb / 1024;
    return `${Math.round(mb * 10) / 10} MB`;
  };

  return (
    <div>
      {/* Reply Preview */}
      {replyingTo && (
        <div className="mb-2 p-2 bg-orange-50 rounded-lg border-l-4 border-orange-500 flex items-start">
          <div className="flex-1">
            <p className="text-xs font-medium text-gray-600">
              Replying to {replyingTo.sender.firstName}
            </p>
            <p className="text-sm text-gray-700 truncate">
              {replyingTo.content || (replyingTo.messageType !== 'text' ? `[${replyingTo.messageType}]` : '')}
            </p>
          </div>
          <button
            type="button"
            onClick={onCancelReply}
            className="text-gray-400 hover:text-orange-500"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
      
      {/* File Preview */}
      {filePreview && (
        <div className="mb-3 p-3 bg-orange-50 rounded-lg border border-orange-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              {filePreview.type.charAt(0).toUpperCase() + filePreview.type.slice(1)} Attachment
            </span>
            <button
              type="button"
              onClick={removeFile}
              className="text-gray-400 hover:text-orange-500"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          
          {filePreview.type === 'image' && (
            <div className="rounded-lg overflow-hidden">
              <img src={filePreview.url} alt={filePreview.name} className="max-h-48 max-w-full" />
            </div>
          )}
          
          {filePreview.type === 'video' && (
            <div className="rounded-lg overflow-hidden">
              <video src={filePreview.url} controls className="max-h-48 max-w-full" />
            </div>
          )}
          
          {filePreview.type === 'file' && (
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700 truncate">{filePreview.name}</p>
                {filePreview.size && (
                  <p className="text-xs text-gray-500">
                    {formatFileSize(filePreview.size)}
                  </p>
                )}
              </div>
            </div>
          )}
          
          {/* Upload Progress Bar */}
          {isUploading && (
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-orange-500 h-2.5 rounded-full transition-all duration-300 ease-in-out" 
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1 text-right">{uploadProgress}%</p>
            </div>
          )}
        </div>
      )}
      
      {/* Voice Recording UI */}
      {isRecording && (
        <div className="mb-3 p-3 bg-red-50 rounded-lg border border-red-200 flex items-center">
          <div className="mr-3 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium text-red-600">Recording... {formatRecordingTime(recordingTime)}</span>
          <button
            type="button"
            onClick={toggleRecording}
            className="ml-auto text-red-600 hover:text-red-800"
          >
            Stop
          </button>
        </div>
      )}
      
      {/* Message Input Form */}
      <form onSubmit={handleSubmit} className="flex items-end">
        {/* Attachment Button */}
        <div className="relative mr-2" ref={attachmentMenuRef}>
          <button
            type="button"
            onClick={() => setShowAttachmentOptions(!showAttachmentOptions)}
            className="flex items-center justify-center h-10 w-10 rounded-full text-gray-500 hover:text-orange-500 hover:bg-orange-50"
            disabled={disabled || isUploading}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" clipRule="evenodd" />
            </svg>
          </button>
          
          {/* Attachment Options Menu */}
          {showAttachmentOptions && (
            <div className="absolute bottom-full left-0 mb-2 bg-white shadow-lg rounded-lg py-2 w-48 z-10">
              <button
                type="button"
                onClick={() => {
                  fileInputRef.current.click();
                  setShowAttachmentOptions(false);
                }}
                className="flex items-center w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-500"
                disabled={disabled || isUploading}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-orange-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                </svg>
                Photo/Video
              </button>
              
              <button
                type="button"
                onClick={() => {
                  fileInputRef.current.click();
                  setShowAttachmentOptions(false);
                }}
                className="flex items-center w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-500"
                disabled={disabled || isUploading}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-orange-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                </svg>
                Document
              </button>
              
              <button
                type="button"
                onClick={() => {
                  setShowAttachmentOptions(false);
                  alert('Location sharing would be implemented in a production app.');
                }}
                className="flex items-center w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-500"
                disabled={disabled || isUploading}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-orange-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                Location
              </button>
            </div>
          )}
          
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/*,video/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/plain"
            disabled={disabled || isUploading}
          />
        </div>
        
        {/* Message Text Input */}
        <div className="flex-grow relative">
          <input
            type="text"
            ref={messageInputRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={disabled ? "Connecting..." : (isUploading ? "Uploading..." : "Type a message...")}
            disabled={disabled || isUploading}
            className="w-full py-2 px-4 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
          
          {/* Emoji Picker Button */}
          <button
            type="button"
            className="absolute right-14 inset-y-0 flex items-center justify-center text-gray-500 hover:text-orange-500"
            onClick={() => alert('Emoji picker would be implemented in a production app.')}
            disabled={disabled || isUploading}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-.464 5.535a1 1 0 10-1.415-1.414 3 3 0 01-4.242 0 1 1 0 00-1.415 1.414 5 5 0 007.072 0z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        
        {/* Voice Message or Send Button */}
        <div className="ml-2">
          {message.trim() || selectedFile ? (
            <button
              type="submit"
              className="flex items-center justify-center h-10 w-10 rounded-full bg-orange-500 text-white hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
              disabled={disabled || isUploading}
            >
              {isUploading ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={toggleRecording}
              className={`flex items-center justify-center h-10 w-10 rounded-full ${
                isRecording ? 'bg-red-500 text-white' : 'text-gray-500 hover:bg-orange-50 hover:text-orange-500'
              }`}
              disabled={disabled || isUploading}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
              </svg>
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default MessageInput;