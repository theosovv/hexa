export interface Sample {
  id: string;
  filename: string;
  size: number;
  url: string;
  created_at: string;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}
