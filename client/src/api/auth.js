import api from "./axios";

export const authApi = {
  login: async (data) => {
    const response = await api.post("/auth/login", data);
    return response.data;
  },

  register: async (data) => {
    const response = await api.post("/auth/register", data);
    return response.data;
  },

  getMe: async () => {
    const response = await api.get("/auth/me");
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get("/auth/me");
    return response.data;
  },

  changePassword: async (data) => {
    const response = await api.put("/auth/change-password", data);
    return response.data;
  },

  logout: async () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },
};

export default authApi;
