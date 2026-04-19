import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ticketApi from '../../api/ticketApi';
import AdminSideNavigation from '../../components/admin/AdminSideNavigation';

const AdminBottomDetailsPage = () => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeFilter, setActiveFilter] = useState('TOTAL');

  const isFinalStatus = (status) => ['RESOLVED', 'CLOSED', 'REJECTED'].includes(status);
  const isOverdue = (ticket) => ticket.expectedCompletionAt && !isFinalStatus(ticket.status) && new Date(ticket.expectedCompletionAt).getTime() < Date.now();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await ticketApi.listTickets();
        setTickets(Array.isArray(res.data) ? res.data : []);
        setError('');
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load admin details');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const counts = useMemo(() => {
    const open = tickets.filter((t) => t.status === 'OPEN').length;
    const inProgress = tickets.filter((t) => t.status === 'IN_PROGRESS').length;
    const done = tickets.filter((t) => t.status === 'RESOLVED' || t.status === 'CLOSED').length;
    const overdue = tickets.filter((t) => isOverdue(t)).length;

    return {
      total: tickets.length,
      open,
      inProgress,
      done,
      overdue,
    };
  }, [tickets]);

  const filteredTickets = useMemo(() => {
    if (activeFilter === 'OPEN') return tickets.filter((t) => t.status === 'OPEN');
    if (activeFilter === 'IN_PROGRESS') return tickets.filter((t) => t.status === 'IN_PROGRESS');
    if (activeFilter === 'COMPLETED') return tickets.filter((t) => t.status === 'RESOLVED' || t.status === 'CLOSED');
    if (activeFilter === 'OVERDUE') return tickets.filter((t) => isOverdue(t));
    return tickets;
  }, [tickets, activeFilter]);

  const sortedTickets = useMemo(() => {
    return tickets
      .slice()
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
      .filter((t) => filteredTickets.some((ft) => ft.id === t.id));
  }, [tickets, filteredTickets]);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSideNavigation activeSection="bottom-details" setActiveSection={() => {}} />
      
      <div className="flex-1 max-w-7xl mx-auto p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Bottom Details</h1>
            <p className="text-sm text-gray-500 mt-1">Additional detail page navigated from Admin Dashboard bottom section</p>
          </div>
          <button
            onClick={() => navigate('/admin/tickets')}
            className="px-4 py-2 rounded-lg border bg-white text-gray-700 hover:bg-gray-50"
          >
            ← Back to Admin Dashboard
          </button>
        </div>

      {loading && <p className="text-gray-600">Loading...</p>}
      {error && <p className="text-red-600 mb-4">{error}</p>}

      {!loading && !error && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <SmallCard title="Total" value={counts.total} active={activeFilter === 'TOTAL'} onClick={() => setActiveFilter('TOTAL')} />
            <SmallCard title="Open" value={counts.open} active={activeFilter === 'OPEN'} onClick={() => setActiveFilter('OPEN')} />
            <SmallCard title="In Progress" value={counts.inProgress} active={activeFilter === 'IN_PROGRESS'} onClick={() => setActiveFilter('IN_PROGRESS')} />
            <SmallCard title="Completed" value={counts.done} active={activeFilter === 'COMPLETED'} onClick={() => setActiveFilter('COMPLETED')} />
            <SmallCard title="Overdue" value={counts.overdue} active={activeFilter === 'OVERDUE'} onClick={() => setActiveFilter('OVERDUE')} />
          </div>

          <div className="bg-white border rounded-lg p-4 shadow-sm">
            <p className="text-base font-semibold text-gray-900 mb-3">
              Showing {activeFilter === 'TOTAL' ? 'All Tickets' : activeFilter.replace('_', ' ')} ({filteredTickets.length})
            </p>
            {sortedTickets.length === 0 ? (
              <p className="text-sm text-gray-500">No tickets available for this filter.</p>
            ) : (
              <div className="space-y-2">
                {sortedTickets.map((t) => (
                  <div key={t.id} className="border rounded p-3 bg-gray-50 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">#{t.id} {t.title}</p>
                      <p className="text-xs text-gray-500 mt-1">{t.category} | {t.priority} | {t.createdAt ? new Date(t.createdAt).toLocaleString() : '-'}</p>
                    </div>
                    <span className="text-xs font-bold px-2 py-1 rounded bg-blue-100 text-blue-800 whitespace-nowrap">
                      {t.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
      </div>
    </div>
  );
};

const SmallCard = ({ title, value, active = false, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`w-full text-left border rounded-lg p-4 shadow-sm transition ${active ? 'bg-blue-50 border-blue-300 ring-1 ring-blue-200' : 'bg-white hover:bg-gray-50'}`}
  >
    <p className="text-xs font-semibold text-gray-500 uppercase">{title}</p>
    <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
  </button>
);

export default AdminBottomDetailsPage;
