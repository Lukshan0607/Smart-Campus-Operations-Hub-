import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import { fetchResourceById } from '../../api/resourcesApi';
import { DEFAULT_USER_ID } from '../../constants/resources';

/**
 * User-facing booking entry point: only the resource context + Book CTA area.
 * Full booking CRUD lives in the booking module / teammate’s APIs (not exposed here yet).
 */
export default function BookResourcePage() {
  const { id } = useParams();
  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetchResourceById(id, DEFAULT_USER_ID);
        if (!cancelled) setResource(res);
      } catch (e) {
        if (!cancelled) setError(e.message || 'Failed to load resource');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  return (
    <main className="max-w-lg mx-auto px-4 py-12">
      <Link to={`/resources/${id}`} className="inline-flex items-center gap-1 text-sm text-blue-600 mb-6">
        <FiArrowLeft /> Resource details
      </Link>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center">
        {loading ? (
          <p className="text-gray-500">Loading…</p>
        ) : error ? (
          <p className="text-red-600 text-sm">{error}</p>
        ) : (
          <>
            <h1 className="text-xl font-bold text-gray-900">Book resource</h1>
            <p className="mt-2 text-gray-600">
              <span className="font-medium text-gray-900">{resource?.name}</span>
            </p>
            <p className="mt-6 text-sm text-gray-600 leading-relaxed">
              This screen only anchors the <strong>resource</strong> you intend to book. Another teammate owns
              booking rules, conflicts, and persistence — hook their module here when its REST API is ready.
            </p>
            <p className="mt-4 text-xs text-gray-500">
              Resource id: <code className="bg-gray-100 px-1 rounded">{id}</code> · loaded via{' '}
              <code className="bg-gray-100 px-1 rounded">{`GET /api/resources/${id}`}</code>
            </p>
            <div className="mt-8 rounded-lg bg-indigo-50 border border-indigo-100 px-4 py-3 text-sm text-indigo-900">
              Book button is in place on the list and detail pages. No booking POST is called from this UI yet.
            </div>
          </>
        )}
      </div>
    </main>
  );
}
