import React, { useState, useRef, useEffect } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { 
  RiSettings4Line,
  RiDashboardLine, 
  RiUserSharedLine, 
  RiFileTextLine, 
  RiUserUnfollowLine, 
  RiDatabaseLine, 
  RiDraftLine 
} from 'react-icons/ri'
import { HiOutlineDocumentReport } from 'react-icons/hi'
import { FiMoon, FiSun, FiShield } from 'react-icons/fi'
import './Header.css'
import logoAcc from '../../assets/RRSU1 logo.png'
import { api } from '../../../api/api'

function Header() {
  const location = useLocation();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showAccountOptions, setShowAccountOptions] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
        setShowAccountOptions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Initialize dark mode from local storage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  // Update theme when toggled
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  // Function to decode JWT token
  const parseJwt = (token) => {
    try {
      if (!token) return null;
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  };

  const token = sessionStorage.getItem('token');
  const payload = parseJwt(token);
  const name = payload?.name || 'User';
  const rawRole = payload?.role || '';
  const initialProfilePic = payload?.profile_picture || logoAcc;
  
  const [profilePic, setProfilePic] = useState(initialProfilePic);
  const [healthStatus, setHealthStatus] = useState('Checking...');

  useEffect(() => {
    let interval;
    if (rawRole === 'SUPER_ADMIN') {
      const fetchHealth = () => {
        api.get('users/system-health/')
          .then(res => setHealthStatus(res.data.status === 'healthy' ? 'Active' : 'Alert'))
          .catch(() => setHealthStatus('Offline'));
      };
      fetchHealth();
      interval = setInterval(fetchHealth, 10000);
    }
    return () => clearInterval(interval);
  }, [rawRole]);

  useEffect(() => {
    const handleProfilePicUpdate = (e) => {
      setProfilePic(e.detail);
    };
    window.addEventListener('profilePictureUpdated', handleProfilePicUpdate);
    return () => {
      window.removeEventListener('profilePictureUpdated', handleProfilePicUpdate);
    };
  }, []);
  
  // Professional role mapping with direct Admin check
  const role = (rawRole === 'SUPER_ADMIN') ? 'Super Admin' :
               (rawRole === 'Administrator') ? 'Administrator' : 
               (rawRole === 'Recruitment Personnel') ? 'Recruitment Staff' : 
               (rawRole === 'Recruitment Screening Committee (RSC)') ? 'Recruitment Screening Committee (RSC)' : 'Staff';

  // Dynamic Breadcrumb Logic
  const getPageTitle = () => {
    const path = location.pathname.toLowerCase();
    
    // Exact match for base dashboards
    if (path === '/dashboard' || path === '/personneldashboard' || path === '/dashboard/' || path === '/personneldashboard/') {
      return path.includes('personnel') ? 'Recruitment Overview' : 'Dashboard';
    }

    if (path.includes('user-management')) return 'User Management';
    if (path.includes('applications')) return 'Applicant Evaluations';
    if (path.includes('declined')) return 'Archived Applications';
    if (path.includes('audit-logs')) return 'Security Audit Logs';
    if (path.includes('backup-restore')) return 'Database Backup';
    if (path.includes('system-settings')) return 'System Configuration';
    if (path.includes('application-form')) return 'Recruitment Form';
    if (path.includes('document-submission')) return 'Document Portal';
    if (path.includes('view-details')) return 'Applicant Profile';
    if (path.includes('generate-report')) return 'Generate Report';
    if (path.includes('success-submit')) return 'Submission Success';
    
    return 'Dashboard Overview';
  };

  // Dynamic Header Icon Logic
  const getHeaderIcon = () => {
    const path = location.pathname.toLowerCase();
    
    if (path === '/dashboard' || path === '/personneldashboard' || path === '/dashboard/' || path === '/personneldashboard/') {
      return <RiDashboardLine className="text-[#2C2D86] text-xl" />;
    }
    if (path.includes('user-management')) return <RiUserSharedLine className="text-[#2C2D86] text-xl" />;
    if (path.includes('applications')) return <RiFileTextLine className="text-[#2C2D86] text-xl" />;
    if (path.includes('declined')) return <RiUserUnfollowLine className="text-[#2C2D86] text-xl" />;
    if (path.includes('audit-logs')) return <RiFileTextLine className="text-[#2C2D86] text-xl" />;
    if (path.includes('backup-restore')) return <RiDatabaseLine className="text-[#2C2D86] text-xl" />;
    if (path.includes('system-settings')) return <RiSettings4Line className="text-[#2C2D86] text-xl" />;
    if (path.includes('application-form')) return <RiDraftLine className="text-[#2C2D86] text-xl" />;
    if (path.includes('document-submission')) return <RiFileTextLine className="text-[#2C2D86] text-xl" />;
    if (path.includes('view-details')) return <RiUserSharedLine className="text-[#2C2D86] text-xl" />;
    if (path.includes('generate-report')) return <HiOutlineDocumentReport className="text-[#2C2D86] text-xl" />;
    
    return <RiDashboardLine className="text-[#2C2D86] text-xl" />;
  };

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const currentDay = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

  return (
    <header className='Header'>
      <div className='label-dashboard'>
        <div className="flex items-center gap-2">
          {getHeaderIcon()}
          <h4>{getPageTitle()}</h4>
        </div>
      </div>

      <div className='greetings-account flex items-center gap-4'>
        
        {/* Environment & Security Indicators (Super Admin Only) */}
        {role === 'Super Admin' && (
          <div className="hidden lg:flex items-center gap-2 border-r pr-4 border-gray-100">
            <span className={`px-2 py-1 text-[10px] font-bold rounded uppercase tracking-wider ${import.meta.env.DEV ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>
              {import.meta.env.DEV ? 'DEV' : 'PROD'}
            </span>
            <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded ${healthStatus === 'Active' ? 'text-indigo-600 bg-indigo-50' : healthStatus === 'Checking...' ? 'text-gray-500 bg-gray-100' : 'text-red-600 bg-red-50'}`}>
              <FiShield /> Sec: {healthStatus}
            </div>
          </div>
        )}

        {/* Theme Toggle */}
        <button 
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="hidden sm:flex p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors border-r border-gray-100 pr-2 mr-2"
          title="Toggle Theme"
        >
          {isDarkMode ? <FiSun size={18} /> : <FiMoon size={18} />}
        </button>

        <div className="text-right hidden md:block border-r pr-5 border-gray-100">
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-0.5">{getTimeGreeting()}</p>
          <h4 className="text-sm font-bold text-gray-700">{currentDay}</h4>
        </div>
        
        <div className="user-profile-header relative cursor-pointer" ref={dropdownRef} onClick={() => setShowDropdown(!showDropdown)}>
          <div className="text-right hidden sm:block">
            <h4>{name}</h4>
            <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider">{role}</p>
          </div>
          <img src={profilePic} alt="Profile" className="header-avatar" />
          
          {/* Dropdown Menu */}
          {showDropdown && (
            <div 
              className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-100 py-2 z-50"
              onClick={(e) => e.stopPropagation()}
            >
              <div 
                className="flex items-center justify-between px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors cursor-pointer"
                onClick={() => setShowAccountOptions(!showAccountOptions)}
              >
                <div className="flex items-center gap-3">
                  <RiSettings4Line size={18}/> 
                  <span>Account Settings</span>
                </div>
                <span className="text-xs">{showAccountOptions ? '▲' : '▼'}</span>
              </div>

              {showAccountOptions && (
                <div className="bg-slate-50 py-1 border-y border-slate-100">
                  <Link 
                    to={`${location.pathname.toLowerCase().includes('personnel') ? '/PersonnelDashboard' : location.pathname.toLowerCase().includes('interview') ? '/InterviewDashboard' : '/Dashboard'}/account-settings?tab=profile`}
                    className="flex items-center gap-3 pl-10 pr-4 py-2 text-sm text-slate-600 hover:text-indigo-600 transition-colors"
                    onClick={() => {
                      setShowDropdown(false);
                      setShowAccountOptions(false);
                    }}
                  >
                    Profile
                  </Link>
                  <Link 
                    to={`${location.pathname.toLowerCase().includes('personnel') ? '/PersonnelDashboard' : location.pathname.toLowerCase().includes('interview') ? '/InterviewDashboard' : '/Dashboard'}/account-settings?tab=security`}
                    className="flex items-center gap-3 pl-10 pr-4 py-2 text-sm text-slate-600 hover:text-indigo-600 transition-colors"
                    onClick={() => {
                      setShowDropdown(false);
                      setShowAccountOptions(false);
                    }}
                  >
                    Change Password
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
