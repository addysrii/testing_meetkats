import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Sidebar from "../../components/common/Navbar";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  Calendar,
  X,
  MapPin,
  Users,
  ChevronRight,
  Search,
  ChevronLeft,
} from "lucide-react";
import { useToast } from "../../components/common/Toast";
import defaultProfilePic from "../../assets/default-avatar.png";
import eventService from "../../services/eventService";
import networkService from "../../services/networkService";
import PropTypes from "prop-types";

const CarouselCard = ({ event }) => {
  const truncateDescription = (text, maxLength = 80) => {
    if (!text) return "Join us for an amazing experience";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + "...";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Date TBA";
    try {
      const options = { weekday: "long", month: "long", day: "numeric" };
      return new Date(dateString).toLocaleDateString("en-US", options);
    } catch {
      return "Date TBA";
    }
  };

  return (
    <div className="relative min-w-full h-80 rounded-2xl overflow-hidden shadow-lg">
      <img
        src={event.coverImage?.url || "/api/placeholder/800/320"}
        alt={event.name || "Featured Event"}
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
      <div className="absolute bottom-6 left-6 right-6 text-white">
        <div className="flex items-center space-x-2 mb-2">
          <Calendar className="w-4 h-4" />
          <span className="text-sm font-medium">
            {formatDate(event.startDateTime)}
          </span>
        </div>
        <h2 className="text-2xl font-bold mb-2 line-clamp-2">
          {event.name || "Featured Event"}
        </h2>
        <p className="text-sm opacity-90 mb-4 line-clamp-2">
          {truncateDescription(event.description)}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <MapPin className="w-4 h-4" />
              <span className="text-sm">
                {event.virtual
                  ? "Virtual"
                  : event.location?.name || "Location TBA"}
              </span>
            </div>
            {event.attendeeCounts?.going > 0 && (
              <div className="flex items-center space-x-1">
                <Users className="w-4 h-4" />
                <span className="text-sm">
                  {event.attendeeCounts.going} attending
                </span>
              </div>
            )}
          </div>
          <Link to={`/events/${event._id || event.id}`}>
            <button className="bg-white text-black px-6 py-2 rounded-full font-semibold hover:bg-gray-100 transition-colors cursor-pointer">
              View Event
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

CarouselCard.propTypes = {
  event: PropTypes.shape({
    id: PropTypes.string,
    _id: PropTypes.string,
    name: PropTypes.string,
    coverImage: PropTypes.shape({
      url: PropTypes.string,
    }),
    startDateTime: PropTypes.string,
    location: PropTypes.shape({
      name: PropTypes.string,
    }),
    virtual: PropTypes.bool,
    attendeeCounts: PropTypes.shape({
      going: PropTypes.number,
    }),
    description: PropTypes.string,
  }).isRequired,
};

const MergedDashboard = () => {
  // 1. Add the hardcoded events array at the top of the file (after imports):
  const dashboardHardcodedEvents = [
    {
      id: "zuorapromptathon2025",
      name: "Zuora Prompt-A-Thon 2025: The 10x Catalyst",
      coverImage: { url: "/zuora.webp" },
      startDateTime: "2025-07-02T00:01:00+05:30",
      location: { name: "In Person (India)" },
      virtual: false,
      attendeeCounts: { going: 0 },
      description:
        "Welcome to the Zuora Prompt-A-Thon 2025: The 10x Catalyst—an experience designed for professionals who are ready to think differently, experiment boldly, and explore the true potential of generative AI.",
    },
    {
      id: "spaceappsnoida2025",
      name: "Space Apps Challenge Noida 2025",
      coverImage: { url: "/space.webp" },
      startDateTime: "2025-07-01T16:55:00+05:30",
      location: { name: "Noida" },
      virtual: false,
      attendeeCounts: { going: 0 },
      description:
        "Registration for the 2025 NASA Space Apps Challenge opens July 17! The main event page will be opening on the 17th of July.",
    },
    {
      id: "tvsepic7it2025",
      name: "TVS Credit E.P.I.C 7.0 — IT Challenge",
      coverImage: { url: "/tvs.png" },
      startDateTime: "2025-07-09T00:00:00+05:30",
      location: { name: "Online" },
      virtual: true,
      attendeeCounts: { going: 0 },
      description:
        "TVS Credit presents E.P.I.C (Enrich, Perform, Innovate, Challenge) a campus challenge programme designed for college students.",
    },
    {
      id: "vignettefilm2025",
      name: "Vignette | The Film-Making Competition",
      coverImage: { url: "/film.png" },
      startDateTime: "2025-07-14T00:00:00+05:30",
      location: { name: "IIM INDORE, Indore, Madhya Pradesh, India" },
      virtual: false,
      attendeeCounts: { going: 0 },
      description:
        "Vignette is the canvas for your cinematic vision — the official filmmaking event of Atharv Ranbhoomi 2025.",
    },
    {
      id: "timecapsule2025",
      name: "Time Capsule",
      coverImage: { url: "/time.png" },
      startDateTime: "2025-07-16T00:00:00+05:30",
      location: { name: "Online" },
      virtual: true,
      attendeeCounts: { going: 0 },
      description:
        "A Photography Contest by Petrichor '26, the annual techno-cultural fest of IIT Palakkad!",
    },
    {
      id: "48hourmusic2025",
      name: "48 Hour Music Challenge",
      coverImage: { url: "/srm.jpg" },
      startDateTime: "2025-07-21T00:00:00+05:30",
      location: { name: "Online" },
      virtual: true,
      attendeeCounts: { going: 0 },
      description:
        "MAGAN, the Official Music Club of SRM IST Delhi NCR presents The 48-Hour Music Challenge...",
    },
  ];

  // Filter hackathon and non-hackathon events
  const hackathonEvents = dashboardHardcodedEvents.filter(
    (e) =>
      (e.category && e.category.toLowerCase() === "hackathon") ||
      e.name.toLowerCase().includes("hackathon")
  );
  const nonHackathonEvents = dashboardHardcodedEvents.filter(
    (e) =>
      !(e.category && e.category.toLowerCase() === "hackathon") &&
      !e.name.toLowerCase().includes("hackathon")
  );
  // Only show up to 3 hackathons in the carousel
  const hackathonCarouselEvents = hackathonEvents.slice(0, 3);

  // All hooks must be called before any early return
  const [hackathonSlide, setHackathonSlide] = useState(0);
  const nextHackathonSlide = () =>
    setHackathonSlide(
      (prev) => (prev + 1) % Math.max(1, hackathonCarouselEvents.length)
    );
  const prevHackathonSlide = () =>
    setHackathonSlide(
      (prev) =>
        (prev - 1 + Math.max(1, hackathonCarouselEvents.length)) %
        Math.max(1, hackathonCarouselEvents.length)
    );
  useEffect(() => {
    if (hackathonCarouselEvents.length > 1) {
      const interval = setInterval(() => {
        setHackathonSlide(
          (prev) => (prev + 1) % hackathonCarouselEvents.length
        );
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [hackathonCarouselEvents.length]);

  // Auth and navigation
  const { user, loading, logout, token } = useAuth();
  const navigate = useNavigate();
  const toastContext = useToast();
  const toast = toastContext?.toast;
  // const [loadings, setLoadings] = useState(true); // removed unused

  // State management
  // const [activeSection, setActiveSection] = useState("overview"); // removed unused
  const [pendingRequests, setPendingRequests] = useState(0);
  const [connectionRequests, setConnectionRequests] = useState([]);
  // const [loadingData, setLoadingData] = useState(true); // removed unused
  const [events, setEvents] = useState([]);
  // const [filter, setFilter] = useState("upcoming"); // removed unused
  // const [searchQuery, setSearchQuery] = useState(""); // removed unused
  // const [categoryFilter, setCategoryFilter] = useState("All"); // removed unused
  // const [categories, setCategories] = useState([ // removed unused
  //   "All",
  //   "Business",
  //   "Technology",
  //   "Social",
  //   "Education",
  //   "Health",
  // ]);
  // const [professionals, setProfessionals] = useState([]); // removed unused
  // const [error, setError] = useState(null); // removed unused
  // const [refreshing, setRefreshing] = useState(false); // removed unused
  // const [locationEnabled, setLocationEnabled] = useState(false); // removed unused
  // const [nearbyUsers, setNearbyUsers] = useState([]); // removed unused
  // const [userLocation, setUserLocation] = useState(null); // removed unused
  // const [loadingNearbyUsers, setLoadingNearbyUsers] = useState(false); // removed unused
  // const locationControlRef = useRef(null); // removed unused
  // const [currentSlide, setCurrentSlide] = useState(0); // removed unused
  // const [sidebarOpen, setSidebarOpen] = useState(false); // removed unused

  const [selectedDate, setSelectedDate] = useState(new Date());

  // Modal states
  const [showConnectionRequests, setShowConnectionRequests] = useState(false);
  const [showYourEvents, setShowYourEvents] = useState(false);

  // Sidebar state
  // const [sidebarOpen, setSidebarOpen] = useState(false); // removed unused

  useEffect(() => {
    console.log("Token on Dashboard load:", token);
    console.log("User on Dashboard load:", user);
  }, [token]);

  useEffect(() => {
    if (!loading && !user && !token) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  // Check localStorage for planner/tasks data
  useEffect(() => {
    // Removed all planner/tasks related code
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
          filter: "upcoming", // Default filter
          limit: 3,
        };

        const response = await eventService.getEvents(apiFilters);

        // Removed unused categories extraction

        const eventsData = response.events || response.data || [];
        setEvents(eventsData);
      } catch (error) {
        console.error("Error fetching events:", error);
        setEvents([]);
      } finally {
        // setLoadingData(false); // Removed unused
      }
    };

    fetchEvents();
  }, []); // No dependencies since filters are not used

  // Remove the useEffect and function for getUserLocation and fetchNearbyUsers, as all related state and UI have been removed

  // Task management functions
  // Removed all code that references planner, setPlanner, addTask, and newTask

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
  // const handleConnect = async (userId) => { // Removed unused
  //   try {
  //     setNearbyUsers((prev) =>
  //       prev.map((user) =>
  //         user._id === userId || user.id === userId
  //           ? { ...user, connectionStatus: "loading" }
  //           : user
  //       )
  //     );

  //     const response = await networkService.requestConnection({
  //       requestId: userId,
  //       message: "",
  //     });

  //     if (response && response._id) {
  //       setNearbyUsers((prev) =>
  //         prev.map((user) =>
  //           user._id === userId || user.id === userId
  //             ? {
  //                 ...user,
  //                 connectionStatus: "pending",
  //                 requestId: response._id,
  //               }
  //             : user
  //         )
  //       );

  //       if (toast) {
  //         toast({
  //           title: "Connection Request Sent",
  //           description: "The user will be notified of your request",
  //           status: "success",
  //           duration: 3000,
  //           isClosable: true,
  //         });
  //       }
  //     } else {
  //       throw new Error("Failed to get request ID from server");
  //     }
  //   } catch (error) {
  //     console.error("Error sending connection request:", error);

  //     setNearbyUsers((prev) =>
  //       prev.map((user) =>
  //         user._id === userId || user.id === userId
  //           ? { ...user, connectionStatus: null }
  //           : user
  //       )
  //     );

  //     if (toast) {
  //       toast({
  //         title: "Failed to Send Connection Request",
  //         description: error.message || "Please try again later",
  //         status: "error",
  //         duration: 5000,
  //         isClosable: true,
  //       });
  //     }
  //   }
  // };

  // Utility functions
  const getProfilePicture = (userObj) => {
    if (userObj?.profilePicture) {
      return userObj.profilePicture;
    }
    return defaultProfilePic;
  };

  // const handleSearch = (e) => { // Removed unused
  //   e.preventDefault();
  // };

  // const nextSlide = () => { // Removed unused
  //   setCurrentSlide((prev) => (prev + 1) % Math.max(1, events.length));
  // };

  // const prevSlide = () => { // Removed unused
  //   setCurrentSlide(
  //     (prev) =>
  //       (prev - 1 + Math.max(1, events.length)) % Math.max(1, events.length)
  //   );
  // };

  // useEffect(() => { // Removed unused
  //   if (events.length > 1) {
  //     const interval = setInterval(nextSlide, 5000);
  //     return () => clearInterval(interval);
  //   }
  // }, [events.length]);

  // Handle event click
  const handleEventClick = (eventId) => {
    navigate(`/events/${eventId}`);
  };

  // Loading state for main dashboard
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-orange-50 overflow-x-hidden">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-orange-50 overflow-x-hidden">
      {/* Navbar at the top */}
      <Sidebar user={user || {}} onLogout={logout} />
      <div className="flex flex-col lg:flex-row gap-4 mt-20 max-w-full md:max-w-[1400px] mx-auto px-2 sm:px-4">
        {/* Main content */}
        <div className="w-full lg:w-[65%] min-w-0">
          <div className="bg-white rounded-lg shadow-md p-4 h-auto mb-4 flex flex-col justify-between min-h-[110px]">
            <div className="flex flex-col h-full justify-between">
              <div className="flex justify-end">
                <div className="flex gap-2 sm:gap-3 flex-wrap">
                  {/* <button
                    onClick={() => (window.location.href = "/connections")}
                    className="w-auto min-w-[150px] h-[32px] bg-[#DE7373]/50 text-white rounded-full text-xs sm:text-sm font-medium flex items-center justify-center hover:bg-[#DE7373]/60 transition-colors px-3 sm:px-6"
                  >
                    <span className="font-normal items-center cursor-pointer text-black">
                      Connection Requests ({pendingRequests})
                    </span>
                  </button>
                  <button
                    onClick={() => setShowYourEvents(true)}
                    className="w-auto min-w-[120px] h-[32px] bg-[#9ABE80]/50 text-white rounded-full text-xs sm:text-sm font-medium flex items-center justify-center hover:bg-[#9ABE80]/60 transition-colors px-3 sm:px-6"
                  >
                    <span className="font-normal items-center cursor-pointer text-black">
                      Your Events
                    </span>
                  </button> */}
                </div>
              </div>
              <div>
                <h2 className="font-light text-2xl sm:text-3xl text-gray-700">
                  WELCOME BACK 👋🏻
                </h2>
              </div>
            </div>
          </div>

          {/* Events Carousel */}
          {/* Removed the API-driven events carousel as per user request */}

          {/* Connection Requests Modal */}
          {showConnectionRequests && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-0">
              <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md mx-auto">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold">Connection Requests</h3>
                  <button
                    onClick={() => setShowConnectionRequests(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <div className="max-h-[60vh] overflow-y-auto">
                  {connectionRequests.length === 0 ? (
                    <p className="text-center text-gray-500 py-4">
                      No pending connection requests
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {connectionRequests.map((request) => (
                        <div
                          key={request._id}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center space-x-3">
                            <img
                              src={getProfilePicture(request.sender)}
                              alt={request.sender?.name || "User"}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                            <div>
                              <p className="font-medium">
                                {request.sender?.name || "User"}
                              </p>
                              <p className="text-sm text-gray-500">
                                {request.sender?.title || "Professional"}
                              </p>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() =>
                                handleAcceptConnection(request._id)
                              }
                              className="px-3 py-1 bg-orange-500 text-white rounded-full text-sm hover:bg-orange-600"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() =>
                                handleDeclineConnection(request._id)
                              }
                              className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm hover:bg-gray-300"
                            >
                              Decline
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Your Events Modal */}
          {showYourEvents && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-0">
              <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-2xl mx-auto">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold">Your Events</h3>
                  <button
                    onClick={() => setShowYourEvents(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <div className="max-h-[60vh] overflow-y-auto">
                  {events.length === 0 ? (
                    <p className="text-center text-gray-500 py-4">
                      No upcoming events
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {events.map((event) => (
                        <div
                          key={event._id}
                          onClick={() => handleEventClick(event._id)}
                          className="p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-start space-x-4">
                            <div className="flex-shrink-0 w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                              <Calendar className="w-6 h-6 text-orange-600" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium text-lg">
                                {event.name}
                              </h4>
                              <p className="text-sm text-gray-600 mt-1">
                                {new Date(
                                  event.startDateTime
                                ).toLocaleDateString("en-US", {
                                  weekday: "short",
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </p>
                              <div className="flex items-center gap-2 mt-2">
                                <MapPin className="w-4 h-4 text-gray-500" />
                                <p className="text-sm text-gray-500">
                                  {event.virtual
                                    ? "Virtual Event"
                                    : event.location?.name || "Location TBA"}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Nearby Professionals Section */}
          {/*
          <div className="w-full">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-2 sm:gap-0">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
                  Nearby Professionals
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                  Connect with professionals in your area
                </p>
              </div>
              <button
                onClick={() =>
                  fetchNearbyUsers(
                    userLocation?.latitude,
                    userLocation?.longitude,
                    10
                  )
                }
                className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-orange-50 text-orange-600 rounded-full hover:bg-orange-100 transition-colors text-xs sm:text-sm"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="font-medium">Refresh</span>
              </button>
            </div>
            <div className="flex gap-4 sm:gap-6 overflow-x-auto pb-6">
              {loadingNearbyUsers ? (
                <div className="w-full flex justify-center items-center min-h-[300px]">
                  <Loader />
                </div>
              ) : nearbyUsers.length > 0 ? (
                nearbyUsers.map((user) => (
                  <div
                    key={user._id || user.id}
                    className="flex-none w-[280px] bg-white rounded-2xl shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
                  >
                    <div className="relative h-40">
                      <img
                        src={user.profilePicture}
                        alt={user.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = defaultProfilePic;
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <h3 className="text-white text-lg font-semibold truncate">
                          {user.name}
                        </h3>
                        {user.title && (
                          <p className="text-white/90 text-sm truncate">
                            {user.title}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="p-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                        <MapPin className="w-4 h-4 text-orange-500" />
                        <span className="font-medium">
                          {user.distanceFormatted}
                        </span>
                      </div>

                      {user.company && (
                        <div className="flex items-center gap-2 mb-4">
                          <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center">
                            <svg
                              className="w-4 h-4 text-orange-500"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                              />
                            </svg>
                          </div>
                          <p className="text-sm text-gray-600 truncate">
                            {user.company}
                          </p>
                        </div>
                      )}

                      <button
                        onClick={() => handleConnect(user._id || user.id)}
                        disabled={user.connectionStatus === "pending"}
                        className={`w-full py-2.5 rounded-xl text-sm font-medium transition-all duration-300 cursor-pointer ${
                          user.connectionStatus === "pending"
                            ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                            : "bg-orange-500 text-white hover:bg-orange-600 hover:shadow-md"
                        }`}
                      >
                        {user.connectionStatus === "pending"
                          ? "Request Sent"
                          : "Connect"}
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="w-full text-center py-12 bg-white rounded-2xl shadow-lg">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center">
                        <Users className="w-6 h-6 text-gray-400" />
                      </div>
                      <p className="text-gray-600">
                        No nearby professionals found
                      </p>
                      <p className="text-sm text-gray-500">
                        Try refreshing or adjusting your location settings
                      </p>
                  </div>
                    </div>
                  )}
                </div>
          </div>
          */}
          {/* Hackathon Carousel */}
          <div className="bg-white rounded-lg shadow-md p-4 mb-8">
            <h2 className="text-xl font-bold mb-4">Featured Hackathons</h2>
            <div className="w-full h-[220px] sm:h-[315px] relative mb-4">
              <div className="overflow-hidden rounded-2xl sm:rounded-3xl shadow-xl h-full">
                <div
                  className="flex transition-transform duration-500 ease-in-out h-full"
                  style={{ transform: `translateX(-${hackathonSlide * 100}%)` }}
                >
                  {(hackathonCarouselEvents.length > 0
                    ? hackathonCarouselEvents
                    : dashboardHardcodedEvents.slice(0, 3)
                  ).map((event, index) => (
                    <div
                      key={event.id}
                      onClick={() => handleEventClick(event.id)}
                      className="cursor-pointer min-w-full"
                    >
                      <CarouselCard event={event} />
                    </div>
                  ))}
                </div>
              </div>
              {(hackathonCarouselEvents.length > 1 ||
                dashboardHardcodedEvents.length > 1) && (
                  <>
                    <button
                      onClick={prevHackathonSlide}
                      className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 sm:p-3 shadow-lg transition-all hover:scale-110 cursor-pointer"
                    >
                      <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
                    </button>
                    <button
                      onClick={nextHackathonSlide}
                      className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 sm:p-3 shadow-lg transition-all hover:scale-110 cursor-pointer"
                    >
                      <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
                    </button>
                    <div className="absolute bottom-2 sm:bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-1 sm:space-x-2">
                      {(hackathonCarouselEvents.length > 0
                        ? hackathonCarouselEvents
                        : dashboardHardcodedEvents.slice(0, 3)
                      ).map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setHackathonSlide(index)}
                          className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all cursor-pointer ${hackathonSlide === index
                              ? "bg-white scale-125"
                              : "bg-white/50 hover:bg-white/75"
                            }`}
                        />
                      ))}
                    </div>
                  </>
                )}
            </div>
            {/* Non-hackathon events as cards below carousel */}
            {nonHackathonEvents.length > 0 && (
              <>
                <h2 className="text-lg font-semibold mb-3">
                  Other Featured Events
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                  {nonHackathonEvents.map((event) => (
                    <div
                      key={event.id}
                      onClick={() => handleEventClick(event.id)}
                      className="bg-gray-50 rounded-xl shadow hover:shadow-md transition cursor-pointer p-4 flex flex-col"
                    >
                      <img
                        src={
                          event.coverImage?.url || "/api/placeholder/400/200"
                        }
                        alt={event.name}
                        className="w-full h-32 object-cover rounded-lg mb-3"
                      />
                      <h3 className="font-bold text-base mb-1 truncate">
                        {event.name}
                      </h3>
                      <p className="text-xs text-gray-600 mb-2 truncate">
                        {event.location?.name || "Location TBA"}
                      </p>
                      <p className="text-xs text-gray-500 line-clamp-2 mb-2">
                        {event.description}
                      </p>
                      <span className="text-xs text-gray-400 mt-auto">
                        {new Date(event.startDateTime).toLocaleDateString(
                          "en-US",
                          { month: "short", day: "numeric" }
                        )}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-end">
                  <Link
                    to="/events"
                    className="text-blue-600 hover:underline font-medium text-sm cursor-pointer"
                  >
                    View All Events
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right sidebar - hide on mobile */}
        <div className="hidden lg:block w-full lg:w-[35%] h-auto lg:h-[798px] min-w-0">
          <div className="bg-white rounded-2xl shadow-lg p-3 sm:p-5 h-[1180px] flex flex-col">
            {/* Upcoming Events Section */}
            <div className="flex-1">
              <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-gray-800">
                Upcoming Events
              </h2>
              <div className="space-y-2 sm:space-y-3">
                {events
                  .filter(
                    (event) => new Date(event.startDateTime) >= new Date()
                  )
                  .slice(0, 3)
                  .map((event) => (
                    <div
                      key={event._id}
                      onClick={() => handleEventClick(event._id)}
                      className="p-3 sm:p-4 bg-orange-50 rounded-xl border border-orange-100 hover:border-orange-300 transition duration-200 cursor-pointer hover:bg-orange-100"
                    >
                      <div className="flex items-start gap-3 sm:gap-4">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                          <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                            {event.name}
                          </p>
                          <p className="text-[10px] sm:text-xs text-gray-600 mt-1">
                            {new Date(event.startDateTime).toLocaleDateString(
                              "en-US",
                              {
                                weekday: "short",
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </p>
                          <div className="flex items-center gap-1 sm:gap-2 mt-2">
                            <MapPin className="w-3 h-3 text-gray-500" />
                            <p className="text-[10px] sm:text-xs text-gray-500 truncate">
                              {event.virtual
                                ? "Virtual Event"
                                : event.location?.name || "Location TBA"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>

              {/* Featured New Events Section */}
              <div className="mt-6 mb-2">
                <div className="space-y-3">
                  {[
                    {
                      id: "accenturestrategyconnect4",
                      name: "Accenture Strategy Connect Season 4",
                      coverImage: { url: "/accenture.webp" },
                      startDateTime: "2025-08-01T17:00:00+05:30",
                      location: { name: "Online" },
                    },
                    {
                      id: "lorealsustainability2025",
                      name: "L'Oréal Sustainability Challenge 2025",
                      coverImage: { url: "/loreal.webp" },
                      startDateTime: "2025-08-10T23:59:00+05:30",
                      location: { name: "Online" },
                    },
                    {
                      id: "grabhack2025",
                      name: "GrabHack: Campus Edition",
                      coverImage: { url: "/grab.webp" },
                      startDateTime: "2025-08-04T12:00:00+05:30",
                      location: { name: "Online" },
                    },      
                                  
                    {
                      id: "acereframe2025",
                      name: "AceReframe: The UI/UX Challenge",
                      coverImage: { url: "/ace.webp" },
                      startDateTime: "2025-07-14T09:00:00Z",
                      location: { name: "Online" },
                    },
                    {
                      id: "aihiringshow2025",
                      name: "The AI Hiring Show: Tech + Business Edition",
                      coverImage: { url: "/THEAI.webp" },
                      startDateTime: "2025-08-02T09:00:00+05:30",
                      location: { name: "New Delhi, Delhi, India" },
                    },
                    {
                      id: "opensource2025",
                      name: "Open Source Summer Code",
                      coverImage: { url: "/open.webp" },
                      startDateTime: "2025-07-21T09:00:00+05:30",
                      location: { name: "Online" },
                    },
                    {
                      id: "acereframe2025",
                      name: "AceReframe: The UI/UX Challenge",
                      coverImage: { url: "/ace.webp" },
                      startDateTime: "2025-07-14T09:00:00Z",
                      location: { name: "Online" },
                    },
                    {
                      id: "aihiringshow2025",
                      name: "The AI Hiring Show: Tech + Business Edition",
                      coverImage: { url: "/THEAI.webp" },
                      startDateTime: "2025-08-02T09:00:00+05:30",
                      location: { name: "New Delhi, Delhi, India" },
                    },
                    {
                      id: "opensource2025",
                      name: "Open Source Summer Code",
                      coverImage: { url: "/open.webp" },
                      startDateTime: "2025-07-21T09:00:00+05:30",
                      location: { name: "Online" },
                    },
                  ].map((event) => (
                    <div
                      key={event.id}
                      onClick={() => handleEventClick(event.id)}
                      className="bg-orange-50 rounded-xl p-3 flex flex-col shadow hover:shadow-md transition cursor-pointer mb-2"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={event.coverImage.url}
                          alt={event.name}
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-base mb-1 truncate">
                            {event.name}
                          </div>
                          <div className="text-xs text-gray-600 mb-1">
                            {new Date(event.startDateTime).toLocaleDateString(
                              "en-US",
                              { month: "short", day: "numeric" }
                            )}
                          </div>
                          <div className="text-xs text-gray-500 mb-1">
                            {event.location?.name || "Location TBA"}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Calendar Section */}
            <div className="mt-auto pt-4 sm:pt-5 border-t border-gray-100 w-full">
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
                  Calendar
                </h2>
                <button
                  onClick={() => setSelectedDate(new Date())}
                  className="text-xs sm:text-sm text-orange-600 hover:text-orange-700 font-medium transition"
                >
                  Today
                </button>
              </div>
              <div className="rounded-2xl border border-gray-200 overflow-hidden bg-white shadow-sm">
                <DatePicker
                  selected={selectedDate}
                  onChange={(date) => setSelectedDate(date)}
                  inline
                  className="w-full"
                  calendarClassName="!w-full !border-0"
                  dayClassName={(date) =>
                    `text-xs sm:text-sm rounded-full transition duration-150 ease-in-out \
                    hover:bg-orange-100 \
                    ${date.toDateString() === new Date().toDateString()
                      ? "!text-orange-600 font-bold"
                      : ""
                    }\
                    ${date.toDateString() === selectedDate?.toDateString()
                      ? "!bg-orange-500 !text-white hover:!bg-orange-600"
                      : ""
                    }`
                  }
                  renderCustomHeader={({
                    date,
                    decreaseMonth,
                    increaseMonth,
                    prevMonthButtonDisabled,
                    nextMonthButtonDisabled,
                  }) => (
                    <div className="flex items-center justify-between px-3 sm:px-6 py-2 sm:py-4 bg-orange-50">
                      <button
                        onClick={decreaseMonth}
                        disabled={prevMonthButtonDisabled}
                        className="p-1 sm:p-2 rounded-full hover:bg-orange-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
                      </button>
                      <span className="text-base sm:text-lg font-semibold text-gray-800">
                        {date.toLocaleDateString("en-US", {
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                      <button
                        onClick={increaseMonth}
                        disabled={nextMonthButtonDisabled}
                        className="p-1 sm:p-2 rounded-full hover:bg-orange-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
                      </button>
                    </div>
                  )}
                  formatWeekDay={(nameOfDay) => nameOfDay.substring(0, 1)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MergedDashboard;
