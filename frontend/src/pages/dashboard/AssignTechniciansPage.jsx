import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ticketApi from '../../api/ticketApi';
import authApi from '../../api/authApi';
import { formatCategoryDisplay } from '../../utils/ticketCategories';

const AssignTechniciansPage = () => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [selectedTechByTicket, setSelectedTechByTicket] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filterStatus, setFilterStatus] = useState('OPEN');

  const STATUSES = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REJECTED'];
  const STATUS_COLORS = {
    OPEN: 'bg-blue-100 text-blue-800',
    IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
    RESOLVED: 'bg-green-100 text-green-800',
    CLOSED: 'bg-gray-100 text-gray-800',
    REJECTED: 'bg-red-100 text-red-800',
  };

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
    try {
      await ticketApi.assignTechnician(ticketId, Number(technicianId));
      setSuccess(`Technician assigned successfully to ticket #${ticketId}`);
      setTimeout(() => setSuccess(''), 3000);
      load();
      setSelectedTechByTicket((prev) => {
        const updated = { ...prev };
        delete updated[ticketId];
        return updated;
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to assign technician');
    }
  };

  const handleTechnicianChange = (ticketId, value) => {
    setSelectedTechByTicket((prev) => ({
      ...prev,
      [ticketId]: value,
    }));
  };

  const parseCsvValues = (value) => {
    if (!value) return [];
    return String(value)
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  };

  const isTicketLocked = (status) => {
    const lockedStatuses = ['COMPLETED', 'RESOLVED', 'REJECTED'];
    return lockedStatuses.includes(status);
  };

  const filteredTickets = tickets.filter((ticket) => ticket.status === filterStatus);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-6 px-4 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => navigate('/admin/tickets')}
            className="flex items-center gap-2 text-white hover:bg-white hover:bg-opacity-20 px-3 py-2 rounded-lg transition mb-4"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold">Assign Technicians</h1>
          <p className="text-blue-100 mt-2">Quickly assign technicians to tickets and manage workload distribution</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto py-8 px-4">
        {/* Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-red-800">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 text-green-800">
            {success}
          </div>
        )}

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
          <p className="text-sm font-semibold text-gray-700 mb-3">Filter by Status</p>
          <div className="flex flex-wrap gap-2">
            {STATUSES.map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold border transition ${
                  filterStatus === status
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {status.replace(/_/g, ' ')} ({tickets.filter((t) => t.status === status).length})
              </button>
            ))}
          </div>
        </div>

        {/* Tickets List */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading tickets...</p>
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="bg-white rounded-lg border p-8 text-center">
            <p className="text-gray-600 text-lg">No tickets with status "{filterStatus}" found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTickets.map((ticket) => (
              <div key={ticket.id} className="bg-white border rounded-lg p-5 shadow-sm hover:shadow-md transition">
                {(() => {
                  const additionalNames = parseCsvValues(ticket.additionalTechnicianNames);
                  const additionalIds = parseCsvValues(ticket.additionalTechnicianIds);
                  const isPrimaryAssigned = Boolean(ticket.assignedTechnicianId || ticket.assignedTechnicianName);
                  const alreadyAssignedIds = new Set([
                    ...(ticket.assignedTechnicianId != null ? [String(ticket.assignedTechnicianId)] : []),
                    ...additionalIds,
                  ]);
                  const availableTechnicians = technicians.filter((tech) => !alreadyAssignedIds.has(String(tech.id)));

                  return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start mb-4">
                  {/* Ticket Info */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">Ticket #{ticket.id}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[ticket.status] || 'bg-gray-100 text-gray-800'}`}>
                        {ticket.status}
                      </span>
                    </div>
                    <p className="text-gray-700 mb-2">{ticket.title}</p>
                    <p className="text-sm text-gray-600">{ticket.description}</p>
                    <div className="mt-3 flex gap-4 text-sm text-gray-600">
                      <span><strong>Category:</strong> {formatCategoryDisplay(ticket.category, ticket.subCategory)}</span>
                      <span><strong>Priority:</strong> {ticket.priority}</span>
                    </div>
                    <div className="mt-2 text-sm text-gray-600">
                      <strong>Reported by:</strong> {ticket.creatorName || 'Unknown'}
                    </div>
                  </div>

                  {/* Assignment Section */}
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <p className="text-sm font-semibold text-gray-700 mb-2">
                      Primary Assignee: <span className="text-blue-600">{ticket.assignedTechnicianName || 'Unassigned'}</span>
                    </p>
                    <p className="text-xs text-gray-500 mb-3">Primary technician cannot be replaced from this page. You can add another technician.</p>

                    <div className="mb-3 text-sm text-gray-700">
                      <p className="font-semibold mb-1">All Assigned Technicians</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>{ticket.assignedTechnicianName || 'Unassigned'}</li>
                        {additionalNames.map((name, index) => (
                          <li key={`${ticket.id}-extra-${index}`}>{name}</li>
                        ))}
                      </ul>
                    </div>

                    {isTicketLocked(ticket.status) ? (
                      <div className="bg-red-50 border border-red-300 p-3 rounded">
                        <p className="text-red-700 text-sm font-semibold">🔒 Ticket Locked</p>
                        <p className="text-red-600 text-xs mt-1">Completed, resolved, or rejected tickets cannot be edited or assigned.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            {isPrimaryAssigned ? 'Add Another Technician' : 'Assign Technician'}
                          </label>
                          <select
                            value={selectedTechByTicket[ticket.id] || ''}
                            onChange={(e) => handleTechnicianChange(ticket.id, e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          >
                            <option value="">-- Choose a technician --</option>
                            {availableTechnicians.map((tech) => (
                              <option key={tech.id} value={tech.id}>
                                {tech.displayName || tech.username || `Technician #${tech.id}`} (#{tech.id})
                              </option>
                            ))}
                          </select>
                          {availableTechnicians.length === 0 && (
                            <p className="text-xs text-gray-500 mt-2">All technicians are already assigned for this ticket.</p>
                          )}
                        </div>

                        <button
                          onClick={() => assign(ticket.id)}
                          disabled={!selectedTechByTicket[ticket.id] || availableTechnicians.length === 0}
                          className={`w-full px-4 py-2 rounded-lg font-semibold transition text-white ${
                            selectedTechByTicket[ticket.id] && availableTechnicians.length > 0
                              ? 'bg-green-600 hover:bg-green-700'
                              : 'bg-gray-400 cursor-not-allowed'
                          }`}
                        >
                          {isPrimaryAssigned ? 'Add Technician' : 'Assign Technician'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                  );
                })()}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AssignTechniciansPage;
