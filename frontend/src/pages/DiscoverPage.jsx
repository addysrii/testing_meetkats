import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/common/Navbar";
import StoryCard from "../components/posts/StoryCard";
import { Search, MapPin, Calendar, Mic, Radio, TrendingUp } from "lucide-react";

// Import service modules directly
import locationService from "../services/locationService";
import postService from "../services/postService";
import storyService from "../services/storyService";
// Import or create an eventService module
import eventService from "../services/eventService";

const Discover = () => {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("feed");
  const [loadingData, setLoadingData] = useState(true);
  const [trendingTopics, setTrendingTopics] = useState([]);
  const [feedContent, setFeedContent] = useState([]);
  const [feedStory, setFeedStory] = useState([]);
  const [events, setEvents] = useState([]);
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!loading && !user) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  // Start continuous location updates when component mounts
  useEffect(() => {
    if (user) {
      let locationTrackingActive = false;

      const initLocationTracking = async () => {
        try {
          const trackingResult = await locationService.startLocationTracking();
          if (trackingResult.success) {
            console.log("Location tracking started successfully");
            setLocationEnabled(true);
            locationTrackingActive = true;
          } else {
            console.error("Location tracking error:", trackingResult.error);
            setLocationEnabled(false);
          }
        } catch (error) {
          console.error("Failed to start location tracking:", error);
          setLocationEnabled(false);
        }
      };

      initLocationTracking();

      // Clean up when component unmounts
      return () => {
        if (locationTrackingActive) {
          try {
            locationService.stopLocationTracking();
            console.log("Location tracking stopped");
          } catch (error) {
            console.error("Error stopping location tracking:", error);
          }
        }
      };
    }
  }, [user]);

  // Fetch trending hashtags
  const fetchTrendingTopics = async () => {
    try {
      // This would typically be implemented in a separate service
      // For now, we'll create a mock implementation
      const mockTrendingTopics = [
        { _id: "1", name: "technology" },
        { _id: "2", name: "networking" },
        { _id: "3", name: "professional" },
        { _id: "4", name: "career" },
        { _id: "5", name: "development" },
      ];

      return { trendingHashtags: mockTrendingTopics };
    } catch (error) {
      console.error("Error fetching trending data:", error);
      return { trendingHashtags: [] };
    }
  };

  // Fetch data based on active section
  useEffect(() => {
    const fetchDiscoverData = async () => {
      if (!user) return;
      setLoadingData(true);
      setError(null);

      try {
        // Fetch trending topics for all sections
        const trendingData = await fetchTrendingTopics();
        setTrendingTopics(trendingData.trendingHashtags || []);

        // Fetch section-specific data
        switch (activeSection) {
          case "feed":
            // Use postService directly
            const feedContentData = await postService.getPosts({
              type: "all",
              filter: "recommended",
              limit: 10,
            });
            const storyContentData = await storyService.getStories({
              type: "all",
              filter: "recommended",
              limit: 10,
            });
            setFeedContent(feedContentData || []);
            setFeedStory(storyContentData || []);
            break;
          case "events":
            // Use eventService directly (you might need to create this)
            let eventsData = [];
            try {
              // This would call your eventService
              eventsData = await eventService.getEvents({
                startDate: new Date().toISOString(),
                limit: 10,
              });
            } catch (eventError) {
              console.warn(
                "Event service might not be implemented:",
                eventError
              );
              // Fallback to sample data if service is not implemented
              eventsData = {
                events: [
                  {
                    _id: "1",
                    title: "Professional Networking Workshop",
                    description:
                      "Learn effective networking strategies for career advancement",
                    startDate: new Date(Date.now() + 86400000).toISOString(), // tomorrow
                    location: { address: "San Francisco, CA" },
                    creator: { firstName: "John", lastName: "Doe" },
                  },
                ],
              };
            }
            setEvents(eventsData.events || []);
            break;
          case "podcasts":
          case "streams":
            // No API call for these sections as they'll show "Coming Soon"
            break;
          default:
            break;
        }

        setLoadingData(false);
      } catch (error) {
        console.error("Error fetching discover data:", error);
        setError("Failed to load content. Please try again later.");
        setLoadingData(false);
      }
    };

    fetchDiscoverData();
  }, [user, activeSection]);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      const options = { weekday: "short", month: "short", day: "numeric" };
      return date.toLocaleDateString(undefined, options);
    } catch (error) {
      console.error("Error formatting date:", error);
      return "";
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      console.error("Error formatting time:", error);
      return "";
    }
  };

  if (loading || loadingData) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen flex-col">
        <div className="text-red-500 mb-4">{error}</div>
        <button
          className="px-4 py-2 bg-orange-500 text-white rounded-lg"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar user={user || {}} onLogout={logout} />

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="md:pl-0 pl-0 md:pt-0 pt-16">
          {" "}
          {/* Adjusted for sidebar */}
          <main className="max-w-7xl mx-auto p-4 md:p-6">
            {/* Discover Header */}
            <div className="bg-white rounded-xl shadow-md mb-6 p-4 md:p-6 border-l-4 border-orange-500">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">Discover</h1>
                  <p className="text-gray-500">
                    Explore content, events, podcasts, and live streams
                  </p>
                </div>

                <div className="mt-4 md:mt-0 w-full md:w-auto">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search..."
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-full w-full md:w-64 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </div>

              {/* Location status indicator */}
              {locationEnabled && (
                <div className="mt-4 flex items-center">
                  <MapPin className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">
                    Location sharing enabled. Showing relevant content near you.
                  </span>
                </div>
              )}

              {/* Location disabled indicator */}
              {!locationEnabled && (
                <div className="mt-4 flex items-center">
                  <MapPin className="h-4 w-4 text-gray-500 mr-1" />
                  <span className="text-sm text-gray-600">
                    Location sharing disabled. Enable location for personalized
                    content.
                  </span>
                </div>
              )}
            </div>

            {/* Content Tabs Navigation */}
            <div className="mb-6 bg-white rounded-xl shadow-md overflow-hidden border-b">
              <div className="flex overflow-x-auto">
                <button
                  onClick={() => setActiveSection("feed")}
                  className={`flex-1 text-center py-4 px-4 font-medium text-sm focus:outline-none transition-colors duration-200 ${
                    activeSection === "feed"
                      ? "text-orange-600 border-b-2 border-orange-500"
                      : "text-gray-500 hover:text-orange-500"
                  }`}
                >
                  Feed
                </button>
                <button
                  onClick={() => setActiveSection("events")}
                  className={`flex-1 text-center py-4 px-4 font-medium text-sm focus:outline-none transition-colors duration-200 ${
                    activeSection === "events"
                      ? "text-orange-600 border-b-2 border-orange-500"
                      : "text-gray-500 hover:text-orange-500"
                  }`}
                >
                  Events
                </button>
                <button
                  onClick={() => setActiveSection("podcasts")}
                  className={`flex-1 text-center py-4 px-4 font-medium text-sm focus:outline-none transition-colors duration-200 ${
                    activeSection === "podcasts"
                      ? "text-orange-600 border-b-2 border-orange-500"
                      : "text-gray-500 hover:text-orange-500"
                  }`}
                >
                  Podcasts
                </button>
                <button
                  onClick={() => setActiveSection("streams")}
                  className={`flex-1 text-center py-4 px-4 font-medium text-sm focus:outline-none transition-colors duration-200 ${
                    activeSection === "streams"
                      ? "text-orange-600 border-b-2 border-orange-500"
                      : "text-gray-500 hover:text-orange-500"
                  }`}
                >
                  Streams
                </button>
              </div>
            </div>

            {/* Main Content Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Main Content (2 cols) */}
              <div className="lg:col-span-2 space-y-6">
                {activeSection === "feed" && (
                  <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                      <h3 className="font-semibold text-gray-800">
                        Recommended For You
                      </h3>
                      <div className="flex gap-2">
                        <button className="px-3 py-1 text-xs bg-orange-100 text-orange-600 rounded-full">
                          All
                        </button>
                        <button className="px-3 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                          Professional
                        </button>
                        <button className="px-3 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                          Popular
                        </button>
                      </div>
                    </div>
                    <div className="p-6">
                      {/* Stories */}
                      <div className="mb-6">
                        <StoryCard stories={feedStory} />
                      </div>

                      {/* Feed Content */}
                      {feedContent.length > 0 ? (
                        <div className="space-y-6">
                          {feedContent.map((content) => (
                            <div
                              key={content._id || content.id}
                              className="pb-6 border-b border-gray-100 last:border-b-0"
                            >
                              <div className="flex items-center mb-3">
                                <div className="h-10 w-10 rounded-lg overflow-hidden mr-3">
                                  {content.author?.profilePicture ? (
                                    <img
                                      src={content.author.profilePicture}
                                      alt={`${content.author.firstName} ${content.author.lastName}`}
                                      className="h-full w-full object-cover"
                                    />
                                  ) : (
                                    <div className="h-full w-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold">
                                      {content.author?.firstName?.charAt(0) ||
                                        "?"}
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <p className="font-medium text-sm">
                                    {content.author?.firstName}{" "}
                                    {content.author?.lastName}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {formatDate(content.createdAt)}
                                  </p>
                                </div>
                                <div className="ml-auto px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                                  {content.contentType || "Post"}
                                </div>
                              </div>

                              <p className="text-gray-800 mb-3">
                                {content.content}
                              </p>

                              {content.images && content.images.length > 0 && (
                                <div className="mb-3 rounded-lg overflow-hidden">
                                  <img
                                    src={content.images[0].url}
                                    alt="Content"
                                    className="w-full h-48 object-cover"
                                  />
                                </div>
                              )}

                              <div className="flex items-center justify-between">
                                <div className="flex space-x-4">
                                  <button
                                    className="flex items-center text-gray-500 hover:text-orange-500"
                                    onClick={() =>
                                      postService.reactToPost(
                                        content._id || content.id,
                                        "like"
                                      )
                                    }
                                  >
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      className="h-5 w-5 mr-1"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                      />
                                    </svg>
                                    <span className="text-sm">
                                      {content.likes?.length || 0}
                                    </span>
                                  </button>

                                  <button className="flex items-center text-gray-500 hover:text-orange-500">
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      className="h-5 w-5 mr-1"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                                      />
                                    </svg>
                                    <span className="text-sm">
                                      {content.comments?.length || 0}
                                    </span>
                                  </button>
                                </div>

                                <Link
                                  to={`/${content.contentType || "posts"}/${
                                    content._id || content.id
                                  }`}
                                  className="text-orange-500 hover:text-orange-600 text-sm font-medium"
                                >
                                  View Details
                                </Link>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="py-10 text-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-12 w-12 mx-auto text-gray-300 mb-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                            />
                          </svg>
                          <p className="text-gray-500">No content to show.</p>
                          <p className="text-gray-500 mt-1">
                            Follow more users or topics to see personalized
                            content
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeSection === "events" && (
                  <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                      <h3 className="font-semibold text-gray-800">
                        Upcoming Events
                      </h3>
                      <div className="flex gap-2">
                        <button className="px-3 py-1 text-xs bg-orange-100 text-orange-600 rounded-full">
                          All
                        </button>
                        <button className="px-3 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                          Professional
                        </button>
                        <button className="px-3 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                          Nearby
                        </button>
                      </div>
                    </div>

                    <div className="p-6">
                      {events.length > 0 ? (
                        <div className="space-y-6">
                          {events.map((event) => (
                            <div
                              key={event._id || event.id}
                              className="flex border border-gray-100 rounded-lg overflow-hidden shadow-sm hover:shadow transition-shadow"
                            >
                              <div className="w-24 md:w-32 bg-orange-100 flex flex-col items-center justify-center text-orange-800 flex-shrink-0">
                                <span className="text-sm font-semibold">
                                  {new Date(event.startDate).toLocaleString(
                                    "default",
                                    { month: "short" }
                                  )}
                                </span>
                                <span className="text-2xl font-bold">
                                  {new Date(event.startDate).getDate()}
                                </span>
                              </div>

                              <div className="flex-1 p-4">
                                <h4 className="font-semibold text-gray-900">
                                  {event.title}
                                </h4>
                                <div className="flex items-center mt-1 mb-2">
                                  <Calendar className="h-4 w-4 text-gray-500 mr-1" />
                                  <span className="text-xs text-gray-500">
                                    {formatDate(event.startDate)} at{" "}
                                    {formatTime(event.startDate)}
                                  </span>

                                  {event.location && event.location.address && (
                                    <>
                                      <MapPin className="h-4 w-4 text-gray-500 ml-3 mr-1" />
                                      <span className="text-xs text-gray-500">
                                        {event.location.address}
                                      </span>
                                    </>
                                  )}
                                </div>

                                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                  {event.description}
                                </p>

                                <div className="flex items-center justify-between">
                                  <div className="flex items-center">
                                    <div className="h-6 w-6 rounded-full overflow-hidden mr-2">
                                      {event.creator?.profilePicture ? (
                                        <img
                                          src={event.creator.profilePicture}
                                          alt={`${event.creator.firstName} ${event.creator.lastName}`}
                                          className="h-full w-full object-cover"
                                        />
                                      ) : (
                                        <div className="h-full w-full bg-orange-100 flex items-center justify-center text-orange-600 text-xs font-bold">
                                          {event.creator?.firstName?.charAt(
                                            0
                                          ) || "?"}
                                        </div>
                                      )}
                                    </div>
                                    <span className="text-xs text-gray-500">
                                      By {event.creator?.firstName}{" "}
                                      {event.creator?.lastName}
                                    </span>
                                  </div>

                                  <Link
                                    to={`/events/${event._id || event.id}`}
                                    className="text-orange-500 hover:text-orange-600 text-sm font-medium"
                                  >
                                    View Event
                                  </Link>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="py-10 text-center">
                          <Calendar className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                          <p className="text-gray-500">
                            No upcoming events to show.
                          </p>
                          <Link
                            to="/events/create"
                            className="text-orange-500 hover:text-orange-600 mt-2 inline-block"
                          >
                            Create an Event →
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeSection === "podcasts" && (
                  <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                      <h3 className="font-semibold text-gray-800">
                        Featured Podcasts
                      </h3>
                      <div className="flex gap-2">
                        <button className="px-3 py-1 text-xs bg-orange-100 text-orange-600 rounded-full">
                          All
                        </button>
                        <button className="px-3 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                          Business
                        </button>
                        <button className="px-3 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                          Technology
                        </button>
                      </div>
                    </div>

                    <div className="p-6">
                      {/* Coming Soon Message */}
                      <div className="py-12 text-center">
                        <div className="bg-orange-50 rounded-lg p-8 max-w-md mx-auto">
                          <Mic className="h-16 w-16 mx-auto text-orange-500 mb-4" />
                          <h3 className="text-2xl font-bold text-gray-800 mb-2">
                            Podcasts Coming Soon!
                          </h3>
                          <p className="text-gray-600 mb-4">
                            We're working on bringing you the best professional
                            podcasts. Stay tuned for expert insights and
                            industry discussions.
                          </p>
                          <div className="bg-white rounded-full h-2 mb-2">
                            <div className="bg-orange-500 h-2 rounded-full w-3/4"></div>
                          </div>
                          <p className="text-sm text-gray-500">75% Complete</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeSection === "streams" && (
                  <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                      <h3 className="font-semibold text-gray-800">
                        Live & Upcoming Streams
                      </h3>
                      <div className="flex gap-2">
                        <button className="px-3 py-1 text-xs bg-orange-100 text-orange-600 rounded-full">
                          All
                        </button>
                        <button className="px-3 py-1 text-xs bg-red-100 text-red-600 rounded-full">
                          Live Now
                        </button>
                        <button className="px-3 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                          Scheduled
                        </button>
                      </div>
                    </div>

                    <div className="p-6">
                      {/* Coming Soon Message */}
                      <div className="py-12 text-center">
                        <div className="bg-orange-50 rounded-lg p-8 max-w-md mx-auto">
                          <Radio className="h-16 w-16 mx-auto text-orange-500 mb-4" />
                          <h3 className="text-2xl font-bold text-gray-800 mb-2">
                            Live Streams Coming Soon!
                          </h3>
                          <p className="text-gray-600 mb-4">
                            We're building a platform for live professional
                            streams and workshops. Connect with experts in
                            real-time soon!
                          </p>
                          <div className="bg-white rounded-full h-2 mb-2">
                            <div className="bg-orange-500 h-2 rounded-full w-1/2"></div>
                          </div>
                          <p className="text-sm text-gray-500">50% Complete</p>
                          <button className="mt-4 px-6 py-2 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-colors">
                            Get Notified When Live
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column - Sidebar (1 col) */}
              <div className="space-y-6">
                {/* Trending Topics */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                  <div className="border-b border-gray-200 px-6 py-4 flex items-center">
                    <TrendingUp className="h-4 w-4 text-orange-500 mr-2" />
                    <h3 className="font-semibold text-gray-800">
                      Trending Topics
                    </h3>
                  </div>

                  <div className="p-6">
                    {trendingTopics.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {trendingTopics.map((topic, index) => (
                          <Link
                            key={topic._id || index}
                            to={`/hashtag/${topic.name}`}
                            className="px-3 py-1 bg-gray-100 hover:bg-orange-100 text-gray-800 hover:text-orange-600 rounded-full text-sm transition-colors"
                          >
                            #{topic.name}
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">
                        No trending topics right now.
                      </p>
                    )}
                  </div>
                </div>

                {/* Discover Recommendations */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                  <div className="border-b border-gray-200 px-6 py-4">
                    <h3 className="font-semibold text-gray-800">
                      Recommended For You
                    </h3>
                  </div>

                  <div className="p-6">
                    <div className="space-y-4">
                      {/* Recommended Event */}
                      <div className="pb-4 border-b border-gray-100">
                        <span className="text-xs text-orange-600 font-medium">
                          EVENT
                        </span>
                        <h4 className="font-medium text-gray-900 mt-1">
                          Professional Networking Workshop
                        </h4>
                        <p className="text-xs text-gray-500 mt-1">
                          Tomorrow, 6:00 PM
                        </p>
                        <Link
                          to="/events"
                          className="text-orange-500 hover:text-orange-600 text-sm font-medium mt-2 inline-block"
                        >
                          View Event →
                        </Link>
                      </div>

                      {/* Recommended User */}
                      <div>
                        <span className="text-xs text-orange-600 font-medium">
                          CONNECT WITH
                        </span>
                        <div className="flex items-center mt-2">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold mr-3">
                            S
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">
                              Sarah Johnson
                            </h4>
                            <p className="text-xs text-gray-500">
                              Product Designer • 12 mutual connections
                            </p>
                          </div>
                        </div>
                        <button className="text-orange-500 border border-orange-500 px-3 py-1 rounded-full text-sm font-medium mt-2 hover:bg-orange-50 transition-colors">
                          Connect
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Featured Content */}
                <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-md overflow-hidden text-white">
                  <div className="p-6">
                    <h3 className="font-semibold text-xl mb-2">
                      Ready to share your expertise?
                    </h3>
                    <p className="text-orange-100 mb-4">
                      Host your own live stream or podcast and connect with
                      professionals worldwide.
                    </p>
                    <div className="flex space-x-3">
                      <Link
                        to="/streams/create"
                        className="px-4 py-2 bg-white text-orange-600 font-medium rounded-lg text-sm hover:bg-orange-50 transition-colors"
                      >
                        Start Streaming
                      </Link>
                      <Link
                        to="/podcasts/create"
                        className="px-4 py-2 bg-orange-600 text-white font-medium rounded-lg text-sm border border-white hover:bg-orange-700 transition-colors"
                      >
                        Create Podcast
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Upcoming Events Preview */}
                {activeSection !== "events" && (
                  <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                      <h3 className="font-semibold text-gray-800">
                        Upcoming Events
                      </h3>
                      <Link
                        to="/events"
                        className="text-orange-500 hover:text-orange-600 text-sm"
                      >
                        View All
                      </Link>
                    </div>

                    <div className="p-6">
                      <div className="space-y-4">
                        <div className="flex items-center">
                          <div className="h-12 w-12 rounded-lg bg-orange-100 flex flex-col items-center justify-center text-orange-600 flex-shrink-0 mr-3">
                            <span className="text-xs font-semibold">JUN</span>
                            <span className="text-sm font-bold">15</span>
                          </div>
                          <div>
                            <h4 className="font-medium text-sm text-gray-900">
                              Tech Networking Mixer
                            </h4>
                            <p className="text-xs text-gray-500">
                              6:00 PM • San Francisco
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center">
                          <div className="h-12 w-12 rounded-lg bg-green-100 flex flex-col items-center justify-center text-green-600 flex-shrink-0 mr-3">
                            <span className="text-xs font-semibold">JUN</span>
                            <span className="text-sm font-bold">22</span>
                          </div>
                          <div>
                            <h4 className="font-medium text-sm text-gray-900">
                              Virtual Career Fair
                            </h4>
                            <p className="text-xs text-gray-500">
                              10:00 AM • Online
                            </p>
                          </div>
                        </div>

                        <Link
                          to="/events"
                          className="text-orange-500 hover:text-orange-600 text-sm font-medium block text-center mt-2"
                        >
                          See All Events →
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </main>
          {/* Footer */}
          <footer className="bg-gradient-to-r from-orange-600 to-orange-700 text-white py-3 md:py-4 mt-6">
            <div className="max-w-7xl mx-auto px-4 text-center">
              <p className="text-xs md:text-sm">
                © 2025 MeetKats •{" "}
                <a
                  href="/privacy-policy"
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
          </footer>
        </div>
      </div>
    </div>
  );
};

export default Discover;
