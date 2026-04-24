import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Sidebar from '../../Components/Sidebar/Sidebar'
import Header from '../../Components/Header/Header'
import DashboardOverview from './DashboardOverview'
import UserManagement from './UserManagement'
import AuditLogs from './AuditLogs'
import BackupRestore from './BackupRestore'
import SystemSettings from './SystemSettings'
import './AdminDashboard.css'
import DeclinedApplicants from '../DeclinedApplicants'
import ApplicantEvaluation from '../PersonnelRecruiter/ApplicantEvaluation'
import ViewDetails from '../ViewDetails'
import Form from '../Form/Form'
import DocumentSubmission from '../Form/DocumentSubmission'
import SubmitApplicationModal from '../../Modals/SubmitApplicationModal'

function AdminDashboard() {
  return (
    <div className='AdminDashboard'>
      <Sidebar />
      <div className='main-content'>
        <Header />
        <Routes>
          <Route index element={<DashboardOverview />} />
          <Route path="applications" element={<ApplicantEvaluation />}/>
          <Route path="view-details/:id" element={<ViewDetails />}/>
          <Route path="user-management" element={<UserManagement />} />
          <Route path="declined-applicant" element={<DeclinedApplicants />} />
          <Route path="audit-logs" element={<AuditLogs />} />
          <Route path="backup-restore" element={<BackupRestore />} />
          <Route path="system-settings" element={<SystemSettings />} />
          <Route path="application-form" element={<Form />} />
          <Route path="document-submission" element={<DocumentSubmission />} />
          <Route path="success-submit" element={<SubmitApplicationModal />} />
        </Routes>
      </div>
    </div>
  )
}

export default AdminDashboard
