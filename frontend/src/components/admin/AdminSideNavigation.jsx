import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getUser, isAuthenticated, logout } from '../../utils/auth';

const AdminSideNavigation = ({ activeSection, setActiveSection }) => {
  const navigate = useNavigate();

  const handleNavigation = (section) => {
    setActiveSection(section);
    switch (section) {
      case 'dashboard':
        navigate('/admin/dashboard-new');
        break;
      case 'users':
        navigate('/admin/user-management');
        break;
      case 'tickets':
        navigate('/admin/tickets');
        break;
      case 'facilities':
        navigate('/admin/facilities');
        break;
      case 'bookings':
        navigate('/admin/bookings');
        break;
      case 'notifications':
        navigate('/admin/notifications');
        break;
      case 'settings':
        navigate('/admin/settings');
        break;
      default:
        break;
    }
  };

  const menuItems = [
    {
      section: 'OVERVIEW',
      items: [
        { name: 'Dashboard', id: 'dashboard', icon: 'dashboard' }
      ]
    },
    {
      section: 'RESOURCES',
      items: [
        { name: 'Facilities & Assets', id: 'facilities', icon: 'building' },
        { name: 'Bookings', id: 'bookings', icon: 'calendar' }
      ]
    },
    {
      section: 'OPERATIONS',
      items: [
        { name: 'Incident Tickets', id: 'tickets', icon: 'ticket' },
        { name: 'Notifications', id: 'notifications', icon: 'bell' }
      ]
    },
    {
      section: 'ADMIN',
      items: [
        { name: 'User Management', id: 'users', icon: 'users' },
        { name: 'Settings', id: 'settings', icon: 'settings' }
      ]
    }
  ];

  return (
    <div className="w-64 bg-slate-800 text-white flex flex-col">
      {/* Logo */}
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
            <span className="text-white font-bold">SC</span>
          </div>
          <h1 className="text-lg font-bold">
            Smart Campus Operations Hub
          </h1>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        {menuItems.map((section) => (
          <div key={section.section} className="mb-6">
            <p className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              {section.section}
            </p>
            {section.items.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.id)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-between ${
                  activeSection === item.id
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-200 hover:bg-slate-700 hover:text-white'
                }`}
              >
                <span className="flex items-center gap-2">
                  {item.name}
                </span>
                {item.badge && (
                  <span className="bg-rose-500 text-white text-xs px-2 py-1 rounded-full">
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        ))}
      </nav>

      {/* User Info */}
      <div className="p-4 border-t border-slate-700">
        {isAuthenticated() && getUser() ? (
          <div>
            <div className="text-sm mb-3">
              <p className="text-slate-200 font-medium">{getUser().name}</p>
              <p className="text-xs text-slate-400">Administrator</p>
            </div>
            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="w-full bg-red-600 hover:bg-red-700 text-white text-sm py-2 px-3 rounded-lg transition-colors"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <button
            onClick={() => navigate('/login')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 px-3 rounded-lg transition-colors"
          >
            Sign In
          </button>
        )}
      </div>
    </div>
  );
};

export default AdminSideNavigation;