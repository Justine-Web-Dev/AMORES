import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import logo from '../../assets/RRSU1 logo.png'
import Logout from '../../Modals/Logout'

// Modern Slate-friendly Icons
import { 
  RiDashboardLine, 
  RiFileTextLine, 
  RiUserUnfollowLine, 
  RiDraftLine 
} from "react-icons/ri";
import { FiLogOut } from "react-icons/fi";

function SidebarRecruiter() {
  const [showLogout, setShowLogout] = useState(false);
  const location = useLocation();

  const handleLogout = () => {
    setShowLogout(true);
  };

  const isActive = (path) => location.pathname === path;

  // Premium navigation link styling
  const linkClass = (path) => `
    flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group
    ${isActive(path) 
      ? 'bg-[#2C2D86] text-white shadow-md shadow-indigo-900/30 font-semibold translate-x-1' 
      : 'text-slate-600 hover:bg-white/80 hover:text-slate-900 hover:shadow-sm'}
  `;

  return (
    <>
      {/* Modernized background frame with an elegant slate gradient layout */}
      <div className="w-64 h-screen bg-gradient-to-b from-[#F8FAFC] to-[#EFF2F6] border-r border-slate-200 flex flex-col fixed left-0 top-0 z-40 select-none">
        
        {/* Modern Header / Branding Area */}
        <div className="p-5 border-b border-slate-200/60 flex flex-col items-center text-center gap-3 bg-white/40 backdrop-blur-sm">
          <div className="p-2 bg-white rounded-2xl shadow-sm border border-slate-100">
            <img src={logo} alt="Logo" className="h-14 w-auto object-contain" />
          </div>
          <div>
            <h2 className="text-[11px] font-bold tracking-wider text-slate-400 uppercase px-2 leading-tight">
              AMORES Portal
            </h2>
            <p className="text-[10px] text-slate-500 font-medium px-2 mt-1 leading-snug hidden sm:block">
              Recruitment Evaluation System
            </p>
          </div>
        </div>

        {/* Recruiter Navigation List */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1 scrollbar-thin">
          <ul className="space-y-1">
            <li>
              <Link className={linkClass('/PersonnelDashboard')} to="/PersonnelDashboard">
                <RiDashboardLine size={18} className={isActive('/PersonnelDashboard') ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'} />
                <span>Dashboard</span>
              </Link>
            </li>

            <li>
              <Link className={linkClass('/PersonnelDashboard/applications')} to="/PersonnelDashboard/applications">
                <RiFileTextLine size={18} className={isActive('/PersonnelDashboard/applications') ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'} />
                <span>Applications</span>
              </Link>
            </li>

            <li>
              <Link className={linkClass('/PersonnelDashboard/declined-applicants')} to="/PersonnelDashboard/declined-applicants">
                <RiUserUnfollowLine size={18} className={isActive('/PersonnelDashboard/declined-applicants') ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'} />
                <span>Failed Applicants</span>
              </Link>
            </li>

            <li>
              <Link className={linkClass('/PersonnelDashboard/application-form')} to="/PersonnelDashboard/application-form">
                <RiDraftLine size={18} className={isActive('/PersonnelDashboard/application-form') ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'} />
                <span>Form Application</span>
              </Link>
            </li>
          </ul>
        </nav>
        
        {/* Modernized Bottom Logout Area */}
        <div className="p-4 border-t border-slate-200/60 bg-white/30 backdrop-blur-sm">
          <button 
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500/10 hover:bg-red-500 hover:text-white text-red-600 font-semibold rounded-xl text-sm transition-all duration-200 shadow-sm hover:shadow-md hover:shadow-red-500/20"
          > 
            <FiLogOut size={16}/> 
            <span>Logout</span>
          </button>
        </div>
      </div>

      {showLogout && <Logout setShowLogout={setShowLogout} />}
    </>
  )
}

export default SidebarRecruiter