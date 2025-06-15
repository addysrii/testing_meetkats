import React, { useEffect } from 'react';

const LinkCall = () => {
  useEffect(() => {
    // Extract the authorization code and state from the URL
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');

    // Check if code exists
    if (code) {
      // Construct the redirect URL with the code and state
      const redirectUrl = `meetkats://linkedin-callback?code=${code}`;
      
      // Add state parameter if it exists
      const finalUrl = state ? `${redirectUrl}&state=${state}` : redirectUrl;
      
      // Redirect to the app
      window.location.href = finalUrl;
    } else {
      // Handle error case - no code found
      console.error('No authorization code found in URL');
      document.getElementById('status').innerText = 'Error: No authorization code found';
    }
  }, []);

  return (
    <div>
      <h3>LinkedIn Authentication</h3>
      <p>Redirecting back to MeetKats app...</p>
      <p id="status"></p>
    </div>
  );
};

export default LinkCall;
