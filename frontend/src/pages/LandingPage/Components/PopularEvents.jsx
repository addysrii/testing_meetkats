import React, { useState, useEffect } from "react";
import eventService from "../../../services/eventService";
import { Link } from "react-router-dom";

const TABS = [
  { label: "Today", key: "today" },
  { label: "This Week", key: "week" },
  { label: "This Weekend", key: "weekend" },
];

const PopularEvents = () => {
  const [activeTab, setActiveTab] = useState("today");
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      // Simple approach - just get upcoming events like EventListingPage
      const apiFilters = {
        filter: "upcoming",
      };

      console.log("Fetching events with filters:", apiFilters);

      const response = await eventService.getEvents(apiFilters);
      console.log("API Response:", response);

      // Use the same response processing as EventListingPage
      const eventsData = response.events || response.data || [];
      console.log("Events data:", eventsData);
      console.log("Number of events:", eventsData.length);

      setEvents(eventsData);
      setError(null);
    } catch (err) {
      console.error("Error fetching events:", err);
      setError("Failed to load events");
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [activeTab]);

  const handleTabChange = (tabKey) => {
    setActiveTab(tabKey);
  };

  if (loading) {
    return (
      <section className="w-full py-10 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-black mb-2">
            Popular Events in (Your Location)
          </h2>
          <div className="flex space-x-6 border-b border-gray-200 mb-6 mt-2">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                className={`py-2 px-1 text-base font-semibold focus:outline-none border-b-2 transition-colors duration-150 ${
                  activeTab === tab.key
                    ? "border-black text-black"
                    : "border-transparent text-gray-500 hover:text-black"
                }`}
                onClick={() => handleTabChange(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, idx) => (
              <div
                key={idx}
                className="bg-white border border-gray-300 rounded-lg overflow-hidden flex flex-col shadow-sm animate-pulse"
              >
                <div className="h-28 md:h-32 w-full bg-gray-200"></div>
                <div className="p-3 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded mb-1"></div>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                    <div className="h-6 bg-gray-200 rounded w-12"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full py-10 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        {/* Heading */}
        <h2 className="text-2xl md:text-3xl font-bold text-black mb-2">
          Popular Events in (Your Location)
        </h2>
        {/* Tabs */}
        <div className="flex space-x-6 border-b border-gray-200 mb-6 mt-2">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              className={`py-2 px-1 text-base font-semibold focus:outline-none border-b-2 transition-colors duration-150 ${
                activeTab === tab.key
                  ? "border-black text-black"
                  : "border-transparent text-gray-500 hover:text-black"
              }`}
              onClick={() => handleTabChange(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {error ? (
          <div className="text-center py-8">
            <p className="text-gray-500">{error}</p>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">
              No events found for this time period.
            </p>
            <p className="text-sm text-gray-400 mt-2">
              Try switching to a different tab or check back later.
            </p>
          </div>
        ) : (
          <>
            {/* Event Cards Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
              {events.slice(0, 4).map((event, idx) => (
                <Link
                  key={event._id || event.id || idx}
                  to={`/events/${event._id || event.id}`}
                  className="bg-white border border-gray-300 rounded-lg overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-shadow duration-300 cursor-pointer"
                >
                  <div className="h-28 md:h-32 w-full bg-gray-200">
                    <img
                      src={event.coverImage?.url || "/api/placeholder/400/200"}
                      alt={event.name || "Event"}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div className="p-3 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="font-semibold text-sm md:text-base mb-1 line-clamp-2">
                        {event.name || "Untitled Event"}
                      </div>
                      <div className="text-xs text-gray-600 mb-1">
                        Venue:{" "}
                        {event.virtual
                          ? "Virtual Event"
                          : event.location?.name || "Location TBA"}
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-400">
                        {event.organizer?.name ||
                          event.creator?.name ||
                          "Organizer"}
                      </span>
                      <span
                        className={`text-xs px-2 py-1 rounded-full border ${
                          event.ticketPrice === 0 ||
                          event.ticketPrice === "Free"
                            ? "border-green-400 text-green-600"
                            : "border-green-300 text-green-700"
                        }`}
                      >
                        {event.ticketPrice === 0 || event.ticketPrice === "Free"
                          ? "Free"
                          : `₹${event.ticketPrice || "TBA"}`}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            {/* Empty boxes and View all */}
          </>
        )}
      </div>
    </section>
  );
};

export default PopularEvents;
