import { useDispatch, useSelector } from 'react-redux';
import { useCallback } from 'react';
import ticketApi from '../api/ticketApi';
import {
  setComments,
  addComment,
  updateComment,
  removeComment,
  setLoading,
  setError,
  clearError,
} from '../store/ticketSlice';

export const useComments = () => {
  const dispatch = useDispatch();
  const { comments, loading, error } = useSelector((state) => state.tickets);

  const fetchComments = useCallback(
    async (ticketId) => {
      dispatch(setLoading(true));
      try {
        const response = await ticketApi.getComments(ticketId);
        dispatch(setComments(response.data));
        dispatch(clearError());
      } catch (err) {
        dispatch(setError(err.response?.data?.message || 'Failed to fetch comments'));
      } finally {
        dispatch(setLoading(false));
      }
    },
    [dispatch]
  );

  const addNewComment = useCallback(
    async (ticketId, text) => {
      dispatch(setLoading(true));
      try {
        const response = await ticketApi.addComment(ticketId, text);
        dispatch(addComment(response.data));
        dispatch(clearError());
        return response.data;
      } catch (err) {
        dispatch(setError(err.response?.data?.message || 'Failed to add comment'));
        throw err;
      } finally {
        dispatch(setLoading(false));
      }
    },
    [dispatch]
  );

  const editExistingComment = useCallback(
    async (commentId, text) => {
      dispatch(setLoading(true));
      try {
        const response = await ticketApi.editComment(commentId, text);
        dispatch(updateComment({ id: commentId, text }));
        dispatch(clearError());
        return response.data;
      } catch (err) {
        dispatch(setError(err.response?.data?.message || 'Failed to edit comment'));
        throw err;
      } finally {
        dispatch(setLoading(false));
      }
    },
    [dispatch]
  );

  const deleteComment = useCallback(
    async (commentId) => {
      dispatch(setLoading(true));
      try {
        await ticketApi.deleteComment(commentId);
        dispatch(removeComment(commentId));
        dispatch(clearError());
      } catch (err) {
        dispatch(setError(err.response?.data?.message || 'Failed to delete comment'));
        throw err;
      } finally {
        dispatch(setLoading(false));
      }
    },
    [dispatch]
  );

  return {
    comments,
    loading,
    error,
    fetchComments,
    addNewComment,
    editExistingComment,
    deleteComment,
  };
};
