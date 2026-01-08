import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { availabilityApi } from "../api";

export const availabilityKeys = {
  all: ["availability"],
  myAvailability: () => [...availabilityKeys.all, "my-availability"],
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
};

// Get my availability (for logged in referee)
export const useMyAvailability = (params = {}) => {
  return useQuery({
    queryKey: availabilityKeys.myAvailability(),
    queryFn: () => availabilityApi.getMyAvailability(params),
  });
};

// Get my calendar
export const useMyCalendar = (params = {}) => {
  return useQuery({
    queryKey: availabilityKeys.myCalendar(params),
    queryFn: () => availabilityApi.getMyCalendar(params),
    enabled: !!params.month && !!params.year,
  });
};

// Set my availability
export const useSetMyAvailability = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => availabilityApi.setMyAvailability(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: availabilityKeys.myAvailability(),
      });
      queryClient.invalidateQueries({ queryKey: availabilityKeys.all });
    },
  });
};

// Get referee availability
export const useRefereeAvailability = (refereeId, params = {}) => {
  return useQuery({
    queryKey: availabilityKeys.refereeAvailability(refereeId),
    queryFn: () => availabilityApi.getRefereeAvailability(refereeId, params),
    enabled: !!refereeId,
  });
};

// Get referee calendar
export const useRefereeCalendar = (refereeId, params = {}) => {
  return useQuery({
    queryKey: availabilityKeys.refereeCalendar(refereeId, params),
    queryFn: () => availabilityApi.getRefereeCalendar(refereeId, params),
    enabled: !!refereeId && !!params.month && !!params.year,
  });
};

// Set referee availability (admin only)
export const useSetRefereeAvailability = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ refereeId, data }) =>
      availabilityApi.setRefereeAvailability(refereeId, data),
    onSuccess: (_, { refereeId }) => {
      queryClient.invalidateQueries({
        queryKey: availabilityKeys.refereeAvailability(refereeId),
      });
      queryClient.invalidateQueries({ queryKey: availabilityKeys.all });
    },
  });
};

// Set referee availability range (admin only)
export const useSetRefereeAvailabilityRange = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ refereeId, data }) =>
      availabilityApi.setRefereeAvailabilityRange(refereeId, data),
    onSuccess: (_, { refereeId }) => {
      queryClient.invalidateQueries({
        queryKey: availabilityKeys.refereeAvailability(refereeId),
      });
      queryClient.invalidateQueries({ queryKey: availabilityKeys.all });
    },
  });
};

// Get available referees for date
export const useAvailableRefereesForDate = (date) => {
  return useQuery({
    queryKey: availabilityKeys.availableReferees(date),
    queryFn: () => availabilityApi.getAvailableReferees(date),
    enabled: !!date,
  });
};

// Get unavailable referees for date
export const useUnavailableRefereesForDate = (date) => {
  return useQuery({
    queryKey: availabilityKeys.unavailableReferees(date),
    queryFn: () => availabilityApi.getUnavailableReferees(date),
    enabled: !!date,
  });
};

// Delete availability
export const useDeleteAvailability = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => availabilityApi.deleteAvailability(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: availabilityKeys.all });
    },
  });
};
