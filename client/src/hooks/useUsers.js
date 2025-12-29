import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usersApi } from "../api";

export const userKeys = {
  all: ["users"],
  lists: () => [...userKeys.all, "list"],
  list: (params) => [...userKeys.lists(), params],
  details: () => [...userKeys.all, "detail"],
  detail: (id) => [...userKeys.details(), id],
  statistics: () => [...userKeys.all, "statistics"],
};

export const useUsers = (params = {}) => {
  return useQuery({
    queryKey: userKeys.list(params),
    queryFn: () => usersApi.getAll(params),
  });
};

export const useUser = (id) => {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => usersApi.getById(id),
    enabled: !!id,
  });
};

export const useUserStatistics = () => {
  return useQuery({
    queryKey: userKeys.statistics(),
    queryFn: () => usersApi.getStatistics(),
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => usersApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.statistics() });
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => usersApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.detail(id) });
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => usersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.statistics() });
    },
  });
};

export const useResetPassword = () => {
  return useMutation({
    mutationFn: ({ id, data }) => usersApi.resetPassword(id, data),
  });
};
