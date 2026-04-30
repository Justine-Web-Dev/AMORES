import React, { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router'
import { api } from '../../../api/api'
import LandingPage from './LandingPage'
import AboutUs from './AboutUs'
import TrackApplication from './TrackApplication'
import HeaderLanding from '../../Components/Header/HeaderLanding'
import Form from '../Form/Form'
import DocumentSubmission from '../Form/DocumentSubmission'

function LandingpageMain() {
  const [isApplicationOpen, setIsApplicationOpen] = useState(true);
  const [appDates, setAppDates] = useState({ start: null, end: null });

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
      <HeaderLanding isApplicationOpen={isApplicationOpen} />
      <Routes>
        <Route 
          path='/' 
          element={
            <LandingPage 
              isApplicationOpen={isApplicationOpen} 
              appDates={appDates} 
            />
          } 
        />
        <Route path='/about-us' element={<AboutUs />} />
        <Route path='/track-application' element={<TrackApplication />} />
        <Route path='/form-application' element={<Form />} />
        <Route path='/document-submission' element={<DocumentSubmission />} />
      </Routes>
    </div>
  )
}

export default LandingpageMain
