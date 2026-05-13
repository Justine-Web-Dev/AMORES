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
import Logout from '../../Modals/Logout'

function AdminDashboard() {
  // Advanced Double-Buffered History Guard: Prevents exiting to New Tab
  React.useEffect(() => {
    const lockHistory = () => {
      window.history.forward();
    };

    // Create the buffer
    window.history.pushState(null, null, window.location.href);
    
    // Listen for back-button attempts
    window.addEventListener('popstate', lockHistory);

    return () => window.removeEventListener('popstate', lockHistory);
  }, []);

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
          <Route path="logout" element={<Logout />} />
        </Routes>
      </div>
    </div>
  )
}

export default AdminDashboard
