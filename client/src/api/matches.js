import api from "./axios";

export const matchesApi = {
  getAll: async (params = {}) => {
    const response = await api.get("/matches", { params });
    console.log("Fetched matches:", response.data);
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/matches/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post("/matches", data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/matches/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/matches/${id}`);
    return response.data;
  },

  updateResult: async (id, data) => {
    const response = await api.put(`/matches/${id}/result`, data);
    return response.data;
  },

  getUpcoming: async () => {
    const response = await api.get("/matches/upcoming");
    return response.data;
  },

  getPendingDelegation: async () => {
    const response = await api.get("/matches/pending-delegation");
    return response.data;
  },

  getStatistics: async () => {
    const response = await api.get("/matches/statistics");
    return response.data;
  },
};

export default matchesApi;
