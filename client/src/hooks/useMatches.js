import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { matchesApi } from "../api";
import { toast } from "react-toastify";

export const matchKeys = {
  all: ["matches"],
  lists: () => [...matchKeys.all, "list"],
  list: (params) => [...matchKeys.lists(), params],
  details: () => [...matchKeys.all, "detail"],
  detail: (id) => [...matchKeys.details(), id],
  upcoming: () => [...matchKeys.all, "upcoming"],
  pendingDelegation: () => [...matchKeys.all, "pending-delegation"],
  statistics: () => [...matchKeys.all, "statistics"],
};

export const useMatches = (params = {}) => {
  return useQuery({
    queryKey: matchKeys.list(params),
    queryFn: () => matchesApi.getAll(params),
  });
};

export const useMatch = (id) => {
  return useQuery({
    queryKey: matchKeys.detail(id),
    queryFn: () => matchesApi.getById(id),
    enabled: !!id,
  });
};

export const useUpcomingMatches = () => {
  return useQuery({
    queryKey: matchKeys.upcoming(),
    queryFn: () => matchesApi.getUpcoming(),
  });
};

export const usePendingDelegation = () => {
  return useQuery({
    queryKey: matchKeys.pendingDelegation(),
    queryFn: () => matchesApi.getPendingDelegation(),
  });
};

export const useMatchStatistics = () => {
  return useQuery({
    queryKey: matchKeys.statistics(),
    queryFn: () => matchesApi.getStatistics(),
  });
};

export const useCreateMatch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => matchesApi.create(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: matchKeys.lists() });
      queryClient.invalidateQueries({ queryKey: matchKeys.upcoming() });
      queryClient.invalidateQueries({
        queryKey: matchKeys.pendingDelegation(),
      });
      queryClient.invalidateQueries({ queryKey: matchKeys.statistics() });
      toast.success(data?.message || "Match created successfully!");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to create match.");
    },
  });
};

export const useUpdateMatch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => matchesApi.update(id, data),
    onSuccess: (data, { id }) => {
      queryClient.invalidateQueries({ queryKey: matchKeys.lists() });
      queryClient.invalidateQueries({ queryKey: matchKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: matchKeys.upcoming() });
      queryClient.invalidateQueries({
        queryKey: matchKeys.pendingDelegation(),
      });
      toast.success(data?.message || "Match updated successfully!");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update match.");
    },
  });
};

export const useDeleteMatch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => matchesApi.delete(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: matchKeys.lists() });
      queryClient.invalidateQueries({ queryKey: matchKeys.upcoming() });
      queryClient.invalidateQueries({
        queryKey: matchKeys.pendingDelegation(),
      });
      queryClient.invalidateQueries({ queryKey: matchKeys.statistics() });
      toast.success(data?.message || "Match deleted successfully!");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to delete match.");
    },
  });
};

export const useUpdateMatchResult = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => matchesApi.updateResult(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: matchKeys.lists() });
      queryClient.invalidateQueries({ queryKey: matchKeys.detail(id) });
    },
  });
};
