import React, { useEffect, useRef, useState } from 'react';
import Message from './Message';
import MessageReactions from './MessageReactions';

const MessageList = ({
  messages,
  currentUser,
  formatDate,
  shouldShowDateSeparator,
  participant,
  onMessageRead,
  onReply,
  onDelete,
  onReact,
  onRemoveReaction
}) => {
  // Create refs to track which messages are visible
  const messageRefs = useRef({});
  const [activeMessageActions, setActiveMessageActions] = useState(null);
  
  // Setup intersection observer to mark messages as read when they become visible
  useEffect(() => {
    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0.5,
    };

    const handleIntersection = (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const messageId = entry.target.dataset.messageId;
          const message = messages.find(msg => msg._id === messageId);
          
          if (message && !message.read && message.sender._id !== currentUser._id) {
            onMessageRead(messageId, message.chatId);
          }
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersection, options);
    
    // Observe all unread messages from other users
    Object.values(messageRefs.current).forEach(node => {
      if (node) observer.observe(node);
    });

    return () => {
      if (observer) {
        observer.disconnect();
      }
    };
  }, [messages, currentUser._id, onMessageRead]);

  // Close message actions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (activeMessageActions) {
        const actionsElement = document.getElementById(`message-actions-${activeMessageActions}`);
        if (actionsElement && !actionsElement.contains(event.target)) {
          setActiveMessageActions(null);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeMessageActions]);

  // Toggle message actions menu
  const toggleMessageActions = (messageId) => {
    setActiveMessageActions(messageId === activeMessageActions ? null : messageId);
  };

  // Handle reply to message
  const handleReply = (message) => {
    setActiveMessageActions(null);
    onReply(message);
  };

  // Handle delete message
  const handleDelete = (messageId) => {
    setActiveMessageActions(null);
    onDelete(messageId);
  };

  return (
    <div className="space-y-3 w-full">
      {messages.map((message, index) => {
        const prevMessage = index > 0 ? messages[index - 1] : null;
        const showDateSeparator = shouldShowDateSeparator(message, prevMessage);
        
        // Make sure this comparison is correct - ensure message.sender._id is correctly compared to currentUser._id
        const isCurrentUser = message.sender && currentUser && message.sender._id === currentUser._id;
        
        const isConsecutive = prevMessage && 
                            prevMessage.sender._id === message.sender._id &&
                            !shouldShowDateSeparator(message, prevMessage);
        
        // Calculate if we should show the time
        const showTime = !isConsecutive || 
                        (prevMessage && 
                        (new Date(message.createdAt) - new Date(prevMessage.createdAt)) > 5 * 60 * 1000);
        
        return (
          <React.Fragment key={message._id}>
            {showDateSeparator && (
              <div className="flex items-center my-4">
                <div className="flex-1 border-t border-gray-200"></div>
                <span className="mx-4 text-xs font-medium text-gray-500">
                  {formatDate(message.createdAt)}
                </span>
                <div className="flex-1 border-t border-gray-200"></div>
              </div>
            )}
            
            <div 
              ref={el => {
                if (!isCurrentUser && !message.read) {
                  messageRefs.current[message._id] = el;
                }
              }}
              data-message-id={message._id}
              className="relative group w-full"
            >
              {/* Debug output to check isCurrentUser value - remove in production */}
              {/* <div className="text-xs text-gray-400">{isCurrentUser ? 'Current User' : 'Other User'}</div> */}
              
              <div className={`flex items-start w-full ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                <Message
                  message={message}
                  isCurrentUser={isCurrentUser}
                  isConsecutive={isConsecutive}
                  showTime={showTime}
                  participant={!isCurrentUser ? message.sender : participant}
                  currentUser={currentUser}
                />
                
                {/* Message actions button */}
                {!message.deleted && (
                  <button
                    onClick={() => toggleMessageActions(message._id)}
                    className={`ml-2 p-1 rounded-full ${
                      activeMessageActions === message._id 
                        ? 'bg-gray-200 text-gray-700' 
                        : 'opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-700 hover:bg-gray-100'
                    } transition-opacity`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                )}
              </div>
              
              {/* Message actions menu */}
              {activeMessageActions === message._id && !message.deleted && (
                <div 
                  id={`message-actions-${message._id}`}
                  className={`absolute top-0 ${isCurrentUser ? 'right-0' : 'left-0'} mt-6 bg-white shadow-lg rounded-md z-10 overflow-hidden`}
                >
                  <div className="py-1 min-w-32">
                    <button
                      onClick={() => handleReply(message)}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-500 flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                      </svg>
                      Reply
                    </button>
                    
                    {isCurrentUser && (
                      <button
                        onClick={() => handleDelete(message._id)}
                        className="w-full px-4 py-2 text-left text-sm text-red-500 hover:bg-red-50 flex items-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              )}
              
              {/* Message reactions - only render if message has reactions */}
              {!message.deleted && message.reactions && message.reactions.length > 0 && (
                <div className={`mt-1 ${isCurrentUser ? 'mr-10 flex justify-end' : 'ml-10'}`}>
                  <MessageReactions
                    message={message}
                    currentUser={currentUser}
                    onReact={onReact}
                    onRemoveReaction={onRemoveReaction}
                  />
                </div>
              )}
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default MessageList;
