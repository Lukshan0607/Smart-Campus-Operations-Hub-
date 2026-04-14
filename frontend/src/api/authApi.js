import axios from 'axios';

const API_BASE = '/api';

const authApi = {
  login: (username, password) =>
    axios.post(`${API_BASE}/auth/login`, {
      username,
      password,
    }),

  getTechnicians: () => axios.get(`${API_BASE}/auth/technicians`),
};

export default authApi;
