import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ticketApi from '../../api/ticketApi';
import authApi from '../../api/authApi';
import { formatCategoryDisplay } from '../../utils/ticketCategories';

const AdminTicket = () => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [selectedTechByTicket, setSelectedTechByTicket] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedTickets, setExpandedTickets] = useState({});
  const [selectedStatus, setSelectedStatus] = useState({});
  const [resolutionNotes, setResolutionNotes] = useState({});
  const [rejectionReasons, setRejectionReasons] = useState({});
  const [deadlineByTicket, setDeadlineByTicket] = useState({});
  const [warningByTicket, setWarningByTicket] = useState({});
  const [expandedSections, setExpandedSections] = useState({});
  const [chartPeriod, setChartPeriod] = useState('WEEK');
  const [reportPeriod, setReportPeriod] = useState('MONTH');
  const [reportData, setReportData] = useState([]);
  const [selectedTechnicianId, setSelectedTechnicianId] = useState(null);
  const [activeTopView, setActiveTopView] = useState('OVERVIEW');

  const STATUSES = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REJECTED'];
  const STATUS_COLORS = {
    OPEN: 'bg-blue-100 text-blue-800',
    IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
    RESOLVED: 'bg-green-100 text-green-800',
    CLOSED: 'bg-gray-100 text-gray-800',
    REJECTED: 'bg-red-100 text-red-800',
  };

  const CHART_COLORS = ['#3B82F6', '#F59E0B', '#10B981', '#6B7280', '#EF4444', '#8B5CF6', '#14B8A6', '#F97316'];

  const buildFallbackReportData = (period) => {
    const grouped = tickets.reduce((acc, ticket) => {
      if (!ticket?.createdAt) return acc;
      const createdAt = new Date(ticket.createdAt);
      if (Number.isNaN(createdAt.getTime())) return acc;

      const key = period === 'MONTH'
        ? `${createdAt.getFullYear()}-${String(createdAt.getMonth() + 1).padStart(2, '0')}`
        : `${createdAt.getFullYear()}`;

      const label = period === 'MONTH'
        ? createdAt.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
        : `${createdAt.getFullYear()}`;

      if (!acc[key]) {
        acc[key] = {
          periodKey: key,
          periodLabel: label,
          totalTickets: 0,
          openTickets: 0,
          inProgressTickets: 0,
          resolvedTickets: 0,
          closedTickets: 0,
          rejectedTickets: 0,
        };
      }

      acc[key].totalTickets += 1;
      if (ticket.status === 'OPEN') acc[key].openTickets += 1;
      if (ticket.status === 'IN_PROGRESS') acc[key].inProgressTickets += 1;
      if (ticket.status === 'RESOLVED') acc[key].resolvedTickets += 1;
      if (ticket.status === 'CLOSED') acc[key].closedTickets += 1;
      if (ticket.status === 'REJECTED') acc[key].rejectedTickets += 1;

      return acc;
    }, {});

    return Object.values(grouped).sort((a, b) => String(a.periodKey).localeCompare(String(b.periodKey)));
  };

  const load = async () => {
    setLoading(true);
    try {
      const res = await ticketApi.listTickets();
      setTickets(Array.isArray(res.data) ? res.data : []);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();

    const loadTechnicians = async () => {
      try {
        const res = await authApi.getTechnicians();
        setTechnicians(Array.isArray(res.data) ? res.data : []);
      } catch {
        setTechnicians([]);
      }
    };

    loadTechnicians();
  }, []);

  useEffect(() => {
    const loadReports = async () => {
      try {
        const currentYear = new Date().getFullYear();
        const res = reportPeriod === 'MONTH'
          ? await ticketApi.getMonthlyReports(currentYear)
          : await ticketApi.getYearlyReports();
        const apiRows = Array.isArray(res.data) ? res.data : [];
        if (apiRows.length > 0) {
          setReportData(apiRows);
          setError('');
          return;
        }
        setReportData(buildFallbackReportData(reportPeriod));
      } catch (err) {
        setReportData(buildFallbackReportData(reportPeriod));
      }
    };

    loadReports();
  }, [reportPeriod, tickets]);

  const assign = async (ticketId) => {
    const technicianId = selectedTechByTicket[ticketId];
    if (!technicianId) {
      setError('Please select a technician first');
      return;
    }
    try {
      await ticketApi.assignTechnician(ticketId, Number(technicianId));
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to assign technician');
    }
  };

  const updateStatus = async (ticketId, newStatus) => {
    try {
      if (newStatus === 'REJECTED') {
        const reason = rejectionReasons[ticketId] || '';
        if (!reason.trim()) {
          setError('Rejection reason is required');
          return;
        }
        await ticketApi.adminUpdateStatus(ticketId, newStatus, reason);
      } else {
        await ticketApi.adminUpdateStatus(ticketId, newStatus, '');
      }
      load();
      setExpandedTickets((prev) => ({ ...prev, [ticketId]: false }));
      setSelectedStatus((prev) => ({ ...prev, [ticketId]: '' }));
      setResolutionNotes((prev) => ({ ...prev, [ticketId]: '' }));
      setRejectionReasons((prev) => ({ ...prev, [ticketId]: '' }));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status');
    }
  };

  const saveDeadline = async (ticketId) => {
    const expectedCompletionAt = deadlineByTicket[ticketId];
    const warningMessage = warningByTicket[ticketId] || '';
    const now = new Date();
    const maxAllowed = new Date();
    maxAllowed.setMonth(maxAllowed.getMonth() + 1);

    if (!expectedCompletionAt) {
      setError('Please select expected completion date and time');
      return;
    }

    const selectedDate = new Date(expectedCompletionAt);
    if (Number.isNaN(selectedDate.getTime()) || selectedDate <= now) {
      setError('Please select an upcoming date and time');
      return;
    }

    if (selectedDate > maxAllowed) {
      setError('Deadline must be within one month from now');
      return;
    }

    try {
      await ticketApi.setTicketDeadline(ticketId, expectedCompletionAt, warningMessage);
      setError('');
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save deadline and warning');
    }
  };

  const groupTicketsByCategoryAndPriority = () => {
    const grouped = {};
    const priorityOrder = { 'CRITICAL': 0, 'HIGH': 1, 'MEDIUM': 2, 'LOW': 3 };

    tickets.forEach((ticket) => {
      const category = ticket.category || 'Unknown';
      if (!grouped[category]) {
        grouped[category] = {};
      }
      const priority = ticket.priority || 'MEDIUM';
      if (!grouped[category][priority]) {
        grouped[category][priority] = [];
      }
      grouped[category][priority].push(ticket);
    });

    return grouped;
  };

  const formatLocationCategory = (category) => {
    switch (category) {
      case 'MAIN_BUILDING':
        return 'Main Building';
      case 'ENGINEERING_BUILDING':
        return 'Engineering Building';
      case 'BUSINESS_MANAGEMENT_BUILDING':
        return 'Business Management Building';
      case 'OTHER':
        return 'Other';
      default:
        return category || '-';
    }
  };

  const getImageSrc = (fileUrl) => {
    if (!fileUrl) return '';
    if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) return fileUrl;
    return fileUrl.startsWith('/') ? fileUrl : `/${fileUrl}`;
  };

  const toDateTimeLocalValue = (dateValue) => {
    if (!dateValue) return '';
    const dt = new Date(dateValue);
    if (Number.isNaN(dt.getTime())) return '';
    const pad = (num) => String(num).padStart(2, '0');
    return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
  };

  const getDeadlineMinMax = () => {
    const now = new Date();
    const max = new Date();
    max.setMonth(max.getMonth() + 1);
    return {
      min: toDateTimeLocalValue(now),
      max: toDateTimeLocalValue(max),
    };
  };

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const toggleTicket = (ticketId) => {
    setExpandedTickets((prev) => ({
      ...prev,
      [ticketId]: !prev[ticketId],
    }));
  };

  const groupedTickets = groupTicketsByCategoryAndPriority();

  const isWithinCurrentWeek = (dateValue) => {
    if (!dateValue) return false;
    const d = new Date(dateValue);
    if (Number.isNaN(d.getTime())) return false;

    const now = new Date();
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    const day = start.getDay();
    const diff = day === 0 ? 6 : day - 1;
    start.setDate(start.getDate() - diff);

    const end = new Date(start);
    end.setDate(start.getDate() + 7);

    return d >= start && d < end;
  };

  const isWithinCurrentMonth = (dateValue) => {
    if (!dateValue) return false;
    const d = new Date(dateValue);
    if (Number.isNaN(d.getTime())) return false;

    const now = new Date();
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  };

  const isInSelectedPeriod = (ticket) => {
    if (chartPeriod === 'MONTH') {
      return isWithinCurrentMonth(ticket.createdAt);
    }
    return isWithinCurrentWeek(ticket.createdAt);
  };

  const ticketHasTechnician = (ticket, technicianId) => {
    if (!ticket || technicianId == null) return false;
    if (Number(ticket.assignedTechnicianId) === Number(technicianId)) return true;
    if (!ticket.additionalTechnicianIds) return false;
    return String(ticket.additionalTechnicianIds)
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean)
      .some((value) => Number(value) === Number(technicianId));
  };

  const periodLabel = chartPeriod === 'MONTH' ? 'This Month' : 'This Week';
  const periodTickets = tickets.filter(isInSelectedPeriod);

  const categoriesCount = new Set(tickets.map((t) => t.category).filter(Boolean)).size;
  const prioritiesCount = new Set(tickets.map((t) => t.priority).filter(Boolean)).size;
  const activeProgressCount = tickets.filter((t) => t.status === 'IN_PROGRESS').length;

  const statusChartData = STATUSES
    .map((status, idx) => {
      const count = periodTickets.filter((t) => t.status === status).length;
      return {
        label: status,
        value: count,
        color: CHART_COLORS[idx % CHART_COLORS.length],
      };
    })
    .filter((item) => item.value > 0);

  const technicianProgressMap = periodTickets.reduce((acc, ticket) => {
    const techIds = [
      ticket.assignedTechnicianId,
      ...(ticket.additionalTechnicianIds ? String(ticket.additionalTechnicianIds).split(',').map((value) => value.trim()).filter(Boolean) : []),
    ].filter(Boolean);

    techIds.forEach((techId, index) => {
      const name = index === 0
        ? (ticket.assignedTechnicianName || `Technician #${techId}`)
        : `Technician #${techId}`;
      const idKey = String(techId);

      if (!acc[idKey]) {
        acc[idKey] = {
          id: idKey,
          name,
          assigned: 0,
          completed: 0,
        };
      }

      acc[idKey].assigned += 1;
      if (ticket.status === 'RESOLVED' || ticket.status === 'CLOSED') {
        acc[idKey].completed += 1;
      }
    });

    return acc;
  }, {});

  const technicianProgressData = Object.values(technicianProgressMap)
    .map((item, idx) => ({
      ...item,
      progressPercent: item.assigned > 0 ? Math.round((item.completed / item.assigned) * 100) : 0,
      label: item.name,
      value: item.assigned,
      color: CHART_COLORS[idx % CHART_COLORS.length],
    }))
    .sort((a, b) => b.assigned - a.assigned);

  const technicianDirectory = technicians.reduce((acc, tech) => {
    acc[String(tech.id)] = {
      id: tech.id,
      username: tech.username,
      displayName: tech.displayName || tech.username,
    };
    return acc;
  }, {});

  tickets.forEach((ticket) => {
    if (!ticket.assignedTechnicianId) return;
    const key = String(ticket.assignedTechnicianId);
    if (!technicianDirectory[key]) {
      technicianDirectory[key] = {
        id: ticket.assignedTechnicianId,
        username: ticket.assignedTechnicianName || `technician-${ticket.assignedTechnicianId}`,
        displayName: ticket.assignedTechnicianName || `Technician #${ticket.assignedTechnicianId}`,
      };
    }
  });

  const technicianNavItems = Object.values(technicianDirectory).sort((a, b) => String(a.displayName).localeCompare(String(b.displayName)));

  const selectedTechnicianJobs = selectedTechnicianId == null
    ? []
    : tickets.filter((t) => ticketHasTechnician(t, selectedTechnicianId));

  const selectedTechnicianWeeklyJobs = selectedTechnicianJobs.filter((t) => isWithinCurrentWeek(t.createdAt));

  const selectedTechnicianWeekChartData = STATUSES
    .map((status, idx) => {
      const count = selectedTechnicianWeeklyJobs.filter((t) => t.status === status).length;
      return {
        label: status,
        value: count,
        color: CHART_COLORS[idx % CHART_COLORS.length],
      };
    })
    .filter((item) => item.value > 0);

  const selectedTechnicianCompletedWeek = selectedTechnicianWeeklyJobs.filter(
    (t) => t.status === 'RESOLVED' || t.status === 'CLOSED'
  ).length;

  const selectedTechnicianWeekProgress = selectedTechnicianWeeklyJobs.length > 0
    ? Math.round((selectedTechnicianCompletedWeek / selectedTechnicianWeeklyJobs.length) * 100)
    : 0;

  const selectedTechnician = selectedTechnicianId != null
    ? technicianDirectory[String(selectedTechnicianId)]
    : null;

  const reportChartData = reportData.map((item, idx) => ({
    label: item.periodLabel || item.periodKey || `Period ${idx + 1}`,
    value: Number(item.totalTickets || 0),
    color: CHART_COLORS[idx % CHART_COLORS.length],
  }));

  const reportTotals = reportData.reduce((acc, item) => {
    acc.total += Number(item.totalTickets || 0);
    acc.open += Number(item.openTickets || 0);
    acc.inProgress += Number(item.inProgressTickets || 0);
    acc.resolved += Number(item.resolvedTickets || 0);
    acc.closed += Number(item.closedTickets || 0);
    acc.rejected += Number(item.rejectedTickets || 0);
    return acc;
  }, { total: 0, open: 0, inProgress: 0, resolved: 0, closed: 0, rejected: 0 });

  const reportTitle = reportPeriod === 'MONTH'
    ? `Monthly Ticket Reports (${new Date().getFullYear()})`
    : 'Yearly Ticket Reports';

  const handleSelectTechnician = (techId) => {
    setSelectedTechnicianId(techId);
    if (techId != null) {
      setActiveTopView('TECHNICIAN_DETAILS');
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Ticket Dashboard</h1>
      {loading && <p className="text-gray-600">Loading...</p>}
      {error && <p className="text-red-600 mb-4">{error}</p>}

      <div className="bg-white border rounded-lg p-4 shadow-sm mb-6">
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => setActiveTopView('OVERVIEW')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold border ${activeTopView === 'OVERVIEW' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
          >
            Dashboard Overview
          </button>
          <button
            onClick={() => setActiveTopView('TECHNICIAN_DETAILS')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold border ${activeTopView === 'TECHNICIAN_DETAILS' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
          >
            Technician Details
          </button>
          <button
            onClick={() => navigate('/admin/category-priority')}
            className="px-4 py-2 rounded-lg text-sm font-semibold border bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
          >
            Category & Priority Details
          </button>
          <button
            onClick={() => navigate('/admin/bottom-details')}
            className="px-4 py-2 rounded-lg text-sm font-semibold border bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
          >
            More Details Page
          </button>
          <button
            onClick={() => navigate('/admin/assign-technicians')}
            className="px-4 py-2 rounded-lg text-sm font-semibold border bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
          >
            Assign Technicians
          </button>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-3">
          

          <div className="inline-flex rounded-lg border overflow-hidden w-fit">
            <button
              onClick={() => setChartPeriod('WEEK')}
              className={`px-4 py-2 text-sm font-semibold ${chartPeriod === 'WEEK' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
            >
              Weekly
            </button>
            <button
              onClick={() => setChartPeriod('MONTH')}
              className={`px-4 py-2 text-sm font-semibold border-l ${chartPeriod === 'MONTH' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
            >
              Monthly
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleSelectTechnician(null)}
            className={`px-3 py-1.5 rounded-full text-sm border ${selectedTechnicianId == null ? 'bg-gray-800 text-white border-gray-800' : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'}`}
          >
            All Technicians
          </button>
          {technicianNavItems.map((tech) => (
            <button
              key={tech.id}
              onClick={() => handleSelectTechnician(tech.id)}
              className={`px-3 py-1.5 rounded-full text-sm border ${Number(selectedTechnicianId) === Number(tech.id) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'}`}
            >
              {tech.displayName}
            </button>
          ))}
        </div>
      </div>

      {activeTopView === 'OVERVIEW' && (
      <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <SummaryCard
          title="Categorize"
          value={categoriesCount}
          subtitle="Total ticket categories"
          badgeClass="bg-blue-100 text-blue-700"
        />
        <SummaryCard
          title="Priority Level"
          value={prioritiesCount}
          subtitle="Priority types in use"
          badgeClass="bg-orange-100 text-orange-700"
        />
        <SummaryCard
          title="Progress Level"
          value={activeProgressCount}
          subtitle="Tickets currently in progress"
          badgeClass="bg-green-100 text-green-700"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <PieChartCard
          title="Progress by Ticket Status"
          subtitle={`${periodLabel} - Open, in progress, resolved, closed, rejected`}
          data={statusChartData}
          centerLabel={`${periodTickets.length}`}
          centerSubLabel={periodLabel}
        />
        <LineChartCard
          title="Technician Progress Level"
          subtitle={`${periodLabel} - Completion percentage by technician`}
          data={technicianProgressData}
          xLabel="Technicians"
          yLabel="Completion %"
        />
      </div>

      <div className="bg-white border rounded-lg p-4 shadow-sm mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-4">
          <div>
            <p className="text-lg font-semibold text-gray-900">{reportTitle}</p>
            <p className="text-sm text-gray-600">SQL-backed monthly and yearly ticket totals from the tickets table.</p>
          </div>
          <div className="inline-flex rounded-lg border overflow-hidden w-fit">
            <button
              onClick={() => setReportPeriod('MONTH')}
              className={`px-4 py-2 text-sm font-semibold ${reportPeriod === 'MONTH' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setReportPeriod('YEAR')}
              className={`px-4 py-2 text-sm font-semibold border-l ${reportPeriod === 'YEAR' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
            >
              Yearly
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <SummaryCard
            title="Total Tickets"
            value={reportTotals.total}
            subtitle="Across selected period"
            badgeClass="bg-slate-100 text-slate-700"
          />
          <SummaryCard
            title="Resolved + Closed"
            value={reportTotals.resolved + reportTotals.closed}
            subtitle="Completed work items"
            badgeClass="bg-green-100 text-green-700"
          />
          <SummaryCard
            title="Open + In Progress"
            value={reportTotals.open + reportTotals.inProgress}
            subtitle="Outstanding work items"
            badgeClass="bg-yellow-100 text-yellow-700"
          />
        </div>

        <LineChartCard
          title="Ticket Volume Trend"
          subtitle="Count of created tickets per month or year"
          data={reportChartData}
          xLabel={reportPeriod === 'MONTH' ? 'Months' : 'Years'}
          yLabel="Tickets"
          valueKey="value"
          valueSuffix=""
        />

        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-sm border">
            <thead className="bg-gray-50">
              <tr>
                <th className="border px-3 py-2 text-left">Period</th>
                <th className="border px-3 py-2 text-left">Total</th>
                <th className="border px-3 py-2 text-left">Open</th>
                <th className="border px-3 py-2 text-left">In Progress</th>
                <th className="border px-3 py-2 text-left">Resolved</th>
                <th className="border px-3 py-2 text-left">Closed</th>
                <th className="border px-3 py-2 text-left">Rejected</th>
              </tr>
            </thead>
            <tbody>
              {reportData.length > 0 ? reportData.map((row) => (
                <tr key={row.periodKey} className="odd:bg-white even:bg-gray-50">
                  <td className="border px-3 py-2">{row.periodLabel || row.periodKey}</td>
                  <td className="border px-3 py-2">{row.totalTickets || 0}</td>
                  <td className="border px-3 py-2">{row.openTickets || 0}</td>
                  <td className="border px-3 py-2">{row.inProgressTickets || 0}</td>
                  <td className="border px-3 py-2">{row.resolvedTickets || 0}</td>
                  <td className="border px-3 py-2">{row.closedTickets || 0}</td>
                  <td className="border px-3 py-2">{row.rejectedTickets || 0}</td>
                </tr>
              )) : (
                <tr>
                  <td className="border px-3 py-4 text-center text-gray-500" colSpan={7}>
                    No report data available yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 border-t pt-4">
          <p className="text-sm font-semibold text-gray-700 mb-2">Admin Quick Navigation</p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => navigate('/admin/tickets')}
              className="px-3 py-2 rounded-lg text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700"
            >
              Tickets Dashboard
            </button>
            <button
              onClick={() => navigate('/admin/assign-technicians')}
              className="px-3 py-2 rounded-lg text-sm font-semibold bg-white border text-gray-700 hover:bg-gray-50"
            >
              Assign Technicians
            </button>
            <button
              onClick={() => navigate('/admin/category-priority')}
              className="px-3 py-2 rounded-lg text-sm font-semibold bg-white border text-gray-700 hover:bg-gray-50"
            >
              Category & Priority
            </button>
            <button
              onClick={() => navigate('/admin/bottom-details')}
              className="px-3 py-2 rounded-lg text-sm font-semibold bg-white border text-gray-700 hover:bg-gray-50"
            >
              More Details
            </button>
            <button
              onClick={() => navigate('/admin/dashboard-new')}
              className="px-3 py-2 rounded-lg text-sm font-semibold bg-white border text-gray-700 hover:bg-gray-50"
            >
              Admin Dashboard New
            </button>
            <button
              onClick={() => navigate('/admin/user-management')}
              className="px-3 py-2 rounded-lg text-sm font-semibold bg-white border text-gray-700 hover:bg-gray-50"
            >
              User Management
            </button>
          </div>
        </div>
      </div>
      </>
      )}

      {activeTopView === 'TECHNICIAN_DETAILS' && (
        selectedTechnician ? (
        <div className="bg-white border rounded-lg p-4 shadow-sm mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2 mb-4">
            <div>
              <p className="text-lg font-semibold text-gray-900">{selectedTechnician.displayName} - Job Details</p>
              <p className="text-sm text-gray-500">ID #{selectedTechnician.id} | Weekly progress overview and assigned jobs</p>
            </div>
            <span className="text-xs font-semibold px-2 py-1 rounded bg-blue-100 text-blue-700 w-fit">This Week</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            <SummaryCard
              title="Total Assigned"
              value={selectedTechnicianJobs.length}
              subtitle="All assigned jobs"
              badgeClass="bg-indigo-100 text-indigo-700"
            />
            <SummaryCard
              title="This Week Jobs"
              value={selectedTechnicianWeeklyJobs.length}
              subtitle="Jobs created this week"
              badgeClass="bg-yellow-100 text-yellow-700"
            />
            <SummaryCard
              title="Week Progress"
              value={`${selectedTechnicianWeekProgress}%`}
              subtitle="Completed this week"
              badgeClass="bg-green-100 text-green-700"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
            <PieChartCard
              title="Technician Weekly Progress Pie Chart"
              subtitle="Status distribution for this technician (current week)"
              data={selectedTechnicianWeekChartData}
              centerLabel={`${selectedTechnicianWeeklyJobs.length}`}
              centerSubLabel="Week Jobs"
            />

            <div className="border rounded-lg p-3 bg-gray-50">
              <p className="text-base font-semibold text-gray-900 mb-3">Assigned Job Details</p>
              {selectedTechnicianJobs.length === 0 ? (
                <p className="text-sm text-gray-500">No jobs assigned to this technician yet.</p>
              ) : (
                <div className="space-y-2 max-h-72 overflow-auto pr-1">
                  {selectedTechnicianJobs
                    .slice()
                    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
                    .map((job) => (
                      <div key={job.id} className="bg-white border rounded p-2">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-semibold text-gray-900 truncate">#{job.id} {job.title}</p>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                            job.status === 'OPEN' ? 'bg-blue-100 text-blue-800' :
                            job.status === 'IN_PROGRESS' ? 'bg-yellow-100 text-yellow-800' :
                            job.status === 'RESOLVED' ? 'bg-green-100 text-green-800' :
                            job.status === 'CLOSED' ? 'bg-gray-100 text-gray-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {job.status}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{job.category} | {job.priority} | {job.createdAt ? new Date(job.createdAt).toLocaleString() : '-'}</p>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
        ) : (
          <div className="bg-white border rounded-lg p-6 shadow-sm mb-6">
            <p className="text-base font-semibold text-gray-900 mb-2">Technician Details</p>
            <p className="text-sm text-gray-600">Select a technician to view assigned jobs and weekly progress pie chart.</p>
          </div>
        )
      )}

      {activeTopView === 'OVERVIEW' && (
      <div className="space-y-6">
        {Object.keys(groupedTickets)
          .sort()
          .map((category) => (
            <div key={category}>
              <button
                onClick={() => toggleSection(category)}
                className="w-full flex items-center justify-between bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-lg hover:from-blue-700 hover:to-blue-800 transition"
              >
                <h2 className="text-xl font-bold">{category}</h2>
                <span className="text-lg">{expandedSections[category] ? '▼' : '▶'}</span>
              </button>

              {expandedSections[category] && (
                <div className="mt-4 space-y-4 ml-4 border-l-4 border-blue-300 pl-4">
                  {Object.keys(groupedTickets[category])
                    .sort((a, b) => {
                      const priorityOrder = { 'CRITICAL': 0, 'HIGH': 1, 'MEDIUM': 2, 'LOW': 3 };
                      return (priorityOrder[a] || 99) - (priorityOrder[b] || 99);
                    })
                    .map((priority) => (
                      <div key={`${category}-${priority}`}>
                        <h3 className={`text-lg font-semibold p-3 rounded-lg mb-3 ${
                          priority === 'CRITICAL' ? 'bg-red-100 text-red-800' :
                          priority === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                          priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          Priority: {priority} ({groupedTickets[category][priority].length})
                        </h3>

                        <div className="space-y-3">
                          {groupedTickets[category][priority].map((ticket) => (
                            <TicketCard
                              key={ticket.id}
                              ticket={ticket}
                              expanded={expandedTickets[ticket.id] || false}
                              toggleExpand={() => toggleTicket(ticket.id)}
                              technicians={technicians}
                              selectedTech={selectedTechByTicket[ticket.id] || ''}
                              onTechChange={(value) =>
                                setSelectedTechByTicket((prev) => ({ ...prev, [ticket.id]: value }))
                              }
                              onAssign={() => assign(ticket.id)}
                              selectedStatus={selectedStatus[ticket.id] || ''}
                              onStatusChange={(value) =>
                                setSelectedStatus((prev) => ({ ...prev, [ticket.id]: value }))
                              }
                              resolutionNote={resolutionNotes[ticket.id] || ''}
                              onResolutionNoteChange={(value) =>
                                setResolutionNotes((prev) => ({ ...prev, [ticket.id]: value }))
                              }
                              rejectionReason={rejectionReasons[ticket.id] || ''}
                              onRejectionReasonChange={(value) =>
                                setRejectionReasons((prev) => ({ ...prev, [ticket.id]: value }))
                              }
                              deadlineValue={deadlineByTicket[ticket.id] ?? toDateTimeLocalValue(ticket.expectedCompletionAt)}
                              onDeadlineChange={(value) =>
                                setDeadlineByTicket((prev) => ({ ...prev, [ticket.id]: value }))
                              }
                              warningValue={warningByTicket[ticket.id] ?? (ticket.warningMessage || '')}
                              onWarningChange={(value) =>
                                setWarningByTicket((prev) => ({ ...prev, [ticket.id]: value }))
                              }
                              onSaveDeadline={() => saveDeadline(ticket.id)}
                              onUpdateStatus={(status) => updateStatus(ticket.id, status)}
                              formatLocationCategory={formatLocationCategory}
                              getImageSrc={getImageSrc}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          ))}
      </div>
      )}

      <div className="mt-8 bg-white border rounded-lg p-4 shadow-sm">
        <p className="text-base font-semibold text-gray-900">More Details Page</p>
        <button
          onClick={() => navigate('/admin/bottom-details')}
          className="mt-3 px-4 py-2 rounded-lg bg-gray-800 text-white text-sm font-semibold hover:bg-black"
        >
          Go to more  Details Page
        </button>
      </div>
    </div>
  );
};

const Info = ({ label, value }) => (
  <div className="bg-gray-50 rounded-lg p-3 border">
    <p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>
    <p className="font-medium text-gray-900 break-words">{value || '-'}</p>
  </div>
);

const SummaryCard = ({ title, value, subtitle, badgeClass }) => (
  <div className="bg-white border rounded-lg p-4 shadow-sm">
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-sm font-semibold text-gray-700">{title}</p>
        <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
        <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
      </div>
      <span className={`text-xs font-semibold px-2 py-1 rounded ${badgeClass}`}>Live</span>
    </div>
  </div>
);

const PieChartCard = ({
  title,
  subtitle,
  data,
  centerLabel,
  centerSubLabel,
  showProgressPercent = false,
}) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  if (!data.length || total === 0) {
    return (
      <div className="bg-white border rounded-lg p-4 shadow-sm">
        <p className="text-base font-semibold text-gray-900">{title}</p>
        <p className="text-sm text-gray-500 mb-3">{subtitle}</p>
        <div className="h-56 flex items-center justify-center text-sm text-gray-500 bg-gray-50 rounded border">
          No data available
        </div>
      </div>
    );
  }

  let cumulative = 0;
  const segments = data.map((item) => {
    const startAngle = (cumulative / total) * 360;
    cumulative += item.value;
    const endAngle = (cumulative / total) * 360;
    return {
      ...item,
      startAngle,
      endAngle,
      percentage: Math.round((item.value / total) * 100),
    };
  });

  const size = 210;
  const center = size / 2;
  const radius = 72;
  const innerRadius = 40;

  return (
    <div className="bg-white border rounded-lg p-4 shadow-sm">
      <p className="text-base font-semibold text-gray-900">{title}</p>
      <p className="text-sm text-gray-500 mb-3">{subtitle}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-center">
        <div className="flex justify-center">
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            {segments.map((segment) => (
              <path
                key={segment.label}
                d={describeArc(center, center, radius, segment.startAngle, segment.endAngle, innerRadius)}
                fill={segment.color}
              />
            ))}
            <circle cx={center} cy={center} r={innerRadius - 1} fill="#FFFFFF" />
            <text x={center} y={center - 3} textAnchor="middle" className="fill-gray-900 text-lg font-bold">
              {centerLabel}
            </text>
            <text x={center} y={center + 16} textAnchor="middle" className="fill-gray-500 text-xs">
              {centerSubLabel}
            </text>
          </svg>
        </div>

        <div className="space-y-2 max-h-56 overflow-auto pr-1">
          {segments.map((segment) => (
            <div key={segment.label} className="flex items-center justify-between gap-2 text-sm">
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="w-3 h-3 rounded-full inline-block"
                  style={{ backgroundColor: segment.color }}
                />
                <span className="text-gray-700 truncate">{segment.label}</span>
              </div>
              <div className="text-right whitespace-nowrap">
                <span className="font-semibold text-gray-900">{segment.value}</span>
                <span className="text-xs text-gray-500 ml-1">({segment.percentage}%)</span>
                {showProgressPercent && typeof segment.progressPercent === 'number' && (
                  <span className="text-xs text-green-600 ml-2">Done {segment.progressPercent}%</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const LineChartCard = ({
  title,
  subtitle,
  data,
  xLabel = 'Items',
  yLabel = 'Value',
  valueKey = 'progressPercent',
  valueSuffix = '%',
}) => {
  if (!data.length) {
    return (
      <div className="bg-white border rounded-lg p-4 shadow-sm">
        <p className="text-base font-semibold text-gray-900">{title}</p>
        <p className="text-sm text-gray-500 mb-3">{subtitle}</p>
        <div className="h-56 flex items-center justify-center text-sm text-gray-500 bg-gray-50 rounded border">
          No data available
        </div>
      </div>
    );
  }

  const values = data.map((item) => Number(item[valueKey] ?? 0));
  const max = valueKey === 'progressPercent' ? Math.max(100, ...values) : Math.max(1, ...values);
  const min = 0;
  const width = 360;
  const height = 220;
  const padding = { top: 20, right: 24, bottom: 48, left: 36 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const stepX = data.length > 1 ? chartWidth / (data.length - 1) : 0;

  const points = data.map((item, index) => {
    const value = Number(item[valueKey] ?? 0);
    const x = padding.left + (data.length > 1 ? index * stepX : chartWidth / 2);
    const y = padding.top + chartHeight - ((value - min) / (max - min || 1)) * chartHeight;
    return { ...item, value, x, y };
  });

  const linePoints = points.map((point) => `${point.x},${point.y}`).join(' ');
  const ticks = valueKey === 'progressPercent'
    ? [0, 25, 50, 75, 100]
    : [0, Math.ceil(max / 4), Math.ceil(max / 2), Math.ceil((max * 3) / 4), max].filter((tick, index, array) => array.indexOf(tick) === index);

  return (
    <div className="bg-white border rounded-lg p-4 shadow-sm">
      <p className="text-base font-semibold text-gray-900">{title}</p>
      <p className="text-sm text-gray-500 mb-3">{subtitle}</p>

      <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-3 items-center">
        <div className="flex justify-center">
          <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
            {ticks.map((tick) => {
              const y = padding.top + chartHeight - ((tick - min) / (max - min || 1)) * chartHeight;
              return (
                <g key={tick}>
                  <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="#E5E7EB" strokeDasharray="4 4" />
                  <text x={padding.left - 6} y={y + 4} textAnchor="end" className="fill-gray-500 text-[10px]">
                    {tick}{valueSuffix}
                  </text>
                </g>
              );
            })}

            <line x1={padding.left} y1={padding.top + chartHeight} x2={width - padding.right} y2={padding.top + chartHeight} stroke="#CBD5E1" />
            <line x1={padding.left} y1={padding.top} x2={padding.left} y2={padding.top + chartHeight} stroke="#CBD5E1" />

            <polyline fill="none" stroke="#2563EB" strokeWidth="3" points={linePoints} />

            {points.map((point) => (
              <g key={point.id}>
                <circle cx={point.x} cy={point.y} r="4" fill="#2563EB" />
                <text x={point.x} y={height - 16} textAnchor="middle" className="fill-gray-600 text-[10px]">
                  {String(point.label).slice(0, 10)}
                </text>
                <text x={point.x} y={point.y - 8} textAnchor="middle" className="fill-gray-700 text-[10px] font-semibold">
                  {point.value}{valueSuffix}
                </text>
              </g>
            ))}
          </svg>
        </div>

        <div className="space-y-2 max-h-56 overflow-auto pr-1">
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
            <span className="inline-block w-3 h-3 rounded-full bg-blue-600" />
            <span>{xLabel} / {yLabel}</span>
          </div>
          {points.map((point) => (
            <div key={point.id} className="flex items-center justify-between gap-2 text-sm">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-3 h-3 rounded-full inline-block bg-blue-600" />
                <span className="text-gray-700 truncate">{point.label}</span>
              </div>
              <div className="text-right whitespace-nowrap">
                <span className="font-semibold text-gray-900">{point.value}{valueSuffix}</span>
                {typeof point.assigned === 'number' && (
                  <span className="text-xs text-gray-500 ml-2">assigned {point.assigned}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const polarToCartesian = (centerX, centerY, radius, angleInDegrees) => {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
};

const describeArc = (x, y, radius, startAngle, endAngle, innerRadius) => {
  if (endAngle - startAngle >= 360) {
    endAngle = startAngle + 359.999;
  }

  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);
  const innerStart = polarToCartesian(x, y, innerRadius, endAngle);
  const innerEnd = polarToCartesian(x, y, innerRadius, startAngle);

  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

  return [
    `M ${start.x} ${start.y}`,
    `A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`,
    `L ${innerEnd.x} ${innerEnd.y}`,
    `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 1 ${innerStart.x} ${innerStart.y}`,
    'Z',
  ].join(' ');
};

const TicketCard = ({
  ticket,
  expanded,
  toggleExpand,
  technicians,
  selectedTech,
  onTechChange,
  onAssign,
  selectedStatus,
  onStatusChange,
  resolutionNote,
  onResolutionNoteChange,
  rejectionReason,
  onRejectionReasonChange,
  deadlineValue,
  onDeadlineChange,
  warningValue,
  onWarningChange,
  onSaveDeadline,
  onUpdateStatus,
  formatLocationCategory,
  getImageSrc,
}) => {
  const statusTransitions = {
    OPEN: ['IN_PROGRESS', 'REJECTED'],
    IN_PROGRESS: ['RESOLVED', 'REJECTED'],
    RESOLVED: ['CLOSED', 'REJECTED'],
    CLOSED: [],
    REJECTED: [],
  };

  const allowedNextStatuses = statusTransitions[ticket.status] || [];
  const isFinalStatus = ['RESOLVED', 'CLOSED', 'REJECTED'].includes(ticket.status);
  const isOverdue = ticket.expectedCompletionAt && !isFinalStatus
    ? new Date(ticket.expectedCompletionAt).getTime() < Date.now()
    : false;
  const additionalTechnicians = ticket.additionalTechnicianNames
    ? String(ticket.additionalTechnicianNames).split(',').map((name) => name.trim()).filter(Boolean)
    : [];
  const isAlreadyAssigned = Boolean(ticket.assignedTechnicianId || ticket.assignedTechnicianName);

  const toDateTimeLocalValue = (dateValue) => {
    if (!dateValue) return '';
    const dt = new Date(dateValue);
    if (Number.isNaN(dt.getTime())) return '';
    const pad = (num) => String(num).padStart(2, '0');
    return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
  };

  const deadlineMinMax = (() => {
    const now = new Date();
    const max = new Date();
    max.setMonth(max.getMonth() + 1);
    return {
      min: toDateTimeLocalValue(now),
      max: toDateTimeLocalValue(max),
    };
  })();

  return (
    <div className="border rounded-lg bg-white shadow-sm hover:shadow-md transition">
      <button
        onClick={toggleExpand}
        className="w-full text-left p-4 flex items-center justify-between hover:bg-gray-50 transition"
      >
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h4 className="font-semibold text-gray-900">{ticket.title}</h4>
            <span className={`text-xs font-bold px-2 py-1 rounded ${
              ticket.status === 'OPEN' ? 'bg-blue-100 text-blue-800' :
              ticket.status === 'IN_PROGRESS' ? 'bg-yellow-100 text-yellow-800' :
              ticket.status === 'RESOLVED' ? 'bg-green-100 text-green-800' :
              ticket.status === 'CLOSED' ? 'bg-gray-100 text-gray-800' :
              'bg-red-100 text-red-800'
            }`}>
              {ticket.status}
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">Ticket #{ticket.id} | {ticket.creatorName} | {formatLocationCategory(ticket.locationCategory)}</p>
        </div>
        <span className="text-lg text-gray-500">{expanded ? '▼' : '▶'}</span>
      </button>

      {expanded && (
        <div className="border-t p-4 space-y-4 bg-gray-50">
          {/* Basic Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <Info label="Category" value={formatCategoryDisplay(ticket.category, ticket.subCategory)} />
            <Info label="Priority" value={ticket.priority} />
            <Info label="Created By" value={`${ticket.creatorName || '-'} (${ticket.creatorId || '-'})`} />
            <Info
              label="Assigned To"
              value={[
                ticket.assignedTechnicianName || 'Unassigned',
                ...additionalTechnicians,
              ].filter(Boolean).join(' | ')}
            />
            <Info label="Building" value={ticket.buildingName || '-'} />
            <Info label="Floor / Block / Room" value={`${ticket.floorNumber ?? '-'} / ${ticket.block || '-'} / ${ticket.roomNumber || '-'}`} />
            <Info label="Contact" value={ticket.contactPhone || '-'} />
            <Info label="Created At" value={ticket.createdAt ? new Date(ticket.createdAt).toLocaleString() : '-'} />
            <Info label="Expected Completion" value={ticket.expectedCompletionAt ? new Date(ticket.expectedCompletionAt).toLocaleString() : 'Not set'} />
            <Info label="Technician Completion" value={isFinalStatus ? 'Completed' : 'Pending'} />
          </div>

          {ticket.warningMessage && !isFinalStatus && (
            <div className="bg-amber-50 p-3 rounded border border-amber-300">
              <p className="text-sm font-semibold text-amber-800">⚠ Warning Message</p>
              <p className="text-sm text-amber-900 whitespace-pre-wrap">{ticket.warningMessage}</p>
            </div>
          )}

          {isOverdue && (
            <div className="bg-red-50 p-3 rounded border border-red-300">
              <p className="text-sm font-semibold text-red-800">Overdue Ticket</p>
              <p className="text-sm text-red-900">Technician has not completed this ticket by the expected time.</p>
            </div>
          )}

          {/* Description */}
          <div className="bg-white p-3 rounded border">
            <p className="text-sm font-semibold text-gray-900 mb-2">Description</p>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{ticket.description}</p>
          </div>

          {/* Location Details */}
          {ticket.locationCategory === 'OTHER' && ticket.otherLocation && (
            <div className="bg-white p-3 rounded border">
              <p className="text-sm font-semibold text-gray-900">Other Location</p>
              <p className="text-sm text-gray-700">{ticket.otherLocation}</p>
            </div>
          )}

          {/* Resolution Note (if exists) */}
          {ticket.resolutionNote && (
            <div className="bg-green-50 p-3 rounded border border-green-200">
              <p className="text-sm font-semibold text-green-800">✓ Resolution Note</p>
              <p className="text-sm text-green-900 whitespace-pre-wrap">{ticket.resolutionNote}</p>
            </div>
          )}

          {/* Rejection Reason (if exists) */}
          {ticket.rejectionReason && (
            <div className="bg-red-50 p-3 rounded border border-red-200">
              <p className="text-sm font-semibold text-red-800">✗ Rejection Reason</p>
              <p className="text-sm text-red-900 whitespace-pre-wrap">{ticket.rejectionReason}</p>
            </div>
          )}

          {/* Images */}
          {ticket.attachments?.length > 0 && (
            <div className="bg-white p-3 rounded border">
              <p className="text-sm font-semibold text-gray-900 mb-3">Uploaded Images ({ticket.attachments.length})</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {ticket.attachments.map((attachment) => {
                  const imageSrc = getImageSrc(attachment.fileUrl);
                  return (
                    <a
                      key={attachment.id}
                      href={imageSrc}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="border rounded-lg overflow-hidden hover:shadow-md transition bg-gray-50"
                    >
                      <div className="aspect-video bg-gray-100 flex items-center justify-center overflow-hidden">
                        <img
                          src={imageSrc}
                          alt={attachment.filename}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                      <div className="p-2">
                        <p className="text-xs font-semibold text-blue-700 truncate">{attachment.filename}</p>
                        <p className="text-xs text-gray-500">{attachment.uploadedByName}</p>
                      </div>
                    </a>
                  );
                })}
              </div>
            </div>
          )}

          {/* Technician Assignment */}
          {!isFinalStatus && (
            <div className="bg-white p-4 rounded border">
              <p className="text-sm font-semibold text-gray-900 mb-3">
                {isAlreadyAssigned ? 'Add Another Technician' : 'Assign Technician'}
              </p>
              <div className="flex gap-2 flex-wrap items-end">
                <select
                  value={selectedTech}
                  onChange={(e) => onTechChange(e.target.value)}
                  className="border rounded px-3 py-2 text-sm flex-1 min-w-48"
                >
                  <option value="">{isAlreadyAssigned ? 'Select another technician...' : 'Select a technician...'}</option>
                  {technicians.map((tech) => (
                    <option key={tech.id} value={tech.id}>
                      {tech.displayName || tech.username} (#{tech.id})
                    </option>
                  ))}
                </select>
                <button
                  onClick={onAssign}
                  disabled={!selectedTech}
                  className="px-4 py-2 rounded bg-blue-600 text-white text-sm font-semibold disabled:bg-gray-300 hover:bg-blue-700 transition"
                >
                  {isAlreadyAssigned ? 'Add Technician' : 'Assign'}
                </button>
              </div>
            </div>
          )}

          {isFinalStatus && (
            <div className="bg-gray-50 p-4 rounded border border-gray-300">
              <p className="text-sm font-semibold text-gray-700">Assignment - Read Only</p>
              <p className="text-xs text-gray-600 mt-2">Technician assignment cannot be changed for completed or rejected tickets.</p>
            </div>
          )}

          <div className="bg-white p-4 rounded border">
            <p className="text-sm font-semibold text-gray-900 mb-3">Allocate Time & Warning Message</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Expected completion date/time</label>
                <input
                  type="datetime-local"
                  value={deadlineValue || ''}
                  onChange={(e) => onDeadlineChange(e.target.value)}
                  min={deadlineMinMax.min}
                  max={deadlineMinMax.max}
                  className="w-full border rounded px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Warning message (if delayed)</label>
                <input
                  type="text"
                  value={warningValue || ''}
                  onChange={(e) => onWarningChange(e.target.value)}
                  className="w-full border rounded px-3 py-2 text-sm"
                  placeholder="Example: Complete before class starts at 9 AM"
                />
              </div>
            </div>
            <button
              onClick={onSaveDeadline}
              className="mt-3 px-4 py-2 rounded bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700"
            >
              Save Deadline
            </button>
          </div>

          {/* Status Workflow */}
          <div className="bg-white p-4 rounded border">
            <p className="text-sm font-semibold text-gray-900 mb-3">Ticket Workflow</p>
            <div className="flex gap-2 items-center text-xs font-semibold mb-4 flex-wrap">
              {['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map((s, idx) => (
                <React.Fragment key={s}>
                  <span className={`px-2 py-1 rounded ${ticket.status === s ? 'bg-blue-600 text-white' : ticket.status === 'REJECTED' ? 'bg-gray-200 text-gray-500' : 'bg-gray-100 text-gray-700'}`}>
                    {s}
                  </span>
                  {idx < 3 && <span className="text-gray-400">→</span>}
                </React.Fragment>
              ))}
              <span className="text-gray-400">or</span>
              <span className={`px-2 py-1 rounded ${ticket.status === 'REJECTED' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700'}`}>
                REJECTED
              </span>
            </div>

            {allowedNextStatuses.length > 0 && (
              <div className="space-y-3">
                <div className="flex gap-2 flex-wrap items-end">
                  <select
                    value={selectedStatus}
                    onChange={(e) => onStatusChange(e.target.value)}
                    className="border rounded px-3 py-2 text-sm flex-1 min-w-48"
                  >
                    <option value="">Update status...</option>
                    {allowedNextStatuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => selectedStatus && onUpdateStatus(selectedStatus)}
                    disabled={!selectedStatus}
                    className={`px-4 py-2 rounded text-white text-sm font-semibold disabled:bg-gray-300 ${
                      selectedStatus === 'REJECTED' ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
                    } transition`}
                  >
                    Update
                  </button>
                </div>

                {selectedStatus === 'REJECTED' && (
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => onRejectionReasonChange(e.target.value)}
                    placeholder="Explain why the ticket is being rejected..."
                    className="w-full border rounded px-3 py-2 text-sm"
                    rows="3"
                  />
                )}

                {(selectedStatus === 'RESOLVED' || selectedStatus === 'CLOSED') && (
                  <textarea
                    value={resolutionNote}
                    onChange={(e) => onResolutionNoteChange(e.target.value)}
                    placeholder="Add resolution notes (optional)..."
                    className="w-full border rounded px-3 py-2 text-sm"
                    rows="3"
                  />
                )}
              </div>
            )}

            {allowedNextStatuses.length === 0 && (
              <p className="text-sm text-gray-600 italic">This ticket is in a final state and cannot be updated further.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTicket;
