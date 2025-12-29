import api from "./axios";

export const competitionsApi = {
  getAll: async (params = {}) => {
    const response = await api.get("/competitions", { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/competitions/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post("/competitions", data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/competitions/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/competitions/${id}`);
    return response.data;
  },

  getSeasons: async () => {
    const response = await api.get("/competitions/seasons");
    return response.data;
  },

  getStatistics: async (id) => {
    const response = await api.get(`/competitions/${id}/statistics`);
    return response.data;
  },
};

export default competitionsApi;
