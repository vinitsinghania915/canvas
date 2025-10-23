import axios, { AxiosInstance, AxiosResponse } from "axios";
import { ApiResponse, User, Design, Comment } from "../types";

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5001/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response: AxiosResponse) => {
    // Return the data property from the API response (response.data.data)
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData: { username: string; email: string; password: string }) =>
    api.post<ApiResponse<{ user: User; token: string }>>(
      "/auth/register",
      userData
    ),

  login: (credentials: { email: string; password: string }) =>
    api.post<ApiResponse<{ user: User; token: string }>>(
      "/auth/login",
      credentials
    ),

  getCurrentUser: () => api.get<ApiResponse<{ user: User }>>("/auth/me"),
};

// Design API
export const designAPI = {
  getAll: () => api.get<ApiResponse<{ designs: Design[] }>>("/designs"),

  create: (designData: { name: string; description?: string; canvas?: any }) =>
    api.post<ApiResponse<{ design: Design }>>("/designs", designData),

  getById: (id: string) =>
    api.get<ApiResponse<{ design: Design }>>(`/designs/${id}`),

  update: (id: string, updates: any) =>
    api.put<ApiResponse<{ design: Design }>>(`/designs/${id}`, updates),

  delete: (id: string) => api.delete(`/designs/${id}`),

  addCollaborator: (id: string, userId: string, role: string) =>
    api.post<ApiResponse<{ design: Design }>>(`/designs/${id}/collaborators`, {
      userId,
      role,
    }),

  removeCollaborator: (id: string, userId: string) =>
    api.delete(`/designs/${id}/collaborators/${userId}`),
};

// Comment API
export const commentAPI = {
  getByDesign: (designId: string) =>
    api.get<ApiResponse<{ comments: Comment[] }>>(
      `/comments/design/${designId}`
    ),

  create: (designId: string, commentData: any) =>
    api.post<ApiResponse<{ comment: Comment }>>(
      `/comments/design/${designId}`,
      commentData
    ),

  update: (id: string, updates: any) =>
    api.put<ApiResponse<{ comment: Comment }>>(`/comments/${id}`, updates),

  delete: (id: string) => api.delete(`/comments/${id}`),

  addReply: (id: string, content: string) =>
    api.post<ApiResponse<{ comment: Comment }>>(`/comments/${id}/replies`, {
      content,
    }),
};

export default api;
