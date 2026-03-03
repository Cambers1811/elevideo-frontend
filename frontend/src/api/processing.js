import apiClient from './client';

export const processingApi = {
  processVideo: async (videoId, processData) => {
    const response = await apiClient.post(`/api/v1/videos/${videoId}/process`, processData);
    return response.data;
  },

  getJobs: async (videoId, params = {}) => {
    const response = await apiClient.get(`/api/v1/videos/${videoId}/jobs`, { params });
    return response.data;
  },

  getJobStatus: async (videoId, jobId) => {
    const response = await apiClient.get(`/api/v1/videos/${videoId}/jobs/${jobId}`);
    return response.data;
  },

  cancelJob: async (videoId, jobId) => {
    const response = await apiClient.post(`/api/v1/videos/${videoId}/jobs/${jobId}/cancel`);
    return response.data;
  },

  getRenditions: async (videoId, params = {}) => {
    const response = await apiClient.get(`/api/v1/videos/${videoId}/rendition`, { params });
    return response.data;
  },

  getRenditionById: async (videoId, renditionId) => {
    const response = await apiClient.get(`/api/v1/videos/${videoId}/rendition/${renditionId}`, {
      params: { renditionId },
    });
    return response.data;
  },

  deleteRendition: async (videoId, renditionId) => {
    const response = await apiClient.delete(`/api/v1/videos/${videoId}/rendition/${renditionId}`, {
      params: { renditionId },
    });
    return response.data;
  },
};
