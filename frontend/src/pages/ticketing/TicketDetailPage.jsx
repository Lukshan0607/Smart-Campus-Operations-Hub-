import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useTickets } from '../../hooks/useTickets';
import TicketDetail from '../../components/ticketing/TicketDetail';
import TicketForm from '../../components/ticketing/TicketForm';
import { getUser } from '../../utils/auth';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import UserSideNavigation from '../../components/UserSideNavigation';

const TicketDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { selectedTicket, loading, error, fetchTicket, updateStatus, updateTicket, deleteTicket } = useTickets();
  const [isEditing, setIsEditing] = useState(false);
  const [activeSection, setActiveSection] = useState('my-tickets');
  const [deleting, setDeleting] = useState(false);
  const currentUser = getUser();

  useEffect(() => {
    if (id) {
      fetchTicket(id);
    }
  }, [id, fetchTicket]);

  useEffect(() => {
    setIsEditing(false);
  }, [selectedTicket?.id]);

  const currentUserId = currentUser?.userId ?? currentUser?.id;

  const canDeleteTicket = useMemo(() => {
    if (!selectedTicket || !currentUser) return false;
    const isAdmin = currentUser.role === 'ADMIN';
    const isOwner = currentUserId != null && String(selectedTicket.creatorId) === String(currentUserId);
    return isAdmin || isOwner;
  }, [selectedTicket, currentUser, currentUserId]);

  const canEditData = useMemo(() => {
    if (!selectedTicket || !currentUser) return false;
    const isAdmin = currentUser.role === 'ADMIN';
    const isOwner = currentUserId != null && String(selectedTicket.creatorId) === String(currentUserId);
    return isAdmin || isOwner;
  }, [selectedTicket, currentUser, currentUserId]);

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

  const handleDeleteTicket = async (ticketId) => {
    setDeleting(true);
    try {
      await deleteTicket(ticketId);
      navigate('/tickets');
    } catch (error) {
      console.error('Failed to delete ticket:', error);
      setDeleting(false);
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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <div className="flex flex-1">
        {/* Sidebar */}
        <UserSideNavigation 
          activeSection={activeSection} 
          setActiveSection={setActiveSection}
        />

        {/* Main Content */}
        <main className="flex-1 p-6">
          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-400 rounded-lg p-4 flex items-start gap-3">
              <svg className="w-5 h-5 text-red-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-red-800 font-medium">{error}</div>
            </div>
          )}

          {/* Edit Form */}
          {canEditData && isEditing && editFormData ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6 border-b border-gray-100 p-6 pb-4">
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Edit Ticket
                  </h1>
                  <p className="text-gray-500 mt-1">Ticket #{selectedTicket?.id}</p>
                </div>
                <button
                  onClick={() => setIsEditing(false)}
                  className="inline-flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg font-semibold transition-colors duration-200"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Cancel
                </button>
              </div>

              <div className="p-6 pt-0">
                <TicketForm
                  initialData={editFormData}
                  loading={loading}
                  onSubmit={handleTicketUpdate}
                  submitLabel="Save Changes"
                />
              </div>
            </div>
          ) : (
            /* Ticket Detail View */
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <TicketDetail
                ticket={selectedTicket}
                loading={loading || deleting}
                onStatusUpdate={handleStatusUpdate}
                isAdmin={false}
                isTechnician={false}
                canEditData={canEditData}
                canDeleteTicket={canDeleteTicket}
                onEditTicket={() => setIsEditing(true)}
                onAttachmentsChanged={() => fetchTicket(id)}
                onDeleteTicket={handleDeleteTicket}
              />
            </div>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default TicketDetailPage;
