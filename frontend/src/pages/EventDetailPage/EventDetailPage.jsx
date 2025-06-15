"use client";

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Share2Icon,
  MapPin,
  ExternalLink,
  Calendar,
  Users,
  Tag,
  ChevronDown,
  ChevronUp,
  Ticket,
  FileText,
  Edit,
  AlertTriangle,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Textarea } from "../../components/ui/textarea";
import { FooterBlock } from "../BhoomiLandingPage/sections/FooterBlock";
import { format } from "date-fns";
import { AddToCalendarButton } from "add-to-calendar-button-react";
import { useAuth } from "../../context/AuthContext";
import eventService from "../../services/eventService";
import ticketService from "../../services/ticketService";
import Sidebar from "../../components/common/Navbar";

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
          src={src || "/placeholder.svg"}
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

export const EventDetailPage = ({ user, onLogout }) => {
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
  const [sortOrder, setSortOrder] = useState("newest");
  const [comments, setComments] = useState([
    {
      id: 1,
      name: "Uday Pandey",
      comment: "This looks amazing! Can't wait to attend.",
      timestamp: new Date("2024-01-20T10:00:00"),
      replies: [
        {
          id: 2,
          name: "Naman Kushwaha",
          comment: "Me too! See you there!",
          timestamp: new Date("2024-01-20T11:30:00"),
        },
      ],
    },
  ]);

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
  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      setSubmittingComment(true);
      // API call would go here
      // await eventService.addEventComment(eventId, commentText);

      // For now just simulate a delay and add to local state
      await new Promise((resolve) => setTimeout(resolve, 500));

      const newComment = {
        id: comments.length + 1,
        name: authUser?.firstName + " " + authUser?.lastName || "Anonymous",
        comment: commentText,
        timestamp: new Date(),
        replies: [],
      };

      setComments([newComment, ...comments]);
      setCommentText("");
    } catch (error) {
      console.error("Error posting comment:", error);
      alert("Failed to post comment. Please try again.");
    } finally {
      setSubmittingComment(false);
    }
  };

  // Handle share functionality
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: event?.name || "Event",
        text:
          event?.description?.substring(0, 100) + "..." ||
          "Check out this event!",
        url: window.location.href,
      });
    } else {
      // Fallback - copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  // Get going count safely
  const goingCount = event
    ? getAttendeeCount(event.attendeeCounts, "going")
    : 0;
  const maybeCount = event
    ? getAttendeeCount(event.attendeeCounts, "maybe")
    : 0;
  const declinedCount = event
    ? getAttendeeCount(event.attendeeCounts, "declined")
    : 0;
  const timeRemaining = event ? getTimeRemaining(event.startDateTime) : null;

  const responseButtons = [
    { id: "going", label: "Going", count: goingCount, color: "#22c55e" },
    { id: "maybe", label: "Maybe", count: maybeCount, color: "#eab308" },
    {
      id: "declined",
      label: "Can't Go",
      count: declinedCount,
      color: "#ef4444",
    },
  ];

  const venue = event?.location
    ? {
        name: event.location.name || "Venue TBA",
        address: event.location.address || "Address TBA",
        coordinates: event.location.coordinates || "26.5123°N, 80.2329°E",
      }
    : {
        name: "Venue TBA",
        address: "Address TBA",
        coordinates: "26.5123°N, 80.2329°E",
      };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center p-6 bg-white rounded-lg shadow-sm">
          <div className="w-16 h-16 border-t-4 border-green-500 border-solid rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading event details...</p>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center p-8 bg-white rounded-lg shadow-sm max-w-md">
          <AlertTriangle size={48} className="mx-auto text-green-500 mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            Event Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            {error || "We couldn't find the event you're looking for."}
          </p>
          <div className="flex flex-col space-y-3">
            <button
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
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
    );
  }

  return (
    <div className="bg-white flex flex-row justify-center w-full">
      {/* Sidebar */}
      <div className="z-20 relative">
        <Sidebar user={user} onLogout={onLogout} />
      </div>
      <div className="bg-white w-full max-w-[1440px] relative mt-20">
        {/* Hero Section */}
        <div className="w-full relative">
          {/* Background with blur effect */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${
                event.coverImage?.url ||
                "https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg"
              })`,
              filter: "blur(8px)",
              transform: "scale(1.1)",
              zIndex: 0,
            }}
          />

          {/* Content overlay */}
          <div className="relative z-10 bg-white/80 backdrop-blur-sm">
            <div className="container mx-auto px-4 py-8 md:py-11">
              <div className="flex flex-col md:flex-row gap-8">
                {/* Event Image */}
                <div className="w-full md:w-[261px] h-[392px] rounded-lg shadow-lg flex-shrink-0 overflow-hidden">
                  <ImageWithFallback
                    src={event.coverImage?.url || "/placeholder.svg"}
                    alt={event.name}
                    className="w-full h-full"
                    fallbackClass="w-full h-full bg-gradient-to-r from-green-300 to-green-500 flex items-center justify-center"
                  />
                  {!event.coverImage?.url && (
                    <div className="absolute inset-0 flex items-center justify-center text-white">
                      <Calendar className="w-16 h-16 opacity-50" />
                    </div>
                  )}
                </div>

                {/* Event Details */}
                <div className="flex flex-col max-w-full md:max-w-[441px]">
                  <div className="flex items-start justify-between">
                    <h1 className="font-['Roboto',Helvetica] font-bold text-black text-3xl md:text-4xl mb-4 md:mb-6">
                      {event.name}
                    </h1>
                    <Button
                      variant="outline"
                      className="bg-white/80 backdrop-blur-sm rounded-[10px] border-black/30 flex items-center gap-2 hover:bg-white/90 transition-colors"
                      onClick={handleShare}
                    >
                      <Share2Icon className="w-5 h-5" />
                      <span className="font-['Roboto',Helvetica] text-sm">
                        Share
                      </span>
                    </Button>
                  </div>

                  <div
                    className={`font-['Roboto',Helvetica] font-normal text-black text-base text-justify mb-4 ${
                      showAllDescription ? "" : "line-clamp-6"
                    }`}
                  >
                    {event.description ||
                      "No description provided for this event."}
                  </div>

                  {event.description && event.description.length > 150 && (
                    <button
                      onClick={() => setShowAllDescription(!showAllDescription)}
                      className="cursor-pointer mb-4 text-green-600 font-medium flex items-center hover:text-green-700 transition self-start"
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

                  {/* Form Registration Section */}
                  {hasForm && (
                    <div className="mt-4 bg-green-50 p-4 rounded-lg border border-green-200 mb-6">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-semibold text-gray-900">
                          Registration Required
                        </h3>
                        <button
                          onClick={handleFormNavigation}
                          className="cursor-pointer bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-3 rounded text-sm transition"
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

                  <div className="mt-6">
                    <AddToCalendarButton
                      name={event.name}
                      description={
                        event.description || "Join us for this exciting event!"
                      }
                      startDate={
                        event.startDateTime
                          ? format(new Date(event.startDateTime), "yyyy-MM-dd")
                          : "2024-02-20"
                      }
                      startTime={
                        event.startDateTime
                          ? format(new Date(event.startDateTime), "HH:mm")
                          : "09:00"
                      }
                      endDate={
                        event.endDateTime
                          ? format(new Date(event.endDateTime), "yyyy-MM-dd")
                          : "2024-02-20"
                      }
                      endTime={
                        event.endDateTime
                          ? format(new Date(event.endDateTime), "HH:mm")
                          : "19:00"
                      }
                      timeZone="America/New_York"
                      location={venue.address}
                      options={["Google", "Apple", "Microsoft365", "iCal"]}
                      buttonStyle="3d"
                    />
                  </div>

                  <div className="flex gap-4 mt-6">
                    {responseButtons.map((button) => (
                      <button
                        key={button.id}
                        className={`px-6 py-3 rounded-lg border-2 transition-all flex items-center gap-2 text-sm font-semibold ${
                          userResponse === button.id
                            ? "text-white"
                            : "text-black hover:bg-gray-50"
                        }`}
                        style={{
                          backgroundColor:
                            userResponse === button.id
                              ? button.color
                              : "transparent",
                          borderColor: button.color,
                          color:
                            userResponse === button.id
                              ? "#ffffff"
                              : button.color,
                        }}
                        onClick={() => handleResponseClick(button.id)}
                      >
                        {button.label}
                        <span
                          className="px-2 py-1 rounded-full text-xs"
                          style={{
                            backgroundColor:
                              userResponse === button.id
                                ? "rgba(255,255,255,0.2)"
                                : button.color,
                            color: "#ffffff",
                          }}
                        >
                          {button.count}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Event Info Cards */}
                <div className="flex flex-col gap-8 w-full md:w-auto md:ml-auto">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-x-16 md:gap-y-8">
                    <div className="text-center md:text-left">
                      <h3 className="font-['Roboto',Helvetica] font-semibold text-black text-xl md:text-2xl mb-2">
                        Venue
                      </h3>
                      <p className="font-['Roboto',Helvetica] font-light text-black text-base max-w-[203px] mx-auto md:mx-0">
                        {venue.name}
                        <br />
                        {event.virtual
                          ? "Virtual Event"
                          : "In-Person Event"}{" "}
                        <br />
                        {formatTime(event.startDateTime)} -{" "}
                        {formatTime(event.endDateTime)}
                      </p>
                    </div>

                    <div className="text-center md:text-left">
                      <h3 className="font-['Roboto',Helvetica] font-semibold text-black text-xl md:text-2xl mb-2">
                        Organiser
                      </h3>
                      <p className="font-['Roboto',Helvetica] font-light text-black text-base max-w-[203px] mx-auto md:mx-0">
                        {organizer
                          ? `${organizer.firstName} ${organizer.lastName}`
                          : "Event Organizer"}
                        <br />
                        {organizer?.headline && (
                          <>
                            {organizer.headline}
                            <br />
                          </>
                        )}
                      </p>
                      {organizer && (
                        <button
                          onClick={() =>
                            navigate(
                              `/profile/${organizer._id || organizer.id}`
                            )
                          }
                          className="cursor-pointer inline-block px-4 py-2 mt-2 text-sm font-medium text-white bg-green-600 rounded hover:bg-green-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2"
                        >
                          View Profile
                        </button>
                      )}
                    </div>

                    <div className="text-center md:text-left">
                      <h3 className="font-['Roboto',Helvetica] font-semibold text-black text-xl md:text-2xl mb-2">
                        Tickets
                      </h3>
                      <p className="font-['Roboto',Helvetica] font-light text-black text-base max-w-[203px] mx-auto md:mx-0">
                        {ticketsLoading
                          ? "Loading..."
                          : ticketTypes && ticketTypes.length > 0
                          ? `${ticketTypes.length} ticket type${
                              ticketTypes.length > 1 ? "s" : ""
                            } available`
                          : "Free Event"}
                      </p>
                      {ticketTypes && ticketTypes.length > 0 && (
                        <button
                          onClick={handleBuyTickets}
                          className="cursor-pointer inline-block px-4 py-2 mt-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
                        >
                          Book Tickets
                        </button>
                      )}
                    </div>

                    <div className="text-center md:text-left">
                      <h3 className="font-['Roboto',Helvetica] font-semibold text-black text-xl md:text-2xl mb-2">
                        Attendees
                      </h3>
                      <p className="font-['Roboto',Helvetica] font-light text-black text-base max-w-[203px] mx-auto md:mx-0">
                        {goingCount} attending
                        {maybeCount > 0 && (
                          <>
                            <br />
                            {maybeCount} interested
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* About Section */}
        <div className="container mx-auto px-4 md:px-10 mt-12">
          <h2 className="font-['Roboto',Helvetica] font-bold text-black text-2xl mb-4">
            About the Event
          </h2>
          <div className="font-['Roboto',Helvetica] font-normal text-black text-base mb-8 whitespace-pre-line">
            {event.description || "No description provided for this event."}
          </div>

          {/* Tags */}
          {event.tags && event.tags.length > 0 && (
            <div className="mb-8">
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

          {/* Location Section */}
          {!event.virtual && (
            <div className="mb-12">
              <h2 className="font-['Roboto',Helvetica] font-bold text-black text-2xl mb-4">
                Location
              </h2>
              <div className="bg-gray-50 p-6 rounded-lg mb-4">
                <div className="flex items-start gap-2 mb-4">
                  <MapPin className="w-5 h-5 mt-1 text-textblue" />
                  <div>
                    <h3 className="font-['Roboto',Helvetica] font-semibold text-lg mb-1">
                      {venue.name}
                    </h3>
                    <p className="text-gray-600">{venue.address}</p>
                    {event.location?.city && (
                      <p className="text-gray-600">
                        {[
                          event.location.city,
                          event.location.state,
                          event.location.country,
                        ]
                          .filter(Boolean)
                          .join(", ")}
                      </p>
                    )}
                  </div>
                </div>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    venue.address
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-textblue hover:text-textblue/80 transition-colors"
                >
                  <span className="mr-2">Get Directions</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
              <div className="w-full h-[400px] rounded-lg overflow-hidden">
                <iframe
                  src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyCZIBrnTH_SdjsqTRt4KNCfFIamMP8Tckk&q=${encodeURIComponent(
                    venue.address
                  )}`}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>
          )}

          {/* Guests Section */}
          <h2 className="font-['Roboto',Helvetica] font-bold text-black text-2xl mb-4">
            Guests
          </h2>

          {loadingAttendees ? (
            <div className="flex justify-center my-6">
              <div className="w-10 h-10 border-t-4 border-green-500 border-solid rounded-full animate-spin"></div>
            </div>
          ) : attendees && attendees.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-12">
              {attendees.slice(0, 8).map((attendee, index) => (
                <Card key={index} className="border-none shadow-none">
                  <CardContent className="p-0 flex flex-col items-center">
                    <div className="w-[120px] h-[120px] mb-2 rounded-lg overflow-hidden bg-gray-200">
                      {attendee.user?.profileImage ? (
                        <img
                          className="w-full h-full object-cover"
                          alt={attendee.user.firstName}
                          src={attendee.user.profileImage || "/placeholder.svg"}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src =
                              "https://via.placeholder.com/150?text=?";
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-green-100 flex items-center justify-center">
                          <span className="text-green-600 font-bold text-xl">
                            {attendee.user?.firstName?.charAt(0) || "?"}
                          </span>
                        </div>
                      )}
                    </div>
                    <p className="font-['Roboto',Helvetica] font-normal text-black text-base text-center">
                      {attendee.user
                        ? `${attendee.user.firstName || ""} ${
                            attendee.user.lastName || ""
                          }`.trim() || "Guest"
                        : "Guest"}
                    </p>
                    <p className="font-['Roboto',Helvetica] font-extralight text-black text-xs text-center">
                      {attendee.role === "host" ? "Host" : "Attendee"}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 mb-12">
              <p className="mb-2">No guests have RSVP'd yet</p>
              <p className="text-sm">Be the first to attend this event!</p>
            </div>
          )}

          {attendees && attendees.length > 8 && (
            <div className="text-center mb-12">
              <button
                onClick={() => navigate(`/events/${eventId}/attendees`)}
                className="text-textblue hover:text-textblue/80 font-medium transition underline"
              >
                See all {attendees.length} guests
              </button>
            </div>
          )}

          {/* Discussion Section */}
          <div className="mb-12">
            <h2 className="font-['Roboto',Helvetica] font-bold text-black text-2xl mb-4">
              Discussion
            </h2>

            {/* Comment Form */}
            <div className="bg-gray-50 p-6 rounded-lg mb-8">
              <h3 className="text-lg font-semibold mb-4">Leave a comment</h3>
              <form onSubmit={handleSubmitComment} className="space-y-4">
                <Textarea
                  placeholder="Write your comment here..."
                  className="min-h-[100px] bg-white"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                />
                <Button
                  type="submit"
                  className="bg-textblue hover:bg-textblue/90"
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
                </Button>
              </form>
            </div>

            {/* Comments List */}
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Comments</h3>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="bg-white border rounded-md px-3 py-1"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                </select>
              </div>

              {comments.length > 0 ? (
                comments
                  .sort((a, b) =>
                    sortOrder === "newest"
                      ? b.timestamp.getTime() - a.timestamp.getTime()
                      : a.timestamp.getTime() - b.timestamp.getTime()
                  )
                  .map((comment) => (
                    <div
                      key={comment.id}
                      className="bg-white p-6 rounded-lg shadow-sm"
                    >
                      <div className="flex justify-between mb-2">
                        <h4 className="font-semibold">{comment.name}</h4>
                        <span className="text-sm text-gray-500">
                          {format(comment.timestamp, "MMM d, yyyy 'at' h:mm a")}
                        </span>
                      </div>
                      <p className="text-gray-700 mb-4">{comment.comment}</p>

                      {/* Replies */}
                      {comment.replies && comment.replies.length > 0 && (
                        <div className="ml-8 mt-4 space-y-4">
                          {comment.replies.map((reply) => (
                            <div
                              key={reply.id}
                              className="bg-gray-50 p-4 rounded-lg"
                            >
                              <div className="flex justify-between mb-2">
                                <h4 className="font-semibold">{reply.name}</h4>
                                <span className="text-sm text-gray-500">
                                  {format(
                                    reply.timestamp,
                                    "MMM d, yyyy 'at' h:mm a"
                                  )}
                                </span>
                              </div>
                              <p className="text-gray-700">{reply.comment}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      <Button variant="outline" className="mt-4">
                        Reply
                      </Button>
                    </div>
                  ))
              ) : (
                <p className="text-gray-500 text-center italic">
                  No comments yet. Be the first to start the discussion!
                </p>
              )}
            </div>
          </div>

          {/* Host controls - only visible to event hosts/organizers */}
          {isHost && (
            <div className="bg-white rounded-lg shadow-sm p-6 mt-8 border-l-4 border-green-500">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Host Controls
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {/* Manage form */}
                <div
                  onClick={handleFormNavigation}
                  className="bg-gray-50 hover:bg-gray-100 p-4 rounded-lg cursor-pointer transition border border-gray-200"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">Registration Form</h3>
                    <FileText size={18} className="text-green-600" />
                  </div>
                  <p className="text-sm text-gray-600">
                    {hasForm
                      ? "Edit registration form"
                      : "Create registration form"}
                  </p>
                </div>

                {/* Manage tickets */}
                <div
                  onClick={() => navigate(`/events/${eventId}/tickets/manage`)}
                  className="bg-gray-50 hover:bg-gray-100 p-4 rounded-lg cursor-pointer transition border border-gray-200"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">Tickets</h3>
                    <Ticket size={18} className="text-green-600" />
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
                    <Users size={18} className="text-green-600" />
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
                    <Edit size={18} className="text-green-600" />
                  </div>
                  <p className="text-sm text-gray-600">Update event details</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <FooterBlock />
      </div>
    </div>
  );
};
