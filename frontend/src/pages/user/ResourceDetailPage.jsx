import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FiArrowLeft, FiMapPin, FiHeart } from 'react-icons/fi';
import { fetchResourceById } from '../../api/resourcesApi';
import { DEFAULT_USER_ID, RESOURCE_TYPES } from '../../constants/resources';
import { checkIsFavorite, addFavorite, removeFavorite } from '../../api/favoritesApi';
import { baseURL } from '../../lib/apiClient';
import { toast } from 'sonner';

function typeLabel(value) {
  return RESOURCE_TYPES.find((t) => t.value === value)?.label || value;
}

export default function ResourceDetailPage() {
  const { id } = useParams();
  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favLoading, setFavLoading] = useState(false);

  const getFullImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${baseURL}${path}`;
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [res, isFav] = await Promise.all([
          fetchResourceById(id, DEFAULT_USER_ID),
          checkIsFavorite(DEFAULT_USER_ID, id).catch(() => false)
        ]);
        if (!cancelled) {
          setResource(res);
          setIsFavorite(isFav);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e?.response?.status === 404 ? 'Resource not found.' : e.message || 'Failed to load');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-16 text-center text-gray-500">Loading…</main>
    );
  }
  if (error || !resource) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-16">
        <p className="text-red-600">{error || 'Not found'}</p>
        <Link to="/resources" className="mt-4 inline-block text-blue-600 text-sm">
          ← Back to resources
        </Link>
      </main>
    );
  }

  const handleToggleFavorite = async () => {
    setFavLoading(true);
    try {
      if (isFavorite) {
        await removeFavorite(DEFAULT_USER_ID, id);
        setIsFavorite(false);
        toast.success('Removed from favorites');
      } else {
        await addFavorite(DEFAULT_USER_ID, id);
        setIsFavorite(true);
        toast.success('Added to favorites');
      }
    } catch (err) {
      console.error('Failed to toggle favorite', err);
    } finally {
      setFavLoading(false);
    }
  };

  const maintenance = resource.recentMaintenanceIssues || [];

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link
        to="/resources"
        className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 mb-6"
      >
        <FiArrowLeft /> All resources
      </Link>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{resource.name}</h1>
            <p className="text-sm text-gray-500 mt-1">{typeLabel(resource.type)}</p>
            <p className="text-sm text-gray-600 mt-3 flex items-start gap-2">
              <FiMapPin className="mt-0.5 shrink-0" />
              {resource.location}
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0 mt-4 sm:mt-0">
            <button
              onClick={handleToggleFavorite}
              disabled={favLoading}
              className={`p-2.5 rounded-lg border transition-colors ${isFavorite
                  ? 'border-red-200 bg-red-50 text-red-600 hover:bg-red-100'
                  : 'border-gray-200 bg-white text-gray-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50'
                }`}
              title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <FiHeart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
            </button>
            <Link
              to={`/resources/${resource.id}/book`}
              className="inline-flex justify-center px-5 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700"
            >
              Book
            </Link>
          </div>
        </div>
        <div className="p-6 space-y-4 text-sm text-gray-700">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500">Description</h2>
            <p className="mt-1">{resource.description || '—'}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500">Status</h2>
              <p className="mt-1">{resource.status}</p>
            </div>
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500">Capacity</h2>
              <p className="mt-1">{resource.capacity}</p>
            </div>
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500">Available qty</h2>
              <p className="mt-1">{resource.currentAvailableQuantity ?? resource.availableQuantity}</p>
            </div>
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500">Total qty</h2>
              <p className="mt-1">{resource.totalQuantity}</p>
            </div>
          </div>
          {resource.primaryImageUrl && (
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500">Image</h2>
              <img
                src={getFullImageUrl(resource.primaryImageUrl)}
                alt=""
                className="mt-2 max-h-48 rounded-lg border border-gray-200"
              />
            </div>
          )}
        </div>
      </div>

      <section className="mt-8 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900">Recent maintenance</h2>
        <p className="text-xs text-gray-500 mt-1">
          Included on <code className="bg-gray-100 px-1 rounded">GET /api/resources/{'{id}'}</code>
        </p>
        {maintenance.length === 0 ? (
          <p className="text-sm text-gray-500 mt-4">No recent maintenance records.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {maintenance.map((m) => (
              <li key={m.id} className="text-sm border border-gray-100 rounded-lg p-3 bg-gray-50">
                <span className="font-medium text-gray-800">{m.status}</span>
                {m.priority && <span className="text-gray-500"> · {m.priority}</span>}
                <p className="text-gray-600 mt-1">{m.issueDescription}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
