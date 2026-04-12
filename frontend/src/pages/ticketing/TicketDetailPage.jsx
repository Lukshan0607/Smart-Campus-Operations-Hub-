import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTickets } from '../../hooks/useTickets';
import TicketDetail from '../ticketing/TicketDetail';

const TicketDetailPage = () => {
  const { id } = useParams();
  const { selectedTicket, loading, fetchTicket, updateStatus } = useTickets();

  useEffect(() => {
    if (id) {
      fetchTicket(id);
    }
  }, [id, fetchTicket]);

  const handleStatusUpdate = async (ticketId, status, resolutionNote) => {
    try {
      await updateStatus(ticketId, status, resolutionNote);
    } catch (error) {
      console.error('Failed to update status:', error);
      throw error;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <a href="/tickets" className="text-blue-600 hover:text-blue-800 font-semibold">
          ← Back to Tickets
        </a>
      </div>

      <TicketDetail
        ticket={selectedTicket}
        loading={loading}
        onStatusUpdate={handleStatusUpdate}
        isAdmin={false}
        isTechnician={false}
      />
    </div>
  );
};

export default TicketDetailPage;
