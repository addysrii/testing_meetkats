import React, { useState, useEffect, useRef } from 'react';
import api from '../../services/api';

const CallInterface = ({ 
  callData,
  onAccept,
  onDecline,
  onEnd,
  currentUser
}) => {
  const [callStatus, setCallStatus] = useState('connecting'); // connecting, ongoing, ended
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const timerRef = useRef(null);
  
  const { callId, type, initiator, participant } = callData;
  const isOutgoing = initiator._id === currentUser._id;
  const callPartner = isOutgoing ? participant : initiator;
  
  // Initialize call when component mounts
  useEffect(() => {
    if (callStatus === 'connecting') {
      if (isOutgoing) {
        // We initiated the call, set up media right away
        setupLocalMedia();
      }
      // Else wait for the user to accept
    }
    
    return () => {
      // Clean up when component unmounts
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);
  
  // Set up media streams when call is accepted
  useEffect(() => {
    if (callStatus === 'ongoing') {
      // Start call timer
      timerRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
      
      // If we're the receiver, set up media now
      if (!isOutgoing && !localStream) {
        setupLocalMedia();
      }
      
      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };
    }
  }, [callStatus]);
  
  // Update video elements when streams change
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
    
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [localStream, remoteStream]);
  
  // Set up local media (camera & microphone)
  const setupLocalMedia = async () => {
    try {
      const constraints = {
        audio: true,
        video: type === 'video'
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setLocalStream(stream);
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      
      // In a real implementation, this would initialize WebRTC connection
      // and handle signaling via Socket.IO
      
      // Simulate remote stream after a delay (for demo purposes)
      if (type === 'video') {
        setTimeout(() => {
          setRemoteStream(stream.clone());
        }, 1000);
      }
      
    } catch (error) {
      console.error('Error accessing media devices:', error);
      alert('Could not access camera or microphone. Please check permissions.');
      handleEndCall();
    }
  };
  
  // Format the call duration time
  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  // Handle accepting an incoming call
  const handleAcceptCall = async () => {
    try {
      await onAccept(callId);
      setCallStatus('ongoing');
    } catch (error) {
      console.error('Error accepting call:', error);
      alert('Failed to accept call. Please try again.');
    }
  };
  
  // Handle declining a call
  const handleDeclineCall = async () => {
    try {
      await onDecline(callId);
      setCallStatus('ended');
    } catch (error) {
      console.error('Error declining call:', error);
    }
  };
  
  // Handle ending an ongoing call
  const handleEndCall = async () => {
    try {
      await onEnd(callId);
      setCallStatus('ended');
      
      // Stop all tracks in the local stream
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      
      // Clear the timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    } catch (error) {
      console.error('Error ending call:', error);
    }
  };
  
  // Toggle mute status
  const toggleMute = () => {
    if (localStream) {
      const audioTracks = localStream.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  };
  
  // Toggle camera
  const toggleCamera = () => {
    if (localStream && type === 'video') {
      const videoTracks = localStream.getVideoTracks();
      videoTracks.forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsCameraOff(!isCameraOff);
    }
  };
  
  // Toggle speaker
  const toggleSpeaker = () => {
    // In a real implementation, this would switch audio output device
    setIsSpeakerOn(!isSpeakerOn);
  };
  
  // Render connecting/ringing UI for incoming call
  if (callStatus === 'connecting' && !isOutgoing) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl max-w-md w-full p-6 text-center">
          <div className="mb-4">
            {callPartner.profilePicture ? (
              <img 
                src={callPartner.profilePicture} 
                alt={`${callPartner.firstName} ${callPartner.lastName}`} 
                className="h-24 w-24 rounded-full object-cover mx-auto"
              />
            ) : (
              <div className="h-24 w-24 rounded-full bg-orange-100 flex items-center justify-center mx-auto">
                <span className="text-3xl font-semibold text-orange-600">
                  {callPartner.firstName.charAt(0)}
                  {callPartner.lastName.charAt(0)}
                </span>
              </div>
            )}
          </div>
          
          <h3 className="text-xl font-bold mb-2">
            {callPartner.firstName} {callPartner.lastName}
          </h3>
          
          <p className="text-gray-600 mb-6">
            Incoming {type} call...
          </p>
          
          <div className="flex justify-center space-x-4">
            <button 
              onClick={handleDeclineCall}
              className="h-14 w-14 rounded-full bg-red-500 text-white flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <button 
              onClick={handleAcceptCall}
              className="h-14 w-14 rounded-full bg-green-500 text-white flex items-center justify-center"
            >
              {type === 'audio' ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // Render connecting UI for outgoing call
  if (callStatus === 'connecting' && isOutgoing) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl max-w-md w-full p-6 text-center">
          <div className="mb-4">
            {callPartner.profilePicture ? (
              <img 
                src={callPartner.profilePicture} 
                alt={`${callPartner.firstName} ${callPartner.lastName}`} 
                className="h-24 w-24 rounded-full object-cover mx-auto"
              />
            ) : (
              <div className="h-24 w-24 rounded-full bg-orange-100 flex items-center justify-center mx-auto">
                <span className="text-3xl font-semibold text-orange-600">
                  {callPartner.firstName.charAt(0)}
                  {callPartner.lastName.charAt(0)}
                </span>
              </div>
            )}
          </div>
          
          <h3 className="text-xl font-bold mb-2">
            {callPartner.firstName} {callPartner.lastName}
          </h3>
          
          <p className="text-gray-600 mb-6 flex items-center justify-center">
            <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
            Calling...
          </p>
          
          {type === 'video' && localStream && (
            <div className="mb-4 relative h-32">
              <video 
                ref={localVideoRef} 
                autoPlay 
                muted 
                playsInline
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
          )}
          
          <div className="flex justify-center">
            <button 
              onClick={handleEndCall}
              className="h-14 w-14 rounded-full bg-red-500 text-white flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // Render ongoing call UI
  if (callStatus === 'ongoing') {
    return (
      <div className="fixed inset-0 bg-black flex flex-col z-50">
        {/* Call header */}
        <div className="bg-gray-900 bg-opacity-60 text-white p-4 flex items-center justify-between">
          <div className="flex items-center">
            {callPartner.profilePicture ? (
              <img 
                src={callPartner.profilePicture} 
                alt={`${callPartner.firstName} ${callPartner.lastName}`} 
                className="h-10 w-10 rounded-full object-cover mr-3"
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center mr-3">
                <span className="text-xl font-semibold text-orange-600">
                  {callPartner.firstName.charAt(0)}
                  {callPartner.lastName.charAt(0)}
                </span>
              </div>
            )}
            <div>
              <h3 className="font-medium">
                {callPartner.firstName} {callPartner.lastName}
              </h3>
              <p className="text-sm text-gray-300">
                {formatDuration(callDuration)}
              </p>
            </div>
          </div>
          
          {type === 'video' && (
            <button
              onClick={toggleCamera}
              className={`h-10 w-10 rounded-full ${isCameraOff ? 'bg-red-500' : 'bg-gray-700'} flex items-center justify-center`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
          )}
        </div>
        
        {/* Main call content */}
        <div className="flex-1 relative">
          {/* Remote video (full screen) */}
          {type === 'video' ? (
            <>
              <video 
                ref={remoteVideoRef}
                autoPlay 
                playsInline
                className="w-full h-full object-cover"
              />
              
              {/* Local video (picture-in-picture) */}
              <div className="absolute bottom-24 right-4 w-1/3 max-w-xs rounded-lg overflow-hidden border-2 border-white">
                <video 
                  ref={localVideoRef}
                  autoPlay 
                  muted 
                  playsInline
                  className="w-full h-full object-cover"
                />
              </div>
            </>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                {callPartner.profilePicture ? (
                  <img 
                    src={callPartner.profilePicture} 
                    alt={`${callPartner.firstName} ${callPartner.lastName}`} 
                    className="h-32 w-32 rounded-full object-cover mx-auto mb-4"
                  />
                ) : (
                  <div className="h-32 w-32 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-4">
                    <span className="text-5xl font-semibold text-orange-600">
                      {callPartner.firstName.charAt(0)}
                      {callPartner.lastName.charAt(0)}
                    </span>
                  </div>
                )}
                <h2 className="text-white text-2xl font-bold">
                  {callPartner.firstName} {callPartner.lastName}
                </h2>
                <p className="text-gray-300 mt-2">
                  {formatDuration(callDuration)}
                </p>
              </div>
            </div>
          )}
        </div>
        
        {/* Call controls */}
        <div className="bg-gray-900 bg-opacity-60 p-6">
          <div className="flex justify-center space-x-6">
            <button
              onClick={toggleMute}
              className={`h-14 w-14 rounded-full ${isMuted ? 'bg-red-500' : 'bg-gray-700'} text-white flex items-center justify-center`}
            >
              {isMuted ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              )}
            </button>
            
            <button
              onClick={handleEndCall}
              className="h-14 w-14 rounded-full bg-red-500 text-white flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z" />
              </svg>
            </button>
            
            <button
              onClick={toggleSpeaker}
              className={`h-14 w-14 rounded-full ${!isSpeakerOn ? 'bg-red-500' : 'bg-gray-700'} text-white flex items-center justify-center`}
            >
              {isSpeakerOn ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // Call ended UI
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl max-w-md w-full p-6 text-center">
        <div className="mb-4 text-red-500">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        
        <h3 className="text-xl font-bold mb-2">
          Call Ended
        </h3>
        
        <p className="text-gray-600 mb-6">
          Call with {callPartner.firstName} {callPartner.lastName} has ended
          {callDuration > 0 && ` (${formatDuration(callDuration)})`}
        </p>
        
        <button 
          onClick={() => onEnd(null)} // Signal parent to close the call UI
          className="bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-4 rounded-md w-full"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default CallInterface;