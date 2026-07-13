import api from './client';

// ── Legacy /currency/* endpoints (backward compatibility) ─────────────────

export const counterfeitApi = {
  /** Legacy: detect using old ResNet50 pipeline at /api/currency/check */
  detect: (formData) =>
    api.post('/currency/check', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  /** Legacy: paginated history at /api/currency/history */
  getHistory: (page = 1, pageSize = 20, prediction) => {
    let url = `/currency/history?page=${page}&page_size=${pageSize}`;
    if (prediction) url += `&prediction=${prediction}`;
    return api.get(url);
  },

  /** Legacy: single record at /api/currency/record/:id */
  getRecord: (recordId) => api.get(`/currency/record/${recordId}`),

  // ── CC Pipeline endpoints (/api/cc/*) ──────────────────────────────────

  /**
   * Run the full CC multi-stage pipeline on an uploaded currency image.
   * @param {FormData} formData - must contain 'file' and 'denomination'
   */
  verify: (formData) =>
    api.post('/cc/verify', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 120000,
    }),

  /**
   * Fetch CC verification history from MongoDB.
   * @param {number} limit - max records to return (1–100, default 20)
   */
  getCCHistory: (limit = 20) => api.get(`/cc/history?limit=${limit}`),

  /**
   * Fetch aggregated CC analytics stats.
   */
  getStats: () => api.get('/cc/stats'),
};
