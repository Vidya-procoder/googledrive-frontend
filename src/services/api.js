import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor - Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  activate: (token) => api.get(`/auth/activate/${token}`),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (token, data) => api.post(`/auth/reset-password/${token}`, data),
  getCurrentUser: () => api.get('/auth/me')
};

// Files API
export const filesAPI = {
  getFiles: (parentFolder = null, view = 'my-drive', search = '', type = '', sort = '') => {
    const params = {};
    if (parentFolder) params.parentFolder = parentFolder;
    if (view === 'trash') params.trash = 'true';
    if (view === 'starred') params.starred = 'true';
    if (search) params.search = search;
    if (type) params.type = type;
    if (sort) params.sort = sort;
    
    return api.get('/files', { params });
  },
  createFolder: (data) => api.post('/files/folder', data),
  uploadFile: (formData, onUploadProgress) => {
    return api.post('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress
    });
  },
  getDownloadUrl: (fileId) => api.get(`/files/${fileId}/download`),
  downloadFolder: (folderId) => api.get(`/files/folder/${folderId}/download`, { responseType: 'blob' }),
  deleteFile: (fileId) => api.delete(`/files/${fileId}`),
  toggleStar: (fileId) => api.put(`/files/${fileId}/star`),
  restoreFile: (fileId) => api.put(`/files/${fileId}/restore`),
  permanentDelete: (fileId) => api.delete(`/files/${fileId}/permanent`)
};

export default api;
