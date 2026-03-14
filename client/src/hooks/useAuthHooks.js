import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authApi } from "../api";
import { toast } from "react-toastify";

export const authKeys = {
  me: ["auth", "me"],
};

export const useMe = (options = {}) => {
  return useQuery({
    queryKey: authKeys.me,
    queryFn: async () => {
      const response = await authApi.getMe();
      return response.data;
    },
    ...options,
  });
};

export const useVerifyPassword = () => {
  return useMutation({
    mutationFn: (password) => authApi.verifyPassword(password),
  });
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: (data) => authApi.changePassword(data),
    onSuccess: (data) => {
      toast.success(data?.message || "Password changed successfully!");
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Failed to change password.",
      );
    },
  });
};

export const useDeleteMe = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authApi.deleteMe(),
    onSuccess: (data) => {
      queryClient.setQueryData(authKeys.me, null);
      queryClient.removeQueries();
      toast.success(data?.message || "Account deleted successfully!");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to delete account.");
    },
  });
};
