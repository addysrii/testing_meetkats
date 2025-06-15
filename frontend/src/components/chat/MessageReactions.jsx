import React, { useState, useRef, useEffect } from 'react';

const MessageReactions = ({ 
  message, 
  currentUser, 
  onReact, 
  onRemoveReaction 
}) => {
  const [showReactions, setShowReactions] = useState(false);
  const reactionsRef = useRef(null);
  
  // Common emoji reactions
  const availableReactions = [
    { emoji: '👍', name: 'thumbs_up' },
    { emoji: '❤️', name: 'heart' },
    { emoji: '😂', name: 'laugh' },
    { emoji: '😮', name: 'wow' },
    { emoji: '😢', name: 'sad' },
    { emoji: '🔥', name: 'fire' }
  ];

  // Close reaction panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (reactionsRef.current && !reactionsRef.current.contains(event.target)) {
        setShowReactions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Check if user has reacted to this message
  const hasUserReacted = () => {
    if (!message.reactions || !currentUser) return false;
    
    return message.reactions.some(reaction => 
      reaction.userId === currentUser._id
    );
  };

  // Get user's current reaction
  const getUserReaction = () => {
    if (!message.reactions || !currentUser) return null;
    
    const userReaction = message.reactions.find(reaction => 
      reaction.userId === currentUser._id
    );
    
    return userReaction ? userReaction.type : null;
  };

  // Count reactions by type
  const getReactionCounts = () => {
    if (!message.reactions || message.reactions.length === 0) return {};
    
    return message.reactions.reduce((counts, reaction) => {
      counts[reaction.type] = (counts[reaction.type] || 0) + 1;
      return counts;
    }, {});
  };

  // Handle reaction click
  const handleReaction = (reactionType) => {
    const userReaction = getUserReaction();
    
    if (userReaction === reactionType) {
      // Remove reaction if clicking the same one
      onRemoveReaction(message._id);
    } else {
      // Add or change reaction
      onReact(message._id, reactionType);
    }
    
    setShowReactions(false);
  };

  // Toggle reaction panel
  const toggleReactions = () => {
    setShowReactions(!showReactions);
  };

  // Get emoji for a reaction type
  const getEmojiForReaction = (reactionType) => {
    const reaction = availableReactions.find(r => r.name === reactionType);
    return reaction ? reaction.emoji : '👍';
  };

  const reactionCounts = getReactionCounts();
  const totalReactions = message.reactions ? message.reactions.length : 0;

  return (
    <div className="relative" ref={reactionsRef}>
      {/* Reaction button */}
      <button
        onClick={toggleReactions}
        className={`text-xs flex items-center px-2 py-1 rounded-full ${
          hasUserReacted() 
            ? 'bg-orange-100 text-orange-600' 
            : 'text-gray-500 hover:bg-gray-100'
        }`}
      >
        {hasUserReacted() ? (
          <span className="mr-1">{getEmojiForReaction(getUserReaction())}</span>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )}
        {totalReactions > 0 && <span>{totalReactions}</span>}
      </button>
      
      {/* Reaction picker */}
      {showReactions && (
        <div className="absolute bottom-full left-0 mb-2 bg-white shadow-lg rounded-full z-10 p-1 flex">
          {availableReactions.map(reaction => (
            <button
              key={reaction.name}
              onClick={() => handleReaction(reaction.name)}
              className={`p-1 text-lg hover:bg-gray-100 rounded-full transition-transform hover:scale-110 ${
                getUserReaction() === reaction.name ? 'bg-orange-100' : ''
              }`}
              title={reaction.name.replace('_', ' ')}
            >
              {reaction.emoji}
            </button>
          ))}
        </div>
      )}
      
      {/* Display reactions if any */}
      {totalReactions > 0 && !showReactions && (
        <div className="mt-1 flex flex-wrap gap-1">
          {Object.entries(reactionCounts).map(([type, count]) => (
            <span 
              key={type} 
              className={`text-xs px-1.5 py-0.5 rounded-full flex items-center ${
                getUserReaction() === type 
                  ? 'bg-orange-100 text-orange-600' 
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {getEmojiForReaction(type)}
              {count > 1 && <span className="ml-1">{count}</span>}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default MessageReactions;