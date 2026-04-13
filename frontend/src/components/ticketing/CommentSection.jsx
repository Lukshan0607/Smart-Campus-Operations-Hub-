import React, { useEffect, useState } from 'react';
import { useComments } from '../../hooks/useComments';

const CommentSection = ({ ticketId }) => {
  const { comments, loading, error, fetchComments, addNewComment, deleteComment } = useComments();
  const [newCommentText, setNewCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchComments(ticketId);
  }, [ticketId, fetchComments]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    setSubmitting(true);
    try {
      await addNewComment(ticketId, newCommentText);
      setNewCommentText('');
      await fetchComments(ticketId);
    } catch (error) {
      console.error('Failed to add comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;

    try {
      await deleteComment(commentId);
      await fetchComments(ticketId);
    } catch (error) {
      console.error('Failed to delete comment:', error);
    }
  };

  return (
    <div className="mt-8">
      <h2 className="text-lg font-bold text-gray-900 mb-4">Comments</h2>

      {/* Add Comment Form */}
      <form onSubmit={handleAddComment} className="mb-6 p-4 bg-gray-50 rounded-lg">
        <textarea
          value={newCommentText}
          onChange={(e) => setNewCommentText(e.target.value)}
          placeholder="Add a comment..."
          className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-3 h-20"
          disabled={submitting}
        />
        <button
          type="submit"
          disabled={submitting || !newCommentText.trim()}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition"
        >
          {submitting ? 'Adding...' : 'Add Comment'}
        </button>
      </form>

      {error && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4 text-amber-800 flex items-center justify-between gap-3">
          <span>{error}</span>
          <button
            onClick={() => fetchComments(ticketId)}
            className="px-3 py-1 rounded bg-amber-600 text-white text-sm hover:bg-amber-700"
          >
            Retry
          </button>
        </div>
      )}

      {/* Comments List */}
      {loading ? (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : comments && comments.length > 0 ? (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="border border-gray-200 rounded-lg p-4 bg-white">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-semibold text-gray-900">{comment.authorName}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(comment.createdAt).toLocaleString()}
                  </p>
                </div>
                {comment.isAuthor && (
                  <button
                    onClick={() => handleDeleteComment(comment.id)}
                    className="text-red-600 hover:text-red-800 text-sm font-semibold transition"
                  >
                    Delete
                  </button>
                )}
              </div>
              <p className="text-gray-700 whitespace-pre-wrap">{comment.text}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-center py-8">No comments yet. Be the first to comment!</p>
      )}
    </div>
  );
};

export default CommentSection;
