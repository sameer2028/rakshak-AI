import api from './client';

export const scamDetectionApi = {
  analyze: (data) => api.post('/scam/analyze', data),
  getDetections: (page = 1, pageSize = 20, scamType, status) => {
    let url = `/scam/detections?page=${page}&page_size=${pageSize}`;
    if (scamType) url += `&scam_type=${scamType}`;
    if (status) url += `&status=${status}`;
    return api.get(url);
  },
  updateStatus: (detectionId, data) =>
    api.patch(`/scam/detections/${detectionId}`, data),
};
