import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Check, 
  Calendar, 
  Clock, 
  MapPin, 
  Download, 
  Share2, 
  CalendarPlus, 
  Ticket, 
  ChevronRight,
  Mail
} from 'lucide-react';
import eventService from '../services/eventService';
import ticketService from '../services/ticketService'; // Import ticketService

const TicketConfirmationPage = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  
  const [booking, setBooking] = useState(null);
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "Date TBA";
    
    try {
      const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
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
  
  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        setLoading(true);
        
        if (!bookingId || bookingId === 'success') {
          // Handle the case where we don't have a real booking ID (demo mode)
          setLoading(false);
          return;
        }
        
        // Fetch booking details using ticketService instead of eventService
        const bookingResponse = await ticketService.getBooking(bookingId);
        console.log('Booking response:', bookingResponse);
        
        // Check different possible response structures
        const bookingData = bookingResponse.data || bookingResponse;
        setBooking(bookingData);
        
        // Fetch related event details if not included in booking
        if (bookingData) {
          if (bookingData.event) {
            if (typeof bookingData.event === 'object') {
              setEvent(bookingData.event);
            } else {
              // If only event ID is provided, fetch the event details
              const eventId = bookingData.event;
              const eventResponse = await eventService.getEvent(eventId);
              setEvent(eventResponse.data || eventResponse);
            }
          } else if (bookingData.eventId) {
            // Try with eventId if event property doesn't exist
            const eventResponse = await eventService.getEvent(bookingData.eventId);
            setEvent(eventResponse.data || eventResponse);
          }
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching booking details:', err);
        setError('Failed to load booking information. Please check your email for confirmation details.');
        setLoading(false);
      }
    };
    
    fetchBookingDetails();
  }, [bookingId]);
  
  // Function to handle downloading tickets
  const handleDownloadTickets = async () => {
    try {
      if (!booking || !booking.id) {
        console.error('No booking ID available for download');
        return;
      }
      
      // For each ticket, download the PDF
      const tickets = booking.tickets || [];
      if (tickets.length === 0) {
        alert('No tickets available for download');
        return;
      }
      
      // If there's just one ticket, download it directly
      if (tickets.length === 1) {
        const ticket = tickets[0];
        const ticketId = ticket.id || ticket._id;
        const blob = await ticketService.downloadTicketPdf(ticketId);
        
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
      } else {
        // For multiple tickets, inform the user
        alert('Your tickets will download individually');
        
        // Download each ticket
        for (let i = 0; i < tickets.length; i++) {
          const ticket = tickets[i];
          const ticketId = ticket.id || ticket._id;
          
          setTimeout(async () => {
            const blob = await ticketService.downloadTicketPdf(ticketId);
            
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
          }, i * 1000); // Stagger downloads to avoid overwhelming the browser
        }
      }
    } catch (err) {
      console.error('Error downloading tickets:', err);
      alert('Failed to download tickets. Please try again later or check your email.');
    }
  };
  
  // Function to handle adding event to calendar
  const handleAddToCalendar = async () => {
    try {
      if (!event || (!event._id && !event.id)) {
        console.error('No event ID available for calendar');
        return;
      }
      
      const eventId = event._id || event.id;
      const response = await ticketService.addToCalendar(eventId);
      console.log('Calendar response:', response);
      
      alert('Event added to your calendar');
    } catch (err) {
      console.error('Error adding to calendar:', err);
      alert('Failed to add event to calendar. Please try again later.');
    }
  };
  
  // Format currency
  const formatCurrency = (amount, currencyCode = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode
    }).format(amount);
  };
  
  // Demo data for when we don't have a real booking ID
  const demoEvent = {
    name: 'Sample Event Confirmation',
    startDateTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
    location: {
      name: 'Demo Venue',
      city: 'Sample City'
    },
    coverImage: { url: '/api/placeholder/800/400' }
  };
  
  const demoBooking = {
    id: 'demo-booking',
    createdAt: new Date(),
    status: 'confirmed',
    customerInfo: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com'
    },
    tickets: [
      {
        id: 'demo-ticket-1',
        ticketType: {
          name: 'General Admission',
          price: 29.99
        },
        quantity: 2
      }
    ],
    total: 59.98,
    currency: 'USD'
  };
  
  // Use demo data if in demo mode
  const displayEvent = event || (bookingId === 'success' ? demoEvent : null);
  const displayBooking = booking || (bookingId === 'success' ? demoBooking : null);
  
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <div className="w-16 h-16 border-t-4 border-orange-500 border-solid rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your booking confirmation...</p>
        </div>
      </div>
    );
  }
  
  if (error && !displayBooking) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
          <button 
            onClick={() => navigate('/events')} 
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700"
          >
            Browse Events
          </button>
        </div>
      </div>
    );
  }
  
  if (!displayBooking || !displayEvent) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <p className="text-gray-600">Booking information not found</p>
          <button 
            onClick={() => navigate('/events')} 
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700"
          >
            Browse Events
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-gray-50 min-h-screen pb-12">
      {/* Success Banner */}
      <div className="bg-green-100 border-b border-green-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-center text-green-700">
            <Check className="w-5 h-5 mr-2" />
            <span className="font-medium">Order completed successfully!</span>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Confirmation Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Tickets are Confirmed!</h1>
          <p className="text-lg text-gray-600">
            We've sent a confirmation to {displayBooking.customerInfo?.email || 'your email'}
          </p>
        </div>
        
        {/* Event Card */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
          {displayEvent.coverImage?.url && (
            <div className="h-48 w-full">
              <img 
                src={displayEvent.coverImage.url} 
                alt={displayEvent.name || displayEvent.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">{displayEvent.name || displayEvent.title}</h2>
            
            <div className="flex flex-col md:flex-row md:items-center text-gray-600 mb-4 space-y-2 md:space-y-0 md:space-x-4">
              <div className="flex items-center">
                <Calendar className="w-5 h-5 mr-2 flex-shrink-0 text-gray-500" />
                <span>{formatDate(displayEvent.startDateTime || displayEvent.startDate)}</span>
              </div>
              
              <div className="flex items-center">
                <Clock className="w-5 h-5 mr-2 flex-shrink-0 text-gray-500" />
                <span>{formatTime(displayEvent.startDateTime || displayEvent.startDate)}</span>
              </div>
              
              <div className="flex items-center">
                <MapPin className="w-5 h-5 mr-2 flex-shrink-0 text-gray-500" />
                <span>
                  {displayEvent.virtual || displayEvent.isOnline
                    ? "Virtual Event" 
                    : `${displayEvent.location?.name || ''}${displayEvent.location?.city ? `, ${displayEvent.location.city}` : ''}`}
                </span>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 mt-4">
              <button 
                onClick={handleDownloadTickets}
                className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Tickets
              </button>
              
              <button 
                onClick={handleAddToCalendar}
                className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <CalendarPlus className="w-4 h-4 mr-2" />
                Add to Calendar
              </button>
              
              <button className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </button>
            </div>
          </div>
        </div>
        
        {/* Order Details */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Order Details</h2>
          
          <div className="space-y-4 mb-6">
            <div className="flex justify-between">
              <div className="text-gray-600">Order Number</div>
              <div className="font-medium">{displayBooking.id || displayBooking._id || 'N/A'}</div>
            </div>
            
            <div className="flex justify-between">
              <div className="text-gray-600">Order Date</div>
              <div className="font-medium">
                {displayBooking.createdAt 
                  ? new Date(displayBooking.createdAt).toLocaleDateString() 
                  : new Date().toLocaleDateString()}
              </div>
            </div>
            
            <div className="flex justify-between">
              <div className="text-gray-600">Status</div>
              <div className="font-medium">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {displayBooking.status || 'Confirmed'}
                </span>
              </div>
            </div>
          </div>
     

{/* Tickets section in Order Details */}
<div className="border-t border-gray-200 pt-4 mb-4">
  <h3 className="font-bold text-gray-900 mb-3">Tickets</h3>
  
  <div className="space-y-3">
    {(displayBooking.tickets || []).map((ticket, index) => {
      // Problem was here - we need to properly extract the price from the ticket object
      // The ticket object structure might have the price directly or nested in ticketType
      const ticketName = ticket.ticketType?.name || ticket.name || 'Standard Ticket';
      
      // Fix: Extract the price correctly from either location
      const ticketPrice = ticket.price || ticket.ticketType?.price || 0;
      const quantity = ticket.quantity || 1;
      const total = ticketPrice * quantity;
      
      return (
        <div key={ticket.id || ticket._id || index} className="flex justify-between items-center">
          <div>
            <div className="font-medium">{ticketName}</div>
            <div className="text-sm text-gray-600">
              {quantity} × {formatCurrency(ticketPrice, displayBooking.currency)}
            </div>
          </div>
          <div className="font-medium">
            {formatCurrency(total, displayBooking.currency)}
          </div>
        </div>
      );
    })}
  </div>
</div>

{/* Total calculation in Order Details - also fixed */}
<div className="border-t border-gray-200 pt-4">
  <div className="flex justify-between items-center font-bold text-lg">
    <span>Total</span>
    <span>
      {formatCurrency(
        displayBooking.total || 
        (displayBooking.tickets || []).reduce((sum, ticket) => {
          // Fix: Extract price correctly here too
          const price = ticket.price || ticket.ticketType?.price || 0;
          const quantity = ticket.quantity || 1;
          return sum + (price * quantity);
        }, 0),
        displayBooking.currency
      )}
    </span>
  </div>
</div>
        </div>
        
        {/* Next Steps */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">What's Next?</h2>
          
          <div className="space-y-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-orange-100 text-orange-600">
                  <Mail className="h-5 w-5" />
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Check Your Email</h3>
                <p className="mt-1 text-gray-600">
                  We've sent your tickets and order confirmation to your email address.
                </p>
              </div>
            </div>
            
            <div className="flex">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-orange-100 text-orange-600">
                  <Ticket className="h-5 w-5" />
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Save Your Tickets</h3>
                <p className="mt-1 text-gray-600">
                  Download your tickets now or access them later from your account.
                </p>
              </div>
            </div>
            
            <div className="flex">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-orange-100 text-orange-600">
                  <Calendar className="h-5 w-5" />
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Add to Calendar</h3>
                <p className="mt-1 text-gray-600">
                  Don't forget to add this event to your calendar so you don't miss it.
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-8 space-x-4 flex">
            <Link 
              to="/events" 
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700"
            >
              Browse More Events
            </Link>
            
            <Link 
              to="/tickets" 
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              View My Tickets
              <ChevronRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketConfirmationPage;
