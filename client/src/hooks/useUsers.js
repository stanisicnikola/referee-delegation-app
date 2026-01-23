import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usersApi } from "../api";
import { toast } from "react-toastify";

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
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.statistics() });
      queryClient.invalidateQueries({ queryKey: ["referees"] });
      toast.success(data?.message || "User created successfully!");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update user.");
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => usersApi.update(id, data),
    onSuccess: (data, { id }) => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.detail(id) });
      toast.success(data?.message || "User updated successfully!");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update user.");
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => usersApi.delete(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.statistics() });
      queryClient.invalidateQueries({ queryKey: ["referees"] });
      toast.success(data?.message || "User deleted successfully!");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to delete user.");
    },
  });
};

export const useResetPassword = () => {
  return useMutation({
    mutationFn: ({ id, data }) => usersApi.resetPassword(id, data),
  });
};
