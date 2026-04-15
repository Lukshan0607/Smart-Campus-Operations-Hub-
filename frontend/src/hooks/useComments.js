import { useDispatch, useSelector } from 'react-redux';
import { useCallback } from 'react';
import { useState } from 'react';
import ticketApi from '../api/ticketApi';
import {
  setComments,
  addComment,
  updateComment,
  removeComment,
} from '../store/ticketSlice';

export const useComments = () => {
  const dispatch = useDispatch();
  const { comments } = useSelector((state) => state.tickets);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchComments = useCallback(
    async (ticketId) => {
      setLoading(true);
      try {
        const response = await ticketApi.getComments(ticketId);
        dispatch(setComments(Array.isArray(response.data) ? response.data : []));
        setError(null);
      } catch (err) {
        dispatch(setComments([]));
        setError(err.response?.data?.message || 'Failed to fetch comments');
      } finally {
        setLoading(false);
      }
    },
    [dispatch]
  );

  const addNewComment = useCallback(
    async (ticketId, text) => {
      setLoading(true);
      try {
        const response = await ticketApi.addComment(ticketId, text);
        dispatch(addComment(response.data));
        setError(null);
        return response.data;
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to add comment');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [dispatch]
  );

  const editExistingComment = useCallback(
    async (commentId, text) => {
      setLoading(true);
      try {
        const response = await ticketApi.editComment(commentId, text);
        dispatch(updateComment({ id: commentId, text }));
        setError(null);
        return response.data;
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to edit comment');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [dispatch]
  );

  const deleteComment = useCallback(
    async (commentId) => {
      setLoading(true);
      try {
        await ticketApi.deleteComment(commentId);
        dispatch(removeComment(commentId));
        setError(null);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete comment');
        throw err;
      } finally {
        setLoading(false);
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
