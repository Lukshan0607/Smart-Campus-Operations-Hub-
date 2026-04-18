import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiChevronLeft, FiChevronRight, FiMapPin, FiSearch } from 'react-icons/fi';
import { fetchResourcesPage } from '../api/resourcesApi';
import { DEFAULT_USER_ID, RESOURCE_STATUSES, RESOURCE_TYPES } from '../constants/resources';
import Header from '../components/Header';
import Footer from '../components/Footer';

function typeLabel(value) {
  return RESOURCE_TYPES.find((t) => t.value === value)?.label || value;
}

function statusBadge(status) {
  const map = {
    ACTIVE: 'bg-emerald-50 text-emerald-800 ring-emerald-600/20',
    OUT_OF_SERVICE: 'bg-gray-100 text-gray-700 ring-gray-600/10',
    UNDER_REVIEW: 'bg-amber-50 text-amber-800 ring-amber-600/20',
    MAINTENANCE: 'bg-orange-50 text-orange-800 ring-orange-600/20',
  };
  return map[status] || 'bg-gray-50 text-gray-700';
}

export default function ResourcesPage() {
  const [page, setPage] = useState(0);
  const [size] = useState(9);
  const [sort] = useState('name,asc');
  const [type, setType] = useState('');
  const [status, setStatus] = useState('');
  const [q, setQ] = useState('');
  const [location, setLocation] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const params = {
          page,
          size,
          sort,
          userId: DEFAULT_USER_ID,
        };
        if (type) params.type = type;
        if (status) params.status = status;
        if (q.trim()) params.q = q.trim();
        if (location.trim()) params.location = location.trim();
        const res = await fetchResourcesPage(params);
        if (!cancelled) setData(res);
      } catch (e) {
        if (!cancelled) {
          setError(e?.response?.data?.message || e.message || 'Failed to load resources');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [page, size, sort, type, status, q, location]);

  const applyFilters = (e) => {
    e.preventDefault();
    setPage(0);
  };

  const content = data?.content || [];
  const totalPages = data?.totalPages ?? 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Campus resources</h1>
        <p className="mt-1 text-gray-600">
          Browse facilities and equipment. Data from{' '}
          <code className="text-sm bg-gray-100 px-1 rounded">GET /api/resources</code>.
        </p>
      </div>

      <form
        onSubmit={applyFilters}
        className="mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3 items-end bg-white p-4 rounded-xl border border-gray-200 shadow-sm"
      >
        <div className="lg:col-span-2">
          <label className="block text-xs font-medium text-gray-500 mb-1">Search</label>
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Name or description"
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full py-2 px-3 border border-gray-300 rounded-lg text-sm"
          >
            <option value="">Any</option>
            {RESOURCE_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full py-2 px-3 border border-gray-300 rounded-lg text-sm"
          >
            <option value="">Any</option>
            {RESOURCE_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Location</label>
          <div className="relative">
            <FiMapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Building / area"
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
          >
            Apply
          </button>
          <button
            type="button"
            onClick={() => {
              setType('');
              setStatus('');
              setQ('');
              setLocation('');
              setPage(0);
            }}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
          >
            Clear
          </button>
        </div>
      </form>

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-20 text-gray-500">Loading…</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {content.map((r) => (
              <article
                key={r.id}
                className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col"
              >
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="font-semibold text-gray-900">{r.name}</h2>
                    <span
                      className={`shrink-0 inline-flex rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${statusBadge(r.status)}`}
                    >
                      {r.status?.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{typeLabel(r.type)}</p>
                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">{r.description || '—'}</p>
                  <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                    <FiMapPin /> {r.location}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Available:{' '}
                    <span className="font-medium text-gray-800">
                      {r.currentAvailableQuantity ?? r.availableQuantity}
                    </span>{' '}
                    / {r.totalQuantity}
                  </p>
                  <div className="mt-auto flex gap-2 pt-4">
                    <Link
                      to={`/resources/${r.id}`}
                      className="flex-1 text-center py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Details
                    </Link>
                    <Link
                      to={`/book/${r.id}`}
                      className="flex-1 text-center py-2 rounded-lg bg-indigo-600 text-sm font-medium text-white hover:bg-indigo-700"
                    >
                      Book
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {content.length === 0 && (
            <p className="text-center text-gray-500 py-16">No resources match your filters.</p>
          )}

          {totalPages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-4">
              <button
                type="button"
                disabled={page <= 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                className="inline-flex items-center gap-1 px-4 py-2 rounded-lg border border-gray-300 text-sm disabled:opacity-40"
              >
                <FiChevronLeft /> Previous
              </button>
              <span className="text-sm text-gray-600">
                Page {page + 1} of {totalPages}
              </span>
              <button
                type="button"
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
                className="inline-flex items-center gap-1 px-4 py-2 rounded-lg border border-gray-300 text-sm disabled:opacity-40"
              >
                Next <FiChevronRight />
              </button>
            </div>
          )}
        </>
      )}
      </main>
      <Footer />
    </div>
  );
}
