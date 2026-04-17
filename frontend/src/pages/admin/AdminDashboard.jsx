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
import { FiDownload, FiRefreshCw, FiTrash2, FiPlus, FiBox, FiCheckCircle, FiAlertCircle, FiClock } from 'react-icons/fi';
import { toast } from 'sonner';
import {
  adminDeleteResource,
  adminUpdateResourceStatus,
  adminUpdateResource,
  fetchAdminResourcesPage,
  getResourceForecast,
  fetchResourceStats,
  downloadResourceReport,
} from '../../api/adminResourcesApi';
import { createResource } from '../../api/resourcesApi';
import { DEFAULT_USER_ID, RESOURCE_STATUSES, RESOURCE_TYPES } from '../../constants/resources';
import { baseURL } from '../../lib/apiClient';

import api from '../../services/api';
import { Link } from 'react-router-dom';

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
  const [forecasts, setForecasts] = useState({});
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
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
    base64ImageData: '',
  });
  const [editingId, setEditingId] = useState(null);
  const [createError, setCreateError] = useState(null);

  const getFullImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${baseURL}${path}`;
  };

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [all, statsData] = await Promise.all([
        fetchAllAdminResources(),
        fetchResourceStats()
      ]);
      setRows(all);
      setStats(statsData);
      const bookingsRes = await api.get('/api/admin/bookings?status=PENDING&size=10');
      setPendingRequests(bookingsRes.data?.content || []);
      const forecastData = await Promise.all(
        all.map(async (r) => {
          try {
            const f = await getResourceForecast(r.id, 7);
            return { id: r.id, forecast: f };
          } catch (e) {
            return { id: r.id, forecast: 0.0 };
          }
        })
      );
      const forecastMap = {};
      forecastData.forEach(d => { forecastMap[d.id] = d.forecast; });
      setForecasts(forecastMap);
    } catch (e) {
      setError(e?.response?.data?.message || e.message || 'Failed to load admin data');
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
      toast.success('Status updated successfully');
      await load();
    } catch (e) {
      toast.error(e?.response?.data?.message || e.message || 'Update failed');
    } finally {
      setBusyId(null);
    }
  };

  const handleDownloadReport = async () => {
    try {
      await downloadResourceReport();
      toast.success('Report downloaded successfully');
    } catch (e) {
      toast.error('Failed to download report');
    }
  };

  const handleDelete = async (id, name) => {
    toast(`Delete resource "${name}"?`, {
      action: {
        label: 'Delete',
        onClick: async () => {
          setBusyId(id);
          try {
            await adminDeleteResource(id, DEFAULT_USER_ID);
            toast.success('Resource deleted');
            await load();
          } catch (e) {
            toast.error(e?.response?.data?.message || e.message || 'Delete failed');
          } finally {
            setBusyId(null);
          }
        },
      },
      cancel: { label: 'Cancel' },
    });
  };

  const handleEdit = (r) => {
    setEditingId(r.id);
    setCreateForm({
      name: r.name,
      description: r.description || '',
      type: r.type,
      capacity: r.capacity || 1,
      location: r.location,
      totalQuantity: r.totalQuantity || 1,
      status: r.status,
      base64ImageData: '',
    });
    setCreateOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCreateError(null);
    const dto = {
      name: createForm.name.trim(),
      description: createForm.description.trim() || undefined,
      type: createForm.type,
      capacity: Number(createForm.capacity),
      location: createForm.location.trim(),
      totalQuantity: Number(createForm.totalQuantity),
      status: createForm.status,
      base64ImageData: createForm.base64ImageData,
    };

    try {
      if (editingId) {
        await adminUpdateResource(editingId, dto, DEFAULT_USER_ID);
        toast.success('Resource updated successfully');
      } else {
        await createResource(dto, DEFAULT_USER_ID);
        toast.success('Resource created successfully');
      }
      setCreateOpen(false);
      setEditingId(null);
      setCreateForm({
        name: '',
        description: '',
        type: 'LAB',
        capacity: 1,
        location: '',
        totalQuantity: 1,
        status: 'ACTIVE',
        base64ImageData: '',
      });
      await load();
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || (editingId ? 'Update failed' : 'Create failed');
      setCreateError(msg);
      toast.error(msg);
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
            onClick={() => {
              setCreateOpen((v) => !v);
              if (createOpen) setEditingId(null);
            }}
            className="px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-800"
          >
            {createOpen ? (editingId ? 'Cancel Edit' : 'Close form') : 'New resource'}
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
          <button
            type="button"
            onClick={handleDownloadReport}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <FiDownload />
            Export Report
          </button>
        </div>
      </div>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
            <FiBox size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Resources</p>
            <h3 className="text-2xl font-bold text-gray-900">{stats?.totalResources || rows.length}</h3>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <FiCheckCircle size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Currently Active</p>
            <h3 className="text-2xl font-bold text-gray-900">{stats?.activeResources || rows.filter(r => r.status === 'ACTIVE').length}</h3>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
            <FiAlertCircle size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">In Maintenance</p>
            <h3 className="text-2xl font-bold text-gray-900">{stats?.maintenanceResources || rows.filter(r => r.status === 'MAINTENANCE').length}</h3>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
            <FiClock size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Requests</p>
            <h3 className="text-2xl font-bold text-gray-900">{pendingRequests.length}</h3>
          </div>
        </div>
      </section>

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>
      )}

      {createOpen && (
        <form
          onSubmit={handleSubmit}
          className="mb-8 bg-white border border-gray-200 rounded-xl p-6 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <h2 className="md:col-span-2 text-lg font-semibold text-gray-900">
            {editingId ? `Edit resource: ${createForm.name}` : 'Create resource'}
          </h2>
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
            <label className="text-xs font-medium text-gray-500">Resource Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    setCreateForm((f) => ({ ...f, base64ImageData: reader.result }));
                    toast.success('Image selected');
                  };
                  reader.readAsDataURL(file);
                }
              }}
              className="mt-1 w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            />
            {createForm.base64ImageData && (
              <img src={createForm.base64ImageData} alt="Preview" className="mt-2 h-24 rounded-lg object-cover border" />
            )}
          </div>
          <div className="md:col-span-2">
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
            >
              {editingId ? 'Save Changes' : 'Create Resource'}
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

      <section className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden mb-10">
        <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
          <h2 className="font-semibold text-gray-900">Pending Resource Requests ({pendingRequests.length})</h2>
          <Link to="/admin/bookings" className="text-sm text-blue-600 hover:text-blue-800 font-medium">View all requests &rarr;</Link>
        </div>
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading requests…</div>
        ) : pendingRequests.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No pending resource requests.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase">
                <tr>
                  <th className="px-4 py-3">Booking ID</th>
                  <th className="px-4 py-3">Resource Name</th>
                  <th className="px-4 py-3">Start Time</th>
                  <th className="px-4 py-3">End Time</th>
                  <th className="px-4 py-3">Quantity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pendingRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">#{req.id}</td>
                    <td className="px-4 py-3 text-gray-900">{req.resourceName}</td>
                    <td className="px-4 py-3 text-gray-600">{new Date(req.startTime).toLocaleString()}</td>
                    <td className="px-4 py-3 text-gray-600">{new Date(req.endTime).toLocaleString()}</td>
                    <td className="px-4 py-3 text-gray-600">{req.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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
                  <th className="px-4 py-3">Resource</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Location</th>
                  <th className="px-4 py-3">Avail</th>
                  <th className="px-4 py-3">Forecast (7d)</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 w-28">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {r.primaryImageUrl ? (
                          <img src={getFullImageUrl(r.primaryImageUrl)} alt={r.name} className="w-10 h-10 rounded-lg object-cover border" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
                            <FiBox size={18} />
                          </div>
                        )}
                        <span className="font-medium text-gray-900">{r.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{r.type}</td>
                    <td className="px-4 py-3 text-gray-600 max-w-xs truncate">{r.location}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {r.currentAvailableQuantity ?? r.availableQuantity} / {r.totalQuantity}
                    </td>
                    <td className="px-4 py-3 text-indigo-600 font-semibold">
                      {forecasts[r.id] !== undefined ? forecasts[r.id].toFixed(2) : '-'}
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
                    <td className="px-4 py-3 flex gap-3">
                      <button
                        type="button"
                        disabled={busyId === r.id}
                        onClick={() => handleEdit(r)}
                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs font-medium disabled:opacity-40"
                      >
                        Edit
                      </button>
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
