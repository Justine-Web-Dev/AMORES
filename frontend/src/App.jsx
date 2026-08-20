import React from 'react'
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
import ForgotPassword from './pages/auth/ForgotPassword'
import ResetPassword from './pages/auth/ResetPassword'

function App() {
  return (
    <>
      <Routes>
        <Route 
          path='/Dashboard/*' 
          element={
            <ProtectedRoute allowedRole="Administrator">
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />

        <Route 
          path='/PersonnelDashboard/*' 
          element={
            <ProtectedRoute allowedRole={["Recruitment Personnel"]}>
              <PersonnelDashboard />
            </ProtectedRoute>
          } 
        />

        {/* Secure Interview Dashboard */}
        <Route 
          path='/InterviewDashboard/*' 
          element={
            <ProtectedRoute allowedRole={["Recruitment Screening Committee (Interviewer)"]}>
              <InterviewMain />
            </ProtectedRoute>
          } 
        />

        <Route path='/success-submit' element={<SubmitApplicationModal />} />
        <Route path='/disclaimer' element={<Disclaimer />} />
        
        <Route path='/forgot-password' element={<ForgotPassword />} />
        <Route path='/reset-password' element={<ResetPassword />} />
        
        <Route path='/*' element={<LandingpageMain />} />
        <Route path='/application-type' element={<ApplicationTypeModal/>}/>
        <Route path='/instruction-reapply' element={ <InstructionReApply />}/>

        <Route path='*' element={<NotFound />} />
      </Routes>
    </>
  )
}

export default App
