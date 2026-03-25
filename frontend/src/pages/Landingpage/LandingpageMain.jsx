import React from 'react'
import { Routes,Route } from 'react-router'
import LandingPage from './LandingPage'
import AboutUs from './AboutUs'
import TrackApplication from './TrackApplication'
import HeaderLanding from '../../Components/Header/HeaderLanding'
import Form from '../Form/Form'

function LandingpageMain() {
  return (
    <div>
      <HeaderLanding />
      <Routes>
        <Route path='/' element={<LandingPage />} />
        <Route path='/about-us' element={<AboutUs />}/>
        <Route path='/track-application' element={<TrackApplication />}/>
        <Route path='/form-informations' element={<Form/>}/>
    </Routes>
    </div>

  )
}

export default LandingpageMain
