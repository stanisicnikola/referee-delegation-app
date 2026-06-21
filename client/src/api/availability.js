import api from "./axios";

export const availabilityApi = {
  getMyAvailability: async (params = {}) => {
    const response = await api.get("/availability/my-availability", { params });
    return response.data;
  },

  setMyAvailability: async (data) => {
    const response = await api.post("/availability/my-availability", data);
    return response.data;
  },

  setMyAvailabilityRange: async (data) => {
    const response = await api.post(
      "/availability/my-availability/range",
      data,
    );
    return response.data;
  },

  deleteMyAvailability: async (id) => {
    const response = await api.delete(`/availability/my-availability/${id}`);
    return response.data;
  },

  getMyCalendar: async (params = {}) => {
    const response = await api.get("/availability/my-calendar", { params });
    return response.data;
  },

  getRefereeAvailability: async (refereeId, params = {}) => {
    const response = await api.get(`/availability/referees/${refereeId}`, {
      params,
    });
    return response.data;
  },

  setRefereeAvailability: async (refereeId, data) => {
    const response = await api.post(
      `/availability/referees/${refereeId}`,
      data,
    );
    return response.data;
  },

  setRefereeAvailabilityRange: async (refereeId, data) => {
    const response = await api.post(
      `/availability/referees/${refereeId}/range`,
      data,
    );
    return response.data;
  },

  getRefereeCalendar: async (refereeId, params = {}) => {
    const response = await api.get(
      `/availability/referees/${refereeId}/calendar`,
      { params },
    );
    return response.data;
  },

  getAvailableReferees: async (date) => {
    const response = await api.get(`/availability/available/${date}`);
    return response.data;
  },

  getUnavailableReferees: async (date) => {
    const response = await api.get(`/availability/unavailable/${date}`);
    return response.data;
  },

  getAvailabilityRequests: async (params = {}) => {
    const response = await api.get("/availability/requests", { params });
    return response.data;
  },

  reviewAvailabilityRequests: async (data) => {
    const response = await api.patch("/availability/requests/review", data);
    return response.data;
  },

  deleteAvailability: async (id) => {
    const response = await api.delete(`/availability/${id}`);
    return response.data;
  },

  deleteAvailabilityByDate: async (refereeId, date) => {
    const response = await api.delete(
      `/availability/referees/${refereeId}/date/${date}`,
    );
    return response.data;
  },
};

export default availabilityApi;
