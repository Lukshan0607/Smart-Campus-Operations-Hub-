import React, { useEffect } from 'react';
import ticketApi from '../../api/ticketApi';

const AdminDashboard = () => {
  const [tickets, setTickets] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  const load = async () => {
    setLoading(true);
    try {
      const res = await ticketApi.listTickets();
      setTickets(Array.isArray(res.data) ? res.data : []);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const assign = async (ticketId) => {
    const technicianId = window.prompt('Technician ID (e.g. 2)');
    if (!technicianId) return;
    await ticketApi.assignTechnician(ticketId, Number(technicianId));
    load();
  };

  const reject = async (ticketId) => {
    const reason = window.prompt('Rejection reason');
    if (!reason) return;
    await ticketApi.adminUpdateStatus(ticketId, 'REJECTED', reason);
    load();
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Admin Ticket Dashboard</h1>
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-600">{error}</p>}
      <div className="grid gap-3">
        {tickets.map((t) => (
          <div key={t.id} className="border rounded p-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">{t.title}</h3>
              <span className="text-sm">{t.status}</span>
            </div>
            <p className="text-sm text-gray-600 mt-1">{t.description}</p>
            <div className="flex gap-2 mt-3">
              <button onClick={() => assign(t.id)} className="px-3 py-1.5 rounded bg-blue-600 text-white">Assign</button>
              <button onClick={() => reject(t.id)} className="px-3 py-1.5 rounded bg-red-600 text-white">Reject</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
