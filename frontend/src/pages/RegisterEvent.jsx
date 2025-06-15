import { useState, useEffect } from "react";
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  MapPin,
  Users,
  Calendar,
  Shirt,
  Gift,
  Instagram,
  Github,
  CheckCircle,
  Clock,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import customEventService from "../services/customeventService";
import eventService from "../services/eventService";

const RegisterEvent = () => {
  const navigate = useNavigate();
  const { eventId } = useParams();
  const [event, setEvent] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    city: "",
    teamName: "",
    topicName: "",
    teamSize: "",
    institutionName: "",
    tshirtSize: "",
    instagram: "",
    github: "",
    referralCode: "",
    questions: Array(10).fill(""),
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const tShirtSizes = ["XS", "S", "M", "L", "XL", "XXL"];
  const teamSizes = ["1", "2", "3", "4", "5"];

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        setLoading(true);
        const response = await eventService.getEvent(eventId);

        if (response.error) {
          throw new Error(response.error);
        }

        const eventData = response.data;
        if (!eventData) {
          throw new Error("Failed to fetch event details");
        }

        // Check if registration is still open
        const now = new Date();
        const startDateTime = new Date(eventData.startDateTime);

        if (
          !eventData.settings?.allowSubmissionAfterStart &&
          now > startDateTime
        ) {
          setError(
            "Registration for this event has closed as the event has already started."
          );
          setLoading(false);
          return;
        }

        if (
          eventData.settings?.submissionDeadline &&
          now > new Date(eventData.settings.submissionDeadline)
        ) {
          setError(
            "Registration for this event has closed as the submission deadline has passed."
          );
          setLoading(false);
          return;
        }

        // Check if the event is full
        if (
          eventData.settings?.maxSubmissions &&
          eventData.attendeeCounts?.going >= eventData.settings.maxSubmissions
        ) {
          setError(
            "This event has reached its maximum capacity of registrations."
          );
          setLoading(false);
          return;
        }

        setEvent(eventData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching event:", error);
        setError(
          error.message || "Failed to load event details. Please try again."
        );
        setLoading(false);
      }
    };

    fetchEventDetails();
  }, [eventId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleQuestionChange = (index, value) => {
    const updatedQuestions = [...formData.questions];
    updatedQuestions[index] = value;
    setFormData((prevState) => ({
      ...prevState,
      questions: updatedQuestions,
    }));
  };

  const validateForm = () => {
    // Required fields validation
    const requiredFields = {
      name: "Full Name",
      email: "Email Address",
      phone: "Phone Number",
      teamName: "Team Name",
      teamSize: "Team Size",
    };

    for (const [field, label] of Object.entries(requiredFields)) {
      if (!formData[field]) {
        setError(`Please fill out the required field: ${label}`);
        return false;
      }
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address");
      return false;
    }

    // Phone validation
    const phoneRegex = /^\+?[0-9\s\-()]{8,20}$/;
    if (!phoneRegex.test(formData.phone)) {
      setError("Please enter a valid phone number");
      return false;
    }

    // Questions validation (at least 5 questions should be answered)
    const answeredQuestions = formData.questions.filter((q) => q.trim()).length;
    if (answeredQuestions < 5) {
      setError("Please answer at least 5 questions");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      window.scrollTo(0, 0);
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      // Transform form data to match the expected API format
      const submissionData = {
        responses: [
          { fieldId: "name", value: formData.name },
          { fieldId: "email", value: formData.email },
          { fieldId: "phone", value: formData.phone },
          { fieldId: "city", value: formData.city },
          { fieldId: "teamName", value: formData.teamName },
          { fieldId: "topicName", value: formData.topicName },
          { fieldId: "teamSize", value: formData.teamSize },
          { fieldId: "institutionName", value: formData.institutionName },
          { fieldId: "tshirtSize", value: formData.tshirtSize },
          { fieldId: "instagram", value: formData.instagram },
          { fieldId: "github", value: formData.github },
          { fieldId: "referralCode", value: formData.referralCode },
          ...formData.questions.map((answer, index) => ({
            fieldId: `question_${index + 1}`,
            value: answer,
          })),
        ],
      };

      // Submit the form
      const response = await customEventService.submitCustomForm(
        eventId,
        submissionData
      );

      setSuccess("Registration successful! Redirecting to event details...");

      // Scroll to top to show success message
      window.scrollTo(0, 0);

      // Redirect to event details page after 2 seconds
      setTimeout(() => {
        navigate(`/events/${eventId}`);
      }, 2000);
    } catch (error) {
      console.error("Error submitting form:", error);
      setError(
        error.response?.data?.error ||
          "Failed to submit registration. Please try again."
      );

      // Scroll to top to show error message
      window.scrollTo(0, 0);
    } finally {
      setSubmitting(false);
    }
  };

  const questions = [
    "What are your expectations from this event?",
    "How did you hear about this event?",
    "What skills do you bring to your team?",
    "Previous experience with similar events?",
    "Any specific requirements needed?",
    "What technology stack are you familiar with?",
    "What do you hope to learn from this event?",
    "Are you interested in networking opportunities?",
    "Any dietary restrictions we should know about?",
    "Any feedback on the registration process?",
  ];

  const isPersonalComplete = formData.name && formData.email && formData.phone;
  const isTeamComplete = formData.teamName && formData.teamSize;
  const isQuestionsComplete =
    formData.questions.filter((q) => q.trim()).length >= 5;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">
            Loading event details...
          </p>
        </div>
      </div>
    );
  }

  if (error && !event) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
            role="alert"
          >
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
          <button
            onClick={() => navigate("/events")}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors duration-200"
          >
            Back to Events
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <button
            onClick={() => navigate("/events")}
            className="flex items-center text-gray-600 hover:text-blue-600 transition-colors duration-200 group"
          >
            <ArrowLeft
              size={20}
              className="mr-2 group-hover:-translate-x-1 transition-transform duration-200"
            />
            <span className="font-medium">Back to Events</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Page Title */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Event Registration
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Complete your registration to secure your spot at {event?.name}
          </p>
        </div>

        {error && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6"
            role="alert"
          >
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {success && (
          <div
            className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-6"
            role="alert"
          >
            <strong className="font-bold">Success: </strong>
            <span className="block sm:inline">{success}</span>
          </div>
        )}

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-3">
            <form
              onSubmit={handleSubmit}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
            >
              {/* Personal Details Section */}
              <div className="p-8 border-b border-gray-100">
                <div className="flex items-center mb-8">
                  <div className="bg-blue-50 p-3 rounded-lg mr-4">
                    <User className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-900">
                      Personal Details
                    </h2>
                    <p className="text-gray-600 mt-1">
                      Please provide your basic information
                    </p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="text"
                          name="name"
                          placeholder="Enter your full name"
                          value={formData.name}
                          onChange={handleChange}
                          className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 placeholder-gray-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="email"
                          name="email"
                          placeholder="Enter your email address"
                          value={formData.email}
                          onChange={handleChange}
                          className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 placeholder-gray-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Institution Name
                      </label>
                      <input
                        type="text"
                        name="institutionName"
                        placeholder="Enter your institution name"
                        value={formData.institutionName}
                        onChange={handleChange}
                        className="w-full px-4 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 placeholder-gray-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Phone Number <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="tel"
                          name="phone"
                          placeholder="Enter your phone number"
                          value={formData.phone}
                          onChange={handleChange}
                          className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 placeholder-gray-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        City
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="text"
                          name="city"
                          placeholder="Enter your city"
                          value={formData.city}
                          onChange={handleChange}
                          className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 placeholder-gray-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        T-Shirt Size
                      </label>
                      <div className="relative">
                        <Shirt className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <select
                          name="tshirtSize"
                          value={formData.tshirtSize}
                          onChange={handleChange}
                          className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white text-gray-900 appearance-none"
                        >
                          <option value="">Select your size</option>
                          {tShirtSizes.map((size) => (
                            <option key={size} value={size}>
                              {size}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Team Details Section */}
              <div className="p-8 border-b border-gray-100">
                <div className="flex items-center mb-8">
                  <div className="bg-green-50 p-3 rounded-lg mr-4">
                    <Users className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-900">
                      Team Details
                    </h2>
                    <p className="text-gray-600 mt-1">
                      Information about your team and participation
                    </p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Team Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="teamName"
                      placeholder="Enter your team name"
                      value={formData.teamName}
                      onChange={handleChange}
                      className="w-full px-4 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 placeholder-gray-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Team Size <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="teamSize"
                      value={formData.teamSize}
                      onChange={handleChange}
                      className="w-full px-4 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white text-gray-900"
                    >
                      <option value="">Select team size</option>
                      {teamSizes.map((size) => (
                        <option key={size} value={size}>
                          {size} {size === "1" ? "member" : "members"}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Topic/Theme
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        name="topicName"
                        placeholder="Enter topic or theme"
                        value={formData.topicName}
                        onChange={handleChange}
                        className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 placeholder-gray-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Referral Code
                    </label>
                    <div className="relative">
                      <Gift className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        name="referralCode"
                        placeholder="Enter referral code"
                        value={formData.referralCode}
                        onChange={handleChange}
                        className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 placeholder-gray-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Social Media */}
                <div className="mt-8">
                  <h3 className="text-sm font-semibold text-gray-700 mb-4">
                    Social Media Profiles (Optional)
                  </h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="relative">
                      <Instagram className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        name="instagram"
                        placeholder="Instagram username"
                        value={formData.instagram}
                        onChange={handleChange}
                        className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 placeholder-gray-500"
                      />
                    </div>
                    <div className="relative">
                      <Github className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        name="github"
                        placeholder="GitHub username"
                        value={formData.github}
                        onChange={handleChange}
                        className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 placeholder-gray-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Questions Section */}
              <div className="p-8">
                <div className="flex items-center mb-8">
                  <div className="bg-purple-50 p-3 rounded-lg mr-4">
                    <Calendar className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-900">
                      Additional Questions
                    </h2>
                    <p className="text-gray-600 mt-1">
                      Help us understand your background and expectations
                    </p>
                  </div>
                </div>

                <div className="space-y-8">
                  {questions.map((question, index) => (
                    <div key={index}>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        {index + 1}. {question}
                      </label>
                      <textarea
                        placeholder="Please share your thoughts..."
                        value={formData.questions[index]}
                        onChange={(e) =>
                          handleQuestionChange(index, e.target.value)
                        }
                        rows={3}
                        className="w-full px-4 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 placeholder-gray-500 resize-none"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <div className="p-8 border-t border-gray-100">
                <button
                  type="submit"
                  disabled={
                    !isPersonalComplete || !isTeamComplete || submitting
                  }
                  className={`w-full font-semibold py-4 px-6 rounded-lg shadow-sm transition-all duration-200 ${
                    isPersonalComplete && isTeamComplete && !submitting
                      ? "bg-blue-600 hover:bg-blue-700 text-white hover:shadow-md transform hover:-translate-y-0.5"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  {submitting ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                      Processing Registration...
                    </div>
                  ) : (
                    "Complete Registration"
                  )}
                </button>

                {(!isPersonalComplete || !isTeamComplete) && (
                  <p className="text-xs text-gray-500 text-center mt-2">
                    Please complete required fields to submit
                  </p>
                )}
              </div>
            </form>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Event Info Card */}
              <div className="bg-blue-600 rounded-lg shadow-sm p-6 text-white">
                <h3 className="text-lg font-semibold mb-3">
                  Event Information
                </h3>
                <p className="text-blue-100 text-sm mb-6 leading-relaxed">
                  {event?.name || "Event Registration"}
                </p>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-3 text-blue-200" />
                    <span className="text-blue-50">
                      {event?.startDateTime
                        ? new Date(event.startDateTime).toLocaleString()
                        : "Date: To be announced"}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-3 text-blue-200" />
                    <span className="text-blue-50">
                      {event?.virtual
                        ? "Virtual Event"
                        : event?.location?.name || "Location: To be announced"}
                    </span>
                  </div>
                  {event?.settings?.maxSubmissions && (
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-3 text-blue-200" />
                      <span className="text-blue-50">
                        {event.attendeeCounts?.going || 0} /{" "}
                        {event.settings.maxSubmissions} spots filled
                      </span>
                    </div>
                  )}
                  {event?.settings?.submissionDeadline && (
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-3 text-blue-200" />
                      <span className="text-blue-50">
                        Registration closes:{" "}
                        {new Date(
                          event.settings.submissionDeadline
                        ).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Progress Card */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">
                  Registration Progress
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {isPersonalComplete ? (
                        <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                      ) : (
                        <Clock className="w-5 h-5 text-gray-400 mr-3" />
                      )}
                      <span className="text-sm font-medium text-gray-700">
                        Personal Details
                      </span>
                    </div>
                    <span
                      className={`text-xs px-3 py-1 rounded-full font-medium ${
                        isPersonalComplete
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {isPersonalComplete ? "Complete" : "Pending"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {isTeamComplete ? (
                        <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                      ) : (
                        <Clock className="w-5 h-5 text-gray-400 mr-3" />
                      )}
                      <span className="text-sm font-medium text-gray-700">
                        Team Information
                      </span>
                    </div>
                    <span
                      className={`text-xs px-3 py-1 rounded-full font-medium ${
                        isTeamComplete
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {isTeamComplete ? "Complete" : "Pending"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {isQuestionsComplete ? (
                        <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                      ) : (
                        <Clock className="w-5 h-5 text-gray-400 mr-3" />
                      )}
                      <span className="text-sm font-medium text-gray-700">
                        Questions
                      </span>
                    </div>
                    <span
                      className={`text-xs px-3 py-1 rounded-full font-medium ${
                        isQuestionsComplete
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {isQuestionsComplete ? "Complete" : "Pending"}
                    </span>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-100">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-gray-700">
                      Overall Progress
                    </span>
                    <span className="font-semibold text-gray-900">
                      {
                        [
                          isPersonalComplete,
                          isTeamComplete,
                          isQuestionsComplete,
                        ].filter(Boolean).length
                      }
                      /3
                    </span>
                  </div>
                  <div className="mt-2 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${
                          ([
                            isPersonalComplete,
                            isTeamComplete,
                            isQuestionsComplete,
                          ].filter(Boolean).length /
                            3) *
                          100
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterEvent;
