import api from "./axios";

export const delegationsApi = {
  getStatistics: async () => {
    const response = await api.get("/delegations/statistics");
    return response.data;
  },

  getMyDelegations: async () => {
    const response = await api.get("/delegations/my-delegations");
    return response.data;
  },

  getMatchDelegation: async (matchId) => {
    const response = await api.get(`/delegations/matches/${matchId}`);
    return response.data;
  },

  getAvailableReferees: async (matchId) => {
    const response = await api.get(
      `/delegations/matches/${matchId}/available-referees`
    );
    return response.data;
  },

  delegateReferees: async (matchId, data) => {
    const response = await api.post(`/delegations/matches/${matchId}`, data);
    return response.data;
  },

  updateRefereeRole: async (matchId, refereeId, data) => {
    const response = await api.put(
      `/delegations/matches/${matchId}/referees/${refereeId}/role`,
      data
    );
    return response.data;
  },

  removeReferee: async (matchId, refereeId) => {
    const response = await api.delete(
      `/delegations/matches/${matchId}/referees/${refereeId}`
    );
    return response.data;
  },

  confirmAssignment: async (matchId) => {
    const response = await api.put(`/delegations/matches/${matchId}/confirm`);
    return response.data;
  },

  rejectAssignment: async (matchId, data) => {
    const response = await api.put(
      `/delegations/matches/${matchId}/reject`,
      data
    );
    return response.data;
  },
};

export default delegationsApi;
