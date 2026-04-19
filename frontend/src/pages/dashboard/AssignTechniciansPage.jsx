import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ticketApi from '../../api/ticketApi';
import authApi from '../../api/authApi';
import AdminSideNavigation from '../../components/admin/AdminSideNavigation';

const AssignTechniciansPage = () => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [selectedTechByTicket, setSelectedTechByTicket] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filterStatus, setFilterStatus] = useState('OPEN');
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [editingCategory, setEditingCategory] = useState('');
  const [deletingTicketId, setDeletingTicketId] = useState(null);

  const STATUSES = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REJECTED'];
  const FINAL_STATUSES = ['RESOLVED', 'CLOSED', 'REJECTED'];
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

  const parseCsvValues = (value) => {
    if (!value) return [];
    return String(value)
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  };

  const isUpcomingWithinMonth = (ticket) => {
    if (!ticket?.expectedCompletionAt) return false;
    const deadline = new Date(ticket.expectedCompletionAt);
    if (Number.isNaN(deadline.getTime())) return false;
    const now = new Date();
    const oneMonthLater = new Date(now);
    oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);
    return deadline >= now && deadline <= oneMonthLater;
  };

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

  const removeTechnician = async (ticketId, technicianId) => {
    try {
      await ticketApi.removeTechnician(ticketId, Number(technicianId));
      setSuccess('Technician removed successfully');
      setTimeout(() => setSuccess(''), 3000);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove technician');
    }
  };

  const saveCategory = async (ticketId, newCategory) => {
    if (!newCategory || newCategory.trim() === '') {
      setError('Category cannot be empty');
      return;
    }
    try {
      await ticketApi.updateCategory(ticketId, newCategory);
      setSuccess('Category updated successfully');
      setTimeout(() => setSuccess(''), 3000);
      setEditingCategoryId(null);
      setEditingCategory('');
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update category');
    }
  };

  const deleteTicketConfirm = async (ticketId) => {
    try {
      await ticketApi.deleteTicket(ticketId);
      setSuccess('Ticket deleted successfully');
      setTimeout(() => setSuccess(''), 3000);
      setDeletingTicketId(null);
      load();
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to delete ticket';
      setError(errorMsg);
      setDeletingTicketId(null);
    }
  };

  const filteredTickets = tickets
    .filter((ticket) => ticket.status === filterStatus);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSideNavigation activeSection="assign-technicians" setActiveSection={() => {}} />
      
      <div className="flex-1">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-6 px-4 shadow-lg">
          <div className="max-w-7xl mx-auto">
            <button
              onClick={() => navigate('/admin/tickets')}
              className="flex items-center gap-2 text-white hover:bg-white hover:bg-opacity-20 px-3 py-2 rounded-lg transition mb-4"
            >
              &larr; Back to Admin Dashboard
            </button>
            <h1 className="text-3xl font-bold">Assign Technicians</h1>
            <p className="text-blue-100 mt-2">Manage technician assignments across all ticket statuses</p>
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
            <p className="text-gray-600 text-lg">No tickets with status "{filterStatus.replace(/_/g, ' ')}" found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTickets.map((ticket) => (
              <div key={ticket.id} className="bg-white border rounded-lg p-5 shadow-sm hover:shadow-md transition">
                {(() => {
                  const additionalIds = parseCsvValues(ticket.additionalTechnicianIds);
                  const additionalNames = parseCsvValues(ticket.additionalTechnicianNames);
                  const assignedIds = new Set([
                    ...(ticket.assignedTechnicianId ? [String(ticket.assignedTechnicianId)] : []),
                    ...additionalIds,
                  ]);
                  const availableTechnicians = technicians.filter((tech) => !assignedIds.has(String(tech.id)));
                  const isFinalStatus = FINAL_STATUSES.includes(ticket.status);

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
                      <div>
                        <strong>Category:</strong>{' '}
                        {editingCategoryId === ticket.id ? (
                          <div className="flex gap-2 mt-1">
                            <input
                              type="text"
                              value={editingCategory}
                              onChange={(e) => setEditingCategory(e.target.value)}
                              className="px-2 py-1 border border-gray-300 rounded text-sm"
                            />
                            <button
                              onClick={() => saveCategory(ticket.id, editingCategory)}
                              className="px-2 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingCategoryId(null)}
                              className="px-2 py-1 bg-gray-400 text-white rounded text-sm hover:bg-gray-500"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span>{ticket.category}</span>
                            {!isFinalStatus && (
                              <button
                                onClick={() => {
                                  setEditingCategoryId(ticket.id);
                                  setEditingCategory(ticket.category);
                                }}
                                className="text-blue-600 hover:underline text-xs"
                              >
                                Edit
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                      <span><strong>Priority:</strong> {ticket.priority}</span>
                    </div>
                    <div className="mt-2 text-sm text-gray-600">
                      <strong>Reported by:</strong> {ticket.creatorName || 'Unknown'}
                    </div>
                    <div className="mt-2 text-sm text-gray-600">
                      <strong>Expected completion:</strong>{' '}
                      {ticket.expectedCompletionAt ? new Date(ticket.expectedCompletionAt).toLocaleString() : 'Not set'}
                    </div>
                  </div>

                  {/* Assignment Section */}
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <p className="text-sm font-semibold text-gray-700 mb-3">
                      Primary Assignee:{' '}
                      <span className="text-blue-600">{ticket.assignedTechnicianName || 'Unassigned'}</span>
                    </p>

                    {(ticket.assignedTechnicianName || additionalNames.length > 0) && (
                      <div className="mb-3 p-3 rounded border bg-white">
                        <p className="text-xs font-semibold text-gray-600 mb-2">Assigned Technicians</p>
                        <ul className="text-sm text-gray-700 space-y-2">
                          {ticket.assignedTechnicianName && (
                            <li className="flex items-center justify-between">
                              <span>• {ticket.assignedTechnicianName} (Primary)</span>
                              {!isFinalStatus && (additionalNames.length > 0 || availableTechnicians.length > 0) && (
                                <button
                                  onClick={() => removeTechnician(ticket.id, ticket.assignedTechnicianId)}
                                  className="text-red-600 hover:text-red-800 text-xs font-semibold"
                                >
                                  Remove
                                </button>
                              )}
                            </li>
                          )}
                          {additionalNames.map((name, idx) => {
                            const techId = additionalIds[idx];
                            return (
                              <li key={`${ticket.id}-additional-${idx}`} className="flex items-center justify-between">
                                <span>• {name} (Additional)</span>
                                {!isFinalStatus && (
                                  <button
                                    onClick={() => removeTechnician(ticket.id, techId)}
                                    className="text-red-600 hover:text-red-800 text-xs font-semibold"
                                  >
                                    Remove
                                  </button>
                                )}
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    )}

                    {isFinalStatus ? (
                      <div className="p-3 rounded border bg-gray-100 text-sm text-gray-600">
                        This ticket is {ticket.status}. Assignment is locked and cannot be edited.
                      </div>
                    ) : (

                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Select Technician</label>
                        <select
                          value={selectedTechByTicket[ticket.id] || ''}
                          onChange={(e) => handleTechnicianChange(ticket.id, e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        >
                          <option value="">-- Choose a technician --</option>
                          {technicians.map((tech) => {
                            const isAlreadyAssigned = assignedIds.has(String(tech.id));
                            return (
                              <option key={tech.id} value={tech.id}>
                                {tech.displayName || tech.name || tech.email} ({tech.email})
                                {isAlreadyAssigned ? ' ✓ (Already assigned)' : ''}
                              </option>
                            );
                          })}
                        </select>
                      </div>

                      <button
                        onClick={() => assign(ticket.id)}
                        disabled={!selectedTechByTicket[ticket.id]}
                        className={`w-full px-4 py-2 rounded-lg font-semibold transition text-white ${
                          selectedTechByTicket[ticket.id]
                            ? 'bg-green-600 hover:bg-green-700'
                            : 'bg-gray-400 cursor-not-allowed'
                        }`}
                      >
                        {ticket.assignedTechnicianId ? 'Add Technician' : 'Assign Technician'}
                      </button>

                      <button
                        onClick={() => setDeletingTicketId(ticket.id)}
                        className="w-full px-4 py-2 rounded-lg font-semibold transition text-white bg-red-600 hover:bg-red-700"
                      >
                        Delete Ticket
                      </button>
                    </div>
                    )}

                    {/* Delete Ticket Confirmation */}
                    {deletingTicketId === ticket.id && (
                      <div className="mt-4 p-3 rounded border bg-red-50 border-red-300">
                        <p className="text-sm text-red-800 mb-3">Are you sure you want to delete this ticket? This action cannot be undone.</p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => deleteTicketConfirm(ticket.id)}
                            className="px-4 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700 font-semibold"
                          >
                            Yes, Delete
                          </button>
                          <button
                            onClick={() => setDeletingTicketId(null)}
                            className="px-4 py-2 bg-gray-400 text-white rounded text-sm hover:bg-gray-500 font-semibold"
                          >
                            Cancel
                          </button>
                        </div>
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
    </div>
  );
};

export default AssignTechniciansPage;
