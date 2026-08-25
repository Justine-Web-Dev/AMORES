import React from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import LoginForm from '../../frontend/src/pages/auth/LoginForm'
import ForgotPassword from '../../frontend/src/pages/auth/ForgotPassword'
import ResetPassword from '../../frontend/src/pages/auth/ResetPassword'
import SuperAdminDashboard from './pages/Dashboard/Dashboard'

import PersonnelDashboard from '../../frontend/src/pages/Users/PersonnelRecruiter/PersonnelDashboard'
import InterviewMain from '../../frontend/src/pages/Users/Interviewer/InterviewMain'
import ProtectedRoute from '../../frontend/src/Components/ProtectedRoute'

import ForceChangePasswordModal from '../../frontend/src/Modals/ForceChangePasswordModal'
import MessageModal from '../../frontend/src/Modals/MessageModal'

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

function ProtectedSuperAdminRoute({ children }) {
  const navigate = useNavigate();
  const token = sessionStorage.getItem('token');
  const role = sessionStorage.getItem('role');
  const tokenExpiry = getTokenExpiry(token);
  const [showSessionExpiredModal, setShowSessionExpiredModal] = useState(false);
  const [showForcePasswordModal, setShowForcePasswordModal] = useState(
    sessionStorage.getItem('must_change_password') === 'true'
  );

  useEffect(() => {
    const handleSessionExpired = () => {
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('role');
      setShowSessionExpiredModal(true);
    };

    window.addEventListener('auth:session-expired', handleSessionExpired);

    if (token && (!tokenExpiry || tokenExpiry <= Date.now())) {
      handleSessionExpired();
      return () => window.removeEventListener('auth:session-expired', handleSessionExpired);
    }

    if (token && tokenExpiry) {
      const timer = setTimeout(handleSessionExpired, tokenExpiry - Date.now());
      return () => {
        clearTimeout(timer);
        window.removeEventListener('auth:session-expired', handleSessionExpired);
      };
    }

    return () => window.removeEventListener('auth:session-expired', handleSessionExpired);
  }, [token, tokenExpiry]);

  React.useEffect(() => {
    // Push 15 identical states on load. This creates a massive history buffer.
    // If the user clicks back multiple times rapidly, they will just land on another
    // dashboard state instead of escaping to Google.
    for (let i = 0; i < 15; i++) {
      window.history.pushState(null, "", window.location.pathname);
    }
    
    const handlePopState = () => {
      // Push another state whenever they hit back, redirecting them instantly to the dashboard
      window.history.pushState(null, "", window.location.pathname);
    };
    
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  if (showSessionExpiredModal) {
    return (
      <>
        {children}
        <MessageModal
          isOpen
          onClose={() => {
            setShowSessionExpiredModal(false);
            navigate('/login', { replace: true });
          }}
          type="error"
          title="Login Session Expired"
          message="Your login session has expired. Please log in again to continue."
          lightBackdrop
        />
      </>
    );
  }

  if (!token || (role !== 'SUPER_ADMIN' && role !== 'Administrator')) {
    return <Navigate to="/login" replace />;
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
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} /> 
      <Route path="/login" element={<LoginForm />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      
      {/* Super Admin & Admin Dashboard */}
      <Route 
        path="/Dashboard/*" 
        element={
          <ProtectedSuperAdminRoute>
            <SuperAdminDashboard />
          </ProtectedSuperAdminRoute>
        } 
      />

      {/* Personnel Dashboard */}
      <Route 
        path="/PersonnelDashboard/*" 
        element={
          <ProtectedRoute allowedRole={["Recruitment Personnel"]}>
            <PersonnelDashboard />
          </ProtectedRoute>
        } 
      />

      {/* Interview Dashboard */}
      <Route 
        path="/InterviewDashboard/*" 
        element={
          <ProtectedRoute allowedRole={["Recruitment Screening Committee (Interviewer)"]}>
            <InterviewMain />
          </ProtectedRoute>
        } 
      />
    </Routes>
  )
}

export default App