import React from 'react'
import { Routes, Route } from 'react-router-dom'
import SidebarRecruiter from '../../Sidebar/SidebarRecruiter'
import ApplicantEvaluation from './ApplicantEvaluation'
import FailSafeVerification from './FailSafeVerification'
import StatusManagement from './StatusManagement'
import PersonnelOverview from './PersonnelOverview'
import './PersonnelDashboard.css'

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
        </Routes>
      </div>
    </div>
  )
}

export default PersonnelDashboard
