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

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Admin Ticket Dashboard</h1>
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-600">{error}</p>}
      <div className="grid gap-4">
        {tickets.map((t) => (
          <div key={t.id} className="border rounded-xl p-5 bg-white shadow-sm">
            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-3">
              <div>
                <h3 className="font-semibold text-lg text-gray-900">{t.title}</h3>
                <p className="text-sm text-gray-500">Ticket #{t.id}</p>
              </div>
              <span className="text-sm font-semibold px-3 py-1 rounded-full bg-gray-100 self-start">
                {t.status}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mt-4 text-sm">
              <Info label="Category" value={t.category} />
              <Info label="Priority" value={t.priority} />
              <Info label="Created By" value={`${t.creatorName || '-'} (${t.creatorId || '-'})`} />
              <Info label="Assigned To" value={t.assignedTechnicianName || 'Unassigned'} />
              <Info label="Location Type" value={formatLocationCategory(t.locationCategory)} />
              <Info label="Building" value={t.buildingName || '-'} />
              <Info label="Floor / Block / Room" value={`${t.floorNumber ?? '-'} / ${t.block || '-'} / ${t.roomNumber || '-'}`} />
              <Info label="Contact" value={t.contactPhone || '-'} />
            </div>

            {t.locationCategory === 'OTHER' && t.otherLocation && (
              <p className="text-sm text-gray-700 mt-3"><span className="font-semibold">Other location:</span> {t.otherLocation}</p>
            )}

            {t.location && (
              <p className="text-sm text-gray-700 mt-2"><span className="font-semibold">Location summary:</span> {t.location}</p>
            )}

            <p className="text-sm text-gray-700 mt-3 whitespace-pre-wrap"><span className="font-semibold">Description:</span> {t.description}</p>

            {t.resolutionNote && (
              <div className="mt-3 p-3 rounded bg-green-50 border border-green-200">
                <p className="text-sm font-semibold text-green-800">Resolution Note</p>
                <p className="text-sm text-green-900 whitespace-pre-wrap">{t.resolutionNote}</p>
              </div>
            )}

            {t.rejectionReason && (
              <div className="mt-3 p-3 rounded bg-red-50 border border-red-200">
                <p className="text-sm font-semibold text-red-800">Rejection Reason</p>
                <p className="text-sm text-red-900 whitespace-pre-wrap">{t.rejectionReason}</p>
              </div>
            )}

            <div className="mt-4">
              <p className="text-sm font-semibold text-gray-900 mb-2">
                Uploaded Images {t.attachments?.length ? `(${t.attachments.length})` : '(0)'}
              </p>
              {t.attachments?.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {t.attachments.map((attachment) => {
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
                        <div className="p-3">
                          <p className="text-sm font-semibold text-blue-700 truncate">{attachment.filename}</p>
                          <p className="text-xs text-gray-500 truncate">{attachment.uploadedByName}</p>
                          <p className="text-xs text-gray-400">
                            {attachment.uploadedAt ? new Date(attachment.uploadedAt).toLocaleString() : '-'}
                          </p>
                        </div>
                      </a>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No images uploaded.</p>
              )}
            </div>

            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
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

const Info = ({ label, value }) => (
  <div className="bg-gray-50 rounded-lg p-3 border">
    <p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>
    <p className="font-medium text-gray-900 break-words">{value || '-'}</p>
  </div>
);

export default AdminDashboard;
