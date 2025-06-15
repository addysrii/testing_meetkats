import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const StoryViewPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeStoryGroup, setActiveStoryGroup] = useState(null);
  const [activeStoryIndex, setActiveStoryIndex] = useState(0);
  const [storyContent, setStoryContent] = useState([]);
  const [storyProgress, setStoryProgress] = useState(0);
  const [replyText, setReplyText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const storyIntervalRef = useRef(null);
  const videoRef = useRef(null);

  // Reactions available for stories
  const reactions = [
    { emoji: '❤️', name: 'heart' },
    { emoji: '😂', name: 'laugh' },
    { emoji: '😮', name: 'wow' },
    { emoji: '😢', name: 'sad' },
    { emoji: '😡', name: 'angry' },
    { emoji: '🔥', name: 'fire' }
  ];

  // Get story data from navigation state
  useEffect(() => {
    if (location.state?.initialStoryGroup) {
      const { initialStoryGroup, initialIndex = 0 } = location.state;
      setActiveStoryGroup(initialStoryGroup);
      setActiveStoryIndex(initialIndex);
      setStoryContent(initialStoryGroup.stories);
    } else {
      // Redirect back if no story data
      navigate('/dashboard');
    }
  }, [location, navigate]);

  // Story timer/progress
  useEffect(() => {
    if (!storyContent.length) return;
    
    // Reset progress
    setStoryProgress(0);
    
    // If it's a video story, use video duration for timing
    const currentStory = storyContent[activeStoryIndex];
    if (currentStory && currentStory.mediaType === 'video' && videoRef.current) {
      // Let the video control timing
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(err => console.error('Error playing video:', err));
      
      // Clear any existing interval
      if (storyIntervalRef.current) {
        clearInterval(storyIntervalRef.current);
      }
      
      // Set up interval to update progress based on video playback
      storyIntervalRef.current = setInterval(() => {
        if (videoRef.current) {
          const progress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
          setStoryProgress(progress);
          
          // Move to next story when video ends
          if (videoRef.current.ended || progress >= 100) {
            clearInterval(storyIntervalRef.current);
            goToNextStory();
          }
        }
      }, 50);
    } else {
      // For images, use timer-based progress (5 seconds per story)
      if (storyIntervalRef.current) {
        clearInterval(storyIntervalRef.current);
      }
      
      storyIntervalRef.current = setInterval(() => {
        setStoryProgress(prev => {
          if (prev >= 100) {
            clearInterval(storyIntervalRef.current);
            goToNextStory();
            return 0;
          }
          return prev + (100 / (5 * 20)); // Progress increments for 5 seconds
        });
      }, 50); // Update every 50ms
    }
    
    // Mark current story as viewed
    markStoryAsViewed();
    
    return () => {
      if (storyIntervalRef.current) {
        clearInterval(storyIntervalRef.current);
      }
    };
  }, [activeStoryIndex, storyContent]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (storyIntervalRef.current) {
        clearInterval(storyIntervalRef.current);
      }
    };
  }, []);

  // Mark story as viewed
  const markStoryAsViewed = async () => {
    try {
      if (storyContent[activeStoryIndex] && !storyContent[activeStoryIndex].viewed) {
        await api.viewStory(storyContent[activeStoryIndex]._id);
        
        // Update local state
        const updatedStories = [...storyContent];
        updatedStories[activeStoryIndex] = {
          ...updatedStories[activeStoryIndex],
          viewed: true
        };
        setStoryContent(updatedStories);
      }
    } catch (error) {
      console.error('Error marking story as viewed:', error);
    }
  };

  // Navigate to next story
  const goToNextStory = () => {
    // If there are more stories in this group
    if (activeStoryIndex < storyContent.length - 1) {
      setActiveStoryIndex(activeStoryIndex + 1);
    } else {
      // End of current user's stories, navigate back
      navigate('/dashboard');
    }
  };

  // Navigate to previous story
  const goToPrevStory = () => {
    if (activeStoryIndex > 0) {
      setActiveStoryIndex(activeStoryIndex - 1);
    } else {
      // At the first story, go back to dashboard
      navigate('/dashboard');
    }
  };

  // React to a story
  const handleReaction = async (reaction) => {
    try {
      if (!storyContent[activeStoryIndex]) return;
      
      setShowReactions(false);
      await api.reactToStory(storyContent[activeStoryIndex]._id, reaction);
      
      // Show brief visual confirmation
      // Could implement a small animation or notification here
    } catch (error) {
      console.error('Error sending reaction:', error);
    }
  };

  // Send a reply to the story
  const handleSendReply = async () => {
    if (!replyText.trim() || !storyContent[activeStoryIndex]) return;
    
    try {
      setIsSubmitting(true);
      await api.replyToStory(storyContent[activeStoryIndex]._id, replyText);
      setReplyText('');
      setIsSubmitting(false);
      
      // Show brief confirmation
      // Could implement a small animation or notification here
    } catch (error) {
      console.error('Error sending reply:', error);
      setIsSubmitting(false);
    }
  };

  // Pause story progression when user is interacting with reply or reactions
  const handleInteractionStart = () => {
    if (storyIntervalRef.current) {
      clearInterval(storyIntervalRef.current);
    }
    
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };

  // Resume story progression when user is done interacting
  const handleInteractionEnd = () => {
    // Resume progress for the current story
    if (storyContent[activeStoryIndex]?.mediaType === 'video' && videoRef.current) {
      videoRef.current.play().catch(err => console.error('Error playing video:', err));
      
      storyIntervalRef.current = setInterval(() => {
        if (videoRef.current) {
          const progress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
          setStoryProgress(progress);
          
          if (videoRef.current.ended || progress >= 100) {
            clearInterval(storyIntervalRef.current);
            goToNextStory();
          }
        }
      }, 50);
    } else {
      // For images
      storyIntervalRef.current = setInterval(() => {
        setStoryProgress(prev => {
          if (prev >= 100) {
            clearInterval(storyIntervalRef.current);
            goToNextStory();
            return 0;
          }
          return prev + (100 / (5 * 20));
        });
      }, 50);
    }
  };

  // Format time since story creation
  const formatTimeSince = (timestamp) => {
    const now = new Date();
    const storyTime = new Date(timestamp);
    const diffMinutes = Math.floor((now - storyTime) / (1000 * 60));
    
    if (diffMinutes < 60) return `${diffMinutes}m`;
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h`;
    
    return '1d'; // Stories disappear after 24h anyway
  };

  // If no active story group, show loading or redirect
  if (!activeStoryGroup || !storyContent.length) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  const currentStory = storyContent[activeStoryIndex];

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center">
      {/* Story progress indicators */}
      <div className="absolute top-2 left-0 right-0 z-10 px-4">
        <div className="flex space-x-1">
          {storyContent.map((story, index) => (
            <div 
              key={story._id} 
              className="h-1 bg-gray-600 flex-1 rounded-full overflow-hidden"
            >
              <div 
                className="h-full bg-white"
                style={{ 
                  width: index === activeStoryIndex 
                    ? `${storyProgress}%` 
                    : index < activeStoryIndex 
                      ? '100%' 
                      : '0%' 
                }}
              ></div>
            </div>
          ))}
        </div>
      </div>

      {/* User info */}
      <div className="absolute top-4 left-4 flex items-center z-10">
        <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-600 border border-white">
          {activeStoryGroup.author.profilePicture ? (
            <img 
              src={activeStoryGroup.author.profilePicture} 
              alt={activeStoryGroup.author.firstName}
              className="w-full h-full object-cover" 
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-orange-500 text-white text-xs font-bold">
              {activeStoryGroup.author.firstName.charAt(0)}
              {activeStoryGroup.author.lastName.charAt(0)}
            </div>
          )}
        </div>
        <div className="ml-2 text-white">
          <p className="text-sm font-semibold">
            {activeStoryGroup.author.firstName} {activeStoryGroup.author.lastName}
          </p>
          <p className="text-xs opacity-80">
            {formatTimeSince(currentStory.createdAt)}
          </p>
        </div>
      </div>

      {/* Close button */}
      <button 
        className="absolute top-4 right-4 z-10 text-white"
        onClick={() => navigate('/dashboard')}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Navigation buttons */}
      <button 
        className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white z-10 h-10 w-10 flex items-center justify-center"
        onClick={goToPrevStory}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      
      <button 
        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white z-10 h-10 w-10 flex items-center justify-center"
        onClick={goToNextStory}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Story content */}
      <div className="w-full h-full max-w-lg max-h-full flex items-center justify-center">
        {currentStory.mediaType === 'image' ? (
          <img 
            src={currentStory.mediaUrl} 
            alt="Story" 
            className="max-h-full max-w-full object-contain"
          />
        ) : (
          <video 
            ref={videoRef}
            src={currentStory.mediaUrl} 
            className="max-h-full max-w-full object-contain" 
            playsInline
            muted={false}
          />
        )}
        
        {/* Story text overlay */}
        {currentStory.content && (
          <div className="absolute bottom-20 left-0 right-0 px-4 text-center">
            <p className="text-white text-lg font-semibold shadow-text">
              {currentStory.content}
            </p>
          </div>
        )}
      </div>

      {/* Reaction button and panel */}
      <div className="absolute bottom-16 left-4 z-10">
        <button 
          className="text-white bg-gray-800 bg-opacity-60 rounded-full p-2"
          onClick={() => setShowReactions(!showReactions)}
          onFocus={handleInteractionStart}
          onBlur={handleInteractionEnd}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
        
        {showReactions && (
          <div 
            className="absolute bottom-12 left-0 bg-gray-800 bg-opacity-80 rounded-full py-2 px-3 flex space-x-2"
            onMouseEnter={handleInteractionStart}
            onMouseLeave={handleInteractionEnd}
          >
            {reactions.map((reaction) => (
              <button 
                key={reaction.name}
                className="text-xl hover:transform hover:scale-125 transition-transform"
                onClick={() => handleReaction(reaction.name)}
              >
                {reaction.emoji}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Reply input */}
      <div className="absolute bottom-4 left-4 right-4 flex z-10">
        <input 
          type="text" 
          value={replyText}
          onChange={(e) => setReplyText(e.target.value)}
          placeholder="Reply to story..."
          className="flex-1 bg-gray-800 bg-opacity-60 text-white rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
          onFocus={handleInteractionStart}
          onBlur={handleInteractionEnd}
        />
        <button 
          className="ml-2 bg-orange-500 text-white rounded-full p-2 disabled:opacity-50"
          onClick={handleSendReply}
          disabled={!replyText.trim() || isSubmitting}
        >
          {isSubmitting ? (
            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          )}
        </button>
      </div>

      {/* CSS for text shadow */}
      <style jsx>{`
        .shadow-text {
          text-shadow: 0 1px 3px rgba(0, 0, 0, 0.8);
        }
      `}</style>
    </div>
  );
};

export default StoryViewPage;