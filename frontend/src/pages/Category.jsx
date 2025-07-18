import React, { useState } from 'react';
import Sidebar from "../components/common/Navbar";
import { useAuth } from "../context/AuthContext";
import { FooterBlock } from "./BhoomiLandingPage/sections/FooterBlock";
const Category = () => {
    const { user, logout } = useAuth();
    const [currentView, setCurrentView] = useState('categories');
    const [selectedCategory, setSelectedCategory] = useState('');

    const categories = [
        {
            id: 'Technology',
            title: 'Technology',
            icon: '💻',
            description: 'Explore cutting-edge tech events, hackathons, and innovation meetups'
        },
        {
            id: 'Arts & Culture',
            title: 'Arts & Culture',
            icon: '🎨',
            description: 'Immerse yourself in creative exhibitions, performances, and cultural celebrations'
        },
        {
            id: 'Social',
            title: 'Social',
            icon: '🤝',
            description: 'Connect with like-minded people through networking and community events'
        },
        {
            id: 'Workshops',
            title: 'Workshops',
            icon: '🛠️',
            description: 'Learn new skills through hands-on workshops and training sessions'
        },
        {
            id: 'Conferences',
            title: 'Conferences',
            icon: '🎤',
            description: 'Attend professional conferences and industry summits'
        },
        {
            id: 'Gaming',
            title: 'Gaming',
            icon: '🎮',
            description: 'Join gaming tournaments, esports events, and game development meetups'
        }
    ];

    const eventsData = {
        'Technology': [
            {
                "title": "Speaker Series - Ms. Banu Mushtaq (Author, International Booker Prize ’25, Lawyer & Activist)",
                "date": "August 2, 2025",
                "time": "2:00 PM onwards",
                "location": "IIM Bangalore Auditorium, Bangalore, India",
                "description": "A session featuring Ms. Banu Mushtaq - acclaimed author recognized by the International Booker Prize ’25, practicing lawyer, and human rights activist – as part of the VENIX 2025 Speaker Series at IIM Bangalore.",
                "image": "https://d8it4huxumps7.cloudfront.net/uploads/images/opportunity/banner/6879cdec87b17_speaker-series-ms-banu-mushtaq-author-intl-booker-prize25-lawyer-and-activist.webp?d=1920x557",
                "price": "Free",
                "attendees": "Open to IIM Bangalore community & invited guests",
                "category": "Speaker Series",
                "redirectUrl": "https://unstop.com/conferences/speaker-series-ms-banu-mushtaq-author-intl-booker-prize25-lawyer-and-activist-venix-2025-iim-bangalores-inte-1519185"
            },

            {
                title: 'Web Development Bootcamp',
                date: 'August 5, 2025',
                time: '10:00 AM - 4:00 PM',
                location: 'Online Event',
                description: 'Intensive 3-day bootcamp covering modern web development technologies including React, Node.js, and cloud deployment.',
                image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=250&fit=crop&crop=center',
                price: '$199',
                attendees: '200+ attendees',
                category: 'Workshop',
                redirectUrl: '/events/ai-machine-learning-summit'
            },
            {
                title: 'Blockchain Innovation Conference',
                date: 'August 12, 2025',
                time: '8:30 AM - 5:00 PM',
                location: 'Crypto Center, Austin',
                description: 'Explore the latest developments in blockchain technology, cryptocurrencies, and decentralized applications.',
                image: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400&h=250&fit=crop&crop=center',
                price: '$399',
                attendees: '800+ attendees',
                category: 'Conference',
                redirectUrl: '/events/ai-machine-learning-summit'
            },
            {
                title: 'Mobile App Development Workshop',
                date: 'August 18, 2025',
                time: '11:00 AM - 5:00 PM',
                location: 'Innovation Lab, Seattle',
                description: 'Learn to build mobile applications using React Native and Flutter with hands-on projects.',
                image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=250&fit=crop&crop=center',
                price: '$149',
                attendees: '150+ attendees',
                category: 'Workshop',
                redirectUrl: '/events/ai-machine-learning-summit'
            }
        ],
        'Arts & Culture': [
            {
                title: 'Modern Art Exhibition',
                date: 'July 30, 2025',
                time: '10:00 AM - 8:00 PM',
                location: 'Metropolitan Museum, New York',
                description: 'Discover contemporary artworks from emerging artists around the world in this month-long exhibition.',
                image: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=250&fit=crop&crop=center',
                price: '$25',
                attendees: '1000+ visitors',
                category: 'Exhibition',
                redirectUrl: '/events/ai-machine-learning-summit'
            },
            {
                title: 'Cultural Heritage Festival',
                date: 'August 8, 2025',
                time: '12:00 PM - 10:00 PM',
                location: 'Central Park, New York',
                description: 'Celebrate diverse cultures through music, dance, food, and traditional performances.',
                image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=400&h=250&fit=crop&crop=center',
                price: 'Free',
                attendees: '5000+ visitors',
                category: 'Festival',
                redirectUrl: '/events/ai-machine-learning-summit'
            },
            {
                title: 'Photography Workshop',
                date: 'August 15, 2025',
                time: '9:00 AM - 3:00 PM',
                location: 'Art Studio, Los Angeles',
                description: 'Master the art of photography with professional techniques and equipment training.',
                image: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400&h=250&fit=crop&crop=center',
                price: '$89',
                attendees: '30+ participants',
                category: 'Workshop',
                redirectUrl: '/events/ai-machine-learning-summit'
            }
        ],
        'Social': [
            {
                title: 'Networking Night',
                date: 'July 28, 2025',
                time: '6:00 PM - 9:00 PM',
                location: 'Business Center, Chicago',
                description: 'Connect with professionals from various industries in a relaxed, friendly environment.',
                image: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=400&h=250&fit=crop&crop=center',
                price: '$45',
                attendees: '200+ professionals',
                category: 'Networking',
                redirectUrl: '/events/ai-machine-learning-summit'
            },
            {
                title: 'Community Volunteer Day',
                date: 'August 3, 2025',
                time: '8:00 AM - 4:00 PM',
                location: 'Local Community Center',
                description: 'Join fellow volunteers in making a positive impact in our local community.',
                image: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=400&h=250&fit=crop&crop=center',
                price: 'Free',
                attendees: '300+ volunteers',
                category: 'Community',
                redirectUrl: '/events/ai-machine-learning-summit'
            },
            {
                title: 'Speed Networking Event',
                date: 'August 10, 2025',
                time: '5:30 PM - 8:30 PM',
                location: 'Startup Hub, San Francisco',
                description: 'Meet new people and expand your professional network through structured speed networking.',
                image: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=400&h=250&fit=crop&crop=center',
                price: '$35',
                attendees: '150+ professionals',
                category: 'Networking',
                redirectUrl: '/events/ai-machine-learning-summit'
            }
        ],
        'Workshops': [
            {
                "title": "AI & Me: How Smart Tech Is Supercharging My Career",
                "date": "July 2025 (specific date not listed)",
                "time": "Not specified",
                "location": "Online (pre‑graduation)",
                "description": "A session for aspiring engineers about how smart technologies are accelerating career growth by blending tech with leadership and business insight.",
                "image": "https://d8it4huxumps7.cloudfront.net/uploads/images/150x150/687a4ed99c912_61f3e96c6eb18_whatsapp_image_2021-11-17_at_17.56.21.png?d=200x200",
                "price": "Not specified",
                "attendees": "Targeted at pre‑graduate students",
                "category": "Webinar / Workshop",
                "redirectUrl": "https://unstop.com/workshops-webinars/ai-me-how-smart-tech-is-supercharging-my-career-pregrad-1526029"
            },
            {
                "title": "Generative AI Explained: The Smart Assistant That Creates Everything",
                "date": "July 2025 (specific date not listed)",
                "time": "Not specified",
                "location": "Online (pre‑graduation)",
                "description": "An introductory session on how generative AI functions as an intelligent assistant capable of creating content across formats.",
                "image": "https://d8it4huxumps7.cloudfront.net/uploads/images/opportunity/banner/687a5c561e3a4_generative-ai-explained-the-smart-assistant-that-creates-everything.webp?d=1920x557",
                "price": "Not specified",
                "attendees": "Targeted at pre‑graduate students",
                "category": "Webinar / Workshop",
                "redirectUrl": "https://unstop.com/workshops-webinars/generative-ai-explained-the-smart-assistant-that-creates-everything-pregrad-1526024"
            },
            {
                "title": "Workshop Series: Office + AI Combo – AI‑Powered Excel, Visual Storytelling Through Presentations",
                "date": "July 2025 (specific date not listed)",
                "time": "Not specified",
                "location": "Online (part of Venix 2025)",
                "description": "Two‑part online workshop featuring AI‑enhanced Excel functionalities and presentation storytelling powered by AI tools.",
                "image": "https://d8it4huxumps7.cloudfront.net/uploads/images/opportunity/banner/6879196a39017_workshop-series-office-ai-combo-ai-powered-excel-visual-storytelling-through-presentations.webp?d=1920x557",
                "price": "Purchasing required (price not displayed)",
                "attendees": "Open to Venix 2025 participants",
                "category": "Workshop Series",
                "redirectUrl": "https://unstop.com/workshops-webinars/workshop-series-office-ai-combo-ai-powered-excel-visual-storytelling-through-presentations-venix-2025-1524849"
            },
            {
                "title": "BGMI Gaming Event – IIIT Delhi",
                "date": "July 23, 2025",
                "time": "Not specified",
                "location": "A007, RnD Building, Indraprastha Institute of Information Technology Delhi",
                "description": "On‑campus BGMI gaming event expected to draw enthusiastic gamers and tech students.",
                "image": "https://d8it4huxumps7.cloudfront.net/uploads/images/opportunity/banner/6878cb72eb357_bgmi-gaming-event.webp?d=1920x557",
                "price": "Not specified",
                "attendees": "Expected 80+ attendees",
                "category": "Gaming Event / Workshop",
                "redirectUrl": "https://unstop.com/workshops-webinars/bgmi-gaming-event-indraprastha-institute-of-information-technology-iiit-delhi-1525004"
            }
        ],
        'Conferences': [
            {
                title: 'Future of Business Conference',
                date: 'August 1, 2025',
                time: '8:00 AM - 6:00 PM',
                location: 'Convention Center, Miami',
                description: 'Industry leaders discuss emerging trends and the future of business in a post-digital world.',
                image: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=400&h=250&fit=crop&crop=center',
                price: '$450',
                attendees: '1200+ attendees',
                category: 'Conference',
                redirectUrl: '/events/ai-machine-learning-summit'
            },
            {
                title: 'Healthcare Innovation Summit',
                date: 'August 9, 2025',
                time: '9:00 AM - 5:00 PM',
                location: 'Medical Center, Houston',
                description: 'Explore breakthrough innovations in healthcare technology and patient care.',
                image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400&h=250&fit=crop&crop=center',
                price: '$350',
                attendees: '800+ professionals',
                category: 'Summit',
                redirectUrl: '/events/ai-machine-learning-summit'
            },
            {
                title: 'Sustainability & Environment Conference',
                date: 'August 16, 2025',
                time: '8:30 AM - 6:30 PM',
                location: 'Green Building, Portland',
                description: 'Discuss sustainable practices and environmental solutions with industry experts.',
                image: 'https://images.unsplash.com/photo-1569163139394-de4e4f43e4e3?w=400&h=250&fit=crop&crop=center',
                price: '$280',
                attendees: '600+ attendees',
                category: 'Conference',
                redirectUrl: '/events/ai-machine-learning-summit'
            }
        ],
        'Gaming': [
            {
                title: 'Esports Championship',
                date: 'July 26, 2025',
                time: '2:00 PM - 11:00 PM',
                location: 'Gaming Arena, Las Vegas',
                description: 'Watch top esports teams compete in popular games with exciting prize pools.',
                image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=250&fit=crop&crop=center',
                price: '$75',
                attendees: '2000+ fans',
                category: 'Tournament',
                redirectUrl: '/events/ai-machine-learning-summit'
            },
            {
                title: 'Game Development Meetup',
                date: 'August 4, 2025',
                time: '6:00 PM - 9:00 PM',
                location: 'Game Studio, Los Angeles',
                description: 'Connect with game developers and learn about the latest tools and techniques.',
                image: 'https://images.unsplash.com/photo-1556438064-2d7646166914?w=400&h=250&fit=crop&crop=center',
                price: '$25',
                attendees: '120+ developers',
                category: 'Meetup',
                redirectUrl: '/events/ai-machine-learning-summit'
            },
            {
                title: 'Retro Gaming Convention',
                date: 'August 11, 2025',
                time: '10:00 AM - 8:00 PM',
                location: 'Convention Hall, Orlando',
                description: 'Celebrate classic games with tournaments, exhibitions, and special guest appearances.',
                image: 'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=400&h=250&fit=crop&crop=center',
                price: '$40',
                attendees: '3000+ gamers',
                category: 'Convention',
                redirectUrl: '/events/ai-machine-learning-summit'
            }
        ]
    };

    const handleCategoryClick = (categoryId) => {
        setSelectedCategory(categoryId);
        setCurrentView('events');
    };

    const handleBackClick = () => {
        setCurrentView('categories');
        setSelectedCategory('');
    };

    const CategoryCard = ({ category, index }) => (
        <div
            className={`category-card animate-fade-in-up`}
            style={{ animationDelay: `${index * 0.1}s` }}
            onClick={() => handleCategoryClick(category.id)}
        >
            <span className="category-icon">{category.icon}</span>
            <h3 className="category-title">{category.title}</h3>
            <p className="category-description">{category.description}</p>
        </div>
    );

    const EventCard = ({ event, index }) => (
        <div
            className="event-card animate-fade-in-up"
            style={{ animationDelay: `${index * 0.1}s` }}
        >
            <div className="event-image-container">
                <img
                    src={event.image}
                    alt={event.title}
                    className="event-image"
                />
                <div className="event-category-badge">
                    {event.category}
                </div>
            </div>

            <div className="event-content">
                <h3 className="event-title">{event.title}</h3>

                <div className="event-meta">
                    <div className="event-date">
                        <span className="event-meta-icon">📅</span>
                        {event.date}
                    </div>
                    <div className="event-time">
                        <span className="event-meta-icon">⏰</span>
                        {event.time}
                    </div>
                </div>

                <div className="event-location">
                    <span className="event-meta-icon">📍</span>
                    {event.location}
                </div>

                <p className="event-description">{event.description}</p>

                <div className="event-footer">
                    <div className="event-attendees">
                        <span className="event-meta-icon">👥</span>
                        {event.attendees}
                    </div>

                    <div className="event-actions">
                        <button className="btn-primary" onClick={() => window.open(event.redirectUrl, '_blank')} >View</button>
                    </div>
                </div>
            </div>
        </div>
    );

    const CategoriesPage = () => (
        <div className="animate-fade-in">
            <div className="header">
                <h1 className="animate-fade-in-down">Event Categories</h1>
                <p className="animate-fade-in-down" style={{ animationDelay: '0.2s' }}>
                    Discover amazing events across different categories
                </p>
            </div>

            <div className="categories-grid">
                {categories.map((category, index) => (
                    <CategoryCard key={category.id} category={category} index={index} />
                ))}
            </div>
        </div>
    );

    const EventsPage = () => {
        const events = eventsData[selectedCategory] || [];

        return (
            <div className="animate-fade-in">
                <div className="header">
                    <h1 className="animate-fade-in-down">{selectedCategory} Events</h1>
                    <p className="animate-fade-in-down" style={{ animationDelay: '0.2s' }}>
                        Discover amazing {selectedCategory.toLowerCase()} events
                    </p>
                </div>

                <div className="events-grid">
                    {events.length === 0 ? (
                        <div className="no-events">
                            No events found in this category yet. Check back soon!
                        </div>
                    ) : (
                        events.map((event, index) => (
                            <EventCard key={index} event={event} index={index} />
                        ))
                    )}
                </div>
            </div>
        );
    };

    return (<>
        <Sidebar user={user || {}} onLogout={logout} />
        <div className="min-h-screen bg-gradient-to-br mt-10 from-green-50 to-green-100 text-green-900">
            <style jsx>{`
        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .animate-fade-in-down {
          animation: fadeInDown 0.8s ease-out;
        }

        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out;
        }

        .animate-fade-in {
          animation: fadeIn 0.5s ease-out;
        }

        .category-card {
          background: rgba(255, 255, 255, 0.8);
          border-radius: 20px;
          padding: 40px 30px;
          text-align: center;
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          border: 2px solid transparent;
          backdrop-filter: blur(10px);
          position: relative;
          overflow: hidden;
        }

        .category-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(123, 184, 123, 0.1), transparent);
          transition: left 0.6s ease;
        }

        .category-card:hover::before {
          left: 100%;
        }

        .category-card:hover {
          transform: translateY(-10px) scale(1.02);
          box-shadow: 0 20px 40px rgba(123, 184, 123, 0.2);
          border-color: #7bb87b;
          background: rgba(255, 255, 255, 0.95);
        }

        .category-icon {
          font-size: 3.5rem;
          margin-bottom: 20px;
          display: block;
          transition: transform 0.3s ease;
        }

        .category-card:hover .category-icon {
          transform: scale(1.1) rotate(5deg);
        }

        .category-title {
          font-size: 1.6rem;
          font-weight: 700;
          color: #2d5a2d;
          margin-bottom: 15px;
          transition: color 0.3s ease;
        }

        .category-description {
          color: #4a7c4a;
          opacity: 0.8;
          line-height: 1.6;
          transition: opacity 0.3s ease;
        }

        .category-card:hover .category-description {
          opacity: 1;
        }

        .event-card {
          background: rgba(255, 255, 255, 0.95);
          border-radius: 20px;
          overflow: hidden;
          border: 2px solid transparent;
          transition: all 0.4s ease;
          cursor: pointer;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        }

        .event-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(123, 184, 123, 0.15);
          border-color: #7bb87b;
        }

        .event-image-container {
          position: relative;
          width: 100%;
          height: 200px;
          overflow: hidden;
        }

        .event-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.4s ease;
        }

        .event-card:hover .event-image {
          transform: scale(1.05);
        }

        .event-category-badge {
          position: absolute;
          top: 12px;
          left: 12px;
          background: rgba(45, 90, 45, 0.9);
          color: white;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
          backdrop-filter: blur(10px);
        }

        .event-price-badge {
          position: absolute;
          top: 12px;
          right: 12px;
          background: rgba(123, 184, 123, 0.95);
          color: white;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 0.9rem;
          font-weight: 700;
          backdrop-filter: blur(10px);
        }

        .event-content {
          padding: 25px;
        }

        .event-title {
          font-size: 1.4rem;
          font-weight: 700;
          color: #2d5a2d;
          margin-bottom: 15px;
          line-height: 1.3;
        }

        .event-meta {
          display: flex;
          gap: 20px;
          margin-bottom: 12px;
          flex-wrap: wrap;
        }

        .event-date {
          color: #7bb87b;
          font-weight: 600;
          font-size: 0.9rem;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .event-time {
          color: #5a7a5a;
          font-weight: 500;
          font-size: 0.9rem;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .event-location {
          color: #4a7c4a;
          font-size: 0.9rem;
          margin-bottom: 15px;
          display: flex;
          align-items: center;
          gap: 6px;
          font-weight: 500;
        }

        .event-meta-icon {
          font-size: 0.8rem;
          opacity: 0.8;
        }

        .event-description {
          color: #5a7a5a;
          line-height: 1.6;
          font-size: 0.95rem;
          margin-bottom: 20px;
        }

        .event-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 15px;
          border-top: 1px solid rgba(123, 184, 123, 0.2);
        }

        .event-attendees {
          color: #4a7c4a;
          font-size: 0.85rem;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .event-actions {
          display: flex;
          gap: 10px;
        }

        .btn-primary {
          background: linear-gradient(135deg, #7bb87b, #5a9a5a);
          color: white;
          border: none;
          padding: 8px 20px;
          border-radius: 20px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 1rem;
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(123, 184, 123, 0.4);
        }

        .btn-secondary {
          background: rgba(123, 184, 123, 0.1);
          color: #2d5a2d;
          border: 2px solid #7bb87b;
          padding: 8px 20px;
          border-radius: 20px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 0.9rem;
        }

        .btn-secondary:hover {
          background: #7bb87b;
          color: white;
          transform: translateY(-2px);
        }

        .no-events {
          text-align: center;
          color: #4a7c4a;
          font-style: italic;
          margin-top: 50px;
          font-size: 1.1rem;
          grid-column: 1 / -1;
        }

        .header {
          text-align: center;
          margin-bottom: 40px;
        }

        .header h1 {
          font-size: 3rem;
          color: #2d5a2d;
          margin-bottom: 10px;
          text-shadow: 2px 2px 4px rgba(45, 90, 45, 0.1);
        }

        .header p {
          font-size: 1.2rem;
          color: #4a7c4a;
          opacity: 0.8;
        }

        .categories-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 30px;
          margin-top: 40px;
        }

        .events-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 30px;
          margin-top: 30px;
        }

        @media (max-width: 768px) {
          .header h1 {
            font-size: 2.5rem;
          }
          
          .categories-grid {
            grid-template-columns: 1fr;
            gap: 20px;
          }
          
          .category-card {
            padding: 30px 20px;
          }
          
          .events-grid {
            grid-template-columns: 1fr;
          }

          .event-meta {
            flex-direction: column;
            gap: 8px;
          }

          .event-footer {
            flex-direction: column;
            gap: 15px;
            align-items: stretch;
          }

          .event-actions {
            justify-content: center;
          }
        }
      `}</style>

            <div className="max-w-7xl mx-auto p-5">
                {/* Back Button */}
                {currentView === 'events' && (
                    <button
                        onClick={handleBackClick}
                        className="cursor-pointer fixed top-24 left-5 z-50 bg-green-100 bg-opacity-50 border-2 border-green-300 text-green-800 px-5 py-2 rounded-full font-semibold transition-all duration-300 hover:bg-green-300 hover:text-white hover:-translate-y-1 hover:shadow-lg backdrop-blur-sm"
                    >
                        ← Back to Categories
                    </button>
                )}

                {/* Main Content */}
                {currentView === 'categories' ? <CategoriesPage /> : <EventsPage />}
            </div>
        </div>
        <FooterBlock />
    </>
    );
};

export default Category;