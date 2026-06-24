import api from './client';

export const citizenShieldApi = {
  checkFraud: (data) => api.post('/citizen/check', data),
  getHistory: (page = 1, pageSize = 20) =>
    api.get(`/citizen/history?page=${page}&page_size=${pageSize}`),
  getReport: (reportId) => api.get(`/citizen/report/${reportId}`),
};
