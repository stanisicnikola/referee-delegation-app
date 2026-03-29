import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { refereesApi } from "../api";
import { toast } from "react-toastify";

export const refereeKeys = {
  all: ["referees"],
  lists: () => [...refereeKeys.all, "list"],
  list: (params) => [...refereeKeys.lists(), params],
  details: () => [...refereeKeys.all, "detail"],
  detail: (id) => [...refereeKeys.details(), id],
  available: (params) => [...refereeKeys.all, "available", params],
  assignments: (id) => [...refereeKeys.all, "assignments", id],
  statistics: (id) => [...refereeKeys.all, "statistics", id],
  overallStatistics: () => [...refereeKeys.all, "overall-statistics"],
  myAssignments: () => [...refereeKeys.all, "my-assignments"],
  myStatistics: () => [...refereeKeys.all, "my-statistics"],
};

export const useReferees = (params = {}) => {
  return useQuery({
    queryKey: refereeKeys.list(params),
    queryFn: () => refereesApi.getAll(params),
  });
};

export const useReferee = (id) => {
  return useQuery({
    queryKey: refereeKeys.detail(id),
    queryFn: () => refereesApi.getById(id),
    enabled: !!id,
  });
};

export const useAvailableReferees = (params = {}) => {
  return useQuery({
    queryKey: refereeKeys.available(params),
    queryFn: () => refereesApi.getAvailable(params),
    enabled: !!params.date,
  });
};

export const useRefereeAssignments = (id) => {
  return useQuery({
    queryKey: refereeKeys.assignments(id),
    queryFn: () => refereesApi.getAssignments(id),
    enabled: !!id,
  });
};

export const useRefereeStatistics = (id) => {
  return useQuery({
    queryKey: refereeKeys.statistics(id),
    queryFn: () => refereesApi.getStatistics(id),
    enabled: !!id,
  });
};

export const useRefereesStatistics = () => {
  return useQuery({
    queryKey: refereeKeys.overallStatistics(),
    queryFn: () => refereesApi.getOverallStatistics(),
  });
};

export const useMyAssignments = () => {
  return useQuery({
    queryKey: refereeKeys.myAssignments(),
    queryFn: () => refereesApi.getMyAssignments(),
  });
};

export const useMyStatistics = () => {
  return useQuery({
    queryKey: refereeKeys.myStatistics(),
    queryFn: () => refereesApi.getMyStatistics(),
  });
};

export const useCreateReferee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => refereesApi.create(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: refereeKeys.lists() });
      toast.success(data?.message || "Referee created successfully!", {
        toastId: "referee-create",
      });
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Failed to create referee.",
        { toastId: "referee-create-error" },
      );
    },
  });
};

export const useUpdateReferee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => refereesApi.update(id, data),
    onSuccess: (data, { id }) => {
      queryClient.invalidateQueries({ queryKey: refereeKeys.lists() });
      queryClient.invalidateQueries({ queryKey: refereeKeys.detail(id) });
      toast.success(data?.message || "Referee updated successfully!", {
        toastId: "referee-update",
      });
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Failed to update referee.",
        { toastId: "referee-update-error" },
      );
    },
  });
};

export const useDeleteReferee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => refereesApi.delete(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: refereeKeys.lists() });
      toast.success(data?.message || "Referee deleted successfully!", {
        toastId: "referee-delete",
      });
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Failed to delete referee.",
        { toastId: "referee-delete-error" },
      );
    },
  });
};
