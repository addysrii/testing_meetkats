// src/services/postService.js
import api  from './api';

// Helper function to normalize MongoDB _id to id for frontend
const normalizePostData = (data) => {
  // If no data or error response, return empty array
  if (!data || data.status === 'error') {
    return [];
  }
  
  // Check all possible locations where posts could be
  if (data.status === 'success' && data.data && Array.isArray(data.data.posts)) {
    // Standard format: { status: 'success', data: { posts: [...] } }
    return data.data.posts;
  } 
  else if (Array.isArray(data)) {
    // Direct array format
    return data;
  } 
  else if (data.data && Array.isArray(data.data)) {
    // Data property contains array: { data: [...] }
    return data.data;
  } 
  else if (data.posts && Array.isArray(data.posts)) {
    // Direct posts property: { posts: [...] }
    return data.posts;
  }
  
  // Return empty array if no recognized format
  return [];
};


// Helper function to create FormData for file uploads
const createFormData = (data, fileField, file) => {
  const formData = new FormData();
  
  // Add all the text fields
  Object.keys(data).forEach(key => {
    formData.append(key, data[key]);
  });
  
  // Add the file if provided
  if (file) {
    formData.append(fileField, file);
  }
  
  return formData;
};

// Helper function for multiple file uploads
const createMultiFileFormData = (data, fileField, files) => {
  const formData = new FormData();
  
  // Add all the text fields
  Object.keys(data).forEach(key => {
    formData.append(key, data[key]);
  });
  
  // Add files if provided
  if (Array.isArray(files) && files.length > 0) {
    files.forEach((file, index) => {
      formData.append(`${fileField}[${index}]`, file);
    });
  }
  
  return formData;
};

const postService = {
  // Get posts for feed or discovery
  getPosts: async (params = {}) => {
    try {
      // Get the auth token
      const token = localStorage.getItem('@auth_token');
      
      if (!token) {
        console.error('No authentication token found');
        return [];
      }
      
      // Build query parameters
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value);
        }
      });
      
      // Make the request with proper authentication
      const response = await fetch(
        `https://new-backend-w86d.onrender.com/api/posts?${queryParams.toString()}`, 
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      // Handle error responses
      if (!response.ok) {
        if (response.status === 401) {
          console.error('Authentication token expired or invalid');
          // Optional: Redirect to login or trigger re-authentication
        } else {
          console.error(`Server error ${response.status}`);
        }
        return [];
      }
      
      // Parse and normalize the response
      const data = await response.json();
      console.log('Posts API response received:', 
                  data?.status || 'unknown status',
                  data?.data?.posts?.length || 'no posts array');
      
      return normalizePostData(data);
    } catch (error) {
      console.error('Error fetching posts:', error);
      return [];
    }
  },
  
  // Get a single post by ID
  getPostById: async (postId) => {
    try {
      if (!postId) {
        console.error('Post ID is required');
        return null;
      }
      
      const token = localStorage.getItem('@auth_token');
      
      if (!token) {
        console.error('No authentication token found');
        return null;
      }
      
      const response = await fetch(
        `https://new-backend-w86d.onrender.com/api/posts/${postId}`, 
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (!response.ok) {
        console.error(`Error fetching post ${postId}: ${response.status}`);
        return null;
      }
      
      const data = await response.json();
      
      // Extract post from response
      if (data.status === 'success' && data.data) {
        return data.data;
      }
      
      return null;
    } catch (error) {
      console.error(`Error fetching post ${postId}:`, error);
      return null;
    }
  },

  // Get user posts
  getUserPosts: async (userId) => {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }
      
      // Add userId as query parameter
      const response = await api.get('/api/posts', { userId });
      
      // Check if we have a backend-style response
      let posts = [];
      
      if (response) {
        // Backend returns { status: 'success', data: { posts: [] } } format
        if (response.status === 'success' && response.data && response.data.posts) {
          posts = response.data.posts;
        } 
        // Direct array format
        else if (Array.isArray(response)) {
          posts = response;
        }
        // Data property contains array
        else if (response.data && Array.isArray(response.data)) {
          posts = response.data;
        }
        // Data.data contains array (nested)
        else if (response.data && response.data.data && Array.isArray(response.data.data)) {
          posts = response.data.data;
        }
        // Direct posts property
        else if (response.posts && Array.isArray(response.posts)) {
          posts = response.posts;
        }
        // Empty or invalid response
        else {
          posts = [];
        }
      }
      
      // If we have no posts, return empty array
      if (posts.length === 0) {
        console.log(`No posts found for user ${userId}`);
        return [];
      }
      
      // Apply the same field normalization as in getPosts
      const normalizedData = normalizeData(posts);
      
      // Process the posts to ensure they have required fields
      return Array.isArray(normalizedData) 
        ? normalizedData.map(post => {
            // Create enhanced post object
            const enhancedPost = {
              ...post,
              // Map known field name variations
              caption: post.content || post.caption || '',
              content: post.content || post.caption || '',
              // Set default values for required fields
              likes: post.likeCount !== undefined ? post.likeCount : (post.likes || 0),
              liked: post.likedByUser !== undefined ? post.likedByUser : (post.liked || false),
              bookmarked: post.bookmarkedByUser !== undefined ? post.bookmarkedByUser : (post.bookmarked || false),
              commentCount: post.commentCount || post.comments?.length || 0
            };
            
            // If post has no user object but has author, create user from author
            if (!enhancedPost.user && enhancedPost.author) {
              // Handle author as string ID or as object
              const authorId = typeof enhancedPost.author === 'object' ? 
                enhancedPost.author._id || enhancedPost.author.id : enhancedPost.author;
                
              const authorName = typeof enhancedPost.author === 'object' && enhancedPost.author.username ?
                enhancedPost.author.username : `User ${authorId.toString().substring(0, 5)}`;
                
              const authorImage = typeof enhancedPost.author === 'object' && enhancedPost.author.profileImage ?
                enhancedPost.author.profileImage : 'https://via.placeholder.com/40';
                
              // Create user object from author data
              enhancedPost.user = {
                id: authorId,
                username: authorName,
                profileImage: authorImage
              };
            }
            
            // Ensure user has id field if user exists
            if (enhancedPost.user) {
              enhancedPost.user = {
                ...enhancedPost.user,
                id: enhancedPost.user.id || enhancedPost.user._id || 
                    (typeof enhancedPost.author === 'string' ? enhancedPost.author : null)
              };
            }
            
            return enhancedPost;
          })
        : [];
    } catch (error) {
      console.error(`Error fetching posts for user ${userId}:`, error.message);
      console.warn('API not available, returning empty posts array');
      return [];
    }
  },
  
  // Get post details
  getPost: async (postId) => {
    try {
      if (!postId) {
        throw new Error('Post ID is required');
      }
      
      const response = await api.get(`/api/posts/${postId}`);
      
      // Handle different response formats
      let post = null;
      
      if (response) {
        if (response.status === 'success' && response.data) {
          // Backend returns {status: 'success', data: {}}
          post = response.data;
        } else if (response.data && response.data.data) {
          // Format: {data: {data: {}}}
          post = response.data.data;
        } else if (response.data) {
          // Direct post object
          post = response.data;
        }
      }
      
      if (!post) {
        throw new Error('Invalid post data received');
      }
      
      const normalizedData = normalizeData(post);
      
      // Create enhanced post object
      const enhancedPost = {
        ...normalizedData,
        // Map known field name variations
        caption: normalizedData.content || normalizedData.caption || '',
        content: normalizedData.content || normalizedData.caption || '',
        // Set default values for required fields
        likes: normalizedData.likeCount !== undefined ? normalizedData.likeCount : (normalizedData.likes || 0),
        liked: normalizedData.likedByUser !== undefined ? normalizedData.likedByUser : (normalizedData.liked || false),
        bookmarked: normalizedData.bookmarkedByUser !== undefined ? normalizedData.bookmarkedByUser : (normalizedData.bookmarked || false),
        commentCount: normalizedData.commentCount || normalizedData.comments?.length || 0
      };
      
      // If post has no user object but has author, create user from author
      if (!enhancedPost.user && enhancedPost.author) {
        // Handle author as string ID or as object
        const authorId = typeof enhancedPost.author === 'object' ? 
          enhancedPost.author._id || enhancedPost.author.id : enhancedPost.author;
          
        const authorName = typeof enhancedPost.author === 'object' && enhancedPost.author.username ?
          enhancedPost.author.username : `User ${authorId.toString().substring(0, 5)}`;
          
        const authorImage = typeof enhancedPost.author === 'object' && enhancedPost.author.profileImage ?
          enhancedPost.author.profileImage : 'https://via.placeholder.com/40';
          
        // Create user object from author data
        enhancedPost.user = {
          id: authorId,
          username: authorName,
          profileImage: authorImage
        };
      }
      
      // Ensure user has id field if user exists
      if (enhancedPost.user) {
        enhancedPost.user = {
          ...enhancedPost.user,
          id: enhancedPost.user.id || enhancedPost.user._id || 
              (typeof enhancedPost.author === 'string' ? enhancedPost.author : null)
        };
      }
      
      return enhancedPost;
    } catch (error) {
      console.error(`Error fetching post ${postId}:`, error.message);
      throw error;
    }
  },
  
  // Create a new post
  createPost: async (postData, mediaFiles = []) => {
    try {
      // Map content to what backend expects
      const backendPostData = {
        ...postData,
        content: postData.content || postData.caption || ''
      };
      
      let response;
      
      if (mediaFiles && mediaFiles.length > 0) {
        // Create FormData for media upload
        const formData = createMultiFileFormData(backendPostData, 'media', mediaFiles);
        
        // Log FormData for debugging
        console.log('FormData created for post with media. Files count:', mediaFiles.length);
        
        // Send request with media
        response = await api.post('/api/posts', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      } else {
        // Send text-only post
        response = await api.post('/api/posts', backendPostData);
      }
      
      // Handle different response formats
      let post = null;
      
      if (response) {
        if (response.status === 'success' && response.data) {
          // Backend returns {status: 'success', data: {}}
          post = response.data;
        } else if (response.data && response.data.data) {
          // Format: {data: {data: {}}}
          post = response.data.data;
        } else if (response.data) {
          // Direct post object
          post = response.data;
        }
      }
      
      if (!post) {
        throw new Error('Invalid post data received');
      }
      
      const normalizedData = normalizeData(post);
      
      // Apply the same field mapping
      const enhancedPost = {
        ...normalizedData,
        // Map known field name variations
        caption: normalizedData.content || normalizedData.caption || '',
        content: normalizedData.content || normalizedData.caption || '',
        // Set default values for required fields
        likes: normalizedData.likeCount !== undefined ? normalizedData.likeCount : (normalizedData.likes || 0),
        liked: normalizedData.likedByUser !== undefined ? normalizedData.likedByUser : (normalizedData.liked || false),
        bookmarked: normalizedData.bookmarkedByUser !== undefined ? normalizedData.bookmarkedByUser : (normalizedData.bookmarked || false)
      };
      
      // If post has no user object but has author, create user from author
      if (!enhancedPost.user && enhancedPost.author) {
        // Handle author as string ID or as object
        const authorId = typeof enhancedPost.author === 'object' ? 
          enhancedPost.author._id || enhancedPost.author.id : enhancedPost.author;
          
        const authorName = typeof enhancedPost.author === 'object' && enhancedPost.author.username ?
          enhancedPost.author.username : `User ${authorId.toString().substring(0, 5)}`;
          
        const authorImage = typeof enhancedPost.author === 'object' && enhancedPost.author.profileImage ?
          enhancedPost.author.profileImage : 'https://via.placeholder.com/40';
          
        // Create user object from author data
        enhancedPost.user = {
          id: authorId,
          username: authorName,
          profileImage: authorImage
        };
      }
      
      // Ensure user has id field if user exists
      if (enhancedPost.user) {
        enhancedPost.user = {
          ...enhancedPost.user,
          id: enhancedPost.user.id || enhancedPost.user._id || 
              (typeof enhancedPost.author === 'string' ? enhancedPost.author : null)
        };
      }
      
      return enhancedPost;
    } catch (error) {
      console.error('Error creating post:', error.message);
      throw error;
    }
  },
  
  // React to a post (like/unlike)
  reactToPost: async (postId, reactionType) => {
    try {
      if (!postId) {
        throw new Error('Post ID is required');
      }
      if (!reactionType) {
        throw new Error('Reaction type is required');
      }
      
      const response = await api.post(`/api/posts/${postId}/react`, { type: reactionType });
      return response;
    } catch (error) {
      console.error(`Error reacting to post ${postId}:`, error.message);
      throw error;
    }
  },
  
  // Bookmark a post
  bookmarkPost: async (postId) => {
    try {
      if (!postId) {
        throw new Error('Post ID is required');
      }
      
      const response = await api.post(`/api/posts/${postId}/bookmark`);
      return response;
    } catch (error) {
      console.error(`Error bookmarking post ${postId}:`, error.message);
      throw error;
    }
  },
  
  // Remove bookmark from a post
  removeBookmark: async (postId) => {
    try {
      if (!postId) {
        throw new Error('Post ID is required');
      }
      
      const response = await api.delete(`/api/posts/${postId}/bookmark`);
      return response;
    } catch (error) {
      console.error(`Error removing bookmark from post ${postId}:`, error.message);
      throw error;
    }
  },
  
  // Add comment to a post
  addComment: async (postId, commentData) => {
    try {
      if (!postId) {
        throw new Error('Post ID is required');
      }
      
      const response = await api.post(`/api/posts/${postId}/comments`, commentData);
      return normalizeData(response);
    } catch (error) {
      console.error(`Error adding comment to post ${postId}:`, error.message);
      throw error;
    }
  },
  
  // Get comments for a post
  getComments: async (postId, params = {}) => {
    try {
      if (!postId) {
        throw new Error('Post ID is required');
      }
      
      const response = await api.get(`/api/posts/${postId}/comments`, params);
      return normalizeData(response);
    } catch (error) {
      console.error(`Error fetching comments for post ${postId}:`, error.message);
      throw error;
    }
  },
  
  // Delete a post
  deletePost: async (postId) => {
    try {
      if (!postId) {
        throw new Error('Post ID is required');
      }
      await api.delete(`/api/posts/${postId}`);
      return true;
    } catch (error) {
      console.error(`Error deleting post ${postId}:`, error.message);
      throw error;
    }
  },
  
  // Get trending posts
  getTrendingPosts: async (params = {}) => {
    try {
      const response = await api.get('/api/posts/trending', params);
      
      // Check if we have a backend-style response
      let posts = [];
      
      if (response) {
        // Backend returns { status: 'success', data: { posts: [] } } format
        if (response.status === 'success' && response.data && response.data.posts) {
          posts = response.data.posts;
        } 
        // Direct array format
        else if (Array.isArray(response)) {
          posts = response;
        }
        // Data property contains array
        else if (response.data && Array.isArray(response.data)) {
          posts = response.data;
        }
        // Data.data contains array (nested)
        else if (response.data && response.data.data && Array.isArray(response.data.data)) {
          posts = response.data.data;
        }
        // Direct posts property
        else if (response.posts && Array.isArray(response.posts)) {
          posts = response.posts;
        }
        // Empty or invalid response
        else {
          posts = [];
        }
      }
      
      // If we have no posts, return empty array
      if (posts.length === 0) {
        console.log('No trending posts found');
        return [];
      }
      
      const normalizedData = normalizeData(posts);
      
      // Process the posts to ensure they have required fields
      return Array.isArray(normalizedData)
        ? normalizedData.map(post => {
            // Create enhanced post object
            const enhancedPost = {
              ...post,
              // Map known field name variations
              caption: post.content || post.caption || '',
              content: post.content || post.caption || '',
              // Set default values for required fields
              likes: post.likeCount !== undefined ? post.likeCount : (post.likes || 0),
              liked: post.likedByUser !== undefined ? post.likedByUser : (post.liked || false),
              bookmarked: post.bookmarkedByUser !== undefined ? post.bookmarkedByUser : (post.bookmarked || false),
              commentCount: post.commentCount || post.comments?.length || 0
            };
            
            // If post has no user object but has author, create user from author
            if (!enhancedPost.user && enhancedPost.author) {
              // Handle author as string ID or as object
              const authorId = typeof enhancedPost.author === 'object' ? 
                enhancedPost.author._id || enhancedPost.author.id : enhancedPost.author;
                
              const authorName = typeof enhancedPost.author === 'object' && enhancedPost.author.username ?
                enhancedPost.author.username : `User ${authorId.toString().substring(0, 5)}`;
                
              const authorImage = typeof enhancedPost.author === 'object' && enhancedPost.author.profileImage ?
                enhancedPost.author.profileImage : 'https://via.placeholder.com/40';
                
              // Create user object from author data
              enhancedPost.user = {
                id: authorId,
                username: authorName,
                profileImage: authorImage
              };
            }
            
            // Ensure user has id field if user exists
            if (enhancedPost.user) {
              enhancedPost.user = {
                ...enhancedPost.user,
                id: enhancedPost.user.id || enhancedPost.user._id || 
                    (typeof enhancedPost.author === 'string' ? enhancedPost.author : null)
              };
            }
            
            return enhancedPost;
          })
        : [];
    } catch (error) {
      console.error('Error fetching trending posts:', error.message);
      return [];
    }
  },
};

export default postService;