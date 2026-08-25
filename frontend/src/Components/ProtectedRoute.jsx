import React, { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import ForceChangePasswordModal from '../Modals/ForceChangePasswordModal';
import MessageModal from '../Modals/MessageModal';

const getTokenExpiry = (token) => {
  if (!token) return null;

  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url
      .replace(/-/g, '+')
      .replace(/_/g, '/')
      .padEnd(Math.ceil(base64Url.length / 4) * 4, '=');
    const payload = JSON.parse(atob(base64));
    return payload.exp ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
};

const ProtectedRoute = ({ children, allowedRole }) => {
  const navigate = useNavigate();
  const token = sessionStorage.getItem('token');
  const userRole = sessionStorage.getItem('role');
  const [showForcePasswordModal, setShowForcePasswordModal] = useState(sessionStorage.getItem('must_change_password') === 'true');
  const tokenExpiry = getTokenExpiry(token);
  const [showSessionExpiredModal, setShowSessionExpiredModal] = useState(false);

  const getLoginPath = () => {
    return '/login';
  };

  useEffect(() => {
    const handleSessionExpired = () => {
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('role');
      setShowSessionExpiredModal(true);
    };

    window.addEventListener('auth:session-expired', handleSessionExpired);

    if (!token) {
      if (!showSessionExpiredModal) {
        navigate(getLoginPath(), { replace: true });
      }
      return () => window.removeEventListener('auth:session-expired', handleSessionExpired);
    }

    if (!tokenExpiry || tokenExpiry <= Date.now()) {
      handleSessionExpired();
      return () => window.removeEventListener('auth:session-expired', handleSessionExpired);
    }

    const timer = setTimeout(() => {
      handleSessionExpired();
    }, tokenExpiry - Date.now());

    return () => {
      clearTimeout(timer);
      window.removeEventListener('auth:session-expired', handleSessionExpired);
    };
  }, [navigate, token, tokenExpiry, showSessionExpiredModal]);

  const handleSessionExpiredClose = () => {
    setShowSessionExpiredModal(false);
    navigate(getLoginPath(), { replace: true });
  };

  if (showSessionExpiredModal) {
    return (
      <>
        {children}
        <MessageModal
          isOpen
          onClose={handleSessionExpiredClose}
          type="error"
          title="Login Session Expired"
          message="Your login session has expired. Please log in again to continue."
          lightBackdrop
        />
      </>
    );
  }

  // A token without a valid expiry cannot authorize a protected route.
  if (!token) {
    return <Navigate to={getLoginPath()} replace />;
  }

  // 1. Check the role before rendering the protected dashboard.
  if (allowedRole) {
    const roles = Array.isArray(allowedRole) ? allowedRole : [allowedRole];
    if (!roles.includes(userRole)) {
      return <Navigate to={getLoginPath()} replace />;
    }
  }

  return (
    <>
      {children}
      <ForceChangePasswordModal 
        isOpen={showForcePasswordModal}
        token={token}
        onSuccess={() => {
          setShowForcePasswordModal(false);
          sessionStorage.setItem('must_change_password', 'false');
        }}
      />
    </>
  );
};

export default ProtectedRoute;
