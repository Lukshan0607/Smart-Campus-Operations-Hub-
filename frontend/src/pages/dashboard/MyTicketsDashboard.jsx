import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import ticketApi from '../../api/ticketApi';
import { getUser } from '../../utils/auth';

const MyTicketsDashboard = () => {
  const [tickets, setTickets] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  useEffect(() => {
    const run = async () => {
      try {
        const res = await ticketApi.listMyTickets();
        setTickets(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load my tickets');
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">My Tickets</h1>
          <p className="text-gray-600">Welcome {getUser()?.username || 'User'}</p>
        </div>
        <div className="flex gap-3">
          <Link to="/tickets/create" className="px-4 py-2 rounded bg-blue-600 text-white">New Ticket</Link>
          <Link to="/" className="px-4 py-2 rounded border">Home</Link>
        </div>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-600">{error}</p>}

      <div className="grid gap-3">
        {tickets.map((t) => (
          <Link to={`/tickets/${t.id}`} key={t.id} className="border rounded p-4 hover:bg-gray-50">
            <div className="flex justify-between">
              <h3 className="font-semibold">{t.title}</h3>
              <span className="text-sm">{t.status}</span>
            </div>
            <p className="text-sm text-gray-600 mt-1">{t.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default MyTicketsDashboard;
