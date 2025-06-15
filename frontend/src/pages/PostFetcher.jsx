// Direct implementation to fetch posts from your backend
import React, { useEffect, useState } from 'react';

// This component directly fetches posts from your backend
const PostsFetcher = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        
        // Get the auth token from localStorage
        const token = localStorage.getItem('@auth_token');
        
        if (!token) {
          throw new Error('Authentication token not found. Please log in again.');
        }
        
        // Make request to your backend
        const response = await fetch('https://new-backend-w86d.onrender.com/api/posts', {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        
        // Check for error responses
        if (!response.ok) {
          if (response.status === 401) {
            // Unauthorized - token may be expired
            localStorage.removeItem('@auth_token'); // Clear the invalid token
            throw new Error('Your session has expired. Please log in again.');
          } else {
            throw new Error(`Server error ${response.status}: ${await response.text()}`);
          }
        }
        
        // Parse the response
        const data = await response.json();
        console.log('Posts API response:', data);
        
        // Extract posts based on your API structure
        let fetchedPosts = [];
        
        if (data && data.status === 'success' && data.data && data.data.posts) {
          // Standard format from your controller
          fetchedPosts = data.data.posts;
        } else if (Array.isArray(data)) {
          // Direct array format
          fetchedPosts = data;
        } else if (data.data && Array.isArray(data.data)) {
          // Data property contains array
          fetchedPosts = data.data;
        } else if (data.posts && Array.isArray(data.posts)) {
          // Direct posts property
          fetchedPosts = data.posts;
        }
        
        setPosts(fetchedPosts);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching posts:', error);
        setError(error.message || 'Failed to fetch posts');
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  if (loading) {
    return <div>Loading posts...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (posts.length === 0) {
    return <div>No posts found. Create some posts to get started!</div>;
  }

  return (
    <div className="posts-container">
      <h2>Posts</h2>
      {posts.map(post => (
        <div key={post._id || post.id} className="post-card">
          <div className="post-header">
            <strong>{post.author?.firstName} {post.author?.lastName}</strong>
            <span className="post-date">{new Date(post.createdAt).toLocaleDateString()}</span>
          </div>
          <p>{post.content}</p>
          {post.media && post.media.length > 0 && (
            <div className="post-media">
              <img 
                src={post.media[0].url} 
                alt="Post media" 
                className="post-image"
              />
            </div>
          )}
          <div className="post-stats">
            <span>{post.reactionCount || 0} reactions</span>
            <span>{post.commentCount || 0} comments</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PostsFetcher;