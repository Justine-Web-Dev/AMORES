import React from 'react'
import LoginForm from './pages/LoginForm'
import { Routes, Route } from 'react-router-dom'
import AdminDashboard from './pages/Admin/AdminDashboard'
import PersonnelDashboard from './pages/PersonnelRecruiter/PersonnelDashboard'
import LandingpageMain from './pages/Landingpage/LandingpageMain'

function App() {
  return (
    <>
      <Routes>
        <Route path='/*' element={<LandingpageMain />}/>
        <Route path='/LoginUsers' element={<LoginForm />} />
        <Route path='/Dashboard/*' element={<AdminDashboard />} />
        <Route path='/PersonnelDashboard/*' element={<PersonnelDashboard />} />

      </Routes>
    </>
  )
}

export default App
