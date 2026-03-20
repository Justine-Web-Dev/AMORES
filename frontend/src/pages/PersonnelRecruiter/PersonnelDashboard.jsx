import React from 'react'
import { Routes, Route } from 'react-router-dom'
import SidebarRecruiter from '../../Components/Sidebar/SidebarRecruiter'
import ApplicantEvaluation from './ApplicantEvaluation'
import FailSafeVerification from './FailSafeVerification'
import StatusManagement from './StatusManagement'
import PersonnelOverview from './PersonnelOverview'
import './PersonnelDashboard.css'
import DeclinedApplicants from '../DeclinedApplicants'

function PersonnelDashboard() {
  return (
    <div className='PersonnelDashboard'>
      <SidebarRecruiter />
      <div className='main-content'>
        <Routes>
          <Route path="/" element={<PersonnelOverview />} />
          <Route path="/applicant-evaluation" element={<ApplicantEvaluation />} />
          <Route path="/fail-safe-verification" element={<FailSafeVerification />} />
          <Route path="/status-management" element={<StatusManagement />} />
          <Route path="/declined-applicants" element={<DeclinedApplicants />} />
        </Routes>
      </div>
    </div>
  )
}

export default PersonnelDashboard
