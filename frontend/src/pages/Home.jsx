import React from 'react';
import Header from '../components/Header';
import Hero from '../components/Hero';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { FiBookOpen, FiCalendar, FiTool, FiUsers, FiTrendingUp, FiClock, FiMapPin, FiFilter } from 'react-icons/fi';

const Home = () => {
  // Sample data for demonstration
  const recentBookings = [
    {
      id: 1,
      resource: 'Computer Lab 301',
      type: 'Lab',
      date: '2026-03-24',
      time: '09:00 - 11:00',
      status: 'approved',
      purpose: 'Data Structures Tutorial'
    },
    {
      id: 2,
      resource: 'Lecture Hall A',
      type: 'Lecture Hall',
      date: '2026-03-25',
      time: '14:00 - 16:00',
      status: 'pending',
      purpose: 'Guest Lecture'
    },
    {
      id: 3,
      resource: 'Meeting Room 202',
      type: 'Meeting Room',
      date: '2026-03-23',
      time: '10:00 - 12:00',
      status: 'approved',
      purpose: 'Project Discussion'
    }
  ];

  const recentTickets = [
    {
      id: 1,
      title: 'Projector not working in Lab 301',
      category: 'Equipment',
      priority: 'High',
      status: 'in-progress',
      createdDate: '2026-03-23'
    },
    {
      id: 2,
      title: 'Air conditioning issue in Lecture Hall B',
      category: 'Facility',
      priority: 'Medium',
      status: 'open',
      createdDate: '2026-03-22'
    },
    {
      id: 3,
      title: 'Network connectivity problems',
      category: 'IT',
      priority: 'High',
      status: 'resolved',
      createdDate: '2026-03-21'
    }
  ];

  const quickStats = [
    {
      label: 'Total Bookings',
      value: '24',
      change: '+12%',
      icon: FiCalendar,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      label: 'Active Tickets',
      value: '8',
      change: '-5%',
      icon: FiTool,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      label: 'Available Resources',
      value: '156',
      change: '+8%',
      icon: FiBookOpen,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      label: 'Active Users',
      value: '1,247',
      change: '+23%',
      icon: FiUsers,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
      case 'resolved':
        return 'text-green-600 bg-green-50';
      case 'pending':
      case 'in-progress':
        return 'text-yellow-600 bg-yellow-50';
      case 'open':
        return 'text-blue-600 bg-blue-50';
      case 'rejected':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High':
        return 'text-red-600 bg-red-50';
      case 'Medium':
        return 'text-yellow-600 bg-yellow-50';
      case 'Low':
        return 'text-green-600 bg-green-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <Hero />

      {/* Main Content */}
      <main className="w-full py-12">
        {/* Quick Stats */}
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {quickStats.map((stat, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`${stat.bgColor} p-3 rounded-lg`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <span className={`text-sm font-medium ${
                    stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stat.change}
                  </span>
                </div>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity Section */}
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Recent Bookings */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Recent Bookings</h2>
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  View All
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentBookings.map((booking) => (
                  <div key={booking.id} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors duration-200">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                        <FiBookOpen className="w-5 h-5 text-blue-600" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {booking.resource}
                        </p>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                          {booking.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">{booking.type}</p>
                      <div className="flex items-center mt-1 text-xs text-gray-400">
                        <FiClock className="w-3 h-3 mr-1" />
                        {booking.date} • {booking.time}
                      </div>
                      <p className="text-xs text-gray-600 mt-1">{booking.purpose}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Tickets */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Recent Tickets</h2>
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  View All
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentTickets.map((ticket) => (
                  <div key={ticket.id} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors duration-200">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
                        <FiTool className="w-5 h-5 text-orange-600" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {ticket.title}
                        </p>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                          {ticket.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">{ticket.category}</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                          {ticket.priority}
                        </span>
                        <span className="text-xs text-gray-400">
                          {ticket.createdDate}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        </div>

        {/* Quick Actions */}
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg p-8 text-white">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
              <p className="text-blue-100 mb-6">
                Get started with the most common tasks
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button className="bg-white text-blue-600 hover:bg-gray-50 px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center">
                  <FiCalendar className="w-5 h-5 mr-2" />
                  New Booking
                </button>
                <button className="bg-white text-orange-600 hover:bg-gray-50 px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center">
                  <FiTool className="w-5 h-5 mr-2" />
                  Create Ticket
                </button>
                <button className="bg-white text-purple-600 hover:bg-gray-50 px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center">
                  <FiFilter className="w-5 h-5 mr-2" />
                  Browse Resources
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Home;
