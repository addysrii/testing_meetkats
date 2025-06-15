// src/services/networkService.js

import api from "./api";

const getCombinedPendingRequests = () => {
  // Get pending requests from API (stored in localStorage by syncPendingRequests)
  const apiPendingRequests = JSON.parse(
    localStorage.getItem("pendingConnectionRequests") || "[]"
  );

  // Get pending requests created during the current session
  const sessionPendingRequests = JSON.parse(
    localStorage.getItem("sessionPendingRequests") || "[]"
  );

  // Combine both sources and remove duplicates
  return [...new Set([...apiPendingRequests, ...sessionPendingRequests])];
};

// Save a request to session storage (for requests made in current session)
const saveSessionPendingRequest = (userId) => {
  const sessionRequests = JSON.parse(
    localStorage.getItem("sessionPendingRequests") || "[]"
  );

  if (!sessionRequests.includes(userId)) {
    sessionRequests.push(userId);
    localStorage.setItem(
      "sessionPendingRequests",
      JSON.stringify(sessionRequests)
    );
  }
};

// Helper function for extracting user ID from request ID
const saveRequestUserMapping = (requestId, userId) => {
  const requestMap = JSON.parse(
    localStorage.getItem("requestUserMapping") || "{}"
  );
  requestMap[requestId] = userId;
  localStorage.setItem("requestUserMapping", JSON.stringify(requestMap));
};

const extractUserIdFromRequestId = (requestId) => {
  const requestMap = JSON.parse(
    localStorage.getItem("requestUserMapping") || "{}"
  );
  return requestMap[requestId];
};

const networkService = {
  // Connection requests
  requestConnection: async (userId, message = "") => {
    try {
      // Input validation
      if (!userId) {
        console.error("Invalid or missing user ID for connection request");
        throw new Error("Invalid user ID");
      }

      console.log(
        `Sending connection request to user ${userId} with message: "${message}"`
      );

      // IMMEDIATELY save this request to session storage
      // This ensures it persists even if the API call fails
      saveSessionPendingRequest(userId);

      const response = await api.post("/api/connections/requests", {
        userId,
        message,
      });

      // If response contains the request ID, save the mapping
      if (response.data && response.data._id) {
        saveRequestUserMapping(response.data._id, userId);
      }

      // Also update the API-based pending requests list
      const pendingRequests = JSON.parse(
        localStorage.getItem("pendingConnectionRequests") || "[]"
      );
      if (!pendingRequests.includes(userId)) {
        pendingRequests.push(userId);
        localStorage.setItem(
          "pendingConnectionRequests",
          JSON.stringify(pendingRequests)
        );
      }

      console.log("Connection request successful:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error requesting connection:", error);
      throw error;
    }
  },

  // Sync both API and session pending requests
  syncPendingRequests: async () => {
    try {
      // Fetch pending requests from API
      const response = await api.get("/api/connections/requests", {
        params: { status: "pending", direction: "outgoing" },
      });

      if (response.data && response.data.requests) {
        const requests = response.data.requests;

        // Save request ID to user ID mappings
        const requestMap = JSON.parse(
          localStorage.getItem("requestUserMapping") || "{}"
        );

        requests.forEach((req) => {
          const recipientId = req.recipient?._id || req.recipient;
          if (req._id && recipientId) {
            requestMap[req._id] = recipientId;
          }
        });

        localStorage.setItem("requestUserMapping", JSON.stringify(requestMap));

        // Update pending user IDs from API
        const pendingUserIds = requests.map(
          (req) => req.recipient?._id || req.recipient
        );

        localStorage.setItem(
          "pendingConnectionRequests",
          JSON.stringify(pendingUserIds)
        );
        console.log("Synced API pending requests:", pendingUserIds);

        // Get the combined pending requests (API + session)
        const combinedRequests = getCombinedPendingRequests();
        console.log("Combined pending requests:", combinedRequests);

        return combinedRequests;
      }

      // If API call fails, just return combined requests
      return getCombinedPendingRequests();
    } catch (error) {
      console.error("Error syncing pending requests:", error);
      return getCombinedPendingRequests();
    }
  },

  // Enhanced suggestions with combined pending requests
  getConnectionSuggestions: async (options = {}) => {
    try {
      // Get ALL pending requests (both API and session)
      const pendingRequests = getCombinedPendingRequests();
      console.log("Current combined pending requests:", pendingRequests);

      // Fetch suggested users from API
      const response = await api.get("/api/network/suggestions", {
        params: options,
      });

      // Process each user to add pending status based on combined pending requests
      if (Array.isArray(response.data)) {
        const processedUsers = response.data.map((user) => {
          // Check if this user ID is in our combined pending requests list
          if (user._id && pendingRequests.includes(user._id)) {
            console.log(
              `Marking user ${user._id} as pending (from combined requests)`
            );
            return {
              ...user,
              connectionStatus: "pending",
              isPending: true,
            };
          }
          return user;
        });

        return processedUsers;
      }

      return response.data;
    } catch (error) {
      console.error("Error fetching connection suggestions:", error);
      return [];
    }
  },

  // Remaining methods would be updated to handle session pending requests
  acceptConnection: async (requestId) => {
    try {
      if (!requestId) {
        console.error("Invalid or missing request ID for accepting connection");
        throw new Error("Invalid request ID");
      }

      const response = await api.post("/api/connections/accept", { requestId });

      // Get the user ID to remove from pending requests
      const userId = extractUserIdFromRequestId(requestId);

      if (userId) {
        // Remove from API pending requests
        const pendingRequests = JSON.parse(
          localStorage.getItem("pendingConnectionRequests") || "[]"
        );
        const updatedAPIRequests = pendingRequests.filter(
          (id) => id !== userId
        );
        localStorage.setItem(
          "pendingConnectionRequests",
          JSON.stringify(updatedAPIRequests)
        );

        // Remove from session pending requests
        const sessionRequests = JSON.parse(
          localStorage.getItem("sessionPendingRequests") || "[]"
        );
        const updatedSessionRequests = sessionRequests.filter(
          (id) => id !== userId
        );
        localStorage.setItem(
          "sessionPendingRequests",
          JSON.stringify(updatedSessionRequests)
        );
      }

      return response.data;
    } catch (error) {
      console.error("Error accepting connection:", error);
      throw error;
    }
  },

  // Handle session pending requests in decline/cancel functions
  declineConnection: async (requestId) => {
    try {
      if (!requestId) {
        console.error("Invalid or missing request ID for declining connection");
        throw new Error("Invalid request ID");
      }

      const response = await api.post(
        `/api/connections/requests/${requestId}/decline`
      );

      // Remove from both API and session pending requests
      const userId = extractUserIdFromRequestId(requestId);
      if (userId) {
        // Remove from API pending requests
        const pendingRequests = JSON.parse(
          localStorage.getItem("pendingConnectionRequests") || "[]"
        );
        const updatedAPIRequests = pendingRequests.filter(
          (id) => id !== userId
        );
        localStorage.setItem(
          "pendingConnectionRequests",
          JSON.stringify(updatedAPIRequests)
        );

        // Remove from session pending requests
        const sessionRequests = JSON.parse(
          localStorage.getItem("sessionPendingRequests") || "[]"
        );
        const updatedSessionRequests = sessionRequests.filter(
          (id) => id !== userId
        );
        localStorage.setItem(
          "sessionPendingRequests",
          JSON.stringify(updatedSessionRequests)
        );
      }

      return response.data;
    } catch (error) {
      console.error("Error declining connection:", error);
      throw error;
    }
  },

  // Add manual connection request handling (without API)
  addManualPendingRequest: (userId) => {
    if (!userId) return false;

    // Save to session storage
    saveSessionPendingRequest(userId);
    console.log(`Manually added pending request for user ${userId}`);

    return true;
  },

  // Other methods remain the same
  // ...

  getConnectionRequests: async (status, direction) => {
    // Implementation unchanged
    try {
      console.log(
        `Fetching connection requests with status: ${status}, direction: ${direction}`
      );

      const response = await api.get("/api/connections/requests", {
        params: { status, direction },
      });

      // Update local storage with pending requests if this is an outgoing request
      if (
        direction === "outgoing" &&
        status === "pending" &&
        response.data &&
        response.data.requests
      ) {
        // Save each request ID to user ID mapping
        const requests = response.data.requests;
        const requestMap = JSON.parse(
          localStorage.getItem("requestUserMapping") || "{}"
        );

        requests.forEach((req) => {
          const recipientId = req.recipient?._id || req.recipient;
          if (req._id && recipientId) {
            requestMap[req._id] = recipientId;
          }
        });

        localStorage.setItem("requestUserMapping", JSON.stringify(requestMap));

        // Update the pending requests list
        const pendingUserIds = requests.map(
          (req) => req.recipient?._id || req.recipient
        );

        localStorage.setItem(
          "pendingConnectionRequests",
          JSON.stringify(pendingUserIds)
        );
      }

      return response.data;
    } catch (error) {
      console.error("Error fetching connection requests:", error);

      // Return empty data structure on error to prevent UI crashes
      return { requests: [], pagination: { total: 0 } };
    }
  },

  // Connection requests

  cancelConnectionRequest: async (requestId) => {
    try {
      // Input validation
      if (!requestId) {
        console.error(
          "Invalid or missing request ID for canceling connection request"
        );
        throw new Error("Invalid request ID");
      }

      const response = await api.delete(
        `/api/connections/requests/${requestId}`
      );

      // Remove from pending requests in local storage
      const pendingRequests = JSON.parse(
        localStorage.getItem("pendingConnectionRequests") || "[]"
      );
      const userId = extractUserIdFromRequestId(requestId);
      if (userId) {
        const updatedRequests = pendingRequests.filter((id) => id !== userId);
        localStorage.setItem(
          "pendingConnectionRequests",
          JSON.stringify(updatedRequests)
        );
      }

      return response.data;
    } catch (error) {
      console.error("Error canceling connection request:", error);
      throw error;
    }
  },

  getConnections: async (search, sort, page = 1, limit = 20) => {
    try {
      const response = await api.get("/api/connections", {
        params: { search, sort, page, limit },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching connections:", error);

      // Return empty data structure on error to prevent UI crashes
      return { connections: [], pagination: { total: 0 } };
    }
  },

  removeConnection: async (userId) => {
    try {
      // Input validation
      if (!userId) {
        console.error("Invalid or missing user ID for removing connection");
        throw new Error("Invalid user ID");
      }

      const response = await api.delete(`/api/connections/${userId}`);
      return response.data;
    } catch (error) {
      console.error("Error removing connection:", error);
      throw error;
    }
  },

  updateConnectionNote: async (connectionId, note) => {
    try {
      // Input validation
      if (!connectionId) {
        console.error("Invalid or missing connection ID for updating note");
        throw new Error("Invalid connection ID");
      }

      const response = await api.put(`/api/connections/${connectionId}/note`, {
        note,
      });
      return response.data;
    } catch (error) {
      console.error("Error updating connection note:", error);
      throw error;
    }
  },

  // Following
  toggleFollow: async (userId) => {
    try {
      // Input validation
      if (!userId) {
        console.error("Invalid or missing user ID for toggling follow status");
        throw new Error("Invalid user ID");
      }

      const response = await api.post(`/api/users/${userId}/follow`);
      return response.data;
    } catch (error) {
      console.error("Error toggling follow status:", error);
      throw error;
    }
  },

  getFollowers: async (userId, page = 1, limit = 20) => {
    try {
      const response = await api.get(`/api/followers`, {
        params: { page, limit },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching followers:", error);

      // Return empty data structure on error to prevent UI crashes
      return { followers: [], pagination: { total: 0 } };
    }
  },

  getFollowing: async (userId, page = 1, limit = 20) => {
    try {
      const response = await api.get(`/api/following`, {
        params: { page, limit },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching following:", error);

      // Return empty data structure on error to prevent UI crashes
      return { following: [], pagination: { total: 0 } };
    }
  },

  // Remaining methods stay the same
  // ...

  // Get network stats
  getNetworkStats: async () => {
    try {
      const response = await api.get("/api/network/stats");
      return response.data;
    } catch (error) {
      console.error("Error fetching network stats:", error);

      // Return default stats on error to prevent UI crashes
      return {
        connections: 0,
        followers: 0,
        following: 0,
        suggestions: 0,
      };
    }
  },

  // Nearby Users
  getNearbyUsers: async (params = {}) => {
    try {
      const response = await api.get("/api/nearby-users", { params });
      return response.data;
    } catch (error) {
      console.error("Error fetching nearby users:", error);

      // Return empty array on error to prevent UI crashes
      return [];
    }
  },

  updateLocation: async (latitude, longitude, checkNearbyUsers = false) => {
    try {
      // Input validation
      if (latitude === undefined || longitude === undefined) {
        console.error("Invalid coordinates for location update");
        throw new Error("Invalid coordinates");
      }

      const response = await api.put("/api/nearby-users/location", {
        latitude,
        longitude,
        checkNearbyUsers,
      });
      return response.data;
    } catch (error) {
      console.error("Error updating location:", error);
      throw error;
    }
  },

  getNearbyNotificationPreferences: async () => {
    try {
      const response = await api.get(
        "/api/nearby-users/notification-preferences"
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching nearby notification preferences:", error);
      throw error;
    }
  },

  updateNearbyNotificationPreferences: async (preferences) => {
    try {
      const response = await api.put(
        "/api/nearby-users/notification-preferences",
        preferences
      );
      return response.data;
    } catch (error) {
      console.error("Error updating nearby notification preferences:", error);
      throw error;
    }
  },

  getNetworkMap: async () => {
    try {
      const response = await api.get("/api/network/map");
      return response.data;
    } catch (error) {
      console.error("Error fetching network map:", error);
      throw error;
    }
  },

  updateLocationStatus: async (isVisible) => {
    try {
      const response = await api.put("/api/network/location-status", {
        isVisible,
      });
      return response.data;
    } catch (error) {
      console.error("Error updating location status:", error);
      throw error;
    }
  },

  // Meeting requests
  createMeetingRequest: async (meetingData) => {
    try {
      // Input validation
      if (!meetingData || !meetingData.userId || !meetingData.meetingTime) {
        console.error("Invalid meeting data for creating meeting request");
        throw new Error("Invalid meeting data");
      }

      const response = await api.post(
        "/api/network/meeting-request",
        meetingData
      );
      return response.data;
    } catch (error) {
      console.error("Error creating meeting request:", error);
      throw error;
    }
  },

  respondToMeetingRequest: async (
    meetingId,
    status,
    message,
    newMeetingTime
  ) => {
    try {
      // Input validation
      if (!meetingId || !status) {
        console.error(
          "Invalid meeting ID or status for responding to meeting request"
        );
        throw new Error("Invalid meeting data");
      }

      const response = await api.put(
        `/api/network/meeting-request/${meetingId}`,
        {
          status,
          message,
          newMeetingTime,
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error responding to meeting request:", error);
      throw error;
    }
  },

  getMeetings: async (status, timeframe, page = 1, limit = 20) => {
    try {
      const response = await api.get("/api/network/meetings", {
        params: { status, timeframe, page, limit },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching meetings:", error);

      // Return empty data structure on error to prevent UI crashes
      return { meetings: [], pagination: { total: 0 } };
    }
  },
};

export default networkService;
