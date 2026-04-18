const TOKEN_KEY = 'sc_token';
const USER_KEY = 'sc_user';

export const getToken = () => localStorage.getItem(TOKEN_KEY);

export const getUser = () => {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const setSession = (token, user) => {
  localStorage.setItem(TOKEN_KEY, token || '');
  localStorage.setItem(USER_KEY, JSON.stringify(user || {}));
};

export const clearSession = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

export const logout = () => {
  clearSession();
};

export const isAuthenticated = () => Boolean(getToken());

export const hasRole = (role) => {
  const user = getUser();
  return user?.role === role;
};

export const defaultDashboardPath = () => {
  const role = getUser()?.role;
  if (role === 'TECHNICIAN') return '/my-jobs';
  if (role === 'ADMIN') return '/admin/dashboard-new';
  if (role === 'USER' || role === 'STUDENT' || role === 'LECTURER') return '/my-tickets';
  return '/my-tickets';
};
