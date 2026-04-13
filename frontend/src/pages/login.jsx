import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import authApi from '../api/authApi';
import { defaultDashboardPath, setSession } from '../utils/auth';

const DEMO_USERS = [
  { username: 'student1', role: 'STUDENT' },
  { username: 'lecturer1', role: 'LECTURER' },
  { username: 'technician1', role: 'TECHNICIAN' },
  { username: 'admin', role: 'ADMIN' },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = React.useState('admin');
  const [password, setPassword] = React.useState('password');
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const login = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authApi.login(username, password);
      const user = {
        username: res.data?.username || username,
        role: res.data?.role || 'STUDENT',
        userId: res.data?.userId || 1,
      };

      setSession(res.data?.token, user);
      axios.defaults.headers.common.Authorization = `Bearer ${res.data?.token}`;

      const redirectTo = location.state?.from?.pathname || defaultDashboardPath();
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-4">
      <div className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Smart Campus Hub</h1>
          <p className="text-gray-500 mt-2">Use demo credentials to login</p>
        </div>

        <form className="space-y-4" onSubmit={login}>
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="admin"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="password"
              required
            />
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <button
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 font-medium disabled:opacity-60"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="mt-6">
          <p className="text-sm text-gray-500 mb-2">Quick demo users:</p>
          <div className="grid grid-cols-2 gap-2">
            {DEMO_USERS.map((u) => (
              <button
                key={u.username}
                type="button"
                onClick={() => {
                  setUsername(u.username);
                  setPassword('password');
                }}
                className="text-left border rounded px-3 py-2 hover:bg-gray-50"
              >
                <div className="text-sm font-medium">{u.username}</div>
                <div className="text-xs text-gray-500">{u.role}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

