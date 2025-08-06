import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Users,
  Instagram ,
  Linkedin , 
  Ticket, 
  TrendingUp, 
  Search, 
  MapPin, 
  Clock, 
  Star, 
  MessageCircle, 
  Smartphone,
  BarChart3,
  CreditCard,
  Shield,
  Zap,
  Heart,
  Twitter,
  ChevronRight,
  Play,
  Menu,
  X,
  CheckCircle,
  ArrowRight
} from 'lucide-react';

function LandPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [activeTab, setActiveTab] = useState('attendees');

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const featuredEvents = [
    {
      id: 1,
      title: "ByteBattle",
      date: "June 1, 2025",
      time: "9:00 AM",
      location: "Kanpur, Uttar Pradesh",
      image: "https://images.pexels.com/photos/2608517/pexels-photo-2608517.jpeg?auto=compress&cs=tinysrgb&w=800",
      price: "Free",
      attendees: 250,
      category: "Technology"
    },
    {
      id: 2,
      title: "Creative Design Workshop",
      date: "March 22, 2025",
      time: "2:00 PM",
      location: "Kanpur, Uttar Pradesh",
      image: "https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg?auto=compress&cs=tinysrgb&w=800",
      price: "$45",
      attendees: 120,
      category: "Design"
    },
    {
      id: 3,
      title: "Startup Networking Mixer",
      date: "March 28, 2025",
      time: "6:30 PM",
      location: "Kanpur, Uttar Pradesh",
      image: "https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg?auto=compress&cs=tinysrgb&w=800",
      price: "Free",
      attendees: 180,
      category: "Networking"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Event Attendee",
      image: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150",
      content: "MeetKats made it so easy to discover amazing events in my area. The MeetKats Lounge community is incredibly welcoming!",
      rating: 5
    },
    {
      name: "Michael Chen",
      role: "Event Organizer",
      image: "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150",
      content: "The platform's analytics and ticket management tools helped me grow my events from 50 to 500+ attendees.",
      rating: 5
    },
    {
      name: "Emily Rodriguez",
      role: "Community Member",
      image: "https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=150",
      content: "Being part of MeetKats Lounge has connected me with like-minded people and incredible opportunities.",
      rating: 5
    }
  ];

  const benefits = [
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Lightning Fast Setup",
      description: "Create and publish your event in under 5 minutes with our intuitive tools."
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Secure Payments",
      description: "Bank-level security for all transactions with instant payouts to organizers."
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Powerful Analytics",
      description: "Track attendance, revenue, and engagement with detailed insights."
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: "Community Driven",
      description: "Join MeetKats Lounge and connect with thousands of event enthusiasts."
    }
  ];

  return (
    <div className="min-h-screen bg-white font-inter">
      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrollY > 50 ? 'bg-white/95 backdrop-blur-md shadow-lg' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg flex items-center justify-center">
                <img src="/mainlogo.png" className="text-white font-bold text-xl"/>
              </div>
              <span className="text-2xl font-bold text-gray-900">MeetKats</span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#events" className="text-gray-700 hover:text-emerald-600 transition-colors">Events</a>
              <a href="#community" className="text-gray-700 hover:text-emerald-600 transition-colors">Community</a>
              <a href="#features" className="text-gray-700 hover:text-emerald-600 transition-colors">For Organizers</a>
              <button className="cursor-pointer text-gray-700 hover:text-emerald-600 transition-colors" onClick={()=>{window.location.href="/login"}}>Login</button>
              <button className="cursor-pointer bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition-colors" onClick={()=>{window.location.href="/signup"}}>
                Get Started
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200">
            <div className="px-4 py-2 space-y-2">
              <a href="#events" className="block py-2 text-gray-700 hover:text-emerald-600">Events</a>
              <a href="#community" className="block py-2 text-gray-700 hover:text-emerald-600">Community</a>
              <a href="#organizers" className="block py-2 text-gray-700 hover:text-emerald-600">For Organizers</a>
              <button className="block w-full text-left py-2 text-gray-700 hover:text-emerald-600">Login</button>
              <button className="w-full bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors mt-2">
                Get Started
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-white to-emerald-50"></div>
        <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg?auto=compress&cs=tinysrgb&w=1920')] bg-cover bg-center opacity-5"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-fade-in-up">
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
              Discover Events,
              <span className="text-emerald-600 block">Create Experiences</span>
            </h1>
            <p className="text-xl md:text-2xl z-10 text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Join MeetKats and connect with thousands of event enthusiasts. Find amazing events or create your own unforgettable experiences.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <button onClick={()=>{window.location.href="/events"}} className="cursor-pointer group bg-emerald-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-emerald-700 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl flex items-center">
                <Search className="w-5 h-5 mr-2" />
                Find Events
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
              <button onClick={()=>{window.location.href="/events/new"}} className="cursor-pointer group bg-white text-emerald-600 px-8 py-4 rounded-xl text-lg font-semibold border-2 border-emerald-600 hover:bg-emerald-50 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Create Event
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            <div className="flex flex-wrap justify-center items-center gap-8 text-gray-600">
              <div className="flex items-center">
                <Users className="w-5 h-5 text-emerald-600 mr-2" />
                <span>500+ Members</span>
              </div>
              <div className="flex items-center">
                <Calendar className="w-5 h-5 text-emerald-600 mr-2" />
                <span>10+ Events</span>
              </div>
              <div className="flex items-center">
                <Star className="w-5 h-5 text-emerald-600 mr-2" />
                <span>4.9/5 Rating</span>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 z-0 bg-emerald-200 rounded-full opacity-60 animate-float"></div>
        <div className="absolute bottom-20 right-10 w-16 h-16 bg-emerald-300 rounded-full opacity-40 animate-float-delayed"></div>
        <div className="absolute top-3/4 left-1/12 w-12 h-12 z-0 bg-emerald-100 rounded-full opacity-80 animate-float-slow"></div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Everything You Need
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Whether you're looking to attend amazing events or create your own, MeetKats has all the tools you need.
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="flex justify-center mb-12">
            <div className="bg-white p-2 rounded-xl shadow-lg">
              <button
                className={`px-8 py-3 rounded-lg font-semibold transition-all duration-300 ${
                  activeTab === 'attendees'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-emerald-600'
                }`}
                onClick={() => setActiveTab('attendees')}
              >
                For Attendees
              </button>
              <button
                className={`px-8 py-3 rounded-lg font-semibold transition-all duration-300 ${
                  activeTab === 'organizers'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-emerald-600'
                }`}
                onClick={() => setActiveTab('organizers')}
              >
                For Organizers
              </button>
            </div>
          </div>

          {/* Attendees Features */}
          {activeTab === 'attendees' && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-in">
              <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                <div className="w-16 h-16 bg-emerald-100 rounded-xl flex items-center justify-center mb-6">
                  <Search className="w-8 h-8 text-emerald-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Discover Events</h3>
                <p className="text-gray-600 mb-6">Find events that match your interests with our smart recommendation engine.</p>
                <ul className="space-y-2">
                  <li className="flex items-center text-gray-600">
                    <CheckCircle className="w-4 h-4 text-emerald-600 mr-2" />
                    Advanced search filters
                  </li>
                  <li className="flex items-center text-gray-600">
                    <CheckCircle className="w-4 h-4 text-emerald-600 mr-2" />
                    Personalized recommendations
                  </li>
                  <li className="flex items-center text-gray-600">
                    <CheckCircle className="w-4 h-4 text-emerald-600 mr-2" />
                    Location-based discovery
                  </li>
                </ul>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                <div className="w-16 h-16 bg-emerald-100 rounded-xl flex items-center justify-center mb-6">
                  <Ticket className="w-8 h-8 text-emerald-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Easy Ticketing</h3>
                <p className="text-gray-600 mb-6">Secure ticket purchases with instant confirmation and digital tickets.</p>
                <ul className="space-y-2">
                  <li className="flex items-center text-gray-600">
                    <CheckCircle className="w-4 h-4 text-emerald-600 mr-2" />
                    Instant digital tickets
                  </li>
                  <li className="flex items-center text-gray-600">
                    <CheckCircle className="w-4 h-4 text-emerald-600 mr-2" />
                    Secure payment processing
                  </li>
                  <li className="flex items-center text-gray-600">
                    <CheckCircle className="w-4 h-4 text-emerald-600 mr-2" />
                    Mobile wallet integration
                  </li>
                </ul>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                <div className="w-16 h-16 bg-emerald-100 rounded-xl flex items-center justify-center mb-6">
                  <MessageCircle className="w-8 h-8 text-emerald-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Community Access</h3>
                <p className="text-gray-600 mb-6">Join MeetKats Lounge and connect with fellow event enthusiasts.</p>
                <ul className="space-y-2">
                  <li className="flex items-center text-gray-600">
                    <CheckCircle className="w-4 h-4 text-emerald-600 mr-2" />
                    WhatsApp community
                  </li>
                  <li className="flex items-center text-gray-600">
                    <CheckCircle className="w-4 h-4 text-emerald-600 mr-2" />
                    Event discussions
                  </li>
                  <li className="flex items-center text-gray-600">
                    <CheckCircle className="w-4 h-4 text-emerald-600 mr-2" />
                    Networking opportunities
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* Organizers Features */}
          {activeTab === 'organizers' && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-in">
              <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                <div className="w-16 h-16 bg-emerald-100 rounded-xl flex items-center justify-center mb-6">
                  <Calendar className="w-8 h-8 text-emerald-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Event Creation</h3>
                <p className="text-gray-600 mb-6">Create stunning event pages in minutes with our drag-and-drop builder.</p>
                <ul className="space-y-2">
                  <li className="flex items-center text-gray-600">
                    <CheckCircle className="w-4 h-4 text-emerald-600 mr-2" />
                    Drag-and-drop builder
                  </li>
                  <li className="flex items-center text-gray-600">
                    <CheckCircle className="w-4 h-4 text-emerald-600 mr-2" />
                    Custom branding
                  </li>
                  <li className="flex items-center text-gray-600">
                    <CheckCircle className="w-4 h-4 text-emerald-600 mr-2" />
                    Multi-session events
                  </li>
                </ul>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                <div className="w-16 h-16 bg-emerald-100 rounded-xl flex items-center justify-center mb-6">
                  <CreditCard className="w-8 h-8 text-emerald-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Ticket Sales</h3>
                <p className="text-gray-600 mb-6">Flexible ticketing options with real-time sales tracking and instant payouts.</p>
                <ul className="space-y-2">
                  <li className="flex items-center text-gray-600">
                    <CheckCircle className="w-4 h-4 text-emerald-600 mr-2" />
                    Flexible pricing tiers
                  </li>
                  <li className="flex items-center text-gray-600">
                    <CheckCircle className="w-4 h-4 text-emerald-600 mr-2" />
                    Real-time sales tracking
                  </li>
                  <li className="flex items-center text-gray-600">
                    <CheckCircle className="w-4 h-4 text-emerald-600 mr-2" />
                    Instant payouts
                  </li>
                </ul>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                <div className="w-16 h-16 bg-emerald-100 rounded-xl flex items-center justify-center mb-6">
                  <BarChart3 className="w-8 h-8 text-emerald-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Analytics Dashboard</h3>
                <p className="text-gray-600 mb-6">Comprehensive insights to help you understand and grow your audience.</p>
                <ul className="space-y-2">
                  <li className="flex items-center text-gray-600">
                    <CheckCircle className="w-4 h-4 text-emerald-600 mr-2" />
                    Attendee demographics
                  </li>
                  <li className="flex items-center text-gray-600">
                    <CheckCircle className="w-4 h-4 text-emerald-600 mr-2" />
                    Revenue tracking
                  </li>
                  <li className="flex items-center text-gray-600">
                    <CheckCircle className="w-4 h-4 text-emerald-600 mr-2" />
                    Engagement metrics
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Featured Events */}
      <section id="events" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Featured Events
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover trending events happening near you and around the world.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredEvents.map((event) => (
              <div key={event.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group">
                <div className="relative">
                  <img 
                    src={event.image} 
                    alt={event.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 left-4 bg-emerald-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    {event.category}
                  </div>
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-gray-900 px-3 py-1 rounded-full text-sm font-bold">
                    {event.price}
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-emerald-600 transition-colors">
                    {event.title}
                  </h3>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-gray-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span className="text-sm">{event.date}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Clock className="w-4 h-4 mr-2" />
                      <span className="text-sm">{event.time}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span className="text-sm">{event.location}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-gray-600">
                      <Users className="w-4 h-4 mr-1" />
                      <span className="text-sm">{event.attendees} going</span>
                    </div>
                    <button className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors text-sm font-semibold">
                      Get Tickets
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <button onClick={()=>{window.location.href="/events"}} className="cursor-pointer bg-emerald-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-emerald-700 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl">
              View All Events
            </button>
          </div>
        </div>
      </section>

      {/* MeetKats Lounge Community */}
      <section id="community" className="py-20 bg-gradient-to-br from-emerald-50 to-emerald-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center mr-4">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
                  MeetKats Lounge
                </h2>
              </div>
              
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Join our exclusive WhatsApp community where event enthusiasts connect, share experiences, and discover new opportunities together.
              </p>

              <div className="space-y-4 mb-8">
                <div className="flex items-center">
                  <CheckCircle className="w-6 h-6 text-emerald-600 mr-3" />
                  <span className="text-gray-700">Exclusive event previews and early access</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-6 h-6 text-emerald-600 mr-3" />
                  <span className="text-gray-700">Direct networking with fellow attendees</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-6 h-6 text-emerald-600 mr-3" />
                  <span className="text-gray-700">Event recommendations from the community</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-6 h-6 text-emerald-600 mr-3" />
                  <span className="text-gray-700">Special discounts and member-only perks</span>
                </div>
              </div>

              <button onClick={()=>{window.location.href="https://chat.whatsapp.com/LRnaE2vKJnwHcaRXH1pQWr?mode=ac_t"}} className="group cursor-pointer bg-green-500 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-green-600 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl flex items-center">
                <Smartphone className="w-5 h-5 mr-2" />
                Join WhatsApp Community
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            <div className="relative">
              <div className="bg-white p-8 rounded-2xl shadow-2xl">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                    <MessageCircle className="w-6 h-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <h3 className="font-bold text-gray-900">MeetKats Lounge</h3>
                    <p className="text-gray-600 text-sm">5,247 members • Active now</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-gray-100 p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                      <img src="https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=50" alt="Sarah" className="w-8 h-8 rounded-full mr-2" />
                      <span className="font-semibold text-gray-900 text-sm">Sarah</span>
                    </div>
                    <p className="text-gray-700 text-sm">Just attended the Design Workshop - amazing speakers! 🎨</p>
                  </div>

                  <div className="bg-gray-100 p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                      <img src="https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=50" alt="Mike" className="w-8 h-8 rounded-full mr-2" />
                      <span className="font-semibold text-gray-900 text-sm">Mike</span>
                    </div>
                    <p className="text-gray-700 text-sm">Anyone going to the Tech Summit next week? Looking for networking buddies! 💼</p>
                  </div>

                  <div className="bg-emerald-100 p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                      <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center mr-2">
                        <span className="text-white text-xs font-bold">M</span>
                      </div>
                      <span className="font-semibold text-gray-900 text-sm">MeetKats Team</span>
                    </div>
                    <p className="text-gray-700 text-sm">🎉 New event alert: Startup Mixer this Friday! Early bird tickets available for Lounge members.</p>
                  </div>
                </div>

                <div className="mt-6 text-center">
                  <span className="text-gray-500 text-sm">Join the conversation...</span>
                </div>
              </div>

              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 w-16 h-16 bg-emerald-200 rounded-full opacity-60 animate-float"></div>
              <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-emerald-300 rounded-full opacity-40 animate-float-delayed"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              What Our Community Says
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Join thousands of satisfied users who have found their perfect events and grown their communities with MeetKats.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                <div className="flex items-center mb-6">
                  <img 
                    src={testimonial.image} 
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full mr-4"
                  />
                  <div>
                    <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                    <p className="text-gray-600 text-sm">{testimonial.role}</p>
                  </div>
                </div>
                
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                
                <p className="text-gray-700 leading-relaxed">"{testimonial.content}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Overview */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Why Choose MeetKats?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We're more than just an event platform - we're your partner in creating meaningful connections and unforgettable experiences.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center group">
                <div className="w-20 h-20 bg-white rounded-2xl shadow-lg flex items-center justify-center mx-auto mb-6 group-hover:shadow-xl transition-all duration-300 group-hover:-translate-y-2">
                  <div className="text-emerald-600">
                    {benefit.icon}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{benefit.title}</h3>
                <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-emerald-600 to-emerald-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-emerald-100 mb-8 leading-relaxed">
            Join MeetKats today and discover a world of amazing events and meaningful connections.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={()=>{window.location.href="/events"}} className="group cursor-pointer bg-white text-emerald-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-emerald-50 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center">
              <Search className="w-5 h-5 mr-2" />
              Browse Events
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </button>
            <button onClick={()=>{window.location.href="/events/new"}} className="group cursor-pointer bg-emerald-500 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-emerald-400 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center">
              <Calendar className="w-5 h-5 mr-2" />
              Create Your Event
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg flex items-center justify-center">
                  <img src="/mainlogo.png" className="text-white font-bold text-xl"/>
                </div>
                <span className="text-2xl font-bold">MeetKats</span>
              </div>
              <p className="text-gray-400 mb-6 leading-relaxed">
                Connecting people through amazing events and building communities that last.
              </p>
              <div className="flex space-x-4">
                <button onClick={()=>{window.location.href="https://www.linkedin.com/company/meetkats/"}} className="cursor-pointer w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-emerald-600 transition-colors">
                  <Linkedin  className="w-5 h-5" />
                </button>
                <button onClick={()=>{window.location.href="https://www.instagram.com/meetkats?igsh=MmlvdXh0Zmp0cGJ6"}} className="cursor-pointer w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-emerald-600 transition-colors">
                  <Instagram  className="w-5 h-5" />
                </button>
                <button onClick={()=>{window.location.href="https://x.com/MeetKatsOrg"}} className="cursor-pointer w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-emerald-600 transition-colors">
                  <Twitter className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-6">For Attendees</h3>
              <ul className="space-y-3">
                <li><a href="/events" className="text-gray-400 hover:text-white transition-colors">Browse Events</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">My Tickets</a></li>
                <li><a href="https://chat.whatsapp.com/LRnaE2vKJnwHcaRXH1pQWr?mode=ac_t" className="text-gray-400 hover:text-white transition-colors">Join MeetKats Lounge</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Event Calendar</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-6">For Organizers</h3>
              <ul className="space-y-3">
                <li><a href="/events/new" className="text-gray-400 hover:text-white transition-colors">Create Event</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Organizer Dashboard</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Analytics</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Pricing</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-6">Support</h3>
              <ul className="space-y-3">
                <li><a href="/termsandconditons" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="/privacypolicy" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="/refundpolicy" className="text-gray-400 hover:text-white transition-colors">Refund Policy</a></li>
                <li><a href="/childabuse" className="text-gray-400 hover:text-white transition-colors">Child Abuse</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2025 MeetKats. All rights reserved.
            </p>
            <p className="text-gray-400 text-sm">
              Made with ❤️ for event enthusiasts worldwide
            </p>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        @keyframes float-delayed {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-15px);
          }
        }

        @keyframes float-slow {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out;
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        .animate-float-delayed {
          animation: float-delayed 8s ease-in-out infinite;
          animation-delay: 2s;
        }

        .animate-float-slow {
          animation: float-slow 10s ease-in-out infinite;
          animation-delay: 4s;
        }

        .font-inter {
          font-family: 'Inter', sans-serif;
        }

        html {
          scroll-behavior: smooth;
        }
      `}</style>
    </div>
  );
}

export default LandPage;