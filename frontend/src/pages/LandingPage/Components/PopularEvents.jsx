import React, { useState } from 'react';

const TABS = [
  { label: 'Today', key: 'today' },
  { label: 'This Week', key: 'week' },
  { label: 'This Weekend', key: 'weekend' },
];

const EVENTS = {
  today: [
    {
      title: 'Jo Bolta Hai Vahi Hota Hai',
      venue: 'CSJM Audi, Kanpur',
      org: 'The XYZ entertainment',
      price: 'INR 299',
      img: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&q=80',
    },
    {
      title: 'The Grand DJ Night',
      venue: 'Talkatora, Delhi',
      org: 'The XYZ entertainment',
      price: 'INR 199',
      img: 'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=400&q=80',
    },
    {
      title: 'Radha Rani Mahotsav',
      venue: 'ISKCON, Goa',
      org: 'The XYZ entertainment',
      price: 'Free',
      img: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80',
    },
    {
      title: 'Jo Bolta Hai Vahi Hota Hai',
      venue: 'CSJM Audi, Kanpur',
      org: 'The XYZ entertainment',
      price: 'INR 299',
      img: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=400&q=80',
    },
  ],
  week: [
    {
      title: 'Standup Night',
      venue: 'Auditorium, Mumbai',
      org: 'The XYZ entertainment',
      price: 'INR 399',
      img: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80',
    },
    {
      title: 'Music Fest',
      venue: 'Open Grounds, Pune',
      org: 'The XYZ entertainment',
      price: 'INR 499',
      img: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=400&q=80',
    },
    {
      title: 'Art Carnival',
      venue: 'Art Gallery, Bangalore',
      org: 'The XYZ entertainment',
      price: 'Free',
      img: 'https://images.unsplash.com/photo-1465101178521-c1a9136a3b99?auto=format&fit=crop&w=400&q=80',
    },
    {
      title: 'Tech Expo',
      venue: 'Tech Park, Hyderabad',
      org: 'The XYZ entertainment',
      price: 'INR 299',
      img: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80',
    },
  ],
  weekend: [
    {
      title: 'Weekend Bash',
      venue: 'Beachside, Goa',
      org: 'The XYZ entertainment',
      price: 'INR 599',
      img: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80',
    },
    {
      title: 'Food Fest',
      venue: 'Central Park, Lucknow',
      org: 'The XYZ entertainment',
      price: 'INR 99',
      img: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&q=80',
    },
    {
      title: 'Book Fair',
      venue: 'Expo Center, Delhi',
      org: 'The XYZ entertainment',
      price: 'Free',
      img: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=400&q=80',
    },
    {
      title: 'Startup Meetup',
      venue: 'Cowork Hub, Bangalore',
      org: 'The XYZ entertainment',
      price: 'INR 199',
      img: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=400&q=80',
    },
  ],
};

const PopularEvents = () => {
  const [activeTab, setActiveTab] = useState('today');
  const events = EVENTS[activeTab];

  return (
    <section className="w-full py-10 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        {/* Heading */}
        <h2 className="text-2xl md:text-3xl font-bold text-black mb-2">
          Popular Events in (Your Location)
        </h2>
        {/* Tabs */}
        <div className="flex space-x-6 border-b border-gray-200 mb-6 mt-2">
          {TABS.map(tab => (
            <button
              key={tab.key}
              className={`py-2 px-1 text-base font-semibold focus:outline-none border-b-2 transition-colors duration-150 ${activeTab === tab.key ? 'border-black text-black' : 'border-transparent text-gray-500 hover:text-black'}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        {/* Event Cards Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          {events.map((event, idx) => (
            <div key={idx} className="bg-white border border-gray-300 rounded-lg overflow-hidden flex flex-col shadow-sm">
              <div className="h-28 md:h-32 w-full bg-gray-200">
                <img src={event.img} alt={event.title} className="object-cover w-full h-full" />
              </div>
              <div className="p-3 flex-1 flex flex-col justify-between">
                <div>
                  <div className="font-semibold text-sm md:text-base mb-1 line-clamp-2">{event.title}</div>
                  <div className="text-xs text-gray-600 mb-1">Venue: {event.venue}</div>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-gray-400">{event.org}</span>
                  <span className={`text-xs px-2 py-1 rounded-full border ${event.price === 'Free' ? 'border-green-400 text-green-600' : 'border-green-300 text-green-700'}`}>{event.price}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        {/* Empty boxes and View all */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="h-32 bg-white border border-gray-300 rounded-lg"></div>
          <div className="h-32 bg-white border border-gray-300 rounded-lg"></div>
          <div className="h-32 bg-white border border-gray-300 rounded-lg"></div>
          <div className="h-32 bg-white border border-gray-300 rounded-lg flex items-center justify-center">
            <span className="text-lg font-semibold text-black">View all</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PopularEvents; 