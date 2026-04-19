import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSideNavigation from '../../components/admin/AdminSideNavigation';
import api from '../../services/api';
import { fetchResourcesPage } from '../../api/resourcesApi';
import ticketApi from '../../api/ticketApi';

const AdminDashboardNew = () => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [selectedBookings, setSelectedBookings] = useState([]);
  const [bookingForm, setBookingForm] = useState({
    resource: 'Lab A-201',
    purpose: '',
    date: '2026-04-20',
    expectedAttendees: '',
    startTime: '09:00',
    endTime: '11:00'
  });

  // State for real data
  const [summaryData, setSummaryData] = useState({
    totalResources: 0,
    resourcesAddedThisMonth: 0,
    pendingBookings: 0,
    bookingsSinceYesterday: 0,
    openTickets: 0,
    highPriorityTickets: 0,
    activeUsers: 0,
    usersThisWeek: 0
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [incidentTickets, setIncidentTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  const resourceUtilization = [
    { name: 'Lab A-201', utilization: 85, status: 'active' },
    { name: 'Lecture Hall B', utilization: 92, status: 'active' },
    { name: 'Meeting Room 3', utilization: 67, status: 'active' },
    { name: 'Projector #7', utilization: 0, status: 'oos' },
    { name: 'Computing Lab', utilization: 78, status: 'active' },
    { name: 'Camera Kit #2', utilization: 45, status: 'active' }
  ];

  const recentNotifications = [
    { id: 1, type: 'Booking approved', message: 'Lab A-201 booking approved for Group study session', time: '2 hours ago', user: 'System' },
    { id: 2, type: 'Ticket escalated', message: 'Ticket #T042 escalated to high priority', time: '3 hours ago', user: 'Admin' },
    { id: 3, type: 'Ticket resolved', message: 'Network connectivity issues resolved', time: '5 hours ago', user: 'Technician' },
    { id: 4, type: 'New comment', message: 'New comment on ticket #042', time: '1 day ago', user: 'John Doe' },
    { id: 5, type: 'Booking rejected', message: 'Meeting Room 3 booking rejected due to conflict', time: '2 days ago', user: 'System' }
  ];

  // Fetch data from database
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch all data in parallel
        const [resourcesResponse, bookingsResponse, ticketsResponse, usersResponse] = await Promise.all([
          fetchResourcesPage({ page: 0, size: 1000 }),
          api.get('/api/admin/bookings?page=0&size=1000'),
          ticketApi.listTickets(),
          api.get('/api/users')
        ]);

        // Process resources data
        const resources = resourcesResponse.content || [];
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const resourcesAddedThisMonth = resources.filter(resource => {
          const createdDate = new Date(resource.createdAt || resource.createdDate);
          return createdDate.getMonth() === currentMonth && createdDate.getFullYear() === currentYear;
        }).length;

        // Process bookings data
        const bookings = bookingsResponse.data?.content || [];
        const pendingBookings = bookings.filter(booking => booking.status === 'Pending').length;
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const bookingsSinceYesterday = bookings.filter(booking => {
          const bookingDate = new Date(booking.createdAt || booking.createdDate);
          return bookingDate >= yesterday;
        }).length;

        // Get recent bookings (last 5)
        const recentBookingsData = bookings.slice(0, 5).map(booking => ({
          id: booking.id,
          resource: booking.resourceName || booking.resource || 'Unknown',
          purpose: booking.purpose || booking.description || 'N/A',
          requester: booking.userName || booking.user?.name || 'Unknown',
          date: booking.bookingDate || booking.date || 'N/A',
          status: booking.status || 'Unknown'
        }));

        // Process tickets data
        const tickets = ticketsResponse.data || [];
        const openTickets = tickets.filter(ticket => ticket.status === 'Open' || ticket.status === 'In progress').length;
        const highPriorityTickets = tickets.filter(ticket => 
          ticket.priority === 'High' && (ticket.status === 'Open' || ticket.status === 'In progress')
        ).length;

        // Get recent tickets (last 5)
        const recentTickets = tickets.slice(0, 5).map(ticket => ({
          id: ticket.id || ticket.ticketId,
          title: ticket.title || ticket.description || 'No title',
          location: ticket.location || ticket.resourceName || 'Unknown',
          status: ticket.status || 'Unknown',
          priority: ticket.priority || 'Medium',
          reportedBy: ticket.userName || ticket.user?.name || 'Unknown'
        }));

        // Process users data
        const users = usersResponse.data || [];
        const activeUsers = users.filter(user => user.status === 'Active').length;
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const usersThisWeek = users.filter(user => {
          const createdDate = new Date(user.createdAt || user.createdDate);
          return createdDate >= oneWeekAgo;
        }).length;

        // Update state with fetched data
        setSummaryData({
          totalResources: resources.length,
          resourcesAddedThisMonth,
          pendingBookings,
          bookingsSinceYesterday,
          openTickets,
          highPriorityTickets,
          activeUsers,
          usersThisWeek
        });

        setRecentBookings(recentBookingsData);
        setIncidentTickets(recentTickets);

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleBookingSubmit = (e) => {
    e.preventDefault();
    console.log('New booking submitted:', bookingForm);
    // Handle booking submission
  };

  const handleBookingSelection = (bookingId) => {
    setSelectedBookings(prev => 
      prev.includes(bookingId) 
        ? prev.filter(id => id !== bookingId)
        : [...prev, bookingId]
    );
  };

  const handleApproveSelected = () => {
    console.log('Approving bookings:', selectedBookings);
    // Handle approve selected bookings
  };

  const handleRejectSelected = () => {
    console.log('Rejecting bookings:', selectedBookings);
    // Handle reject selected bookings
  };


  const getUtilizationColor = (utilization) => {
    if (utilization >= 80) return 'bg-emerald-500';
    if (utilization >= 60) return 'bg-blue-500';
    if (utilization >= 40) return 'bg-amber-500';
    return 'bg-slate-400';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'bg-amber-100 text-amber-800';
      case 'Approved': return 'bg-emerald-100 text-emerald-800';
      case 'Rejected': return 'bg-rose-100 text-rose-800';
      case 'Open': return 'bg-blue-100 text-blue-800';
      case 'In progress': return 'bg-orange-100 text-orange-800';
      case 'Resolved': return 'bg-slate-100 text-slate-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="flex h-screen bg-slate-950">
      {/* Sidebar */}
      <AdminSideNavigation 
        activeSection={activeSection} 
        setActiveSection={setActiveSection} 
      />

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <div className="bg-slate-900 border-b border-slate-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Dashboard</h1>
              <p className="text-slate-400 text-sm">Semester 1 - Apr 2026</p>
            </div>
            <div className="flex items-center gap-4">
              <button className="p-2 text-slate-400 hover:text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Summary Cards */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-slate-800 rounded-lg p-4 border border-slate-700 shadow-sm animate-pulse">
                  <div className="h-4 bg-slate-600 rounded mb-2"></div>
                  <div className="h-8 bg-slate-600 rounded"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-slate-800 rounded-lg p-4 border border-slate-700 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-400 text-sm font-medium">Total resources</span>
                  <span className="text-emerald-400 text-xs font-medium">+{summaryData.resourcesAddedThisMonth} added this month</span>
                </div>
                <p className="text-2xl font-bold text-white">{summaryData.totalResources}</p>
              </div>

              <div className="bg-slate-800 rounded-lg p-4 border border-slate-700 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-400 text-sm font-medium">Pending bookings</span>
                  <span className="text-blue-400 text-xs font-medium">+{summaryData.bookingsSinceYesterday} since yesterday</span>
                </div>
                <p className="text-2xl font-bold text-white">{summaryData.pendingBookings}</p>
              </div>

              <div className="bg-slate-800 rounded-lg p-4 border border-slate-700 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-400 text-sm font-medium">Open tickets</span>
                  <span className="text-rose-400 text-xs font-medium">{summaryData.highPriorityTickets} high priority</span>
                </div>
                <p className="text-2xl font-bold text-white">{summaryData.openTickets}</p>
              </div>

              <div className="bg-slate-800 rounded-lg p-4 border border-slate-700 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-400 text-sm font-medium">Active users</span>
                  <span className="text-emerald-400 text-xs font-medium">+{summaryData.usersThisWeek} this week</span>
                </div>
                <p className="text-2xl font-bold text-white">{summaryData.activeUsers}</p>
              </div>
            </div>
          )}

          
          {/* Recent Booking Requests */}
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 shadow-sm mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Recent booking requests</h2>
              <button className="text-blue-400 text-sm hover:text-blue-300">View all</button>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-10 bg-slate-700 rounded mb-2"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-slate-400 border-b border-slate-700">
                      <th className="pb-3">
                        <input
                          type="checkbox"
                          className="rounded bg-slate-700 border-slate-600 text-blue-600 focus:ring-blue-500 focus:ring-offset-0"
                        />
                      </th>
                      <th className="pb-3">Resource</th>
                      <th className="pb-3">Purpose</th>
                      <th className="pb-3">Requester</th>
                      <th className="pb-3">Date</th>
                      <th className="pb-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="text-slate-300">
                    {recentBookings.length > 0 ? (
                      recentBookings.map((booking) => (
                        <tr key={booking.id} className="border-b border-slate-700">
                          <td className="py-3">
                            <input
                              type="checkbox"
                              checked={selectedBookings.includes(booking.id)}
                              onChange={() => handleBookingSelection(booking.id)}
                              className="rounded bg-slate-700 border-slate-600 text-slate-400 focus:ring-slate-500 focus:ring-offset-0"
                            />
                          </td>
                          <td className="py-3">{booking.resource}</td>
                          <td className="py-3">{booking.purpose}</td>
                          <td className="py-3">{booking.requester}</td>
                          <td className="py-3">{booking.date}</td>
                          <td className="py-3">
                            <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(booking.status)}`}>
                              {booking.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="py-4 text-center text-slate-400">
                          No recent bookings found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            <div className="flex gap-3 mt-4">
              <button
                onClick={handleApproveSelected}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                Approve selected
              </button>
              <button
                onClick={handleRejectSelected}
                className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors"
              >
                Reject
              </button>
            </div>
          </div>

          {/* Incident Tickets */}
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 shadow-sm mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Incident tickets</h2>
              <button className="text-blue-400 text-sm hover:text-blue-300">View all</button>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-slate-700 rounded-lg p-4 border border-slate-600 animate-pulse">
                    <div className="h-4 bg-slate-600 rounded mb-2"></div>
                    <div className="h-3 bg-slate-600 rounded w-3/4"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {incidentTickets.length > 0 ? (
                  incidentTickets.map((ticket) => (
                    <div key={ticket.id} className="bg-slate-700 rounded-lg p-4 border border-slate-600">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-white font-medium">#{ticket.id}</span>
                            <h3 className="text-white font-medium">{ticket.title}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(ticket.status)}`}>
                              {ticket.status}
                            </span>
                            <span className="text-xs text-slate-400">Priority: {ticket.priority}</span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-slate-400">
                            <span>Location: {ticket.location}</span>
                            <span>Reported by: {ticket.reportedBy}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-slate-400 py-8">
                    No incident tickets found
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Resource Utilization and Notifications */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Resource Utilization */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h2 className="text-lg font-semibold text-white mb-4">Resource utilization - this week</h2>
              <div className="space-y-3">
                {resourceUtilization.map((resource) => (
                  <div key={resource.name} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-slate-300">{resource.name}</span>
                        <div className="flex items-center gap-2">
                          {resource.status === 'oos' && (
                            <span className="text-xs text-rose-400 font-medium">OOS</span>
                          )}
                          <span className="text-sm text-slate-400">{resource.utilization}%</span>
                        </div>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${resource.status === 'oos' ? 'bg-rose-500' : getUtilizationColor(resource.utilization)}`}
                          style={{ width: `${resource.status === 'oos' ? 0 : resource.utilization}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Notifications */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h2 className="text-lg font-semibold text-white mb-4">Recent notifications</h2>
              <div className="space-y-3">
                {recentNotifications.map((notification) => (
                  <div key={notification.id} className="border-l-2 border-blue-500 pl-4 py-2 hover:bg-slate-700/30 transition-colors">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-white">{notification.type}</span>
                      <span className="text-xs text-slate-400">{notification.time}</span>
                    </div>
                    <p className="text-sm text-slate-300">{notification.message}</p>
                    <p className="text-xs text-slate-500 mt-1">by {notification.user}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardNew;
