import React, { useState } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import logo from '../assets/RRSU1 logo.png'
import './Sidebar.css'

function Sidebar() {
  const [isSystemUtilitiesOpen, setIsSystemUtilitiesOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const toggleSystemUtilities = () => {
    setIsSystemUtilitiesOpen(!isSystemUtilitiesOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className='Sidebar'>
      <div className="logo-container">
        <img src={logo} alt="Logo" height={80}/>
        <p className='logo-title'>Application Management and Online Recruitment Evaluation System</p>
      </div>

      <nav>
        <ul>
          <li><Link className={`nav-link ${isActive('/Dashboard') ? 'active' : ''}`} to={"/Dashboard"}>Dashboard</Link></li>
          <li><Link className={`nav-link ${isActive('/Dashboard/user-management') ? 'active' : ''}`} to={"/Dashboard/user-management"}>User Management</Link></li>
          <li><Link className={`nav-link ${isActive('/Dashboard/rejected-applicant') ? 'active' : ''}`} to={"/Dashboard/rejected-applicant"}>Rejected Applicant</Link></li>
          <li className="system-utilities-dropdown">

            <div className="dropdown-header" onClick={toggleSystemUtilities}>
              System Utilities
              <span className={`arrow ${isSystemUtilitiesOpen ? 'open' : ''}`}>▼</span>
            </div>

            {isSystemUtilitiesOpen && (
              <ul className="dropdown-menu">
                <li><Link className={`nav-link dropdown-item ${isActive('/Dashboard/audit-logs') ? 'active' : ''}`} to={"/Dashboard/audit-logs"}>Audit logs</Link></li>
                <li><Link className={`nav-link dropdown-item ${isActive('/Dashboard/backup-restore') ? 'active' : ''}`} to={"/Dashboard/backup-restore"}>Backup & Restore</Link></li>
                <li><Link className={`nav-link dropdown-item ${isActive('/Dashboard/system-settings') ? 'active' : ''}`} to={"/Dashboard/system-settings"}>System Settings</Link></li>
              </ul>
            )}
          </li>
        </ul>
      </nav>

      <button className='logout-btn' onClick={handleLogout}>Logout</button>
    </div>
  )
}

export default Sidebar
