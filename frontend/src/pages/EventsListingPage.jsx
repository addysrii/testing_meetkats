import { useState, useEffect } from "react";
import {
  Search,
  Calendar,
  MapPin,
  Filter,
  ArrowUpDown,
  Users,
  Tag,
  ChevronLeft,
  ChevronRight,
  PlusCircle,
} from "lucide-react";
import eventService from "../services/eventService";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import Sidebar from "../components/common/Navbar";
import { FooterBlock } from "./BhoomiLandingPage/sections/FooterBlock";

const EventCard = ({ event }) => {
  const formatDate = (dateString) => {
    if (!dateString) return "Date TBA";

    try {
      const options = { weekday: "short", month: "short", day: "numeric" };
      return new Date(dateString).toLocaleDateString("en-US", options);
    } catch (err) {
      console.error("Date formatting error:", err);
      return "Invalid date";
    }
  };

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

  const goingCount = getAttendeeCount(event.attendeeCounts, "going");

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 border cursor-pointer">
      <div className="relative">
        <img
          src={event.coverImage?.url || "/api/placeholder/400/200"}
          alt={event.name || "Event"}
          className="w-full h-48 object-cover"
        />
        {event.category && (
          <span className="absolute top-3 right-3 bg-black bg-opacity-70 text-white text-xs font-bold px-2 py-1 rounded-full">
            {typeof event.category === "string" ? event.category : "Other"}
          </span>
        )}
        <div className="absolute bottom-3 left-3 bg-white bg-opacity-90 backdrop-blur-sm rounded-lg px-2 py-1">
          <p className="text-xs font-semibold text-gray-800">
            {formatDate(event.startDateTime)}
          </p>
        </div>
      </div>

      <div className="p-4">
        <h3 className="text-base font-bold text-gray-900 mb-2 line-clamp-2">
          {event.name || "Untitled Event"}
        </h3>

        <div className="flex items-center text-gray-600 mb-3">
          <MapPin className="w-4 h-4 mr-1 text-blue-500" />
          <span className="text-sm truncate">
            {event.virtual
              ? "Virtual Event"
              : event.location?.name || "Location TBA"}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-1">
            <div className="flex -space-x-1">
              {[
                ...Array(
                  Math.min(
                    3,
                    goingCount > 0
                      ? Math.max(1, Math.floor(goingCount / 20))
                      : 1
                  )
                ),
              ].map((_, i) => (
                <div
                  key={`avatar-${i}-${event._id || event.id}`}
                  className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 border-2 border-white flex items-center justify-center"
                >
                  <span className="text-xs text-white font-medium">
                    {String.fromCharCode(65 + i)}
                  </span>
                </div>
              ))}
            </div>
            <span className="text-xs text-gray-600 ml-2">
              {goingCount || 0} attending
            </span>
          </div>
          <Link to={`/events/${event._id || event.id}`}>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-300 cursor-pointer">
              View
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

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
    } catch (err) {
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

const EventListingPage = () => {
  const [events, setEvents] = useState([]);
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("upcoming");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [showAllEvents, setShowAllEvents] = useState(false);
  const [categories, setCategories] = useState([
    "All",
    "Business",
    "Technology",
    "Social",
    "Education",
    "Entertainment",
    "Health",
    "Other",
  ]);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const apiFilters = {};

        if (filter === "upcoming") {
          apiFilters.filter = "upcoming";
        } else if (filter === "past") {
          apiFilters.filter = "past";
        } else if (filter === "all") {
          // No filter for all events
          apiFilters.filter = "all";
        }

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
        setLoading(false);
      } catch (err) {
        console.error("Error fetching events:", err);
        setError("Failed to load events. Please try again later.");
        setLoading(false);
      }
    };

    fetchEvents();
  }, [filter, categoryFilter, searchQuery]);

  const handleSearch = (e) => {
    e.preventDefault();
  };

  const filteredEvents = events.filter((event) => {
    const eventName = event.name || "";
    const matchesSearch =
      searchQuery === "" ||
      eventName.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  const featuredEvents = filteredEvents.slice(0, 3);

  const categorizedEvents = {
    recommended: filteredEvents.slice(0, 4),
    hackathons: filteredEvents
      .filter(
        (event) =>
          event.category?.toLowerCase().includes("hackathon") ||
          event.name?.toLowerCase().includes("hack")
      )
      .slice(0, 4),
    network: filteredEvents
      .filter(
        (event) =>
          event.category?.toLowerCase().includes("network") ||
          event.category?.toLowerCase().includes("business") ||
          event.name?.toLowerCase().includes("network")
      )
      .slice(0, 4),
    live: filteredEvents
      .filter(
        (event) =>
          event.category?.toLowerCase().includes("entertainment") ||
          event.name?.toLowerCase().includes("live") ||
          event.name?.toLowerCase().includes("show")
      )
      .slice(0, 4),
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % Math.max(1, featuredEvents.length));
  };

  const prevSlide = () => {
    setCurrentSlide(
      (prev) =>
        (prev - 1 + Math.max(1, featuredEvents.length)) %
        Math.max(1, featuredEvents.length)
    );
  };

  useEffect(() => {
    if (featuredEvents.length > 1) {
      const interval = setInterval(nextSlide, 5000);
      return () => clearInterval(interval);
    }
  }, [featuredEvents.length]);

  const EventSection = ({ title, events, showSeeAll = true, category }) => {
    if (!events || events.length === 0) return null;

    return (
      <div className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          {showSeeAll && (
            <button
              onClick={() => {
                setCategoryFilter(category || "");
                setShowAllEvents(true);
              }}
              className="text-blue-600 hover:text-blue-700 font-medium text-sm cursor-pointer flex items-center gap-1"
            >
              See All <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {events.map((event) => (
            <EventCard
              key={event._id || event.id || `event-${Math.random()}`}
              event={event}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen">
      <div className="z-20 relative">
        <Sidebar user={user || {}} onLogout={logout} />
      </div>

      <div className="flex-1 overflow-y-auto bg-gray-50 mt-20 ">


        <div className="flex justify-end pr-4  mb-2"> 
          <Link to="/events/new">
            <button className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors duration-200 bg-gray-50 hover:bg-gray-100 px-4 py-2 rounded-xl">
              <PlusCircle className="w-5 h-5" />
              <span className="font-medium">Host Event</span>
            </button>
          </Link>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {featuredEvents.length > 0 && (
            <div className="relative mb-16">
              <div className="overflow-hidden rounded-3xl shadow-xl">
                <div
                  className="flex transition-transform duration-500 ease-in-out"
                  style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                >
                  {featuredEvents.map((event, index) => (
                    <CarouselCard
                      key={event._id || event.id || index}
                      event={event}
                    />
                  ))}
                </div>
              </div>

              {featuredEvents.length > 1 && (
                <>
                  <button
                    onClick={prevSlide}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-3 shadow-lg transition-all hover:scale-110 cursor-pointer"
                  >
                    <ChevronLeft className="w-6 h-6 text-gray-700" />
                  </button>
                  <button
                    onClick={nextSlide}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-3 shadow-lg transition-all hover:scale-110 cursor-pointer"
                  >
                    <ChevronRight className="w-6 h-6 text-gray-700" />
                  </button>

                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                    {featuredEvents.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentSlide(index)}
                        className={`w-3 h-3 rounded-full transition-all cursor-pointer ${currentSlide === index
                          ? "bg-white scale-125"
                          : "bg-white/50 hover:bg-white/75"
                          }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 space-y-4 md:space-y-0">
            <div className="flex space-x-4">
              <button
                className={`px-5 py-2.5 rounded-xl ${filter === "upcoming"
                  ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg"
                  : "bg-white text-gray-700 border border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  } transition-all duration-200 font-medium cursor-pointer`}
                onClick={() => {
                  setFilter("upcoming");
                  setShowAllEvents(false);
                }}
              >
                Upcoming
              </button>
              <button
                className={`px-5 py-2.5 rounded-xl ${filter === "all"
                  ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg"
                  : "bg-white text-gray-700 border border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  } transition-all duration-200 font-medium cursor-pointer`}
                onClick={() => {
                  setFilter("all");
                  setShowAllEvents(false);
                }}
              >
                All Events
              </button>
              <button
                className={`px-5 py-2.5 rounded-xl ${filter === "past"
                  ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg"
                  : "bg-white text-gray-700 border border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  } transition-all duration-200 font-medium cursor-pointer`}
                onClick={() => {
                  setFilter("past");
                  setShowAllEvents(false);
                }}
              >
                Past
              </button>
            </div>

            <div className="flex space-x-3">
              <div className="relative">
                <select
                  className="appearance-none bg-white border border-gray-200 rounded-xl pl-4 pr-10 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 hover:border-gray-300 shadow-sm cursor-pointer"
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
                <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
              </div>

              <button className="flex items-center space-x-2 bg-white border border-gray-200 rounded-xl px-4 py-2.5 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 shadow-sm cursor-pointer">
                <ArrowUpDown className="h-4 w-4 text-gray-500" />
                <span className="font-medium">Sort</span>
              </button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin mx-auto"></div>
              <p className="mt-4 text-gray-600 font-medium">
                Loading events...
              </p>
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <p className="text-red-500 font-medium">{error}</p>
              <button
                className="mt-4 px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 shadow-sm hover:shadow-md font-medium cursor-pointer"
                onClick={() => window.location.reload()}
              >
                Try Again
              </button>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-600 font-medium">
                No events found matching your criteria.
              </p>
              {(searchQuery || categoryFilter) && (
                <button
                  className="mt-4 px-6 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md font-medium cursor-pointer"
                  onClick={() => {
                    setSearchQuery("");
                    setCategoryFilter("");
                  }}
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : showAllEvents ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredEvents.map((event) => (
                <EventCard
                  key={event._id || event.id || `event-${Math.random()}`}
                  event={event}
                />
              ))}
            </div>
          ) : (
            <>
              <EventSection
                title="Recommended"
                events={categorizedEvents.recommended}
                category=""
              />
              <EventSection
                title="Hackathons"
                events={categorizedEvents.hackathons}
                category="hackathon"
              />
              <EventSection
                title="Network Events"
                events={categorizedEvents.network}
                category="network"
              />
              <EventSection
                title="The best of live events"
                events={categorizedEvents.live}
                category="entertainment"
              />

              {/* Category Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
                {[
                  {
                    title: "Comedy Shows",
                    color: "from-pink-500 to-purple-600",
                    icon: "🎭",
                  },
                  {
                    title: "Theatre Shows",
                    color: "from-blue-500 to-cyan-600",
                    icon: "🎪",
                  },
                  {
                    title: "Workshops & More",
                    color: "from-red-500 to-pink-600",
                    icon: "🛠️",
                  },
                  {
                    title: "Upskill & Training",
                    color: "from-orange-500 to-yellow-600",
                    icon: "📚",
                  },
                ].map((category, index) => (
                  <div
                    key={index}
                    className={`bg-gradient-to-br ${category.color} rounded-2xl p-8 text-white cursor-pointer hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl group`}
                  >
                    <div className="text-4xl mb-3 transform group-hover:scale-110 transition-transform duration-300">
                      {category.icon}
                    </div>
                    <h3 className="font-bold text-xl">{category.title}</h3>
                  </div>
                ))}
              </div>

              <footer className="mt-12">
                <FooterBlock />
              </footer>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventListingPage;
