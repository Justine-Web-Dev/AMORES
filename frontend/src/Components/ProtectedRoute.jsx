import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRole }) => {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('role');

  // 1. Check if token exists
  if (!token) {
    // Not logged in - redirect to login
    return <Navigate to="/LoginUsers" replace />;
  }

  // 2. Check if role matches (if a specific role is required)
  if (allowedRole && userRole !== allowedRole) {
    // Authorized but wrong role - redirect to home or login
    // You could also redirect to an "Unauthorized" page
    return <Navigate to="/LoginUsers" replace />;
  }

  // 3. Authorized - render the dashboard
  return children;
};

export default ProtectedRoute;
