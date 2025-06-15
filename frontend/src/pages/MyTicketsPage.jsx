import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Download, 
  ChevronRight, 
  Search, 
  Ticket,
  CheckCircle,
  XCircle,
  AlertCircle,
  Filter,
  User,
  Share2,
  Gift
} from 'lucide-react';
import eventService from '../services/eventService';

const MyTicketsPage = () => {
  const navigate = useNavigate();
  
  // State variables
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('upcoming'); // upcoming, past, all
  const [searchQuery, setSearchQuery] = useState('');
  
  // Get current date for filtering
  const now = new Date();
  
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
  
  // Format currency
  const formatCurrency = (amount, currencyCode = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode
    }).format(amount);
  };
  
  // Fetch bookings
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Fetching user bookings...');
        
        // Use the correct service method - note the difference from eventService
        const response = await eventService.getUserBookings();
        console.log('User bookings response:', response);
        
        // Handle different response structures
        let bookingsData = [];
        if (response && Array.isArray(response)) {
          bookingsData = response;
        } else if (response && response.data && Array.isArray(response.data)) {
          bookingsData = response.data;
        } else if (response && Array.isArray(response.bookings)) {
          bookingsData = response.bookings;
        } else {
          console.warn('Unexpected response structure:', response);
          bookingsData = [];
        }
        
        console.log('Processed bookings data:', bookingsData);
        setBookings(bookingsData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching bookings:', err);
        setError('Failed to load your tickets. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchBookings();
  }, []);
  
  // Get ticket status
  const getTicketStatus = (ticket, eventStartDate) => {
    if (!ticket) {
      return {
        label: 'Unknown',
        colorClass: 'bg-gray-100 text-gray-800',
        icon: <AlertCircle className="w-4 h-4 mr-1" />
      };
    }

    if (ticket.checkedIn) {
      return {
        label: 'Checked In',
        colorClass: 'bg-green-100 text-green-800',
        icon: <CheckCircle className="w-4 h-4 mr-1" />
      };
    }
    
    if (ticket.status === 'cancelled') {
      return {
        label: 'Cancelled',
        colorClass: 'bg-red-100 text-red-800',
        icon: <XCircle className="w-4 h-4 mr-1" />
      };
    }
    
    if (ticket.status === 'transferred') {
      return {
        label: 'Transferred',
        colorClass: 'bg-purple-100 text-purple-800',
        icon: <Gift className="w-4 h-4 mr-1" />
      };
    }
    
    const eventDate = new Date(eventStartDate);
    if (eventDate < now) {
      return {
        label: 'Past Event',
        colorClass: 'bg-gray-100 text-gray-800',
        icon: <AlertCircle className="w-4 h-4 mr-1" />
      };
    }
    
    return {
      label: 'Valid',
      colorClass: 'bg-blue-100 text-blue-800',
      icon: <CheckCircle className="w-4 h-4 mr-1" />
    };
  };
  
  // Get booking status
  const getBookingStatus = (booking) => {
    if (!booking) {
      return {
        label: 'Unknown',
        colorClass: 'bg-gray-100 text-gray-800',
        icon: <AlertCircle className="w-4 h-4 mr-1" />
      };
    }

    if (booking.status === 'cancelled') {
      return {
        label: 'Cancelled',
        colorClass: 'bg-red-100 text-red-800',
        icon: <XCircle className="w-4 h-4 mr-1" />
      };
    }
    
    if (booking.status === 'pending') {
      return {
        label: 'Pending',
        colorClass: 'bg-yellow-100 text-yellow-800',
        icon: <AlertCircle className="w-4 h-4 mr-1" />
      };
    }
    
    return {
      label: 'Confirmed',
      colorClass: 'bg-green-100 text-green-800',
      icon: <CheckCircle className="w-4 h-4 mr-1" />
    };
  };
  
  // Filter bookings based on filter and search
  const filteredBookings = () => {
    // Start with all bookings
    let filtered = bookings;
    
    // Apply search filter if any
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(booking => {
        // Get event details - handle different possible structures
        const event = booking.event || {};
        
        return (
          (event.name && event.name.toLowerCase().includes(query)) ||
          (event.location?.name && event.location.name.toLowerCase().includes(query)) ||
          (booking.reference && booking.reference.toLowerCase().includes(query)) ||
          (booking.bookingNumber && booking.bookingNumber.toLowerCase().includes(query))
        );
      });
    }
    
    // Apply date filter
    switch (filter) {
      case 'upcoming':
        return filtered.filter(booking => {
          const event = booking.event || booking.eventId || {};
          const eventDate = new Date(event.startDateTime);
          return !isNaN(eventDate) && eventDate >= now;
        });
        
      case 'past':
        return filtered.filter(booking => {
          const event = booking.event || booking.eventId || {};
          const eventDate = new Date(event.startDateTime);
          return !isNaN(eventDate) && eventDate < now;
        });
        
      default: // 'all'
        return filtered;
    }
  };
  
  // Handle search submission
  const handleSearch = (e) => {
    e.preventDefault();
    // Already handled via state
  };
  
  // Download ticket
  const handleDownloadTicket = async (ticketId) => {
    try {
      console.log('Downloading ticket:', ticketId);
      const blob = await eventService.downloadTicketPdf(ticketId);
      
      // Create a URL for the blob
      const url = window.URL.createObjectURL(blob);
      
      // Create a temporary link and click it to download
      const a = document.createElement('a');
      a.href = url;
      a.download = `ticket-${ticketId}.pdf`;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error downloading ticket:', err);
      alert('Failed to download ticket. Please try again later.');
    }
  };
  
  // Handle cancel booking
  const handleCancelBooking = async (bookingId) => {
    const confirmCancel = window.confirm(
      'Are you sure you want to cancel this booking? This action cannot be undone.'
    );
    
    if (confirmCancel) {
      try {
        await eventService.cancelBooking(bookingId);
        
        // Update the booking in state
        setBookings(prevBookings =>
          prevBookings.map(booking => {
            if ((booking.id || booking._id) === bookingId) {
              return { ...booking, status: 'cancelled' };
            }
            return booking;
          })
        );
      } catch (err) {
        console.error('Error cancelling booking:', err);
        alert('Failed to cancel booking. Please try again later.');
      }
    }
  };
  
  // Transfer ticket
  const handleTransferTicket = (ticketId) => {
    navigate(`/tickets/${ticketId}/transfer`);
  };
  
  return (
    <div className="bg-gray-50 min-h-screen pb-12">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">My Tickets</h1>
            <Link 
              to="/events" 
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              Browse Events
            </Link>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 space-y-4 md:space-y-0">
          {/* Filter Toggle */}
          <div className="inline-flex bg-white rounded-md shadow-sm" role="group">
            <button
              type="button"
              onClick={() => setFilter('upcoming')}
              className={`px-4 py-2 text-sm font-medium rounded-l-md ${
                filter === 'upcoming'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border-y border-l border-gray-300'
              }`}
            >
              Upcoming
            </button>
            <button
              type="button"
              onClick={() => setFilter('past')}
              className={`px-4 py-2 text-sm font-medium ${
                filter === 'past'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border-y border-gray-300'
              }`}
            >
              Past
            </button>
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`px-4 py-2 text-sm font-medium rounded-r-md ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border-y border-r border-gray-300'
              }`}
            >
              All Tickets
            </button>
          </div>
          
          {/* Search */}
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              placeholder="Search tickets..."
              className="pl-9 pr-4 py-2 w-full sm:w-60 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          </form>
        </div>
        
        {/* Ticket Count */}
        <div className="mb-6 text-sm text-gray-600">
          Showing {filteredBookings().length} ticket{filteredBookings().length !== 1 ? 's' : ''}
        </div>
        
        {/* Tickets List */}
        {loading ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your tickets...</p>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-red-500">{error}</p>
            <button 
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md"
              onClick={() => window.location.reload()}
              >
              Try Again
            </button>
          </div>
        ) : filteredBookings().length === 0 ? (
          <div className="text-center py-20 bg-white rounded-lg shadow-sm">
            <Ticket className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            
            {filter === 'upcoming' && (
              <>
                <h2 className="text-xl font-medium text-gray-900 mb-2">No upcoming tickets</h2>
                <p className="text-gray-600 mb-6">You don't have any tickets for upcoming events.</p>
              </>
            )}
            
            {filter === 'past' && (
              <>
                <h2 className="text-xl font-medium text-gray-900 mb-2">No past tickets</h2>
                <p className="text-gray-600 mb-6">You don't have any tickets from past events.</p>
              </>
            )}
            
            {filter === 'all' && (
              <>
                <h2 className="text-xl font-medium text-gray-900 mb-2">No tickets found</h2>
                <p className="text-gray-600 mb-6">You haven't purchased any tickets yet.</p>
              </>
            )}
            
            <Link 
              to="/events" 
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              Browse Events
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredBookings().map(booking => {
              // Handle different event object structures
              const event = booking.event || booking.eventId || {};
              const bookingStatus = getBookingStatus(booking);
              const eventDate = new Date(event.startDateTime);
              const isPastEvent = eventDate < now;
              
              // Handle different ticket structures
              const tickets = booking.tickets || [];
              const ticketCount = booking.ticketCount || tickets.length || 0;
              
              return (
                <div 
                  key={booking.id || booking._id} 
                  className="bg-white rounded-lg shadow-sm overflow-hidden"
                >
                  {/* Booking Header */}
                  <div className="px-6 py-4 border-b border-gray-200 flex flex-col md:flex-row md:items-center justify-between">
                    <div className="mb-2 md:mb-0">
                      <h3 className="text-lg font-bold text-gray-900">
                        {event.name || "Event"}
                      </h3>
                      <div className="text-sm text-gray-600">
                        Booking Reference: {booking.reference || booking.bookingNumber || (booking.id || booking._id)}
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center">
                      <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bookingStatus.colorClass} mr-0 mb-2 sm:mb-0 sm:mr-4`}>
                        {bookingStatus.icon}
                        {bookingStatus.label}
                      </div>
                      
                      <Link 
                        to={`/events/${event.id || event._id}`} 
                        className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center"
                      >
                        View Event
                        <ChevronRight className="ml-1 w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                  
                  {/* Event Details */}
                  <div className="px-6 py-4 bg-gray-50">
                    <div className="flex flex-col md:flex-row md:items-center text-gray-600 space-y-2 md:space-y-0 md:space-x-6">
                      <div className="flex items-center">
                        <Calendar className="w-5 h-5 mr-2 flex-shrink-0 text-gray-500" />
                        <span>{formatDate(event.startDateTime)}</span>
                      </div>
                      
                      <div className="flex items-center">
                        <Clock className="w-5 h-5 mr-2 flex-shrink-0 text-gray-500" />
                        <span>{formatTime(event.startDateTime)}</span>
                      </div>
                      
                      <div className="flex items-center">
                        <MapPin className="w-5 h-5 mr-2 flex-shrink-0 text-gray-500" />
                        <span>
                          {event.virtual 
                            ? "Virtual Event" 
                            : `${event.location?.name || ''}${event.location?.city ? `, ${event.location.city}` : ''}`}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Tickets Display */}
                  <div className="px-6 py-4">
                    <h4 className="font-medium text-gray-900 mb-3">Your Tickets ({ticketCount})</h4>
                    
                    {/* Handle group tickets vs individual tickets */}
                    {booking.groupTicket && tickets.length === 1 ? (
                      // Group ticket display
                      <div className="border border-gray-200 rounded-lg p-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                          <div>
                            <div className="flex items-center">
                              <h5 className="font-medium text-gray-900">
                                Group Ticket ({ticketCount} tickets)
                              </h5>
                              <div className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTicketStatus(tickets[0], event.startDateTime).colorClass}`}>
                                {getTicketStatus(tickets[0], event.startDateTime).icon}
                                {getTicketStatus(tickets[0], event.startDateTime).label}
                              </div>
                            </div>
                            
                            <p className="text-sm text-gray-600 mt-1">
                              {booking.totalAmount > 0 
                                ? `Paid: ${formatCurrency(booking.totalAmount, booking.currency)}` 
                                : "Free Tickets"}
                            </p>
                          </div>
                          
                          <div className="flex flex-wrap mt-3 sm:mt-0 space-x-2">
                            <button
                              onClick={() => handleDownloadTicket(tickets[0].id || tickets[0]._id)}
                              className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                            >
                              <Download className="w-3.5 h-3.5 mr-1" />
                              Download
                            </button>
                            
                            {!isPastEvent && getTicketStatus(tickets[0], event.startDateTime).label === 'Valid' && (
                              <button
                                onClick={() => handleTransferTicket(tickets[0].id || tickets[0]._id)}
                                className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                              >
                                <Gift className="w-3.5 h-3.5 mr-1" />
                                Transfer
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      // Individual tickets display
                      <div className="space-y-4">
                        {tickets.map(ticket => {
                          const ticketStatus = getTicketStatus(ticket, event.startDateTime);
                          const isValid = ticketStatus.label === 'Valid';
                          
                          return (
                            <div 
                              key={ticket.id || ticket._id} 
                              className="border border-gray-200 rounded-lg p-4"
                            >
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                                <div>
                                  <div className="flex items-center">
                                    <h5 className="font-medium text-gray-900">
                                      {ticket.ticketType?.name || "Standard Ticket"}
                                    </h5>
                                    <div className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${ticketStatus.colorClass}`}>
                                      {ticketStatus.icon}
                                      {ticketStatus.label}
                                    </div>
                                  </div>
                                  
                                  <p className="text-sm text-gray-600 mt-1">
                                    {ticket.isPaid 
                                      ? `Paid: ${formatCurrency(ticket.ticketType?.price || 0, booking.currency)}` 
                                      : "Free Ticket"}
                                  </p>
                                  
                                  {ticket.attendee && (
                                    <div className="flex items-center text-sm text-gray-600 mt-1">
                                      <User className="w-4 h-4 mr-1 text-gray-400" />
                                      {ticket.attendee.firstName} {ticket.attendee.lastName}
                                    </div>
                                  )}
                                </div>
                                
                                <div className="flex flex-wrap mt-3 sm:mt-0 space-x-2">
                                  <button
                                    onClick={() => handleDownloadTicket(ticket.id || ticket._id)}
                                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                                    disabled={!isValid}
                                  >
                                    <Download className="w-3.5 h-3.5 mr-1" />
                                    Download
                                  </button>
                                  
                                  {!isPastEvent && isValid && (
                                    <button
                                      onClick={() => handleTransferTicket(ticket.id || ticket._id)}
                                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                                    >
                                      <Gift className="w-3.5 h-3.5 mr-1" />
                                      Transfer
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  
                  {/* Booking Footer */}
                  <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
                    <div>
                      <span className="font-medium">Total:</span>{' '}
                      <span className="font-bold">
                        {formatCurrency(booking.totalAmount || booking.total || 0, booking.currency)}
                      </span>
                    </div>
                    
                    <div className="flex space-x-2">
                      {!isPastEvent && booking.status !== 'cancelled' && (
                        <button
                          onClick={() => handleCancelBooking(booking.id || booking._id)}
                          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded text-red-700 bg-white hover:bg-gray-50"
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Cancel Booking
                        </button>
                      )}
                      
                      <button
                        onClick={() => {
                          if (navigator.share) {
                            navigator.share({
                              title: event.name,
                              text: `Check out this event: ${event.name}`,
                              url: window.location.origin + `/events/${event.id || event._id}`
                            }).catch(err => console.error('Error sharing:', err));
                          } else {
                            // Fallback for browsers without native sharing
                            const url = window.location.origin + `/events/${event.id || event._id}`;
                            navigator.clipboard.writeText(url).then(() => {
                              alert('Event link copied to clipboard!');
                            }).catch(() => {
                              alert('Unable to share. Please copy the URL manually.');
                            });
                          }
                        }}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <Share2 className="w-4 h-4 mr-1" />
                        Share Event
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyTicketsPage;
