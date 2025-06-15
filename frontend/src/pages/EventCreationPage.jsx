// src/pages/EventCreationPage.jsx

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Calendar,
  Clock,
  MapPin,
  Image,
  Tag,
  Info,
  Save,
  ArrowLeft,
  Upload,
  X,
  Globe,
  Users,
  CheckCircle,
  ChevronRight,
  AlertCircle,
  Settings,
} from "lucide-react";
import eventService from "../services/eventService";
import Sidebar from "../components/common/Navbar";
import CustomFieldsSection from "../components/common/CustomFieldsSection"; // Import the new component

const EventCreationPage = ({ user, onLogout }) => {
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
    category: "",
    isOnline: false,
    location: "",
    locationDetails: {
      address: "",
      city: "",
      state: "",
      country: "",
      postalCode: "",
    },
    virtualMeetingLink: "",
    coverImage: null,
    coverImagePreview: null,
    tags: "",
    maxAttendees: "",
    isPrivate: false,
    requireApproval: false,
    customFields: [], // Add customFields to the form state
  });

  // UI state
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [showLocationDetails, setShowLocationDetails] = useState(false);
  const [activeStep, setActiveStep] = useState(1);
  const [createdEventResponse, setCreatedEventResponse] = useState(null);

  // Form steps - Add a new step for custom fields
  const formSteps = [
    { id: 1, name: "Basic Info" },
    { id: 2, name: "Date & Time" },
    { id: 3, name: "Location" },
    { id: 4, name: "Image & Settings" },
    { id: 5, name: "Custom Fields" }, // New step for custom fields
  ];

  // Handle standard input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Handle location detail input changes
  const handleLocationDetailChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      locationDetails: {
        ...prev.locationDetails,
        [name]: value,
      },
    }));
  };

  // Handle custom fields changes
  const handleCustomFieldsChange = (customFields) => {
    setFormData((prev) => ({
      ...prev,
      customFields,
    }));
  };

  // Handle cover image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];

    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size should not exceed 5MB");
        return;
      }

      // Check file type
      const validTypes = ["image/jpeg", "image/png", "image/jpg", "image/gif"];
      if (!validTypes.includes(file.type)) {
        setError("Please upload a valid image file (JPEG, PNG, or GIF)");
        return;
      }

      // Create a preview URL
      const previewUrl = URL.createObjectURL(file);

      setFormData((prev) => ({
        ...prev,
        coverImage: file,
        coverImagePreview: previewUrl,
      }));

      setError(null);
    }
  };

  // Clear cover image
  const handleClearImage = () => {
    if (formData.coverImagePreview) {
      URL.revokeObjectURL(formData.coverImagePreview);
    }

    setFormData((prev) => ({
      ...prev,
      coverImage: null,
      coverImagePreview: null,
    }));
  };

  // Categories based on your event model
  const categories = [
    { value: "social", label: "Social" },
    { value: "buisness", label: "Business" },
    { value: "education", label: "Education" },
    { value: "entertainment", label: "Arts & Culture" },
    { value: "family", label: "Family" },
    { value: "health", label: "Health & Wellness" },
    { value: "technology", label: "Technology" },
    { value: "career", label: "Career" },
    { value: "other", label: "Other" },
  ];

  // Combine date and time input values
  const combineDateTime = (dateValue, timeValue) => {
    if (!dateValue) return null;

    const datePart = new Date(dateValue);

    if (!timeValue) {
      // If no time provided, set to start of day
      datePart.setHours(0, 0, 0, 0);
      return datePart;
    }

    // Parse time string (format: HH:MM)
    const [hours, minutes] = timeValue.split(":").map(Number);

    datePart.setHours(hours, minutes, 0, 0);
    return datePart;
  };

  // Form navigation
  const nextStep = () => {
    if (validateStep() && activeStep < formSteps.length) {
      setActiveStep(activeStep + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const prevStep = () => {
    if (activeStep > 1) {
      setActiveStep(activeStep - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Validate current step
  const validateStep = () => {
    setError(null);

    switch (activeStep) {
      case 1:
        if (!formData.title) {
          setError("Event title is required");
          return false;
        }
        if (!formData.category) {
          setError("Category is required");
          return false;
        }
        break;

      case 2:
        if (!formData.startDate) {
          setError("Start date is required");
          return false;
        }
        break;

      case 3:
        if (!formData.isOnline && !formData.location) {
          setError("Location is required for in-person events");
          return false;
        }
        break;

      // No validation needed for steps 4 and 5 (Image & Settings, Custom Fields)
      default:
        break;
    }

    return true;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    // Validate all steps before submission
    for (let i = 1; i <= formSteps.length; i++) {
      setActiveStep(i);
      if (!validateStep()) {
        return;
      }
    }

    try {
      setSubmitting(true);

      // Prepare data for API
      const eventData = {
        title: formData.title,
        description: formData.description,
        startDate: combineDateTime(formData.startDate, formData.startTime),
        endDate: formData.endDate
          ? combineDateTime(formData.endDate, formData.endTime)
          : null,
        category: formData.category,
        isOnline: formData.isOnline,
        location: formData.isOnline ? null : formData.location,
        locationDetails: formData.isOnline ? null : formData.locationDetails,
        virtualMeetingLink: formData.isOnline
          ? formData.virtualMeetingLink
          : null,
        coverImage: formData.coverImage,
        tags: formData.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag),
        maxAttendees: formData.maxAttendees
          ? parseInt(formData.maxAttendees)
          : null,
        isPrivate: formData.isPrivate,
        requireApproval: formData.requireApproval,
        customFields: formData.customFields, // Include custom fields in API request
      };

      // Call API to create event
      const response = await eventService.createEvent(eventData);

      // Store response data
      setCreatedEventResponse(response);

      // Set success state
      setSuccess(true);

      // Navigate to the new event page
      setTimeout(() => {
        navigate(
          `/events/${response.data._id || response.data.id}/form/create`
        );
      }, 2000);
    } catch (err) {
      console.error("Error creating event:", err);
      setError(
        err.message || "Failed to create event. Please try again later."
      );
      setSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 1:
        return (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Event Title <span className="text-green-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="e.g., Tech Conference 2025"
                required
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={5}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Describe your event, what attendees can expect, etc."
              ></textarea>
              <p className="mt-1 text-sm text-green-500">
                Tip: A good description helps attendees understand what to
                expect.
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category <span className="text-green-500">*</span>
              </label>
              <div className="relative">
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 appearance-none"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tags
              </label>
              <div className="relative">
                <Tag className="w-5 h-5 text-green-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="e.g., conference, technology, networking (comma separated)"
                />
              </div>
              <p className="mt-1 text-sm text-green-500">
                Enter tags separated by commas to help people discover your
                event.
              </p>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              When is your event?
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date <span className="text-green-500">*</span>
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Time
                </label>
                <input
                  type="time"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  min={formData.startDate}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Time
                </label>
                <input
                  type="time"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Where is your event?
            </h3>

            <div className="mb-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isOnline"
                  name="isOnline"
                  checked={formData.isOnline}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="isOnline"
                  className="ml-2 block text-sm text-gray-700"
                >
                  This is an online event
                </label>
              </div>
            </div>

            {formData.isOnline ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Virtual Meeting Link
                </label>
                <input
                  type="url"
                  name="virtualMeetingLink"
                  value={formData.virtualMeetingLink}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="e.g., https://zoom.us/j/123456789"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Meeting link will only be shared with registered attendees.
                </p>
              </div>
            ) : (
              <div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Venue Name <span className="text-green-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="e.g., Tech Center"
                    required={!formData.isOnline}
                  />
                </div>

                <button
                  type="button"
                  className="text-sm text-green-600 hover:text-green-800 font-medium mb-4"
                  onClick={() => setShowLocationDetails(!showLocationDetails)}
                >
                  {showLocationDetails ? "Hide" : "Add"} location details
                </button>

                {showLocationDetails && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Street Address
                      </label>
                      <input
                        type="text"
                        name="address"
                        value={formData.locationDetails.address}
                        onChange={handleLocationDetailChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="e.g., 123 Main St"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          City
                        </label>
                        <input
                          type="text"
                          name="city"
                          value={formData.locationDetails.city}
                          onChange={handleLocationDetailChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          State/Province
                        </label>
                        <input
                          type="text"
                          name="state"
                          value={formData.locationDetails.state}
                          onChange={handleLocationDetailChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Postal Code
                        </label>
                        <input
                          type="text"
                          name="postalCode"
                          value={formData.locationDetails.postalCode}
                          onChange={handleLocationDetailChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Country
                        </label>
                        <input
                          type="text"
                          name="country"
                          value={formData.locationDetails.country}
                          onChange={handleLocationDetailChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );

      case 4:
        return (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Event Image & Settings
            </h3>

            {/* Cover Image Upload */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cover Image
              </label>

              {formData.coverImagePreview ? (
                <div className="relative rounded-lg overflow-hidden mb-4">
                  <img
                    src={formData.coverImagePreview}
                    alt="Event cover preview"
                    className="w-full h-48 object-cover"
                  />
                  <button
                    type="button"
                    onClick={handleClearImage}
                    className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md hover:bg-gray-100"
                  >
                    <X className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 mb-4 flex flex-col items-center justify-center">
                  <Image className="w-12 h-12 text-gray-400 mb-3" />
                  <p className="text-sm text-gray-500 mb-2">
                    Upload an image to attract attendees
                  </p>
                  <p className="text-xs text-gray-400 mb-4">
                    Recommended size: 1200×600px (JPEG or PNG, max 5MB)
                  </p>
                  <label className="cursor-pointer px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                    <input
                      type="file"
                      className="sr-only"
                      accept="image/jpeg,image/png,image/jpg,image/gif"
                      onChange={handleImageUpload}
                    />
                    <Upload className="w-4 h-4 inline-block mr-1" />
                    Choose Image
                  </label>
                </div>
              )}
            </div>

            {/* Event Settings */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Maximum Attendees
                </label>
                <input
                  type="number"
                  name="maxAttendees"
                  value={formData.maxAttendees}
                  onChange={handleInputChange}
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Leave blank for unlimited"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isPrivate"
                  name="isPrivate"
                  checked={formData.isPrivate}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="isPrivate"
                  className="ml-2 block text-sm text-gray-700"
                >
                  Private event (only visible to invited users)
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="requireApproval"
                  name="requireApproval"
                  checked={formData.requireApproval}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="requireApproval"
                  className="ml-2 block text-sm text-gray-700"
                >
                  Require approval for registrations
                </label>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Custom Registration Fields
            </h3>
            <p className="text-gray-600 mb-6">
              Add custom fields to collect additional information from attendees
              during registration.
            </p>

            {/* Use the CustomFieldsSection component */}
            <CustomFieldsSection
              customFields={formData.customFields}
              onChange={handleCustomFieldsChange}
            />

            <div className="mt-6 border border-green-100 bg-green-50 rounded-lg p-4">
              <h4 className="font-medium text-green-800 mb-3">
                Example Custom Fields
              </h4>

              <div className="flex items-start mb-3">
                <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-1">
                  <Info className="h-4 w-4 text-green-600" />
                </div>
                <div className="ml-3">
                  <h4 className="font-medium text-gray-800">
                    Dietary Restrictions
                  </h4>
                  <p className="text-sm text-gray-600">
                    For events with meals or refreshments
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-1">
                  <Users className="h-4 w-4 text-green-600" />
                </div>
                <div className="ml-3">
                  <h4 className="font-medium text-gray-800">
                    Company or Organization
                  </h4>
                  <p className="text-sm text-gray-600">
                    For networking events or business gatherings
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Success state render
  if (success) {
    return (
      <div className="flex h-screen">
        {/* Integrate the existing Sidebar */}
        <Sidebar user={user || {}} onLogout={onLogout} />

        {/* Main content with no gap */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-4 py-12">
            <div className="text-center bg-white rounded-lg shadow-md p-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h1 className="text-3xl font-bold text-green-900 mb-4">
                Event Created Successfully!
              </h1>
              <p className="text-lg text-gray-700 mb-8">
                Your event has been created and is now visible to attendees.
              </p>
              <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
                <button
                  className="px-6 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
                  onClick={() =>
                    navigate(
                      `/events/${
                        createdEventResponse?.data?._id ||
                        createdEventResponse?.data?.id ||
                        "new"
                      }`
                    )
                  }
                >
                  View Event
                </button>
                <button
                  className="px-6 py-2 border border-green-300 text-base font-medium rounded-md shadow-sm text-green-700 bg-white hover:bg-green-50"
                  onClick={() => navigate("/events/new")}
                >
                  Create Another Event
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex">
      {/* The sidebar component - moved higher in the z-index stack */}
      <div className="z-20 relative">
        <Sidebar user={user || {}} onLogout={onLogout} />
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="px-16 py-4 flex items-center justify-between">
            <Link
              to="/events"
              className="text-green-500 hover:text-green-600 flex items-center"
            >
              <ArrowLeft className="w-5 h-5 mr-1" />
              <span>Back to Events</span>
            </Link>

            <h1 className="text-xl font-semibold text-gray-900">
              Create New Event
            </h1>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              {submitting ? "Creating..." : "Create Event"}
            </button>
          </div>

          {/* Step Indicators */}
          <div className="px-4 pb-4">
            <div className="flex justify-between">
              {formSteps.map((step, index) => (
                <div
                  key={step.id}
                  className={`flex items-center ${
                    index < formSteps.length - 1 ? "flex-1" : ""
                  }`}
                  onClick={() =>
                    step.id <= activeStep ? setActiveStep(step.id) : null
                  }
                  style={{
                    cursor: step.id <= activeStep ? "pointer" : "default",
                  }}
                >
                  <div
                    className={`flex items-center justify-center w-8 h-8 rounded-full ${
                      activeStep === step.id
                        ? "bg-green-500 text-white"
                        : activeStep > step.id
                        ? "bg-green-100 text-green-500 border border-green-500"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {activeStep > step.id ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      step.id
                    )}
                  </div>

                  <span
                    className={`ml-2 text-sm font-medium ${
                      activeStep === step.id
                        ? "text-gray-900"
                        : activeStep > step.id
                        ? "text-green-500"
                        : "text-gray-400"
                    }`}
                  >
                    {step.name}
                  </span>

                  {index < formSteps.length - 1 && (
                    <div
                      className={`h-0.5 flex-1 mx-3 ${
                        activeStep > step.id ? "bg-green-500" : "bg-gray-200"
                      }`}
                    ></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-4 py-6">
          {/* Error message */}
          {error && (
            <div className="mb-4 bg-red-50 border-l-4 border-green-500 p-4 rounded-md">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-green-500" />
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
          >
            {renderStepContent()}

            {/* Navigation Buttons */}
            <div className="mt-6 flex justify-between">
              <button
                type="button"
                onClick={prevStep}
                disabled={activeStep === 1}
                className={`px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${
                  activeStep === 1 ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                Previous
              </button>

              {activeStep < formSteps.length ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Next Step
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={submitting}
                  className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${
                    submitting ? "opacity-75 cursor-not-allowed" : ""
                  }`}
                >
                  {submitting ? "Creating..." : "Create Event"}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EventCreationPage;
