import React from 'react'
import LoginForm from './pages/auth/LoginForm'
import { Routes, Route } from 'react-router-dom'
import AdminDashboard from './pages/Users/Admin/AdminDashboard'
import PersonnelDashboard from './pages/Users/PersonnelRecruiter/PersonnelDashboard'
import InterviewMain from './pages/Users/Interviewer/InterviewMain'
import LandingpageMain from './pages/Landingpage/LandingpageMain'
import ProtectedRoute from './Components/ProtectedRoute'
import SubmitApplicationModal from './Modals/SubmitApplicationModal'
import Disclaimer from './Disclaimer'
import NotFound from './NotFound'
import ApplicationTypeModal from './Modals/ApplicationTypeModal'
import InstructionReApply from './Modals/InstructionReApply'

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
            <ProtectedRoute allowedRole={["Recruiter"]}>
              <PersonnelDashboard />
            </ProtectedRoute>
          } 
        />

        {/* Secure Interview Dashboard */}
        <Route 
          path='/InterviewDashboard/*' 
          element={
            <ProtectedRoute allowedRole={["Interviewer"]}>
              <InterviewMain />
            </ProtectedRoute>
          } 
        />

        <Route path='/success-submit' element={<SubmitApplicationModal />} />
        <Route path='/disclaimer' element={<Disclaimer />} />
        
        {/* Landing Page & Sub-routes (Track, Form, etc.) handled by LandingpageMain */}
        <Route path='/*' element={<LandingpageMain />} />
        <Route path='/application-type' element={<ApplicationTypeModal/>}/>
        <Route path='/instruction-reapply' element={ <InstructionReApply />}/>

        <Route path='*' element={<NotFound />} />
      </Routes>
    </>
  )
}

export default App
