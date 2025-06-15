import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const ChatSidebar = ({
  chats,
  activeChat,
  createNewChat,
  onChatSelect,
  onlineUsers,
  currentUser,
  loading,
  connections
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredChats, setFilteredChats] = useState([]);
  const [showNewChat, setShowNewChat] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchingConnections, setIsSearchingConnections] = useState(false);

  // Filter chats when search term or chats change
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredChats(chats);
      setSearchResults([]);
      setIsSearchingConnections(false);
      return;
    }

    // Check if we're searching all connections or just existing chats
    if (searchTerm.startsWith('@') && searchTerm.length > 1) {
      setIsSearchingConnections(true);
      
      // Filter connections
      const connectionSearchTerm = searchTerm.substring(1).toLowerCase();
      const filteredConnections = connections.filter(connection => {
        const fullName = `${connection.firstName} ${connection.lastName}`.toLowerCase();
        return fullName.includes(connectionSearchTerm);
      });
      
      setSearchResults(filteredConnections);
      setFilteredChats([]);
    } else {
      setIsSearchingConnections(false);
      
      // Filter existing chats
      const filtered = chats.filter(chat => {
        // For direct chats, search in participant names
        if (chat.type === 'direct') {
          const participant = chat.participants.find(
            p => p._id !== currentUser._id
          );
          
          if (!participant) return false;
          
          const fullName = `${participant.firstName} ${participant.lastName}`.toLowerCase();
          return fullName.includes(searchTerm.toLowerCase());
        } 
        // For group chats, search in chat name
        else {
          return chat.name.toLowerCase().includes(searchTerm.toLowerCase());
        }
      });
      
      setFilteredChats(filtered);
      setSearchResults([]);
    }
  }, [searchTerm, chats, currentUser, connections]);

  // Get other participant for direct chats
  const getParticipant = (chat) => {
    if (chat.type === 'direct') {
      return chat.participants.find(p => p._id !== currentUser._id);
    }
    return null;
  };

  // Format last activity time
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const now = new Date();
    
    // If today, display time only
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // If this year, display month and day
    if (date.getFullYear() === now.getFullYear()) {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
    
    // Otherwise display date with year
    return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const truncateText = (text, maxLength = 30) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // Handle starting a new conversation with a connection
  const handleStartChat = (connection) => {
    createNewChat(connection._id);
    setSearchTerm('');
    setShowNewChat(false);
  };

  if (loading) {
    return (
      <div className="w-80 border-r border-gray-200 h-full bg-white p-4">
        <div className="mb-4">
          <div className="bg-gray-200 h-10 w-full rounded animate-pulse"></div>
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center p-2">
              <div className="bg-gray-200 h-12 w-12 rounded-full animate-pulse"></div>
              <div className="ml-3 flex-1">
                <div className="bg-gray-200 h-4 w-3/4 rounded animate-pulse"></div>
                <div className="mt-1 bg-gray-200 h-3 w-1/2 rounded animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 border-r border-gray-200 h-full bg-white flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-800">Messages</h2>
          <button
            onClick={() => setShowNewChat(true)}
            className="text-orange-500 hover:text-orange-600"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
        
        <div className="relative">
          <input
            type="text"
            placeholder="Search conversations or @connections"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        
        {searchTerm && (
          <div className="mt-2">
            <p className="text-xs text-gray-500">
              {isSearchingConnections ? 
                "Searching all connections..." : 
                "Searching conversations..."}
            </p>
            <p className="text-xs text-gray-500">
              Tip: Use @ to search all connections
            </p>
          </div>
        )}
      </div>
      
      {showNewChat && (
        <div className="absolute top-20 left-4 right-4 bg-white border border-gray-200 shadow-lg rounded-lg z-10 p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-800">New Message</h3>
            <button onClick={() => setShowNewChat(false)} className="text-gray-500 hover:text-gray-700">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          
          <div>
            <p className="text-gray-600 mb-4">Select a connection to message</p>
            
            {connections.length > 0 ? (
              <div className="max-h-64 overflow-y-auto mb-4">
                {connections.map(connection => (
                  <div 
                    key={connection._id}
                    className="flex items-center p-2 hover:bg-orange-50 rounded-md cursor-pointer"
                    onClick={() => handleStartChat(connection)}
                  >
                    {connection.profilePicture ? (
                      <img
                        src={connection.profilePicture}
                        alt={`${connection.firstName} ${connection.lastName}`}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                        <span className="text-base font-medium text-orange-600">
                          {connection.firstName.charAt(0)}
                          {connection.lastName.charAt(0)}
                        </span>
                      </div>
                    )}
                    <div className="ml-3">
                      <p className="font-medium text-gray-900">
                        {connection.firstName} {connection.lastName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {connection.headline || 'Connection'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center mb-4">No connections found</p>
            )}
            
            <Link 
              to="/network" 
              className="block text-center w-full py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md"
            >
              Find Connections
            </Link>
          </div>
        </div>
      )}
      
      <div className="flex-1 overflow-y-auto">
        {/* Search Results */}
        {isSearchingConnections && searchResults.length > 0 && (
          <div className="divide-y divide-gray-100">
            <div className="p-3 bg-orange-50">
              <h3 className="text-sm font-medium text-gray-700">Connection Results</h3>
            </div>
            {searchResults.map(connection => (
              <div
                key={connection._id}
                className="p-3 flex items-center cursor-pointer hover:bg-gray-50"
                onClick={() => handleStartChat(connection)}
              >
                <div className="relative">
                  {connection.profilePicture ? (
                    <img
                      src={connection.profilePicture}
                      alt={`${connection.firstName} ${connection.lastName}`}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
                      <span className="text-lg font-medium text-orange-600">
                        {connection.firstName.charAt(0)}
                        {connection.lastName.charAt(0)}
                      </span>
                    </div>
                  )}
                  
                  {onlineUsers[connection._id] && (
                    <span className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-white"></span>
                  )}
                </div>
                
                <div className="ml-3 flex-1 overflow-hidden">
                  <p className="font-medium text-gray-900">
                    {connection.firstName} {connection.lastName}
                  </p>
                  <p className="text-sm text-gray-500 truncate">
                    {connection.headline || 'Connection'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* No results message */}
        {isSearchingConnections && searchResults.length === 0 && searchTerm.length > 1 && (
          <div className="p-4 text-center text-gray-500">
            No connections found matching "{searchTerm.substring(1)}"
          </div>
        )}
        
        {/* Chat List */}
        {!isSearchingConnections && (
          <>
            {filteredChats.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                {searchTerm ? 'No conversations found' : 'No conversations yet'}
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredChats.map(chat => {
                  const participant = getParticipant(chat);
                  const isActive = activeChat && chat._id === activeChat._id;
                  const isOnline = participant && onlineUsers[participant._id];
                  
                  return (
                    <div
                      key={chat._id}
                      className={`p-3 flex items-center cursor-pointer hover:bg-gray-50 ${
                        isActive ? 'bg-orange-50' : ''
                      }`}
                      onClick={() => onChatSelect(chat)}
                    >
                      <div className="relative">
                        {chat.type === 'direct' ? (
                          participant?.profilePicture ? (
                            <img
                              src={participant.profilePicture}
                              alt={`${participant.firstName} ${participant.lastName}`}
                              className="h-12 w-12 rounded-full object-cover"
                            />
                          ) : (
                            <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
                              <span className="text-lg font-medium text-orange-600">
                                {participant?.firstName?.charAt(0)}
                                {participant?.lastName?.charAt(0)}
                              </span>
                            </div>
                          )
                        ) : (
                          <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-lg font-medium text-blue-600">
                              {chat.name?.charAt(0) || 'G'}
                            </span>
                          </div>
                        )}
                        
                        {isOnline && (
                          <span className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-white"></span>
                        )}
                      </div>
                      
                      <div className="ml-3 flex-1 overflow-hidden">
                        <div className="flex justify-between">
                          <p className="font-medium text-gray-900 truncate">
                            {chat.type === 'direct'
                              ? `${participant?.firstName} ${participant?.lastName}`
                              : chat.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatTime(chat.lastActivity || chat.lastMessage?.createdAt)}
                          </p>
                        </div>
                        
                        <p className={`text-sm truncate ${
                          chat.lastMessage && !chat.lastMessage.read && chat.lastMessage.sender._id !== currentUser._id
                            ? 'font-semibold text-gray-900'
                            : 'text-gray-500'
                        }`}>
                          {chat.lastMessage ? truncateText(chat.lastMessage.content) : 'No messages yet'}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
    
  );
};

export default ChatSidebar;