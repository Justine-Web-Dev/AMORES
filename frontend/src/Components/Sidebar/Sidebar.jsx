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
  RiDatabase2Line,
} from "react-icons/ri";
import { HiOutlineDocumentReport } from "react-icons/hi";
import { FiSliders, FiChevronDown, FiLogOut, FiChevronLeft, FiChevronRight } from "react-icons/fi";

function Sidebar({ isCollapsed, setIsCollapsed }) {
  const [showLogout, setShowLogout] = useState(false);
  const location = useLocation();

  const utilityPaths = [
    '/Dashboard/audit-logs',
    '/Dashboard/backup-restore',
    '/Dashboard/system-health',
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
    relative flex items-center ${isCollapsed ? 'justify-center mx-2' : 'gap-3 px-4'} py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group
    ${isActive(path) 
      ? 'bg-[#2C2D86] text-white shadow-md shadow-indigo-900/30 font-semibold translate-x-1' 
      : 'text-slate-600 hover:bg-white/80 hover:text-slate-900 hover:shadow-sm'}
  `;

  return (
    <>
      {/* Modernized background with a clean slate gradient layout */}
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

        {/* Navigation Section */}
        <nav className={`flex-1 p-4 space-y-1 scrollbar-thin ${isCollapsed ? 'overflow-visible' : 'overflow-y-auto'}`}>
          <ul className="space-y-1">
            <li>
              <Link className={linkClass('/Dashboard')} to="/Dashboard">
                <RiDashboardLine size={18} className={isActive('/Dashboard') ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'} />
                {!isCollapsed && <span>Dashboard</span>}
                {isCollapsed && <div className="absolute left-14 hidden group-hover:block bg-slate-800 text-white text-[11px] leading-tight font-medium px-2 py-1.5 rounded shadow-lg z-[100] w-max whitespace-nowrap">Dashboard</div>}
              </Link>
            </li>

            {sessionStorage.getItem('role') === 'SUPER_ADMIN' && (
              <>
                <li>
                  <Link className={linkClass('/Dashboard/accounts')} to="/Dashboard/accounts">
                    <RiUserSharedLine size={18} className={isActive('/Dashboard/accounts') ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'} />
                    {!isCollapsed && <span>User Management</span>}
                {isCollapsed && <div className="absolute left-14 hidden group-hover:block bg-slate-800 text-white text-[11px] leading-tight font-medium px-2 py-1.5 rounded shadow-lg z-[100] w-max whitespace-nowrap">User Management</div>}
                  </Link>
                </li>
              </>
            )}

            {['Administrator'].includes(sessionStorage.getItem('role')) && (
              <li>
                <Link className={linkClass('/Dashboard/user-management')} to="/Dashboard/user-management">
                  <RiUserSharedLine size={18} className={isActive('/Dashboard/user-management') ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'} />
                  {!isCollapsed && <span>User Management</span>}
                {isCollapsed && <div className="absolute left-14 hidden group-hover:block bg-slate-800 text-white text-[11px] leading-tight font-medium px-2 py-1.5 rounded shadow-lg z-[100] w-max whitespace-nowrap">User Management</div>}
                </Link>
              </li>
            )}

            {sessionStorage.getItem('role') !== 'SUPER_ADMIN' && (
              <li>
                <Link className={linkClass('/Dashboard/applications')} to="/Dashboard/applications">
                  <RiFileTextLine size={18} className={isActive('/Dashboard/applications') ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'} />
                  {!isCollapsed && <span>Applications</span>}
                {isCollapsed && <div className="absolute left-14 hidden group-hover:block bg-slate-800 text-white text-[11px] leading-tight font-medium px-2 py-1.5 rounded shadow-lg z-[100] w-max whitespace-nowrap">Applications</div>}
                </Link>
              </li>
            )}

            {sessionStorage.getItem('role') !== 'SUPER_ADMIN' && (
              <li>
                <Link className={linkClass('/Dashboard/generate-report')} to="/Dashboard/generate-report">
                  <HiOutlineDocumentReport size={18} className={isActive('/Dashboard/generate-report') ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'} />
                  {!isCollapsed && <span>Generate Report</span>}
                {isCollapsed && <div className="absolute left-14 hidden group-hover:block bg-slate-800 text-white text-[11px] leading-tight font-medium px-2 py-1.5 rounded shadow-lg z-[100] w-max whitespace-nowrap">Generate Report</div>}
                </Link>
              </li>
            )}








            {/* System Utilities Section - For Super Admin & Administrator */}
            {['SUPER_ADMIN', 'Administrator'].includes(sessionStorage.getItem('role')) && (
              <li className="pt-2">
                <button 
                  type="button"
                  onClick={toggleSystemUtilities}
                  className={`group relative w-full flex items-center justify-between py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                    ${utilityPaths.includes(location.pathname) 
                      ? 'text-[#2C2D86] bg-indigo-50 font-semibold shadow-sm border border-indigo-100/50' 
                      : 'text-slate-600 hover:bg-white/80'}
                    ${isCollapsed ? 'justify-center mx-2 px-0' : 'px-4'}
                  `}
                  aria-expanded={isSystemUtilitiesOpen}
                >
                  <div className={`flex items-center ${isCollapsed ? 'justify-center w-full' : 'gap-3'}`}>
                    <FiSliders size={18} className={utilityPaths.includes(location.pathname) ? 'text-[#2C2D86]' : 'text-slate-400'} />
                    {!isCollapsed && <span>System Utilities</span>}
                {isCollapsed && <div className="absolute left-14 hidden group-hover:block bg-slate-800 text-white text-[11px] leading-tight font-medium px-2 py-1.5 rounded shadow-lg z-[100] w-max whitespace-nowrap">System Utilities</div>}
                  </div>
                  {!isCollapsed && <FiChevronDown 
                    size={16} 
                    className={`text-slate-400 transition-transform duration-200 ${isSystemUtilitiesOpen ? 'rotate-180 text-[#2C2D86]' : ''}`} 
                  />}
                </button>

                {/* Collapsible Dropdown Submenu */}
                <div className={`grid transition-all duration-200 ease-in-out ${isSystemUtilitiesOpen ? 'grid-rows-[1fr] opacity-100 mt-1' : 'grid-rows-[0fr] opacity-0 overflow-hidden'}`}>
                  <ul className={`overflow-hidden space-y-1 ${isCollapsed ? 'pl-0 mx-2 flex flex-col items-center' : 'pl-5 border-l-2 border-slate-300/60 ml-6'}`}>
                    <li>
                      <Link 
                        className={`group relative flex items-center ${isCollapsed ? 'justify-center mx-2 py-2.5' : 'gap-2.5 px-3 py-2'} rounded-xl text-xs font-medium transition-all ${
                          isActive('/Dashboard/system-settings') ? 'text-[#2C2D86] font-semibold bg-white shadow-sm border border-slate-100' : 'text-slate-500 hover:text-slate-900 hover:bg-white/80 hover:shadow-sm'
                        }`} 
                        to="/Dashboard/system-settings"
                        title="System Settings"
                      >
                        <RiSettings4Line size={14} />
                        {!isCollapsed && 'System Settings'}
                            {isCollapsed && <div className="absolute left-14 hidden group-hover:block bg-slate-800 text-white text-[11px] leading-tight font-medium px-2 py-1.5 rounded shadow-lg z-[100] w-max whitespace-nowrap">System Settings</div>}
                      </Link>
                    </li>
                    {['SUPER_ADMIN', 'Administrator'].includes(sessionStorage.getItem('role')) && (
                      <>
                        <li>
                          <Link 
                            className={`group relative flex items-center ${isCollapsed ? 'justify-center mx-2 py-2.5' : 'gap-2.5 px-3 py-2'} rounded-xl text-xs font-medium transition-all ${
                              isActive('/Dashboard/audit-logs') ? 'text-[#2C2D86] font-semibold bg-white shadow-sm border border-slate-100' : 'text-slate-500 hover:text-slate-900 hover:bg-white/80 hover:shadow-sm'
                            }`} 
                            to="/Dashboard/audit-logs"
                            title="Audit Logs"
                          >
                            <RiHistoryLine size={14} />
                            {!isCollapsed && 'Audit Logs'}
                            {isCollapsed && <div className="absolute left-14 hidden group-hover:block bg-slate-800 text-white text-[11px] leading-tight font-medium px-2 py-1.5 rounded shadow-lg z-[100] w-max whitespace-nowrap">Audit Logs</div>}
                          </Link>
                        </li>
                        <li>
                          <Link 
                            className={`group relative flex items-center ${isCollapsed ? 'justify-center mx-2 py-2.5' : 'gap-2.5 px-3 py-2'} rounded-xl text-xs font-medium transition-all ${
                              isActive('/Dashboard/backup-restore') ? 'text-[#2C2D86] font-semibold bg-white shadow-sm border border-slate-100' : 'text-slate-500 hover:text-slate-900 hover:bg-white/80 hover:shadow-sm'
                            }`} 
                            to="/Dashboard/backup-restore"
                            title="Backup & Restore"
                          >
                            <RiDatabase2Line size={14} />
                            {!isCollapsed && 'Backup & Restore'}
                            {isCollapsed && <div className="absolute left-14 hidden group-hover:block bg-slate-800 text-white text-[11px] leading-tight font-medium px-2 py-1.5 rounded shadow-lg z-[100] w-max whitespace-nowrap">Backup & Restore</div>}
                          </Link>
                        </li>
                      </>
                    )}
                  </ul>
                </div>
              </li>
            )}
          </ul>
        </nav>
        
        {/* Logout Area */}
        <div className="p-4 border-t border-slate-200/60 bg-white/30 backdrop-blur-sm space-y-2">
          <button 
            type="button"
            onClick={() => setShowLogout(true)}
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

export default Sidebar