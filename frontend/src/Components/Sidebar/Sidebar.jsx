import React, { useState } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import logo from '../../assets/RRSU1 logo.png'
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
    navigate('/LoginUsers');
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className='Sidebar'>
      <div className="logo-container">
        <img src={logo} alt="Logo" className="h-20 w-auto object-contain" />
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
            <Link className={`nav-link ${isActive('/Dashboard/failsafe-verification') ? 'active' : ''}`} to={"/Dashboard/failsafe-verification"}>Summarized Applications</Link>
          </li>

          <li>
            <Link className={`nav-link ${isActive('/Dashboard/applications') ? 'active' : ''}`} to={"/Dashboard/applications"}>Applications</Link>
          </li>

          <li><Link className={`nav-link ${isActive('/Dashboard/status-management') ? 'active' : ''}`} to={"/Dashboard/status-management"}>Status Management</Link></li>

          <li>
            <Link className={`nav-link ${isActive('/Dashboard/declined-applicant') ? 'active' : ''}`} to={"/Dashboard/declined-applicant"}>Declined Applicant</Link>
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
        <button className='logout-btn' onClick={handleLogout}>Logout</button>
      </nav>
    </div>
  )
}

export default Sidebar
