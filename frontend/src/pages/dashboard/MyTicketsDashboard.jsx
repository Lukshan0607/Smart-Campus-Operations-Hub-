import React, { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import ticketApi from '../../api/ticketApi';
import { getUser, logout } from '../../utils/auth';

const MyTicketsDashboard = () => {
  const [tickets, setTickets] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [deletingId, setDeletingId] = React.useState(null);
  const [success, setSuccess] = React.useState('');

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

  const reloadTickets = async () => {
    setLoading(true);
    try {
      const res = await ticketApi.listMyTickets();
      setTickets(Array.isArray(res.data) ? res.data : []);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load my tickets');
    } finally {
      setLoading(false);
    }
  };

  const openCount = useMemo(
    () => tickets.filter((t) => t.status === 'OPEN').length,
    [tickets]
  );

  const inProgressCount = useMemo(
    () => tickets.filter((t) => t.status === 'IN_PROGRESS').length,
    [tickets]
  );

  const completedCount = useMemo(
    () => tickets.filter((t) => t.status === 'RESOLVED' || t.status === 'CLOSED').length,
    [tickets]
  );

  const handleLogout = () => {
    logout();
    window.location.assign('/login');
  };

  const isAssigned = (ticket) =>
    ticket?.assignedTechnicianId != null &&
    Number(ticket.assignedTechnicianId) > 0 &&
    String(ticket.assignedTechnicianName || '').toLowerCase() !== 'unassigned';

  const canEditTicket = (ticket) => !isAssigned(ticket);

  const canDeleteTicket = (ticket) => isAssigned(ticket);

  const handleDeleteTicket = async (ticket) => {
    const ok = window.confirm(
      `Delete ticket #${ticket.id}? A notification will be sent to admin and assigned technician.`
    );
    if (!ok) return;

    setDeletingId(ticket.id);
    setError('');
    setSuccess('');
    try {
      await ticketApi.deleteTicket(ticket.id);
      setSuccess(`Ticket #${ticket.id} deleted successfully.`);
      await reloadTickets();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete ticket');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">My Dashboard</h1>
          <p className="text-gray-600">Welcome {getUser()?.username || 'User'}</p>
        </div>
        <div className="flex gap-3">
          <Link to="/tickets/create" className="px-4 py-2 rounded bg-blue-600 text-white">New Ticket</Link>
          <button onClick={handleLogout} className="px-4 py-2 rounded bg-red-600 text-white">Logout</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
        <div className="bg-white border rounded p-3">
          <p className="text-xs text-gray-500">Total Tickets</p>
          <p className="text-xl font-bold text-gray-900">{tickets.length}</p>
        </div>
        <div className="bg-white border rounded p-3">
          <p className="text-xs text-gray-500">Open</p>
          <p className="text-xl font-bold text-blue-700">{openCount}</p>
        </div>
        <div className="bg-white border rounded p-3">
          <p className="text-xs text-gray-500">In Progress</p>
          <p className="text-xl font-bold text-yellow-700">{inProgressCount}</p>
        </div>
        <div className="bg-white border rounded p-3">
          <p className="text-xs text-gray-500">Completed</p>
          <p className="text-xl font-bold text-green-700">{completedCount}</p>
        </div>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-600">{error}</p>}
      {success && <p className="text-green-700">{success}</p>}

      {!loading && !error && tickets.length === 0 && (
        <p className="text-gray-600 border rounded p-3 bg-gray-50 mb-4">
          No tickets found. Create your first ticket to start.
        </p>
      )}

      <div className="grid gap-3">
        {tickets.map((t) => (
          <div key={t.id} className="border rounded p-4">
            <div className="flex justify-between">
              <Link to={`/tickets/${t.id}`} className="font-semibold hover:text-blue-700">{t.title}</Link>
              <span className="text-sm">{t.status}</span>
            </div>
            <p className="text-sm text-gray-600 mt-1">{t.description}</p>

            <div className="flex flex-wrap items-center gap-2 mt-3">
              <Link to={`/tickets/${t.id}`} className="px-3 py-1.5 rounded border text-sm hover:bg-gray-50">
                View
              </Link>

              {canEditTicket(t) && (
                <Link
                  to={`/tickets/${t.id}`}
                  className="px-3 py-1.5 rounded bg-purple-600 text-white text-sm hover:bg-purple-700"
                >
                  Edit (No Technician Yet)
                </Link>
              )}

              {canDeleteTicket(t) && (
                <button
                  onClick={() => handleDeleteTicket(t)}
                  disabled={deletingId === t.id}
                  className="px-3 py-1.5 rounded bg-red-600 text-white text-sm hover:bg-red-700 disabled:bg-gray-400"
                >
                  {deletingId === t.id ? 'Deleting...' : 'Delete (Technician Assigned)'}
                </button>
              )}

              {!canEditTicket(t) && !canDeleteTicket(t) && (
                <span className="text-xs text-gray-500">No actions available</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyTicketsDashboard;
