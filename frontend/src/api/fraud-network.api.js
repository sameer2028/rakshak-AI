import api from './client';

export const fraudNetworkApi = {
  getGraph: (communityId, nodeType, limit = 100) => {
    let url = `/network/graph?limit=${limit}`;
    if (communityId !== undefined && communityId !== null) url += `&community_id=${communityId}`;
    if (nodeType) url += `&node_type=${nodeType}`;
    return api.get(url);
  },
  getNode: (nodeId) => api.get(`/network/node/${nodeId}`),
  search: (data) => api.post('/network/search', data),
  analyze: (data) => api.post('/network/analyze', data),
  getCommunities: () => api.get('/network/communities'),
};
