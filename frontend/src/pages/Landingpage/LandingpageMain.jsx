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

  useEffect(() => {
    fetchApplicationStatus();
  }, []);

  const fetchApplicationStatus = async () => {
    try {
      const response = await api.get('/users/system-settings/');
      setIsApplicationOpen(response.data.is_application_open);
    } catch (error) {
      console.error("Error fetching application status:", error);
    }
  };

  return (
    <div className='bg-gray-100'>
      <HeaderLanding isApplicationOpen={isApplicationOpen} />
      <Routes>
        <Route path='/' element={<LandingPage isApplicationOpen={isApplicationOpen} />} />
        <Route path='/about-us' element={<AboutUs />} />
        <Route path='/track-application' element={<TrackApplication />} />
        <Route path='/form-application' element={<Form />} />
        <Route path='/document-submission' element={<DocumentSubmission />} />
      </Routes>
    </div>
  )
}

export default LandingpageMain
