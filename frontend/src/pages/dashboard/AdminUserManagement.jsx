import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSideNavigation from '../../components/admin/AdminSideNavigation';

const AdminUserManagement = () => {
  const [activeSection, setActiveSection] = useState('users');
  const navigate = useNavigate();

  const handleNavigation = (section) => {
    if (section === 'users') {
      navigate('/admin/user-management');
    } else if (section === 'dashboard') {
      navigate('/admin/dashboard-new');
    } else {
      setActiveSection(section);
    }
  };
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'USER',
    password: '',
    status: 'Active'
  });

  // Fetch users from backend API
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8083/api/users');
      if (response.ok) {
        const data = await response.json();
        // Transform data to include status and provider fields if not present
        const transformedUsers = data.map(user => ({
          ...user,
          status: user.status || 'Active',
          provider: user.provider || 'Local'
        }));
        setUsers(transformedUsers);
      } else {
        console.error('Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.userId && user.userId.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (user.id && user.id.toString().toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const handleAddUser = async () => {
    try {
      console.log('Adding user:', formData);
      const response = await fetch('http://localhost:8083/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          role: formData.role,
          password: formData.password
        })
      });

      if (response.ok) {
        // User created successfully, refresh users list
        await fetchUsers();
        setShowAddUserModal(false);
        setFormData({ name: '', email: '', phone: '', role: 'USER', password: '', status: 'Active' });
      } else {
        const error = await response.text();
        console.error('Failed to add user:', error);
        alert('Failed to add user: ' + error);
      }
    } catch (error) {
      console.error('Error adding user:', error);
      alert('Error adding user');
    }
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      role: user.role,
      password: ''
    });
    setShowAddUserModal(true);
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        const response = await fetch(`http://localhost:8083/api/users/${userId}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          await fetchUsers();
          console.log('User deleted successfully:', userId);
        } else {
          const error = await response.text();
          console.error('Failed to delete user:', error);
          alert('Failed to delete user: ' + error);
        }
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Error deleting user');
      }
    }
  };

  const handleUpdateUser = async () => {
    try {
      console.log('Updating user:', editingUser.id, formData);
      const response = await fetch(`http://localhost:8083/api/users/${editingUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          role: formData.role,
          password: formData.password
        })
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUsers(users.map(user => 
          user.id === editingUser.id ? { ...updatedUser, status: 'Active', provider: 'Local' } : user
        ));
        setShowAddUserModal(false);
        setEditingUser(null);
        setFormData({ name: '', email: '', phone: '', role: 'USER', password: '' });
      } else {
        const error = await response.text();
        console.error('Failed to update user:', error);
        alert('Failed to update user: ' + error);
      }
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Error updating user');
    }
  };

  const handleToggleUserStatus = async (user) => {
    try {
      const response = await fetch(`http://localhost:8083/api/users/${user.id}/status`, {
        method: 'PATCH'
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUsers(users.map(u => 
          u.id === user.id ? updatedUser : u
        ));
        console.log('User status toggled successfully:', user.id);
      } else {
        const error = await response.text();
        console.error('Failed to toggle user status:', error);
        alert('Failed to toggle user status: ' + error);
      }
    } catch (error) {
      console.error('Error toggling user status:', error);
      alert('Error toggling user status');
    }
  };


  const getRoleColor = (role) => {
    switch (role) {
      case 'ADMIN': return 'bg-purple-100 text-purple-800';
      case 'TECHNICIAN': return 'bg-blue-100 text-blue-800';
      case 'USER': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'bg-emerald-100 text-emerald-800';
      case 'Deactive': return 'bg-rose-100 text-rose-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getProviderColor = (provider) => {
    switch (provider) {
      case 'Google': return 'bg-blue-100 text-blue-800';
      case 'Local': return 'bg-slate-100 text-slate-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex h-screen bg-slate-950">
      <AdminSideNavigation 
        activeSection={activeSection} 
        setActiveSection={handleNavigation} 
      />

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <div className="bg-slate-900 border-b border-slate-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">User Management</h1>
              <p className="text-slate-400 text-sm">Manage system users and permissions</p>
            </div>
            <button
              onClick={() => setShowAddUserModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              + Add User
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Filters */}
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Search Users</label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name, email, or user ID..."
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Filter by Role</label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                >
                  <option value="all">All Roles</option>
                  <option value="ADMIN">Admin</option>
                  <option value="TECHNICIAN">Technician</option>
                  <option value="USER">User</option>
                </select>
              </div>
              <div className="flex items-end">
                <div className="text-sm text-slate-400">
                  Total Users: <span className="text-white font-medium">{filteredUsers.length}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-slate-400">Loading users...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">User ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Provider</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-slate-700/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{user.userId}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center mr-3">
                              <span className="text-white text-sm font-medium">
                                {user.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <span className="text-sm text-white">{user.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{user.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleColor(user.role)}`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(user.status)}`}>
                            {user.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getProviderColor(user.provider)}`}>
                            {user.provider}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditUser(user)}
                              className="text-blue-400 hover:text-blue-300 transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleToggleUserStatus(user)}
                              className="text-orange-400 hover:text-orange-300 transition-colors"
                            >
                              {user.status === 'Active' ? 'Deactivate' : 'Activate'}
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="text-red-400 hover:text-red-300 transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Add/Edit User Modal */}
        {showAddUserModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-slate-800 rounded-lg p-6 w-full max-w-md border border-slate-700">
              <h2 className="text-lg font-semibold text-white mb-4">
                {editingUser ? 'Edit User' : 'Add New User'}
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Enter user name"
                    autoComplete="off"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Enter email address"
                    autoComplete="off"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Enter phone number"
                    autoComplete="off"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  >
                    <option value="USER">User</option>
                    <option value="TECHNICIAN">Technician</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  >
                    <option value="Active">Active</option>
                    <option value="Deactive">Deactive</option>
                  </select>
                </div>
                {!editingUser && (
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder="Enter password"
                      autoComplete="new-password"
                    />
                  </div>
                )}
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowAddUserModal(false);
                    setEditingUser(null);
                    setFormData({ name: '', email: '', phone: '', role: 'USER', password: '' });
                  }}
                  className="flex-1 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={editingUser ? handleUpdateUser : handleAddUser}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingUser ? 'Update' : 'Add'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default AdminUserManagement;
