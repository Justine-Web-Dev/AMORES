import React, { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { api } from '../../../api/api'
import LandingPage from './LandingPage'
import AboutUs from './AboutUs'
import TrackApplication from './TrackApplication'
import HeaderLanding from '../../Components/Header/HeaderLanding'
import Form from '../Form/Form'
import DocumentSubmission from '../Form/DocumentSubmission'
import NotFound from '../../NotFound'

function LandingpageMain() {
  const [isApplicationOpen, setIsApplicationOpen] = useState(true);
  const [appDates, setAppDates] = useState({ start: null, end: null });

  const fetchApplicationStatus = async () => {
    try {
      const response = await api.get('/users/system-settings/');
      const { 
        is_application_open, 
        application_start_date, 
        application_end_date 
      } = response.data;

      let isOpen = is_application_open;

      // If dates are set, use date-based logic (date-driven)
      // This means: if today is within the date range, the application is open
      if (application_start_date && application_end_date) {
        const now = new Date();
        // Create date at midnight in local timezone for comparison
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        const parseDate = (dateStr) => {
          const [year, month, day] = dateStr.split('-').map(Number);
          // Create date at midnight in local timezone
          return new Date(year, month - 1, day);
        };

        const start = parseDate(application_start_date);
        const end = parseDate(application_end_date);

        // Check if today is within the date range
        // Button will be enabled if today >= start AND today <= end
        isOpen = today >= start && today <= end;
      }

      setIsApplicationOpen(isOpen);
      setAppDates({ start: application_start_date, end: application_end_date });
    } catch (error) {
      console.error("Error fetching application status:", error);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchApplicationStatus();

    // Set up polling - fetch every 30 seconds to check for updates
    const pollInterval = setInterval(fetchApplicationStatus, 30000);

    // Also re-fetch when page becomes visible (user returns to tab)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchApplicationStatus();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup on unmount
    return () => {
      clearInterval(pollInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Synchronous route guard to prevent layout/paint flash (blink)
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  if (token && (role === 'Admin' || role === 'Personnel')) {
    return <Navigate to={role === 'Admin' ? '/Dashboard' : '/PersonnelDashboard'} replace />;
  }

  return (
    <div className='bg-gray-100'>
      <Routes>
        {/* Routes WITH Header */}
        <Route path="/" element={<><HeaderLanding isApplicationOpen={isApplicationOpen} /><LandingPage isApplicationOpen={isApplicationOpen} appDates={appDates} /></>} />
        <Route path="/track-application" element={<><HeaderLanding isApplicationOpen={isApplicationOpen} /><TrackApplication /></>} />
        
        {/* FIXED: Passed props down to Form and DocumentSubmission */}
        <Route path="/form-application" element={<><HeaderLanding isApplicationOpen={isApplicationOpen} /><Form isApplicationOpen={isApplicationOpen} /></>} />
        <Route path="/document-submission" element={<><HeaderLanding isApplicationOpen={isApplicationOpen} /><DocumentSubmission isApplicationOpen={isApplicationOpen} /></>} />

        {/* Route WITHOUT Header (404) */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  )
}

export default LandingpageMain