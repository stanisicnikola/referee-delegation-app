import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { teamsApi } from "../api";
import { toast } from "react-toastify";

export const teamKeys = {
  all: ["teams"],
  lists: () => [...teamKeys.all, "list"],
  list: (params) => [...teamKeys.lists(), params],
  details: () => [...teamKeys.all, "detail"],
  detail: (id) => [...teamKeys.details(), id],
  stats: () => [...teamKeys.all, "stats"],
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
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: teamKeys.lists() });
      queryClient.invalidateQueries({ queryKey: teamKeys.stats() });
      toast.success(data?.message || "Team created successfully!", {
        toastId: "team-create",
      });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to create team.", {
        toastId: "team-create-error",
      });
    },
  });
};

export const useUpdateTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => teamsApi.update(id, data),
    onSuccess: (data, { id }) => {
      queryClient.invalidateQueries({ queryKey: teamKeys.lists() });
      queryClient.invalidateQueries({ queryKey: teamKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: teamKeys.stats() });
      toast.success(data?.message || "Team updated successfully!", {
        toastId: "team-update",
      });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update team.", {
        toastId: "team-update-error",
      });
    },
  });
};

export const useDeleteTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => teamsApi.delete(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: teamKeys.lists() });
      queryClient.invalidateQueries({ queryKey: teamKeys.stats() });
      toast.success(data?.message || "Team deleted successfully!", {
        toastId: "team-delete",
      });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to delete team.", {
        toastId: "team-delete-error",
      });
    },
  });
};

export const useUploadTeamLogo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, file }) => teamsApi.uploadLogo(id, file),
    onSuccess: (data, { id }) => {
      queryClient.invalidateQueries({ queryKey: teamKeys.lists() });
      queryClient.invalidateQueries({ queryKey: teamKeys.detail(id) });
      toast.success(data?.message || "Team logo uploaded successfully!", {
        toastId: "team-logo-upload",
      });
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Failed to upload team logo.",
        { toastId: "team-logo-upload-error" },
      );
    },
  });
};

export const useTeamStats = () => {
  return useQuery({
    queryKey: teamKeys.stats(),
    queryFn: () => teamsApi.getStats(),
  });
};
