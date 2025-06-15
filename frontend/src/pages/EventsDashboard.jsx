import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { 
  BarChart3, 
  Users, 
  Calendar, 
  Clock, 
  MapPin, 
  Edit3, 
  Settings, 
  Ticket, 
  MessageSquare,
  ChevronRight,
  Download,
  Mail,
  Share2,
  Bell,
  AlertTriangle,
  CheckCircle,
  User,
  DollarSign,
  Eye,
  List,
  Image,
  Plus
} from 'lucide-react';
import eventService from '../services/eventService';

const EventDashboardPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  
  // State variables
  const [event, setEvent] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ticketStats, setTicketStats] = useState(null);
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "Date TBA";
    
    try {
      const options = { weekday: 'short', month: 'short', day: 'numeric' };
      return new Date(dateString).toLocaleDateString('en-US', options);
    } catch (err) {
      console.error("Date formatting error:", err);
      return "Invalid date";
    }
  };
  
  // Format time for display
  const formatTime = (dateString) => {
    if (!dateString) return "Time TBA";
    
    try {
      const options = { hour: '2-digit', minute: '2-digit' };
      return new Date(dateString).toLocaleTimeString('en-US', options);
    } catch (err) {
      console.error("Time formatting error:", err);
      return "Invalid time";
    }
  };
  
  // Safely get the attendee count
  const getAttendeeCount = (attendeeCounts, type) => {
    if (!attendeeCounts) return 0;
    
    const count = attendeeCounts[type];
    
    if (typeof count === 'number') {
      return count;
    }
    
    if (count && typeof count === 'object' && count.count !== undefined) {
      return count.count;
    }
    
    return 0;
  };
  
  // Format currency
  const formatCurrency = (amount, currencyCode = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode
    }).format(amount);
  };
  
  // Fetch event and analytics data
  useEffect(() => {
    const fetchEventData = async () => {
      try {
        setLoading(true);
        
        if (!eventId) {
          setError('Invalid event ID');
          setLoading(false);
          return;
        }
        
        // Fetch event details
        const eventResponse = await eventService.getEvent(eventId);
        setEvent(eventResponse.data);
        
        try {
          // Fetch analytics
          const analyticsResponse = await eventService.getEventAnalytics(eventId);
          setAnalytics(analyticsResponse);
          
          // Fetch ticket stats
          const ticketStatsResponse = await eventService.getEventBookingStats(eventId);
          setTicketStats(ticketStatsResponse);
        } catch (analyticsError) {
          console.error('Error fetching analytics:', analyticsError);
          // Continue without analytics
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching event data:', err);
        setError('Failed to load event data. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchEventData();
  }, [eventId]);
  
  // Generate check-in code
  const handleGenerateCheckInCode = async () => {
    try {
      const response = await eventService.generateCheckInCode(eventId);
      console.log('Check-in code generated:', response);
      
      // Update event state with new code
      setEvent(prev => ({
        ...prev,
        checkInCode: response.code
      }));
      
      alert(`Check-in code: ${response.code}`);
    } catch (err) {
      console.error('Error generating check-in code:', err);
      alert('Failed to generate check-in code. Please try again later.');
    }
  };
  
  // Generate event report
  const handleGenerateReport = async (format = 'csv') => {
    try {
      const response = await eventService.generateEventReport(eventId, format);
      
      if (format === 'csv') {
        // Create a blob and download it
        const blob = new Blob([response], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `event-${eventId}-report.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        // For JSON, just log it to console
        console.log('Event report:', response);
        alert('Report generated successfully!');
      }
    } catch (err) {
      console.error('Error generating report:', err);
      alert('Failed to generate report. Please try again later.');
    }
  };
  
  // Get event status
  const getEventStatus = () => {
    if (!event) return { label: 'Unknown', colorClass: 'bg-gray-100 text-gray-800' };
    
    const now = new Date();
    const startDate = new Date(event.startDateTime);
    const endDate = event.endDateTime ? new Date(event.endDateTime) : null;
    
    if (event.status === 'cancelled') {
      return { label: 'Cancelled', colorClass: 'bg-red-100 text-red-800' };
    }
    
    if (now < startDate) {
      return { label: 'Upcoming', colorClass: 'bg-blue-100 text-blue-800' };
    }
    
    if (!endDate || now <= endDate) {
      return { label: 'In Progress', colorClass: 'bg-green-100 text-green-800' };
    }
    
    return { label: 'Ended', colorClass: 'bg-gray-100 text-gray-800' };
  };
  
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading event dashboard...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
          <button 
            onClick={() => navigate('/events')} 
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            Back to Events
          </button>
        </div>
      </div>
    );
  }
  
  if (!event) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <p className="text-gray-600">Event not found</p>
          <button 
            onClick={() => navigate('/events')} 
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            Back to Events
          </button>
        </div>
      </div>
    );
  }
  
  const eventStatus = getEventStatus();
  const goingCount = getAttendeeCount(event.attendeeCounts, 'going');
  const maybeCount = getAttendeeCount(event.attendeeCounts, 'maybe');
  const invitedCount = getAttendeeCount(event.attendeeCounts, 'invited');
  
  return (
    <div className="bg-gray-50 min-h-screen pb-12">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-center">
              <button 
                onClick={() => navigate('/events')} 
                className="mr-4 text-gray-600 hover:text-gray-900"
              >
                &larr; Back to Events
              </button>
              <h1 className="text-xl font-bold text-gray-900 truncate">
                Event Dashboard: {event.name}
              </h1>
              <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${eventStatus.colorClass}`}>
                {eventStatus.label}
              </span>
            </div>
            
            <div className="mt-4 md:mt-0 flex flex-wrap gap-2">
              <Link
                to={`/events/${eventId}/edit`}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <Edit3 className="w-4 h-4 mr-1" />
                Edit Event
              </Link>
              
              <Link
                to={`/events/${eventId}`}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <Eye className="w-4 h-4 mr-1" />
                View Event
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Event Summary */}
      <div className="bg-white shadow-sm mt-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center">
            {event.coverImage?.url && (
              <div className="mr-6 mb-4 md:mb-0">
                <img 
                  src={event.coverImage.url} 
                  alt={event.name} 
                  className="w-16 h-16 md:w-24 md:h-24 object-cover rounded-lg"
                />
              </div>
            )}
            
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900">{event.name}</h2>
              
              <div className="flex flex-wrap mt-2 gap-x-6 gap-y-2 text-sm text-gray-600">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1 text-gray-500" />
                  {formatDate(event.startDateTime)}
                </div>
                
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1 text-gray-500" />
                  {formatTime(event.startDateTime)}
                </div>
                
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1 text-gray-500" />
                  {event.virtual 
                    ? "Virtual Event" 
                    : (event.location?.name || "Location TBA")}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Navigation Tabs */}
      <div className="bg-white shadow-sm mt-1 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex -mb-px space-x-8 overflow-x-auto">
            <button
              onClick={() => setActiveTab('overview')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Overview
            </button>
            
            <button
              onClick={() => setActiveTab('attendees')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'attendees'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Attendees
            </button>
            
            <button
              onClick={() => setActiveTab('tickets')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'tickets'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Tickets
            </button>
            
            <button
              onClick={() => setActiveTab('checkin')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'checkin'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Check-in
            </button>
            
            <button
              onClick={() => setActiveTab('analytics')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'analytics'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Analytics
            </button>
          </nav>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
                    <Users className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Attendees</p>
                    <p className="text-2xl font-bold text-gray-900">{goingCount}</p>
                  </div>
                </div>
                <div className="mt-4 text-sm">
                  <span className="text-gray-500">{maybeCount} maybe • </span>
                  <span className="text-gray-500">{invitedCount} invited</span>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
                    <CheckCircle className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Check-ins</p>
                    <p className="text-2xl font-bold text-gray-900">{analytics?.metrics?.checkIns || 0}</p>
                  </div>
                </div>
                <div className="mt-4 text-sm">
                  <span className="text-gray-500">
                    {analytics?.metrics?.attendance ? `${analytics.metrics.attendance}% attendance rate` : 'No check-ins yet'}
                  </span>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
                    <Ticket className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Tickets Sold</p>
                    <p className="text-2xl font-bold text-gray-900">{ticketStats?.totalSold || 0}</p>
                  </div>
                </div>
                <div className="mt-4 text-sm">
                  <span className="text-gray-500">
                    {ticketStats?.totalRevenue ? formatCurrency(ticketStats.totalRevenue) : 'No revenue yet'}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Link 
                  to={`/events/${eventId}/attendees`}
                  className="inline-flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <Users className="h-6 w-6 text-blue-600 mb-2" />
                  <span className="text-sm font-medium">Manage Attendees</span>
                </Link>
                
                <Link 
                  to={`/events/${eventId}/tickets/manage`}
                  className="inline-flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <Ticket className="h-6 w-6 text-purple-600 mb-2" />
                  <span className="text-sm font-medium">Manage Tickets</span>
                </Link>
                
                <button 
                  onClick={handleGenerateCheckInCode}
                  className="inline-flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <CheckCircle className="h-6 w-6 text-green-600 mb-2" />
                  <span className="text-sm font-medium">Generate Check-in Code</span>
                </button>
                
                <button 
                  onClick={() => handleGenerateReport('csv')}
                  className="inline-flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <Download className="h-6 w-6 text-gray-600 mb-2" />
                  <span className="text-sm font-medium">Export Attendee List</span>
                </button>
              </div>
            </div>
            
            {/* Event Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 bg-white rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-gray-900">Event Details</h3>
                  <Link 
                    to={`/events/${eventId}/edit`}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Edit
                  </Link>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-600">Description</h4>
                    <p className="mt-1 text-gray-900">
                      {event.description || 'No description provided'}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-600">Category</h4>
                      <p className="mt-1 text-gray-900">{event.category || 'Not specified'}</p>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-600">Visibility</h4>
                      <p className="mt-1 text-gray-900 capitalize">{event.visibility || 'Public'}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-600">Event Type</h4>
                      <p className="mt-1 text-gray-900">{event.virtual ? 'Virtual Event' : 'In-Person Event'}</p>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-600">Maximum Capacity</h4>
                      <p className="mt-1 text-gray-900">{event.capacity ? event.capacity : 'Unlimited'}</p>
                    </div>
                  </div>
                  
                  {!event.virtual && event.location && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-600">Location</h4>
                      <p className="mt-1 text-gray-900">
                        {event.location.name}
                        {event.location.address && `, ${event.location.address}`}
                        {event.location.city && `, ${event.location.city}`}
                        {event.location.state && `, ${event.location.state}`}
                        {event.location.country && ` ${event.location.country}`}
                      </p>
                    </div>
                  )}
                  
                  {event.virtual && event.virtualMeetingLink && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-600">Virtual Meeting Link</h4>
                      <a 
                        href={event.virtualMeetingLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="mt-1 text-blue-600 hover:text-blue-700"
                      >
                        {event.virtualMeetingLink}
                      </a>
                    </div>
                  )}
                  
                  {event.tags && event.tags.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-600">Tags</h4>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {event.tags.map(tag => (
                          <span 
                            key={tag} 
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {event.requireApproval && (
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <AlertTriangle className="h-5 w-5 text-yellow-400" />
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-yellow-700">
                            This event requires approval for attendees. Remember to check your pending requests.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Recent Activity */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h3>
                
                {(analytics?.responses?.latest && analytics.responses.latest.length > 0) ? (
                  <div className="space-y-4">
                    {analytics.responses.latest.slice(0, 5).map((response, index) => (
                      <div key={index} className="flex items-start">
                        <div className="rounded-full bg-gray-200 h-8 w-8 flex items-center justify-center mr-3">
                          <User className="h-4 w-4 text-gray-500" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            User {response.userId.substring(0, 6)}...
                          </p>
                          <p className="text-xs text-gray-500">
                            {response.status === 'going' && 'Is going to your event'}
                            {response.status === 'maybe' && 'Might attend your event'}
                            {response.status === 'declined' && 'Declined your invitation'}
                            {response.status === 'pending' && 'Requested to join your event'}
                          </p>
                          <p className="text-xs text-gray-400">
                            {new Date(response.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm italic">No recent activity</p>
                )}
                
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <Link 
                    to={`/events/${eventId}/attendees`} 
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center"
                  >
                    View all activity
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Attendees Tab */}
        {activeTab === 'attendees' && (
          <div>
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                  <h3 className="text-lg font-bold text-gray-900">Attendee Management</h3>
                  
                  <div className="mt-3 sm:mt-0 flex flex-wrap gap-2">
                    <Link 
                      to={`/events/${eventId}/attendees/invite`}
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Invite People
                    </Link>
                    
                    <button 
                      onClick={() => handleGenerateReport('csv')}
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Export List
                    </button>
                    
                    <button 
                      onClick={() => navigate(`/events/${eventId}/attendees/email`)}
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <Mail className="w-4 h-4 mr-1" />
                      Email Attendees
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="px-6 py-4">
                <h4 className="font-medium text-gray-900 mb-4">Attendee Summary</h4>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-gray-900">{goingCount}</div>
                    <div className="text-sm text-gray-600">Going</div>
                  </div>
                  
                  <div className="bg-yellow-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-gray-900">{maybeCount}</div>
                    <div className="text-sm text-gray-600">Maybe</div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-gray-900">{invitedCount}</div>
                    <div className="text-sm text-gray-600">Invited</div>
                  </div>
                  
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-gray-900">{analytics?.metrics?.checkIns || 0}</div>
                    <div className="text-sm text-gray-600">Checked In</div>
                  </div>
                </div>
              </div>
              
              <div className="px-6 py-4 border-t border-gray-200 text-center">
                <Link 
                  to={`/events/${eventId}/attendees`}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  View Full Attendee List
                  <ChevronRight className="inline ml-1 w-4 h-4" />
                </Link>
              </div>
            </div>
            
            {/* Pending Approvals Section */}
            {event.requireApproval && (
              <div className="mt-6 bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900">Pending Approval Requests</h3>
                </div>
                
                {/* Pending Approvals List would go here */}
                <div className="px-6 py-4 text-center text-gray-500">
                  <p>No pending approval requests</p>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Tickets Tab */}
        {activeTab === 'tickets' && (
          <div>
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                  <h3 className="text-lg font-bold text-gray-900">Ticket Management</h3>
                  
                  <div className="mt-3 sm:mt-0 flex flex-wrap gap-2">
                    <Link 
                      to={`/events/${eventId}/tickets/new`}
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Create Ticket Type
                    </Link>
                    
                    <button 
                      onClick={() => handleGenerateReport('csv')}
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Download Sales Report
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="px-6 py-4">
                <h4 className="font-medium text-gray-900 mb-4">Sales Summary</h4>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-gray-900">{ticketStats?.totalSold || 0}</div>
                    <div className="text-sm text-gray-600">Tickets Sold</div>
                  </div>
                  
                  <div className="bg-purple-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-gray-900">{formatCurrency(ticketStats?.totalRevenue || 0)}</div>
                    <div className="text-sm text-gray-600">Revenue</div>
                  </div>
                  
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-gray-900">{ticketStats?.checkedIn || 0}</div>
                    <div className="text-sm text-gray-600">Checked In</div>
                  </div>
                  
                  <div className="bg-red-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-gray-900">{ticketStats?.cancelled || 0}</div>
                    <div className="text-sm text-gray-600">Cancelled</div>
                  </div>
                </div>
              </div>
              
              <div className="px-6 py-4 border-t border-gray-200 text-center">
                <Link 
                  to={`/events/${eventId}/tickets/manage`}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Manage Ticket Types & Sales
                  <ChevronRight className="inline ml-1 w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        )}
        
        {/* Check-in Tab */}
        {activeTab === 'checkin' && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Check-in Options</h3>
                
                <div className="space-y-6">
                  <div className="bg-blue-50 rounded-lg p-6">
                    <h4 className="font-medium text-gray-900 mb-2">QR Code Check-in</h4>
                    <p className="text-gray-600 mb-4">
                      Attendees can check in by showing their ticket QR code at the event.
                    </p>
                    <Link 
                      to={`/events/${eventId}/checkin/scan`}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                      Launch Scanner
                    </Link>
                  </div>
                  
                  <div className="bg-green-50 rounded-lg p-6">
                    <h4 className="font-medium text-gray-900 mb-2">Check-in Code</h4>
                    <p className="text-gray-600 mb-4">
                      Generate a code that attendees can enter on their devices to check in.
                    </p>
                    
                    {event.checkInCode ? (
                      <div>
                        <div className="bg-white p-3 rounded border border-gray-200 mb-3">
                          <span className="text-2xl font-bold tracking-wide text-gray-900">{event.checkInCode}</span>
                        </div>
                        <button 
                          onClick={handleGenerateCheckInCode}
                          className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                        >
                          Generate New Code
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={handleGenerateCheckInCode}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                      >
                        Generate Code
                      </button>
                    )}
                  </div>
                  
                  <div className="bg-purple-50 rounded-lg p-6">
                    <h4 className="font-medium text-gray-900 mb-2">Manual Check-in</h4>
                    <p className="text-gray-600 mb-4">
                      Manually check in attendees by searching for their name or ticket.
                    </p>
                    <Link 
                      to={`/events/${eventId}/checkin/manual`}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
                    >
                      Manual Check-in
                    </Link>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Check-in Stats</h3>
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Checked In:</span>
                    <span className="font-bold">{analytics?.metrics?.checkIns || 0}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Attendance Rate:</span>
                    <span className="font-bold">{analytics?.metrics?.attendance || 0}%</span>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-green-600 h-2.5 rounded-full" 
                      style={{ width: `${analytics?.metrics?.attendance || 0}%` }}
                    ></div>
                  </div>
                </div>
                
                <h4 className="font-medium text-gray-900 mb-2">Recent Check-ins</h4>
                
                {(analytics?.checkIns?.list && analytics.checkIns.list.length > 0) ? (
                  <div className="space-y-3">
                    {analytics.checkIns.list.slice(0, 5).map((checkIn, index) => (
                      <div key={index} className="flex items-center">
                        <div className="rounded-full bg-gray-200 h-8 w-8 flex items-center justify-center mr-3">
                          <User className="h-4 w-4 text-gray-500" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{checkIn.user.name}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(checkIn.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm italic">No check-ins yet</p>
                )}
                
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <Link 
                    to={`/events/${eventId}/checkin/history`} 
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center"
                  >
                    View all check-ins
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div>
            <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-bold text-gray-900">Event Analytics</h3>
              </div>
              
              <div className="px-6 py-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-gray-900">{goingCount}</div>
                    <div className="text-sm text-gray-600">Total Attendees</div>
                    <div className="mt-2 text-xs text-gray-500">
                      {analytics?.metrics?.responseRate && `${analytics.metrics.responseRate}% response rate`}
                    </div>
                  </div>
                  
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-gray-900">{analytics?.metrics?.checkIns || 0}</div>
                    <div className="text-sm text-gray-600">Check-ins</div>
                    <div className="mt-2 text-xs text-gray-500">
                      {analytics?.metrics?.attendance && `${analytics.metrics.attendance}% attendance rate`}
                    </div>
                  </div>
                  
                  <div className="bg-purple-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-gray-900">{ticketStats?.totalRevenue ? formatCurrency(ticketStats.totalRevenue) : '$0'}</div>
                    <div className="text-sm text-gray-600">Revenue</div>
                    <div className="mt-2 text-xs text-gray-500">
                      {ticketStats?.totalSold ? `${ticketStats.totalSold} tickets sold` : 'No tickets sold'}
                    </div>
                  </div>
                </div>
                
                <h4 className="font-medium text-gray-900 mb-4">Response Timeline</h4>
                <div className="h-64 bg-gray-100 rounded flex items-center justify-center mb-6">
                  <p className="text-gray-500">Response timeline chart would display here</p>
                </div>
                
                <h4 className="font-medium text-gray-900 mb-4">Attendance Summary</h4>
                <div className="h-64 bg-gray-100 rounded flex items-center justify-center">
                  <p className="text-gray-500">Attendance chart would display here</p>
                </div>
              </div>
              
              <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
                <button 
                  onClick={() => handleGenerateReport('json')}
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Download className="w-4 h-4 mr-1" />
                  Export Full Analytics
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventDashboardPage;