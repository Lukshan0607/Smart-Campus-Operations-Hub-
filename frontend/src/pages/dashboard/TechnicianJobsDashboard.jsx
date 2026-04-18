import React, { useEffect, useMemo } from 'react';
import ticketApi from '../../api/ticketApi';
import { getUser, logout } from '../../utils/auth';

const TechnicianJobsDashboard = () => {
  const [jobs, setJobs] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [completionNotes, setCompletionNotes] = React.useState({});
  const [proofFiles, setProofFiles] = React.useState({});
  const [submitting, setSubmitting] = React.useState({});
  const [statusFilter, setStatusFilter] = React.useState('ALL');

  const load = async () => {
    setLoading(true);
    try {
      const currentUser = getUser();
      const isAdmin = currentUser?.role === 'ADMIN';

      if (isAdmin) {
        const res = await ticketApi.listTickets();
        const allTickets = Array.isArray(res.data) ? res.data : [];
        setJobs(allTickets.filter((ticket) => ticket.assignedTechnicianId != null));
      } else {
        const res = await ticketApi.listTechnicianJobs();
        setJobs(Array.isArray(res.data) ? res.data : []);
      }
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load assigned jobs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const getImageSrc = (fileUrl) => {
    if (!fileUrl) return '';
    if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) return fileUrl;
    return fileUrl.startsWith('/') ? fileUrl : `/${fileUrl}`;
  };

  const isFinalStatus = (status) => ['RESOLVED', 'CLOSED', 'REJECTED'].includes(status);

  const getDurationLabel = (ticket) => {
    if (!ticket?.createdAt) return '-';
    const start = new Date(ticket.createdAt).getTime();
    if (Number.isNaN(start)) return '-';

    const end = ticket.closedAt ? new Date(ticket.closedAt).getTime() : Date.now();
    if (Number.isNaN(end) || end < start) return '-';

    const totalMinutes = Math.floor((end - start) / 60000);
    const days = Math.floor(totalMinutes / 1440);
    const hours = Math.floor((totalMinutes % 1440) / 60);
    const minutes = totalMinutes % 60;

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const completedJobs = useMemo(
    () => jobs.filter((j) => j.status === 'RESOLVED' || j.status === 'CLOSED'),
    [jobs]
  );

  const inProgressJobs = useMemo(
    () => jobs.filter((j) => j.status === 'IN_PROGRESS'),
    [jobs]
  );

  const filteredJobs = useMemo(() => {
    if (statusFilter === 'ALL') return jobs;
    return jobs.filter((j) => j.status === statusFilter);
  }, [jobs, statusFilter]);

  const avgCompletionDuration = useMemo(() => {
    const closed = completedJobs.filter((j) => j.createdAt && j.closedAt);
    if (closed.length === 0) return '-';

    const avgMs = closed.reduce((sum, j) => {
      const start = new Date(j.createdAt).getTime();
      const end = new Date(j.closedAt).getTime();
      if (Number.isNaN(start) || Number.isNaN(end) || end < start) return sum;
      return sum + (end - start);
    }, 0) / closed.length;

    const totalMinutes = Math.floor(avgMs / 60000);
    const days = Math.floor(totalMinutes / 1440);
    const hours = Math.floor((totalMinutes % 1440) / 60);
    if (days > 0) return `${days}d ${hours}h`;
    return `${hours}h ${totalMinutes % 60}m`;
  }, [completedJobs]);

  const downloadAllJobs = () => {
    if (!jobs.length) {
      setError('No jobs available to download');
      return;
    }

    const headers = [
      'Ticket ID',
      'Title',
      'Status',
      'Priority',
      'Category',
      'Assigned Technician',
      'Created At',
      'Expected Completion',
      'Closed At',
      'Work Duration',
      'Resolution Note',
    ];

    const escapeCsv = (value) => {
      const str = value == null ? '' : String(value);
      return `"${str.replace(/"/g, '""')}"`;
    };

    const rows = jobs.map((j) => [
      j.id,
      j.title,
      j.status,
      j.priority,
      j.category,
      j.assignedTechnicianName || '',
      j.createdAt || '',
      j.expectedCompletionAt || '',
      j.closedAt || '',
      getDurationLabel(j),
      j.resolutionNote || j.completionNotes || '',
    ]);

    const csvContent = [headers, ...rows].map((row) => row.map(escapeCsv).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'my-jobs-details.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const isOverdue = (ticket) => {
    if (!ticket.expectedCompletionAt || isFinalStatus(ticket.status)) return false;
    return new Date(ticket.expectedCompletionAt).getTime() < Date.now();
  };

  const complete = async (ticketId) => {
    const resolutionNote = (completionNotes[ticketId] || '').trim();
    const files = proofFiles[ticketId] || [];

    if (!resolutionNote) {
      setError('Please add a completion note before marking complete');
      return;
    }
    if (files.length === 0) {
      setError('Please upload at least one proof image before completing the task');
      return;
    }

    setSubmitting((prev) => ({ ...prev, [ticketId]: true }));
    try {
      await ticketApi.uploadAttachments(ticketId, files);
      await ticketApi.completeTicket(ticketId, resolutionNote);

      setCompletionNotes((prev) => ({ ...prev, [ticketId]: '' }));
      setProofFiles((prev) => ({ ...prev, [ticketId]: [] }));
      setError('');
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to complete ticket with proof upload');
    } finally {
      setSubmitting((prev) => ({ ...prev, [ticketId]: false }));
    }
  };

  const handleLogout = () => {
    logout();
    window.location.assign('/login');
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
        <h1 className="text-2xl font-bold">My Assigned Jobs</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={downloadAllJobs}
            className="px-3 py-2 rounded bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700"
          >
            Download All Jobs Details
          </button>
          <button
            onClick={handleLogout}
            className="px-3 py-2 rounded bg-red-600 text-white text-sm font-semibold hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
        <div className="bg-white border rounded p-3">
          <p className="text-xs text-gray-500">Own Works</p>
          <p className="text-xl font-bold text-gray-900">{jobs.length}</p>
        </div>
        <div className="bg-white border rounded p-3">
          <p className="text-xs text-gray-500">In Progress</p>
          <p className="text-xl font-bold text-yellow-700">{inProgressJobs.length}</p>
        </div>
        <div className="bg-white border rounded p-3">
          <p className="text-xs text-gray-500">Previous Completed</p>
          <p className="text-xl font-bold text-green-700">{completedJobs.length}</p>
        </div>
        <div className="bg-white border rounded p-3">
          <p className="text-xs text-gray-500">Avg Duration</p>
          <p className="text-xl font-bold text-blue-700">{avgCompletionDuration}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REJECTED'].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-3 py-1.5 rounded-full text-sm border ${statusFilter === status ? 'bg-gray-800 text-white border-gray-800' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
          >
            {status === 'ALL' ? 'All' : status.replace('_', ' ')}
          </button>
        ))}
      </div>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && !error && filteredJobs.length === 0 && (
        <p className="text-gray-600 border rounded p-3 bg-gray-50">
          No jobs found for selected status. If you are a technician, ask admin to assign a ticket.
        </p>
      )}
      <div className="grid gap-3">
        {filteredJobs.map((t) => (
          <div key={t.id} className="border rounded p-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">{t.title}</h3>
              <span className={`text-xs font-bold px-2 py-1 rounded ${
                t.status === 'OPEN' ? 'bg-blue-100 text-blue-800' :
                t.status === 'IN_PROGRESS' ? 'bg-yellow-100 text-yellow-800' :
                t.status === 'RESOLVED' ? 'bg-green-100 text-green-800' :
                t.status === 'CLOSED' ? 'bg-gray-100 text-gray-800' :
                'bg-red-100 text-red-800'
              }`}>{t.status}</span>
            </div>
            <p className="text-sm text-gray-600 mt-1">{t.description}</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-3 text-sm">
              <div className="bg-gray-50 border rounded p-2">
                <p className="text-xs text-gray-500">Assigned By</p>
                <p className="font-medium text-gray-800">{t.assignedTechnicianName || '-'}</p>
              </div>
              <div className="bg-gray-50 border rounded p-2">
                <p className="text-xs text-gray-500">Deadline</p>
                <p className="font-medium text-gray-800">
                  {t.expectedCompletionAt ? new Date(t.expectedCompletionAt).toLocaleString() : 'Not set'}
                </p>
              </div>
              <div className="bg-gray-50 border rounded p-2">
                <p className="text-xs text-gray-500">Completion</p>
                <p className="font-medium text-gray-800">
                  {isFinalStatus(t.status) ? 'Completed' : 'Pending'}
                </p>
              </div>
              <div className="bg-gray-50 border rounded p-2 md:col-span-3">
                <p className="text-xs text-gray-500">Work Duration</p>
                <p className="font-medium text-gray-800">{getDurationLabel(t)}</p>
              </div>
            </div>

            {t.warningMessage && !isFinalStatus(t.status) && (
              <div className="mt-3 p-2 rounded border border-amber-300 bg-amber-50 text-amber-900 text-sm">
                ⚠ Warning: {t.warningMessage}
              </div>
            )}

            {isOverdue(t) && (
              <div className="mt-3 p-2 rounded border border-red-300 bg-red-50 text-red-800 text-sm font-medium">
                Overdue: Please complete this task urgently.
              </div>
            )}

            {t.attachments?.length > 0 && (
              <div className="mt-3">
                <p className="text-sm font-semibold text-gray-800 mb-2">Proof Items ({t.attachments.length})</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {t.attachments.map((a) => (
                    <a
                      key={a.id}
                      href={getImageSrc(a.fileUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="border rounded overflow-hidden bg-gray-50"
                    >
                      <img
                        src={getImageSrc(a.fileUrl)}
                        alt={a.filename}
                        className="w-full h-20 object-cover"
                      />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {!isFinalStatus(t.status) && (
              <div className="mt-4 space-y-2">
                <textarea
                  value={completionNotes[t.id] || ''}
                  onChange={(e) => setCompletionNotes((prev) => ({ ...prev, [t.id]: e.target.value }))}
                  className="w-full border rounded px-3 py-2 text-sm"
                  rows={3}
                  placeholder="Add what work was done to complete the task"
                />
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  multiple
                  onChange={(e) => {
                    const fileList = Array.from(e.target.files || []).slice(0, 3);
                    setProofFiles((prev) => ({ ...prev, [t.id]: fileList }));
                  }}
                  className="block w-full text-sm text-gray-700"
                />
                {(proofFiles[t.id] || []).length > 0 && (
                  <p className="text-xs text-gray-500">
                    Selected files: {(proofFiles[t.id] || []).map((f) => f.name).join(', ')}
                  </p>
                )}

                <button
                  onClick={() => complete(t.id)}
                  disabled={submitting[t.id]}
                  className="px-3 py-1.5 rounded bg-green-600 text-white disabled:bg-gray-300"
                >
                  {submitting[t.id] ? 'Submitting...' : 'Mark Complete + Upload Proof'}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TechnicianJobsDashboard;
