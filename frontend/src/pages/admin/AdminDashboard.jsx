import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { FiRefreshCw, FiTrash2 } from 'react-icons/fi';
import {
  adminDeleteResource,
  adminUpdateResourceStatus,
  fetchAdminResourcesPage,
} from '../../api/adminResourcesApi';
import { createResource } from '../../api/resourcesApi';
import { DEFAULT_USER_ID, RESOURCE_STATUSES, RESOURCE_TYPES } from '../../constants/resources';

const PIE_COLORS = ['#4f46e5', '#0d9488', '#ea580c', '#64748b', '#ca8a04', '#9333ea', '#db2777'];

function aggregate(rows, keyFn) {
  const map = new Map();
  for (const r of rows) {
    const k = keyFn(r);
    map.set(k, (map.get(k) || 0) + 1);
  }
  return [...map.entries()].map(([name, value]) => ({ name, value }));
}

async function fetchAllAdminResources() {
  const pageSize = 200;
  const first = await fetchAdminResourcesPage({ page: 0, size: pageSize, userId: DEFAULT_USER_ID });
  let all = [...(first.content || [])];
  for (let p = 1; p < (first.totalPages || 0); p += 1) {
    const next = await fetchAdminResourcesPage({ page: p, size: pageSize, userId: DEFAULT_USER_ID });
    all = all.concat(next.content || []);
  }
  return all;
}

export default function AdminDashboard() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: '',
    description: '',
    type: 'LAB',
    capacity: 1,
    location: '',
    totalQuantity: 1,
    status: 'ACTIVE',
  });
  const [createError, setCreateError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const all = await fetchAllAdminResources();
      setRows(all);
    } catch (e) {
      setError(e?.response?.data?.message || e.message || 'Failed to load admin resources');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const byStatus = useMemo(() => aggregate(rows, (r) => r.status || 'UNKNOWN'), [rows]);
  const byType = useMemo(() => aggregate(rows, (r) => r.type || 'UNKNOWN'), [rows]);

  const handleStatusChange = async (id, status) => {
    setBusyId(id);
    try {
      await adminUpdateResourceStatus(id, status, DEFAULT_USER_ID);
      await load();
    } catch (e) {
      alert(e?.response?.data?.message || e.message || 'Update failed');
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete resource "${name}"? This calls DELETE /api/admin/resources/${id}`)) return;
    setBusyId(id);
    try {
      await adminDeleteResource(id, DEFAULT_USER_ID);
      await load();
    } catch (e) {
      alert(e?.response?.data?.message || e.message || 'Delete failed');
    } finally {
      setBusyId(null);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreateError(null);
    try {
      await createResource(
        {
          name: createForm.name.trim(),
          description: createForm.description.trim() || undefined,
          type: createForm.type,
          capacity: Number(createForm.capacity),
          location: createForm.location.trim(),
          totalQuantity: Number(createForm.totalQuantity),
          status: createForm.status,
        },
        DEFAULT_USER_ID
      );
      setCreateOpen(false);
      setCreateForm({
        name: '',
        description: '',
        type: 'LAB',
        capacity: 1,
        location: '',
        totalQuantity: 1,
        status: 'ACTIVE',
      });
      await load();
    } catch (err) {
      setCreateError(err?.response?.data?.message || err.message || 'Create failed');
    }
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin · Resources</h1>
          <p className="text-sm text-gray-600 mt-1">
            Uses <code className="bg-gray-100 px-1 rounded text-xs">GET/PATCH/DELETE /api/admin/resources</code> and{' '}
            <code className="bg-gray-100 px-1 rounded text-xs">POST /api/resources</code> for new items.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setCreateOpen((v) => !v)}
            className="px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-800"
          >
            {createOpen ? 'Close form' : 'New resource'}
          </button>
          <button
            type="button"
            onClick={load}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            <FiRefreshCw className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>
      )}

      {createOpen && (
        <form
          onSubmit={handleCreate}
          className="mb-8 bg-white border border-gray-200 rounded-xl p-6 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <h2 className="md:col-span-2 text-lg font-semibold text-gray-900">Create resource</h2>
          {createError && (
            <p className="md:col-span-2 text-sm text-red-600">{createError}</p>
          )}
          <div>
            <label className="text-xs font-medium text-gray-500">Name *</label>
            <input
              required
              value={createForm.name}
              onChange={(e) => setCreateForm((f) => ({ ...f, name: e.target.value }))}
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500">Location *</label>
            <input
              required
              value={createForm.location}
              onChange={(e) => setCreateForm((f) => ({ ...f, location: e.target.value }))}
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div className="md:col-span-2">
            <label className="text-xs font-medium text-gray-500">Description</label>
            <textarea
              value={createForm.description}
              onChange={(e) => setCreateForm((f) => ({ ...f, description: e.target.value }))}
              rows={2}
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500">Type *</label>
            <select
              value={createForm.type}
              onChange={(e) => setCreateForm((f) => ({ ...f, type: e.target.value }))}
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              {RESOURCE_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500">Status *</label>
            <select
              value={createForm.status}
              onChange={(e) => setCreateForm((f) => ({ ...f, status: e.target.value }))}
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              {RESOURCE_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500">Capacity *</label>
            <input
              type="number"
              min={1}
              required
              value={createForm.capacity}
              onChange={(e) => setCreateForm((f) => ({ ...f, capacity: e.target.value }))}
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500">Total quantity *</label>
            <input
              type="number"
              min={1}
              required
              value={createForm.totalQuantity}
              onChange={(e) => setCreateForm((f) => ({ ...f, totalQuantity: e.target.value }))}
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div className="md:col-span-2">
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
            >
              POST /api/resources
            </button>
          </div>
        </form>
      )}

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm h-80">
          <h2 className="text-sm font-semibold text-gray-800 mb-2">Resources by status</h2>
          <p className="text-xs text-gray-500 mb-2">Derived from loaded admin list (no separate analytics endpoint).</p>
          <ResponsiveContainer width="100%" height="85%">
            <PieChart>
              <Pie dataKey="value" data={byStatus} nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                {byStatus.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm h-80">
          <h2 className="text-sm font-semibold text-gray-800 mb-2">Resources by type</h2>
          <ResponsiveContainer width="100%" height="85%">
            <BarChart data={byType}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-20} textAnchor="end" height={60} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" fill="#4f46e5" name="Count" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
          <h2 className="font-semibold text-gray-900">All resources ({rows.length})</h2>
        </div>
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading…</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Location</th>
                  <th className="px-4 py-3">Avail</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 w-28">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{r.name}</td>
                    <td className="px-4 py-3 text-gray-600">{r.type}</td>
                    <td className="px-4 py-3 text-gray-600 max-w-xs truncate">{r.location}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {r.currentAvailableQuantity ?? r.availableQuantity} / {r.totalQuantity}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={r.status}
                        disabled={busyId === r.id}
                        onChange={(e) => handleStatusChange(r.id, e.target.value)}
                        className="border border-gray-300 rounded-md px-2 py-1 text-xs"
                      >
                        {RESOURCE_STATUSES.map((s) => (
                          <option key={s.value} value={s.value}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        disabled={busyId === r.id}
                        onClick={() => handleDelete(r.id, r.name)}
                        className="inline-flex items-center gap-1 text-red-600 hover:text-red-800 text-xs font-medium disabled:opacity-40"
                      >
                        <FiTrash2 /> Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
