import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTickets } from '../../hooks/useTickets';
import TicketForm from '../../components/ticketing/TicketForm';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import UserSideNavigation from '../../components/UserSideNavigation';

const CreateTicketPage = () => {
  const navigate = useNavigate();
  const { createTicket, loading, error } = useTickets();
  const [activeSection, setActiveSection] = useState('create-ticket');

  const handleSubmit = async (formData) => {
    try {
      const newTicket = await createTicket(formData);
      navigate(`/tickets/${newTicket.id}`);
    } catch (error) {
      console.error('Failed to create ticket:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <div className="flex flex-1">
        <UserSideNavigation
          activeSection={activeSection}
          setActiveSection={setActiveSection}
        />

        <div className="flex-1">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-6 px-4 shadow-lg">
            <div className="max-w-4xl mx-auto">
              <button
                onClick={() => navigate('/tickets')}
                className="flex items-center gap-2 text-white hover:bg-white hover:bg-opacity-20 px-3 py-2 rounded-lg transition mb-4"
              >
                &larr; Back to My Tickets
              </button>
              <h1 className="text-3xl font-bold">Create New Ticket</h1>
              <p className="text-blue-100 mt-2">Submit a maintenance or incident report</p>
            </div>
          </div>

          <div className="max-w-4xl mx-auto py-8 px-4">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-red-800">
                {error}
              </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <TicketForm onSubmit={handleSubmit} loading={loading} />
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CreateTicketPage;
