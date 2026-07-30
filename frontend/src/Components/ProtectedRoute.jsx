import React, { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import ForceChangePasswordModal from '../Modals/ForceChangePasswordModal';

const ProtectedRoute = ({ children, allowedRole }) => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('role');
  const [showForcePasswordModal, setShowForcePasswordModal] = useState(localStorage.getItem('must_change_password') === 'true');

  const checkTokenStatus = () => {
    if (!token) return { valid: false, timeRemaining: 0 };
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      const payload = JSON.parse(jsonPayload);
      
      if (payload.exp) {
        const timeRemaining = (payload.exp * 1000) - Date.now();
        return { valid: timeRemaining > 0, timeRemaining };
      }
      return { valid: true, timeRemaining: null };
    } catch (e) {
      return { valid: false, timeRemaining: 0 };
    }
  };

  const { valid, timeRemaining } = checkTokenStatus();

  const getLoginPath = () => {
    return window.location.port === '5174' ? '/login' : '/LoginUsers';
  };

  useEffect(() => {
    if (!valid) {
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      navigate(getLoginPath(), { replace: true });
    } else if (timeRemaining !== null && timeRemaining > 0) {
      const timer = setTimeout(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        navigate(getLoginPath(), { replace: true });
      }, timeRemaining);

      return () => clearTimeout(timer);
    }
  }, [valid, timeRemaining, navigate]);

  // 1. Check if token exists and is valid
  if (!token || !valid) {
    // Not logged in or token expired - redirect to login
    return <Navigate to={getLoginPath()} replace />;
  }

  // 2. Check if role matches (if a specific role is required)
  if (allowedRole) {
    const roles = Array.isArray(allowedRole) ? allowedRole : [allowedRole];
    if (!roles.includes(userRole)) {
      return <Navigate to={getLoginPath()} replace />;
    }
  }

  // 3. Authorized - render the dashboard
  return (
    <>
      {children}
      <ForceChangePasswordModal 
        isOpen={showForcePasswordModal}
        token={token}
        onSuccess={() => {
          setShowForcePasswordModal(false);
          localStorage.setItem('must_change_password', 'false');
        }}
      />
    </>
  );
};

export default ProtectedRoute;
