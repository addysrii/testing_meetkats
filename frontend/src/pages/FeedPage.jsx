import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import CreatePost from '../components/posts/CreatePost';
import api from '../services/api';

const FeedPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    fetchPosts();
  }, [user, navigate]);

  const fetchPosts = async (refresh = false) => {
    try {
      setLoading(true);
      const currentPage = refresh ? 1 : page;
      
      // Call API to get posts
      const response = await api.getPosts(currentPage);
      
      // Update posts state
      if (refresh || currentPage === 1) {
        setPosts(response.posts);
      } else {
        setPosts(prev => [...prev, ...response.posts]);
      }
      
      // Update pagination
      setHasMore(response.hasMore);
      if (!refresh) {
        setPage(currentPage + 1);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching posts:', error);
      setError('Failed to load posts. Please try again.');
      setLoading(false);
    }
  };

  const handlePostCreated = (newPost) => {
    // Add new post to the top of the feed
    setPosts(prev => [newPost, ...prev]);
  };

  const handleLike = async (postId) => {
    try {
      // Call API to like post
      const response = await api.likePost(postId);
      
      // Update post in state
      setPosts(prev => prev.map(post => 
        post._id === postId 
          ? { 
              ...post, 
              likes: response.totalLikes,
              userReaction: response.userReaction
            } 
          : post
      ));
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleComment = async (postId, content) => {
    try {
      // Call API to add comment
      const response = await api.commentOnPost(postId, content);
      
      // Update post in state
      setPosts(prev => prev.map(post => 
        post._id === postId 
          ? { 
              ...post, 
              comments: [...post.comments, response]
            } 
          : post
      ));
    } catch (error) {
      console.error('Error commenting on post:', error);
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMinutes = Math.floor((now - date) / (60 * 1000));
    
    if (diffMinutes < 1) return 'just now';
    if (diffMinutes < 60) return `${diffMinutes}m`;
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h`;
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d`;
    
    return date.toLocaleDateString();
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Navbar user={user} onLogout={logout} />
      
      <div className="container mx-auto px-4 py-6 flex-grow">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow p-4 mb-4">
              <div className="flex items-center mb-4">
                {user.profilePicture ? (
                  <img
                    src={user.profilePicture}
                    alt={`${user.firstName} ${user.lastName}`}
                    className="h-16 w-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-16 w-16 rounded-full bg-gray-300 flex items-center justify-center">
                    <span className="text-xl font-bold text-gray-700">
                      {user.firstName.charAt(0)}
                      {user.lastName.charAt(0)}
                    </span>
                  </div>
                )}
                <div className="ml-4">
                  <h3 className="text-lg font-bold text-gray-800">{user.firstName} {user.lastName}</h3>
                  <p className="text-gray-600 text-sm">{user.headline || 'No headline set'}</p>
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Profile views</span>
                  <span className="font-semibold">{user.analytics?.profileViews?.count || 0}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Connections</span>
                  <span className="font-semibold">{user.connections?.length || 0}</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="font-bold text-gray-800 mb-3">Recent Tags</h3>
              <div className="flex flex-wrap gap-2">
                <button className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full hover:bg-gray-200">
                  #programming
                </button>
                <button className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full hover:bg-gray-200">
                  #design
                </button>
                <button className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full hover:bg-gray-200">
                  #marketing
                </button>
                <button className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full hover:bg-gray-200">
                  #business
                </button>
                <button className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full hover:bg-gray-200">
                  #careers
                </button>
              </div>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="lg:col-span-6">
            {/* Create Post */}
            <CreatePost onPostCreated={handlePostCreated} user={user} />
            
            {/* Posts Feed */}
            <div className="mt-6 space-y-6">
              {loading && posts.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-6 text-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading posts...</p>
                </div>
              ) : error ? (
                <div className="bg-white rounded-lg shadow p-6 text-center">
                  <p className="text-red-500">{error}</p>
                  <button
                    onClick={() => fetchPosts(true)}
                    className="mt-2 text-blue-500 hover:text-blue-700"
                  >
                    Try again
                  </button>
                </div>
              ) : posts.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-6 text-center">
                  <p className="text-gray-600">No posts in your feed.</p>
                  <p className="mt-2 text-gray-600">Connect with more professionals to see their updates!</p>
                </div>
              ) : (
                <>
                  {posts.map(post => (
                    <div key={post._id} className="bg-white rounded-lg shadow">
                      {/* Post Header */}
                      <div className="p-4 flex">
                        {post.author.profilePicture ? (
                          <img 
                            src={post.author.profilePicture} 
                            alt={`${post.author.firstName} ${post.author.lastName}`}
                            className="h-12 w-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center">
                            <span className="text-lg font-bold text-gray-700">
                              {post.author.firstName.charAt(0)}
                              {post.author.lastName.charAt(0)}
                            </span>
                          </div>
                        )}
                        
                        <div className="ml-3 flex-1">
                          <div className="flex justify-between">
                            <div>
                              <h4 className="font-bold text-gray-900">{post.author.firstName} {post.author.lastName}</h4>
                              <p className="text-gray-600 text-sm">{post.author.headline || ''}</p>
                              <p className="text-gray-500 text-xs">{formatTimestamp(post.createdAt)}</p>
                            </div>
                            <button className="text-gray-400 hover:text-gray-600">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      {/* Post Content */}
                      <div className="px-4 pb-2">
                        <p className="text-gray-800 whitespace-pre-line">{post.content}</p>
                      </div>
                      
                      {/* Post Media */}
                      {post.images && post.images.length > 0 && (
                        <div className="mt-2">
                          {post.images.length === 1 ? (
                            <div className="w-full">
                              <img
                                src={post.images[0].url}
                                alt={post.images[0].caption || 'Post image'}
                                className="w-full h-auto"
                              />
                            </div>
                          ) : (
                            <div className="grid grid-cols-2 gap-1">
                              {post.images.slice(0, 4).map((image, index) => (
                                <div 
                                  key={index} 
                                  className={`${
                                    post.images.length === 3 && index === 0 
                                      ? 'col-span-2' 
                                      : ''
                                  }`}
                                >
                                  <img
                                    src={image.url}
                                    alt={image.caption || 'Post image'}
                                    className="w-full h-auto"
                                  />
                                </div>
                              ))}
                              {post.images.length > 4 && (
                                <div className="absolute bottom-0 right-0 bg-gray-800 bg-opacity-75 text-white px-2 py-1 text-sm">
                                  +{post.images.length - 4} more
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Video */}
                      {post.videos && post.videos.length > 0 && (
                        <div className="mt-2">
                          <video
                            src={post.videos[0].url}
                            poster={post.videos[0].thumbnail}
                            controls
                            className="w-full h-auto"
                          ></video>
                        </div>
                      )}
                      
                      {/* Link Preview */}
                      {post.linkPreview && post.linkPreview.url && (
                        <div className="mx-4 my-2 border border-gray-200 rounded-lg overflow-hidden">
                          {post.linkPreview.imageUrl && (
                            <img 
                              src={post.linkPreview.imageUrl} 
                              alt="Link preview" 
                              className="w-full h-40 object-cover"
                            />
                          )}
                          <div className="p-3">
                            <a 
                              href={post.linkPreview.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline font-medium"
                            >
                              {post.linkPreview.title || post.linkPreview.url}
                            </a>
                            {post.linkPreview.description && (
                              <p className="text-gray-600 text-sm mt-1">{post.linkPreview.description}</p>
                            )}
                            <p className="text-gray-500 text-xs mt-1">{post.linkPreview.url}</p>
                          </div>
                        </div>
                      )}
                      
                      {/* Hashtags */}
                      {post.hashtags && post.hashtags.length > 0 && (
                        <div className="px-4 py-2">
                          <div className="flex flex-wrap gap-1">
                            {post.hashtags.map((tag, i) => (
                              <button 
                                key={i} 
                                className="text-blue-600 hover:underline text-sm"
                              >
                                #{tag}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Reactions & Comments Counter */}
                      <div className="px-4 py-2 border-t border-gray-200 flex justify-between text-sm text-gray-500">
                        <div>
                          {post.likes && post.likes.length > 0 && (
                            <span>{post.likes.length} reactions</span>
                          )}
                        </div>
                        <div>
                          {post.comments && post.comments.length > 0 && (
                            <span>{post.comments.length} comments</span>
                          )}
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="px-4 py-2 border-t border-gray-200 flex">
                        <button 
                          className="flex-1 flex items-center justify-center px-4 py-2 hover:bg-gray-100 rounded-lg"
                          onClick={() => handleLike(post._id)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 mr-2 ${post.userReaction ? 'text-blue-500' : 'text-gray-500'}`} viewBox="0 0 20 20" fill="currentColor">
                            <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                          </svg>
                          <span className={post.userReaction ? 'text-blue-500' : 'text-gray-500'}>Like</span>
                        </button>
                        
                        <button className="flex-1 flex items-center justify-center px-4 py-2 hover:bg-gray-100 rounded-lg">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" />
                          </svg>
                          <span className="text-gray-500">Comment</span>
                        </button>
                        
                        <button className="flex-1 flex items-center justify-center px-4 py-2 hover:bg-gray-100 rounded-lg">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                          </svg>
                          <span className="text-gray-500">Share</span>
                        </button>
                      </div>
                      
                      {/* Comments Section (Collapsed by default) */}
                      {/* Would expand when comment button is clicked */}
                    </div>
                  ))}
                  
                  {/* Load More Button */}
                  {hasMore && (
                    <div className="text-center py-4">
                      <button
                        onClick={() => fetchPosts()}
                        className="bg-white border border-gray-300 rounded-full px-4 py-2 text-sm text-gray-600 hover:bg-gray-100"
                        disabled={loading}
                      >
                        {loading ? 'Loading...' : 'Load more posts'}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
          
          {/* Right Sidebar */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow p-4 mb-4">
              <h3 className="font-bold text-gray-800 mb-3">Upcoming Events</h3>
              <div className="space-y-3">
                <div className="flex items-start">
                  <div className="bg-blue-100 text-blue-800 p-2 rounded-lg mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800">Networking Mixer</h4>
                    <p className="text-gray-600 text-sm">Friday, 7:00 PM</p>
                    <p className="text-gray-500 text-xs mt-1">45 people attending</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-blue-100 text-blue-800 p-2 rounded-lg mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800">Tech Conference 2023</h4>
                    <p className="text-gray-600 text-sm">Aug 15 - Aug 17</p>
                    <p className="text-gray-500 text-xs mt-1">320 people attending</p>
                  </div>
                </div>
              </div>
              <button className="w-full text-blue-600 hover:text-blue-800 text-sm font-medium mt-3">
                View all events
              </button>
            </div>
            
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="font-bold text-gray-800 mb-3">People You May Know</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center mr-3">
                    <span className="text-sm font-bold text-gray-700">JS</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-800 truncate">John Smith</h4>
                    <p className="text-gray-600 text-sm truncate">Software Engineer at Tech Co.</p>
                    <div className="mt-2">
                      <button className="bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-full px-3 py-1">
                        Connect
                      </button>
                    </div>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center mr-3">
                    <span className="text-sm font-bold text-gray-700">AD</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-800 truncate">Alice Davis</h4>
                    <p className="text-gray-600 text-sm truncate">Product Designer at Design Inc.</p>
                    <div className="mt-2">
                      <button className="bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-full px-3 py-1">
                        Connect
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <button className="w-full text-blue-600 hover:text-blue-800 text-sm font-medium mt-3">
                View more
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default FeedPage;