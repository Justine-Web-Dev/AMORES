import React from 'react'
import LoginForm from './pages/auth/LoginForm'
import { Routes, Route } from 'react-router-dom'
import AdminDashboard from './pages/Admin/AdminDashboard'
import PersonnelDashboard from './pages/PersonnelRecruiter/PersonnelDashboard'
import LandingpageMain from './pages/Landingpage/LandingpageMain'
import ProtectedRoute from './Components/ProtectedRoute'
import SubmitApplicationModal from './Modals/SubmitApplicationModal'
import Disclaimer from './Disclaimer'
import NotFound from './NotFound'

function App() {
  return (
    <>
      <Routes>
        <Route path='/LoginUsers' element={<LoginForm />} />
        {/* Secure Admin Dashboard */}
        <Route 
          path='/Dashboard/*' 
          element={
            <ProtectedRoute allowedRole="Administrator">
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />

        {/* Secure Personnel Dashboard */}
        <Route 
          path='/PersonnelDashboard/*' 
          element={
            <ProtectedRoute allowedRole="Recruiter">
              <PersonnelDashboard />
            </ProtectedRoute>
          } 
        />

        <Route path='/success-submit' element={<SubmitApplicationModal />} />
        <Route path='/disclaimer' element={<Disclaimer />} />
        
        {/* Landing Page & Sub-routes (Track, Form, etc.) handled by LandingpageMain */}
        <Route path='/*' element={<LandingpageMain />} />

        <Route path='*' element={<NotFound />} />
      </Routes>
    </>
  )
}

export default App
