import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTickets } from '../../hooks/useTickets';
import TicketDetail from '../../components/ticketing/TicketDetail';
import TicketForm from '../../components/ticketing/TicketForm';
import { getUser } from '../../utils/auth';

const TicketDetailPage = () => {
  const { id } = useParams();
  const { selectedTicket, loading, error, fetchTicket, updateStatus, updateTicket } = useTickets();
  const [isEditing, setIsEditing] = useState(false);
  const currentUser = getUser();

  useEffect(() => {
    if (id) {
      fetchTicket(id);
    }
  }, [id, fetchTicket]);

  useEffect(() => {
    setIsEditing(false);
  }, [selectedTicket?.id]);

  const isTicketLocked = useMemo(() => {
    if (!selectedTicket) return false;
    const lockedStatuses = ['COMPLETED', 'RESOLVED', 'REJECTED'];
    return lockedStatuses.includes(selectedTicket.status);
  }, [selectedTicket]);

  const canEdit = useMemo(() => {
    if (!selectedTicket || !currentUser) return false;
    if (isTicketLocked) return false;
    if (currentUser.role === 'ADMIN') return true;
    return String(selectedTicket.creatorId) === String(currentUser.userId);
  }, [selectedTicket, currentUser, isTicketLocked]);

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

  const editFormData = selectedTicket
    ? {
        title: selectedTicket.title || '',
        description: selectedTicket.description || '',
        category: selectedTicket.category || 'MAINTENANCE',
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
          onEditTicket={() => setIsEditing(true)}
          onAttachmentsChanged={() => fetchTicket(id)}
        />
      )}
    </div>
  );
};

export default TicketDetailPage;
