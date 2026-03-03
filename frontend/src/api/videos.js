import apiClient from './client';

export const videosApi = {
  getByProject: async (projectId, params = {}) => {
    const response = await apiClient.get(`/api/v1/projects/${projectId}/videos`, { params });
    return response.data;
  },

  getById: async (projectId, videoId) => {
    const response = await apiClient.get(`/api/v1/projects/${projectId}/videos/${videoId}`);
    return response.data;
  },

  create: async (projectId, formData) => {
    const response = await apiClient.post(`/api/v1/projects/${projectId}/videos`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  delete: async (projectId, videoId) => {
    const response = await apiClient.delete(`/api/v1/projects/${projectId}/videos/${videoId}`);
    return response.data;
  },
};
