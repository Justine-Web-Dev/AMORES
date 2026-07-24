import React, { useState, useRef, useEffect } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { RiSettings4Line } from 'react-icons/ri'
import './Header.css'
import logoAcc from '../../assets/RRSU1 logo.png'

function Header() {
  const location = useLocation();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showAccountOptions, setShowAccountOptions] = useState(false);
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

  const token = localStorage.getItem('token');
  const payload = parseJwt(token);
  const name = payload?.name || 'User';
  const rawRole = payload?.role || '';
  const initialProfilePic = payload?.profile_picture || logoAcc;
  
  const [profilePic, setProfilePic] = useState(initialProfilePic);

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
  const role = (rawRole === 'Administrator') ? 'Administrator' : 
               (rawRole === 'Recruiter') ? 'Recruitment Staff' : 'Staff';

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
        <h4>{getPageTitle()}</h4>
        <p>Home / {getPageTitle()}</p>
      </div>

      <div className='greetings-account'>
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
                    to={location.pathname.toLowerCase().includes('personnel') ? "/PersonnelDashboard/account-settings?tab=profile" : "/Dashboard/account-settings?tab=profile"}
                    className="flex items-center gap-3 pl-10 pr-4 py-2 text-sm text-slate-600 hover:text-indigo-600 transition-colors"
                    onClick={() => {
                      setShowDropdown(false);
                      setShowAccountOptions(false);
                    }}
                  >
                    Profile
                  </Link>
                  <Link 
                    to={location.pathname.toLowerCase().includes('personnel') ? "/PersonnelDashboard/account-settings?tab=security" : "/Dashboard/account-settings?tab=security"}
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
