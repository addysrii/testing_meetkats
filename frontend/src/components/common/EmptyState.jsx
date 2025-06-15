import React from 'react';
import { Link } from 'react-router-dom';
import { 
  UserPlus, 
  Package, 
  Award, 
  Calendar, 
  MessageSquare, 
  Search, 
  AlertCircle,
  BookOpen,
  Bell
} from 'lucide-react';


const EmptyState = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Empty State Examples</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Connection Requests */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Connection Requests</h2>
          <EmptyState
            icon={<UserPlus size={48} />}
            title="No Connection Requests"
            description="You don't have any pending connection requests at the moment."
            action={
              <Link 
                to="/discover" 
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Find People to Connect
              </Link>
            }
          />
        </div>
        
        {/* Portfolio Projects */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Portfolio Projects</h2>
          <EmptyState
            icon={<Package size={48} />}
            title="No Projects Yet"
            description="Showcase your work by adding projects to your portfolio."
            action={
              <Link 
                to="/portfolio/add-project" 
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Add Your First Project
              </Link>
            }
          />
        </div>
        
        {/* Achievements */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Achievements</h2>
          <EmptyState
            icon={<Award size={48} />}
            title="No Achievements"
            description="Add your certifications, awards, and other professional achievements."
            action={
              <Link 
                to="/portfolio/add-achievement" 
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
              >
                Add Achievement
              </Link>
            }
          />
        </div>
        
        {/* Events */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Events</h2>
          <EmptyState
            icon={<Calendar size={48} />}
            title="No Upcoming Events"
            description="Discover professional events and networking opportunities near you."
            action={
              <Link 
                to="/events/explore" 
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Explore Events
              </Link>
            }
          />
        </div>
        
        {/* Messages */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Messages</h2>
          <EmptyState
            icon={<MessageSquare size={48} />}
            title="No Messages"
            description="Start a conversation with your connections."
            action={
              <Link 
                to="/network" 
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Message a Connection
              </Link>
            }
          />
        </div>
        
        {/* Search Results */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Search Results</h2>
          <EmptyState
            icon={<Search size={48} />}
            title="No Results Found"
            description="Try adjusting your search terms or filters to find what you're looking for."
            action={
              <button 
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Clear Filters
              </button>
            }
          />
        </div>
        
        {/* Error State */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Error State</h2>
          <EmptyState
            icon={<AlertCircle size={48} className="text-red-500" />}
            title="Something Went Wrong"
            description="We couldn't load the data. Please try again later or contact support if the problem persists."
            action={
              <button 
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Try Again
              </button>
            }
            className="text-red-600"
          />
        </div>
        
        {/* Activity Feed */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Activity Feed</h2>
          <EmptyState
            icon={<BookOpen size={48} />}
            title="Your Feed is Empty"
            description="Connect with more professionals and follow topics to see relevant updates here."
            action={
              <Link 
                to="/discover" 
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Discover Connections
              </Link>
            }
          />
        </div>
        
        {/* Notifications */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Notifications</h2>
          <EmptyState
            imageUrl="/illustrations/notification-empty.svg"
            imageAlt="No notifications"
            title="All Caught Up"
            description="You don't have any new notifications at the moment."
            action={
              <Link 
                to="/home" 
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Return to Home
              </Link>
            }
          />
        </div>
      </div>
    </div>
  );
};

export default EmptyState;
