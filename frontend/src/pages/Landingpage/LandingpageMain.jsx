import React, { useState, useEffect } from 'react'
import { Routes, Route, useNavigate } from 'react-router'
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
  const navigate = useNavigate();

  // Redirect logged-in users away from landing page
  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    if (token) {
      if (role === 'Admin') {
        navigate('/Dashboard', { replace: true });
      } else {
        navigate('/PersonnelDashboard', { replace: true });
      }
    }
  }, [navigate]);

  useEffect(() => {
    fetchApplicationStatus();
  }, []);

  const fetchApplicationStatus = async () => {
    try {
      const response = await api.get('/users/system-settings/');
      const { 
        is_application_open, 
        application_start_date, 
        application_end_date 
      } = response.data;

      // Logic to determine if application is actually open
      let isOpen = is_application_open;

      if (isOpen && application_start_date && application_end_date) {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        
        const parseDate = (dateStr) => {
          const [year, month, day] = dateStr.split('-').map(Number);
          return new Date(year, month - 1, day).getTime();
        };

        const start = parseDate(application_start_date);
        const end = parseDate(application_end_date);

        // Check if today is within the range [start, end]
        if (today < start || today > end) {
          isOpen = false;
        }
      }

      setIsApplicationOpen(isOpen);
      setAppDates({ start: application_start_date, end: application_end_date });
    } catch (error) {
      console.error("Error fetching application status:", error);
    }
  };

  return (
    <div className='bg-gray-100'>
      <Routes>
        {/* Routes WITH Header */}
        <Route path="/" element={<><HeaderLanding isApplicationOpen={isApplicationOpen} /><LandingPage isApplicationOpen={isApplicationOpen} appDates={appDates} /></>} />
        <Route path="/track-application" element={<><HeaderLanding isApplicationOpen={isApplicationOpen} /><TrackApplication /></>} />
        <Route path="/form-application" element={<><HeaderLanding isApplicationOpen={isApplicationOpen} /><Form /></>} />
        <Route path="/document-submission" element={<><HeaderLanding isApplicationOpen={isApplicationOpen} /><DocumentSubmission /></>} />

        {/* Route WITHOUT Header (404) */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  )
}

export default LandingpageMain
