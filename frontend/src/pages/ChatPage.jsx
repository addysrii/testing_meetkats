// frontend/src/pages/ChatPage.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/common/Navbar';
import ChatSidebar from '../components/chat/ChatSidebar';
import ChatWindow from '../components/chat/ChatWindow';
import api from '../services/api';
import socketManager from '../services/socketmanager';

const ChatPage = () => {
  const { user } = useAuth();
  const { chatId } = useParams();
  const navigate = useNavigate();
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState({});
  const [typingUsers, setTypingUsers] = useState({});
  const [socketStatus, setSocketStatus] = useState('DISCONNECTED');
  const [connections, setConnections] = useState([]);
  const [showSidebar, setShowSidebar] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  
  // References for event handlers to avoid recreating them on every render
  const handlersRef = useRef({});
  
  // Check if screen is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      // Auto-hide sidebar on mobile when viewing a chat
      if (window.innerWidth < 768 && activeChat) {
        setShowSidebar(false);
      } else {
        setShowSidebar(true);
      }
    };
    
    // Initial check
    checkMobile();
    
    // Add resize listener
    window.addEventListener('resize', checkMobile);
    
    // Clean up
    return () => window.removeEventListener('resize', checkMobile);
  }, [activeChat]);
  
  // Subscribe to socket status changes
  useEffect(() => {
    const unsubscribe = socketManager.onStatusChange((status) => {
      setSocketStatus(status);
      
      // Try to reconnect if disconnected
      if (status === 'DISCONNECTED' && user) {
        // Delay reconnection to avoid rapid reconnection attempts
        setTimeout(() => {
          const token = localStorage.getItem('token');
          if (token) {
            socketManager.connect(token);
          }
        }, 3000);
      }
    });
    
    return unsubscribe;
  }, [user]);

  // Fetch user connections
  useEffect(() => {
    const fetchConnections = async () => {
      if (!user) return;
      
      try {
        const response = await api.getConnections();
        setConnections(response);
      } catch (error) {
        console.error('Error fetching connections:', error);
      }
    };
    
    fetchConnections();
  }, [user]);

  // Join the active chat room
  useEffect(() => {
    if (activeChat && socketStatus === 'CONNECTED') {
      console.log(`Joining chat room: ${activeChat._id}`);
      
      // Join the current chat room
      socketManager.joinChat(activeChat._id);
      
      // Return cleanup function to leave the room when chat changes
      return () => {
        console.log(`Leaving chat room: ${activeChat._id}`);
        socketManager.leaveChat(activeChat._id);
      };
    }
  }, [activeChat, socketStatus]);

  // Send read receipt for a message
  const sendReadReceipt = useCallback((messageId, chatRoomId) => {
    console.log(`Marking message as read: ${messageId} in chat: ${chatRoomId || (activeChat ? activeChat._id : null)}`);
    socketManager.markMessageRead(messageId, chatRoomId || (activeChat ? activeChat._id : null));
  }, [activeChat]);

  // Setup socket event handlers
  useEffect(() => {
    // Create handlers or use existing ones from the ref
    if (!handlersRef.current.newMessage) {
      handlersRef.current.newMessage = (message) => {
        console.log('New message received:', message);
        
        // Update chat list with new message
        setChats(prevChats => {
          // Find the chat
          const chatIndex = prevChats.findIndex(chat => chat._id === message.chatRoom);
          
          if (chatIndex === -1) {
            // Chat not found, this could be a new chat
            console.log('Chat not found for message, fetching chats...');
            // Trigger a refresh of the chats list
            api.getChats().then(response => {
              setChats(response);
            }).catch(err => {
              console.error('Error fetching chats after new message:', err);
            });
            return prevChats;
          }
          
          // Make a copy of chats
          const updatedChats = [...prevChats];
          
          // Update last message of the chat
          updatedChats[chatIndex] = {
            ...updatedChats[chatIndex],
            lastMessage: message,
            lastActivity: new Date().toISOString()
          };
          
          // Move this chat to the top of the list
          const chatToMove = updatedChats[chatIndex];
          updatedChats.splice(chatIndex, 1);
          updatedChats.unshift(chatToMove);
          
          // If this is the active chat, mark as read
          if (activeChat && activeChat._id === message.chatRoom) {
            sendReadReceipt(message._id, message.chatRoom);
          }
          
          return updatedChats;
        });
      };
      
      handlersRef.current.typing = (data) => {
        const { chatId, userId, isTyping } = data;
        
        setTypingUsers(prev => {
          if (isTyping) {
            return { 
              ...prev, 
              [chatId]: { 
                ...prev[chatId], 
                [userId]: true 
              } 
            };
          } else {
            const updatedTyping = { ...prev };
            if (updatedTyping[chatId]) {
              delete updatedTyping[chatId][userId];
              if (Object.keys(updatedTyping[chatId]).length === 0) {
                delete updatedTyping[chatId];
              }
            }
            return updatedTyping;
          }
        });
      };
      
      handlersRef.current.presenceUpdate = (data) => {
        const { userId, status } = data;
        setOnlineUsers(prev => ({
          ...prev,
          [userId]: status === 'online'
        }));
      };
      
      handlersRef.current.init = (data) => {
        if (data.onlineUsers) {
          setOnlineUsers(data.onlineUsers);
        }
      };
      
      handlersRef.current.callStarted = (data) => {
        console.log('Call started event received:', data);
        
        // If this call is for a different chat than the current active one
        if (data.chatId && (!activeChat || data.chatId !== activeChat._id)) {
          const targetChat = chats.find(c => c._id === data.chatId);
          
          if (targetChat) {
            // Show notification to user 
            // In a real app, you would use a notification system
            if (data.initiator._id !== user._id) {
              const shouldNavigate = window.confirm(`Incoming ${data.type} call from ${targetChat.participants.find(p => p._id !== user._id)?.firstName || 'someone'}. Go to chat?`);
              
              if (shouldNavigate) {
                navigate(`/chat/${data.chatId}`);
              }
            }
          }
        }
      };
      
      handlersRef.current.messageRead = (data) => {
        const { messageId, chatId, userId } = data;
        
        // Update message read status in active chat
        if (activeChat && activeChat._id === chatId) {
          // This would typically update the message list in ChatWindow
          // We'll implement this in the ChatWindow component
        }
      };
    }
    
    // Register socket event handlers
    const newMessageUnsub = socketManager.on('new_message', handlersRef.current.newMessage);
    const typingUnsub = socketManager.on('typing', handlersRef.current.typing);
    const presenceUnsub = socketManager.on('presence_update', handlersRef.current.presenceUpdate);
    const initUnsub = socketManager.on('init', handlersRef.current.init);
    const callStartedUnsub = socketManager.on('call_started', handlersRef.current.callStarted);
    const messageReadUnsub = socketManager.on('message_read', handlersRef.current.messageRead);
    
    // Clean up event handlers on unmount
    return () => {
      newMessageUnsub();
      typingUnsub();
      presenceUnsub();
      initUnsub();
      callStartedUnsub();
      messageReadUnsub();
    };
  }, [activeChat, user, navigate, sendReadReceipt, chats]);
  
  // Send typing indicator
  const sendTypingIndicator = useCallback((chatId, isTyping) => {
    socketManager.sendTypingIndicator(chatId, isTyping);
  }, []);
  
  // Load chat list
  useEffect(() => {
    const fetchChats = async () => {
      try {
        setLoading(true);
        const response = await api.getChats();
        setChats(response);
        
        // If chatId is provided in URL, set it as active
        if (chatId) {
          const selectedChat = response.find(chat => chat._id === chatId);
          if (selectedChat) {
            setActiveChat(selectedChat);
            if (isMobile) {
              setShowSidebar(false);
            }
          } else if (response.length > 0) {
            // If chat not found, navigate to first chat
            navigate(`/chat/${response[0]._id}`, { replace: true });
          }
        } else if (response.length > 0) {
          // If no chatId in URL but we have chats, navigate to first chat
          navigate(`/chat/${response[0]._id}`);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching chats:', error);
        setError('Failed to load chats. Please try again later.');
        setLoading(false);
      }
    };
  
    if (user) {
      fetchChats();
    }
  }, [user, chatId, navigate, isMobile]);
  
  // Handle creating a new chat
  const createNewChat = async (participantId) => {
    try {
      setLoading(true);
      const response = await api.createChat(participantId);
      
      // Add the new chat to the list and navigate to it
      setChats(prev => [response, ...prev]);
      navigate(`/chat/${response._id}`);
      
      // Hide sidebar on mobile when creating a new chat
      if (isMobile) {
        setShowSidebar(false);
      }
      
      setLoading(false);
      return response;
    } catch (error) {
      console.error('Error creating chat:', error);
      setError('Failed to create new chat. Please try again.');
      setLoading(false);
      return null;
    }
  };
  
  // Send a message
  const sendMessage = async (chatId, content, messageType = 'text', attachment = null) => {
    try {
      let response;
      
      // Handle attachments if present
      if (attachment) {
        const formData = new FormData();
        formData.append('content', content);
        formData.append('messageType', messageType);
        formData.append('media', attachment);
        
        response = await api.sendMessageWithAttachment(chatId, formData);
      } else {
        response = await api.sendMessage(chatId, { content, messageType });
      }
      
      return response;
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message. Please try again.');
      throw error;
    }
  };

  // Toggle sidebar visibility (for mobile)
  const toggleSidebar = () => {
    setShowSidebar(prev => !prev);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center p-8 bg-white shadow-md rounded-lg">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Please log in to access chat</h1>
          <button 
            onClick={() => navigate('/login')}
            className="mt-4 bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-4 rounded"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row overflow-hidden">
      {/* Mobile Header with Toggle Button */}
      <div className="md:hidden flex items-center justify-between bg-white border-b p-3">
        <button
          onClick={toggleSidebar}
          className="text-gray-600 hover:text-orange-500 focus:outline-none"
        >
          {showSidebar ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
        <div className="text-lg font-semibold text-gray-800">
          {activeChat ? activeChat.participants.find(p => p._id !== user._id)?.firstName || 'Chat' : 'Chats'}
        </div>
        <div className="w-6"></div> {/* Placeholder for balance */}
      </div>

      <div className="flex-grow flex md:flex-row flex-col h-[calc(100vh-56px)] md:h-screen overflow-hidden">
        {/* Chat Sidebar - conditionally render on mobile */}
        <div 
          className={`${showSidebar ? 'block' : 'hidden'} md:block md:w-80 lg:w-96 flex-shrink-0 bg-white md:border-r border-gray-200 h-full overflow-y-auto`}
        >
          <ChatSidebar 
            chats={chats} 
            activeChat={activeChat} 
            createNewChat={createNewChat}
            onChatSelect={(chat) => {
              navigate(`/chat/${chat._id}`);
              if (isMobile) {
                setShowSidebar(false);
              }
            }}
            onlineUsers={onlineUsers}
            currentUser={user}
            loading={loading}
            connections={connections}
          />
        </div>
        
        {/* Chat Window - conditionally render on mobile */}
        <div 
          className={`${showSidebar && isMobile ? 'hidden' : 'block'} flex-grow h-full flex flex-col`}
        >
          {activeChat ? (
            <ChatWindow 
              chat={activeChat}
              currentUser={user}
              sendMessage={sendMessage}
              sendTypingIndicator={sendTypingIndicator}
              sendReadReceipt={sendReadReceipt}
              typingUsers={typingUsers[activeChat._id] || {}}
              onlineUsers={onlineUsers}
              socketStatus={socketStatus}
              showSidebarToggle={isMobile}
              onToggleSidebar={toggleSidebar}
            />
          ) : (
            <div className="flex-grow flex items-center justify-center bg-white">
              <div className="text-center p-6">
                <div className="text-orange-400 mb-4">
                  <svg className="mx-auto h-12 w-12" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-800">Your Messages</h2>
                <p className="mt-2 text-gray-600">Send private messages to your connections</p>
                <button 
                  onClick={() => navigate('/network')}
                  className="mt-4 bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-4 rounded"
                >
                  Find Connections
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Connection status indicator */}
      {socketStatus !== 'CONNECTED' && (
        <div className="fixed bottom-4 left-4 bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded shadow-md z-50 max-w-xs">
          <p className="flex items-center text-sm">
            <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path>
            </svg>
            {socketStatus === 'DISCONNECTED' ? 'Connection lost. Reconnecting...' : 'Connection error'}
          </p>
        </div>
      )}
      
      {/* Error message */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded shadow-md max-w-xs z-50">
          <div className="flex">
            <div className="py-1">
              <svg className="h-6 w-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path>
              </svg>
            </div>
            <div>
              <p className="text-sm">{error}</p>
            </div>
            <button 
              onClick={() => setError(null)}
              className="ml-auto"
              aria-label="Close error message"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatPage;
