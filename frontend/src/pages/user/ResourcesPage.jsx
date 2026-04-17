import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiChevronLeft, FiChevronRight, FiMapPin, FiSearch, FiBox } from 'react-icons/fi';
import { fetchResourcesPage } from '../../api/resourcesApi';
import { DEFAULT_USER_ID, RESOURCE_STATUSES, RESOURCE_TYPES } from '../../constants/resources';
import { baseURL } from '../../lib/apiClient';
import heroCampus from '../../assets/hero-campus.jpg';

function typeLabel(value) {
  return RESOURCE_TYPES.find((t) => t.value === value)?.label || value;
}

function statusBadge(status) {
  const map = {
    ACTIVE: 'bg-emerald-500 text-white',
    OUT_OF_SERVICE: 'bg-red-500 text-white',
    UNDER_REVIEW: 'bg-amber-500 text-white',
    MAINTENANCE: 'bg-blue-500 text-white',
  };
  return map[status] || 'bg-gray-500 text-white';
}

export default function ResourcesPage() {
  const [page, setPage] = useState(0);
  const [size] = useState(100);
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

  const getFullImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${baseURL}${path}`;
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Hero Section */}
      <section className="relative h-[480px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src={heroCampus} 
            alt="Campus" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 to-indigo-900/60" />
        </div>

        <div className="relative z-10 w-full max-w-4xl px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4 tracking-tight">
            University Asset Hub
          </h1>
          <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
            Access premium labs, equipment, and learning spaces instantly.
          </p>

          <form 
            onSubmit={applyFilters}
            className="flex flex-col md:flex-row items-stretch bg-white rounded-2xl md:rounded-full p-2 shadow-2xl max-w-3xl mx-auto gap-2"
          >
            <div className="flex-1 flex items-center px-4 gap-3 border-b md:border-b-0 md:border-r border-gray-100">
              <FiSearch className="text-gray-400" size={20} />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="What are you looking for? (e.g. AR/VR Lab)"
                className="w-full py-3 text-sm focus:outline-none placeholder:text-gray-400 bg-white text-gray-900"
                style={{ colorScheme: 'light' }}
              />
            </div>
            <div className="flex items-center px-4 gap-2 border-b md:border-b-0 md:border-r border-gray-100">
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="bg-transparent py-3 text-sm font-medium text-gray-700 focus:outline-none"
              >
                <option value="">All Assets</option>
                {RESOURCE_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center px-4 gap-2 border-b md:border-b-0 md:border-r border-gray-100">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="bg-transparent py-3 text-sm font-medium text-gray-700 focus:outline-none"
              >
                <option value="">All Statuses</option>
                {RESOURCE_STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="bg-blue-600 text-white px-8 py-3 rounded-xl md:rounded-full text-sm font-bold hover:bg-blue-700 transition-colors shadow-lg"
            >
              Search Now
            </button>
          </form>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-3xl font-bold text-gray-900">Discover Resources</h2>
          <div className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-full text-xs font-bold border border-indigo-100">
            <FiBox size={14} />
            {data?.totalElements || 0} Items Available
          </div>
        </div>

        {/* Filter Tags (Optional, but adds a premium feel) */}
        <div className="flex flex-wrap gap-2 mb-10">
          <button 
            onClick={() => { setType(''); setPage(0); }}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${!type ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-100'}`}
          >
            All
          </button>
          {RESOURCE_TYPES.map(t => (
            <button 
              key={t.value}
              onClick={() => { setType(t.value); setPage(0); }}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${type === t.value ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-100'}`}
            >
              {t.label}
            </button>
          ))}
        </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-20 text-gray-500">Loading…</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {content.map((r) => (
              <article
                key={r.id}
                className="group bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col"
              >
                {/* Image Container with Badge Overlay */}
                <div className="relative h-60 overflow-hidden">
                  {r.primaryImageUrl ? (
                    <img
                      src={getFullImageUrl(r.primaryImageUrl)}
                      alt={r.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
                      No Image available
                    </div>
                  )}
                  <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-lg ${statusBadge(r.status)}`}>
                    {r.status?.replace(/_/g, ' ')}
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col">
                  {/* Info Row: Type and Capacity */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-[0.2em]">
                      {typeLabel(r.type)}
                    </span>
                    <span className="text-xs text-gray-500 flex items-center gap-1.5 font-medium">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      {r.capacity} Max
                    </span>
                  </div>

                  <h2 className="text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                    {r.name}
                  </h2>

                  <div className="flex items-center gap-2 mt-3 text-gray-500">
                    <FiMapPin className="text-indigo-500" />
                    <span className="text-sm font-medium">{r.location || 'Central Campus'}</span>
                  </div>

                  <div className="mt-6">
                    <Link
                      to={`/resources/${r.id}`}
                      className="block w-full text-center py-3 rounded-xl border border-indigo-100 bg-indigo-50/50 text-indigo-700 text-sm font-bold hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all duration-300"
                    >
                      Explore Resource &rarr;
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
    </div>
  );
}
