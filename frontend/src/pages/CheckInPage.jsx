import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode'; // Make sure to install this package
import ticketService from '../services/ticketService';

const CheckInPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  
  // State management
  const [verificationCode, setVerificationCode] = useState(searchParams.get('code') || '');
  const [scannerActive, setScannerActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [attendeeInfo, setAttendeeInfo] = useState(null);
  const [recentCheckIns, setRecentCheckIns] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    checkedIn: 0,
    remaining: 0
  });

  // Refs
  const inputRef = useRef(null);
  const html5QrCodeRef = useRef(null);
  const scannerRef = useRef(null);
  
  useEffect(() => {
    if (searchParams.get('code')) {
      // If code is provided in URL, focus on the submit button
      handleVerifyTicket();
    } else {
      // Otherwise focus on the input field
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
    
    // Fetch recent check-ins and stats on mount
    fetchEventStats();
    fetchRecentCheckIns();
    
    // Cleanup function
    return () => {
      stopScanner();
    };
  }, []);

  const fetchEventStats = async () => {
    try {
      const statsData = await ticketService.getEventBookingStats(eventId);
      console.log("Stats data:", statsData);
      setStats({
        total: statsData.totalTickets || 0,
        checkedIn: statsData.ticketsCheckedIn || statsData.checkedIn || 0,
        remaining: Math.max(0, (statsData.totalTickets || 0) - (statsData.ticketsCheckedIn || statsData.checkedIn || 0))
      });
    } catch (err) {
      console.error('Failed to fetch event stats:', err);
      // Don't show error for stats, just log it
    }
  };

  const fetchRecentCheckIns = async () => {
    try {
      // We'll use the getEventTickets method with specific filters
      const result = await ticketService.getEventTickets(eventId, {
        checkInStatus: 'true',
        limit: 5,
        sortBy: 'checkInTime',
        sortOrder: 'desc'
      });
      
      setRecentCheckIns(result.tickets || []);
    } catch (err) {
      console.error('Failed to fetch recent check-ins:', err);
      // Don't show error for recent check-ins, just log it
    }
  };

  const handleVerifyTicket = async (e) => {
    if (e) e.preventDefault();
    
    if (!verificationCode.trim()) {
      setError('Please enter a verification code');
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccess(null);
    setAttendeeInfo(null);
    
    try {
      console.log(`Verifying ticket with code: ${verificationCode}`);
      // Verify ticket by code
      const result = await ticketService.verifyTicketByCode(eventId, verificationCode.trim());
      console.log("Verification result:", result);
      
      // If the ticket exists but hasn't been checked in
      if (result && result.ticket) {
        setAttendeeInfo(result.ticket);
        
        if (result.ticket.isCheckedIn || result.ticket.checkedIn) {
          // Already checked in
          const checkInTime = result.ticket.checkInTime || result.ticket.checkedInAt;
          setError(`Ticket already checked in ${checkInTime ? 'at ' + new Date(checkInTime).toLocaleString() : ''}`);
        } else {
          // Ready for check-in
          setSuccess('Ticket verified! Ready for check-in.');
        }
      } else {
        setError('Invalid ticket code. Please check and try again.');
      }
    } catch (err) {
      console.error('Verification error:', err);
      setError(err.message || 'Failed to verify ticket. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    // Check for either id or _id in the attendeeInfo object
    const ticketId = attendeeInfo?._id || attendeeInfo?.id;
    
    if (!attendeeInfo || !ticketId) {
      setError('No valid ticket to check in');
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      console.log(`Checking in ticket with ID: ${ticketId}`);
      console.log('Attendee info:', attendeeInfo);
      
      // Use the ticketId variable which contains whichever ID is available
      await ticketService.checkInTicket(ticketId, {
        verificationCode: verificationCode.trim()
      });
      
      // Update UI with success
      setSuccess(`Successfully checked in ${attendeeInfo.attendeeName || attendeeInfo.owner?.firstName || 'attendee'}`);
      
      // Check if we need to return to attendee list
      const returnTo = searchParams.get('returnTo') || location?.state?.returnTo;
      
      if (returnTo === 'attendee-management') {
        // Add a small delay so the user can see the success message
        setTimeout(() => {
          navigate(`/events/${eventId}/attendees`, { 
            state: { checkedIn: true } 
          });
        }, 1500);
      } else {
        // Clear form and reset for next check-in
        setTimeout(() => {
          setVerificationCode('');
          setAttendeeInfo(null);
          setSuccess(null);
          
          // Refresh stats and recent check-ins
          fetchEventStats();
          fetchRecentCheckIns();
          
          // Focus back on the input field
          if (inputRef.current) {
            inputRef.current.focus();
          }
        }, 2000);
      }
    } catch (err) {
      console.error('Check-in error:', err);
      setError(err.message || 'Failed to check in ticket. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const startScanner = async () => {
    try {
      setError(null);
      
      if (html5QrCodeRef.current) {
        await stopScanner();
      }
      
      console.log('Requesting camera permission...');
      
      // Create a new instance of the scanner
      html5QrCodeRef.current = new Html5Qrcode("qr-reader");
      
      const devices = await Html5Qrcode.getCameras();
      console.log('Available cameras:', devices);
      
      if (devices && devices.length > 0) {
        const cameraId = devices[0].id;
        console.log('Using camera:', cameraId);
        
        // Try using a specific camera ID instead of facingMode
        await html5QrCodeRef.current.start(
          cameraId, // Use camera ID instead of facingMode
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
          },
          // Success callback remains the same
          (decodedText) => {
            console.log(`QR Code detected: ${decodedText}`);
            // Rest of your code...
          },
          // Error callback with more detailed logging
          (errorMessage) => {
            console.log(`QR Code scanning error: ${errorMessage}`);
          }
        );
        
        setScannerActive(true);
      } else {
        throw new Error('No cameras found on this device');
      }
    } catch (err) {
      console.error('Detailed scanner error:', err);
      setError(`Camera access issue: ${err.message || 'Permission denied'}`);
      setScannerActive(false);
    }
  };

  const stopScanner = async () => {
    if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
      try {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current = null;
      } catch (e) {
        console.error('Error stopping scanner:', e);
      }
    }
    setScannerActive(false);
  };

  const toggleScanner = () => {
    if (scannerActive) {
      stopScanner();
    } else {
      startScanner();
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getAttendeeName = (attendee) => {
    if (attendee.attendeeName) return attendee.attendeeName;
    if (attendee.owner && attendee.owner.firstName) {
      return `${attendee.owner.firstName} ${attendee.owner.lastName || ''}`;
    }
    return 'Unknown';
  };

  const getAttendeeEmail = (attendee) => {
    return attendee.attendeeEmail || (attendee.owner && attendee.owner.email) || '';
  };

  const getTicketType = (attendee) => {
    return (attendee.ticketType && attendee.ticketType.name) || 'Standard Ticket';
  };

  const getCheckInTime = (attendee) => {
    return formatTime(attendee.checkInTime || attendee.checkedInAt);
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Event Check-In</h1>
        <div className="space-x-2">
          <button 
            onClick={() => navigate(`/events/${eventId}/attendees`)}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Manage Attendees
          </button>
          <button 
            onClick={() => navigate(`/events/${eventId}/tickets`)}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Manage Tickets
          </button>
        </div>
      </div>
      
      {/* Check-in Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-gray-500">Total Tickets</h3>
          <p className="text-2xl font-bold">{stats.total}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-gray-500">Checked In</h3>
          <p className="text-2xl font-bold">{stats.checkedIn}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-gray-500">Remaining</h3>
          <p className="text-2xl font-bold">{stats.remaining}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: Check-in Form */}
        <div className="flex flex-col">
          <div className="bg-white p-6 rounded shadow mb-6">
            <h2 className="text-xl font-semibold mb-4">Ticket Verification</h2>
            
            <form onSubmit={handleVerifyTicket} className="mb-4">
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="verificationCode">
                  Ticket Code
                </label>
                <div className="flex">
                  <input
                    ref={inputRef}
                    type="text"
                    id="verificationCode"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    className="shadow appearance-none border rounded-l w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    placeholder="Enter ticket code"
                    autoComplete="off"
                  />
                  <button
                    type="button"
                    onClick={toggleScanner}
                    className={`px-4 py-2 ${
                      scannerActive 
                        ? 'bg-red-500 hover:bg-red-700' 
                        : 'bg-green-500 hover:bg-green-700'
                    } text-white font-bold rounded-r`}
                  >
                    {scannerActive ? 'Stop Scan' : 'Scan QR'}
                  </button>
                </div>
              </div>
              
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                  disabled={loading || !verificationCode.trim()}
                >
                  {loading ? 'Verifying...' : 'Verify Ticket'}
                </button>
              </div>
            </form>
            
            {/* Scanner */}
            {scannerActive && (
              <div className="mb-4">
                <div id="qr-reader" style={{ width: '100%' }}></div>
                <p className="text-sm text-gray-600 mt-2">
                  Position the QR code within the frame to scan
                </p>
              </div>
            )}
            
            {/* Error Display */}
            {error && (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
                <p>{error}</p>
              </div>
            )}
            
            {/* Success Display */}
            {success && (
              <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4" role="alert">
                <p>{success}</p>
              </div>
            )}
          </div>
          
          {/* Attendee Information */}
          {attendeeInfo && (
            <div className="bg-white p-6 rounded shadow">
              <h2 className="text-xl font-semibold mb-4">Attendee Information</h2>
              
              <div className="mb-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="font-semibold">
                      {attendeeInfo.attendeeName || 
                       (attendeeInfo.owner && `${attendeeInfo.owner.firstName} ${attendeeInfo.owner.lastName || ''}`) || 
                       'Unknown'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-semibold">
                      {attendeeInfo.attendeeEmail || 
                       (attendeeInfo.owner && attendeeInfo.owner.email) || 
                       'Not provided'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Ticket Type</p>
                    <p className="font-semibold">{(attendeeInfo.ticketType && attendeeInfo.ticketType.name) || 'Standard'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <p className={`font-semibold ${
                      attendeeInfo.isCheckedIn || attendeeInfo.checkedIn 
                        ? 'text-green-600' 
                        : 'text-yellow-600'
                    }`}>
                      {attendeeInfo.isCheckedIn || attendeeInfo.checkedIn ? 'Checked In' : 'Not Checked In'}
                    </p>
                  </div>
                </div>
              </div>
              
              {!(attendeeInfo.isCheckedIn || attendeeInfo.checkedIn) && (
                <div className="flex justify-end">
                  <button
                    onClick={handleCheckIn}
                    className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                    disabled={loading}
                  >
                    {loading ? 'Processing...' : 'Check In Attendee'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Right Column: Recent Check-ins */}
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-semibold mb-4">Recent Check-ins</h2>
          
          {recentCheckIns.length === 0 ? (
            <p className="text-gray-600">No recent check-ins</p>
          ) : (
            <div className="overflow-y-auto max-h-96">
              {recentCheckIns.map((attendee) => (
                <div key={attendee.id || attendee._id} className="border-b py-3 last:border-b-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold">{getAttendeeName(attendee)}</p>
                      <p className="text-sm text-gray-600">{getAttendeeEmail(attendee)}</p>
                      <p className="text-xs text-gray-500">
                        {getTicketType(attendee)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-green-600">Checked In</p>
                      <p className="text-xs text-gray-500">
                        {getCheckInTime(attendee)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => navigate(`/events/${eventId}/attendees?checkInStatus=true`)}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              View All Check-ins
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckInPage;