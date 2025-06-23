import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import {
  MapPin,
  Users,
  ChevronRight,
  Search,
  Filter,
  UserPlus,
  Rss,
  Home,
  Bell,
  MessageCircle,
  Briefcase,
  Settings,
  LogOut,
} from "lucide-react";
import Loader from "../components/common/Loader";
import UserCard from "../components/common/UserCard";
import networkService from "../services/networkService";
import Sidebar from "../components/common/Navbar";
const NetworkExplorePage = ({user,onLogout}) => {
  const [loading, setLoading] = useState({
    nearby: true,
    suggested: true,
  });
  const [nearbyUsers, setNearbyUsers] = useState([]);
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [activeSection, setActiveSection] = useState("all");
  // const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Get user's location and fetch both types of users simultaneously
    getUserLocation();
    fetchSuggestedUsers();
  }, []);

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ latitude, longitude });
          fetchNearbyUsers(latitude, longitude, 10); // Default 10km radius
        },
        (error) => {
          console.error("Error getting location:", error);
          setLoading((prev) => ({ ...prev, nearby: false }));
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
      setLoading((prev) => ({ ...prev, nearby: false }));
    }
  };

  const fetchNearbyUsers = async (latitude, longitude, distance) => {
    try {
      const nearbyResponse = await api.getNearbyProfessionals(distance);

      if (!Array.isArray(nearbyResponse)) {
        console.error(
          "Invalid response from getNearbyProfessionals:",
          nearbyResponse
        );
        setNearbyUsers([]);
        setLoading((prev) => ({ ...prev, nearby: false }));
        return;
      }

      // Now fetch connections in a separate call
      let connections = [];
      try {
        connections = await api.getConnections("all");
        if (!Array.isArray(connections)) {
          console.error("Invalid response from getConnections:", connections);
          connections = [];
        }
      } catch (connectionError) {
        console.error("Error fetching connections:", connectionError);
        connections = [];
      }

      // Create a Set of connection IDs for faster lookup
      const connectionIds = new Set(connections.map((conn) => conn._id));

      // Filter out users who are in your connections
      const filteredUsers = nearbyResponse.filter(
        (user) => !connectionIds.has(user._id)
      );

      setNearbyUsers(filteredUsers.slice(0, 3)); // Show only first 3 users
      setLoading((prev) => ({ ...prev, nearby: false }));
    } catch (error) {
      console.error("Error fetching nearby professionals:", error);
      setLoading((prev) => ({ ...prev, nearby: false }));
    }
  };

  const fetchSuggestedUsers = async () => {
    try {
      const suggestedResponse = await networkService.getConnectionSuggestions({
        limit: 3,
      });

      if (!Array.isArray(suggestedResponse)) {
        console.error(
          "Invalid response from getProfessionalSuggestions:",
          suggestedResponse
        );
        setSuggestedUsers([]);
        setLoading((prev) => ({ ...prev, suggested: false }));
        return;
      }

      // Now fetch connections in a separate call
      let connections = [];
      try {
        connections = await api.getConnections("all");
        if (!Array.isArray(connections)) {
          console.error("Invalid response from getConnections:", connections);
          connections = [];
        }
      } catch (connectionError) {
        console.error("Error fetching connections:", connectionError);
        connections = [];
      }

      // Create a Set of connection IDs for faster lookup
      const connectionIds = new Set(connections.map((conn) => conn._id));

      // Filter out users who are in your connections
      const filteredUsers = suggestedResponse.filter(
        (user) => !connectionIds.has(user._id)
      );

      setSuggestedUsers(filteredUsers);
      setLoading((prev) => ({ ...prev, suggested: false }));
    } catch (error) {
      console.error("Error fetching suggested users:", error);
      setLoading((prev) => ({ ...prev, suggested: false }));
    }
  };

  const handleConnect = async (userId, userType) => {
    try {
      await api.sendConnectionRequest(userId);
      // Update the user's status in the appropriate list
      if (userType === "nearby") {
        setNearbyUsers((prev) =>
          prev.map((user) =>
            user._id === userId
              ? { ...user, connectionStatus: "pending" }
              : user
          )
        );
      } else {
        setSuggestedUsers((prev) =>
          prev.map((user) =>
            user._id === userId
              ? { ...user, connectionStatus: "pending" }
              : user
          )
        );
      }
    } catch (error) {
      console.error("Error sending connection request:", error);
    }
  };

  const handleFollow = async (userId, userType) => {
    try {
      const response = await api.followUser(userId);
      // Update the user's status in the appropriate list
      if (userType === "nearby") {
        setNearbyUsers((prev) =>
          prev.map((user) =>
            user._id === userId
              ? { ...user, isFollowing: response.following }
              : user
          )
        );
      } else {
        setSuggestedUsers((prev) =>
          prev.map((user) =>
            user._id === userId
              ? { ...user, isFollowing: response.following }
              : user
          )
        );
      }
    } catch (error) {
      console.error("Error following user:", error);
    }
  };

  // const toggleSidebar = () => {
  //   setSidebarCollapsed(!isSidebarCollapsed);
  // };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar user={user} onLogout={onLogout} />

      {/* Main Content */}
      <div
        className="flex-1 overflow-auto transition-all duration-300 mt-16 lg:mt-0"
      >
        <main className="max-w-7xl mx-auto p-4 md:p-6 mt-20">
          {/* Dashboard Header */}
          <div className="bg-white rounded-xl shadow-md mb-6 p-4 md:p-6 border-l-4 border-orange-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  Explore Network
                </h1>
                <p className="text-gray-500">
                  Discover professionals near you and get personalized
                  recommendations
                </p>
              </div>

              <div className="mt-4 md:mt-0 flex space-x-2">
                <button
                  onClick={() => navigate("/network/search")}
                  className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center"
                >
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </button>
                <button
                  onClick={() => navigate("/network/filter")}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 flex items-center"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Advanced Filters
                </button>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="mb-6 bg-white rounded-xl shadow-md overflow-hidden border-b">
            <div className="flex overflow-x-auto">
              <button
                onClick={() => setActiveSection("all")}
                className={`flex-1 text-center py-4 px-4 font-medium text-sm focus:outline-none transition-colors duration-200 ${
                  activeSection === "all"
                    ? "text-orange-600 border-b-2 border-orange-500"
                    : "text-gray-500 hover:text-orange-500"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setActiveSection("nearby")}
                className={`flex-1 text-center py-4 px-4 font-medium text-sm focus:outline-none transition-colors duration-200 ${
                  activeSection === "nearby"
                    ? "text-orange-600 border-b-2 border-orange-500"
                    : "text-gray-500 hover:text-orange-500"
                }`}
              >
                Nearby
              </button>
              <button
                onClick={() => setActiveSection("suggested")}
                className={`flex-1 text-center py-4 px-4 font-medium text-sm focus:outline-none transition-colors duration-200 ${
                  activeSection === "suggested"
                    ? "text-orange-600 border-b-2 border-orange-500"
                    : "text-gray-500 hover:text-orange-500"
                }`}
              >
                Suggested
              </button>
            </div>
          </div>

          {/* Content based on active section */}
          {(activeSection === "all" || activeSection === "nearby") && (
            <div className={`mb-8 ${activeSection !== "all" ? "mb-0" : ""}`}>
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 text-orange-500 mr-2" />
                  <h2 className="text-xl font-semibold text-gray-800">
                    Nearby Professionals
                  </h2>
                </div>
                <Link
                  to="/network/nearby"
                  className="text-orange-500 hover:text-orange-600 text-sm flex items-center"
                >
                  See All <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </div>

              {loading.nearby ? (
                <div className="bg-white rounded-xl shadow-md p-4 flex justify-center items-center h-60">
                  <Loader />
                </div>
              ) : nearbyUsers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {nearbyUsers.map((user) => (
                    <div
                      key={user._id}
                      className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                    >
                      <div className="h-24 bg-gradient-to-r from-orange-100 to-orange-200 relative">
                        {/* User distance badge */}
                        {user.distance && (
                          <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded-full text-xs font-medium text-gray-700 shadow-sm">
                            {user.distance < 1
                              ? `${(user.distance * 1000).toFixed(0)}m`
                              : `${user.distance.toFixed(1)}km`}{" "}
                            away
                          </div>
                        )}
                      </div>

                      <div className="p-4 relative">
                        {/* Profile Picture */}
                        <div className="absolute -top-12 left-4 border-4 border-white rounded-full">
                          {user.profilePicture ? (
                            <img
                              src={user.profilePicture}
                              alt={`${user.firstName} ${user.lastName}`}
                              className="h-20 w-20 rounded-full object-cover"
                            />
                          ) : (
                            <div className="h-20 w-20 rounded-full bg-orange-100 flex items-center justify-center">
                              <span className="text-xl font-medium text-orange-600">
                                {user.firstName?.charAt(0)}
                                {user.lastName?.charAt(0)}
                              </span>
                            </div>
                          )}
                          {user.online && (
                            <div className="absolute bottom-0 right-0 h-4 w-4 rounded-full bg-green-500 border-2 border-white"></div>
                          )}
                        </div>

                        <div className="mt-10">
                          <h3
                            className="text-lg font-medium text-gray-900 hover:text-orange-600 cursor-pointer"
                            onClick={() => navigate(`/profile/${user._id}`)}
                          >
                            {user.firstName} {user.lastName}
                          </h3>
                          <p className="text-sm text-gray-600 truncate">
                            {user.headline || "Professional"}
                          </p>

                          {user.industry && (
                            <div className="mt-2 text-sm text-gray-600">
                              {user.industry}
                            </div>
                          )}

                          {/* Skills tags */}
                          {user.skills && user.skills.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-3">
                              {user.skills.slice(0, 2).map((skill, index) => (
                                <span
                                  key={index}
                                  className="text-xs bg-orange-50 text-orange-700 px-2 py-1 rounded"
                                >
                                  {typeof skill === "string"
                                    ? skill
                                    : skill.name}
                                </span>
                              ))}
                              {user.skills.length > 2 && (
                                <span className="text-xs text-gray-500">
                                  +{user.skills.length - 2} more
                                </span>
                              )}
                            </div>
                          )}

                          <div className="mt-4 flex space-x-2">
                            <button
                              onClick={() => handleConnect(user._id, "nearby")}
                              disabled={
                                user.connectionStatus === "pending" ||
                                user.connectionStatus === "connected"
                              }
                              className={`flex-1 py-2 rounded-md text-sm font-medium ${
                                user.connectionStatus === "pending"
                                  ? "bg-gray-100 text-gray-500"
                                  : user.connectionStatus === "connected"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-orange-500 text-white hover:bg-orange-600"
                              }`}
                            >
                              <div className="flex items-center justify-center">
                                <UserPlus className="h-4 w-4 mr-1" />
                                {user.connectionStatus === "pending"
                                  ? "Pending"
                                  : user.connectionStatus === "connected"
                                  ? "Connected"
                                  : "Connect"}
                              </div>
                            </button>

                            <button
                              onClick={() => handleFollow(user._id, "nearby")}
                              className={`flex-1 py-2 rounded-md text-sm font-medium ${
                                user.isFollowing
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                              }`}
                            >
                              <div className="flex items-center justify-center">
                                <Rss className="h-4 w-4 mr-1" />
                                {user.isFollowing ? "Following" : "Follow"}
                              </div>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-md p-8 text-center">
                  <div className="inline-flex h-16 w-16 rounded-full bg-orange-100 items-center justify-center mb-4">
                    <MapPin className="h-8 w-8 text-orange-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    No Nearby Professionals
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {userLocation
                      ? "We couldn't find any professionals near your current location."
                      : "Please enable location services to see professionals near you."}
                  </p>
                  <button
                    onClick={getUserLocation}
                    className="inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                  >
                    Retry
                  </button>
                </div>
              )}
            </div>
          )}

          {(activeSection === "all" || activeSection === "suggested") && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center">
                  <Users className="h-5 w-5 text-orange-500 mr-2" />
                  <h2 className="text-xl font-semibold text-gray-800">
                    Suggested For You
                  </h2>
                </div>
                <Link
                  to="/network/suggested"
                  className="text-orange-500 hover:text-orange-600 text-sm flex items-center"
                >
                  See All <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </div>

              {loading.suggested ? (
                <div className="bg-white rounded-xl shadow-md p-4 flex justify-center items-center h-60">
                  <Loader />
                </div>
              ) : suggestedUsers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {suggestedUsers.map((user) => (
                    <div
                      key={user._id}
                      className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                    >
                      <div className="h-24 bg-gradient-to-r from-blue-100 to-blue-200 relative">
                        {/* Mutual connections badge */}
                        {user.mutualConnections > 0 && (
                          <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded-full text-xs font-medium text-gray-700 shadow-sm">
                            {user.mutualConnections} mutual connection
                            {user.mutualConnections > 1 ? "s" : ""}
                          </div>
                        )}
                      </div>

                      <div className="p-4 relative">
                        {/* Profile Picture */}
                        <div className="absolute -top-12 left-4 border-4 border-white rounded-full">
                          {user.profilePicture ? (
                            <img
                              src={user.profilePicture}
                              alt={`${user.firstName} ${user.lastName}`}
                              className="h-20 w-20 rounded-full object-cover"
                            />
                          ) : (
                            <div className="h-20 w-20 rounded-full bg-blue-100 flex items-center justify-center">
                              <span className="text-xl font-medium text-blue-600">
                                {user.firstName?.charAt(0)}
                                {user.lastName?.charAt(0)}
                              </span>
                            </div>
                          )}
                          {user.online && (
                            <div className="absolute bottom-0 right-0 h-4 w-4 rounded-full bg-green-500 border-2 border-white"></div>
                          )}
                        </div>

                        <div className="mt-10">
                          <h3
                            className="text-lg font-medium text-gray-900 hover:text-blue-600 cursor-pointer"
                            onClick={() => navigate(`/profile/${user._id}`)}
                          >
                            {user.firstName} {user.lastName}
                          </h3>
                          <p className="text-sm text-gray-600 truncate">
                            {user.headline || "Professional"}
                          </p>

                          {user.industry && (
                            <div className="mt-2 text-sm text-gray-600">
                              {user.industry}
                            </div>
                          )}

                          {/* Skills tags */}
                          {user.skills && user.skills.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-3">
                              {user.skills.slice(0, 2).map((skill, index) => (
                                <span
                                  key={index}
                                  className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded"
                                >
                                  {typeof skill === "string"
                                    ? skill
                                    : skill.name}
                                </span>
                              ))}
                              {user.skills.length > 2 && (
                                <span className="text-xs text-gray-500">
                                  +{user.skills.length - 2} more
                                </span>
                              )}
                            </div>
                          )}

                          <div className="mt-4 flex space-x-2">
                            <button
                              onClick={() =>
                                handleConnect(user._id, "suggested")
                              }
                              disabled={
                                user.connectionStatus === "pending" ||
                                user.connectionStatus === "connected"
                              }
                              className={`flex-1 py-2 rounded-md text-sm font-medium ${
                                user.connectionStatus === "pending"
                                  ? "bg-gray-100 text-gray-500"
                                  : user.connectionStatus === "connected"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-blue-500 text-white hover:bg-blue-600"
                              }`}
                            >
                              <div className="flex items-center justify-center">
                                <UserPlus className="h-4 w-4 mr-1" />
                                {user.connectionStatus === "pending"
                                  ? "Pending"
                                  : user.connectionStatus === "connected"
                                  ? "Connected"
                                  : "Connect"}
                              </div>
                            </button>

                            <button
                              onClick={() =>
                                handleFollow(user._id, "suggested")
                              }
                              className={`flex-1 py-2 rounded-md text-sm font-medium ${
                                user.isFollowing
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                              }`}
                            >
                              <div className="flex items-center justify-center">
                                <Rss className="h-4 w-4 mr-1" />
                                {user.isFollowing ? "Following" : "Follow"}
                              </div>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-md p-8 text-center">
                  <div className="inline-flex h-16 w-16 rounded-full bg-blue-100 items-center justify-center mb-4">
                    <Users className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    No Suggestions Available
                  </h3>
                  <p className="text-gray-600 mb-4">
                    We're having trouble finding professionals to suggest. Try
                    completing your profile with more skills and industry
                    information.
                  </p>
                  <button
                    onClick={() => navigate("/profile/edit")}
                    className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    Complete Profile
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Footer gradient */}
          <footer className="bg-gradient-to-r from-orange-600 to-orange-700 text-white py-4 mt-8 rounded-lg">
            <div className="max-w-7xl mx-auto px-4 text-center">
              <p className="text-sm">
                Connect with professionals who match your interests and can help
                you grow your career.
              </p>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
};

export default NetworkExplorePage;
