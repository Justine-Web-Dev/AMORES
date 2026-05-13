import React from 'react'
import { useLocation } from 'react-router-dom'
import './Header.css'
import logoAcc from '../../assets/RRSU1 logo.png'

function Header() {
  const location = useLocation();

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
  const username = payload?.username || 'User';
  const role = payload?.role || 'Staff';

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
    if (path.includes('success-submit')) return 'Submission Success';
    
    return 'Dashboard Overview';
  };

  return (
    <header className='Header'>
      <div className='label-dashboard'>
        <h4>{getPageTitle()}</h4>
        <p>Home / {getPageTitle()}</p>
      </div>

      <div className='greetings-account'>
        <div className="user-profile-header">
          <div className="text-right hidden sm:block">
            <h4>{username}</h4>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{role}</p>
          </div>
          <img src={logoAcc} alt="Profile" className="header-avatar" />
        </div>
      </div>
    </header>
  )
}

export default Header
