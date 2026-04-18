import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  tickets: [],
  selectedTicket: null,
  comments: [],
  attachments: [],
  loading: false,
  error: null,
};

const ticketSlice = createSlice({
  name: 'tickets',
  initialState,
  reducers: {
    // Ticket actions
    setTickets: (state, action) => {
      state.tickets = action.payload;
    },
    addTicket: (state, action) => {
      state.tickets.push(action.payload);
    },
    removeTicket: (state, action) => {
      const ticketId = action.payload;
      state.tickets = state.tickets.filter((ticket) => ticket.id !== ticketId);
      if (state.selectedTicket?.id === ticketId) {
        state.selectedTicket = null;
      }
    },
    updateTicketDetails: (state, action) => {
      const updatedTicket = action.payload;
      const index = state.tickets.findIndex((t) => t.id === updatedTicket.id);
      if (index !== -1) {
        state.tickets[index] = updatedTicket;
      }
      if (state.selectedTicket?.id === updatedTicket.id) {
        state.selectedTicket = updatedTicket;
      }
    },
    setSelectedTicket: (state, action) => {
      state.selectedTicket = action.payload;
    },
    updateTicketStatus: (state, action) => {
      const { id, status, resolutionNote } = action.payload;
      const ticket = state.tickets.find((t) => t.id === id);
      if (ticket) {
        ticket.status = status;
        if (resolutionNote) ticket.resolutionNote = resolutionNote;
      }
      if (state.selectedTicket?.id === id) {
        state.selectedTicket.status = status;
        if (resolutionNote) state.selectedTicket.resolutionNote = resolutionNote;
      }
    },
    assignTechnicianToTicket: (state, action) => {
      const { id, technicianId, technicianName } = action.payload;
      const ticket = state.tickets.find((t) => t.id === id);
      if (ticket) {
        ticket.assignedTechnicianId = technicianId;
        ticket.assignedTechnicianName = technicianName;
        ticket.status = 'IN_PROGRESS';
      }
      if (state.selectedTicket?.id === id) {
        state.selectedTicket.assignedTechnicianId = technicianId;
        state.selectedTicket.assignedTechnicianName = technicianName;
        state.selectedTicket.status = 'IN_PROGRESS';
      }
    },

    // Comment actions
    setComments: (state, action) => {
      state.comments = action.payload;
    },
    addComment: (state, action) => {
      state.comments.push(action.payload);
    },
    updateComment: (state, action) => {
      const { id, text } = action.payload;
      const comment = state.comments.find((c) => c.id === id);
      if (comment) {
        comment.text = text;
      }
    },
    removeComment: (state, action) => {
      state.comments = state.comments.filter((c) => c.id !== action.payload);
    },

    // Attachment actions
    setAttachments: (state, action) => {
      state.attachments = action.payload;
    },
    addAttachments: (state, action) => {
      state.attachments.push(...action.payload);
    },

    // Loading and error
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    resetTicketState: () => initialState,
  },
});

export const {
  setTickets,
  addTicket,
  removeTicket,
  updateTicketDetails,
  setSelectedTicket,
  updateTicketStatus,
  assignTechnicianToTicket,
  setComments,
  addComment,
  updateComment,
  removeComment,
  setAttachments,
  addAttachments,
  setLoading,
  setError,
  clearError,
  resetTicketState,
} = ticketSlice.actions;

export default ticketSlice.reducer;
