import { apiClient } from '../lib/apiClient';

/**
 * GET /api/resources — Spring Data Page<ResourceResponseDTO>
 * Query: page, size, sort, type, status, q, location, userId
 */
export async function fetchResourcesPage(params = {}) {
  const { data } = await apiClient.get('/api/resources', { params });
  return data;
}

/** GET /api/resources/{id} */
export async function fetchResourceById(id, userId) {
  const { data } = await apiClient.get(`/api/resources/${id}`, {
    params: userId != null ? { userId } : {},
  });
  return data;
}

/** POST /api/resources?createdBy= */
export async function createResource(body, createdBy) {
  const { data } = await apiClient.post('/api/resources', body, {
    params: { createdBy },
  });
  return data;
}

/** PUT /api/resources/{id}?userId= */
export async function updateResource(id, body, userId) {
  const { data } = await apiClient.put(`/api/resources/${id}`, body, {
    params: { userId },
  });
  return data;
}

/** POST /api/resources/availability/check */
export async function checkAvailability(body) {
  const { data } = await apiClient.post('/api/resources/availability/check', body);
  return data;
}
