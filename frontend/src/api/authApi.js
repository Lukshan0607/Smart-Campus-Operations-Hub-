import axios from 'axios';

const API_BASE = '/api';

const authApi = {
  login: (username, password) =>
    axios.post(`${API_BASE}/auth/login`, {
      username,
      password,
    }),
};

export default authApi;
