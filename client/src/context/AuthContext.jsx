import { createContext, useState, useEffect, useCallback } from "react";
import { authApi } from "../api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [isLoading, setIsLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, [token]);

  const login = useCallback(async (credentials) => {
    const response = await authApi.login(credentials);

    if (response.success) {
      const { token: newToken, user: userData } = response.data;

      localStorage.setItem("token", newToken);
      localStorage.setItem("user", JSON.stringify(userData));

      setToken(newToken);
      setUser(userData);

      return { success: true, user: userData };
    }

    return { success: false, error: response.message };
  }, []);

  const register = useCallback(async (data) => {
    const response = await authApi.register(data);

    if (response.success) {
      const { token: newToken, user: userData } = response.data;

      localStorage.setItem("token", newToken);
      localStorage.setItem("user", JSON.stringify(userData));

      setToken(newToken);
      setUser(userData);

      return { success: true, user: userData };
    }

    return { success: false, error: response.message };
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  }, []);

  const value = {
    user,
    token,
    isLoading,
    isAuthenticated: !!token && !!user,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
