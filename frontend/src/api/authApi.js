import axios from 'axios';
import { getToken, getUser } from '../utils/auth';

const API_BASE = '/api';

const applyAuthHeader = () => {
  const token = getToken();
  const user = getUser();

  if (token) {
    axios.defaults.headers.common.Authorization = `Bearer ${token}`;
  }

  if (user?.id != null) {
    axios.defaults.headers.common['X-User-Id'] = String(user.id);
  } else {
    delete axios.defaults.headers.common['X-User-Id'];
  }

  if (user?.email) {
    axios.defaults.headers.common['X-Username'] = String(user.email);
  } else if (user?.name) {
    axios.defaults.headers.common['X-Username'] = String(user.name);
  } else {
    delete axios.defaults.headers.common['X-Username'];
  }
};

const authApi = {
  login: (username, password) =>
    axios.post(`${API_BASE}/auth/login`, {
      username,
      password,
    }),

  getTechnicians: async () => {
    applyAuthHeader();
    const res = await axios.get(`${API_BASE}/users/role/TECHNICIAN`);
    const list = Array.isArray(res.data) ? res.data : [];

    return {
      ...res,
      data: list.map((u) => ({
        id: u.id,
        username: u.email || u.userId || `technician-${u.id}`,
        displayName: u.name || u.email || u.userId || `Technician #${u.id}`,
        email: u.email,
        role: u.role,
        status: u.status,
      })),
    };
  },
};

export default authApi;
