import api from './client';

export const counterfeitApi = {
  detect: (formData) =>
    api.post('/currency/check', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getHistory: (page = 1, pageSize = 20, prediction) => {
    let url = `/currency/history?page=${page}&page_size=${pageSize}`;
    if (prediction) url += `&prediction=${prediction}`;
    return api.get(url);
  },
  getRecord: (recordId) => api.get(`/currency/record/${recordId}`),
};
