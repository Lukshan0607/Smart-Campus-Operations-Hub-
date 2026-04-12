import axios from 'axios';

const API_BASE = '/api';

const ticketApi = {
  // Tickets
  createTicket: (ticketData) =>
    axios.post(`${API_BASE}/tickets`, ticketData),

  getTicket: (id) =>
    axios.get(`${API_BASE}/tickets/${id}`),

  listTickets: () =>
    axios.get(`${API_BASE}/tickets`),

  updateTicketStatus: (id, status, resolutionNote) =>
    axios.patch(`${API_BASE}/tickets/${id}/status`, {
      status,
      resolutionNote,
    }),

  assignTechnician: (id, technicianId) =>
    axios.post(`${API_BASE}/tickets/${id}/assign`, null, {
      params: { technicianId },
    }),

  uploadAttachments: (id, files) => {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    return axios.post(`${API_BASE}/tickets/${id}/attachments`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // Comments
  addComment: (ticketId, text) =>
    axios.post(`${API_BASE}/tickets/${ticketId}/comments`, { text }),

  editComment: (commentId, text) =>
    axios.put(`${API_BASE}/tickets/comments/${commentId}`, { text }),

  deleteComment: (commentId) =>
    axios.delete(`${API_BASE}/tickets/comments/${commentId}`),

  getComments: (ticketId) =>
    axios.get(`${API_BASE}/tickets/${ticketId}/comments`),
};

export default ticketApi;
