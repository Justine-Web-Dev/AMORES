import React from 'react'
import { Routes,Route } from 'react-router'
import LandingPage from './LandingPage'
import AboutUs from './AboutUs'
import TrackApplication from './TrackApplication'
import HeaderLanding from '../../Components/Header/HeaderLanding'
import Form from '../Form/Form'
import DocumentSubmission from '../Form/DocumentSubmission'

function LandingpageMain() {
  return (
    <div className='bg-gray-100'>
      <HeaderLanding />
      <Routes>
        <Route path='/' element={<LandingPage />} />
        <Route path='/about-us' element={<AboutUs />}/>
        <Route path='/track-application' element={<TrackApplication />}/>
        <Route path='/form-informations' element={<Form/>}/>
        <Route path='/document-submission' element={<DocumentSubmission/>}/>
    </Routes>
    </div>

  )
}

export default LandingpageMain
