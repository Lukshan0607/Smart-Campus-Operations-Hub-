import { apiClient } from '../lib/apiClient';

/** GET /api/admin/resources — Spring Page (same filters as public list, admin view) */
export async function fetchAdminResourcesPage(params = {}) {
  const { data } = await apiClient.get('/api/admin/resources', { params });
  return data;
}

/** DELETE /api/admin/resources/{id}?userId= */
export async function adminDeleteResource(id, userId) {
  await apiClient.delete(`/api/admin/resources/${id}`, { params: { userId } });
}

/**
 * PATCH /api/admin/resources/{id}/status?status=&userId=
 * status must match ResourceStatus enum name.
 */
export async function adminUpdateResourceStatus(id, status, userId) {
  const { data } = await apiClient.patch(`/api/admin/resources/${id}/status`, null, {
    params: { status, userId },
  });
  return data;
}
