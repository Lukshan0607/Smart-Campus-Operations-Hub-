import React, { useState } from 'react';
import StatusBadge from './StatusBadge';
import CommentSection from './CommentSection';
import AttachmentUpload from './AttachmentUpload';

const TicketDetail = ({ ticket, loading, onStatusUpdate, onAssignTechnician, isAdmin, isTechnician }) => {
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(ticket?.status);
  const [resolutionNote, setResolutionNote] = useState('');

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
          <p className="font-semibold text-gray-900">{ticket.category}</p>
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

      {/* Attachments */}
      <AttachmentUpload ticketId={ticket.id} attachments={ticket.attachments || []} />

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

export default TicketDetail;
