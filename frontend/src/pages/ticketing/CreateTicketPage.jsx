import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTickets } from '../../hooks/useTickets';
import TicketForm from '../../components/ticketing/TicketForm';

const CreateTicketPage = () => {
  const navigate = useNavigate();
  const { createTicket, loading, error } = useTickets();

  const handleSubmit = async (formData) => {
    try {
      const newTicket = await createTicket(formData);
      navigate(`/tickets/${newTicket.id}`);
    } catch (error) {
      console.error('Failed to create ticket:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create New Ticket</h1>
          <p className="text-gray-600 mt-2">Submit a maintenance or incident report</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-red-800">
            {error}
          </div>
        )}

        <TicketForm onSubmit={handleSubmit} loading={loading} />
      </div>
    </div>
  );
};

export default CreateTicketPage;
