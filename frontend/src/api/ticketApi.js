import axios from 'axios';
import { getToken } from '../utils/auth';

const API_BASE = '/api';

const applyAuthHeader = () => {
  const token = getToken();
  if (token) {
    axios.defaults.headers.common.Authorization = `Bearer ${token}`;
  }
};

const ticketApi = {
  // 1) POST /api/tickets
  createTicket: (ticketData) => {
    applyAuthHeader();
    return axios.post(`${API_BASE}/tickets`, ticketData);
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
    return axios.patch(`${API_BASE}/tickets/${id}/admin-status`, { status, rejectionReason });
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
