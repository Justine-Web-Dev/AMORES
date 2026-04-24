import React from 'react'
import { Routes, Route } from 'react-router-dom'
import SidebarRecruiter from '../../Components/Sidebar/SidebarRecruiter'
import ApplicantEvaluation from './ApplicantEvaluation'
import StatusManagement from './StatusManagement'
import PersonnelOverview from './PersonnelOverview'
import './PersonnelDashboard.css'
import DeclinedApplicants from '../DeclinedApplicants'
import Header from '../../Components/Header/Header'
import ViewDetails from '../ViewDetails'
import Form from '../Form/Form'
import DocumentSubmission from '../Form/DocumentSubmission'
import SubmitApplicationModal from '../../Modals/SubmitApplicationModal'

function PersonnelDashboard() {
  return (
    <div className='PersonnelDashboard'>
      <SidebarRecruiter />
      <div className='main-content'>
        <Header />
        <Routes>
          <Route path="/" element={<PersonnelOverview />} />
          <Route path="/applications" element={<ApplicantEvaluation />} />
          <Route path="/declined-applicants" element={<DeclinedApplicants />} />
          <Route path='/view-details/:id' element={<ViewDetails />}/>
          <Route path='/application-form' element={<Form/>}/>
          <Route path='/document-submission' element={<DocumentSubmission/>}/>
          <Route path='/success-submit' element={<SubmitApplicationModal/>}/>
        </Routes>
      </div>
    </div>
  )
}

export default PersonnelDashboard
