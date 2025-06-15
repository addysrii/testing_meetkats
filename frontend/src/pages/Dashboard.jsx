import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/common/Navbar";
import api from "../services/api";
import {
  PlusCircle,
  Check,
  Calendar,
  X,
  User,
  AlertTriangle,
  MapPin,
  Users,
  ChevronRight,
  Search,
  Filter,
  UserPlus,
  Rss,
  Home,
  ArrowUpDown,
  RefreshCw,
} from "lucide-react";
import { useToast } from "../components/common/Toast";
import defaultProfilePic from "../assets/default-avatar.png";
import eventService from "../services/eventService";
import networkService from "../services/networkService";
import nearbyUsersService from "../services/nearbyUsersService";
import LocationPermissionIcon from "../components/LocationPermissionIcon";
import Footer from "../components/footer/Footer";

const MergedDashboard = () => {
  // Auth and navigation
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const toastContext = useToast();
  const toast = toastContext?.toast;
  const [loadings, setLoadings] = useState(true);
  // State management
  const [activeSection, setActiveSection] = useState("overview");
  const [pendingRequests, setPendingRequests] = useState(0);
  const [connectionRequests, setConnectionRequests] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [events, setEvents] = useState([]);
  const [filter, setFilter] = useState("upcoming");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [categories, setCategories] = useState([
    "All",
    "Business",
    "Technology",
    "Social",
    "Education",
    "Health",
  ]);
  const [professionals, setProfessionals] = useState([]);
  const [error, setError] = useState(null);
  const [distance, setDistance] = useState(10); // Default 10km radius
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationError, setLocationError] = useState(false);
  const [viewMode, setViewMode] = useState("map"); // 'map' or 'list'
  const [selectedUser, setSelectedUser] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [unit, setUnit] = useState("km");
  const [filters, setFilters] = useState({
    industry: null,
    skills: [],
    interests: [],
    connectionStatus: "all",
    lastActive: null,
  });
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [notificationPrefs, setNotificationPrefs] = useState({
    enabled: false,
    radius: 1,
    unit: "km",
  });
  const [refreshing, setRefreshing] = useState(false);
  // Location state
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [nearbyUsers, setNearbyUsers] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const locationControlRef = useRef(null);

  // Tasks state
  const [planner, setPlanner] = useState([]);
  const [newTask, setNewTask] = useState("");

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!loading && !user) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  // Check localStorage for planner/tasks data
  useEffect(() => {
    const savedPlanner = localStorage.getItem("userPlanner");
    if (savedPlanner) {
      try {
        setPlanner(JSON.parse(savedPlanner));
      } catch (error) {
        console.error("Error parsing planner from localStorage:", error);
        setPlanner([]);
      }
    }
  }, []);

  // Fetch connection requests
  useEffect(() => {
    const fetchConnectionRequests = async () => {
      if (!user) return;

      try {
        const requests = await networkService.getConnectionRequests();
        setPendingRequests(requests.length || 0);
        setConnectionRequests(requests || []);
      } catch (error) {
        console.error("Error fetching connection requests:", error);
        setPendingRequests(0);
        setConnectionRequests([]);
      }
    };

    fetchConnectionRequests();
  }, [user]);

  // Fetch events
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const apiFilters = {
          filter: filter,
          limit: 3, // Only get a few events for the dashboard
        };

        if (categoryFilter && categoryFilter !== "All") {
          apiFilters.category = categoryFilter.toLowerCase();
        }

        if (searchQuery) {
          apiFilters.search = searchQuery;
        }

        const response = await eventService.getEvents(apiFilters);

        if (response.categories && response.categories.length > 0) {
          const extractedCategories = [
            "All",
            ...response.categories.map((cat) =>
              typeof cat === "string" ? cat : cat._id || "Other"
            ),
          ];
          setCategories(extractedCategories);
        }

        const eventsData = response.events || response.data || [];
        setEvents(eventsData);
      } catch (error) {
        console.error("Error fetching events:", error);
        setEvents([]);
      } finally {
        setLoadingData(false);
      }
    };

    fetchEvents();
  }, [filter, categoryFilter, searchQuery]);

  // Get user's location and fetch nearby users
  useEffect(() => {
    const getUserLocation = () => {
      if (navigator.geolocation) {
        const options = {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 5000,
        };

        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;

            setUserLocation({
              latitude,
              longitude,
              timestamp: new Date().toISOString(),
            });

            fetchNearbyUsers(latitude, longitude, 10);
            setLocationEnabled(true);
          },
          (error) => {
            console.error("Error getting location:", error);
            let errorMessage =
              "Location access denied. Please enable location services.";

            setLocationError(errorMessage);
            setLocationEnabled(false);
          },
          options
        );
      } else {
        setLocationError("Geolocation is not supported by your browser.");
        setLocationEnabled(false);
      }
    };

    if (user) {
      getUserLocation();
    }
  }, [user]);

  // Fetch nearby users function
  // Updated fetchNearbyUsers function
  const fetchNearbyUsers = async (latitude, longitude, distance) => {
    try {
      if (!latitude || !longitude || isNaN(latitude) || isNaN(longitude)) {
        throw new Error("Invalid coordinates provided");
      }

      const nearbyResponse = await nearbyUsersService.getNearbyUsers({
        latitude,
        longitude,
        distance,
      });

      // Extract the users array from the response
      const nearbyUsersArray = nearbyResponse.users || nearbyResponse || [];

      if (!Array.isArray(nearbyUsersArray)) {
        throw new Error("Invalid response format from server");
      }

      // Get connections to exclude them from results
      let connections = [];
      try {
        connections = await networkService.getConnections("all");
      } catch (connectionError) {
        console.error("Error fetching connections:", connectionError);
        connections = [];
      }

      // Create a Set of connection IDs for faster lookup
      const connectionIds = new Set(
        Array.isArray(connections)
          ? connections.map((conn) => conn._id || conn.id)
          : []
      );

      // Filter out users who are already connections
      const filteredUsers = nearbyUsersArray.filter(
        (user) =>
          user._id &&
          !connectionIds.has(user._id) &&
          !connectionIds.has(user.id)
      );

      // Enhance user objects with more info
      const enhancedUsers = filteredUsers.map((user) => ({
        ...user,
        distanceFormatted: formatDistance(user.distance),
      }));

      // Keep only the closest 3 users
      setNearbyUsers(enhancedUsers.slice(0, 3));
    } catch (error) {
      console.error("Error fetching nearby professionals:", error);
      setLocationError(error.message || "Failed to fetch nearby professionals");
      setNearbyUsers([]);
    }
  };

  // Task management functions
  const addTask = () => {
    if (!newTask.trim()) return;

    const task = {
      id: Date.now(),
      text: newTask,
      completed: false,
      date: new Date().toISOString(),
    };

    const updatedPlanner = [...planner, task];
    setPlanner(updatedPlanner);

    try {
      localStorage.setItem("userPlanner", JSON.stringify(updatedPlanner));
    } catch (error) {
      console.error("Error saving planner to localStorage:", error);
      if (toast) {
        toast({
          title: "Failed to save task",
          description: "Your task was added but may not persist after refresh",
          status: "warning",
          duration: 5000,
          isClosable: true,
        });
      }
    }

    setNewTask("");
  };

  const toggleTaskCompletion = (taskId) => {
    const updatedPlanner = planner.map((task) =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );
    setPlanner(updatedPlanner);

    try {
      localStorage.setItem("userPlanner", JSON.stringify(updatedPlanner));
    } catch (error) {
      console.error("Error saving planner to localStorage:", error);
    }
  };

  const deleteTask = (taskId) => {
    const updatedPlanner = planner.filter((task) => task.id !== taskId);
    setPlanner(updatedPlanner);

    try {
      localStorage.setItem("userPlanner", JSON.stringify(updatedPlanner));
    } catch (error) {
      console.error("Error saving planner to localStorage:", error);
    }
  };

  // Connection management functions
  const handleAcceptConnection = async (userId) => {
    try {
      await networkService.acceptConnection(userId);
      setPendingRequests((prev) => prev - 1);
      setConnectionRequests((prev) => prev.filter((req) => req._id !== userId));

      if (toast) {
        toast({
          title: "Connection Accepted",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error("Error accepting connection request:", error);

      if (toast) {
        toast({
          title: "Failed to accept connection",
          description: error.message || "Please try again later",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    }
  };

  const handleDeclineConnection = async (userId) => {
    try {
      await networkService.declineConnection(userId);
      setPendingRequests((prev) => prev - 1);
      setConnectionRequests((prev) => prev.filter((req) => req._id !== userId));

      if (toast) {
        toast({
          title: "Connection Request Declined",
          status: "info",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error("Error declining connection request:", error);

      if (toast) {
        toast({
          title: "Failed to decline connection",
          description: error.message || "Please try again later",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    }
  };

  // Handle connecting with a nearby user
  const handleConnect = async (userId) => {
    try {
      await networkService.requestConnection(userId);
      setNearbyUsers((prev) =>
        prev.map((user) =>
          user._id === userId ? { ...user, connectionStatus: "pending" } : user
        )
      );

      if (toast) {
        toast({
          title: "Connection Request Sent",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error("Error sending connection request:", error);

      if (toast) {
        toast({
          title: "Failed to send request",
          description: error.message || "Please try again later",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    }
  };

  // Utility functions
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

  const formatDistance = (distance) => {
    if (distance === null || distance === undefined) return "Unknown distance";

    if (distance < 0.1) {
      return `${Math.round(distance * 1000)}m away`;
    }

    if (distance < 10) {
      return `${distance.toFixed(1)}km away`;
    }

    return `${Math.round(distance)}km away`;
  };

  const getProfilePicture = (userObj) => {
    if (userObj?.profilePicture) {
      return userObj.profilePicture;
    }
    return defaultProfilePic;
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // The useEffect will trigger a new API call with the searchQuery
  };

  // Loading state for main dashboard
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-orange-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-screen bg-orange-50">
      {/* Sidebar - hidden on mobile, visible on md and up */}
      <div className="hidden md:block">
        <Sidebar user={user || {}} onLogout={logout} />
      </div>

      {/* Mobile Navbar - visible only on small screens */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white shadow-lg z-10">
        <div className="flex justify-around items-center h-16 px-2">
          <button
            onClick={() => setActiveSection("overview")}
            className={`flex flex-col items-center justify-center p-2 ${
              activeSection === "overview" ? "text-orange-500" : "text-gray-500"
            }`}
          >
            <Home className="h-6 w-6" />
            <span className="text-xs">Home</span>
          </button>
          <button
            onClick={() => setActiveSection("events")}
            className={`flex flex-col items-center justify-center p-2 ${
              activeSection === "events" ? "text-orange-500" : "text-gray-500"
            }`}
          >
            <Calendar className="h-6 w-6" />
            <span className="text-xs">Events</span>
          </button>
          <button
            onClick={() => setActiveSection("network")}
            className={`flex flex-col items-center justify-center p-2 ${
              activeSection === "network" ? "text-orange-500" : "text-gray-500"
            }`}
          >
            <Users className="h-6 w-6" />
            <span className="text-xs">Network</span>
          </button>
          <Link
            to="/profile"
            className="flex flex-col items-center justify-center p-2 text-gray-500"
          >
            <User className="h-6 w-6" />
            <span className="text-xs">Profile</span>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto pb-16 md:pb-0 md:mt-16">
        <div className="md:pl-0 pl-0 md:pt-0 pt-4">
          <main className="max-w-7xl mx-auto p-4 md:p-6">
            {/* Dashboard Header */}
            <div className="bg-white rounded-xl shadow-md mb-6 p-4 md:p-6 border-l-4 border-orange-500">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <div>
                  <div className="flex items-center mb-2">
                    <div className="h-12 w-12 md:h-14 md:w-14 rounded-lg bg-gradient-to-r from-orange-500 to-orange-400 mr-4 flex items-center justify-center text-white font-bold text-xl">
                      {new Date().getDate()}
                    </div>
                    <div>
                      <h1 className="text-xl md:text-2xl font-bold text-gray-800">
                        Hello, {user?.firstName || "User"}!
                      </h1>
                      <p className="text-sm md:text-base text-gray-500">
                        {new Date().toLocaleDateString("en-US", {
                          weekday: "long",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 md:mt-0 w-full md:w-auto">
                  <div className="flex flex-wrap gap-2">
                    <Link to={`/connections`}>
                      <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-md text-sm font-medium">
                        {pendingRequests} connection requests
                      </span>
                    </Link>
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-md text-sm font-medium">
                      {planner.filter((task) => !task.completed).length} pending
                      tasks
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Tabs Navigation - Scrollable on mobile */}
            <div className="mb-6 bg-white rounded-xl shadow-md overflow-hidden border-b">
              <div className="flex overflow-x-auto scrollbar-hide">
                <button
                  onClick={() => setActiveSection("overview")}
                  className={`flex-none text-center py-4 px-4 font-medium text-sm focus:outline-none transition-colors duration-200 ${
                    activeSection === "overview"
                      ? "text-orange-600 border-b-2 border-orange-500"
                      : "text-gray-500 hover:text-orange-500"
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveSection("events")}
                  className={`flex-none text-center py-4 px-4 font-medium text-sm focus:outline-none transition-colors duration-200 ${
                    activeSection === "events"
                      ? "text-orange-600 border-b-2 border-orange-500"
                      : "text-gray-500 hover:text-orange-500"
                  }`}
                >
                  Events
                </button>
                <button
                  onClick={() => setActiveSection("network")}
                  className={`flex-none text-center py-4 px-4 font-medium text-sm focus:outline-none transition-colors duration-200 ${
                    activeSection === "network"
                      ? "text-orange-600 border-b-2 border-orange-500"
                      : "text-gray-500 hover:text-orange-500"
                  }`}
                >
                  Network
                </button>
              </div>
            </div>

            {/* Dashboard Content - Based on active section */}
            {activeSection === "overview" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Task Planner */}
                <div className="lg:col-span-1">
                  <div className="bg-white rounded-xl shadow-md overflow-hidden h-full">
                    <div className="border-b border-gray-200 px-4 md:px-6 py-4 flex justify-between items-center">
                      <h3 className="font-semibold text-gray-800">
                        My Planner
                      </h3>
                      <div className="text-orange-500 hover:text-orange-600 text-sm cursor-pointer">
                        <Calendar className="h-4 w-4 md:h-5 md:w-5" />
                      </div>
                    </div>
                    <div className="p-4 md:p-6">
                      {/* Add new task */}
                      <div className="flex mb-4">
                        <input
                          type="text"
                          value={newTask}
                          onChange={(e) => setNewTask(e.target.value)}
                          placeholder="Add a new task..."
                          className="flex-1 border border-gray-300 rounded-l-md py-2 px-3 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                          onKeyPress={(e) => e.key === "Enter" && addTask()}
                        />
                        <button
                          onClick={addTask}
                          className="bg-orange-500 text-white rounded-r-md px-3 md:px-4 py-2 text-xs md:text-sm hover:bg-orange-600 transition"
                        >
                          <PlusCircle className="h-4 w-4 md:h-5 md:w-5" />
                        </button>
                      </div>

                      {/* Task list */}
                      <div className="space-y-2 max-h-60 md:max-h-72 overflow-y-auto">
                        {planner.length === 0 ? (
                          <div className="text-center py-4 md:py-6">
                            <p className="text-gray-500 text-xs md:text-sm">
                              No tasks yet. Add your first task above.
                            </p>
                          </div>
                        ) : (
                          planner.map((task) => (
                            <div
                              key={task.id}
                              className={`flex items-center justify-between p-2 md:p-3 border rounded-md ${
                                task.completed
                                  ? "bg-green-50 border-green-200"
                                  : "bg-white border-gray-200"
                              }`}
                            >
                              <div className="flex items-center flex-1 min-w-0">
                                <button
                                  onClick={() => toggleTaskCompletion(task.id)}
                                  className={`flex-shrink-0 h-4 w-4 md:h-5 md:w-5 rounded-full border ${
                                    task.completed
                                      ? "bg-green-500 border-green-500"
                                      : "border-gray-300"
                                  } mr-2 md:mr-3 flex items-center justify-center`}
                                >
                                  {task.completed && (
                                    <Check className="h-2 w-2 md:h-3 md:w-3 text-white" />
                                  )}
                                </button>
                                <div className="flex-1 min-w-0">
                                  <p
                                    className={`text-xs md:text-sm truncate ${
                                      task.completed
                                        ? "line-through text-gray-500"
                                        : "text-gray-800"
                                    }`}
                                  >
                                    {task.text}
                                  </p>
                                  <p className="text-xs text-gray-500 truncate">
                                    Added {formatDate(task.date)}
                                  </p>
                                </div>
                              </div>
                              <button
                                onClick={() => deleteTask(task.id)}
                                className="ml-2 text-gray-400 hover:text-red-500 flex-shrink-0"
                              >
                                <X className="h-3 w-3 md:h-4 md:w-4" />
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Center and Right Columns - Events Preview and Nearby Users */}
                <div className="lg:col-span-2">
                  <div className="grid grid-cols-1 gap-6">
                    {/* Upcoming Events Preview */}
                    <div className="bg-white rounded-xl shadow-md overflow-hidden">
                      <div className="border-b border-gray-200 px-4 md:px-6 py-4 flex justify-between items-center">
                        <h3 className="font-semibold text-gray-800">
                          Upcoming Events
                        </h3>
                        <div className="flex items-center space-x-2">
                          <Link
                            to="/events/create"
                            className="text-white bg-orange-500 hover:bg-orange-600 rounded-md px-2 py-1 text-xs flex items-center"
                          >
                            <PlusCircle className="h-3 w-3 mr-1" />
                            Host Event
                          </Link>
                          <Link
                            to="/my-events"
                            className="text-white bg-orange-500 hover:bg-orange-600 rounded-md px-2 py-1 text-xs flex items-center"
                          >
                            My Events
                          </Link>
                          <Link
                            to="/tickets"
                            className="text-white bg-orange-500 hover:bg-orange-600 rounded-md px-2 py-1 text-xs flex items-center"
                          >
                            My Tickets
                          </Link>
                          <Link
                            to="/events"
                            className="text-orange-500 hover:text-orange-600 text-xs md:text-sm"
                          >
                            View All
                          </Link>
                        </div>
                      </div>
                      <div className="p-4 md:p-6">
                        {events.length > 0 ? (
                          <div className="space-y-4">
                            {events.slice(0, 2).map((event) => (
                              <div
                                key={event._id || event.id}
                                className="flex border border-gray-100 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                              >
                                <div className="w-24 md:w-32 bg-orange-100 flex-shrink-0">
                                  <img
                                    src={
                                      event.coverImage?.url ||
                                      "/api/placeholder/400/200"
                                    }
                                    alt={event.name || "Event"}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className="p-3 md:p-4 flex-1">
                                  <h4 className="font-semibold text-sm md:text-base text-gray-900 mb-1">
                                    {event.name || "Untitled Event"}
                                  </h4>
                                  <div className="flex items-center text-gray-600 mb-1">
                                    <Calendar className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                                    <span className="text-xs md:text-sm">
                                      {formatDate(event.startDateTime)}
                                    </span>
                                  </div>
                                  <div className="flex items-center text-gray-600 mb-2">
                                    <MapPin className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                                    <span className="text-xs md:text-sm">
                                      {event.virtual
                                        ? "Virtual Event"
                                        : event.location?.name ||
                                          "Location TBA"}
                                    </span>
                                  </div>
                                  <Link
                                    to={`/events/${event._id || event.id}`}
                                    className="text-orange-500 hover:text-orange-700 text-xs md:text-sm font-medium"
                                  >
                                    View Details
                                  </Link>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-6">
                            <p className="text-gray-500 text-sm">
                              No upcoming events found.
                            </p>
                            <Link
                              to="/events"
                              className="text-orange-500 hover:text-orange-600 text-sm font-medium mt-2 inline-block"
                            >
                              Browse All Events →
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Nearby Professionals */}
                    <div className="bg-white rounded-xl shadow-md overflow-hidden">
                      <div className="border-b border-gray-200 px-4 md:px-6 py-4 flex justify-between items-center">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 md:h-5 md:w-5 text-orange-500 mr-2" />
                          <h3 className="font-semibold text-gray-800">
                            Nearby Professionals
                          </h3>
                        </div>
                        <Link
                          to="/network/nearby"
                          className="text-orange-500 hover:text-orange-600 text-xs md:text-sm"
                        >
                          View All
                        </Link>
                      </div>
                      <div className="p-4 md:p-6">
                        {locationError ? (
                          <div className="bg-orange-50 rounded-lg p-4 text-center">
                            <AlertTriangle className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                            <p className="text-sm text-gray-700 mb-2">
                              {locationError}
                            </p>
                            <LocationPermissionIcon />
                          </div>
                        ) : nearbyUsers.length > 0 ? (
                          <div className="space-y-4">
                            {nearbyUsers.map((user) => (
                              <div
                                key={user._id}
                                className="flex items-start border border-gray-100 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow"
                              >
                                <div className="mr-3 flex-shrink-0">
                                  <div className="h-10 w-10 md:h-12 md:w-12 rounded-lg overflow-hidden">
                                    <img
                                      src={getProfilePicture(user)}
                                      alt={`${user.firstName} ${user.lastName}`}
                                      className="h-full w-full object-cover"
                                    />
                                  </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex justify-between">
                                    <h4 className="text-sm md:text-base font-medium text-gray-900 truncate">
                                      {user.firstName} {user.lastName}
                                    </h4>
                                    <span className="text-xs text-gray-500 flex items-center">
                                      <MapPin className="h-3 w-3 mr-1" />
                                      {user.distanceFormatted}
                                    </span>
                                  </div>
                                  <p className="text-xs text-gray-600">
                                    {user.headline || "Professional"}
                                  </p>

                                  <div className="mt-2 flex space-x-2">
                                    <button
                                      onClick={() => handleConnect(user._id)}
                                      disabled={
                                        user.connectionStatus === "pending" ||
                                        user.connectionStatus === "connected"
                                      }
                                      className={`flex items-center px-2 py-1 rounded text-xs ${
                                        user.connectionStatus === "pending"
                                          ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                                          : user.connectionStatus ===
                                            "connected"
                                          ? "bg-green-100 text-green-700 cursor-not-allowed"
                                          : "bg-orange-100 text-orange-700 hover:bg-orange-200"
                                      }`}
                                    >
                                      <UserPlus className="h-3 w-3 mr-1" />
                                      {user.connectionStatus === "pending"
                                        ? "Pending"
                                        : user.connectionStatus === "connected"
                                        ? "Connected"
                                        : "Connect"}
                                    </button>

                                    <Link
                                      to={`/profile/${user._id}`}
                                      className="flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-700 hover:bg-gray-200"
                                    >
                                      View Profile
                                    </Link>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-6">
                            <p className="text-gray-500 text-sm">
                              No nearby professionals found.
                            </p>
                            <button
                              onClick={() =>
                                fetchNearbyUsers(
                                  userLocation?.latitude,
                                  userLocation?.longitude,
                                  10
                                )
                              }
                              className="mt-2 inline-flex items-center justify-center px-3 py-1.5 text-xs bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                            >
                              <RefreshCw className="w-3 h-3 mr-1" />
                              Refresh Location
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === "events" && (
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="p-4 md:p-6">
                  <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                      <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-2">
                        Upcoming Events
                      </h2>
                      <p className="text-sm text-gray-500">
                        Discover events that match your interests
                      </p>
                    </div>
                    <Link to="/events/create" className="mt-3 md:mt-0">
                      <button className="w-full md:w-auto bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg px-4 py-2 flex items-center justify-center transition-colors">
                        <PlusCircle className="w-4 h-4 mr-2" />
                        Host an Event
                      </button>
                    </Link>
                  </div>

                  <div className="mb-6">
                    {/* Search Bar */}
                    <form
                      onSubmit={handleSearch}
                      className="flex items-center mb-4"
                    >
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
                        className="ml-2 px-4 py-2 bg-orange-600 text-white font-medium rounded-md hover:bg-orange-500 transition"
                      >
                        Search
                      </button>
                    </form>

                    {/* Filters */}
                    <div className="flex flex-wrap gap-3 mb-4">
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

                      <div className="relative ml-auto">
                        <select
                          className="appearance-none bg-white border border-gray-300 rounded-md pl-3 pr-10 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                          value={categoryFilter}
                          onChange={(e) => setCategoryFilter(e.target.value)}
                        >
                          <option value="">Category</option>
                          {categories.map((category, index) => (
                            <option key={`category-${index}`} value={category}>
                              {category}
                            </option>
                          ))}
                        </select>
                        <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  {/* Events Grid */}
                  {loadingData ? (
                    <div className="text-center py-10">
                      <div className="w-12 h-12 border-t-4 border-orange-500 border-solid rounded-full animate-spin mx-auto"></div>
                      <p className="mt-4 text-gray-600">Loading events...</p>
                    </div>
                  ) : events.length === 0 ? (
                    <div className="text-center py-10">
                      <p className="text-gray-600">
                        No events found matching your criteria.
                      </p>
                      {(searchQuery || categoryFilter !== "All") && (
                        <button
                          className="mt-4 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md"
                          onClick={() => {
                            setSearchQuery("");
                            setCategoryFilter("All");
                          }}
                        >
                          Clear Filters
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {events.map((event) => (
                        <div
                          key={event._id || event.id}
                          className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-100"
                        >
                          <div className="relative">
                            <img
                              src={
                                event.coverImage?.url ||
                                "/api/placeholder/400/200"
                              }
                              alt={event.name || "Event"}
                              className="w-full h-48 object-cover"
                            />
                            {event.category && (
                              <span className="absolute top-4 right-4 bg-orange-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                                {typeof event.category === "string"
                                  ? event.category
                                  : "Other"}
                              </span>
                            )}
                          </div>

                          <div className="p-5">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                              {event.name || "Untitled Event"}
                            </h3>

                            <div className="flex items-center text-gray-600 mb-2">
                              <Calendar className="w-4 h-4 mr-2" />
                              <span className="text-sm">
                                {formatDate(event.startDateTime)}
                              </span>
                            </div>

                            <div className="flex items-center text-gray-600 mb-4">
                              <MapPin className="w-4 h-4 mr-2" />
                              <span className="text-sm">
                                {event.virtual
                                  ? "Virtual Event"
                                  : event.location?.name || "Location TBA"}
                              </span>
                            </div>

                            <div className="flex justify-end">
                              <Link to={`/events/${event._id || event.id}`}>
                                <button className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-300">
                                  View Details
                                </button>
                              </Link>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-6 text-center">
                    <Link
                      to="/events"
                      className="inline-block text-orange-600 font-medium hover:underline"
                    >
                      View All Events →
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {activeSection === "network" && (
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="p-4 md:p-6">
                  <div className="mb-6">
                    <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-2">
                      Your Network
                    </h2>
                    <p className="text-sm text-gray-500">
                      Connect with professionals in your field
                    </p>
                  </div>

                  {/* Connection requests and nearby professionals */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                    <div className="bg-orange-50 rounded-xl p-4 md:p-6">
                      <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-4">
                        Connection Requests
                      </h3>
                      {pendingRequests > 0 ? (
                        <div className="space-y-3 md:space-y-4">
                          {connectionRequests.slice(0, 3).map((request) => (
                            <div
                              key={request._id}
                              className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white p-3 rounded-lg shadow-sm"
                            >
                              <div className="flex items-center mb-2 sm:mb-0">
                                <div className="h-10 w-10 md:h-12 md:w-12 rounded-lg overflow-hidden bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-xl mr-3">
                                  <img
                                    src={getProfilePicture(request)}
                                    alt={`${request?.firstName || "User"} ${
                                      request?.lastName || ""
                                    }`}
                                    className="h-full w-full object-cover"
                                  />
                                </div>
                                <div>
                                  <h4 className="font-medium text-sm md:text-base">
                                    {request?.firstName || "User"}{" "}
                                    {request?.lastName || ""}
                                  </h4>
                                  <p className="text-xs md:text-sm text-gray-500">
                                    {request?.headline || "Professional"}
                                  </p>
                                </div>
                              </div>
                              <div className="flex space-x-2">
                                <button
                                  onClick={() =>
                                    handleAcceptConnection(request._id)
                                  }
                                  className="bg-orange-500 text-white px-2 md:px-3 py-1 rounded-md text-xs md:text-sm hover:bg-orange-600"
                                >
                                  Accept
                                </button>
                                <button
                                  onClick={() =>
                                    handleDeclineConnection(request._id)
                                  }
                                  className="bg-gray-200 text-gray-700 px-2 md:px-3 py-1 rounded-md text-xs md:text-sm hover:bg-gray-300"
                                >
                                  Ignore
                                </button>
                              </div>
                            </div>
                          ))}
                          {connectionRequests.length > 3 && (
                            <Link
                              to="/network"
                              className="block w-full text-center text-orange-500 font-medium mt-4 text-sm hover:underline"
                            >
                              View All Requests ({connectionRequests.length}) →
                            </Link>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-6 bg-white rounded-lg shadow-sm">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-12 w-12 mx-auto text-orange-300 mb-3"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                            />
                          </svg>
                          <p className="text-gray-500 mb-2">
                            No pending connection requests
                          </p>
                          <Link
                            to="/network/discover"
                            className="text-orange-500 text-sm font-medium hover:underline"
                          >
                            Discover new connections →
                          </Link>
                        </div>
                      )}
                    </div>

                    {/* Nearby Professionals Card */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6">
                      {/* Header */}
                      <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 md:h-5 md:w-5 text-orange-500 mr-2" />
                          <h3 className="text-base md:text-lg font-semibold text-gray-800">
                            Nearby Professionals
                          </h3>
                        </div>
                        <Link
                          to="/network/nearby"
                          className="text-xs md:text-sm text-orange-500 hover:text-orange-600 flex items-center"
                        >
                          See All{" "}
                          <ChevronRight className="h-3 w-3 md:h-4 md:w-4 ml-1" />
                        </Link>
                      </div>

                      {/* User Cards */}
                      {locationError ? (
                        <div className="bg-orange-50 rounded-xl p-4 text-center">
                          <div className="flex flex-col items-center justify-center">
                            <AlertTriangle className="h-10 w-10 text-orange-500 mb-2" />
                            <h3 className="text-lg font-semibold text-gray-800 mb-1">
                              Location Error
                            </h3>
                            <p className="text-sm text-gray-600 mb-3">
                              {locationError}
                            </p>
                            <button
                              onClick={() =>
                                fetchNearbyUsers(
                                  userLocation?.latitude,
                                  userLocation?.longitude,
                                  10
                                )
                              }
                              className="inline-flex items-center px-3 py-1.5 bg-orange-500 text-white rounded-md text-sm hover:bg-orange-600 transition-colors"
                            >
                              <RefreshCw className="h-4 w-4 mr-1" />
                              Try Again
                            </button>
                          </div>
                        </div>
                      ) : nearbyUsers.length > 0 ? (
                        <div className="space-y-4">
                          {nearbyUsers.map((user) => (
                            <div
                              key={user._id}
                              className="flex items-start p-3 md:p-4 border border-gray-100 rounded-lg shadow-sm hover:shadow-md transition-shadow bg-white"
                            >
                              {/* User image */}
                              <div className="mr-3 md:mr-4">
                                <div className="h-12 w-12 md:h-14 md:w-14 rounded-lg overflow-hidden bg-orange-100">
                                  <img
                                    src={getProfilePicture(user)}
                                    alt={`${user.firstName} ${user.lastName}`}
                                    className="h-full w-full object-cover"
                                  />
                                </div>
                              </div>

                              {/* User details */}
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                                  <div>
                                    <h3 className="text-base md:text-lg font-medium text-gray-900 truncate">
                                      {user.firstName} {user.lastName}
                                    </h3>
                                    <p className="text-xs md:text-sm text-gray-600 truncate">
                                      {user.headline || "Professional"}
                                    </p>
                                  </div>

                                  {user.distance !== undefined && (
                                    <span className="mt-1 md:mt-0 text-xs text-gray-500 flex items-center md:ml-2">
                                      <MapPin className="h-3 w-3 mr-1" />
                                      {user.distanceFormatted ||
                                        formatDistance(user.distance)}
                                    </span>
                                  )}
                                </div>

                                {/* Industry and skills */}
                                {user.industry && (
                                  <div className="mt-1 text-xs text-gray-600">
                                    <span className="font-medium">
                                      Industry:
                                    </span>{" "}
                                    {user.industry}
                                  </div>
                                )}

                                {/* Action buttons */}
                                <div className="mt-3 flex space-x-2">
                                  <button
                                    onClick={() => handleConnect(user._id)}
                                    disabled={
                                      user.connectionStatus === "pending" ||
                                      user.connectionStatus === "connected"
                                    }
                                    className={`flex items-center px-2 py-1 rounded text-xs md:text-sm ${
                                      user.connectionStatus === "pending"
                                        ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                                        : user.connectionStatus === "connected"
                                        ? "bg-green-100 text-green-700 cursor-not-allowed"
                                        : "bg-orange-100 text-orange-700 hover:bg-orange-200"
                                    }`}
                                  >
                                    <UserPlus className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                                    {user.connectionStatus === "pending"
                                      ? "Pending"
                                      : user.connectionStatus === "connected"
                                      ? "Connected"
                                      : "Connect"}
                                  </button>

                                  <Link
                                    to={`/profile/${user._id}`}
                                    className="flex items-center px-2 py-1 rounded text-xs md:text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 ml-auto"
                                  >
                                    View Profile
                                  </Link>
                                </div>
                              </div>
                            </div>
                          ))}

                          <Link
                            to="/network/nearby"
                            className="block w-full text-center text-orange-500 font-medium mt-2 text-sm hover:underline"
                          >
                            View All Nearby Professionals →
                          </Link>
                        </div>
                      ) : (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8 text-center">
                          <div className="inline-flex h-16 w-16 rounded-full bg-orange-100 items-center justify-center mb-4">
                            <MapPin className="h-8 w-8 text-orange-600" />
                          </div>
                          <h3 className="text-xl font-semibold text-gray-800 mb-2">
                            No Nearby Professionals
                          </h3>
                          <p className="text-sm text-gray-600 mb-4">
                            {userLocation
                              ? "We couldn't find any professionals near your current location."
                              : "Please enable location services to see professionals near you."}
                          </p>
                          <div className="flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-3">
                            <button
                              onClick={() =>
                                fetchNearbyUsers(
                                  userLocation?.latitude,
                                  userLocation?.longitude,
                                  10
                                )
                              }
                              className="inline-flex items-center justify-center px-4 py-2 text-sm bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                            >
                              <RefreshCw className="w-4 h-4 mr-1" />
                              Refresh Location
                            </button>
                            <Link
                              to="/network/nearby"
                              className="inline-flex items-center justify-center px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                            >
                              Explore Network
                            </Link>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </main>

          {/*FOOTER */}
          {/* <footer className="bg-gradient-to-r from-orange-600 to-orange-700 text-white py-3 md:py-4 mt-6">
  <div className="max-w-7xl mx-auto px-4 text-center">
    <p className="text-xs md:text-sm">
      © 2025 MeetKats •{" "}
      <a
        href="/privacypolicy"
        className="hover:underline hover:text-orange-300 transition"
      >
        Privacy Policy
      </a>{" "}
      •{" "}
      <a
        href="/termsandconditions"
        className="hover:underline hover:text-orange-300 transition"
      >
        Terms of Service
      </a>
    </p>
  </div>
</footer> */}
        </div>
      </div>
    </div>
  );
};

export default MergedDashboard;
