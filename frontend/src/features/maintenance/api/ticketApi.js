const API_BASE = '/api';

const ticketApi = {
  // Tickets
  createTicket: (ticketData) =>
    fetch(`${API_BASE}/tickets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ticketData),
    }).then(res => (res.ok ? res.json() : Promise.reject(res))),

  getTicket: (id) =>
    fetch(`${API_BASE}/tickets/${id}`)
      .then(res => (res.ok ? res.json() : Promise.reject(res))),

  listTickets: () =>
    fetch(`${API_BASE}/tickets`)
      .then(res => (res.ok ? res.json() : Promise.reject(res))),

  updateStatus: (id, status, resolutionNote) =>
    fetch(`${API_BASE}/tickets/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, resolutionNote }),
    }).then(res => (res.ok ? res.json() : Promise.reject(res))),

  assignTechnician: (id, technicianId) =>
    fetch(`${API_BASE}/tickets/${id}/assign?technicianId=${technicianId}`, {
      method: 'POST',
    }).then(res => (res.ok ? res.json() : Promise.reject(res))),

  uploadAttachments: (id, files) => {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    return fetch(`${API_BASE}/tickets/${id}/attachments`, {
      method: 'POST',
      body: formData,
    }).then(res => (res.ok ? res.json() : Promise.reject(res)));
  },

  // Comments
  addComment: (ticketId, text) =>
    fetch(`${API_BASE}/tickets/${ticketId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    }).then(res => (res.ok ? res.json() : Promise.reject(res))),

  editComment: (commentId, text) =>
    fetch(`${API_BASE}/tickets/comments/${commentId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    }).then(res => (res.ok ? res.json() : Promise.reject(res))),

  deleteComment: (commentId) =>
    fetch(`${API_BASE}/tickets/comments/${commentId}`, {
      method: 'DELETE',
    }).then(res => (res.ok ? null : Promise.reject(res))),
};

export default ticketApi;
