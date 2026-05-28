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
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => authApi.changePassword(data),
    onSuccess: (data) => {
      if (data?.data) {
        queryClient.setQueryData(authKeys.me, data.data);
        localStorage.setItem("user", JSON.stringify(data.data));
      } else {
        queryClient.invalidateQueries({ queryKey: authKeys.me });
      }
      toast.success(data?.message || "Password changed successfully!", {
        toastId: "auth-change-password",
      });
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Failed to change password.",
        { toastId: "auth-change-password-error" },
      );
    },
  });
};

export const useUpdateMe = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => authApi.updateMe(data),
    onSuccess: (data) => {
      if (data?.data) {
        queryClient.setQueryData(authKeys.me, data.data);
        localStorage.setItem("user", JSON.stringify(data.data));
      } else {
        queryClient.invalidateQueries({ queryKey: authKeys.me });
      }

      queryClient.invalidateQueries({ queryKey: ["referees"] });
      queryClient.invalidateQueries({ queryKey: ["delegations"] });
      queryClient.invalidateQueries({ queryKey: ["availability"] });
      toast.success(data?.message || "Profile updated successfully.", {
        toastId: "auth-update-me",
      });
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Failed to update profile.",
        { toastId: "auth-update-me-error" },
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
      toast.success(data?.message || "Account deleted successfully!", {
        toastId: "auth-delete-me",
      });
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Failed to delete account.",
        { toastId: "auth-delete-me-error" },
      );
    },
  });
};
