import React from 'react'
import { Routes, Route } from 'react-router-dom'
import SidebarRecruiter from '../../Components/Sidebar/SidebarRecruiter'
import ApplicantEvaluation from './ApplicantEvaluation'
import StatusManagement from './StatusManagement'
import PersonnelOverview from './PersonnelOverview'
import './PersonnelDashboard.css'
import DeclinedApplicants from '../DeclinedApplicants'
import Header from '../../Components/Header/Header'

function PersonnelDashboard() {
  return (
    <div className='PersonnelDashboard'>
      <SidebarRecruiter />
      <div className='main-content'>
        <Header />
        <Routes>
          <Route path="/" element={<PersonnelOverview />} />
          <Route path="/applications" element={<ApplicantEvaluation />} />
          <Route path="/declined-applicants" element={<DeclinedApplicants />} />
        </Routes>
      </div>
    </div>
  )
}

export default PersonnelDashboard
