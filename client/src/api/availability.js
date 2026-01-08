import api from "./axios";

export const availabilityApi = {
  // Get my availability (for logged in referee)
  getMyAvailability: async (params = {}) => {
    const response = await api.get("/availability/my-availability", { params });
    return response.data;
  },

  // Set my availability
  setMyAvailability: async (data) => {
    const response = await api.post("/availability/my-availability", data);
    return response.data;
  },

  // Get my calendar
  getMyCalendar: async (params = {}) => {
    const response = await api.get("/availability/my-calendar", { params });
    return response.data;
  },

  // Get referee availability
  getRefereeAvailability: async (refereeId, params = {}) => {
    const response = await api.get(`/availability/referees/${refereeId}`, {
      params,
    });
    return response.data;
  },

  // Set referee availability (admin only)
  setRefereeAvailability: async (refereeId, data) => {
    const response = await api.post(
      `/availability/referees/${refereeId}`,
      data
    );
    return response.data;
  },

  // Set referee availability range (admin only)
  setRefereeAvailabilityRange: async (refereeId, data) => {
    const response = await api.post(
      `/availability/referees/${refereeId}/range`,
      data
    );
    return response.data;
  },

  // Get referee calendar
  getRefereeCalendar: async (refereeId, params = {}) => {
    const response = await api.get(
      `/availability/referees/${refereeId}/calendar`,
      { params }
    );
    return response.data;
  },

  // Get available referees for date
  getAvailableReferees: async (date) => {
    const response = await api.get(`/availability/available/${date}`);
    return response.data;
  },

  // Get unavailable referees for date
  getUnavailableReferees: async (date) => {
    const response = await api.get(`/availability/unavailable/${date}`);
    return response.data;
  },

  // Delete availability record
  deleteAvailability: async (id) => {
    const response = await api.delete(`/availability/${id}`);
    return response.data;
  },

  // Delete availability by date
  deleteAvailabilityByDate: async (refereeId, date) => {
    const response = await api.delete(
      `/availability/referees/${refereeId}/date/${date}`
    );
    return response.data;
  },
};

export default availabilityApi;
