import React from 'react'
import LoginForm from './Components/LoginForm'
import { Routes, Route } from 'react-router-dom'
import AdminDashboard from './Components/Admin/AdminDashboard'
import PersonnelDashboard from './Components/PersonnelRecruiter/PersonnelDashboard'

function App() {
  return (
    <>
      <Routes>
        <Route path='/' element={<LoginForm />} />
        <Route path='/Dashboard/*' element={<AdminDashboard />} />
        <Route path='/PersonnelDashboard/*' element={<PersonnelDashboard />} />
      </Routes>
    </>
  )
}

export default App
