import React from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import logo from '../assets/RRSU1 logo.png'
import './Sidebar.css'

function SidebarRecruiter() {
  const navigate = useNavigate();
  const location = useLocation();

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
          <li><Link className={`nav-link ${isActive('/PersonnelDashboard') ? 'active' : ''}`} to={"/PersonnelDashboard"}>Dashboard</Link></li>
          <li><Link className={`nav-link ${isActive('/PersonnelDashboard/fail-safe-verification') ? 'active' : ''}`} to={"/PersonnelDashboard/fail-safe-verification"}>Fail-safe Verification</Link></li>
          <li><Link className={`nav-link ${isActive('/PersonnelDashboard/status-management') ? 'active' : ''}`} to={"/PersonnelDashboard/status-management"}>Status Management</Link></li>
        </ul>
      </nav>

      <button className='logout-btn' onClick={handleLogout}>Logout</button>
    </div>
  )
}

export default SidebarRecruiter
