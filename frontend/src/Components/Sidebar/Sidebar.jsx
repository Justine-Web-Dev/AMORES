import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import logo from '../../assets/RRSU1 logo.png'
import Logout from '../../Modals/Logout'

// Modern Icons
import { 
  RiDashboardLine, 
  RiUserSharedLine, 
  RiFileTextLine, 
  RiUserUnfollowLine, 
  RiDraftLine, 
  RiHistoryLine,
  RiSettings4Line,
  RiDatabase2Line
} from "react-icons/ri";
import { HiOutlineDocumentReport } from "react-icons/hi";
import { FiSliders, FiChevronDown, FiLogOut } from "react-icons/fi";

function Sidebar() {
  const [showLogout, setShowLogout] = useState(false);
  const location = useLocation();

  const utilityPaths = [
    '/Dashboard/audit-logs',
    '/Dashboard/backup-restore',
    '/Dashboard/system-settings'
  ];

  const [isSystemUtilitiesOpen, setIsSystemUtilitiesOpen] = useState(() => 
    utilityPaths.includes(location.pathname)
  );

  useEffect(() => {
    if (utilityPaths.includes(location.pathname)) {
      setIsSystemUtilitiesOpen(true);
    }
  }, [location.pathname]);

  const toggleSystemUtilities = () => {
    setIsSystemUtilitiesOpen(prev => !prev);
  };

  const isActive = (path) => location.pathname === path;

  // Modern link design helper classes
  const linkClass = (path) => `
    flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group
    ${isActive(path) 
      ? 'bg-[#2C2D86] text-white shadow-md shadow-indigo-900/30 font-semibold translate-x-1' 
      : 'text-slate-600 hover:bg-white/80 hover:text-slate-900 hover:shadow-sm'}
  `;

  return (
    <>
      {/* Modernized background with a clean slate gradient layout */}
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

        {/* Navigation Section */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1 scrollbar-thin">
          <ul className="space-y-1">
            <li>
              <Link className={linkClass('/Dashboard')} to="/Dashboard">
                <RiDashboardLine size={18} className={isActive('/Dashboard') ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'} />
                <span>Dashboard</span>
              </Link>
            </li>

            <li>
              <Link className={linkClass('/Dashboard/user-management')} to="/Dashboard/user-management">
                <RiUserSharedLine size={18} className={isActive('/Dashboard/user-management') ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'} />
                <span>User Management</span>
              </Link>
            </li>

            <li>
              <Link className={linkClass('/Dashboard/applications')} to="/Dashboard/applications">
                <RiFileTextLine size={18} className={isActive('/Dashboard/applications') ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'} />
                <span>Applications</span>
              </Link>
            </li>

            <li>
              <Link className={linkClass('/Dashboard/declined-applicant')} to="/Dashboard/declined-applicant">
                <RiUserUnfollowLine size={18} className={isActive('/Dashboard/declined-applicant') ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'} />
                <span>Failed Applicants</span>
              </Link>
            </li>

            <li>
              <Link className={linkClass('/Dashboard/application-form')} to="/Dashboard/application-form">
                <RiDraftLine size={18} className={isActive('/Dashboard/application-form') ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'} />
                <span>Form Application</span>
              </Link>
            </li>

            <li>
              <Link className={linkClass('/Dashboard/generate-report')} to="/Dashboard/generate-report">
                <HiOutlineDocumentReport size={18} className={isActive('/Dashboard/generate-report') ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'} />
                <span>Generate Report</span>
              </Link>
            </li>

            {/* System Utilities Section */}
            <li className="pt-2">
              <button 
                type="button"
                onClick={toggleSystemUtilities}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                  ${utilityPaths.includes(location.pathname) 
                    ? 'text-[#2C2D86] bg-indigo-50 font-semibold shadow-sm border border-indigo-100/50' 
                    : 'text-slate-600 hover:bg-white/80'}`}
                aria-expanded={isSystemUtilitiesOpen}
              >
                <div className="flex items-center gap-3">
                  <FiSliders size={18} className={utilityPaths.includes(location.pathname) ? 'text-[#2C2D86]' : 'text-slate-400'} />
                  <span>System Utilities</span>
                </div>
                <FiChevronDown 
                  size={16} 
                  className={`text-slate-400 transition-transform duration-200 ${isSystemUtilitiesOpen ? 'rotate-180 text-[#2C2D86]' : ''}`} 
                />
              </button>

              {/* Collapsible Dropdown Submenu */}
              <div className={`grid transition-all duration-200 ease-in-out ${isSystemUtilitiesOpen ? 'grid-rows-[1fr] opacity-100 mt-1' : 'grid-rows-[0fr] opacity-0 overflow-hidden'}`}>
                <ul className="overflow-hidden pl-5 space-y-1 border-l-2 border-slate-300/60 ml-6">
                  <li>
                    <Link 
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                        isActive('/Dashboard/audit-logs') ? 'text-[#2C2D86] font-semibold bg-white shadow-sm border border-slate-100' : 'text-slate-500 hover:text-slate-900 hover:bg-white/50'
                      }`} 
                      to="/Dashboard/audit-logs"
                    >
                      <RiHistoryLine size={14} />
                      Audit Logs
                    </Link>
                  </li>
                  <li>
                    <Link 
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                        isActive('/Dashboard/backup-restore') ? 'text-[#2C2D86] font-semibold bg-white shadow-sm border border-slate-100' : 'text-slate-500 hover:text-slate-900 hover:bg-white/50'
                      }`} 
                      to="/Dashboard/backup-restore"
                    >
                      <RiDatabase2Line size={14} />
                      Backup & Restore
                    </Link>
                  </li>
                  <li>
                    <Link 
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                        isActive('/Dashboard/system-settings') ? 'text-[#2C2D86] font-semibold bg-white shadow-sm border border-slate-100' : 'text-slate-500 hover:text-slate-900 hover:bg-white/50'
                      }`} 
                      to="/Dashboard/system-settings"
                    >
                      <RiSettings4Line size={14} />
                      System Settings
                    </Link>
                  </li>
                </ul>
              </div>
            </li>
          </ul>
        </nav>
        
        {/* Logout Button Section at Bottom */}
        <div className="p-4 border-t border-slate-200/60 bg-white/30 backdrop-blur-sm">
          <button 
            type="button"
            onClick={() => setShowLogout(true)}
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

export default Sidebar