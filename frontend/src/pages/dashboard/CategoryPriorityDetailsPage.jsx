import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ticketApi from '../../api/ticketApi';
import AdminSideNavigation from '../../components/admin/AdminSideNavigation';

const PRIORITY_ORDER = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];

const CategoryPriorityDetailsPage = () => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await ticketApi.listTickets();
        setTickets(Array.isArray(res.data) ? res.data : []);
        setError('');
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load category and priority details');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const categoryStats = useMemo(() => {
    const map = {};
    tickets.forEach((t) => {
      const key = t.category || 'Unknown';
      map[key] = (map[key] || 0) + 1;
    });
    return Object.entries(map)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [tickets]);

  const priorityStats = useMemo(() => {
    const map = {};
    tickets.forEach((t) => {
      const key = t.priority || 'MEDIUM';
      map[key] = (map[key] || 0) + 1;
    });

    return Object.entries(map)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => {
        const ia = PRIORITY_ORDER.indexOf(a.name);
        const ib = PRIORITY_ORDER.indexOf(b.name);
        if (ia === -1 && ib === -1) return b.count - a.count;
        if (ia === -1) return 1;
        if (ib === -1) return -1;
        return ia - ib;
      });
  }, [tickets]);

  const matrix = useMemo(() => {
    const grouped = {};
    tickets.forEach((t) => {
      const category = t.category || 'Unknown';
      const priority = t.priority || 'MEDIUM';
      if (!grouped[category]) grouped[category] = {};
      grouped[category][priority] = (grouped[category][priority] || 0) + 1;
    });
    return grouped;
  }, [tickets]);

  const matrixCategories = Object.keys(matrix).sort();
  const matrixPriorities = Array.from(
    new Set([
      ...PRIORITY_ORDER,
      ...tickets.map((t) => t.priority).filter(Boolean),
    ])
  );

  const downloadJSON = () => {
    const data = {
      summary: {
        totalTickets: tickets.length,
        categories: categoryStats.length,
        priorities: priorityStats.length,
      },
      categoryDetails: categoryStats,
      priorityDetails: priorityStats,
      matrix: matrix,
      exportDate: new Date().toISOString(),
    };
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `category-priority-details-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const downloadCSV = () => {
    let csv = 'Category,Priority,Count\n';
    matrixCategories.forEach((category) => {
      matrixPriorities.forEach((priority) => {
        const count = matrix[category]?.[priority] || 0;
        csv += `"${category}","${priority}",${count}\n`;
      });
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `category-priority-matrix-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSideNavigation activeSection="category-priority" setActiveSection={() => {}} />
      
      <div className="flex-1 max-w-7xl mx-auto p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Category & Priority Details</h1>
            <p className="text-sm text-gray-500 mt-1">Detailed breakdown for ticket categories and priority levels</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={downloadJSON}
              className="px-4 py-2 rounded-lg border bg-blue-50 text-blue-700 hover:bg-blue-100 font-medium text-sm"
              title="Download as JSON"
            >
              ⬇ JSON
            </button>
            <button
              onClick={downloadCSV}
              className="px-4 py-2 rounded-lg border bg-green-50 text-green-700 hover:bg-green-100 font-medium text-sm"
              title="Download as CSV"
            >
              ⬇ CSV
            </button>
            <button
              onClick={() => navigate('/admin/tickets')}
              className="px-4 py-2 rounded-lg border bg-white text-gray-700 hover:bg-gray-50"
            >
              ← Back to Admin Dashboard
            </button>
          </div>
        </div>

      {loading && <p className="text-gray-600">Loading...</p>}
      {error && <p className="text-red-600 mb-4">{error}</p>}

      {!loading && !error && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <SummaryCard title="Total Tickets" value={tickets.length} subtitle="All tickets" />
            <SummaryCard title="Categories" value={categoryStats.length} subtitle="Distinct categories" />
            <SummaryCard title="Priority Levels" value={priorityStats.length} subtitle="Distinct priorities" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            <div className="bg-white border rounded-lg p-4 shadow-sm">
              <p className="text-base font-semibold text-gray-900 mb-3">Category Details</p>
              {categoryStats.length === 0 ? (
                <p className="text-sm text-gray-500">No category data available.</p>
              ) : (
                <div className="space-y-2">
                  {categoryStats.map((item) => (
                    <div key={item.name} className="flex items-center justify-between border rounded p-2 bg-gray-50">
                      <span className="text-sm font-medium text-gray-800">{item.name}</span>
                      <span className="text-sm font-semibold text-blue-700">{item.count}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white border rounded-lg p-4 shadow-sm">
              <p className="text-base font-semibold text-gray-900 mb-3">Priority Details</p>
              {priorityStats.length === 0 ? (
                <p className="text-sm text-gray-500">No priority data available.</p>
              ) : (
                <div className="space-y-2">
                  {priorityStats.map((item) => (
                    <div key={item.name} className="flex items-center justify-between border rounded p-2 bg-gray-50">
                      <span className="text-sm font-medium text-gray-800">{item.name}</span>
                      <span className="text-sm font-semibold text-orange-700">{item.count}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="bg-white border rounded-lg p-4 shadow-sm overflow-x-auto">
            <p className="text-base font-semibold text-gray-900 mb-3">Category x Priority Matrix</p>
            <table className="min-w-full text-sm border-collapse">
              <thead>
                <tr>
                  <th className="text-left p-2 border bg-gray-50">Category</th>
                  {matrixPriorities.map((priority) => (
                    <th key={priority} className="text-center p-2 border bg-gray-50">{priority}</th>
                  ))}
                  <th className="text-center p-2 border bg-gray-100">Total</th>
                </tr>
              </thead>
              <tbody>
                {matrixCategories.map((category) => {
                  const rowTotal = matrixPriorities.reduce((sum, p) => sum + (matrix[category]?.[p] || 0), 0);
                  return (
                    <tr key={category}>
                      <td className="p-2 border font-medium">{category}</td>
                      {matrixPriorities.map((priority) => (
                        <td key={`${category}-${priority}`} className="p-2 border text-center">
                          {matrix[category]?.[priority] || 0}
                        </td>
                      ))}
                      <td className="p-2 border text-center font-semibold">{rowTotal}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
      </div>
    </div>
  );
};

const SummaryCard = ({ title, value, subtitle }) => (
  <div className="bg-white border rounded-lg p-4 shadow-sm">
    <p className="text-sm font-semibold text-gray-700">{title}</p>
    <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
    <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
  </div>
);

export default CategoryPriorityDetailsPage;
