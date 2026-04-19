import React, { useState, useEffect } from 'react';
import { FiMenu, FiX, FiUser, FiLogOut, FiSettings, FiBell } from 'react-icons/fi';
import notificationApi from '../api/notificationApi';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const storedUser = localStorage.getItem("sc_user");

    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Fetch notifications when user is logged in
  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isNotificationOpen && !event.target.closest('.notification-dropdown')) {
        setIsNotificationOpen(false);
      }
      if (isProfileOpen && !event.target.closest('.profile-dropdown')) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isNotificationOpen, isProfileOpen]);

  const fetchNotifications = async () => {
    try {
      const response = await notificationApi.getMyNotifications();
      setNotifications(response.data || []);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  const markNotificationAsRead = async (id) => {
    try {
      await notificationApi.markAsRead(id);
      fetchNotifications(); // Refresh notifications
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const getUnreadCount = () => {
    return notifications.filter(n => !n.read).length;
  };

  const navigateTo = (path) => {
    window.location.assign(path);
  };

  const handleProfileClick = () => {
    setIsProfileOpen(false);
    navigateTo('/profile');
  };

  const handleLogout = () => {
    localStorage.removeItem("sc_token");
    localStorage.removeItem("sc_user");
    setUser(null);
    window.location.href = "/login";
  };

  const navigation = [
    { name: 'Home', href: '/', current: window.location.pathname === '/' },
    { name: 'Resources', href: '/resources', current: window.location.pathname === '/resources' },
    { name: 'Bookings', href: '/my-bookings', current: window.location.pathname === '/my-bookings' },
    { name: 'Tickets', href: '/tickets', current: window.location.pathname === '/tickets' },
  ];

  return (
    <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <nav className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <span className="ml-2 text-xl font-bold text-gray-900">
              SmartUni Hub
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navigation.map((item) => (
                <button
                  key={item.name}
                  onClick={() => navigateTo(item.href)}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    item.current
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {item.name}
                </button>
              ))}
            </div>
          </div>

          {/* Right Side */}
          <div className="hidden md:flex items-center space-x-4">

            {/* If user NOT logged in */}
            {!user ? (
              <button
                onClick={() => navigateTo('/login')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
              >
                Sign In
              </button>
            ) : (
              <div className="relative flex items-center gap-3">

                {/* Notification Bell */}
                <div className="relative">
                  <button
                    onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                    className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <FiBell className="w-5 h-5 text-gray-600" />
                    {getUnreadCount() > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {getUnreadCount()}
                      </span>
                    )}
                  </button>

                  {/* Notification Dropdown */}
                  {isNotificationOpen && (
                    <div className="notification-dropdown absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                      <div className="p-4 border-b border-gray-200">
                        <h3 className="font-semibold text-gray-900">Notifications</h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {getUnreadCount()} unread
                        </p>
                      </div>
                      
                      <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="p-4 text-center text-gray-500">
                            <p>No notifications</p>
                          </div>
                        ) : (
                          notifications.map((notification) => (
                            <div
                              key={notification.id}
                              className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                                !notification.read ? 'bg-blue-50' : ''
                              }`}
                              onClick={() => markNotificationAsRead(notification.id)}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h4 className={`text-sm font-medium ${
                                    !notification.read ? 'text-gray-900' : 'text-gray-600'
                                  }`}>
                                    {notification.title}
                                  </h4>
                                  <p className="text-sm text-gray-500 mt-1">
                                    {notification.message}
                                  </p>
                                  <p className="text-xs text-gray-400 mt-2">
                                    {new Date(notification.createdAt).toLocaleString()}
                                  </p>
                                </div>
                                {!notification.read && (
                                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                      
                      {notifications.length > 0 && (
                        <div className="p-3 border-t border-gray-200">
                          <button
                            onClick={() => {
                              // Mark all as read functionality could be added here
                              setIsNotificationOpen(false);
                            }}
                            className="w-full text-center text-sm text-blue-600 hover:text-blue-700"
                          >
                            Close
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* User Name */}
                <span className="text-gray-700 font-medium">
                  {user.name || user.fullName || "User"}
                </span>

                {/* Profile Button */}
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100"
                >
                  {user?.profilePicture ? (
                    <img
                      src={user.profilePicture}
                      alt="Profile"
                      className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-sm"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                      <FiUser className="w-4 h-4 text-white" />
                    </div>
                  )}
                </button>

                {/* Dropdown */}
                {isProfileOpen && (
                  <div className="profile-dropdown click-outside absolute right-0 mt-12 w-48 bg-white rounded-lg shadow-lg border py-1 z-50">

                    <button
                      onClick={handleProfileClick}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                    >
                      <div className="flex items-center gap-2">
                        <FiUser /> Profile
                      </div>
                    </button>

                    <a href="#settings" className="block px-4 py-2 text-sm hover:bg-gray-100">
                      <div className="flex items-center gap-2">
                        <FiSettings /> Settings
                      </div>
                    </a>

                    <hr />

                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <div className="flex items-center gap-2">
                        <FiLogOut /> Logout
                      </div>
                    </button>

                  </div>
                )}

              </div>
            )}

          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <FiX /> : <FiMenu />}
            </button>
          </div>

        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-3 space-y-2">

            {navigation.map((item) => (
              <button
                key={item.name}
                onClick={() => navigateTo(item.href)}
                className="block w-full text-left px-3 py-2 rounded-md text-gray-600 hover:bg-gray-50"
              >
                {item.name}
              </button>
            ))}

            {!user ? (
              <button
                onClick={() => navigateTo('/login')}
                className="w-full bg-blue-600 text-white px-3 py-2 rounded-md"
              >
                Sign In
              </button>
            ) : (
              <button
                onClick={handleLogout}
                className="w-full bg-red-500 text-white px-3 py-2 rounded-md"
              >
                Sign Out
              </button>
            )}

          </div>
        )}

      </nav>
    </header>
  );
};

export default Header;