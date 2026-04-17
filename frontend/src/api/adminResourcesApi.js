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

export async function adminUpdateResource(id, dto, userId) {
  const { data } = await apiClient.put(`/api/admin/resources/${id}`, dto, {
    params: { userId },
  });
  return data;
}

export async function getResourceForecast(id, daysAhead = 7) {
  const { data } = await apiClient.get(`/api/admin/resources/${id}/forecast`, {
    params: { daysAhead }
  });
  return data;
}

/** GET /api/admin/resources/stats */
export async function fetchResourceStats() {
  const { data } = await apiClient.get('/api/admin/resources/stats');
  return data;
}

/** GET /api/admin/resources/report (blob) */
export async function downloadResourceReport() {
  const { data } = await apiClient.get('/api/admin/resources/report', {
    responseType: 'blob'
  });
  const url = window.URL.createObjectURL(new Blob([data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'resources_report.csv');
  document.body.appendChild(link);
  link.click();
  link.remove();
}
