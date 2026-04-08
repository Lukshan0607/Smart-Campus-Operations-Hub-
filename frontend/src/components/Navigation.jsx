import React, { useState } from 'react';
import { FiHome, FiBookOpen, FiCalendar, FiTool, FiBell, FiBarChart2, FiUsers, FiSettings } from 'react-icons/fi';

const Navigation = () => {
  const [activeSection, setActiveSection] = useState('home');

  const navigationItems = [
    {
      id: 'home',
      name: 'Home',
      icon: FiHome,
      href: '#home',
      description: 'Dashboard overview'
    },
    {
      id: 'resources',
      name: 'Resources',
      icon: FiBookOpen,
      href: '#resources',
      description: 'Browse and manage resources'
    },
    {
      id: 'bookings',
      name: 'Bookings',
      icon: FiCalendar,
      href: '#bookings',
      description: 'Manage your bookings'
    },
    {
      id: 'tickets',
      name: 'Tickets',
      icon: FiTool,
      href: '#tickets',
      description: 'Maintenance requests'
    },
    {
      id: 'notifications',
      name: 'Notifications',
      icon: FiBell,
      href: '#notifications',
      description: 'View notifications'
    },
    {
      id: 'analytics',
      name: 'Analytics',
      icon: FiBarChart2,
      href: '#analytics',
      description: 'Usage statistics'
    },
    {
      id: 'users',
      name: 'Users',
      icon: FiUsers,
      href: '#users',
      description: 'User management'
    },
    {
      id: 'settings',
      name: 'Settings',
      icon: FiSettings,
      href: '#settings',
      description: 'System settings'
    }
  ];

  return (
    <nav className="bg-white border-r border-gray-200 h-full">
      <div className="p-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Navigation</h2>
        
        <div className="space-y-1">
          {navigationItems.map((item) => (
            <a
              key={item.id}
              href={item.href}
              onClick={() => setActiveSection(item.id)}
              className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                activeSection === item.id
                  ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <item.icon className={`mr-3 h-5 w-5 ${
                activeSection === item.id ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'
              }`} />
              <div className="flex-1">
                <div>{item.name}</div>
                <div className="text-xs text-gray-500 mt-0.5">{item.description}</div>
              </div>
            </a>
          ))}
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="p-4 border-t border-gray-200">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Quick Actions</h3>
        <div className="space-y-2">
          <button className="w-full text-left px-3 py-2 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors duration-200">
            New Booking
          </button>
          <button className="w-full text-left px-3 py-2 text-sm bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 transition-colors duration-200">
            Create Ticket
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
