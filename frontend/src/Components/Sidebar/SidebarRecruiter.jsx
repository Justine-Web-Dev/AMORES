import React from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import logo from '../../assets/RRSU1 logo.png'
import './Sidebar.css'

function SidebarRecruiter() {
  const navigate = useNavigate();
  const location = useLocation();

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

      <nav className='sidebar'>
        <ul>
          <li><Link className={`nav-link ${isActive('/PersonnelDashboard') ? 'active' : ''}`} to={"/PersonnelDashboard"}>Dashboard</Link></li>

          <li><Link className={`nav-link ${isActive('/PersonnelDashboard/fail-safe-verification') ? 'active' : ''}`} to={"/PersonnelDashboard/fail-safe-verification"}>Summarized Applications</Link></li>

          <li><Link className={`nav-link ${isActive('/PersonnelDashboard/applications') ? 'active' : ''}`} to={"/PersonnelDashboard/applications"}>Applications</Link></li>

          <li><Link className={`nav-link ${isActive('/PersonnelDashboard/status-management') ? 'active' : ''}`} to={"/PersonnelDashboard/status-management"}>Status Management</Link></li>

          <li><Link className={`nav-link ${isActive('/PersonnelDashboard/declined-applicants') ? 'active' : ''}`} to={"/PersonnelDashboard/declined-applicants"}>Declined Applicant</Link></li>
        </ul>
        <button className='logout-btn' onClick={handleLogout}>Logout</button>
      </nav>
    </div>
  )
}

export default SidebarRecruiter
