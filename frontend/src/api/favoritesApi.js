import { apiClient } from '../lib/apiClient';

/** POST /api/favorites */
export async function addFavorite(userId, resourceId, notes = '') {
  const { data } = await apiClient.post('/api/favorites', { userId, resourceId, notes });
  return data;
}

/** DELETE /api/favorites?userId={userId}&resourceId={resourceId} */
export async function removeFavorite(userId, resourceId) {
  await apiClient.delete('/api/favorites', { params: { userId, resourceId } });
}

/** GET /api/favorites/check?userId={userId}&resourceId={resourceId} */
export async function checkIsFavorite(userId, resourceId) {
  const { data } = await apiClient.get('/api/favorites/check', { params: { userId, resourceId } });
  return data.isFavorite;
}
