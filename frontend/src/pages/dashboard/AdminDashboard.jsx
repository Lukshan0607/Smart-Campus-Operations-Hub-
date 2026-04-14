import React, { useEffect } from 'react';
import ticketApi from '../../api/ticketApi';
import authApi from '../../api/authApi';

const AdminDashboard = () => {
  const [tickets, setTickets] = React.useState([]);
  const [technicians, setTechnicians] = React.useState([]);
  const [selectedTechByTicket, setSelectedTechByTicket] = React.useState({});
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

    const loadTechnicians = async () => {
      try {
        const res = await authApi.getTechnicians();
        setTechnicians(Array.isArray(res.data) ? res.data : []);
      } catch {
        setTechnicians([]);
      }
    };

    loadTechnicians();
  }, []);

  const assign = async (ticketId) => {
    const technicianId = selectedTechByTicket[ticketId];
    if (!technicianId) {
      setError('Please select a technician first');
      return;
    }
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
              <select
                value={selectedTechByTicket[t.id] || ''}
                onChange={(e) =>
                  setSelectedTechByTicket((prev) => ({
                    ...prev,
                    [t.id]: e.target.value,
                  }))
                }
                className="border rounded px-2 py-1.5 text-sm min-w-44"
              >
                <option value="">Select technician</option>
                {technicians.map((tech) => (
                  <option key={tech.id} value={tech.id}>
                    {tech.displayName || tech.username} (#{tech.id})
                  </option>
                ))}
              </select>
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
