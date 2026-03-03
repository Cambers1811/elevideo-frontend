import apiClient from './client';

export const usersApi = {
  getById: async (userId) => {
    const response = await apiClient.get(`/api/users/${userId}`);
    return response.data;
  },

  update: async (userData) => {
    const response = await apiClient.patch('/api/users', userData);
    return response.data;
  },

  changePassword: async (userId, passwords) => {
    const response = await apiClient.patch(`/api/users/${userId}/password`, passwords);
    return response.data;
  },

  delete: async (userId) => {
    const response = await apiClient.delete(`/api/users/${userId}`);
    return response.data;
  },
};
