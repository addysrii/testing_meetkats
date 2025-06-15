import React from 'react'
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import storyService from '../../services/storyService';

const StoryCard = () => {
    const { user, loading, logout } = useAuth();
    const [stories, setStories] = useState([]);
    const navigate = useNavigate();
    const [loadingStories, setLoadingStories] = useState(true);

    useEffect(() => {
        // Redirect to login if not authenticated
        if (!loading && !user) {
          navigate('/login');
        }
    }, [user, loading, navigate]);

    // Fetch stories using the API
    useEffect(() => {
        const fetchStories = async () => {
            if (!user) return;
            
            try {
                setLoadingStories(true);
                
                // Call the getStories method from the API
                const response = await storyService.getStories();
                console.log('Stories response:', response);
                
                // Ensure the response has the expected format
                const formattedStories = Array.isArray(response) ? 
                    response.map(story => {
                        // Ensure each story has a stories array
                        return {
                            ...story,
                            stories: Array.isArray(story.stories) ? story.stories : []
                        };
                    }) : [];
                
                setStories(formattedStories);
                setLoadingStories(false);
            } catch (error) {
                console.error('Error fetching stories:', error);
                
                // Fallback to mock data if API fails
                const mockStories = [
                    {
                        author: {
                            _id: user.id || 'current-user',
                            firstName: user.firstName || 'You',
                            lastName: user.lastName || '',
                            profilePicture: user.profilePicture
                        },
                        stories: [
                            {
                                _id: 'story1',
                                mediaUrl: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2',
                                mediaType: 'image',
                                content: 'Working on a new project!',
                                createdAt: new Date().toISOString(),
                                viewed: false
                            }
                        ]
                    },
                    {
                        author: {
                            _id: 'user123',
                            firstName: 'Jane',
                            lastName: 'Smith',
                            profilePicture: null
                        },
                        stories: [
                            {
                                _id: 'story2',
                                mediaUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f',
                                mediaType: 'image',
                                content: 'Team collaboration',
                                createdAt: new Date(Date.now() - 3600000).toISOString(),
                                viewed: false
                            },
                            {
                                _id: 'story3',
                                mediaUrl: 'https://images.unsplash.com/photo-1516321497487-e288fb19713f',
                                mediaType: 'image',
                                content: 'Brainstorming session',
                                createdAt: new Date(Date.now() - 7200000).toISOString(),
                                viewed: false
                            }
                        ]
                    }
                ];
                
                setStories(mockStories);
                setLoadingStories(false);
            }
        };
      
        fetchStories();
    }, [user]);
    
    // Handle viewing a story
    const handleViewStory = async (storyGroup, index = 0) => {
        try {
            // Check if storyGroup has stories
            if (!storyGroup.stories || !storyGroup.stories.length) {
                console.error('No stories available in this group');
                return;
            }
            
            // Mark the story as viewed
            if (storyGroup.stories && storyGroup.stories[index]) {
                const storyId = storyGroup.stories[index]._id;
                await storyService.getStory(storyId);
            }
            
            // Navigate to story view page with the story data
            navigate('/stories/view', { 
                state: { 
                    initialStoryGroup: storyGroup, 
                    initialIndex: index 
                }
            });
        } catch (error) {
            console.error('Error viewing story:', error);
        }
    };
  
    return (
        <div className="mb-6 bg-white rounded-xl shadow-sm p-4">
            <h2 className="text-lg font-bold text-orange-600 mb-3">Trending Stories</h2>
            <div className="flex space-x-4 overflow-x-auto pb-2">
                {/* Create Story Card */}
                <div 
                    className="flex-shrink-0 w-24 cursor-pointer"
                    onClick={() => navigate('/stories/create')}
                >
                    <div className="h-36 w-24 bg-gradient-to-b from-orange-400 to-orange-600 rounded-lg shadow overflow-hidden relative">
                        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-white rounded-full border-4 border-orange-500 p-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-orange-500" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 bg-orange-600 text-white text-xs py-1 text-center">
                            Create Story
                        </div>
                    </div>
                </div>
                
                {/* Story Cards */}
                {loadingStories ? (
                    // Loading placeholders
                    Array(3).fill().map((_, i) => (
                        <div key={i} className="flex-shrink-0 w-24 animate-pulse">
                            <div className="h-36 w-24 bg-gray-300 rounded-lg shadow"></div>
                        </div>
                    ))
                ) : (
                    // Actual stories
                    stories.map((storyGroup) => {
                        // Guard against invalid story groups
                        if (!storyGroup || !storyGroup.author || !Array.isArray(storyGroup.stories)) {
                            return null;
                        }
                        
                        return (
                            <div 
                                key={storyGroup.author._id || `story-group-${Math.random()}`} 
                                className="flex-shrink-0 w-24 cursor-pointer"
                                onClick={() => handleViewStory(storyGroup)}
                            >
                                <div className="h-36 w-24 bg-gray-200 rounded-lg shadow overflow-hidden relative">
                                    {/* Preview image from first story - with proper checks */}
                                    {storyGroup.stories && storyGroup.stories.length > 0 && storyGroup.stories[0]?.mediaUrl && (
                                        <img 
                                            src={storyGroup.stories[0].mediaUrl} 
                                            alt="Story preview" 
                                            className="h-full w-full object-cover"
                                        />
                                    )}
                                    
                                    {/* User avatar */}
                                    <div className="absolute top-2 left-2 h-7 w-7 rounded-full border-2 border-orange-500 overflow-hidden">
                                        {storyGroup.author.profilePicture ? (
                                            <img
                                                src={storyGroup.author.profilePicture}
                                                alt={storyGroup.author.firstName}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="h-full w-full flex items-center justify-center bg-orange-500 text-white text-xs font-semibold">
                                                {storyGroup.author.firstName ? storyGroup.author.firstName.charAt(0) : ''}
                                                {storyGroup.author.lastName ? storyGroup.author.lastName.charAt(0) : ''}
                                            </div>
                                        )}
                                    </div>
                                    
                                    {/* Username - fixed comparison to use proper id */}
                                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent text-white text-xs p-2 pt-5">
                                        {user && storyGroup.author._id === (user.id || user._id) ? 'Your Story' : storyGroup.author.firstName}
                                    </div>
                                    
                                    {/* Unviewed indicator - with existence check */}
                                    {storyGroup.stories && storyGroup.stories.some(story => story && !story.viewed) && (
                                        <div className="absolute top-2 right-2 h-2 w-2 rounded-full bg-orange-500"></div>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}

export default StoryCard;