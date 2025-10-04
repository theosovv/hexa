import type { APIError, TokenPair, User } from "./types/auth";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

class APIClient {
  private accessToken: string | null = null;

  setAccessToken(token: string | null) {
    this.accessToken = token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    if (this.accessToken) {
      headers["Authorization"] = `Bearer ${this.accessToken}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
      credentials: "include",
    });

    if (!response.ok) {
      const error: APIError = await response.json().catch(() => ({
        error: "Unknown error",
      }));
      throw new Error(error.error);
    }

    return response.json();
  }

  async getCurrentUser(): Promise<User> {
    return this.request<User>("/api/me");
  }

  async refreshToken(refreshToken: string): Promise<TokenPair> {
    return this.request<TokenPair>("/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
  }

  async logout(): Promise<{ message: string }> {
    return this.request("/api/logout", {
      method: "POST",
    });
  }

  getGitHubLoginURL(): string {
    return `${API_URL}/auth/github`;
  }
}

export const apiClient = new APIClient();
