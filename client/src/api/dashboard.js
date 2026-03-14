import api from "./axios";

export const dashboardApi = {
  getData: async (period = "7days") => {
    const response = await api.get("/dashboard", { params: { period } });
    return response.data;
  },
};

export default dashboardApi;
