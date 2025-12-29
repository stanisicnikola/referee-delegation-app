import api from "./axios";

export const venuesApi = {
  getAll: async (params = {}) => {
    const response = await api.get("/venues", { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/venues/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post("/venues", data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/venues/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/venues/${id}`);
    return response.data;
  },
};

export default venuesApi;
