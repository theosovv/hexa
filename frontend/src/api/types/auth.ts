export interface User {
  id: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  storage_used: number;
  storage_limit: number;
}

export interface TokenPair {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export interface APIError {
  error: string;
}
