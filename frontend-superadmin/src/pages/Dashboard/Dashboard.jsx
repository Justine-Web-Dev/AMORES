import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from '../../../../frontend/src/Components/Sidebar/Sidebar';
import Header from '../../../../frontend/src/Components/Header/Header';
import '../../../../frontend/src/pages/Users/Admin/AdminDashboard.css';

import SuperAdminHome from './SuperAdminHome';
import DashboardOverview from '../../../../frontend/src/pages/Users/Admin/DashboardOverview';
import GlobalSettings from '../../../../frontend/src/pages/Users/Admin/GlobalSettings';
import AuditLogs from '../../../../frontend/src/pages/Users/Admin/AuditLogs';
import SystemSettings from '../../../../frontend/src/pages/Users/Admin/SystemSettings';
import ApplicantEvaluation from '../../../../frontend/src/pages/Users/PersonnelRecruiter/ApplicantEvaluation';
import ViewDetails from '../../../../frontend/src/pages/ViewDetails';
import UserManagement from '../../../../frontend/src/pages/Users/Admin/UserManagement';
import DeclinedApplicants from '../../../../frontend/src/pages/DeclinedApplicants';
import GenerateReport from '../../../../frontend/src/pages/GenerateReport';
import BackupRestore from '../../../../frontend/src/pages/Users/Admin/BackupRestore';
import AccountSettings from '../../../../frontend/src/pages/Settings/AccountSettings';

function Dashboard() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const role = localStorage.getItem('role');

  return (
    <div className='AdminDashboard'>
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <div className={`main-content ${isCollapsed ? 'collapsed' : ''}`}>
        <Header />
        <Routes>
          <Route path="/" element={role === 'SUPER_ADMIN' ? <SuperAdminHome /> : <DashboardOverview />} />
          <Route path="/home" element={role === 'SUPER_ADMIN' ? <SuperAdminHome /> : <DashboardOverview />} />
          <Route path="/accounts" element={<UserManagement />} />
          <Route path="/global-settings" element={<GlobalSettings />} />
          <Route path="/audit-logs" element={<AuditLogs />} />
          <Route path="/backup-restore" element={<BackupRestore />} />
          <Route path="/system-settings" element={<SystemSettings />} />
          
          {/* Administrator Routes imported from frontend */}
          <Route path="/applications" element={<ApplicantEvaluation />} />
          <Route path="/view-details/:id" element={<ViewDetails />} />
          <Route path="/user-management" element={<UserManagement />} />
          <Route path="/declined-applicant" element={<DeclinedApplicants />} />
          <Route path="/generate-report" element={<GenerateReport />} />
          <Route path="/account-settings" element={<AccountSettings />} />
        </Routes>
      </div>
    </div>
  );
}

export default Dashboard;
