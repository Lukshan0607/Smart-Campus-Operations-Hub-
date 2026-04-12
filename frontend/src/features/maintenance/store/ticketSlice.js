import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import ticketApi from '../api/ticketApi';

export const fetchTickets = createAsyncThunk('tickets/fetchTickets', async (_, { rejectWithValue }) => {
  try {
    return await ticketApi.listTickets();
  } catch (error) {
    return rejectWithValue(error.statusText || 'Failed to fetch tickets');
  }
});

export const fetchTicket = createAsyncThunk('tickets/fetchTicket', async (id, { rejectWithValue }) => {
  try {
    return await ticketApi.getTicket(id);
  } catch (error) {
    return rejectWithValue(error.statusText || 'Failed to fetch ticket');
  }
});

export const createTicket = createAsyncThunk('tickets/createTicket', async (ticketData, { rejectWithValue }) => {
  try {
    return await ticketApi.createTicket(ticketData);
  } catch (error) {
    return rejectWithValue(error.statusText || 'Failed to create ticket');
  }
});

export const updateTicketStatus = createAsyncThunk(
  'tickets/updateStatus',
  async ({ id, status, resolutionNote }, { rejectWithValue }) => {
    try {
      return await ticketApi.updateStatus(id, status, resolutionNote);
    } catch (error) {
      return rejectWithValue(error.statusText || 'Failed to update ticket status');
    }
  }
);

export const assignTechnician = createAsyncThunk(
  'tickets/assignTechnician',
  async ({ id, technicianId }, { rejectWithValue }) => {
    try {
      return await ticketApi.assignTechnician(id, technicianId);
    } catch (error) {
      return rejectWithValue(error.statusText || 'Failed to assign technician');
    }
  }
);

export const uploadAttachments = createAsyncThunk(
  'tickets/uploadAttachments',
  async ({ id, files }, { rejectWithValue }) => {
    try {
      return await ticketApi.uploadAttachments(id, files);
    } catch (error) {
      return rejectWithValue(error.statusText || 'Failed to upload attachments');
    }
  }
);

export const addComment = createAsyncThunk(
  'tickets/addComment',
  async ({ ticketId, text }, { rejectWithValue }) => {
    try {
      return await ticketApi.addComment(ticketId, text);
    } catch (error) {
      return rejectWithValue(error.statusText || 'Failed to add comment');
    }
  }
);

export const editComment = createAsyncThunk(
  'tickets/editComment',
  async ({ id, text }, { rejectWithValue }) => {
    try {
      return await ticketApi.editComment(id, text);
    } catch (error) {
      return rejectWithValue(error.statusText || 'Failed to edit comment');
    }
  }
);

export const deleteComment = createAsyncThunk('tickets/deleteComment', async (id, { rejectWithValue }) => {
  try {
    await ticketApi.deleteComment(id);
    return id;
  } catch (error) {
    return rejectWithValue(error.statusText || 'Failed to delete comment');
  }
});

const initialState = {
  tickets: [],
  currentTicket: null,
  loading: false,
  error: null,
  success: null,
};

const ticketSlice = createSlice({
  name: 'tickets',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTickets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTickets.fulfilled, (state, action) => {
        state.loading = false;
        state.tickets = action.payload;
      })
      .addCase(fetchTickets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchTicket.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTicket.fulfilled, (state, action) => {
        state.loading = false;
        state.currentTicket = action.payload;
      })
      .addCase(fetchTicket.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createTicket.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTicket.fulfilled, (state, action) => {
        state.loading = false;
        state.success = 'Ticket created successfully';
        state.tickets.push(action.payload);
      })
      .addCase(createTicket.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateTicketStatus.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateTicketStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.success = 'Ticket status updated';
        state.currentTicket = action.payload;
        const index = state.tickets.findIndex(t => t.id === action.payload.id);
        if (index >= 0) state.tickets[index] = action.payload;
      })
      .addCase(updateTicketStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(assignTechnician.pending, (state) => {
        state.loading = true;
      })
      .addCase(assignTechnician.fulfilled, (state, action) => {
        state.loading = false;
        state.success = 'Technician assigned';
        state.currentTicket = action.payload;
      })
      .addCase(assignTechnician.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(uploadAttachments.pending, (state) => {
        state.loading = true;
      })
      .addCase(uploadAttachments.fulfilled, (state, action) => {
        state.loading = false;
        state.success = 'Attachments uploaded';
        if (state.currentTicket) {
          state.currentTicket.attachments = action.payload;
        }
      })
      .addCase(uploadAttachments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addComment.pending, (state) => {
        state.loading = true;
      })
      .addCase(addComment.fulfilled, (state, action) => {
        state.loading = false;
        state.success = 'Comment added';
        if (state.currentTicket && state.currentTicket.comments) {
          state.currentTicket.comments.push(action.payload);
        }
      })
      .addCase(addComment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(editComment.fulfilled, (state, action) => {
        if (state.currentTicket && state.currentTicket.comments) {
          const index = state.currentTicket.comments.findIndex(c => c.id === action.payload.id);
          if (index >= 0) state.currentTicket.comments[index] = action.payload;
        }
      })
      .addCase(deleteComment.fulfilled, (state, action) => {
        if (state.currentTicket && state.currentTicket.comments) {
          state.currentTicket.comments = state.currentTicket.comments.filter(c => c.id !== action.payload);
        }
      });
  },
});

export const { clearError, clearSuccess } = ticketSlice.actions;
export default ticketSlice.reducer;
