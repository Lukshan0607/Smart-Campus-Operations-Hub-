import React, { useEffect } from 'react';
import ticketApi from '../../api/ticketApi';

const TechnicianJobsDashboard = () => {
  const [jobs, setJobs] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

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

  const complete = async (ticketId) => {
    const resolutionNote = window.prompt('Add resolution note');
    if (!resolutionNote) return;
    await ticketApi.completeTicket(ticketId, resolutionNote);
    load();
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
              <span className="text-sm">{t.status}</span>
            </div>
            <p className="text-sm text-gray-600 mt-1">{t.description}</p>
            <button
              onClick={() => complete(t.id)}
              className="mt-3 px-3 py-1.5 rounded bg-green-600 text-white"
            >
              Mark Complete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TechnicianJobsDashboard;
