import { createContext, useContext, createSignal, createEffect, type ParentComponent } from "solid-js";

import { apiClient } from "../api/client";
import type { User } from "../api/types/auth";

interface AuthContextType {
  user: () => User | null;
  isAuthenticated: () => boolean;
  isLoading: () => boolean;
  login: (accessToken: string, refreshToken: string) => void;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>();

const ACCESS_TOKEN_KEY = "hexa_access_token";
const REFRESH_TOKEN_KEY = "hexa_refresh_token";

export const AuthProvider: ParentComponent = (props) => {
  const [user, setUser] = createSignal<User | null>(null);
  const [isLoading, setIsLoading] = createSignal(true);

  const isAuthenticated = () => user() !== null;

  const getAccessToken = () => localStorage.getItem(ACCESS_TOKEN_KEY);
  const getRefreshToken = () => localStorage.getItem(REFRESH_TOKEN_KEY);

  const setTokens = (accessToken: string, refreshToken: string) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    apiClient.setAccessToken(accessToken);
  };

  const clearTokens = () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);

    apiClient.setAccessToken(null);
  };

  const fetchUser = async () => {
    try {
      const userData = await apiClient.getCurrentUser();

      setUser(userData);
    } catch (error) {
      console.error("Failed to fetch user:", error);

      setUser(null);
      clearTokens();
    } finally {
      setIsLoading(false);
    }
  };

  const refreshAuth = async () => {
    const refreshToken = getRefreshToken();

    if (!refreshToken) {
      setIsLoading(false);
      return;
    }

    try {
      const tokens = await apiClient.refreshToken(refreshToken);

      setTokens(tokens.access_token, tokens.refresh_token);

      await fetchUser();
    } catch (error) {
      console.error("Failed to refresh token:", error);

      clearTokens();
      setUser(null);
      setIsLoading(false);
    }
  };

  const login = (accessToken: string, refreshToken: string) => {
    setTokens(accessToken, refreshToken);
    fetchUser();
  };

  const logout = async () => {
    try {
      await apiClient.logout();
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      clearTokens();
      setUser(null);
    }
  };

  createEffect(() => {
    const accessToken = getAccessToken();

    if (accessToken) {
      apiClient.setAccessToken(accessToken);

      fetchUser();
    } else {
      setIsLoading(false);
    }
  });

  createEffect(() => {
    if (!isAuthenticated()) return;

    const interval = setInterval(() => {
      refreshAuth();
    }, 14 * 60 * 1000);

    return () => clearInterval(interval);
  });

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    refreshAuth,
  };

  return <AuthContext.Provider value={value}>{props.children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
};
