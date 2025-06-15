import React from 'react';

const Message = ({
  message,
  isCurrentUser,
  isConsecutive,
  showTime,
  participant,
  currentUser
}) => {
  // Format the time
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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

  // Render different message types
  const renderMessageContent = () => {
    switch (message.messageType) {
      case 'image':
        return (
          <div className="rounded-lg overflow-hidden max-w-xs">
            <img 
              src={message.mediaUrl} 
              alt="Shared image" 
              className="max-w-full h-auto"
              onClick={() => window.open(message.mediaUrl, '_blank')}
            />
            {message.content && (
              <p className="mt-1 text-sm text-gray-700">{message.content}</p>
            )}
          </div>
        );
        
      case 'video':
        return (
          <div className="rounded-lg overflow-hidden max-w-xs">
            <video 
              src={message.mediaUrl} 
              controls 
              className="max-w-full h-auto"
            />
            {message.content && (
              <p className="mt-1 text-sm text-gray-700">{message.content}</p>
            )}
          </div>
        );
        
      case 'file':
        return (
          <div className="flex items-center p-3 bg-gray-100 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <div className="ml-3">
              <p className="text-sm font-medium text-orange-600 hover:underline cursor-pointer">
                <a href={message.mediaUrl} target="_blank" rel="noopener noreferrer">
                  {message.fileName || 'Download file'}
                </a>
              </p>
              {message.fileSize && (
                <p className="text-xs text-gray-500">
                  {formatFileSize(message.fileSize)}
                </p>
              )}
            </div>
          </div>
        );
        
      case 'location':
        return (
          <div className="rounded-lg overflow-hidden max-w-xs">
            <div className="bg-gray-100 p-3 rounded-lg">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-orange-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                <span className="ml-2 text-sm font-medium text-gray-700">Location shared</span>
              </div>
              {message.metadata && message.metadata.address && (
                <p className="mt-1 text-sm text-gray-600">{message.metadata.address}</p>
              )}
            </div>
          </div>
        );
        
      case 'call':
        return (
          <div className="flex items-center p-2 bg-gray-100 rounded-lg">
            {message.metadata?.callType === 'audio' ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-orange-500" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-orange-500" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                <path d="M14 6a1 1 0 00-1 1v5a1 1 0 001 1h3a1 1 0 001-1V8a1 1 0 00-1-1h-3z" />
              </svg>
            )}
            <span className="ml-2 text-sm text-gray-700">{message.content}</span>
          </div>
        );
        
      case 'poll':
        return (
          <div className="bg-gray-100 p-3 rounded-lg">
            <p className="font-medium text-gray-800">Poll: {message.content}</p>
            {message.metadata && (
              <p className="text-sm text-orange-500 hover:underline cursor-pointer mt-1">
                View poll
              </p>
            )}
          </div>
        );
        
      case 'text':
      default:
        return (
          <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
            isCurrentUser 
              ? 'bg-orange-500 text-white' 
              : 'bg-gray-200 text-gray-800'
          }`}>
            {message.replyTo && (
              <div className={`border-l-2 pl-2 mb-1 text-xs ${
                isCurrentUser ? 'border-orange-300 text-orange-100' : 'border-gray-400 text-gray-600'
              }`}>
                <p className="font-medium">
                  {message.replyTo.sender._id === currentUser?._id 
                    ? 'You' 
                    : `${message.replyTo.sender.firstName}`}
                </p>
                <p className="truncate">{message.replyTo.content}</p>
              </div>
            )}
            <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
          </div>
        );
    }
  };

  return (
    <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} ${isConsecutive ? 'mt-1' : 'mt-3'}`}>
      {/* Avatar - only show for first message in a series or after time gap */}
      {!isCurrentUser && !isConsecutive && (
        <div className="flex-shrink-0 mr-2">
          {participant?.profilePicture ? (
            <img
              src={participant.profilePicture}
              alt={`${participant.firstName} ${participant.lastName}`}
              className="h-8 w-8 rounded-full object-cover"
            />
          ) : (
            <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center">
              <span className="text-xs font-medium text-orange-600">
                {participant?.firstName?.charAt(0)}
                {participant?.lastName?.charAt(0)}
              </span>
            </div>
          )}
        </div>
      )}
      
      {/* Message bubble with spacing for avatar */}
      <div className={`flex flex-col ${!isCurrentUser && isConsecutive ? 'ml-10' : ''}`}>
        {/* Sender name for first message in a series - only in non-direct chats */}
        {!isCurrentUser && !isConsecutive && participant && (
          <span className="text-xs text-gray-500 mb-1 ml-1">
            {participant.firstName} {participant.lastName}
          </span>
        )}
        
        <div className="flex items-end">
          {renderMessageContent()}
          
          {/* Message status and time */}
          {isCurrentUser && (
            <div className="ml-2 flex flex-col items-end">
              {showTime && (
                <span className="text-xs text-gray-500">
                  {formatTime(message.createdAt)}
                </span>
              )}
              {message.read ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-orange-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 100-12 6 6 0 000 12zm2-7a1 1 0 10-2 0v3a1 1 0 102 0V9z" clipRule="evenodd" />
                </svg>
              )}
            </div>
          )}
          
          {/* Just time for non-user messages */}
          {!isCurrentUser && showTime && (
            <span className="ml-1 text-xs text-gray-500 self-start">
              {formatTime(message.createdAt)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default Message;
