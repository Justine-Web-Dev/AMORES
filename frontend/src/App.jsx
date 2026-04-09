import React from 'react'
import LoginForm from './pages/LoginForm'
import { Routes, Route } from 'react-router-dom'
import AdminDashboard from './pages/Admin/AdminDashboard'
import PersonnelDashboard from './pages/PersonnelRecruiter/PersonnelDashboard'
import LandingpageMain from './pages/Landingpage/LandingpageMain'
import TrackApplication from './pages/Landingpage/TrackApplication'
import SubmitApplicationModal from './Modals/SubmitApplicationModal'
import ViewDetails from './pages/ViewDetails'
import Disclaimer from './Disclaimer'

function App() {
  return (
    <>
      <Routes>
        <Route path='/LoginUsers' element={<LoginForm />} />
        <Route path='/Dashboard/*' element={<AdminDashboard />} />
        <Route path='/PersonnelDashboard/*' element={<PersonnelDashboard />} />
        <Route path='/success-submit' element={<SubmitApplicationModal />} />
        <Route path='/*' element={<LandingpageMain />}/>
        <Route path='/disclaimer' element = {<Disclaimer />}/>
      </Routes>
    </>
  )
}

export default App
