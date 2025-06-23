import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Ticket,
  Plus,
  ArrowLeft,
  Save,
  Trash2,
  AlertCircle,
  Info,
  Calendar,
  DollarSign,
  Users,
  CheckCircle,
} from "lucide-react";
import eventService from "../services/eventService";
import ticketService from "../services/ticketService";
import { useToast } from "../components/common/Toast";

const CreateTicketsPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  // State
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Ticket types state - the form supports creating multiple ticket types at once
  const [ticketTypes, setTicketTypes] = useState([
    {
      name: "",
      price: "",
      quantity: "",
      description: "",
      startSalesDate: "",
      endSalesDate: "",
      maxPerOrder: "",
      isVIP: false,
      hidden: false,
    },
  ]);

  // Fetch event details
  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        setLoading(true);
        const eventData = await eventService.getEvent(eventId);

        if (!eventData) {
          throw new Error("Event not found");
        }

        setEvent(eventData);

        // Check if event has existing ticket types
        const ticketTypesResponse = await ticketService.getEventTicketTypes(
          eventId,
          true
        );

        // Only show notification if there are actual existing tickets
        const existingTickets = ticketTypesResponse.data || [];
        if (
          existingTickets.length > 0 &&
          existingTickets.some(
            (ticket) => ticket.name && ticket.price !== undefined
          ) &&
          toast
        ) {
          toast({
            title: "Tickets Already Exist",
            description: `This event already has ${existingTickets.length} ticket types. You can add more if needed.`,
            status: "info",
            duration: 5000,
            isClosable: true,
          });
        }

        setError(null);
      } catch (err) {
        console.error("Error fetching event data:", err);
        setError(
          err.message || "Failed to load event details. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    if (eventId) {
      fetchEventDetails();
    }
  }, [eventId, toast]);

  // Add a new ticket type form
  const addTicketType = () => {
    setTicketTypes([
      ...ticketTypes,
      {
        name: "",
        price: "",
        quantity: "",
        description: "",
        startSalesDate: "",
        endSalesDate: "",
        maxPerOrder: "",
        isVIP: false,
        hidden: false,
      },
    ]);
  };

  
  // Remove a ticket type form
  const removeTicketType = (index) => {
    if (ticketTypes.length <= 1) {
      // Always keep at least one ticket type form
      return;
    }

    const updatedTicketTypes = [...ticketTypes];
    updatedTicketTypes.splice(index, 1);
    setTicketTypes(updatedTicketTypes);
  };

  // Handle input changes for a specific ticket type
  const handleInputChange = (index, field, value) => {
    const updatedTicketTypes = [...ticketTypes];
    updatedTicketTypes[index][field] = value;
    setTicketTypes(updatedTicketTypes);
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "";

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "";
      }

      return date.toLocaleDateString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "";
    }
  };

  // Validate ticket types before submission
  const validateTicketTypes = () => {
    // Check for at least one valid ticket type
    const hasValidTicket = ticketTypes.some(
      (ticket) => ticket.name && (ticket.price || ticket.price === 0)
    );

    if (!hasValidTicket) {
      return "At least one ticket type with a name and price is required";
    }

    // Validate each ticket type
    for (let i = 0; i < ticketTypes.length; i++) {
      const ticket = ticketTypes[i];

      // Skip empty ticket types (will be filtered out later)
      if (!ticket.name && !ticket.price && !ticket.quantity) {
        continue;
      }

      if (!ticket.name.trim()) {
        return `Ticket type ${i + 1} requires a name`;
      }

      if (ticket.price === "" || isNaN(parseFloat(ticket.price))) {
        return `Ticket type ${i + 1} requires a valid price`;
      }

      if (
        ticket.quantity &&
        (isNaN(parseInt(ticket.quantity)) || parseInt(ticket.quantity) <= 0)
      ) {
        return `Ticket type ${
          i + 1
        } requires a valid quantity (must be a positive number)`;
      }

      if (
        ticket.maxPerOrder &&
        (isNaN(parseInt(ticket.maxPerOrder)) ||
          parseInt(ticket.maxPerOrder) <= 0)
      ) {
        return `Ticket type ${
          i + 1
        } requires a valid max per order (must be a positive number)`;
      }

      // Validate date ranges
      if (ticket.startSalesDate && ticket.endSalesDate) {
        const start = new Date(ticket.startSalesDate);
        const end = new Date(ticket.endSalesDate);

        if (start > end) {
          return `Ticket type ${
            i + 1
          } has an invalid date range (start date is after end date)`;
        }
      }
    }

    return null; // No validation errors
  };

  // Submit form to create ticket types
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate ticket types
    const validationError = validateTicketTypes();
    if (validationError) {
      setError(validationError);

      if (toast) {
        toast({
          title: "Validation Error",
          description: validationError,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }

      return;
    }

    try {
      setSaving(true);
      setError(null);

      // Filter out empty ticket types and prepare data for API
      const validTicketTypes = ticketTypes
        .filter((ticket) => ticket.name.trim())
        .map((ticket) => ({
          name: ticket.name.trim(),
          price: parseFloat(ticket.price) || 0,
          quantity: ticket.quantity ? parseInt(ticket.quantity) : null,
          description: ticket.description.trim(),
          startSalesDate: ticket.startSalesDate || null,
          endSalesDate: ticket.endSalesDate || null,
          maxPerOrder: ticket.maxPerOrder ? parseInt(ticket.maxPerOrder) : null,
          isVIP: ticket.isVIP,
          hidden: ticket.hidden,
        }));

      // Create each ticket type sequentially
      for (const ticketType of validTicketTypes) {
        await ticketService.createTicketType(eventId, ticketType);
      }

      // Handle success
      handleSuccess(validTicketTypes.length);
    } catch (err) {
      console.error("Error creating ticket types:", err);
      setError(
        err.message || "Failed to create ticket types. Please try again."
      );

      if (toast) {
        toast({
          title: "Error",
          description:
            err.message || "Failed to create ticket types. Please try again.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    } finally {
      setSaving(false);
    }
  };

  // Handle successful ticket creation
  const handleSuccess = (ticketCount) => {
    setSuccess(true);

    if (toast) {
      toast({
        title: "Tickets Created",
        description: `Successfully created ${ticketCount} ticket types for your event.`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    }

    // Navigate to event page after short delay
    setTimeout(() => {
      navigate(`/events/${eventId}`);
    }, 2000);
  };

  // Handle skipping ticket creation
  const handleSkip = () => {
    navigate(`/events/${eventId}`);
  };

  if (success) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Event Setup Complete!
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Your event and tickets have been created successfully. You can now
            manage your event.
          </p>
          <div className="flex justify-center space-x-4">
            <button
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700"
              onClick={() => navigate(`/events/${eventId}`)}
            >
              View Event
            </button>
            <button
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
              onClick={() => navigate("/events/my-events")}
            >
              Manage My Events
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-12">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => navigate(`/events/${eventId}`)}
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                <span>Back to Event</span>
              </button>
            </div>
            <h1 className="text-xl font-semibold text-gray-900">
              Create Tickets
            </h1>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={handleSkip}
                className="text-gray-700 hover:text-gray-900 font-medium"
              >
                Skip
              </button>
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700"
                form="create-tickets-form"
                onClick={handleSubmit}
                disabled={saving}
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? "Saving..." : "Create Tickets"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-t-4 border-orange-500 border-solid rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading event details...</p>
          </div>
        ) : error ? (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">{error}</p>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Event Info */}
            {event && (
              <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                <div className="flex flex-col md:flex-row items-start md:items-center">
                  <div className="w-full md:w-24 h-20 md:h-16 rounded-lg overflow-hidden mr-4 mb-4 md:mb-0">
                    <img
                      src={event.coverImage?.url || "/api/placeholder/200/100"}
                      alt={event.title || event.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      {event.title || event.name}
                    </h2>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <Calendar className="w-4 h-4 mr-1" />
                      <span>
                        {formatDate(event.startDate || event.startDateTime)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Instruction Panel */}
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <Info className="h-5 w-5 text-blue-500" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-700">
                    Create one or more ticket types for your event. You can add
                    more ticket types later or modify existing ones.
                  </p>
                </div>
              </div>
            </div>

            {/* Ticket Types Form */}
            <form id="create-tickets-form" onSubmit={handleSubmit}>
              {ticketTypes.map((ticket, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg shadow-sm p-6 mb-6"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <Ticket className="w-5 h-5 mr-2 text-orange-500" />
                      Ticket Type #{index + 1}
                    </h3>

                    <button
                      type="button"
                      onClick={() => removeTicketType(index)}
                      className="text-red-500 hover:text-red-700"
                      disabled={ticketTypes.length <= 1}
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Name */}
                    <div>
                      <label
                        htmlFor={`ticket-name-${index}`}
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Ticket Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id={`ticket-name-${index}`}
                        value={ticket.name}
                        onChange={(e) =>
                          handleInputChange(index, "name", e.target.value)
                        }
                        placeholder="e.g., General Admission, VIP Pass"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        required
                      />
                    </div>

                    {/* Price */}
                    <div>
                      <label
                        htmlFor={`ticket-price-${index}`}
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Price <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <DollarSign className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="number"
                          id={`ticket-price-${index}`}
                          value={ticket.price}
                          onChange={(e) =>
                            handleInputChange(index, "price", e.target.value)
                          }
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                          className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                          required
                        />
                      </div>
                    </div>

                    {/* Quantity */}
                    <div>
                      <label
                        htmlFor={`ticket-quantity-${index}`}
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Quantity
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Users className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="number"
                          id={`ticket-quantity-${index}`}
                          value={ticket.quantity}
                          onChange={(e) =>
                            handleInputChange(index, "quantity", e.target.value)
                          }
                          min="1"
                          placeholder="Leave blank for unlimited"
                          className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        Leave blank for unlimited tickets
                      </p>
                    </div>

                    {/* Max Per Order */}
                    <div>
                      <label
                        htmlFor={`ticket-max-per-order-${index}`}
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Max Per Order
                      </label>
                      <input
                        type="number"
                        id={`ticket-max-per-order-${index}`}
                        value={ticket.maxPerOrder}
                        onChange={(e) =>
                          handleInputChange(
                            index,
                            "maxPerOrder",
                            e.target.value
                          )
                        }
                        min="1"
                        placeholder="Leave blank for unlimited"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Maximum tickets per customer
                      </p>
                    </div>

                    {/* Sales Start Date */}
                    <div>
                      <label
                        htmlFor={`ticket-start-date-${index}`}
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Sales Start Date
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Calendar className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="date"
                          id={`ticket-start-date-${index}`}
                          value={ticket.startSalesDate}
                          onChange={(e) =>
                            handleInputChange(
                              index,
                              "startSalesDate",
                              e.target.value
                            )
                          }
                          className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                    </div>

                    {/* Sales End Date */}
                    <div>
                      <label
                        htmlFor={`ticket-end-date-${index}`}
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Sales End Date
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Calendar className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="date"
                          id={`ticket-end-date-${index}`}
                          value={ticket.endSalesDate}
                          onChange={(e) =>
                            handleInputChange(
                              index,
                              "endSalesDate",
                              e.target.value
                            )
                          }
                          min={ticket.startSalesDate}
                          className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                    </div>

                    {/* Description */}
                    <div className="md:col-span-2">
                      <label
                        htmlFor={`ticket-description-${index}`}
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Description
                      </label>
                      <textarea
                        id={`ticket-description-${index}`}
                        value={ticket.description}
                        onChange={(e) =>
                          handleInputChange(
                            index,
                            "description",
                            e.target.value
                          )
                        }
                        rows="3"
                        placeholder="Describe what's included with this ticket type"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      ></textarea>
                    </div>

                    {/* Ticket Options */}
                    <div className="md:col-span-2 flex flex-wrap gap-4 mt-2">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id={`ticket-vip-${index}`}
                          checked={ticket.isVIP}
                          onChange={(e) =>
                            handleInputChange(index, "isVIP", e.target.checked)
                          }
                          className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                        />
                        <label
                          htmlFor={`ticket-vip-${index}`}
                          className="ml-2 block text-sm text-gray-700"
                        >
                          VIP Ticket
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id={`ticket-hidden-${index}`}
                          checked={ticket.hidden}
                          onChange={(e) =>
                            handleInputChange(index, "hidden", e.target.checked)
                          }
                          className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                        />
                        <label
                          htmlFor={`ticket-hidden-${index}`}
                          className="ml-2 block text-sm text-gray-700"
                        >
                          Hidden (not publicly visible)
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Add Another Ticket Type Button */}
              <div className="mb-6">
                <button
                  type="button"
                  onClick={addTicketType}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Another Ticket Type
                </button>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={handleSkip}
                  className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Skip for Now
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                    saving
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-orange-600 hover:bg-orange-700"
                  }`}
                >
                  {saving ? (
                    <>
                      <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
                      Creating Tickets...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Create Tickets
                    </>
                  )}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default CreateTicketsPage;
