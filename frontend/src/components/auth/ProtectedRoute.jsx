import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { defaultDashboardPath, getUser, isAuthenticated } from '../../utils/auth';

const ProtectedRoute = ({ children, roles }) => {
  const location = useLocation();

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (Array.isArray(roles) && roles.length > 0) {
    const userRole = getUser()?.role;
    if (!roles.includes(userRole)) {
      return <Navigate to={defaultDashboardPath()} replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
