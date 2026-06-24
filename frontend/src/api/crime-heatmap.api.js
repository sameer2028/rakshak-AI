import api from './client';

export const crimeHeatmapApi = {
  getPoints: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.crimeType) params.set('crime_type', filters.crimeType);
    if (filters.state) params.set('state', filters.state);
    if (filters.district) params.set('district', filters.district);
    if (filters.dateFrom) params.set('date_from', filters.dateFrom);
    if (filters.dateTo) params.set('date_to', filters.dateTo);
    return api.get(`/heatmap/points?${params.toString()}`);
  },
  getStats: (state) => {
    let url = '/heatmap/stats';
    if (state) url += `?state=${state}`;
    return api.get(url);
  },
  getDistricts: (state, riskLevel) => {
    const params = new URLSearchParams();
    if (state) params.set('state', state);
    if (riskLevel) params.set('risk_level', riskLevel);
    return api.get(`/heatmap/districts?${params.toString()}`);
  },
};
