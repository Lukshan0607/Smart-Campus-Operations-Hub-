import React, { useEffect, useState } from 'react';
import ticketApi from '../../api/ticketApi';
import authApi from '../../api/authApi';

const AdminDashboard = () => {
  const [tickets, setTickets] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [selectedTechByTicket, setSelectedTechByTicket] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedTickets, setExpandedTickets] = useState({});
  const [selectedStatus, setSelectedStatus] = useState({});
  const [resolutionNotes, setResolutionNotes] = useState({});
  const [rejectionReasons, setRejectionReasons] = useState({});
  const [expandedSections, setExpandedSections] = useState({});

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
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to assign technician');
    }
  };

  const updateStatus = async (ticketId, newStatus) => {
    try {
      if (newStatus === 'REJECTED') {
        const reason = rejectionReasons[ticketId] || '';
        if (!reason.trim()) {
          setError('Rejection reason is required');
          return;
        }
        await ticketApi.adminUpdateStatus(ticketId, newStatus, reason);
      } else {
        await ticketApi.adminUpdateStatus(ticketId, newStatus, '');
      }
      load();
      setExpandedTickets((prev) => ({ ...prev, [ticketId]: false }));
      setSelectedStatus((prev) => ({ ...prev, [ticketId]: '' }));
      setResolutionNotes((prev) => ({ ...prev, [ticketId]: '' }));
      setRejectionReasons((prev) => ({ ...prev, [ticketId]: '' }));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status');
    }
  };

  const groupTicketsByCategoryAndPriority = () => {
    const grouped = {};
    const priorityOrder = { 'CRITICAL': 0, 'HIGH': 1, 'MEDIUM': 2, 'LOW': 3 };

    tickets.forEach((ticket) => {
      const category = ticket.category || 'Unknown';
      if (!grouped[category]) {
        grouped[category] = {};
      }
      const priority = ticket.priority || 'MEDIUM';
      if (!grouped[category][priority]) {
        grouped[category][priority] = [];
      }
      grouped[category][priority].push(ticket);
    });

    return grouped;
  };

  const formatLocationCategory = (category) => {
    switch (category) {
      case 'MAIN_BUILDING':
        return 'Main Building';
      case 'ENGINEERING_BUILDING':
        return 'Engineering Building';
      case 'BUSINESS_MANAGEMENT_BUILDING':
        return 'Business Management Building';
      case 'OTHER':
        return 'Other';
      default:
        return category || '-';
    }
  };

  const getImageSrc = (fileUrl) => {
    if (!fileUrl) return '';
    if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) return fileUrl;
    return fileUrl.startsWith('/') ? fileUrl : `/${fileUrl}`;
  };

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const toggleTicket = (ticketId) => {
    setExpandedTickets((prev) => ({
      ...prev,
      [ticketId]: !prev[ticketId],
    }));
  };

  const groupedTickets = groupTicketsByCategoryAndPriority();

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Ticket Dashboard</h1>
      {loading && <p className="text-gray-600">Loading...</p>}
      {error && <p className="text-red-600 mb-4">{error}</p>}

      <div className="space-y-6">
        {Object.keys(groupedTickets)
          .sort()
          .map((category) => (
            <div key={category}>
              <button
                onClick={() => toggleSection(category)}
                className="w-full flex items-center justify-between bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-lg hover:from-blue-700 hover:to-blue-800 transition"
              >
                <h2 className="text-xl font-bold">{category}</h2>
                <span className="text-lg">{expandedSections[category] ? '▼' : '▶'}</span>
              </button>

              {expandedSections[category] && (
                <div className="mt-4 space-y-4 ml-4 border-l-4 border-blue-300 pl-4">
                  {Object.keys(groupedTickets[category])
                    .sort((a, b) => {
                      const priorityOrder = { 'CRITICAL': 0, 'HIGH': 1, 'MEDIUM': 2, 'LOW': 3 };
                      return (priorityOrder[a] || 99) - (priorityOrder[b] || 99);
                    })
                    .map((priority) => (
                      <div key={`${category}-${priority}`}>
                        <h3 className={`text-lg font-semibold p-3 rounded-lg mb-3 ${
                          priority === 'CRITICAL' ? 'bg-red-100 text-red-800' :
                          priority === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                          priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          Priority: {priority} ({groupedTickets[category][priority].length})
                        </h3>

                        <div className="space-y-3">
                          {groupedTickets[category][priority].map((ticket) => (
                            <TicketCard
                              key={ticket.id}
                              ticket={ticket}
                              expanded={expandedTickets[ticket.id] || false}
                              toggleExpand={() => toggleTicket(ticket.id)}
                              technicians={technicians}
                              selectedTech={selectedTechByTicket[ticket.id] || ''}
                              onTechChange={(value) =>
                                setSelectedTechByTicket((prev) => ({ ...prev, [ticket.id]: value }))
                              }
                              onAssign={() => assign(ticket.id)}
                              selectedStatus={selectedStatus[ticket.id] || ''}
                              onStatusChange={(value) =>
                                setSelectedStatus((prev) => ({ ...prev, [ticket.id]: value }))
                              }
                              resolutionNote={resolutionNotes[ticket.id] || ''}
                              onResolutionNoteChange={(value) =>
                                setResolutionNotes((prev) => ({ ...prev, [ticket.id]: value }))
                              }
                              rejectionReason={rejectionReasons[ticket.id] || ''}
                              onRejectionReasonChange={(value) =>
                                setRejectionReasons((prev) => ({ ...prev, [ticket.id]: value }))
                              }
                              onUpdateStatus={(status) => updateStatus(ticket.id, status)}
                              formatLocationCategory={formatLocationCategory}
                              getImageSrc={getImageSrc}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          ))}
      </div>
    </div>
  );
};

const Info = ({ label, value }) => (
  <div className="bg-gray-50 rounded-lg p-3 border">
    <p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>
    <p className="font-medium text-gray-900 break-words">{value || '-'}</p>
  </div>
);

const TicketCard = ({
  ticket,
  expanded,
  toggleExpand,
  technicians,
  selectedTech,
  onTechChange,
  onAssign,
  selectedStatus,
  onStatusChange,
  resolutionNote,
  onResolutionNoteChange,
  rejectionReason,
  onRejectionReasonChange,
  onUpdateStatus,
  formatLocationCategory,
  getImageSrc,
}) => {
  const statusTransitions = {
    OPEN: ['IN_PROGRESS', 'REJECTED'],
    IN_PROGRESS: ['RESOLVED', 'REJECTED'],
    RESOLVED: ['CLOSED', 'REJECTED'],
    CLOSED: [],
    REJECTED: [],
  };

  const allowedNextStatuses = statusTransitions[ticket.status] || [];

  return (
    <div className="border rounded-lg bg-white shadow-sm hover:shadow-md transition">
      <button
        onClick={toggleExpand}
        className="w-full text-left p-4 flex items-center justify-between hover:bg-gray-50 transition"
      >
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h4 className="font-semibold text-gray-900">{ticket.title}</h4>
            <span className={`text-xs font-bold px-2 py-1 rounded ${
              ticket.status === 'OPEN' ? 'bg-blue-100 text-blue-800' :
              ticket.status === 'IN_PROGRESS' ? 'bg-yellow-100 text-yellow-800' :
              ticket.status === 'RESOLVED' ? 'bg-green-100 text-green-800' :
              ticket.status === 'CLOSED' ? 'bg-gray-100 text-gray-800' :
              'bg-red-100 text-red-800'
            }`}>
              {ticket.status}
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">Ticket #{ticket.id} | {ticket.creatorName} | {formatLocationCategory(ticket.locationCategory)}</p>
        </div>
        <span className="text-lg text-gray-500">{expanded ? '▼' : '▶'}</span>
      </button>

      {expanded && (
        <div className="border-t p-4 space-y-4 bg-gray-50">
          {/* Basic Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <Info label="Category" value={ticket.category} />
            <Info label="Priority" value={ticket.priority} />
            <Info label="Created By" value={`${ticket.creatorName || '-'} (${ticket.creatorId || '-'})`} />
            <Info label="Assigned To" value={ticket.assignedTechnicianName || 'Unassigned'} />
            <Info label="Building" value={ticket.buildingName || '-'} />
            <Info label="Floor / Block / Room" value={`${ticket.floorNumber ?? '-'} / ${ticket.block || '-'} / ${ticket.roomNumber || '-'}`} />
            <Info label="Contact" value={ticket.contactPhone || '-'} />
            <Info label="Created At" value={ticket.createdAt ? new Date(ticket.createdAt).toLocaleString() : '-'} />
          </div>

          {/* Description */}
          <div className="bg-white p-3 rounded border">
            <p className="text-sm font-semibold text-gray-900 mb-2">Description</p>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{ticket.description}</p>
          </div>

          {/* Location Details */}
          {ticket.locationCategory === 'OTHER' && ticket.otherLocation && (
            <div className="bg-white p-3 rounded border">
              <p className="text-sm font-semibold text-gray-900">Other Location</p>
              <p className="text-sm text-gray-700">{ticket.otherLocation}</p>
            </div>
          )}

          {/* Resolution Note (if exists) */}
          {ticket.resolutionNote && (
            <div className="bg-green-50 p-3 rounded border border-green-200">
              <p className="text-sm font-semibold text-green-800">✓ Resolution Note</p>
              <p className="text-sm text-green-900 whitespace-pre-wrap">{ticket.resolutionNote}</p>
            </div>
          )}

          {/* Rejection Reason (if exists) */}
          {ticket.rejectionReason && (
            <div className="bg-red-50 p-3 rounded border border-red-200">
              <p className="text-sm font-semibold text-red-800">✗ Rejection Reason</p>
              <p className="text-sm text-red-900 whitespace-pre-wrap">{ticket.rejectionReason}</p>
            </div>
          )}

          {/* Images */}
          {ticket.attachments?.length > 0 && (
            <div className="bg-white p-3 rounded border">
              <p className="text-sm font-semibold text-gray-900 mb-3">Uploaded Images ({ticket.attachments.length})</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {ticket.attachments.map((attachment) => {
                  const imageSrc = getImageSrc(attachment.fileUrl);
                  return (
                    <a
                      key={attachment.id}
                      href={imageSrc}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="border rounded-lg overflow-hidden hover:shadow-md transition bg-gray-50"
                    >
                      <div className="aspect-video bg-gray-100 flex items-center justify-center overflow-hidden">
                        <img
                          src={imageSrc}
                          alt={attachment.filename}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                      <div className="p-2">
                        <p className="text-xs font-semibold text-blue-700 truncate">{attachment.filename}</p>
                        <p className="text-xs text-gray-500">{attachment.uploadedByName}</p>
                      </div>
                    </a>
                  );
                })}
              </div>
            </div>
          )}

          {/* Technician Assignment */}
          <div className="bg-white p-4 rounded border">
            <p className="text-sm font-semibold text-gray-900 mb-3">Assign Technician</p>
            <div className="flex gap-2 flex-wrap items-end">
              <select
                value={selectedTech}
                onChange={(e) => onTechChange(e.target.value)}
                className="border rounded px-3 py-2 text-sm flex-1 min-w-48"
              >
                <option value="">Select a technician...</option>
                {technicians.map((tech) => (
                  <option key={tech.id} value={tech.id}>
                    {tech.displayName || tech.username} (#{tech.id})
                  </option>
                ))}
              </select>
              <button
                onClick={onAssign}
                disabled={!selectedTech}
                className="px-4 py-2 rounded bg-blue-600 text-white text-sm font-semibold disabled:bg-gray-300 hover:bg-blue-700 transition"
              >
                Assign
              </button>
            </div>
          </div>

          {/* Status Workflow */}
          <div className="bg-white p-4 rounded border">
            <p className="text-sm font-semibold text-gray-900 mb-3">Ticket Workflow</p>
            <div className="flex gap-2 items-center text-xs font-semibold mb-4 flex-wrap">
              {['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map((s, idx) => (
                <React.Fragment key={s}>
                  <span className={`px-2 py-1 rounded ${ticket.status === s ? 'bg-blue-600 text-white' : ticket.status === 'REJECTED' ? 'bg-gray-200 text-gray-500' : 'bg-gray-100 text-gray-700'}`}>
                    {s}
                  </span>
                  {idx < 3 && <span className="text-gray-400">→</span>}
                </React.Fragment>
              ))}
              <span className="text-gray-400">or</span>
              <span className={`px-2 py-1 rounded ${ticket.status === 'REJECTED' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700'}`}>
                REJECTED
              </span>
            </div>

            {allowedNextStatuses.length > 0 && (
              <div className="space-y-3">
                <div className="flex gap-2 flex-wrap items-end">
                  <select
                    value={selectedStatus}
                    onChange={(e) => onStatusChange(e.target.value)}
                    className="border rounded px-3 py-2 text-sm flex-1 min-w-48"
                  >
                    <option value="">Update status...</option>
                    {allowedNextStatuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => selectedStatus && onUpdateStatus(selectedStatus)}
                    disabled={!selectedStatus}
                    className={`px-4 py-2 rounded text-white text-sm font-semibold disabled:bg-gray-300 ${
                      selectedStatus === 'REJECTED' ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
                    } transition`}
                  >
                    Update
                  </button>
                </div>

                {selectedStatus === 'REJECTED' && (
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => onRejectionReasonChange(e.target.value)}
                    placeholder="Explain why the ticket is being rejected..."
                    className="w-full border rounded px-3 py-2 text-sm"
                    rows="3"
                  />
                )}

                {(selectedStatus === 'RESOLVED' || selectedStatus === 'CLOSED') && (
                  <textarea
                    value={resolutionNote}
                    onChange={(e) => onResolutionNoteChange(e.target.value)}
                    placeholder="Add resolution notes (optional)..."
                    className="w-full border rounded px-3 py-2 text-sm"
                    rows="3"
                  />
                )}
              </div>
            )}

            {allowedNextStatuses.length === 0 && (
              <p className="text-sm text-gray-600 italic">This ticket is in a final state and cannot be updated further.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
