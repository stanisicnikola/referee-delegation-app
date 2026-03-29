import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { venuesApi } from "../api";
import { toast } from "react-toastify";

export const venueKeys = {
  all: ["venues"],
  lists: () => [...venueKeys.all, "list"],
  list: (params) => [...venueKeys.lists(), params],
  details: () => [...venueKeys.all, "detail"],
  detail: (id) => [...venueKeys.details(), id],
  statistics: () => [...venueKeys.all, "statistics"],
};

export const useVenues = (params = {}) => {
  return useQuery({
    queryKey: venueKeys.list(params),
    queryFn: () => venuesApi.getAll(params),
  });
};

export const useVenue = (id) => {
  return useQuery({
    queryKey: venueKeys.detail(id),
    queryFn: () => venuesApi.getById(id),
    enabled: !!id,
  });
};

export const useVenueStatistics = () => {
  return useQuery({
    queryKey: venueKeys.statistics(),
    queryFn: () => venuesApi.getStatistics(),
  });
};

export const useCreateVenue = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => venuesApi.create(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: venueKeys.lists() });
      queryClient.invalidateQueries({ queryKey: venueKeys.statistics() });
      toast.success(data?.message || "Venue created successfully!", {
        toastId: "venue-create",
      });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to create venue.", {
        toastId: "venue-create-error",
      });
    },
  });
};

export const useUpdateVenue = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => venuesApi.update(id, data),
    onSuccess: (data, { id }) => {
      queryClient.invalidateQueries({ queryKey: venueKeys.lists() });
      queryClient.invalidateQueries({ queryKey: venueKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: venueKeys.statistics() });
      toast.success(data?.message || "Venue updated successfully!", {
        toastId: "venue-update",
      });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update venue.", {
        toastId: "venue-update-error",
      });
    },
  });
};

export const useDeleteVenue = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => venuesApi.delete(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: venueKeys.lists() });
      queryClient.invalidateQueries({ queryKey: venueKeys.statistics() });
      toast.success(data?.message || "Venue deleted successfully!", {
        toastId: "venue-delete",
      });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to delete venue.", {
        toastId: "venue-delete-error",
      });
    },
  });
};
