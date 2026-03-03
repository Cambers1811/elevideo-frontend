import apiClient from './client';

export const authApi = {
  login: async (credentials) => {
    const response = await apiClient.post('/api/v1/auth/login', credentials);
    return response.data;
  },

  register: async (userData) => {
    const response = await apiClient.post('/api/v1/auth/register', userData);
    return response.data;
  },

  verifyEmail: async (token) => {
    const response = await apiClient.post('/api/v1/auth/verify-email', { token });
    return response.data;
  },

  forgotPassword: async (email) => {
    const response = await apiClient.post('/api/v1/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (data) => {
    const response = await apiClient.post('/api/v1/auth/reset-password', data);
    return response.data;
  },

  getMe: async () => {
    const response = await apiClient.get('/api/users/me');
    return response.data;
  },
};
