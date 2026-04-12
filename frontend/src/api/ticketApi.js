import axios from 'axios';

const API_BASE = '/api';

const ticketApi = {
  // 1) POST /api/tickets
  createTicket: (ticketData) => axios.post(`${API_BASE}/tickets`, ticketData),

  // 2) GET /api/tickets/{id}
  getTicketById: (id) => axios.get(`${API_BASE}/tickets/${id}`),

  // Backward-compatible alias used by existing hooks/components
  getTicket: (id) => axios.get(`${API_BASE}/tickets/${id}`),

  // 8) GET /api/tickets
  listTickets: () => axios.get(`${API_BASE}/tickets`),

  // 3) PATCH /api/tickets/{id}/status
  updateTicketStatus: (id, status, resolutionNote) =>
    axios.patch(`${API_BASE}/tickets/${id}/status`, { status, resolutionNote }),

  // 9) POST /api/tickets/{id}/assign
  assignTechnician: (id, technicianId) =>
    axios.post(`${API_BASE}/tickets/${id}/assign`, null, { params: { technicianId } }),

  // 7) POST /api/tickets/{id}/attachments
  uploadAttachments: (id, files) => {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    return axios.post(`${API_BASE}/tickets/${id}/attachments`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // 5) POST /api/tickets/{id}/comments
  addComment: (ticketId, text) => axios.post(`${API_BASE}/tickets/${ticketId}/comments`, { text }),

  // 6) PUT /api/comments/{id}
  editComment: (commentId, text) => axios.put(`${API_BASE}/comments/${commentId}`, { text }),

  // 4) DELETE /api/comments/{id}
  deleteComment: (commentId) => axios.delete(`${API_BASE}/comments/${commentId}`),

  // Optional read helper (if backend exposes this route)
  getCommentsByTicket: (ticketId) => axios.get(`${API_BASE}/tickets/${ticketId}/comments`),

  // Backward-compatible alias used by existing hooks/components
  getComments: (ticketId) => axios.get(`${API_BASE}/tickets/${ticketId}/comments`),
};

export default ticketApi;
