import { useEffect, useState } from 'react';
import { FiUser, FiMail, FiPhone, FiCalendar, FiMapPin, FiEdit2, FiSave, FiX, FiShield, FiBookOpen, FiTool, FiClock, FiCamera, FiUpload } from 'react-icons/fi';
import { getUser, setSession } from '../utils/auth';
import api from '../services/api';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function UserProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('profile');
  const [bookings, setBookings] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePictureUrl, setProfilePictureUrl] = useState('');
  const [uploadingPicture, setUploadingPicture] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    department: '',
    studentId: '',
    bio: ''
  });

  useEffect(() => {
    const currentUser = getUser();
    if (currentUser) {
      setUser(currentUser);
      setFormData({
        name: currentUser.name || currentUser.fullName || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '',
        department: currentUser.department || '',
        studentId: currentUser.studentId || '',
        bio: currentUser.bio || ''
      });
      setProfilePictureUrl(currentUser.profilePicture || '');
    }
    setLoading(false);

    // Load user's bookings and tickets
    if (currentUser) {
      loadUserActivity(currentUser.id);
    }
  }, []);

  const loadUserActivity = async (userId) => {
    try {
      // Load user bookings
      const bookingsResponse = await api.get(`/api/bookings/my?userId=${userId}`);
      setBookings(bookingsResponse.data || []);

      // Load user tickets (if tickets API exists)
      // const ticketsResponse = await api.get(`/api/tickets/my?userId=${userId}`);
      // setTickets(ticketsResponse.data || []);
    } catch (error) {
      console.error('Failed to load user activity:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    
    try {
      // Update user profile via API
      const response = await api.put('/api/users/profile', formData);
      
      // Update local storage
      const updatedUser = { ...user, ...formData };
      setSession(localStorage.getItem('sc_token'), updatedUser);
      setUser(updatedUser);
      
      setMessage('Profile updated successfully!');
      setEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
      setMessage(error?.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || user?.fullName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      department: user?.department || '',
      studentId: user?.studentId || '',
      bio: user?.bio || ''
    });
    setProfilePicture(null);
    setEditing(false);
    setMessage('');
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setMessage('Please select an image file (JPEG, PNG, etc.)');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setMessage('Image size should be less than 5MB');
        return;
      }

      setProfilePicture(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePictureUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadProfilePicture = async () => {
    if (!profilePicture) return;

    setUploadingPicture(true);
    setMessage('');

    try {
      const formData = new FormData();
      formData.append('profilePicture', profilePicture);

      const response = await api.post('/api/users/upload-profile-picture', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Update user data with new profile picture URL
      const updatedUser = { 
        ...user, 
        profilePicture: response.data.profilePictureUrl 
      };
      
      setSession(localStorage.getItem('sc_token'), updatedUser);
      setUser(updatedUser);
      setProfilePictureUrl(response.data.profilePictureUrl);
      setProfilePicture(null);
      
      setMessage('Profile picture updated successfully!');
    } catch (error) {
      console.error('Failed to upload profile picture:', error);
      setMessage(error?.response?.data?.message || 'Failed to upload profile picture');
    } finally {
      setUploadingPicture(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      APPROVED: 'bg-green-100 text-green-800',
      COMPLETED: 'bg-blue-100 text-blue-800',
      CANCELLED: 'bg-gray-100 text-gray-800',
      REJECTED: 'bg-red-100 text-red-800',
      OPEN: 'bg-blue-100 text-blue-800',
      'IN-PROGRESS': 'bg-orange-100 text-orange-800',
      RESOLVED: 'bg-green-100 text-green-800'
    };
    return statusMap[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto p-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-64 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((item) => (
                <div key={item} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">User Profile</h1>
          <p className="text-gray-600 mt-1">Manage your personal information and view your activity</p>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 rounded-lg px-4 py-3 text-sm ${
            message.includes('success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {message}
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('profile')}
                className={`py-4 px-6 border-b-2 font-medium text-sm ${
                  activeTab === 'profile'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FiUser className="inline mr-2" />
                Profile Information
              </button>
              <button
                onClick={() => setActiveTab('activity')}
                className={`py-4 px-6 border-b-2 font-medium text-sm ${
                  activeTab === 'activity'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FiClock className="inline mr-2" />
                Activity History
              </button>
            </nav>
          </div>

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="p-6">
              {/* Profile Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    {profilePictureUrl ? (
                      <img
                        src={profilePictureUrl}
                        alt="Profile"
                        className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg"
                      />
                    ) : (
                      <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                        <FiUser className="w-10 h-10 text-white" />
                      </div>
                    )}
                    {editing && (
                      <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-1 rounded-full cursor-pointer hover:bg-blue-700 transition">
                        <FiCamera className="w-3 h-3" />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleProfilePictureChange}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">{user?.name || user?.fullName || 'User'}</h2>
                    <p className="text-gray-500">{user?.role || 'User'}</p>
                  </div>
                </div>
                {!editing && (
                  <button
                    onClick={() => setEditing(true)}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <FiEdit2 className="mr-2" />
                    Edit Profile
                  </button>
                )}
              </div>

              {/* Profile Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FiUser className="inline mr-1" />
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    disabled={!editing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FiMail className="inline mr-1" />
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={!editing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FiPhone className="inline mr-1" />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    disabled={!editing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FiMapPin className="inline mr-1" />
                    Department
                  </label>
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    disabled={!editing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FiShield className="inline mr-1" />
                    Student/Staff ID
                  </label>
                  <input
                    type="text"
                    name="studentId"
                    value={formData.studentId}
                    onChange={handleInputChange}
                    disabled={!editing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FiCalendar className="inline mr-1" />
                    Member Since
                  </label>
                  <input
                    type="text"
                    value={user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                  />
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  disabled={!editing}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                  placeholder="Tell us about yourself..."
                />
              </div>

              {/* Profile Picture Upload Section */}
              {editing && profilePicture && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-900">New Profile Picture</p>
                      <p className="text-xs text-blue-700 mt-1">{profilePicture.name}</p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setProfilePicture(null);
                          setProfilePictureUrl(user?.profilePicture || '');
                        }}
                        className="px-3 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                      >
                        Remove
                      </button>
                      <button
                        onClick={uploadProfilePicture}
                        disabled={uploadingPicture}
                        className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                      >
                        {uploadingPicture ? 'Uploading...' : 'Upload'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              {editing && (
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={handleCancel}
                    disabled={saving}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    <FiX className="mr-2" />
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                  >
                    <FiSave className="mr-2" />
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Activity Tab */}
          {activeTab === 'activity' && (
            <div className="p-6">
              <div className="space-y-6">
                {/* Recent Bookings */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    <FiBookOpen className="inline mr-2" />
                    Recent Bookings
                  </h3>
                  {bookings.length === 0 ? (
                    <p className="text-gray-500">No bookings found</p>
                  ) : (
                    <div className="space-y-3">
                      {bookings.slice(0, 5).map((booking) => (
                        <div key={booking.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900">{booking.resourceName}</p>
                            <p className="text-sm text-gray-500">
                              {new Date(booking.startTime).toLocaleDateString()} - {booking.status}
                            </p>
                          </div>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(booking.status)}`}>
                            {booking.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Recent Tickets */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    <FiTool className="inline mr-2" />
                    Recent Tickets
                  </h3>
                  {tickets.length === 0 ? (
                    <p className="text-gray-500">No tickets found</p>
                  ) : (
                    <div className="space-y-3">
                      {tickets.slice(0, 5).map((ticket) => (
                        <div key={ticket.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900">{ticket.title}</p>
                            <p className="text-sm text-gray-500">
                              {new Date(ticket.createdAt).toLocaleDateString()} - {ticket.category}
                            </p>
                          </div>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(ticket.status)}`}>
                            {ticket.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
