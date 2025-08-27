import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
});

export type Video = {
  _id: string;
  name: string;
  key: string;
  size: number;
  mimeType: string;
  createdAt: string;
};

export type Paginated<T> = {
  items: T[];
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
};

export async function listVideos(page?: number, limit: number = 12, q?: string) {
  const params: any = {};
  if (page) params.page = page;
  if (limit) params.limit = limit;
  if (q) params.q = q;
  const res = await api.get<Video[] | Paginated<Video>>("/api/videos", { params });
  if (Array.isArray(res.data)) {
    return { items: res.data, page: 1, limit: res.data.length, total: res.data.length, hasMore: false } as Paginated<Video>;
  }
  return res.data as Paginated<Video>;
}

export async function sendRequest(payload: { name: string; email: string; message: string; videoName?: string }) {
  const res = await api.post<{ message: string }>("/api/requests", payload);
  return res.data;
}

export async function getDownloadLink(id: string) {
  const res = await api.get<{ url: string; filename: string; mimeType: string }>(`/api/videos/${id}/download`);
  return res.data;
}

export async function uploadVideo(name: string, file: File, onUploadProgress?: (p: number) => void) {
  const form = new FormData();
  form.append("name", name);
  form.append("video", file);
  const res = await api.post("/api/videos", form, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: (evt) => {
      if (!evt.total) return;
      const percent = Math.round((evt.loaded * 100) / evt.total);
      onUploadProgress?.(percent);
    },
  });
  return res.data;
}

export default api;
