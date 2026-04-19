import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getUser, isAuthenticated, logout } from '../utils/auth';

const UserSideNavigation = ({ activeSection, setActiveSection }) => {
  const navigate = useNavigate();
  const user = getUser();
  const isTechnician = user?.role === 'TECHNICIAN';

  const handleNavigation = (section) => {
    setActiveSection(section);
    switch (section) {
      case 'dashboard':
        navigate(isTechnician ? '/my-jobs' : '/dashboard');
        break;
      case 'my-tickets':
        navigate('/tickets');
        break;
      case 'my-jobs':
        navigate('/my-jobs');
        break;
      case 'create-ticket':
        navigate('/tickets/create');
        break;
      case 'profile':
        navigate('/profile');
        break;
      default:
        break;
    }
  };

  const menuItems = isTechnician
    ? [
        {
          section: 'MAIN',
          items: [
            { name: 'Dashboard', id: 'dashboard', icon: '📊' },
            { name: 'My Job Details', id: 'my-jobs', icon: '🛠️' },
          ],
        },
      ]
    : [
        {
          section: 'MAIN',
          items: [
            { name: 'Dashboard', id: 'dashboard', icon: '📊' },
            { name: 'My Tickets', id: 'my-tickets', icon: '🎫' }
          ]
        },
        {
          section: 'ACTIONS',
          items: [
            { name: 'Create Ticket', id: 'create-ticket', icon: '➕' }
          ]
        }
      ];

  return (
    <div className="w-64 bg-slate-800 text-white flex flex-col shadow-lg">
      {/* Logo */}
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center font-bold">
            SC
          </div>
          <div>
            <h1 className="text-sm font-bold">Smart Campus</h1>
            <p className="text-xs text-slate-400">Operations Hub</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-6">
        {menuItems.map((section) => (
          <div key={section.section}>
            <p className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">
              {section.section}
            </p>
            <div className="space-y-2">
              {section.items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-3 ${
                    activeSection === item.id
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-200 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.name}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* User Info */}
      <div className="p-4 border-t border-slate-700">
        {isAuthenticated() && user ? (
          <div>
            <div className="bg-slate-700 rounded-lg p-3 mb-3">
              <p className="text-xs text-slate-300 font-semibold uppercase mb-1">Logged in as</p>
              <p className="text-sm font-bold text-white truncate">{user.name}</p>
              <p className="text-xs text-slate-400 capitalize">{user.role}</p>
            </div>
            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="w-full bg-red-600 hover:bg-red-700 text-white text-sm py-2 px-3 rounded-lg transition-colors font-medium"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <button
            onClick={() => navigate('/login')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 px-3 rounded-lg transition-colors font-medium"
          >
            Sign In
          </button>
        )}
      </div>
    </div>
  );
};

export default UserSideNavigation;
