// frontend/src/components/chat/EnhancedChatWindow.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import MessageInput from './MessageInput';
import MessageList from './MessageList';
import CallInterface from './CallInterface';
import api from '../../services/api';
import enhancedSocketManager from '../../services/socketmanager';

const EnhancedChatWindow = ({
  chat,
  currentUser,
  sendMessage,
  sendTypingIndicator,
  sendReadReceipt,
  typingUsers,
  onlineUsers,
  socketStatus,
  showSidebarToggle = false,
  onToggleSidebar = () => {}
}) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const [activeCall, setActiveCall] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [messageSending, setMessageSending] = useState({});
  const [messageRetries, setMessageRetries] = useState({});
  const [unreadMessages, setUnreadMessages] = useState([]);
  const [newMessageNotification, setNewMessageNotification] = useState(null);
  const [lastReadIndex, setLastReadIndex] = useState(-1);
  const [imageLoading, setImageLoading] = useState({});
  
  const messageEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const isInitialLoad = useRef(true);
  const previousScrollHeightRef = useRef(0);
  const observedMessagesRef = useRef(new Set());
  const chatIdRef = useRef(chat?._id);
  
  // Handle chat change
  useEffect(() => {
    if (chatIdRef.current !== chat?._id) {
      observedMessagesRef.current = new Set();
      chatIdRef.current = chat?._id;
    }
  }, [chat?._id]);

  // Get the other participant in a direct chat
  const getParticipant = () => {
    if (chat?.type === 'direct') {
      return chat.participants.find(p => p._id !== currentUser._id);
    }
    return null;
  };

  const participant = getParticipant();
  const isOnline = participant && onlineUsers[participant._id];
  
  // Setup intersection observer for read receipts
  useEffect(() => {
    if (!messagesContainerRef.current) return;
    
    const options = {
      root: messagesContainerRef.current,
      rootMargin: '0px',
      threshold: 0.5
    };

    const handleIntersection = (entries) => {
      const newlyReadMessages = [];
      
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const messageId = entry.target.dataset.messageId;
          const message = messages.find(msg => msg._id === messageId);
          
          if (message && 
              !message.read && 
              message.sender._id !== currentUser._id && 
              !observedMessagesRef.current.has(messageId)) {
            
            observedMessagesRef.current.add(messageId);
            newlyReadMessages.push({
              messageId,
              chatId: chat._id
            });
          }
        }
      });
      
      // Send batch read receipts
      if (newlyReadMessages.length > 0 && socketStatus === 'CONNECTED') {
        newlyReadMessages.forEach(data => {
          sendReadReceipt(data.messageId, data.chatId);
        });
      }
    };

    const observer = new IntersectionObserver(handleIntersection, options);
    
    // Observe unread messages from other users
    const messageElements = document.querySelectorAll('[data-message-id]');
    messageElements.forEach(element => {
      const messageId = element.dataset.messageId;
      const message = messages.find(msg => msg._id === messageId);
      
      if (message && 
          !message.read && 
          message.sender._id !== currentUser._id && 
          !observedMessagesRef.current.has(messageId)) {
        observer.observe(element);
      }
    });

    return () => {
      if (observer) {
        observer.disconnect();
      }
    };
  }, [messages, currentUser._id, sendReadReceipt, chat, socketStatus]);

  // Load initial messages
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true);
        setMessages([]);
        isInitialLoad.current = true;
        
        const response = await api.getMessages(chat._id);
        
        setMessages(response.messages);
        setHasMore(response.hasMore);
        setNextCursor(response.nextCursor);
        setLoading(false);
        
        // Mark unread messages as read
        if (response.messages.length > 0) {
          const unreadMessages = response.messages.filter(
            msg => !msg.read && msg.sender._id !== currentUser._id
          );
          
          if (unreadMessages.length > 0) {
            setUnreadMessages(unreadMessages.map(msg => msg._id));
            
            // Send read receipts for visible messages
            const visibleUnreadMessages = unreadMessages.filter(msg => {
              // Logic to determine if message is visible in the viewport
              // For simplicity, we'll consider last 5 messages as visible
              const index = response.messages.findIndex(m => m._id === msg._id);
              return index >= response.messages.length - 5;
            });
            
            visibleUnreadMessages.forEach(message => {
              sendReadReceipt(message._id, chat._id);
              observedMessagesRef.current.add(message._id);
            });
          }
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
        setError('Failed to load messages. Please try again.');
        setLoading(false);
      }
    };

    if (chat?._id) {
      fetchMessages();
    }
  }, [chat?._id, currentUser._id, sendReadReceipt]);

  // Manage scroll position when loading more messages
  useEffect(() => {
    if (messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      
      // Save current scroll height before messages are updated
      previousScrollHeightRef.current = container.scrollHeight;
    }
  }, [loadingMore]);

  // Restore scroll position after loading more messages
  useEffect(() => {
    if (loadingMore && messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      const newScrollHeight = container.scrollHeight;
      const scrollDifference = newScrollHeight - previousScrollHeightRef.current;
      
      // Adjust scroll position to maintain relative position
      container.scrollTop = scrollDifference;
      setLoadingMore(false);
    }
  }, [messages, loadingMore]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (isInitialLoad.current && messages.length > 0) {
      messageEndRef.current?.scrollIntoView({ behavior: 'auto' });
      isInitialLoad.current = false;
    } else if (!isInitialLoad.current && messages.length > 0) {
      // Check if we're already at the bottom
      const container = messagesContainerRef.current;
      if (container) {
        const isAtBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;
        if (isAtBottom) {
          messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        } else {
          // If not at bottom and it's a new message not from current user,
          // show a "new message" notification
          const lastMessage = messages[messages.length - 1];
          if (lastMessage && lastMessage.sender._id !== currentUser._id) {
            setNewMessageNotification(lastMessage);
          }
        }
      }
    }
  }, [messages, currentUser._id]);

  // Handle socket events for new messages and other updates
  useEffect(() => {
    if (!chat) return;
    
    // Direct handler for new messages
    const directMessageHandler = (data) => {
      // Skip if not for this chat
      if (data.chatRoom !== chat._id) {
        return;
      }
      
      // Update messages state
      setMessages(prevMessages => {
        // Check if message already exists
        const messageExists = prevMessages.some(msg => msg._id === data._id);
        
        if (messageExists) {
          return prevMessages;
        }
        
        // Add new message
        const newMessages = [...prevMessages, data];
        
        // Mark as read if not from current user and user is active
        if (data.sender._id !== currentUser._id && document.visibilityState === 'visible') {
          sendReadReceipt(data._id, chat._id);
          observedMessagesRef.current.add(data._id);
        }
        
        return newMessages;
      });
    };

    // Handler for message updates
    const messageUpdatedHandler = (data) => {
      const { messageId, updateType, updatedData } = data;
      
      if (data.chatId !== chat._id) return;
      
      // Update the message in state
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg._id === messageId 
            ? { ...msg, ...updatedData } 
            : msg
        )
      );
    };

    // Handler for message deletions
    const messageDeletedHandler = (data) => {
      if (data.chatId !== chat._id) return;
      
      // Mark message as deleted in state
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg._id === data.messageId 
            ? { ...msg, deleted: true, content: 'This message was deleted' } 
            : msg
        )
      );
    };

    // Handler for messages being marked as read
    const messageReadHandler = (data) => {
      if (data.chatId !== chat._id) return;
      
      // Update read status for message
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg._id === data.messageId 
            ? { ...msg, read: true } 
            : msg
        )
      );
    };

    // Handler for incoming calls
    const callStartedHandler = (data) => {
      // Only handle calls for this chat
      if (chat._id !== data.chatId) return;
      
      // Only show incoming call UI if we're not the initiator
      if (data.initiator._id !== currentUser._id) {
        setActiveCall({
          callId: data.callId,
          type: data.type,
          initiator: data.initiator,
          participant: currentUser,
          status: 'connecting'
        });
      }
    };

    // Handler for call status updates
    const callAcceptedHandler = (data) => {
      // Update call status
      if (activeCall && activeCall.callId === data.callId) {
        setActiveCall(prev => ({
          ...prev,
          status: 'ongoing'
        }));
      }
    };

    const callDeclinedHandler = (data) => {
      // End call if it matches our active call
      if (activeCall && activeCall.callId === data.callId) {
        setActiveCall(null);
      }
    };

    const callEndedHandler = (data) => {
      // End call if it matches our active call
      if (activeCall && activeCall.callId === data.callId) {
        setActiveCall(null);
      }
    };

    // Handler for message reactions
    const messageReactionHandler = (data) => {
      if (data.chatId !== chat._id) return;
      
      // Update message reactions
      setMessages(prevMessages => 
        prevMessages.map(msg => {
          if (msg._id === data.messageId) {
            // Get current reactions or empty array
            const currentReactions = msg.reactions || [];
            
            // Filter out any existing reaction from this user
            const filteredReactions = currentReactions.filter(r => r.userId !== data.userId);
            
            // Add the new reaction
            const updatedReactions = [
              ...filteredReactions,
              {
                userId: data.userId,
                type: data.reaction,
                createdAt: new Date().toISOString()
              }
            ];
            
            return {
              ...msg,
              reactions: updatedReactions
            };
          }
          return msg;
        })
      );
    };

    const reactionRemovedHandler = (data) => {
      if (data.chatId !== chat._id) return;
      
      // Remove reaction from message
      setMessages(prevMessages => 
        prevMessages.map(msg => {
          if (msg._id === data.messageId) {
            return {
              ...msg,
              reactions: (msg.reactions || []).filter(r => r.userId !== data.userId)
            };
          }
          return msg;
        })
      );
    };
// Continuing from the previous file...

    // Handler for message delivery confirmations
    const messageDeliveredHandler = (data) => {
      if (data.chatId !== chat._id) return;
      
      // Update message status
      setMessageSending(prev => ({
        ...prev,
        [data.messageId]: false
      }));
      
      // Update message in state with server-assigned ID if needed
      if (data.clientMessageId && data.messageId !== data.clientMessageId) {
        setMessages(prevMessages => 
          prevMessages.map(msg => 
            msg._id === data.clientMessageId 
              ? { ...msg, _id: data.messageId } 
              : msg
          )
        );
      }
    };

    // Handler for message delivery errors
    const messageErrorHandler = (data) => {
      if (data.chatId !== chat._id) return;
      
      // Update message sending status
      setMessageSending(prev => ({
        ...prev,
        [data.messageId]: false
      }));
      
      // Increment retry count
      setMessageRetries(prev => ({
        ...prev,
        [data.messageId]: (prev[data.messageId] || 0) + 1
      }));
    };

    // Register socket handlers
    const handlers = [
      enhancedSocketManager.on('new_message', directMessageHandler),
      enhancedSocketManager.on('message_updated', messageUpdatedHandler),
      enhancedSocketManager.on('message_deleted', messageDeletedHandler),
      enhancedSocketManager.on('message_read', messageReadHandler),
      enhancedSocketManager.on('call_started', callStartedHandler),
      enhancedSocketManager.on('call_accepted', callAcceptedHandler),
      enhancedSocketManager.on('call_declined', callDeclinedHandler),
      enhancedSocketManager.on('call_ended', callEndedHandler),
      enhancedSocketManager.on('message_reaction', messageReactionHandler),
      enhancedSocketManager.on('reaction_removed', reactionRemovedHandler),
      enhancedSocketManager.on('message_delivered', messageDeliveredHandler),
      enhancedSocketManager.on('message_error', messageErrorHandler)
    ];
    
    // Cleanup event handlers
    return () => {
      handlers.forEach(unsubscribe => unsubscribe());
    };
  }, [chat, currentUser._id, activeCall, sendReadReceipt]);

  // Load more messages when scrolling to the top
// Enhanced loadMoreMessages function with better error handling and data validation
const loadMoreMessages = async () => {
  if (!hasMore || loadingMore || !chat?._id) return;
  
  try {
    setLoadingMore(true);
    
    // Log the current state before making the request
    console.log('Loading more messages with params:', { 
      chatId: chat._id, 
      nextCursor, 
      messagesCount: messages.length 
    });
    
    // Make the API request with additional error handling
    let response;
    try {
      response = await api.getMessages(chat._id, { before: nextCursor });
    } catch (apiError) {
      console.error('API Error details:', apiError.response?.data || apiError.message);
      throw apiError;
    }
    
    // Validate the response
    if (!response || !Array.isArray(response.messages)) {
      console.error('Invalid response format:', response);
      throw new Error('Invalid server response format');
    }
    
    console.log(`Received ${response.messages.length} more messages`);
    
    // Update the state with the new messages
    setMessages(prevMessages => {
      // Ensure no duplicate messages by tracking IDs
      const existingIds = new Set(prevMessages.map(msg => msg._id));
      const newMessages = response.messages.filter(msg => !existingIds.has(msg._id));
      
      console.log(`Adding ${newMessages.length} unique messages to the existing ${prevMessages.length}`);
      return [...newMessages, ...prevMessages];
    });
    
    // Update pagination state
    setHasMore(response.hasMore === true);
    setNextCursor(response.nextCursor || null);
  } catch (error) {
    console.error('Error loading more messages:', error);
    setError('Failed to load more messages. Please try again.');
  } finally {
    setLoadingMore(false);
  }
};

  // Detect scroll to load more messages
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;
    
    const handleScroll = () => {
      if (container.scrollTop < 100 && hasMore && !loadingMore) {
        loadMoreMessages();
      }
    };
    
    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [hasMore, loadingMore]);

  // Handle sending a new message
  const handleSendMessage = async (content, messageType = 'text', attachment = null, replyToId = null, formData, config) => {
    try {
      // Generate a temporary client-side ID for this message
      const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Create optimistic message for immediate display
      const optimisticMessage = {
        _id: tempId,
        sender: currentUser,
        recipient: participant,
        chatRoom: chat._id,
        content,
        messageType,
        createdAt: new Date().toISOString(),
        read: false,
        sending: true,
        replyTo: replyToId ? { _id: replyToId } : null
      };
      
      // Add to messages state immediately
      setMessages(prev => [...prev, optimisticMessage]);
      
      // Mark as sending
      setMessageSending(prev => ({
        ...prev,
        [tempId]: true
      }));
      
      // Scroll to bottom for new message
      setTimeout(() => {
        messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 50);
      
      let newMessage;
      
      // If we have form data (for attachments), use it
      if (formData) {
        // For attachment messages, track image loading
        if (messageType === 'image') {
          setImageLoading(prev => ({
            ...prev,
            [tempId]: true
          }));
        }
        
        newMessage = await api.sendMessageWithAttachment(chat._id, formData, config);
      } else if (replyToId) {
        newMessage = await api.replyToMessage(chat._id, replyToId, content, messageType, attachment);
      } else {
        newMessage = await sendMessage(chat._id, content, messageType, attachment);
      }
      
      // Mark as no longer sending
      setMessageSending(prev => ({
        ...prev,
        [tempId]: false
      }));
      
      // Update the optimistic message with the real one
      setMessages(prevMessages => {
        return prevMessages.map(msg => 
          msg._id === tempId ? { ...newMessage, sending: false } : msg
        );
      });
      
      // Clear reply state
      setReplyingTo(null);
      
      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Mark the message as failed
      setMessages(prevMessages => {
        return prevMessages.map(msg => 
          msg._id.startsWith('temp_') && msg.sending ? { ...msg, sending: false, failed: true } : msg
        );
      });
      
      setError('Failed to send message. Please try again.');
      return false;
    }
  };

  // Handle image load completion
  const handleImageLoaded = (messageId) => {
    setImageLoading(prev => ({
      ...prev,
      [messageId]: false
    }));
  };

  // Handle retry sending a failed message
  const handleRetryMessage = async (message) => {
    // Remove the failed message
    setMessages(prev => prev.filter(msg => msg._id !== message._id));
    
    // Re-send the message
    await handleSendMessage(
      message.content, 
      message.messageType, 
      message.mediaUrl ? { url: message.mediaUrl } : null, 
      message.replyTo?._id
    );
  };

  // Handle reply to message
  const handleReplyMessage = (message) => {
    setReplyingTo(message);
  };

  // Cancel reply
  const cancelReply = () => {
    setReplyingTo(null);
  };

  // Handle delete message
  const handleDeleteMessage = async (messageId) => {
    try {
      await api.deleteMessage(chat._id, messageId);
      
      // Update local message list
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg._id === messageId 
            ? { ...msg, deleted: true, content: 'This message was deleted' } 
            : msg
        )
      );
      
      return true;
    } catch (error) {
      console.error('Error deleting message:', error);
      setError('Failed to delete message. Please try again.');
      return false;
    }
  };

  // Handle message reaction
  const handleReactToMessage = async (messageId, reaction) => {
    try {
      await api.reactToMessage(chat._id, messageId, reaction);
      
      // Update is handled by socket event
      return true;
    } catch (error) {
      console.error('Error reacting to message:', error);
      setError('Failed to react to message. Please try again.');
      return false;
    }
  };

  // Handle removing reaction
  const handleRemoveReaction = async (messageId) => {
    try {
      await api.removeReaction(chat._id, messageId);
      
      // Update is handled by socket event
      return true;
    } catch (error) {
      console.error('Error removing reaction:', error);
      setError('Failed to remove reaction. Please try again.');
      return false;
    }
  };

  // Start an audio call
  const startAudioCall = async () => {
    if (socketStatus !== 'CONNECTED') {
      setError('Cannot start call. Connection not available.');
      return false;
    }
    
    try {
      const callData = await api.startAudioCall(chat._id);
      
      setActiveCall({
        callId: callData.callId,
        type: 'audio',
        initiator: currentUser,
        participant: participant,
        status: 'connecting'
      });
      
      return true;
    } catch (error) {
      console.error('Error starting audio call:', error);
      setError('Failed to start audio call. Please try again.');
      return false;
    }
  };

  // Start a video call
  const startVideoCall = async () => {
    if (socketStatus !== 'CONNECTED') {
      setError('Cannot start call. Connection not available.');
      return false;
    }
    
    try {
      const callData = await api.startVideoCall(chat._id);
      
      setActiveCall({
        callId: callData.callId,
        type: 'video',
        initiator: currentUser,
        participant: participant,
        status: 'connecting'
      });
      
      return true;
    } catch (error) {
      console.error('Error starting video call:', error);
      setError('Failed to start video call. Please try again.');
      return false;
    }
  };

  // Accept a call
  const acceptCall = async (callId) => {
    try {
      await api.acceptCall(callId);
      
      // Update local call state
      setActiveCall(prev => ({
        ...prev,
        status: 'ongoing'
      }));
      
      return true;
    } catch (error) {
      console.error('Error accepting call:', error);
      setError('Failed to accept call. Please try again.');
      return false;
    }
  };

  // Decline a call
  const declineCall = async (callId) => {
    try {
      await api.declineCall(callId);
      setActiveCall(null);
      return true;
    } catch (error) {
      console.error('Error declining call:', error);
      setError('Failed to decline call.');
      return false;
    }
  };

  // End a call
  const endCall = async (callId) => {
    try {
      if (callId) {
        await api.endCall(callId);
      }
      setActiveCall(null);
      return true;
    } catch (error) {
      console.error('Error ending call:', error);
      setError('Failed to end call.');
      return false;
    }
  };

  // Function to determine when to show date separator
  const shouldShowDateSeparator = (message, prevMessage) => {
    if (!prevMessage) return true;
    
    const messageDate = new Date(message.createdAt).toDateString();
    const prevMessageDate = new Date(prevMessage.createdAt).toDateString();
    
    return messageDate !== prevMessageDate;
  };

  // Format the date for the separator
  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    
    if (date.toDateString() === now.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else if (now.getFullYear() === date.getFullYear()) {
      return date.toLocaleDateString([], { month: 'long', day: 'numeric' });
    }
    
    return date.toLocaleDateString([], { year: 'numeric', month: 'long', day: 'numeric' });
  };

  // Get typing indicators text
  const getTypingIndicatorText = () => {
    if (!typingUsers || Object.keys(typingUsers).length === 0) return '';
    
    const typingUserIds = Object.keys(typingUsers);
    
    if (chat.type === 'direct') {
      return 'typing...';
    } else {
      // For group chats, show who's typing
      const typingParticipants = chat.participants.filter(p => 
        typingUserIds.includes(p._id) && p._id !== currentUser._id
      );
      
      if (typingParticipants.length === 1) {
        return `${typingParticipants[0].firstName} is typing...`;
      } else if (typingParticipants.length === 2) {
        return `${typingParticipants[0].firstName} and ${typingParticipants[1].firstName} are typing...`;
      } else if (typingParticipants.length > 2) {
        return 'Several people are typing...';
      }
    }
    
    return '';
  };

  // Calculate time since last activity for the "last seen"
  const getLastActiveTime = () => {
    if (!participant || isOnline) return null;
    
    if (!participant.lastActive) return 'a while ago';
    
    const lastActive = new Date(participant.lastActive);
    const now = new Date();
    const diffMinutes = Math.floor((now - lastActive) / (1000 * 60));
    
    if (diffMinutes < 1) return 'just now';
    if (diffMinutes < 60) return `${diffMinutes} min ago`;
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
    
    return lastActive.toLocaleDateString();
  };

  // Scroll to the latest message
  const scrollToBottom = () => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    
    // Clear new message notification when scrolling to bottom
    setNewMessageNotification(null);
  };

  return (
    <div className="flex-grow flex flex-col h-full bg-white">
      {/* Chat Header */}
      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between bg-white shadow-sm flex-shrink-0">
        <div className="flex items-center">
          {showSidebarToggle && (
            <button
              onClick={onToggleSidebar}
              className="mr-3 text-gray-500 hover:text-orange-500 focus:outline-none"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          )}
          <div className="relative">
            {participant?.profilePicture ? (
              <img
                src={participant.profilePicture}
                alt={`${participant.firstName} ${participant.lastName}`}
                className="h-10 w-10 rounded-full object-cover"
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                <span className="text-base font-medium text-orange-600">
                  {participant?.firstName?.charAt(0)}
                  {participant?.lastName?.charAt(0)}
                </span>
              </div>
            )}
            
            {isOnline && (
              <span className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-white"></span>
            )}
          </div>
          
          {/* Socket.IO connection status indicator */}
          {socketStatus !== 'CONNECTED' && (
            <div className="hidden md:flex bg-yellow-50 text-yellow-800 text-xs px-2 py-1 rounded items-center ml-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              {socketStatus === 'CONNECTING' ? 'Connecting...' : 
               socketStatus === 'DISCONNECTED' ? 'Reconnecting...' : 
               'Connection error'}
            </div>
          )}

          <div className="ml-3">
            <h3 className="text-base font-medium text-gray-900 truncate max-w-[150px] md:max-w-xs">
              {chat.type === 'direct'
                ? `${participant?.firstName} ${participant?.lastName}`
                : chat.name}
            </h3>
            <p className="text-xs text-gray-500">
              {isOnline 
                ? 'Online'
                : getLastActiveTime() ? `Last active ${getLastActiveTime()}` : ''}
            </p>
          </div>
        </div>
        
        <div className="flex space-x-3">
          <button 
            onClick={startAudioCall}
            className={`text-gray-500 hover:text-orange-500 ${socketStatus !== 'CONNECTED' ? 'opacity-50 cursor-not-allowed' : ''}`}
            title="Audio call"
            disabled={socketStatus !== 'CONNECTED'}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
            </svg>
          </button>
          
          <button 
            onClick={startVideoCall}
            className={`text-gray-500 hover:text-orange-500 ${socketStatus !== 'CONNECTED' ? 'opacity-50 cursor-not-allowed' : ''}`}
            title="Video call"
            disabled={socketStatus !== 'CONNECTED'}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
              <path d="M14 6a1 1 0 00-1 1v5a1 1 0 001 1h3a1 1 0 001-1V8a1 1 0 00-1-1h-3z" />
            </svg>
          </button>
          
          <button
            className="text-gray-500 hover:text-orange-500"
            title="More options"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Messages List - overflow-y-auto applied here, height set to make it scrollable */}
      <div 
        ref={messagesContainerRef}
        className="flex-grow overflow-y-auto bg-gray-50 px-4 py-2 relative"
        style={{ height: "0" }} // This forces the div to respect flex-grow while allowing scrolling
      >
        {loading && messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          </div>
        ) : error ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center p-4">
              <p className="text-red-500 mb-2">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="text-orange-500 hover:underline"
              >
                Retry
              </button>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center p-4">
              <div className="text-orange-400 mb-4">
                <svg className="mx-auto h-12 w-12" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <p className="text-gray-500">No messages yet.</p>
              <p className="text-gray-500 text-sm mt-1">Be the first to say hello!</p>
            </div>
          </div>
        ) : (
          <div>
            {hasMore && (
              <div className="text-center py-2">
                <button
                  onClick={loadMoreMessages}
                  className="text-orange-500 hover:underline text-sm"
                  disabled={loadingMore}
                >
                  {loadingMore ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-orange-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Loading...
                    </span>
                  ) : 'Load older messages'}
                </button>
              </div>
            )}
            
            <MessageList 
              messages={messages}
              currentUser={currentUser}
              formatDate={formatDate}
              shouldShowDateSeparator={shouldShowDateSeparator}
              participant={participant}
              onMessageRead={sendReadReceipt}
              onReply={handleReplyMessage}
              onDelete={handleDeleteMessage}
              onReact={handleReactToMessage}
              onRemoveReaction={handleRemoveReaction}
              onRetry={handleRetryMessage}
              messageSending={messageSending}
              messageRetries={messageRetries}
              onImageLoaded={handleImageLoaded}
              imageLoading={imageLoading}
            />
            
            <div ref={messageEndRef} />
          </div>
        )}
        
        {/* New message notification */}
        {newMessageNotification && (
          <div 
            className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-orange-500 text-white px-4 py-2 rounded-full shadow-lg cursor-pointer flex items-center"
            onClick={scrollToBottom}
          >
            <span className="mr-2">New message</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        )}
      </div>
      
      {/* Typing Indicator */}
      {getTypingIndicatorText() && (
        <div className="px-4 py-1 text-xs text-gray-500 bg-white border-t border-gray-100 flex-shrink-0">
          <div className="flex items-center">
            <span className="flex-shrink-0 w-3 h-3 bg-gray-400 rounded-full mr-2 animate-pulse"></span>
            <span>{getTypingIndicatorText()}</span>
          </div>
        </div>
      )}
      
      {/* Message Input */}
      <div className="border-t border-gray-200 p-3 bg-white flex-shrink-0">
        <MessageInput 
          onSendMessage={handleSendMessage}
          onTyping={sendTypingIndicator}
          chatId={chat._id}
          disabled={socketStatus !== 'CONNECTED'}
          replyingTo={replyingTo}
          onCancelReply={cancelReply}
        />
      </div>
      
      {/* Active Call Interface */}
      {activeCall && (
        <CallInterface
          callData={activeCall}
          onAccept={acceptCall}
          onDecline={declineCall}
          onEnd={endCall}
          currentUser={currentUser}
        />
      )}
      
      {/* Connection Status Modal - For mobile */}
      {socketStatus !== 'CONNECTED' && (
        <div className="md:hidden fixed bottom-4 left-4 right-4 bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded-md shadow-lg text-sm z-50">
          <div className="flex items-center">
            <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path>
            </svg>
            <span>
              {socketStatus === 'DISCONNECTED' ? 'Connection lost. Reconnecting...' : 'Connection error'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedChatWindow;
