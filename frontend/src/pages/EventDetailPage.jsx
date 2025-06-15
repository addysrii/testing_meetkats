import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Tag,
  Share2,
  ChevronDown,
  ChevronUp,
  CalendarPlus,
  Ticket,
  Check,
  X,
  FileText,
  Edit,
  User,
  ChevronRight,
  ExternalLink,
  AlertTriangle,
} from "lucide-react";
import eventService from "../services/eventService";
import ticketService from "../services/ticketService";
import Sidebar from "../components/common/Navbar";
import { useAuth } from "../context/AuthContext";

// Image component with fallback
const ImageWithFallback = ({
  src,
  alt,
  className,
  fallbackClass = "bg-gray-200",
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className={`${fallbackClass} ${className}`}>
      {!hasError && src && (
        <img
          src={src}
          alt={alt}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isLoaded ? "opacity-100" : "opacity-0"
          }`}
          onError={() => {
            console.log(`Image failed to load: ${src}`);
            setHasError(true);
          }}
          onLoad={() => setIsLoaded(true)}
        />
      )}
    </div>
  );
};

const EventDetailPage = ({ user, onLogout }) => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { user: authUser } = useAuth();

  // State management
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userResponse, setUserResponse] = useState(null);
  const [ticketTypes, setTicketTypes] = useState([]);
  const [showAllDescription, setShowAllDescription] = useState(false);
  const [ticketsLoading, setTicketsLoading] = useState(false);
  const [organizer, setOrganizer] = useState(null);
  const [isHost, setIsHost] = useState(false);
  const [hasForm, setHasForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [attendees, setAttendees] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [loadingAttendees, setLoadingAttendees] = useState(false);

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "Date TBA";

    try {
      const options = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      };
      return new Date(dateString).toLocaleDateString("en-US", options);
    } catch (err) {
      console.error("Date formatting error:", err);
      return "Invalid date";
    }
  };

  // Format time for display
  const formatTime = (dateString) => {
    if (!dateString) return "Time TBA";

    try {
      const options = { hour: "2-digit", minute: "2-digit" };
      return new Date(dateString).toLocaleTimeString("en-US", options);
    } catch (err) {
      console.error("Time formatting error:", err);
      return "Invalid time";
    }
  };

  // Safely get the attendee count
  const getAttendeeCount = (attendeeCounts, type) => {
    if (!attendeeCounts) return 0;

    const count = attendeeCounts[type];

    if (typeof count === "number") {
      return count;
    }

    if (count && typeof count === "object" && count.count !== undefined) {
      return count.count;
    }

    return 0;
  };

  // Calculate time remaining until event
  const getTimeRemaining = (eventDate) => {
    if (!eventDate) return null;

    const now = new Date();
    const event = new Date(eventDate);
    const diff = event - now;

    if (diff <= 0) return null; // Event has passed

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) {
      return `${days} day${days !== 1 ? "s" : ""} remaining`;
    } else if (hours > 0) {
      return `${hours} hour${hours !== 1 ? "s" : ""} remaining`;
    } else {
      return "Starting soon";
    }
  };

  // Fetch event details
  useEffect(() => {
    const fetchEventDetails = async () => {
      setLoading(true);
      try {
        // Check if we have a valid eventId
        if (!eventId) {
          setError("Invalid event ID. Please check the URL and try again.");
          setLoading(false);
          return;
        }

        console.log("Fetching event with ID:", eventId);

        // Fetch event details from API
        const response = await eventService.getEvent(eventId);
        if (!response || !response.data) {
          throw new Error("No data received from server");
        }

        const eventData = response.data;
        setEvent(eventData);
        setUserResponse(eventData.userResponse);

        // Check if current user is the host
        if (authUser && eventData.createdBy) {
          const creatorId = eventData.createdBy._id || eventData.createdBy.id;
          const userId = authUser.id;
          const isCreator = creatorId === userId;

          const isEventHost = eventData.attendees?.some((attendee) => {
            const attendeeId = attendee.user?._id || attendee.user;
            return (
              attendeeId === userId &&
              ["host", "organizer"].includes(attendee.role)
            );
          });

          setIsHost(isCreator || isEventHost);
          setOrganizer(eventData.createdBy);
        }

        // Fetch ticket types if available
        try {
          setTicketsLoading(true);
          const ticketsResponse = await ticketService.getEventTicketTypes(
            eventId
          );
          const ticketData = ticketsResponse.data || [];
          setTicketTypes(Array.isArray(ticketData) ? ticketData : []);
        } catch (ticketError) {
          console.error("Error fetching ticket types:", ticketError);
        } finally {
          setTicketsLoading(false);
        }

        // Fetch attendees
        try {
          setLoadingAttendees(true);
          const attendeesResponse = await eventService.getEventAttendees(
            eventId
          );
          const attendeeData = attendeesResponse?.going || [];
          setAttendees(Array.isArray(attendeeData) ? attendeeData : []);
        } catch (attendeesError) {
          console.error("Error fetching attendees:", attendeesError);
        } finally {
          setLoadingAttendees(false);
        }

        // Check if event has custom form
        try {
          setFormLoading(true);
          const formResponse = await eventService.getCustomForm(eventId);
          setHasForm(!!formResponse);
        } catch (formError) {
          console.log("No custom form found for this event");
          setHasForm(false);
        } finally {
          setFormLoading(false);
        }
      } catch (err) {
        console.error("Error fetching event details:", err);
        setError(
          err.message || "Failed to load event details. Please try again later."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchEventDetails();
  }, [eventId, authUser]);

  // Handle user response to event (going, maybe, declined)
  const handleResponseClick = async (status) => {
    try {
      // Check if we have a valid eventId
      if (!eventId) {
        console.error("Cannot respond: Invalid event ID");
        alert("Cannot respond to this event. Invalid event ID.");
        return;
      }

      console.log(`Responding to event ${eventId} with status: ${status}`);

      // Call API to update response
      await eventService.respondToEvent(eventId, status);

      // Update local state
      setUserResponse(status);

      // Refresh event data to get updated attendee counts
      const response = await eventService.getEvent(eventId);
      setEvent(response.data);

      // If the user is now "going", refresh the attendees list
      if (status === "going") {
        const attendeesResponse = await eventService.getEventAttendees(eventId);
        setAttendees(attendeesResponse?.going || []);
      }
    } catch (error) {
      console.error("Failed to update response:", error);
      alert("Failed to update your response. Please try again later.");
    }
  };

  const handleAddToCalendar = async () => {
    try {
      if (!eventId) {
        console.error("Cannot add to calendar: Invalid event ID");
        alert("Cannot add this event to calendar. Invalid event ID.");
        return;
      }

      console.log("Adding event to calendar:", eventId);
      await eventService.addToCalendar(eventId);

      // Show success message
      alert("Event added to your calendar");
    } catch (error) {
      console.error("Failed to add to calendar:", error);
      alert("Failed to add event to calendar. Please try again later.");
    }
  };

  // Handle form navigation based on user role
  const handleFormNavigation = () => {
    if (isHost) {
      // If user is host/organizer, navigate to form edit/create page
      navigate(`/events/${eventId}/register-event`);
    } else {
      // If user is attendee, navigate to form submission page
      navigate(`/events/${eventId}/form`);
    }
  };

  const handleBuyTickets = () => {
    navigate(`/tickets/book/${eventId}`);
  };

  // Handle comment submission
  const handleSubmitComment = async () => {
    if (!commentText.trim()) return;

    try {
      setSubmittingComment(true);
      // API call would go here
      // await eventService.addEventComment(eventId, commentText);

      // For now just simulate a delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      setCommentText("");
      // Would refresh comments here
    } catch (error) {
      console.error("Error posting comment:", error);
      alert("Failed to post comment. Please try again.");
    } finally {
      setSubmittingComment(false);
    }
  };

  // Get going count safely
  const goingCount = event
    ? getAttendeeCount(event.attendeeCounts, "going")
    : 0;
  const maybeCount = event
    ? getAttendeeCount(event.attendeeCounts, "maybe")
    : 0;
  const timeRemaining = event ? getTimeRemaining(event.startDateTime) : null;

  return (
    <div className="flex min-h-screen bg-orange-50">
      {/* Sidebar */}
      <div className="z-20 relative">
        <Sidebar user={user || {}} onLogout={onLogout} />
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full min-h-[50vh]">
            <div className="text-center p-6 bg-white rounded-lg shadow-sm">
              <div className="w-16 h-16 border-t-4 border-orange-500 border-solid rounded-full animate-spin mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading event details...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full min-h-[50vh]">
            <div className="text-center p-8 bg-white rounded-lg shadow-sm max-w-md">
              <AlertTriangle
                size={48}
                className="mx-auto text-orange-500 mb-4"
              />
              <h2 className="text-xl font-bold text-gray-800 mb-2">
                Event Not Found
              </h2>
              <p className="text-gray-600 mb-6">{error}</p>
              <div className="flex flex-col space-y-3">
                <button
                  className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition"
                  onClick={() => window.location.reload()}
                >
                  Try Again
                </button>
                <button
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition"
                  onClick={() => navigate("/events")}
                >
                  Back to Events
                </button>
              </div>
            </div>
          </div>
        ) : !event ? (
          <div className="flex items-center justify-center h-full min-h-[50vh]">
            <div className="text-center p-8 bg-white rounded-lg shadow-sm max-w-md">
              <AlertTriangle
                size={48}
                className="mx-auto text-orange-500 mb-4"
              />
              <h2 className="text-xl font-bold text-gray-800 mb-2">
                Event Not Found
              </h2>
              <p className="text-gray-600 mb-6">
                We couldn't find the event you're looking for.
              </p>
              <button
                className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition"
                onClick={() => navigate("/events")}
              >
                Browse Events
              </button>
            </div>
          </div>
        ) : (
          <div className="container mx-auto px-4 py-6 max-w-6xl">
            {/* Navigation breadcrumb */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex space-x-2 items-center text-sm text-gray-500">
                <a href="/" className="hover:text-orange-600">
                  Home
                </a>
                <ChevronRight size={14} />
                <a href="/events" className="hover:text-orange-600">
                  Events
                </a>
                <ChevronRight size={14} />
                <span className="text-gray-700 truncate max-w-[200px]">
                  {event.name}
                </span>
              </div>

              <button
                className="flex items-center space-x-1 text-gray-600 hover:text-orange-600 transition"
                onClick={() => {
                  // Share functionality
                  if (navigator.share) {
                    navigator.share({
                      title: event.name,
                      text: event.description?.substring(0, 100) + "...",
                      url: window.location.href,
                    });
                  } else {
                    // Fallback - copy to clipboard
                    navigator.clipboard.writeText(window.location.href);
                    alert("Link copied to clipboard!");
                  }
                }}
              >
                <Share2 size={16} />
                <span>Share</span>
              </button>
            </div>

            {/* Event Card */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
              <div className="flex flex-col md:flex-row">
                {/* Left side - Image */}
                <div className="md:w-1/3 h-64 md:h-auto relative">
                  <ImageWithFallback
                    src={event.coverImage?.url}
                    alt={event.name}
                    className="w-full h-full"
                    fallbackClass="w-full h-full bg-gradient-to-r from-orange-300 to-orange-500 flex items-center justify-center"
                  />
                  {!event.coverImage?.url && (
                    <div className="absolute inset-0 flex items-center justify-center text-white">
                      <Calendar className="w-16 h-16 opacity-50" />
                    </div>
                  )}

                  {/* Event timing badge */}
                  {timeRemaining && (
                    <div className="absolute top-4 left-4 bg-orange-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                      {timeRemaining}
                    </div>
                  )}

                  {/* Category badge */}
                  <div className="absolute top-4 right-4 bg-white bg-opacity-90 px-3 py-1 rounded-full text-sm font-medium text-orange-600">
                    {event.category}
                  </div>
                </div>

                {/* Right side - Event info */}
                <div className="md:w-2/3 p-6">
                  <div className="flex justify-between items-start">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                      {event.name}
                    </h1>

                    {isHost && (
                      <button
                        onClick={() => navigate(`/events/${eventId}/edit`)}
                        className="text-gray-500 hover:text-orange-600 transition"
                      >
                        <Edit size={18} />
                      </button>
                    )}
                  </div>

                  <div
                    className={`text-gray-700 mb-4 ${
                      showAllDescription ? "" : "line-clamp-3"
                    }`}
                  >
                    {event.description || "No description provided."}
                  </div>

                  {/* Form Registration Section */}
                  {hasForm && (
                    <div className="mt-4 bg-orange-50 p-4 rounded-lg border border-orange-200">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-semibold text-gray-900">
                          Registration Required
                        </h3>
                        <button
                          onClick={handleFormNavigation}
                          className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-3 rounded text-sm transition"
                        >
                          {isHost ? "Manage Form" : "Register Now"}
                        </button>
                      </div>

                      <p className="text-sm text-gray-700">
                        {isHost
                          ? "This event has a custom registration form. You can manage submissions and modify the form."
                          : "This event requires additional registration information."}
                      </p>
                    </div>
                  )}

                  {event.description && event.description.length > 150 && (
                    <button
                      onClick={() => setShowAllDescription(!showAllDescription)}
                      className="mb-4 text-orange-600 font-medium flex items-center hover:text-orange-700 transition"
                    >
                      {showAllDescription ? (
                        <>
                          Show Less <ChevronUp className="ml-1 h-4 w-4" />
                        </>
                      ) : (
                        <>
                          Read More <ChevronDown className="ml-1 h-4 w-4" />
                        </>
                      )}
                    </button>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    {/* Venue section */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-gray-900 mb-2">
                        Venue
                      </h3>
                      <div className="flex items-start space-x-2">
                        <MapPin
                          size={18}
                          className="text-orange-600 mt-1 flex-shrink-0"
                        />
                        <div>
                          {event.virtual ? (
                            <p className="text-gray-700">Virtual Event</p>
                          ) : (
                            <>
                              <p className="text-gray-700 font-medium">
                                {event.location?.name || "To be announced"}
                              </p>
                              {event.location?.address && (
                                <p className="text-gray-600 text-sm">
                                  {event.location.address}
                                </p>
                              )}
                              {(event.location?.city ||
                                event.location?.state) && (
                                <p className="text-gray-600 text-sm">
                                  {[
                                    event.location.city,
                                    event.location.state,
                                    event.location.country,
                                  ]
                                    .filter(Boolean)
                                    .join(", ")}
                                </p>
                              )}
                            </>
                          )}
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <p className="text-gray-700 flex items-center">
                              <Calendar size={14} className="inline mr-1" />
                              {formatDate(event.startDateTime)}
                            </p>
                            <p className="text-gray-700 flex items-center">
                              <Clock size={14} className="inline mr-1" />
                              {formatTime(event.startDateTime)} -{" "}
                              {formatTime(event.endDateTime)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Organiser section */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-gray-900 mb-2">
                        Organizer
                      </h3>
                      <div className="flex items-center space-x-3">
                        {organizer?.profileImage ? (
                          <img
                            src={organizer.profileImage}
                            alt={organizer.firstName}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                            <User size={20} className="text-orange-600" />
                          </div>
                        )}
                        <div>
                          <p className="text-gray-800 font-medium">
                            {organizer
                              ? `${organizer.firstName} ${organizer.lastName}`
                              : "Event Organizer"}
                          </p>
                          {organizer?.headline && (
                            <p className="text-gray-600 text-sm truncate max-w-[180px]">
                              {organizer.headline}
                            </p>
                          )}

                          {/* Click to view profile button */}
                          {organizer && (
                            <button
                              onClick={() =>
                                navigate(
                                  `/profile/${organizer._id || organizer.id}`
                                )
                              }
                              className="mt-2 text-sm text-orange-600 hover:text-orange-700 transition flex items-center"
                            >
                              View Profile
                              <ExternalLink size={12} className="ml-1" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Tickets section */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-gray-900 mb-2">
                        {ticketsLoading ? "Loading Tickets..." : "Tickets"}
                      </h3>

                      {ticketsLoading ? (
                        <div className="flex justify-center my-2">
                          <div className="w-5 h-5 border-t-2 border-orange-500 border-solid rounded-full animate-spin"></div>
                        </div>
                      ) : ticketTypes && ticketTypes.length > 0 ? (
                        <div className="space-y-2">
                          {ticketTypes.slice(0, 2).map((ticket, index) => (
                            <div
                              key={index}
                              className="flex justify-between text-sm"
                            >
                              <span className="text-gray-700">
                                {ticket.name}
                              </span>
                              <span className="font-semibold">
                                {ticket.price > 0 ? (
                                  <span>₹ {ticket.price}</span>
                                ) : (
                                  <span className="text-green-600">Free</span>
                                )}
                              </span>
                            </div>
                          ))}

                          {ticketTypes.length > 2 && (
                            <p className="text-sm text-orange-600">
                              +{ticketTypes.length - 2} more ticket types
                            </p>
                          )}

                          <button
                            onClick={handleBuyTickets}
                            className="mt-2 w-full bg-orange-600 hover:bg-orange-700 text-white py-2 px-4 rounded text-sm font-medium transition flex items-center justify-center"
                          >
                            <Ticket size={14} className="mr-1" />
                            Book Tickets
                          </button>
                        </div>
                      ) : (
                        <div>
                          <p className="text-gray-600 text-sm">
                            No tickets available for this event.
                          </p>

                          {/* Show attendee count instead */}
                          <div className="mt-3 flex items-center">
                            <Users size={16} className="text-gray-500 mr-2" />
                            <span className="text-gray-700">
                              {goingCount} attending
                            </span>
                          </div>

                          {/* Add to calendar button */}
                          <button
                            onClick={handleAddToCalendar}
                            className="mt-3 w-full bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 px-4 rounded text-sm font-medium transition flex items-center justify-center"
                          >
                            <CalendarPlus size={14} className="mr-1" />
                            Add to Calendar
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="mt-6 flex flex-wrap gap-3">
                    {ticketTypes && ticketTypes.length > 0 && (
                      <button
                        onClick={handleBuyTickets}
                        className="bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 px-4 rounded-lg flex items-center space-x-2 transition"
                      >
                        <Ticket size={18} />
                        <span>Book tickets</span>
                      </button>
                    )}

                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleResponseClick("going")}
                        className={`flex items-center space-x-1 py-2 px-3 rounded-lg border transition ${
                          userResponse === "going"
                            ? "bg-green-100 border-green-600 text-green-700"
                            : "bg-white hover:bg-gray-100 border-gray-300 text-gray-700"
                        }`}
                      >
                        <Check
                          size={16}
                          className={
                            userResponse === "going"
                              ? "text-green-600"
                              : "text-gray-500"
                          }
                        />
                        <span>Going</span>
                      </button>

                      <button
                        onClick={() => handleResponseClick("maybe")}
                        className={`flex items-center space-x-1 py-2 px-3 rounded-lg border transition ${
                          userResponse === "maybe"
                            ? "bg-orange-100 border-orange-600 text-orange-700"
                            : "bg-white hover:bg-gray-100 border-gray-300 text-gray-700"
                        }`}
                      >
                        <Calendar
                          size={16}
                          className={
                            userResponse === "maybe"
                              ? "text-orange-600"
                              : "text-gray-500"
                          }
                        />
                        <span>Maybe</span>
                      </button>

                      <button
                        onClick={() => handleResponseClick("declined")}
                        className={`flex items-center space-x-1 py-2 px-3 rounded-lg border transition ${
                          userResponse === "declined"
                            ? "bg-red-100 border-red-600 text-red-700"
                            : "bg-white hover:bg-gray-100 border-gray-300 text-gray-700"
                        }`}
                      >
                        <X
                          size={16}
                          className={
                            userResponse === "declined"
                              ? "text-red-600"
                              : "text-gray-500"
                          }
                        />
                        <span>Can't Go</span>
                      </button>
                    </div>

                    <button
                      onClick={handleAddToCalendar}
                      className="bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 font-medium py-2 px-4 rounded-lg flex items-center space-x-2 transition"
                    >
                      <CalendarPlus size={18} />
                      <span>Add to Calendar</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* About the Event section */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                About the Event
              </h2>
              <div className="text-gray-700 whitespace-pre-line">
                {event.description || "No description provided for this event."}
              </div>
              {/* Tags */}
              {event.tags && event.tags.length > 0 && (
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <h3 className="font-medium text-gray-900 mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {event.tags.map((tag, index) => (
                      <div
                        key={index}
                        className="bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full text-sm flex items-center transition"
                      >
                        <Tag className="w-3 h-3 mr-1 text-gray-500" />
                        {tag}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Location section (only for in-person events) */}
            {!event.virtual && event.location && (
              <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Location
                </h2>

                {/* Map placeholder - would integrate with Google Maps */}
                <div className="bg-gray-100 h-64 rounded-lg mb-4 flex items-center justify-center relative overflow-hidden">
                  <iframe
                    title="Event Location"
                    className="absolute inset-0 w-full h-full border-0"
                    src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyCZIBrnTH_SdjsqTRt4KNCfFIamMP8Tckk&q=${encodeURIComponent(
                      `${event.location.name}, ${
                        event.location.address || ""
                      }, ${event.location.city || ""}`
                    )}`}
                    allowFullScreen
                  />
                </div>

                <div>
                  <h3 className="font-bold text-lg">
                    {event.location.name || "Location TBA"}
                  </h3>
                  <p className="text-gray-700">
                    {event.location.address || ""}
                    {event.location.address && <br />}
                    {event.location.city ? `${event.location.city}, ` : ""}
                    {event.location.state ? `${event.location.state} ` : ""}
                    {event.location.country || ""}
                  </p>
                </div>
              </div>
            )}

            {/* Comments/Discussion Section */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Discussion
              </h2>

              <div className="flex items-start space-x-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-orange-200 flex items-center justify-center">
                  <span className="text-orange-600 font-semibold">
                    {user?.firstName?.charAt(0) || "U"}
                  </span>
                </div>
                <div className="flex-grow">
                  <textarea
                    className="w-full border border-orange-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Ask a question or leave a comment..."
                    rows={3}
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                  ></textarea>
                  <div className="mt-2 flex justify-end">
                    <button
                      className={`${
                        submittingComment || !commentText.trim()
                          ? "bg-orange-400 cursor-not-allowed"
                          : "bg-orange-600 hover:bg-orange-700"
                      } text-white px-4 py-2 rounded-lg text-sm font-medium transition flex items-center`}
                      onClick={handleSubmitComment}
                      disabled={submittingComment || !commentText.trim()}
                    >
                      {submittingComment ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Posting...
                        </>
                      ) : (
                        "Post Comment"
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <p className="text-gray-500 text-center italic">
                  No comments yet. Be the first to start the discussion!
                </p>
              </div>
            </div>

            {/* Guests/Attendees section */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">Guests</h2>

                {goingCount > 12 && (
                  <button
                    onClick={() => navigate(`/events/${eventId}/attendees`)}
                    className="text-orange-600 hover:text-orange-700 font-medium transition"
                  >
                    See All
                  </button>
                )}
              </div>

              {loadingAttendees ? (
                <div className="flex justify-center my-6">
                  <div className="w-10 h-10 border-t-4 border-orange-500 border-solid rounded-full animate-spin"></div>
                </div>
              ) : attendees && attendees.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {attendees.slice(0, 12).map((attendee, index) => (
                    <div key={index} className="flex flex-col items-center">
                      <div className="w-16 h-16 mb-2 rounded-full overflow-hidden bg-gray-200">
                        {attendee.user?.profileImage ? (
                          <img
                            src={attendee.user.profileImage}
                            alt={attendee.user.firstName}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src =
                                "https://via.placeholder.com/150?text=?";
                            }}
                          />
                        ) : (
                          <div className="w-full h-full bg-orange-100 flex items-center justify-center">
                            <span className="text-orange-600 font-bold text-xl">
                              {attendee.user?.firstName?.charAt(0) || "?"}
                            </span>
                          </div>
                        )}
                      </div>
                      <p className="text-sm font-medium text-center">
                        {attendee.user
                          ? `${attendee.user.firstName || ""} ${
                              attendee.user.lastName || ""
                            }`.trim() || "Guest"
                          : "Guest"}
                      </p>
                      {attendee.role === "host" && (
                        <p className="text-xs text-orange-600 text-center">
                          Host
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p className="mb-2">No guests have RSVP'd yet</p>
                  <p className="text-sm">Be the first to attend this event!</p>
                </div>
              )}

              {attendees && attendees.length > 12 && (
                <div className="mt-4 text-center">
                  <button
                    onClick={() => navigate(`/events/${eventId}/attendees`)}
                    className="text-orange-600 hover:text-orange-700 font-medium transition"
                  >
                    See all {attendees.length} guests
                  </button>
                </div>
              )}

              {/* Attendee counts */}
              {(goingCount > 0 || maybeCount > 0) && (
                <div className="mt-6 pt-4 border-t border-gray-200 flex flex-wrap gap-4">
                  <div className="flex items-center text-gray-700">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-2">
                      <Check size={16} className="text-green-600" />
                    </div>
                    <span>{goingCount} going</span>
                  </div>

                  {maybeCount > 0 && (
                    <div className="flex items-center text-gray-700">
                      <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center mr-2">
                        <Calendar size={16} className="text-orange-600" />
                      </div>
                      <span>{maybeCount} interested</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Host controls - only visible to event hosts/organizers */}
            {isHost && (
              <div className="bg-white rounded-lg shadow-sm p-6 mt-8 border-l-4 border-orange-500">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Host Controls
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {/* Manage form */}
                  <div
                    onClick={() => navigate(`/events/${eventId}/form/edit`)}
                    className="bg-gray-50 hover:bg-gray-100 p-4 rounded-lg cursor-pointer transition border border-gray-200"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">Registration Form</h3>
                      <FileText size={18} className="text-orange-600" />
                    </div>
                    <p className="text-sm text-gray-600">
                      {hasForm
                        ? "Edit registration form"
                        : "Create registration form"}
                    </p>
                  </div>

                  {/* Manage tickets */}
                  <div
                    onClick={() =>
                      navigate(`/events/${eventId}/tickets/manage`)
                    }
                    className="bg-gray-50 hover:bg-gray-100 p-4 rounded-lg cursor-pointer transition border border-gray-200"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">Tickets</h3>
                      <Ticket size={18} className="text-orange-600" />
                    </div>
                    <p className="text-sm text-gray-600">
                      {ticketTypes && ticketTypes.length > 0
                        ? `Manage ${ticketTypes.length} ticket types`
                        : "Create tickets"}
                    </p>
                  </div>

                  {/* Manage attendees */}
                  <div
                    onClick={() => navigate(`/events/${eventId}/attendees`)}
                    className="bg-gray-50 hover:bg-gray-100 p-4 rounded-lg cursor-pointer transition border border-gray-200"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">Attendees</h3>
                      <Users size={18} className="text-orange-600" />
                    </div>
                    <p className="text-sm text-gray-600">
                      {goingCount > 0
                        ? `Manage ${goingCount} attendees`
                        : "No attendees yet"}
                    </p>
                  </div>

                  {/* Edit event */}
                  <div
                    onClick={() => navigate(`/events/${eventId}/edit`)}
                    className="bg-gray-50 hover:bg-gray-100 p-4 rounded-lg cursor-pointer transition border border-gray-200"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">Edit Event</h3>
                      <Edit size={18} className="text-orange-600" />
                    </div>
                    <p className="text-sm text-gray-600">
                      Update event details
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EventDetailPage;
