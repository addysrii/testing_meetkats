import React, { useEffect, useState, useCallback } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import api from "../services/api";
import {
  FaLinkedin,
  FaTwitter,
  FaGlobe,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaLanguage,
  FaBriefcase,
  FaGraduationCap,
  FaCalendarAlt,
} from "react-icons/fa";
import Loader from "../components/common/Loader";
import ProfileViewCard from "../components/profile/ProfileViewCard";
import ConnectionButton from "../components/network/ConnectionButton";
import Sidebar from "../components/common/Navbar";
import { useAuth } from "../context/AuthContext";
import userService from "../services/userService";
import portfolioService from "../services/portfolioService";

const ProfilePage = () => {
  const { userId } = useParams(); // This might be undefined if visiting /profile
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth(); // Get current user from auth context
  const [profile, setProfile] = useState(null);
  const [userRelationship, setUserRelationship] = useState({});
  const [portfolio, setPortfolio] = useState({});
  const [recommendations, setRecommendations] = useState([]);
  const [activeTab, setActiveTab] = useState("about");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewsAnalytics, setViewsAnalytics] = useState(null);
  const [isCurrentUser, setIsCurrentUser] = useState(false);
  const [currentUserInfo, setCurrentUserInfo] = useState(null);

  // Memoized fetch function to avoid recreation on each render
  const fetchUserData = useCallback(async () => {
    try {
      console.log("Starting to fetch profile data...");
      setLoading(true);
      setError(null); // Reset any previous errors

      // If we're on the edit route, skip profile fetch
      if (location.pathname.endsWith("/edit")) {
        console.log("Edit route detected, skipping profile fetch");
        if (user) {
          setCurrentUserInfo(user);
        }
        setLoading(false);
        return;
      }

      // First, get the current user's info using getCurrentUser
      console.log("Fetching current user info...");
      try {
        const userInfo = await userService.getCurrentUser();
        console.log("Current user info fetched:", userInfo);
        setCurrentUserInfo(userInfo);

        // If no userId is provided in URL, redirect to current user's profile
        if (!userId || userId === "undefined") {
          console.log(
            "No userId provided, redirecting to current user profile"
          );
          if (userInfo && userInfo.id) {
            navigate(`/profile/${userInfo.id}`, { replace: true });
            return; // Exit early as we're redirecting
          } else {
            setError("Could not determine your user ID");
            setLoading(false);
            return;
          }
        }

        // Check if we're viewing our own profile
        const isSelf = userInfo.id === userId;
        console.log(`Viewing profile ${userId}, is self: ${isSelf}`);
        setIsCurrentUser(isSelf);

        // Now fetch the requested profile
        console.log(`Fetching profile data for user ${userId}...`);
        const profileData = await userService.getUserProfile(userId);
        console.log("Profile data fetched:", profileData);

        // Handle the API response correctly
        if (profileData) {
          setProfile(profileData);
          // Get portfolio data if available
          try {
            const portfolioData = await portfolioService.getPortfolioSummary(
              userId
            );
            setPortfolio(portfolioData || {});
          } catch (portfolioError) {
            console.error("Failed to fetch portfolio:", portfolioError);
            setPortfolio({});
          }

          // Get recommendations if available
          try {
            const recommendationsData = await api.getUserRecommendations(
              userId
            );
            setRecommendations(recommendationsData || []);
          } catch (recommendationsError) {
            console.error(
              "Failed to fetch recommendations:",
              recommendationsError
            );
            setRecommendations([]);
          }
        } else {
          // Invalid data received
          console.error("Invalid profile data received:", profileData);
          setError("Received invalid profile data");
          setLoading(false);
          return;
        }

        // Record view if not our own profile
        if (!isSelf) {
          try {
            await api.recordProfileView(userId);
          } catch (viewError) {
            console.error("Failed to record profile view:", viewError);
          }
        } else {
          // Get our own view analytics
          try {
            const analytics = await api.getProfileViewAnalytics("month");
            setViewsAnalytics(analytics);
          } catch (analyticsError) {
            console.error("Failed to get view analytics:", analyticsError);
          }
        }

        setLoading(false);
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError(
          "Failed to load profile data. Please ensure you have a valid user ID."
        );
        setLoading(false);
      }
    } catch (err) {
      console.error("Unexpected error in fetchUserData:", err);
      setError("An unexpected error occurred");
      setLoading(false);
    }
  }, [userId, navigate, location.pathname, user]);

  // Add this effect to handle when profile is loaded but loading state is still true
  useEffect(() => {
    if (profile && loading) {
      console.log("Profile loaded but still in loading state - forcing update");
      setLoading(false);
    }
  }, [profile, loading]);

  useEffect(() => {
    // If we're on the edit route, we should handle it differently
    if (location.pathname.endsWith("/edit")) {
      console.log("Edit route detected, skipping profile fetch");
      setLoading(false);
      return; // Don't fetch profile data on the edit route
    }

    console.log(`ProfilePage: useEffect triggered with userId=${userId}`);
    fetchUserData();
  }, [userId, location.pathname, fetchUserData]);

  // Log state changes to debug
  useEffect(() => {
    console.log("Profile state changed:", {
      loading,
      error,
      hasProfile: !!profile,
      isCurrentUser,
    });
  }, [loading, error, profile, isCurrentUser]);


  //add experience
  const [showExperienceForm, setShowExperienceForm] = useState(false);
  const [newExperience, setNewExperience] = useState({
    company: "",
    position: "",
    location: "",
    startDate: "",
    endDate: "",
    current: false,
    description: "",
    skills: "",
  });
  const handleExperienceChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewExperience((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };
  const handleAddExperience = async () => {
    try {
      const formattedExperience = {
        ...newExperience,
        skills: newExperience.skills
          .split(",")
          .map((skill) => skill.trim())
          .filter((s) => s !== ""),
      };

      // Merge with existing experience
      const updatedExperience = [
        ...(profile.experience || []),
        formattedExperience,
      ];

      // Prepare updated profile data
      const updatedProfileData = {
        ...profile, // copy existing fields
        experience: updatedExperience,
      };

      // Call the userService to update profile (no image here)
      const updatedUser = await userService.updateProfile(updatedProfileData);

      // Update UI with new profile
      setProfile(updatedUser);
      setShowExperienceForm(false);

      // Reset form
      setNewExperience({
        company: "",
        position: "",
        location: "",
        startDate: "",
        endDate: "",
        current: false,
        description: "",
        skills: "",
      });

    } catch (err) {
      console.error("Add experience error:", err);
      alert("Failed to add experience. Please try again.");
    }
  };
  const handleDeleteExperience = async (indexToRemove) => {
    try {
      const updatedExperience = profile.experience.filter(
        (_, index) => index !== indexToRemove
      );

      const updatedProfileData = {
        ...profile,
        experience: updatedExperience,
      };

      const updatedUser = await userService.updateProfile(updatedProfileData);
      setProfile(updatedUser);
    } catch (err) {
      console.error("Failed to delete experience:", err);
      alert("Error deleting experience");
    }
  };
  //add education 
  const [showEducationForm, setShowEducationForm] = useState(false);

  const [newEducation, setNewEducation] = useState({
    institution: "",
    degree: "",
    field: "",
    startDate: "",
    endDate: "",
    description: "",
    current: false
  });
  const handleEducationChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewEducation((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };
  const handleAddEducation = async () => {
    try {
      const updatedEducation = [...(profile.education || []), newEducation];

      const updatedProfile = {
        ...profile,
        education: updatedEducation
      };

      const response = await userService.updateProfile(updatedProfile);

      setProfile(response);
      setShowEducationForm(false);
      setNewEducation({
        institution: "",
        degree: "",
        field: "",
        startDate: "",
        endDate: "",
        description: "",
        current: false
      });
    } catch (error) {
      console.error("Error adding education:", error);
      alert("Failed to add education");
    }
  };

  const handleDeleteEducation = async (indexToDelete) => {
    try {
      const updatedEducation = profile.education.filter((_, index) => index !== indexToDelete);

      const updatedProfile = {
        ...profile,
        education: updatedEducation,
      };

      const response = await userService.updateProfile(updatedProfile);

      setProfile(response); // Update UI after successful deletion
    } catch (error) {
      console.error("Error deleting education:", error);
      alert("Failed to delete education");
    }
  };

  // The edit route has been moved to a separate profile editor component
  // This is just a placeholder for the edit route
  if (location.pathname.endsWith("/edit")) {
    return (
      <div className="flex h-screen bg-orange-50">
        <Sidebar user={user || {}} />
        <div className="flex-1 overflow-auto">
          <div className="md:pl-0 pl-0 md:pt-0 pt-16">
            <div className="container mx-auto px-4 py-8">
              <h1 className="text-2xl font-bold text-gray-800">Edit Profile</h1>
              {/* Your profile editor component or form should go here */}
              <div className="bg-white rounded-lg shadow p-6 mt-4">
                {currentUserInfo ? (
                  <div className="space-y-4">
                    <h2 className="text-lg font-semibold">Basic Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          First Name
                        </label>
                        <input
                          type="text"
                          defaultValue={currentUserInfo.firstName}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Last Name
                        </label>
                        <input
                          type="text"
                          defaultValue={currentUserInfo.lastName}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Email
                        </label>
                        <input
                          type="email"
                          defaultValue={currentUserInfo.email}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                          readOnly
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Phone
                        </label>
                        <input
                          type="tel"
                          defaultValue={currentUserInfo.phone}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Headline
                        </label>
                        <input
                          type="text"
                          defaultValue={currentUserInfo.headline}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Bio
                        </label>
                        <textarea
                          defaultValue={currentUserInfo.bio}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                          rows="4"
                        ></textarea>
                      </div>
                    </div>
                    <div className="mt-4 flex justify-end">
                      <Link
                        to={`/profile/${currentUserInfo.id || ""}`}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 mr-2"
                      >
                        Cancel
                      </Link>
                      <button className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600">
                        Save Changes
                      </button>
                    </div>
                  </div>
                ) : (
                  <p>Loading user information...</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    console.log("Rendering loading state");
    return (
      <div className="flex h-screen bg-orange-50">
        <Sidebar user={user || {}} />
        <div className="flex-1 overflow-auto">
          <div className="md:pl-0 pl-0 md:pt-0 pt-16 flex justify-center items-center h-64">
            <Loader />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    console.log("Rendering error state:", error);
    return (
      <div className="flex h-screen bg-orange-50">
        <Sidebar user={user || {}} />
        <div className="flex-1 overflow-auto">
          <div className="md:pl-0 pl-0 md:pt-0 pt-16 flex justify-center items-center h-64">
            <div className="text-center text-red-500">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    console.log("Rendering 'profile not found' state");
    return (
      <div className="flex h-screen bg-orange-50">
        <Sidebar user={user || {}} />
        <div className="flex-1 overflow-auto">
          <div className="md:pl-0 pl-0 md:pt-0 pt-16 flex justify-center items-center h-64">
            <div className="text-center">Profile not found</div>
          </div>
        </div>
      </div>
    );
  }


  return (
    <div className="flex h-screen bg-orange-50">
      <Sidebar user={user || {}} />
      <div className="flex-1 overflow-auto">
        <div className="md:pl-0 pl-0 md:pt-0 pt-16">
          <div className="container mx-auto px-4 py-8">
            {/* Profile Header */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              {/* Cover Image */}
              <div className="h-48 w-full bg-gradient-to-r from-orange-500 to-orange-600"></div>

              <div className="relative px-4 py-5 sm:px-6">
                {/* Profile Picture */}
                <div className="absolute -mt-16">
                  <img
                    className="h-32 w-32 rounded-full ring-4 ring-white object-cover"
                    src={
                      profile.profileImage || "https://via.placeholder.com/128"
                    }
                    alt={`${profile.firstName} ${profile.lastName}`}
                  />
                </div>

                {/* Profile Actions */}
                <div className="flex justify-end mb-4">
                  {!isCurrentUser && (
                    <div className="space-x-2">
                      <ConnectionButton
                        userId={userId}
                        initialStatus={userRelationship}
                        onStatusChange={(newStatus) =>
                          setUserRelationship(newStatus)
                        }
                      />
                      <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">
                        Message
                      </button>
                    </div>
                  )}
                  {isCurrentUser && (
                    <Link
                      to="/profile/edit"
                      className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
                    >
                      Edit Profile
                    </Link>
                  )}
                </div>

                {/* Profile Info */}
                <div className="mt-6 pt-10">
                  <h1 className="text-3xl font-bold">
                    {profile.firstName} {profile.lastName}
                    {profile.emailVerified && (
                      <span
                        className="ml-2 text-orange-500"
                        title="Verified Account"
                      >
                        ✓
                      </span>
                    )}
                  </h1>
                  <p className="text-xl text-gray-600 mt-1">
                    {profile.headline || "No headline specified"}
                  </p>

                  {profile.location && (
                    <p className="text-gray-500 mt-1 flex items-center">
                      <FaMapMarkerAlt className="mr-1" />
                      {profile.location.address ||
                        (profile.location.coordinates
                          ? `${profile.location.coordinates[1].toFixed(
                            2
                          )}, ${profile.location.coordinates[0].toFixed(2)}`
                          : "Location available")}
                    </p>
                  )}

                  {/* Stats & Connection Info */}
                  <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-600">
                    <span>{profile.connections?.length || 0} connections</span>
                    <span>{profile.followersCount || 0} followers</span>
                    <span>{profile.followingCount || 0} following</span>

                    {isCurrentUser && viewsAnalytics && (
                      <Link
                        to="/profile/views"
                        className="text-orange-600 hover:underline"
                      >
                        {viewsAnalytics.totalViews} profile views in the last
                        month
                      </Link>
                    )}
                  </div>

                  {/* Quick Contact */}
                  <div className="mt-4 flex gap-3">
                    {profile.email && (
                      <a
                        href={`mailto:${profile.email}`}
                        className="text-gray-600 hover:text-orange-600"
                        title="Email"
                      >
                        <FaEnvelope size={20} />
                      </a>
                    )}
                    {profile.phone && (
                      <a
                        href={`tel:${profile.phone}`}
                        className="text-gray-600 hover:text-orange-600"
                        title="Phone"
                      >
                        <FaPhone size={20} />
                      </a>
                    )}
                    {profile.socialLinks &&
                      profile.socialLinks.length > 0 &&
                      profile.socialLinks.map((link, index) => {
                        let Icon;
                        let title = "Website";

                        if (
                          link.platform === "linkedin" ||
                          (link.url && link.url.includes("linkedin.com"))
                        ) {
                          Icon = FaLinkedin;
                          title = "LinkedIn";
                        } else if (
                          link.platform === "twitter" ||
                          (link.url && link.url.includes("twitter.com"))
                        ) {
                          Icon = FaTwitter;
                          title = "Twitter";
                        } else {
                          Icon = FaGlobe;
                        }

                        return (
                          <a
                            key={index}
                            href={link.url}
                            className="text-gray-600 hover:text-orange-600"
                            target="_blank"
                            rel="noopener noreferrer"
                            title={title}
                          >
                            <Icon size={20} />
                          </a>
                        );
                      })}
                  </div>
                </div>
              </div>
            </div>

            {/* Profile who viewed card (for own profile) */}
            {isCurrentUser && viewsAnalytics && (
              <div className="mt-6">
                <ProfileViewCard analytics={viewsAnalytics} />
              </div>
            )}

            {/* Profile Tabs */}
            <div className="mt-6 bg-white rounded-lg shadow">
              <div className="border-b border-gray-200">
                <nav className="flex -mb-px overflow-x-auto">
                  <button
                    onClick={() => setActiveTab("about")}
                    className={`px-6 py-4 text-sm font-medium whitespace-nowrap ${activeTab === "about"
                      ? "border-b-2 border-orange-500 text-orange-600"
                      : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }`}
                  >
                    About
                  </button>
                  <button
                    onClick={() => setActiveTab("experience")}
                    className={`px-6 py-4 text-sm font-medium whitespace-nowrap ${activeTab === "experience"
                      ? "border-b-2 border-orange-500 text-orange-600"
                      : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }`}
                  >
                    Experience
                  </button>
                  <button
                    onClick={() => setActiveTab("education")}
                    className={`px-6 py-4 text-sm font-medium whitespace-nowrap ${activeTab === "education"
                      ? "border-b-2 border-orange-500 text-orange-600"
                      : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }`}
                  >
                    Education
                  </button>
                  <button
                    onClick={() => setActiveTab("skills")}
                    className={`px-6 py-4 text-sm font-medium whitespace-nowrap ${activeTab === "skills"
                      ? "border-b-2 border-orange-500 text-orange-600"
                      : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }`}
                  >
                    Skills
                  </button>
                  <button
                    onClick={() => setActiveTab("portfolio")}
                    className={`px-6 py-4 text-sm font-medium whitespace-nowrap ${activeTab === "portfolio"
                      ? "border-b-2 border-orange-500 text-orange-600"
                      : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }`}
                  >
                    Portfolio
                  </button>
                  <button
                    onClick={() => setActiveTab("recommendations")}
                    className={`px-6 py-4 text-sm font-medium whitespace-nowrap ${activeTab === "recommendations"
                      ? "border-b-2 border-orange-500 text-orange-600"
                      : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }`}
                  >
                    Recommendations
                  </button>
                </nav>
              </div>

              <div className="p-6">
                {/* About Tab */}
                {activeTab === "about" && (
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">
                      About
                    </h2>
                    <div className="text-gray-700 whitespace-pre-wrap mb-6">
                      {profile.bio || "No bio provided."}
                    </div>

                    {/* Languages Section */}
                    {profile.languages && profile.languages.length > 0 && (
                      <div className="mt-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center">
                          <FaLanguage className="mr-2" /> Languages
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {profile.languages.map((language, index) => (
                            <div
                              key={index}
                              className="bg-orange-50 rounded-lg px-3 py-1 text-sm text-gray-700 border border-orange-100"
                            >
                              {language.language}{" "}
                              {language.proficiency &&
                                `(${language.proficiency})`}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Interests Section */}
                    {profile.interests &&
                      (profile.interests.topics?.length > 0 ||
                        profile.interests.industries?.length > 0) && (
                        <div className="mt-6">
                          <h3 className="text-lg font-semibold text-gray-800 mb-2">
                            Interests
                          </h3>

                          {profile.interests.topics?.length > 0 && (
                            <div className="mb-2">
                              <h4 className="text-md font-medium text-gray-700 mb-1">
                                Topics
                              </h4>
                              <div className="flex flex-wrap gap-2">
                                {profile.interests.topics.map(
                                  (topic, index) => (
                                    <div
                                      key={index}
                                      className="bg-orange-50 rounded-lg px-3 py-1 text-sm text-gray-700 border border-orange-100"
                                    >
                                      {topic}
                                    </div>
                                  )
                                )}
                              </div>
                            </div>
                          )}

                          {profile.interests.industries?.length > 0 && (
                            <div>
                              <h4 className="text-md font-medium text-gray-700 mb-1">
                                Industries
                              </h4>
                              <div className="flex flex-wrap gap-2">
                                {profile.interests.industries.map(
                                  (industry, index) => (
                                    <div
                                      key={index}
                                      className="bg-orange-50 rounded-lg px-3 py-1 text-sm text-gray-700 border border-orange-100"
                                    >
                                      {industry}
                                    </div>
                                  )
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                    {/* Job Preferences (if viewing own profile) */}
                    {isCurrentUser && profile.jobPreferences && (
                      <div className="mt-6 p-4 bg-orange-50 rounded-lg border border-orange-100">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">
                          Job Preferences
                        </h3>
                        <p className="text-sm text-gray-500 mb-3">
                          This information is only visible to you
                        </p>

                        {profile.jobPreferences.jobTypes?.length > 0 && (
                          <div className="mb-2">
                            <h4 className="text-md font-medium text-gray-700 mb-1">
                              Job Types
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {profile.jobPreferences.jobTypes.map(
                                (type, index) => (
                                  <div
                                    key={index}
                                    className="bg-white rounded-lg px-3 py-1 text-sm text-gray-700 border border-gray-200"
                                  >
                                    {type}
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        )}

                        {profile.jobPreferences.locations?.length > 0 && (
                          <div className="mb-2">
                            <h4 className="text-md font-medium text-gray-700 mb-1">
                              Preferred Locations
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {profile.jobPreferences.locations.map(
                                (location, index) => (
                                  <div
                                    key={index}
                                    className="bg-white rounded-lg px-3 py-1 text-sm text-gray-700 border border-gray-200"
                                  >
                                    {location}
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        )}

                        {profile.jobPreferences.industries?.length > 0 && (
                          <div>
                            <h4 className="text-md font-medium text-gray-700 mb-1">
                              Preferred Industries
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {profile.jobPreferences.industries.map(
                                (industry, index) => (
                                  <div
                                    key={index}
                                    className="bg-white rounded-lg px-3 py-1 text-sm text-gray-700 border border-gray-200"
                                  >
                                    {industry}
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Experience Tab */}
                {activeTab === "experience" && (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-semibold text-gray-800">
                        Work Experience
                      </h2>
                      {isCurrentUser && (
                        <button
                          onClick={() => setShowExperienceForm((prev) => !prev)}
                          className="px-4 py-2 bg-orange-500 text-white text-sm rounded-lg hover:bg-orange-600 transition"
                        >
                          Add Experience
                        </button>
                      )}
                    </div>
                    {showExperienceForm && (
                      <div className="space-y-4 bg-gray-100 p-4 rounded-lg mb-4">
                        <input
                          type="text"
                          name="company"
                          placeholder="Company *"
                          value={newExperience.company}
                          onChange={handleExperienceChange}
                          className="w-full border rounded px-3 py-2"
                          required
                        />
                        <input
                          type="text"
                          name="position"
                          placeholder="Position *"
                          value={newExperience.position}
                          onChange={handleExperienceChange}
                          required
                          className="w-full border rounded px-3 py-2"
                        />
                        <input
                          type="text"
                          name="location"
                          placeholder="Location"
                          value={newExperience.location}
                          onChange={handleExperienceChange}
                          className="w-full border rounded px-3 py-2"
                        />
                        <input
                          type="date"
                          name="startDate"
                          value={newExperience.startDate}
                          onChange={handleExperienceChange}
                          max={new Date().toISOString().split("T")[0]} // restrict future dates
                          className="w-full border rounded px-3 py-2"
                        />
                        <input
                          type="date"
                          name="endDate"
                          value={newExperience.endDate}
                          onChange={handleExperienceChange}
                          disabled={newExperience.current}
                          className="w-full border rounded px-3 py-2"
                        />
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            name="current"
                            checked={newExperience.current}
                            onChange={handleExperienceChange}
                          />
                          <span>Currently Working</span>
                        </label>
                        <textarea
                          name="description"
                          placeholder="Description"
                          value={newExperience.description}
                          onChange={handleExperienceChange}
                          className="w-full border rounded px-3 py-2"
                        ></textarea>
                        <input
                          type="text"
                          name="skills"
                          placeholder="Skills (comma separated)"
                          value={newExperience.skills}
                          onChange={handleExperienceChange}
                          className="w-full border rounded px-3 py-2"
                        />
                        <div className="flex gap-3">
                          <button
                            onClick={handleAddExperience}
                            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setShowExperienceForm(false)}
                            className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}

                    {profile.experience?.length > 0 ? (
                      <div className="space-y-6">
                        {profile.experience.map((experience, index) => (
                          <div
                            key={index}
                            className="border-b pb-4 last:border-0"
                          >
                            <div className="flex items-start">
                              <div className="h-12 w-12 flex-shrink-0 bg-gray-200 rounded-md flex items-center justify-center">
                                {experience.companyLogo ? (
                                  <img
                                    src={experience.companyLogo}
                                    alt={experience.company}
                                    className="h-10 w-10 object-contain"
                                  />
                                ) : (
                                  <FaBriefcase className="text-gray-500" />
                                )}
                              </div>
                              <div className="ml-4">
                                <h3 className="text-lg font-medium text-gray-800">
                                  {experience.title || experience.position}
                                </h3>
                                <p className="text-gray-600">
                                  {experience.company ||
                                    experience.organization}
                                </p>
                                <p className="text-sm text-gray-500 flex items-center">
                                  <FaCalendarAlt className="mr-1" />
                                  {new Date(
                                    experience.startDate
                                  ).toLocaleDateString("en-US", {
                                    month: "short",
                                    year: "numeric",
                                  })}{" "}
                                  -{" "}
                                  {experience.current
                                    ? "Present"
                                    : experience.endDate
                                      ? new Date(
                                        experience.endDate
                                      ).toLocaleDateString("en-US", {
                                        month: "short",
                                        year: "numeric",
                                      })
                                      : "No end date"}
                                </p>
                                <p className="mt-2 text-gray-700">
                                  {experience.description}
                                </p>
                              </div>
                            </div>
                            {isCurrentUser && showExperienceForm && (
                              <button
                                onClick={() => handleDeleteExperience(index)}
                                className="text-red-500 text-sm hover:underline"
                              >
                                Delete
                              </button>
                            )}

                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">
                        No work experience listed.
                      </p>
                    )}
                  </div>
                )}

                {/* Education Tab */}
                {activeTab === "education" && (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-semibold text-gray-800">
                        Education
                      </h2>
                      {isCurrentUser && (
                        <button className="px-4 py-2 bg-orange-500 text-white text-sm rounded-lg hover:bg-orange-600 transition"
                          onClick={() => setShowEducationForm((prev) => !prev)}>
                          Add Education
                        </button>
                      )}
                    </div>
                    {showEducationForm && (
                      <div className="space-y-4 bg-gray-100 p-4 rounded-lg mb-4">
                        <input
                          name="institution"
                          placeholder="Institution *"
                          required
                          value={newEducation.institution}
                          onChange={handleEducationChange}
                          className="w-full border rounded px-3 py-2"
                        />
                        <input
                          name="degree"
                          placeholder="Degree"
                          value={newEducation.degree}
                          onChange={handleEducationChange}
                          className="w-full border rounded px-3 py-2"
                        />
                        <input
                          name="field"
                          placeholder="Field of Study"
                          value={newEducation.field}
                          onChange={handleEducationChange}
                          className="w-full border rounded px-3 py-2"
                        />
                        <input
                          type="date"
                          name="startDate"
                          value={newEducation.startDate}
                          onChange={handleEducationChange}
                          className="w-full border rounded px-3 py-2"
                          max={new Date().toISOString().split("T")[0]}
                        />
                        <input
                          type="date"
                          name="endDate"
                          value={newEducation.endDate}
                          onChange={handleEducationChange}
                          disabled={newEducation.current}
                          className="w-full border rounded px-3 py-2"
                        />
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            name="current"
                            checked={newEducation.current}
                            onChange={handleEducationChange}
                          />
                          <span>Currently Studying</span>
                        </label>
                        <textarea
                          name="description"
                          placeholder="Description"
                          value={newEducation.description}
                          onChange={handleEducationChange}
                          className="w-full border rounded px-3 py-2"
                        ></textarea>

                        <div className="flex gap-3">
                          <button
                            onClick={handleAddEducation}
                            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setShowEducationForm(false)}
                            className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}

                    {profile.education?.length > 0 ? (
                      <div className="space-y-6">
                        {profile.education.map((education, index) => (
                          <div
                            key={index}
                            className="border-b pb-4 last:border-0"
                          >
                            <div className="flex items-start">
                              <div className="h-12 w-12 flex-shrink-0 bg-gray-200 rounded-md flex items-center justify-center">
                                <FaGraduationCap className="text-gray-500 text-xl" />
                              </div>
                              <div className="ml-4">
                                <h3 className="text-lg font-medium text-gray-800">
                                  {education.institution || education.school}
                                </h3>
                                <p className="text-gray-600">
                                  {education.degree}
                                  {education.field
                                    ? `, ${education.field}`
                                    : ""}
                                </p>
                                <p className="text-sm text-gray-500 flex items-center">
                                  <FaCalendarAlt className="mr-1" />
                                  {education.startDate
                                    ? new Date(
                                      education.startDate
                                    ).toLocaleDateString("en-US", {
                                      year: "numeric",
                                    })
                                    : "No start date"}{" "}
                                  -{" "}
                                  {education.current
                                    ? "Present"
                                    : education.endDate
                                      ? new Date(
                                        education.endDate
                                      ).toLocaleDateString("en-US", {
                                        year: "numeric",
                                      })
                                      : "No end date"}
                                </p>
                              </div>
                            </div>
                            {isCurrentUser && showEducationForm && (
                              <button
                                onClick={() => handleDeleteEducation(index)}
                                className="text-red-500 hover:underline text-sm"
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 border rounded-lg bg-white">
                        <div className="inline-flex h-16 w-16 rounded-full bg-blue-100 items-center justify-center mb-4">
                          <FaGraduationCap className="h-8 w-8 text-blue-600" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">
                          No education added yet
                        </h3>
                        <p className="text-gray-600 mb-6">
                          Add your education history to showcase your academic
                          background.
                        </p>

                      </div>
                    )}
                  </div>
                )}

                {/* Skills Tab */}
                {activeTab === "skills" && (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-semibold text-gray-800">
                        Skills
                      </h2>
                    </div>
                  

                    {Array.isArray(profile.skills) && profile.skills.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {profile.skills.map((skill, index) => (
                          <div
                            key={index}
                            className="bg-orange-50 rounded-full px-4 py-2 text-gray-700 border border-orange-100"
                          >
                            {skill.name?.charAt(0).toUpperCase() + skill.name?.slice(1)}{" "}
                            {skill.endorsements > 0 && `(${skill.endorsements})`}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 border rounded-lg bg-white">
                        <div className="inline-flex h-16 w-16 rounded-full bg-green-100 items-center justify-center mb-4">
                          <span className="text-3xl">🔧</span>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">
                          No skills added yet
                        </h3>
                        <p className="text-gray-600 mb-6">
                          Showcase your professional abilities by adding skills.
                        </p>
                        {isCurrentUser && (
                          <button className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600">
                            Add Your First Skill
                          </button>
                        )}
                      </div>
                    )}

                    {/* {isCurrentUser && (
                      <div className="mt-6 p-4 bg-orange-50 rounded-lg border border-orange-100">
                        <h3 className="text-lg font-semibold flex items-center">
                          <span className="mr-2">👩‍💻</span> Developer Skills
                        </h3>
                        <p className="text-sm text-gray-500 mb-3">
                          Add technical skills to showcase your expertise
                        </p>
                        <button className="px-4 py-2 bg-white text-orange-600 border border-orange-500 rounded hover:bg-orange-100 transition">
                          Edit Skills
                        </button>
                      </div>
                    )} */}
                  </div>
                )}

                {/* Portfolio Tab */}
                {activeTab === "portfolio" && (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-semibold text-gray-800">
                        Portfolio
                      </h2>
                      {isCurrentUser && (
                        <Link
                          to="/portfolio/projects/new"
                          className="px-4 py-2 bg-orange-500 text-white text-sm rounded-lg hover:bg-orange-600 transition"
                        >
                          Add Project
                        </Link>
                      )}
                    </div>

                    {portfolio.projects?.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {portfolio.projects.map((project, index) => (
                          <div
                            key={index}
                            className="border rounded-lg overflow-hidden bg-white"
                          >
                            {project.images && project.images[0] && (
                              <img
                                src={project.images[0]}
                                alt={project.title}
                                className="w-full h-48 object-cover"
                              />
                            )}
                            <div className="p-4">
                              <h3 className="text-lg font-medium text-gray-800">
                                {project.title}
                              </h3>
                              <p className="text-gray-500 mt-1">
                                {project.category}
                              </p>
                              <p className="text-gray-700 mt-2 line-clamp-3">
                                {project.description}
                              </p>
                              <Link
                                to={`/portfolio/projects/${project.id || project._id
                                  }`}
                                className="mt-3 inline-block text-orange-600 hover:underline"
                              >
                                View Project
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 border rounded-lg bg-white">
                        <div className="inline-flex h-16 w-16 rounded-full bg-orange-100 items-center justify-center mb-4">
                          <span className="text-3xl">🚀</span>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">
                          No projects yet
                        </h3>
                        <p className="text-gray-600 mb-6">
                          Showcase your work by adding projects to your
                          portfolio.
                        </p>
                        {isCurrentUser && (
                          <Link
                            to="/portfolio/projects/new"
                            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                          >
                            Add Your First Project
                          </Link>
                        )}
                      </div>
                    )}

                    {/* Achievements Section */}
                    <div className="mt-8">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-800">
                          Achievements
                        </h3>
                        {isCurrentUser && (
                          <Link
                            to="/portfolio/achievements/new"
                            className="px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition"
                          >
                            Add Achievement
                          </Link>
                        )}
                      </div>

                      {portfolio.achievements?.length > 0 ? (
                        <div className="space-y-4">
                          {portfolio.achievements.map((achievement, index) => (
                            <div
                              key={index}
                              className="flex items-start p-4 border rounded-lg bg-white"
                            >
                              {achievement.image ? (
                                <img
                                  src={achievement.image}
                                  alt=""
                                  className="h-16 w-16 object-contain"
                                />
                              ) : (
                                <div className="h-16 w-16 bg-orange-100 text-orange-800 flex items-center justify-center rounded-full">
                                  <span className="text-xl">🏆</span>
                                </div>
                              )}
                              <div className="ml-4">
                                <h4 className="text-md font-medium text-gray-800">
                                  {achievement.title}
                                </h4>
                                <p className="text-sm text-gray-600">
                                  {achievement.issuer} •{" "}
                                  {new Date(
                                    achievement.dateAchieved
                                  ).toLocaleDateString()}
                                </p>
                                <p className="text-sm text-gray-700 mt-1">
                                  {achievement.description}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 border rounded-lg bg-white">
                          <div className="inline-flex h-16 w-16 rounded-full bg-purple-100 items-center justify-center mb-4">
                            <span className="text-3xl">🏆</span>
                          </div>
                          <h3 className="text-xl font-semibold text-gray-800 mb-2">
                            No achievements yet
                          </h3>
                          <p className="text-gray-600 mb-6">
                            Highlight your accomplishments by adding
                            achievements.
                          </p>
                          {isCurrentUser && (
                            <Link
                              to="/portfolio/achievements/new"
                              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                            >
                              Add Your First Achievement
                            </Link>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Recommendations Tab */}
                {activeTab === "recommendations" && (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-semibold text-gray-800">
                        Recommendations
                      </h2>
                      {!isCurrentUser && (
                        <button className="px-4 py-2 bg-orange-500 text-white text-sm rounded-lg hover:bg-orange-600 transition">
                          Write a Recommendation
                        </button>
                      )}
                    </div>

                    {recommendations?.length > 0 ? (
                      <div className="space-y-6">
                        {recommendations.map((recommendation, index) => (
                          <div
                            key={index}
                            className="border rounded-lg p-4 bg-white"
                          >
                            <div className="flex items-center mb-4">
                              <img
                                src={
                                  recommendation.author?.profilePicture ||
                                  recommendation.author?.profileImage ||
                                  "https://via.placeholder.com/40"
                                }
                                alt=""
                                className="h-10 w-10 rounded-full"
                              />
                              <div className="ml-3">
                                <h3 className="text-md font-medium text-gray-800">
                                  {recommendation.author?.firstName}{" "}
                                  {recommendation.author?.lastName}
                                </h3>
                                <p className="text-sm text-gray-500">
                                  {recommendation.relationship}
                                </p>
                              </div>
                            </div>
                            <p className="text-gray-700">
                              {recommendation.content}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 border rounded-lg bg-white">
                        <div className="inline-flex h-16 w-16 rounded-full bg-orange-100 items-center justify-center mb-4">
                          <span className="text-3xl">💬</span>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">
                          No recommendations yet
                        </h3>
                        <p className="text-gray-600 mb-6">
                          {isCurrentUser
                            ? "Recommendations from your connections will appear here."
                            : `Be the first to recommend ${profile.firstName}.`}
                        </p>
                        {!isCurrentUser && (
                          <button className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600">
                            Write a Recommendation
                          </button>
                        )}
                      </div>
                    )}

                    {/* Given Recommendations (if viewing own profile) */}
                    {isCurrentUser && (
                      <div className="mt-8">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">
                          Recommendations You've Given
                        </h3>
                        <div className="text-center py-8 border rounded-lg bg-white">
                          <p className="text-gray-600 mb-4">
                            Support your connections by writing meaningful
                            recommendations.
                          </p>
                          <Link
                            to="/network/connections"
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                          >
                            View Your Connections
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Activity Feed - Only shown on user's own profile */}
            {isCurrentUser && (
              <div className="mt-6 bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Recent Activity
                </h2>
                <div className="text-center py-6">
                  <div className="inline-flex h-16 w-16 rounded-full bg-orange-100 items-center justify-center mb-4">
                    <span className="text-3xl">📊</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    Your activity will appear here
                  </h3>
                  <p className="text-gray-600">
                    Share updates, create posts, and interact with your network
                    to see your activity here.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
