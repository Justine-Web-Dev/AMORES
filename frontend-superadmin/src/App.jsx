import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useState } from 'react'
import LoginForm from '../../frontend/src/pages/auth/LoginForm'
import SuperAdminDashboard from './pages/Dashboard/Dashboard'

import PersonnelDashboard from '../../frontend/src/pages/Users/PersonnelRecruiter/PersonnelDashboard'
import InterviewMain from '../../frontend/src/pages/Users/Interviewer/InterviewMain'
import ProtectedRoute from '../../frontend/src/Components/ProtectedRoute'

import ForceChangePasswordModal from '../../frontend/src/Modals/ForceChangePasswordModal'

function ProtectedSuperAdminRoute({ children }) {
  const token = sessionStorage.getItem('token');
  const role = sessionStorage.getItem('role');
  const [showForcePasswordModal, setShowForcePasswordModal] = useState(
    sessionStorage.getItem('must_change_password') === 'true'
  );

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
          <ProtectedRoute allowedRole={["Recruiter"]}>
            <PersonnelDashboard />
          </ProtectedRoute>
        } 
      />

      {/* Interview Dashboard */}
      <Route 
        path="/InterviewDashboard/*" 
        element={
          <ProtectedRoute allowedRole={["Interviewer"]}>
            <InterviewMain />
          </ProtectedRoute>
        } 
      />
    </Routes>
  )
}

export default App