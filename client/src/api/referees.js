import api from "./axios";

export const refereesApi = {
  getAll: async (params = {}) => {
    const response = await api.get("/referees", { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/referees/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post("/referees", data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/referees/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/referees/${id}`);
    return response.data;
  },

  getAvailable: async (params = {}) => {
    const response = await api.get("/referees/available", { params });
    return response.data;
  },

  getAssignments: async (id) => {
    const response = await api.get(`/referees/${id}/assignments`);
    return response.data;
  },

  getStatistics: async (id) => {
    const response = await api.get(`/referees/${id}/statistics`);
    return response.data;
  },

  getMyAssignments: async () => {
    const response = await api.get("/referees/my-assignments");
    return response.data;
  },

  getMyStatistics: async () => {
    const response = await api.get("/referees/my-statistics");
    return response.data;
  },
};

export default refereesApi;
