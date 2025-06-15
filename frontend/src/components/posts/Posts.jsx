import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const Posts = ({ initialPosts = [], onNewPost }) => {
  const { user } = useAuth();
  const [posts, setPosts] = useState(initialPosts);
  const [loading, setLoading] = useState(initialPosts.length === 0);
  const [error, setError] = useState(null);
  const [newPostContent, setNewPostContent] = useState('');
  const [creatingPost, setCreatingPost] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Fetch posts when component mounts if no initial posts provided
  useEffect(() => {
    if (initialPosts.length === 0) {
      fetchPosts();
    }
  }, [initialPosts]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // This would be an API call in a real implementation
      // For now, we'll use mock data
      const mockPosts = [
        {
          _id: '1',
          author: {
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            profilePicture: user.profilePicture,
            headline: user.headline || 'Professional at Company'
          },
          content: 'Just joined this amazing professional network! Looking forward to connecting with everyone.',
          likes: 12,
          comments: 3,
          createdAt: new Date().toISOString()
        },
        {
          _id: '2',
          author: {
            _id: 'user123',
            firstName: 'Jane',
            lastName: 'Smith',
            profilePicture: null,
            headline: 'Product Manager at Tech Co'
          },
          content: 'Just launched a new feature! Check out our latest product update that helps professionals connect more effectively.',
          likes: 24,
          comments: 5,
          createdAt: new Date(Date.now() - 3600000).toISOString() // 1 hour ago
        },
        {
          _id: '3',
          author: {
            _id: 'user456',
            firstName: 'Mark',
            lastName: 'Johnson',
            profilePicture: null,
            headline: 'Marketing Specialist'
          },
          content: 'Looking for recommendations on the best marketing analytics tools for a mid-sized company. What are you all using?',
          likes: 8,
          comments: 15,
          createdAt: new Date(Date.now() - 7200000).toISOString() // 2 hours ago
        }
      ];
      
      setPosts(mockPosts);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching posts:', error);
      setError('Failed to load posts. Please try again.');
      setLoading(false);
    }
  };

  const handleCreatePost = async () => {
    if (!newPostContent.trim() && !selectedImage) return;
    
    try {
      setCreatingPost(true);
      
      // This would be an API call in a real implementation
      // For now, we'll simulate creating a post
      const newPost = {
        _id: `post-${Date.now()}`,
        author: {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          profilePicture: user.profilePicture,
          headline: user.headline || '',
        },
        content: newPostContent,
        imageUrl: imagePreview,
        likes: 0,
        comments: 0,
        createdAt: new Date().toISOString()
      };
      
      // Update local state
      setPosts(prev => [newPost, ...prev]);
      
      // Reset form
      setNewPostContent('');
      setSelectedImage(null);
      setImagePreview(null);
      
      // Notify parent if callback provided
      if (onNewPost) {
        onNewPost(newPost);
      }
      
      setCreatingPost(false);
    } catch (error) {
      console.error('Error creating post:', error);
      setError('Failed to create post. Please try again.');
      setCreatingPost(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      
      // Create a preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLikePost = async (postId) => {
    try {
      // This would be an API call in a real implementation
      // For now, we'll just update the local state
      setPosts(prev => prev.map(post => {
        if (post._id === postId) {
          const alreadyLiked = post.hasLiked;
          return {
            ...post,
            likes: alreadyLiked ? post.likes - 1 : post.likes + 1,
            hasLiked: !alreadyLiked
          };
        }
        return post;
      }));
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffSeconds = Math.floor((now - date) / 1000);
    
    if (diffSeconds < 60) return 'just now';
    
    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* Post creation box */}
      <div className="bg-white shadow rounded-lg p-4">
        <div className="flex space-x-4">
          {user?.profilePicture ? (
            <img
              src={user.profilePicture}
              alt=""
              className="h-10 w-10 rounded-full"
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
              <span className="text-sm font-semibold text-gray-600">
                {user?.firstName?.charAt(0)}
                {user?.lastName?.charAt(0)}
              </span>
            </div>
          )}
          <div className="flex-1">
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="What's on your mind?"
              rows="3"
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
            ></textarea>
            
            {/* Image preview */}
            {imagePreview && (
              <div className="mt-2 relative">
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  className="max-h-60 rounded-lg"
                />
                <button
                  onClick={() => {
                    setSelectedImage(null);
                    setImagePreview(null);
                  }}
                  className="absolute top-2 right-2 bg-gray-800 bg-opacity-50 text-white rounded-full p-1"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            )}
            
            <div className="flex justify-between items-center mt-3">
              <div className="flex space-x-4">
                {/* Image upload button */}
                <label className="cursor-pointer text-gray-500 hover:text-gray-700 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4a.5.5 0 01-.5-.5v-6.5l2.55-2.55a.5.5 0 01.7 0L13 13V15.5a.5.5 0 01-.5.5z" clipRule="evenodd" />
                    <path d="M8 10a2 2 0 100-4 2 2 0 000 4z" />
                  </svg>
                  Photo
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </label>
                
                {/* Video upload button */}
                <button className="text-gray-500 hover:text-gray-700 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                    <path d="M14 6a1 1 0 00-1 1v5a1 1 0 001 1h2a2 2 0 002-2V8a2 2 0 00-2-2h-2z" />
                  </svg>
                  Video
                </button>
                
                {/* Document upload button */}
                <button className="text-gray-500 hover:text-gray-700 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                  </svg>
                  Document
                </button>
              </div>
              
              <button
                onClick={handleCreatePost}
                disabled={creatingPost || (!newPostContent.trim() && !selectedImage)}
                className={`px-4 py-2 rounded-lg ${
                  creatingPost || (!newPostContent.trim() && !selectedImage)
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                {creatingPost ? 'Posting...' : 'Post'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="bg-white shadow rounded-lg p-4">
          <div className="animate-pulse">
            <div className="flex space-x-4">
              <div className="rounded-full bg-gray-300 h-10 w-10"></div>
              <div className="flex-1 space-y-4 py-1">
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-300 rounded"></div>
                  <div className="h-4 bg-gray-300 rounded w-5/6"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
          <p>{error}</p>
          <button 
            onClick={fetchPosts}
            className="mt-2 text-sm text-blue-500 hover:text-blue-700"
          >
            Try again
          </button>
        </div>
      )}

      {/* Posts list */}
      {posts.map(post => (
        <div key={post._id} className="bg-white shadow rounded-lg">
          {/* Post header */}
          <div className="p-4">
            <div className="flex items-center">
              <Link to={`/profile/${post.author._id}`} className="flex-shrink-0">
                {post.author.profilePicture ? (
                  <img
                    src={post.author.profilePicture}
                    alt={`${post.author.firstName} ${post.author.lastName}`}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                    <span className="text-sm font-semibold text-gray-600">
                      {post.author.firstName?.charAt(0)}
                      {post.author.lastName?.charAt(0)}
                    </span>
                  </div>
                )}
              </Link>
              
              <div className="ml-3">
                <Link 
                  to={`/profile/${post.author._id}`}
                  className="text-base font-semibold text-gray-900 hover:underline"
                >
                  {post.author.firstName} {post.author.lastName}
                </Link>
                <p className="text-sm text-gray-500">{post.author.headline}</p>
                <p className="text-xs text-gray-500 mt-0.5">{formatDate(post.createdAt)}</p>
              </div>
              
              <button className="ml-auto text-gray-400 hover:text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                </svg>
              </button>
            </div>
            
            {/* Post content */}
            <div className="mt-3">
              <p className="text-gray-800">{post.content}</p>
              
              {/* Post image if available */}
              {post.imageUrl && (
                <img
                  src={post.imageUrl}
                  alt="Post content"
                  className="mt-3 rounded-lg max-h-96 w-full object-cover"
                />
              )}
            </div>
            
            {/* Post stats */}
            <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center">
                <div className="flex -space-x-1">
                  <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 text-xs border border-white">
                    👍
                  </div>
                  <div className="h-6 w-6 rounded-full bg-red-100 flex items-center justify-center text-red-500 text-xs border border-white">
                    ❤️
                  </div>
                </div>
                <span className="ml-2">{post.likes}</span>
              </div>
              
              <div>
                <span>{post.comments} comments</span>
              </div>
            </div>
          </div>
          
          {/* Post actions */}
          <div className="border-t border-gray-200 px-4 py-3 flex justify-between">
            <button 
              className={`flex items-center ${post.hasLiked ? 'text-blue-500' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => handleLikePost(post._id)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
              </svg>
              Like
            </button>
            
            <button className="flex items-center text-gray-500 hover:text-gray-700">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
              Comment
            </button>
            
            <button className="flex items-center text-gray-500 hover:text-gray-700">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              Share
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Posts;