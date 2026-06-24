import api from './client';

export const dashboardApi = {
  getOverview: () => api.get('/dashboard/overview'),
  getAlerts: (severity, isResolved, limit = 50) => {
    const params = new URLSearchParams();
    if (severity) params.set('severity', severity);
    if (isResolved !== undefined && isResolved !== null) params.set('is_resolved', isResolved);
    params.set('limit', limit);
    return api.get(`/dashboard/alerts?${params.toString()}`);
  },
  getHighRiskAccounts: (limit = 20) =>
    api.get(`/dashboard/high-risk?limit=${limit}`),
  getRecentComplaints: (limit = 30, state) => {
    let url = `/dashboard/complaints?limit=${limit}`;
    if (state) url += `&state=${state}`;
    return api.get(url);
  },
  resolveAlert: (alertId) =>
    api.patch(`/dashboard/alerts/${alertId}/resolve`),
};
