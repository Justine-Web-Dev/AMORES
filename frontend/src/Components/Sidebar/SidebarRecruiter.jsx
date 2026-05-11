import React, { useState } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import logo from '../../assets/RRSU1 logo.png'
import './Sidebar.css'
import { CiLogout } from "react-icons/ci";
import Logout from '../../Modals/Logout';

function SidebarRecruiter() {
  const [showLogout, setShowLogout] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

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
          <img src={logo} alt="Logo" className="h-20 w-auto object-contain" />
          <p className='logo-title'>Application Management and Online Recruitment Evaluation System</p>
        </div>

        <nav className='sidebar'>
          <ul>
            <li><Link className={`nav-link ${isActive('/PersonnelDashboard') ? 'active' : ''}`} to={"/PersonnelDashboard"}>Dashboard</Link></li>

            <li><Link className={`nav-link ${isActive('/PersonnelDashboard/applications') ? 'active' : ''}`} to={"/PersonnelDashboard/applications"}>Applications</Link></li>
            
            <li><Link className={`nav-link ${isActive('/PersonnelDashboard/tracking-screening') ? 'active' : ''}`} to={"/PersonnelDashboard/tracking-screening"}>Tracking & Screening</Link></li>

            <li><Link className={`nav-link ${isActive('/PersonnelDashboard/declined-applicants') ? 'active' : ''}`} to={"/PersonnelDashboard/declined-applicants"}>Declined Applicant</Link></li>

            <li><Link className={`nav-link ${isActive('/PersonnelDashboard/application-form') ? 'active' : ''}`} to={"/PersonnelDashboard/application-form"}>Form Application</Link></li>
          </ul>
          <button className=' flex justify-center items-center gap-2 logout-btn' onClick={handleLogout}> <CiLogout size={25}/> Logout</button>
        </nav>
      </div>
      {showLogout && <Logout setShowLogout={setShowLogout} />}
    </>
  )
}

export default SidebarRecruiter
