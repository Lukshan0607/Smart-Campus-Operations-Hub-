import { useDispatch, useSelector } from 'react-redux';
import { useCallback } from 'react';
import ticketApi from '../api/ticketApi';
import {
  setTickets,
  addTicket,
  setSelectedTicket,
  updateTicketStatus,
  assignTechnicianToTicket,
  addAttachments,
  setLoading,
  setError,
  clearError,
} from '../store/ticketSlice';

export const useTickets = () => {
  const dispatch = useDispatch();
  const { tickets, selectedTicket, attachments, loading, error } = useSelector(
    (state) => state.tickets
  );

  const fetchTickets = useCallback(async () => {
    dispatch(setLoading(true));
    try {
      const response = await ticketApi.listTickets();
      dispatch(setTickets(response.data));
      dispatch(clearError());
    } catch (err) {
      dispatch(setError(err.response?.data?.message || 'Failed to fetch tickets'));
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  const fetchTicket = useCallback(
    async (id) => {
      dispatch(setLoading(true));
      try {
        const response = await ticketApi.getTicket(id);
        dispatch(setSelectedTicket(response.data));
        dispatch(clearError());
      } catch (err) {
        dispatch(setError(err.response?.data?.message || 'Failed to fetch ticket'));
      } finally {
        dispatch(setLoading(false));
      }
    },
    [dispatch]
  );

  const createTicket = useCallback(
    async (ticketData) => {
      dispatch(setLoading(true));
      try {
        const response = await ticketApi.createTicket(ticketData);
        dispatch(addTicket(response.data));
        dispatch(clearError());
        return response.data;
      } catch (err) {
        dispatch(setError(err.response?.data?.message || 'Failed to create ticket'));
        throw err;
      } finally {
        dispatch(setLoading(false));
      }
    },
    [dispatch]
  );

  const updateStatus = useCallback(
    async (id, status, resolutionNote) => {
      dispatch(setLoading(true));
      try {
        const response = await ticketApi.updateTicketStatus(id, status, resolutionNote);
        dispatch(updateTicketStatus({ id, status, resolutionNote }));
        dispatch(setSelectedTicket(response.data));
        dispatch(clearError());
        return response.data;
      } catch (err) {
        dispatch(setError(err.response?.data?.message || 'Failed to update ticket status'));
        throw err;
      } finally {
        dispatch(setLoading(false));
      }
    },
    [dispatch]
  );

  const assignTechnician = useCallback(
    async (id, technicianId, technicianName) => {
      dispatch(setLoading(true));
      try {
        const response = await ticketApi.assignTechnician(id, technicianId);
        dispatch(assignTechnicianToTicket({ id, technicianId, technicianName }));
        dispatch(setSelectedTicket(response.data));
        dispatch(clearError());
        return response.data;
      } catch (err) {
        dispatch(setError(err.response?.data?.message || 'Failed to assign technician'));
        throw err;
      } finally {
        dispatch(setLoading(false));
      }
    },
    [dispatch]
  );

  const uploadAttachments = useCallback(
    async (ticketId, files) => {
      dispatch(setLoading(true));
      try {
        const response = await ticketApi.uploadAttachments(ticketId, files);
        dispatch(addAttachments(response.data));
        dispatch(clearError());
        return response.data;
      } catch (err) {
        dispatch(setError(err.response?.data?.message || 'Failed to upload attachments'));
        throw err;
      } finally {
        dispatch(setLoading(false));
      }
    },
    [dispatch]
  );

  return {
    tickets,
    selectedTicket,
    attachments,
    loading,
    error,
    fetchTickets,
    fetchTicket,
    createTicket,
    updateStatus,
    assignTechnician,
    uploadAttachments,
  };
};
