import { createContext, useState, useEffect, useCallback } from "react";
import { authApi } from "../api";
import { useMe, authKeys } from "../hooks/useAuthHooks";
import { useQueryClient } from "@tanstack/react-query";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const queryClient = useQueryClient();

  const { data: userData, isLoading: isQueryLoading } = useMe({
    enabled: !!token,
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (userData) {
      localStorage.setItem("user", JSON.stringify(userData));
    }
  }, [userData]);

  const isLoading = isQueryLoading && !!token;

  const login = useCallback(
    async (credentials) => {
      const response = await authApi.login(credentials);

      if (response.success) {
        const { token: newToken, user: newUserData } = response.data;

        localStorage.setItem("token", newToken);
        localStorage.setItem("user", JSON.stringify(newUserData));

        setToken(newToken);
        queryClient.setQueryData(authKeys.me, newUserData);

        return { success: true, user: newUserData };
      }

      return { success: false, error: response.message };
    },
    [queryClient],
  );

  const register = useCallback(
    async (data) => {
      const response = await authApi.register(data);

      if (response.success) {
        const { token: newToken, user: newUserData } = response.data;

        localStorage.setItem("token", newToken);
        localStorage.setItem("user", JSON.stringify(newUserData));

        setToken(newToken);
        queryClient.setQueryData(authKeys.me, newUserData);

        return { success: true, user: newUserData };
      }

      return { success: false, error: response.message };
    },
    [queryClient],
  );

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    queryClient.setQueryData(authKeys.me, null);
    queryClient.removeQueries();
  }, [queryClient]);

  const value = {
    user: userData || JSON.parse(localStorage.getItem("user")),
    token,
    isLoading,
    isAuthenticated: !!token && (!!userData || !!localStorage.getItem("user")),
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
