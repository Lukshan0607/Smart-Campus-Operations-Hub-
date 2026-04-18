import axios from 'axios';
import { getToken, getUser } from '../utils/auth';

const API_BASE = '/api';

const applyAuthHeader = () => {
  const token = getToken();
  const user = getUser();
  if (token) {
    axios.defaults.headers.common.Authorization = `Bearer ${token}`;
  }

  if (user?.id != null) {
    axios.defaults.headers.common['X-User-Id'] = String(user.id);
  } else if (user?.userId != null && /^\d+$/.test(String(user.userId))) {
    axios.defaults.headers.common['X-User-Id'] = String(user.userId);
  } else {
    delete axios.defaults.headers.common['X-User-Id'];
  }

  if (user?.username) {
    axios.defaults.headers.common['X-Username'] = String(user.username);
  } else if (user?.email) {
    axios.defaults.headers.common['X-Username'] = String(user.email);
  } else if (user?.name) {
    axios.defaults.headers.common['X-Username'] = String(user.name);
  } else {
    delete axios.defaults.headers.common['X-Username'];
  }
};

const ticketApi = {
  // 1) POST /api/tickets
  createTicket: (ticketData) => {
    applyAuthHeader();
    return axios.post(`${API_BASE}/tickets`, ticketData);
  },

  // 1b) PUT /api/tickets/{id}
  updateTicket: (id, ticketData) => {
    applyAuthHeader();
    return axios.put(`${API_BASE}/tickets/${id}`, ticketData);
  },

  // DELETE /api/tickets/{id}
  deleteTicket: (id) => {
    applyAuthHeader();
    return axios.delete(`${API_BASE}/tickets/${id}`);
  },

  // 2) GET /api/tickets/{id}
  getTicketById: (id) => {
    applyAuthHeader();
    return axios.get(`${API_BASE}/tickets/${id}`);
  },

  // Backward-compatible alias used by existing hooks/components
  getTicket: (id) => {
    applyAuthHeader();
    return axios.get(`${API_BASE}/tickets/${id}`);
  },

  // 8) GET /api/tickets
  listTickets: () => {
    applyAuthHeader();
    return axios.get(`${API_BASE}/tickets`);
  },

  listMyTickets: () => {
    applyAuthHeader();
    return axios.get(`${API_BASE}/tickets/my`);
  },

  listTechnicianJobs: () => {
    applyAuthHeader();
    return axios.get(`${API_BASE}/tickets/technician/my-jobs`);
  },

  getMonthlyReports: (year) => {
    applyAuthHeader();
    const query = year ? `?year=${encodeURIComponent(year)}` : '';
    return axios.get(`${API_BASE}/tickets/reports/monthly${query}`);
  },

  getYearlyReports: () => {
    applyAuthHeader();
    return axios.get(`${API_BASE}/tickets/reports/yearly`);
  },

  // 3) PATCH /api/tickets/{id}/status
  updateTicketStatus: (id, status, resolutionNote) => {
    applyAuthHeader();
    return axios.patch(`${API_BASE}/tickets/${id}/status`, { status, resolutionNote });
  },

  // 9) POST /api/tickets/{id}/assign
  assignTechnician: (id, technicianId) => {
    applyAuthHeader();
    return axios.patch(`${API_BASE}/tickets/${id}/assign`, { technicianId });
  },

  completeTicket: (id, resolutionNote) => {
    applyAuthHeader();
    return axios.patch(`${API_BASE}/tickets/${id}/complete`, { resolutionNote });
  },

  adminUpdateStatus: (id, status, rejectionReason) => {
    applyAuthHeader();
    return axios.patch(`${API_BASE}/tickets/${id}/admin-status`, { status, reason: rejectionReason });
  },

  setTicketDeadline: (id, expectedCompletionAt, warningMessage) => {
    applyAuthHeader();
    return axios.patch(`${API_BASE}/tickets/${id}/deadline`, { expectedCompletionAt, warningMessage });
  },

  submitRating: (id, rating, feedback) => {
    applyAuthHeader();
    return axios.patch(`${API_BASE}/tickets/${id}/rating`, { rating, feedback });
  },

  // 7) POST /api/tickets/{id}/attachments
  uploadAttachments: (id, files) => {
    applyAuthHeader();
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    return axios.post(`${API_BASE}/tickets/${id}/attachments`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // DELETE /api/tickets/{id}/images/{imageId}
  deleteImage: (ticketId, imageId) => {
    applyAuthHeader();
    return axios.delete(`${API_BASE}/tickets/${ticketId}/images/${imageId}`);
  },

  // 5) POST /api/tickets/{id}/comments
  addComment: (ticketId, text) => {
    applyAuthHeader();
    return axios.post(`${API_BASE}/tickets/${ticketId}/comments`, { text });
  },

  // 6) PUT /api/comments/{id}
  editComment: (commentId, text) => {
    applyAuthHeader();
    return axios.put(`${API_BASE}/comments/${commentId}`, { text });
  },

  // 4) DELETE /api/comments/{id}
  deleteComment: (commentId) => {
    applyAuthHeader();
    return axios.delete(`${API_BASE}/comments/${commentId}`);
  },

  // Optional read helper (if backend exposes this route)
  getCommentsByTicket: (ticketId) => {
    applyAuthHeader();
    return axios.get(`${API_BASE}/tickets/${ticketId}/comments`);
  },

  // Backward-compatible alias used by existing hooks/components
  getComments: (ticketId) => {
    applyAuthHeader();
    return axios.get(`${API_BASE}/tickets/${ticketId}/comments`);
  },
};

export default ticketApi;
