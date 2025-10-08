import type { User, TokenPair, APIError } from "./types/auth";
import type { Sample } from "./types/sample";
import type { Track, CreateTrackInput, UpdateTrackInput, GraphData } from "./types/track";


const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

class APIClient {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private isRefreshing = false;
  private refreshCallbacks: Array<(token: string) => void> = [];

  setTokens(accessToken: string | null, refreshToken: string | null) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
  }

  setAccessToken(token: string | null) {
    this.accessToken = token;
  }

  private async refreshAccessToken(): Promise<string | null> {
    if (!this.refreshToken) return null;

    try {
      const tokens = await this.request<TokenPair>("/auth/refresh", {
        method: "POST",
        body: JSON.stringify({ refresh_token: this.refreshToken }),
      }, false);

      this.accessToken = tokens.access_token;
      this.refreshToken = tokens.refresh_token;

      localStorage.setItem("hexa_access_token", tokens.access_token);
      localStorage.setItem("hexa_refresh_token", tokens.refresh_token);

      return tokens.access_token;
    } catch (error) {
      console.error("Failed to refresh token:", error);
      this.clearTokens();
      return null;
    }
  }

  private clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    localStorage.removeItem("hexa_access_token");
    localStorage.removeItem("hexa_refresh_token");
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retry = true,
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

    if (response.status === 401 && retry && this.refreshToken) {
      console.log("Token expired, refreshing...");

      if (this.isRefreshing) {
        return new Promise((resolve, reject) => {
          this.refreshCallbacks.push((newToken) => {
            headers["Authorization"] = `Bearer ${newToken}`;
            fetch(`${API_URL}${endpoint}`, { ...options, headers })
              .then((res) => res.json())
              .then(resolve)
              .catch(reject);
          });
        });
      }

      this.isRefreshing = true;
      const newToken = await this.refreshAccessToken();
      this.isRefreshing = false;

      if (newToken) {
        this.refreshCallbacks.forEach((cb) => cb(newToken));
        this.refreshCallbacks = [];

        headers["Authorization"] = `Bearer ${newToken}`;
        const retryResponse = await fetch(`${API_URL}${endpoint}`, {
          ...options,
          headers,
        });

        if (!retryResponse.ok) {
          throw new Error("Request failed after token refresh");
        }

        return retryResponse.json();
      } else {
        window.location.href = "/login";
        throw new Error("Session expired");
      }
    }

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

  async refreshTokenManual(refreshToken: string): Promise<TokenPair> {
    return this.request<TokenPair>("/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refresh_token: refreshToken }),
    }, false);
  }

  async logout(): Promise<{ message: string }> {
    return this.request("/api/logout", {
      method: "POST",
    });
  }

  async listTracks(): Promise<Track[]> {
    return this.request<Track[]>("/api/tracks");
  }

  async getTrack(id: string): Promise<Track> {
    return this.request<Track>(`/api/tracks/${id}`);
  }

  async createTrack(input: CreateTrackInput): Promise<Track> {
    return this.request<Track>("/api/tracks", {
      method: "POST",
      body: JSON.stringify(input),
    });
  }

  async updateTrack(id: string, input: UpdateTrackInput): Promise<Track> {
    return this.request<Track>(`/api/tracks/${id}`, {
      method: "PUT",
      body: JSON.stringify(input),
    });
  }

  async updateTrackGraph(id: string, graphData: GraphData): Promise<Track> {
    return this.request<Track>(`/api/tracks/${id}/graph`, {
      method: "PATCH",
      body: JSON.stringify({ graph_data: graphData }),
    });
  }

  async deleteTrack(id: string): Promise<{ message: string }> {
    return this.request(`/api/tracks/${id}`, {
      method: "DELETE",
    });
  }

  async getPublicTrack(id: string): Promise<Track> {
    return this.request<Track>(`/api/public/${id}`);
  }

  async uploadSample(
    trackId: string,
    file: File,
    onProgress?: (progress: number) => void,
  ): Promise<Sample> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("track_id", trackId);

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable && onProgress) {
          const percentage = (e.loaded / e.total) * 100;
          onProgress(percentage);
        }
      });

      xhr.addEventListener("load", () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(JSON.parse(xhr.responseText));
        } else {
          reject(new Error(`Upload failed: ${xhr.status}`));
        }
      });

      xhr.addEventListener("error", () => {
        reject(new Error("Upload failed"));
      });

      xhr.open("POST", `${API_URL}/api/samples/upload`);
      if (this.accessToken) {
        xhr.setRequestHeader("Authorization", `Bearer ${this.accessToken}`);
      }
      xhr.send(formData);
    });
  }

  async getSample(id: string): Promise<Sample> {
    return this.request<Sample>(`/api/samples/${id}`);
  }

  async deleteSample(id: string): Promise<{ message: string }> {
    return this.request(`/api/samples/${id}`, {
      method: "DELETE",
    });
  }

  async listTrackSamples(trackId: string): Promise<Sample[]> {
    return this.request<Sample[]>(`/api/tracks/${trackId}/samples`);
  }

  getGoogleLoginURL(): string {
    return `${API_URL}/auth/google`;
  }

  getGitHubLoginURL(): string {
    return `${API_URL}/auth/github`;
  }
}

export const apiClient = new APIClient();
