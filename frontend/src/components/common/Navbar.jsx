"use client";

import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import img from "../../assets/MeetKats.jpg";
import img1 from "../../assets/messenger.png";
import notificationService from "../../services/notificationService";

const Sidebar = ({ user = {}, onLogout }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState(false);
  const [notificationItems, setNotificationItems] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [messages, setMessages] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const profileRef = useRef(null);
  const notificationsRef = useRef(null);
  const messagesRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const navigate = useNavigate();

  // Ensure user object has required properties
  const safeUser = {
    id: user?.id || "",
    name: user?.name || "",
    email: user?.email || "",
    profilePicture: user?.profilePicture || "",
    ...user,
  };

  // Fetch notifications count on mount
  useEffect(() => {
    const fetchNotificationCount = async () => {
      try {
        const count = await notificationService.getUnreadCount();
        setUnreadCount(count);
      } catch (error) {
        console.error("Error fetching notification count:", error);
      }
    };

    fetchNotificationCount();

    // Poll for updates every minute
    const interval = setInterval(fetchNotificationCount, 60000);

    return () => clearInterval(interval);
  }, []);

  // Fetch notifications when dropdown is opened
  useEffect(() => {
    if (notifications) {
      const fetchNotifications = async () => {
        setLoading(true);
        try {
          const data = await notificationService.getNotifications(1, 5);
          setNotificationItems(Array.isArray(data) ? data : []);
        } catch (error) {
          console.error("Error fetching notifications:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchNotifications();
    }
  }, [notifications]);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const toggleProfileMenu = () => {
    setProfileMenuOpen(!profileMenuOpen);
    setNotifications(false);
    setMessages(false);
  };

  const toggleNotifications = () => {
    setNotifications(!notifications);
    setProfileMenuOpen(false);
    setMessages(false);
  };

  const toggleMessages = () => {
    setMessages(!messages);
    setProfileMenuOpen(false);
    setNotifications(false);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);

      // Update local state
      setUnreadCount((prev) => Math.max(0, prev - 1));
      setNotificationItems((prev) =>
        prev.map((item) =>
          item.id === notificationId ? { ...item, read: true } : item
        )
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // Format timestamp
  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return "Unknown time";

    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffMs = now - notificationTime;

    const diffMins = Math.round(diffMs / 60000);
    const diffHours = Math.round(diffMs / 3600000);
    const diffDays = Math.round(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins} minute${diffMins !== 1 ? "s" : ""} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
    } else {
      return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;
    }
  };

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileMenuOpen(false);
      }
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target)
      ) {
        setNotifications(false);
      }
      if (messagesRef.current && !messagesRef.current.contains(event.target)) {
        setMessages(false);
      }
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target)
      ) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    // Implement search functionality
    console.log("Search term:", e.target.search.value);
  };

  const navItems = [
    {
      name: "Home",
      href: "/dashboard",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      ),
    },
    {
      name: "Network",
      href: "/network",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
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
      ),
    },
    {
      name: "Discover",
      href: "/discover",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      ),
    },
    {
      name: "Events",
      href: "/events",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      ),
    },
        {
      name: "Portfolio",
      href: "/portfolio",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      ),
    },
  ];

  return (
    <>
      {/* Main Horizontal Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left Section - Logo */}
            <div className="flex items-center space-x-3">
              <Link
                to="/dashboard"
                className="flex items-center space-x-3 group"
              >
                <div className="h-8 w-8 rounded-md justify-center shadow-md group-hover:shadow-lg transition-all duration-200">
                  <img
                    src={img || "/placeholder.svg"}
                    alt=""
                    className="h-8 w-8"
                  />
                </div>
                <span className="text-lg font-semibold text-gray-900 hidden sm:block">
                  Meetkats
                </span>
              </Link>
            </div>
            <div className="hidden lg:flex items-center space-x-20">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
                >
                  
                  <span className="text-sm font-medium">{item.name}</span>
                </Link>
              ))}
            </div>
            {/* Mobile Search Bar in the middle */}
            <div className="flex-1 px-2 lg:hidden">
              <form onSubmit={handleSearch} className="w-full">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                      className="h-4 w-4 text-gray-400"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <input
                    type="search"
                    name="search"
                    id="mobile-search"
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 pl-10 pr-4 text-sm placeholder-gray-400 focus:outline-none focus:bg-white focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                    placeholder="Search..."
                  />
                </div>
              </form>
            </div>
            {/* Right Section - Profile/Avatar and Hamburger */}
            <div className="flex items-center space-x-4">
              {/* Notifications Dropdown */}
              <div ref={notificationsRef} className="relative hidden lg:block">
                <button
                  onClick={toggleNotifications}
                  className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all duration-200 relative"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                  </svg>
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-medium">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </button>

                {notifications && (
                  <div className="absolute right-0 top-full mt-2 w-80 rounded-xl shadow-lg bg-white ring-1 ring-gray-200 overflow-hidden z-50">
                    <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                      <div className="flex justify-between items-center">
                        <h3 className="text-sm font-semibold text-gray-900">
                          Notifications
                        </h3>
                        <Link
                          to="/notifications"
                          className="text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
                        >
                          View all
                        </Link>
                      </div>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {loading ? (
                        <div className="px-4 py-6 text-center">
                          <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent mb-2"></div>
                          <p className="text-sm text-gray-500">
                            Loading notifications...
                          </p>
                        </div>
                      ) : notificationItems.length > 0 ? (
                        notificationItems.map((notification) => (
                          <div
                            key={notification.id}
                            className={`px-4 py-3 hover:bg-gray-50 border-b border-gray-50 cursor-pointer transition-colors ${notification.read ? "bg-white" : "bg-blue-25"
                              }`}
                            onClick={() =>
                              !notification.read &&
                              handleMarkAsRead(notification.id)
                            }
                          >
                            <div className="flex items-start space-x-3">
                              <div className="flex-shrink-0">
                                {notification.sender?.profilePicture ? (
                                  <img
                                    className="h-8 w-8 rounded-full"
                                    src={
                                      notification.sender.profilePicture ||
                                      "/placeholder.svg"
                                    }
                                    alt={`${notification.sender.firstName} ${notification.sender.lastName}`}
                                  />
                                ) : (
                                  <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                                    <span className="text-xs font-medium text-gray-600">
                                      {notification.sender?.firstName?.charAt(
                                        0
                                      ) || "U"}
                                      {notification.sender?.lastName?.charAt(
                                        0
                                      ) || "U"}
                                    </span>
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-gray-900 leading-relaxed">
                                  {notification.content}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {formatTimeAgo(notification.createdAt)}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="px-4 py-6 text-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-10 w-10 mx-auto text-gray-300 mb-2"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1}
                              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                            />
                          </svg>
                          <p className="text-sm font-medium text-gray-900 mb-1">
                            No notifications yet
                          </p>
                          <p className="text-xs text-gray-500">
                            We'll notify you when something new happens
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Profile Dropdown */}
              <div ref={profileRef} className="relative">
                <button
                  onClick={toggleProfileMenu}
                  className="flex items-center space-x-2 p-1 rounded-lg hover:bg-gray-50 transition-all duration-200 group"
                >
                  <div className="flex-shrink-0">
                    {safeUser.profilePicture ? (
                      <img
                        className="h-8 w-8 rounded-full border border-gray-200 group-hover:border-gray-300 transition-colors"
                        src={safeUser.profilePicture || "/placeholder.svg"}
                        alt=""
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center border border-gray-200 group-hover:border-gray-300 transition-colors">
                        <span className="text-xs font-medium text-white">
                          {safeUser.firstName?.charAt(0)}
                          {safeUser.lastName?.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="hidden lg:block text-left">
                    <p className="text-sm font-medium text-gray-900 group-hover:text-gray-700 transition-colors">
                      {safeUser.firstName} {safeUser.lastName}
                    </p>
                  </div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors hidden lg:block"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {profileMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-72 rounded-xl shadow-lg bg-white ring-1 ring-gray-200 overflow-hidden z-50">
                    <div className="px-4 py-4 bg-gradient-to-br from-blue-50 to-purple-50 border-b border-gray-100">
                      <div className="flex items-center space-x-3">
                        {safeUser.profilePicture ? (
                          <img
                            className="h-12 w-12 rounded-full border-2 border-white shadow-sm"
                            src={safeUser.profilePicture || "/placeholder.svg"}
                            alt=""
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center border-2 border-white shadow-sm">
                            <span className="text-sm font-medium text-white">
                              {safeUser.firstName?.charAt(0)}
                              {safeUser.lastName?.charAt(0)}
                            </span>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {safeUser.firstName} {safeUser.lastName}
                          </p>
                          <p className="text-xs text-gray-600 truncate">
                            {safeUser.headline || "Update your headline"}
                          </p>
                        </div>
                      </div>
                      <Link
                        to={`/profile/${safeUser.id}`}
                        className="mt-3 block text-center bg-white text-blue-600 text-sm font-medium py-2 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        View Profile
                      </Link>
                    </div>

                    <div className="py-2">
                      <Link
                        to="/settings"
                        className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 mr-3 text-gray-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        Settings
                      </Link>
                      <Link
                        to="/activity"
                        className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 mr-3 text-gray-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                          />
                        </svg>
                        Your Activity
                      </Link>
                      <div className="border-t border-gray-100 my-1"></div>
                      <button
                        onClick={onLogout}
                        className="cursor-pointer flex items-center w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-green-100 hover:text-gray-900 transition-colors"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 mr-3 text-gray-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                          />
                        </svg>
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={toggleMobileMenu}
                className="lg:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all duration-200"
              >
                {!mobileMenuOpen ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 lg:hidden"
          onClick={toggleMobileMenu}
        ></div>
      )}

      {/* Mobile Slide-out Menu */}
      <div
        ref={mobileMenuRef}
        className={`fixed top-0 right-0 h-full w-80 bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-50 lg:hidden ${mobileMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
      >
        <div className="flex flex-col h-full">
          {/* Mobile Menu Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <img
                  src={img || "/placeholder.svg"}
                  alt=""
                  className="h-6 w-6 rounded-md"
                />
              </div>
              <span className="text-lg font-semibold text-gray-900">
                Meetkats
              </span>
            </div>
            <button
              onClick={toggleMobileMenu}
              className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Mobile Navigation Links */}
          <div className="flex-1 overflow-y-auto py-4">
            <nav className="px-4 space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={toggleMobileMenu}
                  className="flex items-center space-x-3 px-3 py-3 rounded-lg text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                >
                  <span>{item.icon}</span>
                  <span className="font-medium">{item.name}</span>
                </Link>
              ))}
            </nav>

            {/* Mobile Notifications Section */}
            <div className="px-4 mt-6">
              <div className="border-t border-gray-200 pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-gray-900">
                    Notifications
                  </h3>
                  {unreadCount > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </div>

                <div className="space-y-3 max-h-48 overflow-y-auto">
                  {notificationItems.length > 0 ? (
                    notificationItems.slice(0, 3).map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-3 rounded-lg border ${notification.read
                            ? "bg-white border-gray-200"
                            : "bg-blue-50 border-blue-200"
                          }`}
                        onClick={() =>
                          !notification.read &&
                          handleMarkAsRead(notification.id)
                        }
                      >
                        <p className="text-sm text-gray-900 mb-1">
                          {notification.content}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatTimeAgo(notification.createdAt)}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-4">
                      No notifications
                    </p>
                  )}
                </div>

                <Link
                  to="/notifications"
                  onClick={toggleMobileMenu}
                  className="block text-center text-sm font-medium text-blue-600 hover:text-blue-700 mt-3"
                >
                  View all notifications
                </Link>
              </div>
            </div>
          </div>

          {/* Mobile Menu Footer - Profile Actions */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center space-x-3 mb-4">
              {safeUser.profilePicture ? (
                <img
                  className="h-10 w-10 rounded-full border border-gray-200"
                  src={safeUser.profilePicture || "/placeholder.svg"}
                  alt=""
                />
              ) : (
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <span className="text-sm font-medium text-white">
                    {safeUser.firstName?.charAt(0)}
                    {safeUser.lastName?.charAt(0)}
                  </span>
                </div>
              )}
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900">
                  {safeUser.firstName} {safeUser.lastName}
                </p>
                <p className="text-xs text-gray-600 truncate">
                  {safeUser.headline || "Update your headline"}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Link
                to={`/profile/${safeUser.id}`}
                onClick={toggleMobileMenu}
                className="block w-full text-center bg-blue-600 text-white text-sm font-medium py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                View Profile
              </Link>

              <Link
                to="/settings"
                onClick={toggleMobileMenu}
                className="flex items-center justify-center space-x-2 w-full text-gray-700 text-sm font-medium py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span>Settings</span>
              </Link>

              <button
                onClick={() => {
                  onLogout();
                  toggleMobileMenu();
                }}
                className="flex items-center justify-center space-x-2 w-full text-red-600 text-sm font-medium py-2 rounded-lg hover:bg-red-50 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                <span>Sign out</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
