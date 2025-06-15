import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ticketService from '../services/ticketService';

const TicketManagementPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [ticketTypes, setTicketTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentTicket, setCurrentTicket] = useState(null);
  // Add a ref to track if the component is mounted
  const isMounted = useRef(true);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    quantity: 0,
    isActive: true,
    startDate: '',
    endDate: '',
    maxPerOrder: 10
  });

  // Clean up on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    // Only fetch if the component is mounted and we have an eventId
    if (isMounted.current && eventId) {
      fetchTicketTypes();
    }
  }, [eventId]);

  const fetchTicketTypes = async () => {
    // Don't try to fetch if we're already loading or there's no eventId
    if (!eventId) return;
    
    try {
      setLoading(true);
      const result = await ticketService.getEventTicketTypes(eventId);
      // Only update state if the component is still mounted
      if (isMounted.current) {
        setTicketTypes(result || []);
        setLoading(false);
        // Clear any existing error when fetch succeeds
        setError(null);
      }
    } catch (err) {
      console.error('Failed to fetch ticket types:', err);
      // Only update state if the component is still mounted
      if (isMounted.current) {
        setError('Failed to load ticket types. Please try again.');
        setLoading(false);
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseFloat(value) : value
    }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: 0,
      quantity: 0,
      isActive: true,
      startDate: '',
      endDate: '',
      maxPerOrder: 10
    });
    setCurrentTicket(null);
  };

  const handleAddTicket = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await ticketService.createTicketType(eventId, formData);
      setShowAddModal(false);
      resetForm();
      await fetchTicketTypes();
    } catch (err) {
      console.error('Failed to create ticket type:', err);
      if (isMounted.current) {
        setError('Failed to create ticket type. Please try again.');
        setLoading(false);
      }
    }
  };

  const handleEditClick = (ticket) => {
    setCurrentTicket(ticket);
    setFormData({
      name: ticket.name || '',
      description: ticket.description || '',
      price: ticket.price || 0,
      quantity: ticket.quantity || 0,
      isActive: ticket.isActive !== false,
      startDate: ticket.startDate ? new Date(ticket.startDate).toISOString().split('T')[0] : '',
      endDate: ticket.endDate ? new Date(ticket.endDate).toISOString().split('T')[0] : '',
      maxPerOrder: ticket.maxPerOrder || 10
    });
    setShowEditModal(true);
  };

  const handleUpdateTicket = async (e) => {
    e.preventDefault();
    if (!currentTicket) return;

    try {
      setLoading(true);
      await ticketService.updateTicketType(eventId, currentTicket.id, formData);
      setShowEditModal(false);
      resetForm();
      await fetchTicketTypes();
    } catch (err) {
      console.error('Failed to update ticket type:', err);
      if (isMounted.current) {
        setError('Failed to update ticket type. Please try again.');
        setLoading(false);
      }
    }
  };

  const handleToggleActive = async (ticketId, isCurrentlyActive) => {
    try {
      setLoading(true);
      await ticketService.updateTicketType(eventId, ticketId, {
        isActive: !isCurrentlyActive
      });
      await fetchTicketTypes();
    } catch (err) {
      console.error('Failed to toggle ticket status:', err);
      if (isMounted.current) {
        setError('Failed to update ticket status. Please try again.');
        setLoading(false);
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  // If there's an error, show it in a dismissible alert
  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
          <p>{error}</p>
          <button 
            className="mt-2 bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
            onClick={() => setError(null)}
          >
            Dismiss
          </button>
        </div>
        <button 
          onClick={fetchTicketTypes}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Retry Loading Tickets
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Ticket Management</h1>
        <div className="space-x-2">
          <button 
            onClick={() => navigate(`/events/${eventId}/attendees`)}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Manage Attendees
          </button>
          <button 
            onClick={() => navigate(`/events/${eventId}/check-in`)}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          >
            Go to Check-In
          </button>
        </div>
      </div>
      
      <div className="bg-white rounded shadow p-4 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Ticket Types</h2>
          <button 
            onClick={() => {
              resetForm();
              setShowAddModal(true);
            }}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
            disabled={loading}
          >
            Add New Ticket
          </button>
        </div>
        
        {loading ? (
          <div className="text-center p-4">Loading ticket types...</div>
        ) : ticketTypes.length === 0 ? (
          <div className="text-center p-4">
            <p>No ticket types found. Create your first ticket type to start selling.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name & Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sales Period
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {ticketTypes.map((ticket) => (
                  <tr key={ticket.id}>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{ticket.name}</div>
                      <div className="text-sm text-gray-500">{ticket.description || 'No description'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatPrice(ticket.price)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {ticket.quantity === -1 ? 'Unlimited' : `${ticket.quantity} total`}
                      {ticket.sold ? ` (${ticket.sold} sold)` : ''}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(ticket.startDate)} - {formatDate(ticket.endDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        ticket.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {ticket.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button 
                        onClick={() => handleEditClick(ticket)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                        disabled={loading}
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleToggleActive(ticket.id, ticket.isActive)}
                        className={`${
                          ticket.isActive 
                            ? 'text-red-600 hover:text-red-900' 
                            : 'text-green-600 hover:text-green-900'
                        }`}
                        disabled={loading}
                      >
                        {ticket.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Add Ticket Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded shadow-lg p-6 w-full max-w-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Add New Ticket Type</h2>
              <button 
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
                className="text-gray-500 hover:text-gray-700"
                disabled={loading}
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleAddTicket}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                  Ticket Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="VIP, General Admission, etc."
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="Describe what this ticket includes..."
                  rows="3"
                ></textarea>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="price">
                    Price
                  </label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="quantity">
                    Quantity (Use -1 for unlimited)
                  </label>
                  <input
                    type="number"
                    id="quantity"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    min="-1"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                  className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded mr-2"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                  disabled={loading}
                >
                  {loading ? 'Creating...' : 'Create Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Edit Ticket Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded shadow-lg p-6 w-full max-w-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Edit Ticket Type</h2>
              <button 
                onClick={() => {
                  setShowEditModal(false);
                  resetForm();
                }}
                className="text-gray-500 hover:text-gray-700"
                disabled={loading}
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleUpdateTicket}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="edit-name">
                  Ticket Name
                </label>
                <input
                  type="text"
                  id="edit-name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="VIP, General Admission, etc."
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="edit-description">
                  Description
                </label>
                <textarea
                  id="edit-description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="Describe what this ticket includes..."
                  rows="3"
                ></textarea>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="edit-price">
                    Price
                  </label>
                  <input
                    type="number"
                    id="edit-price"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="edit-quantity">
                    Quantity (Use -1 for unlimited)
                  </label>
                  <input
                    type="number"
                    id="edit-quantity"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    min="-1"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="edit-startDate">
                    Sale Start Date
                  </label>
                  <input
                    type="date"
                    id="edit-startDate"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="edit-endDate">
                    Sale End Date
                  </label>
                  <input
                    type="date"
                    id="edit-endDate"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="edit-maxPerOrder">
                    Max Per Order
                  </label>
                  <input
                    type="number"
                    id="edit-maxPerOrder"
                    name="maxPerOrder"
                    value={formData.maxPerOrder}
                    onChange={handleInputChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    min="1"
                    required
                  />
                </div>
                <div className="flex items-center mt-8">
                  <input
                    type="checkbox"
                    id="edit-isActive"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  <label className="text-gray-700 text-sm font-bold" htmlFor="edit-isActive">
                    Active (available for purchase)
                  </label>
                </div>
              </div>
              <div className="flex justify-end mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    resetForm();
                  }}
                  className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded mr-2"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                  disabled={loading}
                >
                  {loading ? 'Updating...' : 'Update Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketManagementPage;
