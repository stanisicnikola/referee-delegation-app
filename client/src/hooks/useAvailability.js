import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { availabilityApi } from "../api";
import { toast } from "react-toastify";

export const availabilityKeys = {
  all: ["availability"],
  myAvailability: (params) => [
    ...availabilityKeys.all,
    "my-availability",
    params,
  ],
  myCalendar: (params) => [...availabilityKeys.all, "my-calendar", params],
  refereeAvailability: (refereeId) => [
    ...availabilityKeys.all,
    "referee",
    refereeId,
  ],
  refereeCalendar: (refereeId, params) => [
    ...availabilityKeys.all,
    "referee-calendar",
    refereeId,
    params,
  ],
  availableReferees: (date) => [...availabilityKeys.all, "available", date],
  unavailableReferees: (date) => [...availabilityKeys.all, "unavailable", date],
  requests: (params) => [...availabilityKeys.all, "requests", params],
};

export const useMyAvailability = (params = {}) => {
  return useQuery({
    queryKey: availabilityKeys.myAvailability(params),
    queryFn: () => availabilityApi.getMyAvailability(params),
  });
};

export const useMyCalendar = (params = {}) => {
  return useQuery({
    queryKey: availabilityKeys.myCalendar(params),
    queryFn: () => availabilityApi.getMyCalendar(params),
    enabled: !!params.month && !!params.year,
    placeholderData: (previousData) => previousData,
  });
};

export const useSetMyAvailability = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => availabilityApi.setMyAvailability(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: availabilityKeys.myAvailability(),
      });
      queryClient.invalidateQueries({ queryKey: availabilityKeys.all });
      queryClient.invalidateQueries({ queryKey: ["referees"] });
      queryClient.invalidateQueries({ queryKey: ["delegations"] });
      toast.success(data?.message || "Availability updated successfully!", {
        toastId: "availability-set-my",
      });
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Failed to update availability.",
        { toastId: "availability-set-my-error" },
      );
    },
  });
};

export const useSetMyAvailabilityRange = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => availabilityApi.setMyAvailabilityRange(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: availabilityKeys.all });
      queryClient.invalidateQueries({ queryKey: ["referees"] });
      queryClient.invalidateQueries({ queryKey: ["delegations"] });
      toast.success(data?.message || "Unavailability request submitted!", {
        toastId: "availability-set-my-range",
      });
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message ||
          "Failed to submit unavailability request.",
        { toastId: "availability-set-my-range-error" },
      );
    },
  });
};

export const useDeleteMyAvailability = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids) =>
      Promise.all(ids.map((id) => availabilityApi.deleteMyAvailability(id))),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: availabilityKeys.all });
      toast.success("Availability request deleted.", {
        toastId: "availability-delete-my",
      });
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message ||
          "Failed to delete availability request.",
        { toastId: "availability-delete-my-error" },
      );
    },
  });
};

export const useRefereeAvailability = (refereeId, params = {}) => {
  return useQuery({
    queryKey: availabilityKeys.refereeAvailability(refereeId),
    queryFn: () => availabilityApi.getRefereeAvailability(refereeId, params),
    enabled: !!refereeId,
  });
};

export const useRefereeCalendar = (refereeId, params = {}) => {
  return useQuery({
    queryKey: availabilityKeys.refereeCalendar(refereeId, params),
    queryFn: () => availabilityApi.getRefereeCalendar(refereeId, params),
    enabled: !!refereeId && !!params.month && !!params.year,
  });
};

export const useSetRefereeAvailability = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ refereeId, data }) =>
      availabilityApi.setRefereeAvailability(refereeId, data),
    onSuccess: (data, { refereeId }) => {
      queryClient.invalidateQueries({
        queryKey: availabilityKeys.refereeAvailability(refereeId),
      });
      queryClient.invalidateQueries({ queryKey: availabilityKeys.all });
      toast.success(
        data?.message || "Referee availability updated successfully!",
        { toastId: "availability-set-referee" },
      );
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message ||
          "Failed to update referee availability.",
        { toastId: "availability-set-referee-error" },
      );
    },
  });
};

export const useSetRefereeAvailabilityRange = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ refereeId, data }) =>
      availabilityApi.setRefereeAvailabilityRange(refereeId, data),
    onSuccess: (data, { refereeId }) => {
      queryClient.invalidateQueries({
        queryKey: availabilityKeys.refereeAvailability(refereeId),
      });
      queryClient.invalidateQueries({ queryKey: availabilityKeys.all });
      toast.success(
        data?.message || "Referee availability range updated successfully!",
        { toastId: "availability-set-referee-range" },
      );
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message ||
          "Failed to update referee availability range.",
        { toastId: "availability-set-referee-range-error" },
      );
    },
  });
};

export const useAvailableRefereesForDate = (date) => {
  return useQuery({
    queryKey: availabilityKeys.availableReferees(date),
    queryFn: () => availabilityApi.getAvailableReferees(date),
    enabled: !!date,
  });
};

export const useUnavailableRefereesForDate = (date) => {
  return useQuery({
    queryKey: availabilityKeys.unavailableReferees(date),
    queryFn: () => availabilityApi.getUnavailableReferees(date),
    enabled: !!date,
  });
};

export const useAvailabilityRequests = (params = {}) => {
  return useQuery({
    queryKey: availabilityKeys.requests(params),
    queryFn: () => availabilityApi.getAvailabilityRequests(params),
  });
};

export const useReviewAvailabilityRequests = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => availabilityApi.reviewAvailabilityRequests(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: availabilityKeys.all });
      queryClient.invalidateQueries({ queryKey: ["referees"] });
      queryClient.invalidateQueries({ queryKey: ["delegations"] });
      toast.success(data?.message || "Availability request reviewed.", {
        toastId: "availability-review",
      });
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message ||
          "Failed to review availability request.",
        { toastId: "availability-review-error" },
      );
    },
  });
};

export const useDeleteAvailability = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => availabilityApi.deleteAvailability(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: availabilityKeys.all });
      toast.success(data?.message || "Availability deleted successfully!", {
        toastId: "availability-delete",
      });
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Failed to delete availability.",
        { toastId: "availability-delete-error" },
      );
    },
  });
};
