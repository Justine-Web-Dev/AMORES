import React from 'react'
import { Routes,Route } from 'react-router'
import LandingPage from './LandingPage'

function LandingpageMain() {
  return (
    <Routes>
      <Route path='/' element={<LandingPage />} />
    </Routes>
  )
}

export default LandingpageMain
