import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Sidebar from '../../Components/Sidebar/Sidebar'
import HeaderAdmin from '../../Components/Header/HeaderAdmin'
import DashboardOverview from './DashboardOverview'
import UserManagement from './UserManagement'
import RejectedApplicant from './RejectedApplicant'
import AuditLogs from './AuditLogs'
import BackupRestore from './BackupRestore'
import SystemSettings from './SystemSettings'
import './AdminDashboard.css'

function AdminDashboard() {
  return (
    <div className='AdminDashboard'>
      <Sidebar />
      <div className='main-content'>
        <HeaderAdmin />
        <Routes>
          <Route path="/" element={<DashboardOverview />} />
          <Route path="/user-management" element={<UserManagement />} />
          <Route path="/rejected-applicant" element={<RejectedApplicant />} />
          <Route path="/audit-logs" element={<AuditLogs />} />
          <Route path="/backup-restore" element={<BackupRestore />} />
          <Route path="/system-settings" element={<SystemSettings />} />
        </Routes>
      </div>
    </div>
  )
}

export default AdminDashboard
