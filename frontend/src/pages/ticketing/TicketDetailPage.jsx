import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useTickets } from '../../hooks/useTickets';
import TicketDetail from '../../components/ticketing/TicketDetail';
import TicketForm from '../../components/ticketing/TicketForm';
import { defaultDashboardPath, getUser } from '../../utils/auth';

const TicketDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { selectedTicket, loading, error, fetchTicket, updateStatus, updateTicket, deleteTicket, submitRating } = useTickets();
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const currentUser = getUser();

  useEffect(() => {
    if (id) {
      fetchTicket(id);
    }
  }, [id, fetchTicket]);

  useEffect(() => {
    setIsEditing(false);
  }, [selectedTicket?.id]);

  useEffect(() => {
    if (selectedTicket && selectedTicket.status !== 'OPEN' && isEditing) {
      setIsEditing(false);
    }
  }, [selectedTicket, isEditing]);

  const canEdit = useMemo(() => {
    if (!selectedTicket || !currentUser) return false;
    if (currentUser.role === 'ADMIN') return true;

    const currentUserNumericId = currentUser.id ?? null;
    const isOwnerById =
      currentUserNumericId != null && String(selectedTicket.creatorId) === String(currentUserNumericId);
    const isOwnerByEmail =
      Boolean(currentUser.email) && String(selectedTicket.creatorName || '').toLowerCase() === String(currentUser.email).toLowerCase();
    const isOwnerByName =
      Boolean(currentUser.name) && String(selectedTicket.creatorName || '').toLowerCase() === String(currentUser.name).toLowerCase();

    return isOwnerById || isOwnerByEmail || isOwnerByName;
  }, [selectedTicket, currentUser]);

  const canRate = useMemo(() => {
    if (!selectedTicket || !currentUser) return false;
    const currentUserNumericId = currentUser.id ?? null;
    const isOwnerById =
      currentUserNumericId != null && String(selectedTicket.creatorId) === String(currentUserNumericId);
    const isOwnerByEmail =
      Boolean(currentUser.email) && String(selectedTicket.creatorName || '').toLowerCase() === String(currentUser.email).toLowerCase();
    const isOwnerByName =
      Boolean(currentUser.name) && String(selectedTicket.creatorName || '').toLowerCase() === String(currentUser.name).toLowerCase();
    const isOwner = isOwnerById || isOwnerByEmail || isOwnerByName;
    return isOwner && selectedTicket.status === 'CLOSED';
  }, [selectedTicket, currentUser]);

  const handleStatusUpdate = async (ticketId, status, resolutionNote) => {
    try {
      await updateStatus(ticketId, status, resolutionNote);
    } catch (error) {
      console.error('Failed to update status:', error);
      throw error;
    }
  };

  const handleTicketUpdate = async (formData) => {
    try {
      await updateTicket(Number(id), formData);
      await fetchTicket(id);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update ticket:', error);
      throw error;
    }
  };

  const handleDeleteTicket = async () => {
    try {
      await deleteTicket(Number(id));
      navigate(defaultDashboardPath(), {
        replace: true,
        state: { message: 'Ticket deleted successfully' },
      });
    } catch (error) {
      console.error('Failed to delete ticket:', error);
    } finally {
      setShowDeleteConfirm(false);
    }
  };

  const handleRatingSubmit = async (rating, feedback) => {
    try {
      await submitRating(Number(id), rating, feedback);
      await fetchTicket(id);
    } catch (error) {
      console.error('Failed to submit rating:', error);
      throw error;
    }
  };

  const editFormData = selectedTicket
    ? {
        title: selectedTicket.title || '',
        description: selectedTicket.description || '',
        category: selectedTicket.category || 'FACILITIES',
        subCategory: selectedTicket.subCategory || 'LIGHTING',
        priority: selectedTicket.priority || 'MEDIUM',
        locationCategory: selectedTicket.locationCategory || 'MAIN_BUILDING',
        buildingName: selectedTicket.buildingName || 'Main Building',
        floorNumber: selectedTicket.floorNumber != null ? String(selectedTicket.floorNumber) : '1',
        block: selectedTicket.block || 'L',
        roomNumber: selectedTicket.roomNumber || '',
        otherLocation: selectedTicket.otherLocation || '',
        contactPhone: selectedTicket.contactPhone || '',
      }
    : null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Link to="/tickets" className="text-blue-600 hover:text-blue-800 font-semibold">
          ← Back to Tickets
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-red-800">
          {error}
        </div>
      )}

      {canEdit && isEditing && editFormData ? (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-6 border-b pb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Edit Ticket</h1>
              <p className="text-gray-500 mt-1">Ticket #{selectedTicket?.id}</p>
            </div>
            <button
              onClick={() => setIsEditing(false)}
              className="text-gray-600 hover:text-gray-900 font-semibold"
            >
              Cancel
            </button>
          </div>

          <TicketForm
            initialData={editFormData}
            loading={loading}
            onSubmit={handleTicketUpdate}
            submitLabel="Save Changes"
          />
        </div>
      ) : (
        <TicketDetail
          ticket={selectedTicket}
          loading={loading}
          onStatusUpdate={handleStatusUpdate}
          isAdmin={false}
          isTechnician={false}
          canEdit={canEdit}
          canRate={canRate}
          onSubmitRating={handleRatingSubmit}
          onDeleteTicket={() => setShowDeleteConfirm(true)}
          onEditTicket={() => setIsEditing(true)}
          onAttachmentsChanged={() => fetchTicket(id)}
        />
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
            <h3 className="text-lg font-bold text-gray-900 mb-3">Delete Ticket</h3>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete this ticket? This action cannot be undone.
              A notification will be sent to the technician and admin.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDeleteTicket}
                className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition"
              >
                OK Delete
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
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

export default TicketDetailPage;
