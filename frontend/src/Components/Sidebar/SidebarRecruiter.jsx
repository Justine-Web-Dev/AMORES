import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import logo from '../../assets/RRSU1 logo.png'
import Logout from '../../Modals/Logout'

// Modern Slate-friendly Icons
import { RiDashboardLine, RiFileTextLine, RiUserUnfollowLine, RiDraftLine } from "react-icons/ri";
import { FiLogOut, FiChevronLeft, FiChevronRight } from "react-icons/fi";

function SidebarRecruiter({ isCollapsed, setIsCollapsed }) {
  const [showLogout, setShowLogout] = useState(false);
  const location = useLocation();

  const handleLogout = () => {
    setShowLogout(true);
  };

  const isActive = (path) => location.pathname === path;

  // Premium navigation link styling
  const linkClass = (path) => `
    relative flex items-center ${isCollapsed ? 'justify-center mx-2' : 'gap-3 px-4'} py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group
    ${isActive(path) 
      ? 'bg-[#2C2D86] text-white shadow-md shadow-indigo-900/30 font-semibold translate-x-1' 
      : 'text-slate-600 hover:bg-white/80 hover:text-slate-900 hover:shadow-sm'}
  `;

  return (
    <>
      {/* Modernized background frame with an elegant slate gradient layout */}
      <div className={`${isCollapsed ? 'w-[90px]' : 'w-64'} transition-[width] duration-300 ease-in-out h-screen bg-gradient-to-b from-[#F8FAFC] to-[#EFF2F6] border-r border-slate-200 flex flex-col fixed left-0 top-0 z-40 select-none`}>
        
        {/* Modern Header / Branding Area */}
        <div className="p-5 border-b border-slate-200/60 flex flex-col items-center text-center gap-3 bg-white/40 backdrop-blur-sm relative">
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)} 
            className="absolute -right-3 top-6 bg-white border border-slate-200 rounded-full p-1 hover:bg-slate-50 text-slate-500 z-50 shadow-sm"
          >
            {isCollapsed ? <FiChevronRight size={14} /> : <FiChevronLeft size={14} />}
          </button>
          <div className={`bg-white rounded-2xl shadow-sm border border-slate-100 ${isCollapsed ? 'p-1' : 'p-2'}`}>
            <img src={logo} alt="Logo" className={`${isCollapsed ? 'h-8' : 'h-14'} w-auto object-contain transition-all duration-300`} />
          </div>
          {!isCollapsed && (
            <div>
              <h2 className="text-[11px] font-bold tracking-wider text-slate-400 uppercase px-2 leading-tight">
                AMORES Portal
              </h2>
              <p className="text-[10px] text-slate-500 font-medium px-2 mt-1 leading-snug hidden sm:block">
                Recruitment Evaluation System
              </p>
            </div>
          )}
        </div>

        {/* Recruiter Navigation List */}
        <nav className={`flex-1 p-4 space-y-1 scrollbar-thin ${isCollapsed ? 'overflow-visible' : 'overflow-y-auto'}`}>
          <ul className="space-y-1">
            <li>
              <Link className={linkClass('/PersonnelDashboard')} to="/PersonnelDashboard">
                <RiDashboardLine size={18} className={isActive('/PersonnelDashboard') ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'} />
                {!isCollapsed && <span>Dashboard</span>}
                {isCollapsed && <div className="absolute left-14 hidden group-hover:block bg-slate-800 text-white text-[11px] leading-tight font-medium px-2 py-1.5 rounded shadow-lg z-[100] w-max whitespace-nowrap">Dashboard</div>}
              </Link>
            </li>

            <li>
              <Link className={linkClass('/PersonnelDashboard/applications')} to="/PersonnelDashboard/applications">
                <RiFileTextLine size={18} className={isActive('/PersonnelDashboard/applications') ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'} />
                {!isCollapsed && <span>Applications</span>}
                {isCollapsed && <div className="absolute left-14 hidden group-hover:block bg-slate-800 text-white text-[11px] leading-tight font-medium px-2 py-1.5 rounded shadow-lg z-[100] w-max whitespace-nowrap">Applications</div>}
              </Link>
            </li>




            <li>
              <Link className={linkClass('/PersonnelDashboard/generate-report')} to="/PersonnelDashboard/generate-report">
                <RiDraftLine size={18} className={isActive('/PersonnelDashboard/generate-report') ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'} />
                {!isCollapsed && <span>Generate Report</span>}
                {isCollapsed && <div className="absolute left-14 hidden group-hover:block bg-slate-800 text-white text-[11px] leading-tight font-medium px-2 py-1.5 rounded shadow-lg z-[100] w-max whitespace-nowrap">Generate Report</div>}
              </Link>
            </li>
          </ul>
        </nav>
        
        {/* Logout Area */}
        <div className="p-4 border-t border-slate-200/60 bg-white/30 backdrop-blur-sm space-y-2">
          <button 
            type="button"
            onClick={handleLogout}
            className={`group relative w-full flex items-center justify-center ${isCollapsed ? 'px-2' : 'gap-2 px-4'} py-2.5 bg-red-500/10 hover:bg-red-500 hover:text-white text-red-600 font-semibold rounded-xl text-sm transition-all duration-200 shadow-sm hover:shadow-md hover:shadow-red-500/20`}
            title="Logout"
          > 
            <FiLogOut size={16}/> 
            {!isCollapsed && <span>Logout</span>}
                {isCollapsed && <div className="absolute left-14 hidden group-hover:block bg-slate-800 text-white text-[11px] leading-tight font-medium px-2 py-1.5 rounded shadow-lg z-[100] w-max whitespace-nowrap">Logout</div>}
          </button>
        </div>
      </div>
      {showLogout && <Logout setShowLogout={setShowLogout} />}
    </>
  )
}

export default SidebarRecruiter