import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { venuesApi } from "../api";

export const venueKeys = {
  all: ["venues"],
  lists: () => [...venueKeys.all, "list"],
  list: (params) => [...venueKeys.lists(), params],
  details: () => [...venueKeys.all, "detail"],
  detail: (id) => [...venueKeys.details(), id],
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

export const useCreateVenue = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => venuesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: venueKeys.lists() });
    },
  });
};

export const useUpdateVenue = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => venuesApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: venueKeys.lists() });
      queryClient.invalidateQueries({ queryKey: venueKeys.detail(id) });
    },
  });
};

export const useDeleteVenue = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => venuesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: venueKeys.lists() });
    },
  });
};
