import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import ticketService from '../services/ticketService';

const AttendeeManagementPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [attendees, setAttendees] = useState([]);
  const [stats, setStats] = useState({
    totalTickets: 0,
    checkedIn: 0,
    remaining: 0,
    checkInRate: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    checkInStatus: 'all',
    page: 1,
    limit: 20
  });
  const [refreshKey, setRefreshKey] = useState(0); // Used to force refreshes

  // Function to fetch attendees data - extracted so it can be called manually
  const fetchAttendees = async () => {
    try {
      setLoading(true);
      const result = await ticketService.getEventTickets(eventId, {
        search: searchTerm,
        checkInStatus: filters.checkInStatus !== 'all' ? filters.checkInStatus : undefined,
        page: filters.page,
        limit: filters.limit
      });
      
      console.log("API Response:", result);
      
      const tickets = result.tickets || [];
      
      // Calculate stats manually from tickets to ensure accuracy
      const totalTickets = tickets.length;
      const checkedInCount = tickets.filter(ticket => ticket.checkedIn || ticket.isCheckedIn).length;
      
      // Create calculated stats object
      const calculatedStats = {
        totalTickets,
        checkedIn: checkedInCount,
        // Ensure no-shows is never negative
        noShows: Math.max(0, totalTickets - checkedInCount),
        // Calculate check-in rate, handling division by zero
        checkInRate: totalTickets > 0 ? Math.round((checkedInCount / totalTickets) * 100) : 0
      };
      
      console.log("Calculated Stats:", calculatedStats);
      
      setAttendees(tickets);
      // Use API stats if they exist, otherwise use calculated stats
      setStats(calculatedStats);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch attendees:', err);
      setError('Failed to load attendee data. Please try again.');
      setLoading(false);
    }
  };

  // Initial data load and when filters/search change
  useEffect(() => {
    fetchAttendees();
  }, [eventId, searchTerm, filters, refreshKey]);

  // Check for return from check-in page
  useEffect(() => {
    if (location.state?.checkedIn) {
      // If returning from check-in with success, refresh data
      console.log('Detected successful check-in, refreshing data...');
      setRefreshKey(prevKey => prevKey + 1); // Force refresh
      
      // Clear the state so we don't keep refreshing
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, location.pathname]);

  const handleRefresh = () => {
    setRefreshKey(prevKey => prevKey + 1); // Increment to trigger useEffect
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Reset to first page when searching
    setFilters(prev => ({ ...prev, page: 1 }));
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const handleExportReport = async (format) => {
    try {
      setLoading(true);
      const report = await ticketService.generateEventReport(eventId, format);
      
      if (format === 'csv') {
        // Handle CSV blob
        const url = window.URL.createObjectURL(report);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `event-${eventId}-attendees.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
      } else {
        // Handle JSON data (maybe display in modal or download as JSON)
        const dataStr = JSON.stringify(report, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = window.URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `event-${eventId}-attendees.json`);
        document.body.appendChild(link);
        link.click();
        link.remove();
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Failed to export report:', err);
      setError('Failed to generate report. Please try again.');
      setLoading(false);
    }
  };

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
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Attendee Management</h1>
        <div className="space-x-2">
          <button 
            onClick={handleRefresh}
            className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
            disabled={loading}
          >
            {loading ? 'Refreshing...' : 'Refresh Data'}
          </button>
          <button 
            onClick={() => navigate(`/events/${eventId}/check-in`)}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          >
            Go to Check-In
          </button>
          <button 
            onClick={() => navigate(`/events/${eventId}/tickets`)}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Manage Tickets
          </button>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-gray-500">Total Attendees</h3>
          <p className="text-2xl font-bold">{stats.totalTickets || 0}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-gray-500">Checked In</h3>
          <p className="text-2xl font-bold">{stats.checkedIn || 0}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-gray-500">No-Shows</h3>
          <p className="text-2xl font-bold">{stats.noShows || 0}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-gray-500">Check-In Rate</h3>
          <p className="text-2xl font-bold">
            {`${stats.checkInRate || 0}%`}
          </p>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white p-4 rounded shadow mb-6">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
          <div className="flex-grow">
            <input
              type="text"
              placeholder="Search by name, email, or ticket code..."
              className="w-full p-2 border rounded"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div>
            <select
              name="checkInStatus"
              value={filters.checkInStatus}
              onChange={handleFilterChange}
              className="w-full p-2 border rounded"
            >
              <option value="all">All Statuses</option>
              <option value="true">Checked In</option>
              <option value="false">Not Checked In</option>
            </select>
          </div>
          <div>
            <button
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              disabled={loading}
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </form>
      </div>

      {/* Export Section */}
      <div className="bg-white p-4 rounded shadow mb-6">
        <h2 className="text-lg font-semibold mb-2">Export Data</h2>
        <div className="flex gap-2">
          <button
            onClick={() => handleExportReport('csv')}
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
            disabled={loading}
          >
            Export as CSV
          </button>
          <button
            onClick={() => handleExportReport('json')}
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
            disabled={loading}
          >
            Export as JSON
          </button>
        </div>
      </div>

      {/* Attendees Table */}
      <div className="bg-white rounded shadow overflow-x-auto">
        {loading ? (
          <div className="p-4 text-center">Loading attendees...</div>
        ) : attendees.length === 0 ? (
          <div className="p-4 text-center">No attendees found.</div>
        ) : (
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Attendee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ticket
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Check-In Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {attendees.map((ticket) => (
                <tr key={ticket.id || ticket._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {ticket.attendeeName || 
                       (ticket.owner && `${ticket.owner.firstName} ${ticket.owner.lastName}`) || 
                       'Unknown'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {ticket.attendeeEmail || 
                       (ticket.owner && ticket.owner.email) || 
                       'No email'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {(ticket.ticketType && ticket.ticketType.name) || 'Standard'}
                    </div>
                    <div className="text-sm text-gray-500">
                      Code: {ticket.verificationCode || 
                             (ticket.qrSecret && ticket.qrSecret.substring(0, 6)) || 
                             'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      ticket.checkedIn || ticket.isCheckedIn
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {ticket.checkedIn || ticket.isCheckedIn ? 'Checked In' : 'Not Checked In'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {ticket.checkInTime || ticket.checkedInAt 
                      ? new Date(ticket.checkInTime || ticket.checkedInAt).toLocaleString() 
                      : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button 
                      onClick={() => {
                        // Navigate to check-in page with pre-filled verification code
                        const code = ticket.verificationCode || 
                                    (ticket.qrSecret && ticket.qrSecret.substring(0, 6));
                        
                        if (code) {
                          navigate(`/events/${eventId}/check-in?code=${code}`, {
                            // Pass state to indicate where we're coming from
                            state: { returnTo: 'attendee-management' }
                          });
                        } else {
                          alert('No verification code available for this ticket.');
                        }
                      }}
                      className={`text-blue-600 hover:text-blue-900 ${
                        (ticket.checkedIn || ticket.isCheckedIn) ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                      disabled={ticket.checkedIn || ticket.isCheckedIn}
                    >
                      {(ticket.checkedIn || ticket.isCheckedIn) ? 'Already Checked In' : 'Check-In'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      <div className="mt-4 flex justify-between items-center">
        <div>
          <span className="text-sm text-gray-700">
            Showing page {filters.page} of attendees
          </span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handlePageChange(filters.page - 1)}
            disabled={filters.page <= 1 || loading}
            className={`px-3 py-1 rounded ${
              filters.page <= 1 || loading
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-700 text-white'
            }`}
          >
            Previous
          </button>
          <button
            onClick={() => handlePageChange(filters.page + 1)}
            disabled={attendees.length < filters.limit || loading}
            className={`px-3 py-1 rounded ${
              attendees.length < filters.limit || loading
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-700 text-white'
            }`}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default AttendeeManagementPage;