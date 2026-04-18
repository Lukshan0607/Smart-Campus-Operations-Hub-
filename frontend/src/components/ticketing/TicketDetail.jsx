import React, { useEffect, useState } from 'react';
import StatusBadge from './StatusBadge';
import CommentSection from './CommentSection';
import AttachmentUpload from './AttachmentUpload';
import { formatCategoryDisplay } from '../../utils/ticketCategories';

const TicketDetail = ({
  ticket,
  loading,
  onStatusUpdate,
  onAssignTechnician,
  isAdmin,
  isTechnician,
  canEdit,
  canRate,
  onSubmitRating,
  onDeleteTicket,
  onEditTicket,
  onAttachmentsChanged,
}) => {
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(ticket?.status);
  const [resolutionNote, setResolutionNote] = useState('');
  const [rating, setRating] = useState(ticket?.rating || 0);
  const [feedback, setFeedback] = useState(ticket?.feedback || '');
  const [ratingSaving, setRatingSaving] = useState(false);
  const [ratingError, setRatingError] = useState('');

  useEffect(() => {
    setSelectedStatus(ticket?.status);
    setRating(ticket?.rating || 0);
    setFeedback(ticket?.feedback || '');
    setRatingError('');
  }, [ticket?.id, ticket?.status, ticket?.rating, ticket?.feedback]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!ticket) {
    return <div className="text-center py-8 text-gray-500">Ticket not found</div>;
  }

  const hasAssignedTechnician =
    ticket.assignedTechnicianId != null &&
    Number(ticket.assignedTechnicianId) > 0 &&
    String(ticket.assignedTechnicianName || '').toLowerCase() !== 'unassigned';

  const canSubmitImage =
    canEdit && ((ticket.status === 'OPEN' && !hasAssignedTechnician) || hasAssignedTechnician);

  const handleStatusSubmit = async () => {
    if (!selectedStatus) return;
    try {
      await onStatusUpdate(ticket.id, selectedStatus, resolutionNote);
      setShowStatusModal(false);
      setResolutionNote('');
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const handleRatingSubmit = async () => {
    if (!rating || rating < 1 || rating > 5) {
      setRatingError('Please select a rating from 1 to 5 stars');
      return;
    }
    try {
      setRatingSaving(true);
      setRatingError('');
      await onSubmitRating?.(rating, feedback);
    } catch (error) {
      setRatingError(error?.response?.data?.message || 'Failed to submit rating');
    } finally {
      setRatingSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="flex justify-between items-start mb-6 border-b pb-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{ticket.title}</h1>
          <p className="text-gray-500 mt-1">Ticket #{ticket.id}</p>
        </div>
        <StatusBadge status={ticket.status} />
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 pb-6 border-b">
        <div>
          <p className="text-sm text-gray-500">Category</p>
          <p className="font-semibold text-gray-900">{formatCategoryDisplay(ticket.category, ticket.subCategory)}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Priority</p>
          <p className={`font-semibold ${getPriorityColor(ticket.priority)}`}>{ticket.priority}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Created By</p>
          <p className="font-semibold text-gray-900">{ticket.creatorName}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Assigned To</p>
          <p className="font-semibold text-gray-900">{ticket.assignedTechnicianName || 'Unassigned'}</p>
        </div>
      </div>

      {/* Description */}
      <div className="mb-6 pb-6 border-b">
        <h2 className="text-lg font-bold text-gray-900 mb-3">Description</h2>
        <p className="text-gray-700 whitespace-pre-wrap">{ticket.description}</p>
      </div>

      {/* Location & Contact */}
      {(ticket.location || ticket.contactPhone || ticket.locationCategory) && (
        <div className="mb-6 pb-6 border-b">
          <h2 className="text-lg font-bold text-gray-900 mb-3">Additional Info</h2>
          {ticket.locationCategory && (
            <p className="text-gray-700">
              <span className="font-semibold">Building Name:</span> {formatLocationCategory(ticket.locationCategory)}
            </p>
          )}
          {ticket.locationCategory !== 'OTHER' && ticket.floorNumber != null && (
            <p className="text-gray-700">
              <span className="font-semibold">Floor:</span> {ticket.floorNumber}
            </p>
          )}
          {ticket.locationCategory !== 'OTHER' && ticket.block && (
            <p className="text-gray-700">
              <span className="font-semibold">Block:</span> {ticket.block}
            </p>
          )}
          {ticket.locationCategory !== 'OTHER' && ticket.roomNumber && (
            <p className="text-gray-700">
              <span className="font-semibold">Room:</span> {ticket.roomNumber}
            </p>
          )}
          {ticket.locationCategory === 'OTHER' && ticket.otherLocation && (
            <p className="text-gray-700">
              <span className="font-semibold">Where is it:</span> {ticket.otherLocation}
            </p>
          )}
          {ticket.location && (
            <p className="text-gray-700">
              <span className="font-semibold">Location:</span> {ticket.location}
            </p>
          )}
          {ticket.contactPhone && (
            <p className="text-gray-700">
              <span className="font-semibold">Contact:</span> {ticket.contactPhone}
            </p>
          )}
        </div>
      )}

      {/* Resolution Note */}
      {ticket.resolutionNote && (
        <div className="mb-6 pb-6 border-b bg-green-50 p-4 rounded">
          <h2 className="text-lg font-bold text-gray-900 mb-3">Resolution</h2>
          <p className="text-gray-700 whitespace-pre-wrap">{ticket.resolutionNote}</p>
        </div>
      )}

      {(ticket.rating || canRate) && (
        <div className="mb-6 pb-6 border-b">
          <h2 className="text-lg font-bold text-gray-900 mb-3">Resolution Rating</h2>

          {ticket.rating ? (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-700 mb-2">Service Rating</p>
              <p className="text-2xl">{renderStars(ticket.rating)}</p>
              {ticket.feedback && (
                <p className="text-sm text-gray-800 mt-3 whitespace-pre-wrap">Comment: {ticket.feedback}</p>
              )}
            </div>
          ) : null}

          {canRate && (
            <div className="bg-white border rounded-lg p-4">
              <p className="text-sm font-semibold text-gray-900 mb-2">Rate this service</p>
              <div className="flex items-center gap-2 mb-3">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setRating(value)}
                    className={`text-2xl ${rating >= value ? 'text-yellow-500' : 'text-gray-300'} hover:text-yellow-500 transition`}
                    aria-label={`Rate ${value} star`}
                  >
                    ★
                  </button>
                ))}
              </div>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Comment: Technician fixed quickly"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 h-24 mb-3"
              />
              {ratingError && <p className="text-sm text-red-600 mb-3">{ratingError}</p>}
              <button
                type="button"
                onClick={handleRatingSubmit}
                disabled={ratingSaving}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition"
              >
                {ratingSaving ? 'Saving...' : ticket.rating ? 'Update Rating' : 'Submit Rating'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      {(isTechnician || isAdmin) && ticket.status !== 'CLOSED' && (
        <div className="mb-6 pb-6 border-b flex gap-3">
          <button
            onClick={() => setShowStatusModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Update Status
          </button>
          {isAdmin && !ticket.assignedTechnicianId && (
            <button
              onClick={() => onAssignTechnician?.(ticket.id)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
            >
              Assign Technician
            </button>
          )}
        </div>
      )}

      {canEdit && ticket.status === 'OPEN' && !hasAssignedTechnician && (
        <div className="mb-6 pb-6 border-b flex gap-3">
          <button
            onClick={onEditTicket}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
          >
            Edit Ticket
          </button>
        </div>
      )}

      {canEdit && !hasAssignedTechnician && ticket.status !== 'OPEN' && (
        <div className="mb-6 pb-6 border-b">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4 text-yellow-900">
            You cannot edit this ticket because it is already in progress or has moved to a later step.
            Deletion is available only after a technician is assigned.
          </div>
        </div>
      )}

      {canEdit && hasAssignedTechnician && (
        <div className="mb-6 pb-6 border-b">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 text-blue-900">
            Technician has been assigned. You can delete this ticket if needed.
            Admin and assigned technician will be notified.
          </div>
          <button
            onClick={onDeleteTicket}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
          >
            Delete Ticket
          </button>
        </div>
      )}

      {/* Attachments */}
      <AttachmentUpload
        ticketId={ticket.id}
        attachments={ticket.attachments || []}
        onChange={onAttachmentsChanged}
        canUpload={canSubmitImage}
        canDeleteCurrentAttachments={canSubmitImage}
      />

      {/* Comments */}
      <CommentSection ticketId={ticket.id} />

      {/* Status Update Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 shadow-lg">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Update Ticket Status</h3>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-4"
            >
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
              {isAdmin && <option value="REJECTED">Rejected</option>}
            </select>
            <textarea
              value={resolutionNote}
              onChange={(e) => setResolutionNote(e.target.value)}
              placeholder="Add a resolution note (required for closing/rejecting)"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 h-24 mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={handleStatusSubmit}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Update
              </button>
              <button
                onClick={() => setShowStatusModal(false)}
                className="flex-1 bg-gray-300 text-gray-900 py-2 rounded-lg hover:bg-gray-400 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const getPriorityColor = (priority) => {
  switch (priority?.toUpperCase()) {
    case 'HIGH':
      return 'text-red-600';
    case 'MEDIUM':
      return 'text-yellow-600';
    case 'LOW':
      return 'text-green-600';
    default:
      return 'text-gray-600';
  }
};

const formatLocationCategory = (category) => {
  switch (category) {
    case 'MAIN_BUILDING':
      return 'Main Building';
    case 'ENGINEERING_BUILDING':
      return 'Engineering Building';
    case 'BUSINESS_MANAGEMENT_BUILDING':
      return 'Business Management Building';
    case 'OTHER':
      return 'Other';
    default:
      return category;
  }
};

const renderStars = (rating) => {
  const safeRating = Math.max(0, Math.min(5, Number(rating) || 0));
  return '★'.repeat(safeRating) + '☆'.repeat(5 - safeRating);
};

export default TicketDetail;
