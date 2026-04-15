import React, { useEffect } from 'react';
import ticketApi from '../../api/ticketApi';

const TechnicianJobsDashboard = () => {
  const [jobs, setJobs] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [completionNotes, setCompletionNotes] = React.useState({});
  const [proofFiles, setProofFiles] = React.useState({});
  const [submitting, setSubmitting] = React.useState({});

  const load = async () => {
    setLoading(true);
    try {
      const res = await ticketApi.listTechnicianJobs();
      setJobs(Array.isArray(res.data) ? res.data : []);
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

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">My Assigned Jobs</h1>
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-600">{error}</p>}
      <div className="grid gap-3">
        {jobs.map((t) => (
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
