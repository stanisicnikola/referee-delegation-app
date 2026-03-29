import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { competitionsApi } from "../api";
import { toast } from "react-toastify";

export const competitionKeys = {
  all: ["competitions"],
  lists: () => [...competitionKeys.all, "list"],
  list: (params) => [...competitionKeys.lists(), params],
  details: () => [...competitionKeys.all, "detail"],
  detail: (id) => [...competitionKeys.details(), id],
  seasons: () => [...competitionKeys.all, "seasons"],
  statistics: (id) => [...competitionKeys.all, "statistics", id],
  summary: () => [...competitionKeys.all, "summary"],
};

export const useCompetitions = (params = {}) => {
  return useQuery({
    queryKey: competitionKeys.list(params),
    queryFn: () => competitionsApi.getAll(params),
  });
};

export const useCompetition = (id) => {
  return useQuery({
    queryKey: competitionKeys.detail(id),
    queryFn: () => competitionsApi.getById(id),
    enabled: !!id,
  });
};

export const useSeasons = () => {
  return useQuery({
    queryKey: competitionKeys.seasons(),
    queryFn: () => competitionsApi.getSeasons(),
  });
};

export const useCompetitionStatistics = (id) => {
  return useQuery({
    queryKey: competitionKeys.statistics(id),
    queryFn: () => competitionsApi.getStatistics(id),
    enabled: !!id,
  });
};

export const useCompetitionSummary = () => {
  return useQuery({
    queryKey: competitionKeys.summary(),
    queryFn: () => competitionsApi.getSummary(),
  });
};

export const useCreateCompetition = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => competitionsApi.create(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: competitionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: competitionKeys.summary() });
      toast.success(data?.message || "Competition created successfully!", {
        toastId: "competition-create",
      });
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Failed to create competition.",
        { toastId: "competition-create-error" },
      );
    },
  });
};

export const useUpdateCompetition = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => competitionsApi.update(id, data),
    onSuccess: (data, { id }) => {
      queryClient.invalidateQueries({ queryKey: competitionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: competitionKeys.summary() });
      queryClient.invalidateQueries({ queryKey: competitionKeys.detail(id) });
      toast.success(data?.message || "Competition updated successfully!", {
        toastId: "competition-update",
      });
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Failed to update competition.",
        { toastId: "competition-update-error" },
      );
    },
  });
};

export const useDeleteCompetition = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => competitionsApi.delete(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: competitionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: competitionKeys.summary() });
      toast.success(data?.message || "Competition deleted successfully!", {
        toastId: "competition-delete",
      });
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Failed to delete competition.",
        { toastId: "competition-delete-error" },
      );
    },
  });
};
