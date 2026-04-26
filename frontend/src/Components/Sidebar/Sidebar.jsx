import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import logo from '../../assets/RRSU1 logo.png'
import './Sidebar.css'
import { CiLogout } from "react-icons/ci";
import Logout from '../../Modals/Logout';

function Sidebar() {
  const [showLogout, setShowLogout] = useState(false);
  const [isSystemUtilitiesOpen, setIsSystemUtilitiesOpen] = useState(false);
  const location = useLocation();

  const toggleSystemUtilities = () => {
    setIsSystemUtilitiesOpen(!isSystemUtilitiesOpen);
  };

  const handleLogout = () => {
    setShowLogout(true);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <>
      <div className='Sidebar'>
        <div className="logo-container-side">
          <img src={logo} alt="Logo" className="h-20 w-auto" />
          <p className='logo-title'>Application Management and Online Recruitment Evaluation System</p>
        </div>

        <nav className={`sidebar ${isSystemUtilitiesOpen ? 'dropdown-open' : ''}`}>
          <ul>
            <li>
              <Link className={`nav-link ${isActive('/Dashboard') ? 'active' : ''}`} to={"/Dashboard"}>Dashboard</Link>
            </li>

            <li>
              <Link className={`nav-link ${isActive('/Dashboard/user-management') ? 'active' : ''}`} to={"/Dashboard/user-management"}>User Management</Link>
            </li>

            <li>
              <Link className={`nav-link ${isActive('/Dashboard/applications') ? 'active' : ''}`} to={"/Dashboard/applications"}>Applications</Link>
            </li>

            <li>
              <Link className={`nav-link ${isActive('/Dashboard/declined-applicant') ? 'active' : ''}`} to={"/Dashboard/declined-applicant"}>Declined Applicant</Link>
            </li>

            <li>
              <Link className={`nav-link ${isActive('/Dashboard/application-form') ? 'active' : ''}`} to={"/Dashboard/application-form"}>Form Application</Link>
            </li>

            <li className="system-utilities-dropdown">

              <div className="dropdown-header" onClick={toggleSystemUtilities}>
                System Utilities
                <span className={`arrow ${isSystemUtilitiesOpen ? 'open' : ''}`}>▼</span>
              </div>

              {isSystemUtilitiesOpen && (
                <ul className="dropdown-menu">
                  <li><Link className={`nav-link dropdown-item ${isActive('/Dashboard/audit-logs') ? 'active' : ''}`} to={"/Dashboard/audit-logs"} onClick={() => setIsSystemUtilitiesOpen(false)}>Audit logs</Link></li>
                  <li><Link className={`nav-link dropdown-item ${isActive('/Dashboard/backup-restore') ? 'active' : ''}`} to={"/Dashboard/backup-restore"} onClick={() => setIsSystemUtilitiesOpen(false)}>Backup & Restore</Link></li>
                  <li><Link className={`nav-link dropdown-item ${isActive('/Dashboard/system-settings') ? 'active' : ''}`} to={"/Dashboard/system-settings"} onClick={() => setIsSystemUtilitiesOpen(false)}>System Settings</Link></li>
                </ul>
              )}
            </li>
          </ul>
          <button className=' flex justify-center items-center gap-2 logout-btn' onClick={handleLogout}> <CiLogout size={25}/> Logout</button>
        </nav>
      </div>
      {showLogout && <Logout setShowLogout={setShowLogout} />}
    </>
  )
}

export default Sidebar
