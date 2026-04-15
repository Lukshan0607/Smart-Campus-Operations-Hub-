import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTickets } from '../../hooks/useTickets';
import TicketList from '../../components/ticketing/TicketList';

const TicketsPage = () => {
  const { tickets, loading, error, fetchTickets } = useTickets();

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Maintenance Tickets</h1>
          <p className="text-gray-600 mt-2">View and manage campus maintenance requests</p>
        </div>
        <Link
          to="/tickets/create"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold transition"
        >
          + New Ticket
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-red-800">
          {error}
        </div>
      )}

      <TicketList tickets={tickets} loading={loading} error={error} />
    </div>
  );
};

export default TicketsPage;
