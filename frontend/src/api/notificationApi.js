import api from '../services/api';

const notificationApi = {
  // Get user's notifications
  getMyNotifications: () => api.get('/api/notifications/my'),
  
  // Mark notification as read
  markAsRead: (id) => api.patch(`/api/notifications/${id}/read`),
};

export default notificationApi;
