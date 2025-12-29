import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { teamsApi } from "../api";

export const teamKeys = {
  all: ["teams"],
  lists: () => [...teamKeys.all, "list"],
  list: (params) => [...teamKeys.lists(), params],
  details: () => [...teamKeys.all, "detail"],
  detail: (id) => [...teamKeys.details(), id],
};

export const useTeams = (params = {}) => {
  return useQuery({
    queryKey: teamKeys.list(params),
    queryFn: () => teamsApi.getAll(params),
  });
};

export const useTeam = (id) => {
  return useQuery({
    queryKey: teamKeys.detail(id),
    queryFn: () => teamsApi.getById(id),
    enabled: !!id,
  });
};

export const useCreateTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => teamsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamKeys.lists() });
    },
  });
};

export const useUpdateTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => teamsApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: teamKeys.lists() });
      queryClient.invalidateQueries({ queryKey: teamKeys.detail(id) });
    },
  });
};

export const useDeleteTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => teamsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamKeys.lists() });
    },
  });
};

export const useUploadTeamLogo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, file }) => teamsApi.uploadLogo(id, file),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: teamKeys.lists() });
      queryClient.invalidateQueries({ queryKey: teamKeys.detail(id) });
    },
  });
};
