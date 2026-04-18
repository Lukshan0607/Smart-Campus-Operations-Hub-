import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTickets } from '../../hooks/useTickets';
import TicketList from '../../components/ticketing/TicketList';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

const TicketsPage = () => {
  const { tickets, loading, error, fetchTickets } = useTickets();

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <Header />
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Maintenance Tickets
              </h1>
              <p className="text-gray-600 mt-2 text-sm sm:text-base">
                View and manage campus maintenance requests efficiently
              </p>
            </div>
            <Link
              to="/tickets/create"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Ticket
            </Link>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-400 rounded-lg p-4 flex items-start gap-3">
            <svg className="w-5 h-5 text-red-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-red-800 font-medium">{error}</div>
          </div>
        )}

        {/* Tickets List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <TicketList tickets={tickets} loading={loading} error={error} />
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default TicketsPage;
