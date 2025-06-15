import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Calendar,
  Plus,
  Edit,
  Ticket,
  User,
  ArrowLeft,
  Settings,
  MoreVertical,
  ChevronRight,
  Search,
  Filter,
  RefreshCw,
  UserCheck,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import eventService from "../services/eventService";
import Sidebar from "../components/common/Navbar";

const MyEventsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // State for events
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filtering and search state
  const [filter, setFilter] = useState("upcoming");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch user's events
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await eventService.getMyEvents({
          filter: filter,
          search: searchQuery,
        });
        setEvents(response.events || response.data || []);
        setError(null);
      } catch (err) {
        console.error("Error fetching my events:", err);
        setError("Failed to load events. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [filter, searchQuery]);

  // Format date function
  const formatDate = (dateString) => {
    if (!dateString) return "";

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "";
      }

      const options = { weekday: "short", month: "short", day: "numeric" };
      return date.toLocaleDateString(undefined, options);
    } catch (error) {
      console.error("Error formatting date:", error);
      return "";
    }
  };

  // Handle search form submission
  const handleSearch = (e) => {
    e.preventDefault();
    // The useEffect will trigger a new API call with the searchQuery
  };

  // Get event status label and color
  const getEventStatus = (event) => {
    const now = new Date();
    const startDate = new Date(event.startDate || event.startDateTime);
    const endDate = new Date(event.endDate || event.endDateTime || startDate);

    if (endDate < now) {
      return { label: "Past", color: "bg-gray-500", isUpcoming: false };
    } else if (startDate > now) {
      return { label: "Upcoming", color: "bg-green-500", isUpcoming: true };
    } else {
      return { label: "In Progress", color: "bg-blue-500", isUpcoming: true };
    }
  };

  // Calculate tickets sold percentage
  const getTicketsSoldPercentage = (event) => {
    if (!event.ticketStats) return 0;

    const sold = event.ticketStats.sold || 0;
    const total = event.ticketStats.total || sold || 0;

    if (total === 0) return 0;
    return Math.round((sold / total) * 100);
  };

  // Navigate to check-in page
  const navigateToCheckIn = (eventId) => {
    navigate(`/events/${eventId}/checkin`);
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-orange-50">
      {/* Sidebar - hidden on mobile, visible on md and up */}
      <div className="hidden md:block">
        <Sidebar user={user || {}} />
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto pb-16 md:pb-0">
        <div className="max-w-7xl mx-auto p-4 md:p-6">
          {/* Page Header */}
          <div className="bg-white rounded-xl shadow-md mb-6 p-4 md:p-6 border-l-4 border-orange-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-gray-800">
                  My Events
                </h1>
                <p className="text-sm md:text-base text-gray-500">
                  Manage your created events
                </p>
              </div>

              <div className="mt-4 md:mt-0">
                <Link to="/events/create">
                  <button className="bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg px-4 py-2 inline-flex items-center">
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Event
                  </button>
                </Link>
              </div>
            </div>
          </div>

          {/* Filters & Search */}
          <div className="bg-white rounded-xl shadow-md p-4 md:p-6 mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              {/* Filter Buttons */}
              <div className="flex flex-wrap gap-2">
                <button
                  className={`px-3 py-1.5 rounded-full text-sm ${
                    filter === "upcoming"
                      ? "bg-orange-600 text-white"
                      : "bg-orange-100 text-orange-700"
                  }`}
                  onClick={() => setFilter("upcoming")}
                >
                  Upcoming
                </button>
                <button
                  className={`px-3 py-1.5 rounded-full text-sm ${
                    filter === "all"
                      ? "bg-orange-600 text-white"
                      : "bg-orange-100 text-orange-700"
                  }`}
                  onClick={() => setFilter("all")}
                >
                  All Events
                </button>
                <button
                  className={`px-3 py-1.5 rounded-full text-sm ${
                    filter === "past"
                      ? "bg-orange-600 text-white"
                      : "bg-orange-100 text-orange-700"
                  }`}
                  onClick={() => setFilter("past")}
                >
                  Past
                </button>
              </div>

              {/* Search Form */}
              <form onSubmit={handleSearch} className="flex items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search events..."
                    className="pl-10 w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <button
                  type="submit"
                  className="ml-2 px-4 py-2 bg-orange-500 text-white font-medium rounded-md hover:bg-orange-600 transition"
                >
                  Search
                </button>
              </form>
            </div>
          </div>

          {/* Events List */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            {loading ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 border-t-4 border-orange-500 border-solid rounded-full animate-spin mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading your events...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-500 mb-4">{error}</p>
                <button
                  onClick={() => setLoading(true)} // This will trigger the useEffect to reload
                  className="inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </button>
              </div>
            ) : events.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-orange-100 rounded-full mx-auto flex items-center justify-center mb-4">
                  <Calendar className="w-8 h-8 text-orange-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  No Events Found
                </h3>
                <p className="text-gray-600 mb-6">
                  You haven't created any events yet, or no events match your
                  search.
                </p>
                <Link to="/events/create">
                  <button className="inline-flex items-center px-5 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Event
                  </button>
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {events.map((event) => {
                  const status = getEventStatus(event);

                  return (
                    <div
                      key={event._id || event.id}
                      className="p-4 md:p-6 hover:bg-orange-50 transition-colors"
                    >
                      <div className="flex flex-col md:flex-row">
                        {/* Event Image */}
                        <div className="w-full md:w-40 h-32 md:h-24 flex-shrink-0 mb-4 md:mb-0 md:mr-4">
                          <img
                            src={
                              event.coverImage?.url ||
                              "/api/placeholder/320/200"
                            }
                            alt={event.title || event.name || "Event"}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        </div>

                        {/* Event Details */}
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center mb-1">
                                <h3 className="text-lg font-semibold text-gray-900">
                                  {event.title || event.name}
                                </h3>
                                <span
                                  className={`ml-2 text-xs font-medium text-white px-2 py-0.5 rounded-full ${status.color}`}
                                >
                                  {status.label}
                                </span>
                              </div>
                              <div className="flex items-center text-gray-600 text-sm mb-2">
                                <Calendar className="w-4 h-4 mr-1" />
                                <span>
                                  {formatDate(
                                    event.startDate || event.startDateTime
                                  )}
                                </span>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex space-x-2">
                              {status.isUpcoming && (
                                <button
                                  onClick={() =>
                                    navigateToCheckIn(event._id || event.id)
                                  }
                                  className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-700 rounded-md text-sm hover:bg-purple-200"
                                >
                                  <UserCheck className="w-3.5 h-3.5 mr-1" />
                                  Check-in
                                </button>
                              )}
                              <Link
                                to={`/events/${
                                  event._id || event.id
                                }/tickets/create`}
                                className="inline-flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-md text-sm hover:bg-green-200"
                              >
                                <Ticket className="w-3.5 h-3.5 mr-1" />
                                Tickets
                              </Link>

                              <Link
                                to={`/events/${event._id || event.id}/edit`}
                                className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-sm hover:bg-gray-200"
                              >
                                <Edit className="w-3.5 h-3.5 mr-1" />
                                Edit
                              </Link>

                              <button className="inline-flex items-center p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full">
                                <MoreVertical className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {/* Event Stats */}
                          <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-2">
                            <div className="bg-orange-50 p-2 rounded-md">
                              <div className="text-xs text-gray-500">
                                Attendees
                              </div>
                              <div className="text-sm font-semibold">
                                {event.attendeesCount ||
                                  event.ticketStats?.sold ||
                                  "0"}{" "}
                                {event.maxAttendees
                                  ? `/ ${event.maxAttendees}`
                                  : ""}
                              </div>
                            </div>

                            <div className="bg-orange-50 p-2 rounded-md">
                              <div className="text-xs text-gray-500">
                                Ticket Types
                              </div>
                              <div className="text-sm font-semibold">
                                {event.ticketTypesCount || "0"}
                              </div>
                            </div>

                            <div className="hidden md:block bg-orange-50 p-2 rounded-md">
                              <div className="text-xs text-gray-500">
                                Revenue
                              </div>
                              <div className="text-sm font-semibold">
                                $
                                {event.revenue ||
                                  event.ticketStats?.revenue ||
                                  "0"}
                              </div>
                            </div>
                          </div>

                          {/* View Details Link */}
                          <div className="mt-3 flex justify-end">
                            <Link
                              to={`/events/${event._id || event.id}`}
                              className="text-orange-500 hover:text-orange-700 text-sm font-medium flex items-center"
                            >
                              View Details
                              <ChevronRight className="w-4 h-4 ml-1" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyEventsPage;
