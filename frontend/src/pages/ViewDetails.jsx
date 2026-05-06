import React, { useEffect, useState } from 'react'

import { HiArrowNarrowLeft } from "react-icons/hi";

import { useNavigate } from 'react-router';

import './ViewDetailsCss.css'

import StatusManagement from './PersonnelRecruiter/StatusManagement'
import ApplicantInfoView from './ApplicantInfoView'

import { api } from '../../api/api'
import { useParams } from 'react-router'
import ViewDocumentSubmitted from '../ViewDocumentSubmitted';

function ViewDetails() {
  const {id} = useParams()
  const [applicant,setApplicant] = useState(null)
  const [loading,setLoading] = useState(true)
  const navigate = useNavigate()

    const statusColors = {
      "New Applicant": "inline-block mt-2 px-3 py-1 text-xs bg-blue-100 text-blue-600 rounded-full font-semibold ",
      "Under Review": "inline-block mt-2 px-3 py-1 text-xs text-yellow-600 rounded-full font-semibold  bg-yellow-100",
      "Accepted": "inline-block mt-2 px-3 py-1 text-xs rounded-full font-semibold  bg-green-100 text-green-600",
      "Rejected": "inline-block mt-2 px-3 py-1 text-xs text-red-600 rounded-full font-semibold  bg-red-100",
    };

    const fetchApplicantDetails = async () =>{
      try{
        const response = await api.get(`users/get_single_applicant_info/${id}`)
        setApplicant(response.data)
      }catch(err){
        console.error("Error fetching applicant:", err)
      }finally{
        setLoading(false)
      }
    }

    useEffect(()=>{
      fetchApplicantDetails()
    },[id]) 

    const handleBack = () =>{
      navigate(-1)
    }


    if (loading) return <div className="p-10 text-center loading-applicant-details">Loading Applicant Details...</div>
    if (!applicant) return <div className="p-10 text-center">Applicant not found.</div>

  return (
    <div className=' ViewDetails'>
        <button
        onClick={handleBack}
         className='flex items-center justify-between cursor-pointer back-btn'>
          <HiArrowNarrowLeft size={25}/>
           Back to Applicants
        </button>

      <div className='module-content max-w-7xl mx-auto'>
        <div className='flex flex-col lg:flex-row gap-10'>
          <div className="flex-1 max-w-3xl bg-[#F9FAFB] rounded-xl shadow-sm card-detail">
            <div className="top-section">
              <h1 className="text-xl font-semibold text-gray-800"> Name: {applicant.firstname} {applicant.lastname}</h1>
              <p className="text-sm text-gray-500">Reference Code: {applicant.tracking_code}</p>


              <span className={`${statusColors[applicant.status]} status-detail-text`}>
                {applicant.status}
              </span>
            </div>

            <div className="flex justify-between items-center text-sm text-gray-700 border-t email-section">
              <div className="flex flex-col gap-2">
                <label htmlFor="">Email:</label>
                <p>{applicant.email}</p>
              </div>

              <div className="flex flex-col  gap-2">
                <label htmlFor="">CP#:</label>
                <p>{applicant.cp_number}</p>
              </div>
            </div>

            <div className="flex flex-col gap-2 text-sm text-gray-500 mt-4">
              <label htmlFor="">Applied on:</label>
              <p>{applicant.created_at}</p>
            </div>
          </div> 
          {/* Update Status */}
          <StatusManagement 
            applicantId={id}
            currentStatus={applicant.status}
            onUpdate={fetchApplicantDetails}
            currentRejectionReason={applicant.rejection_reason}
          />
        </div>
        <ApplicantInfoView data={applicant}/>
        <ViewDocumentSubmitted applicantId={id}/>
      </div>
    </div>
  )
}

export default ViewDetails
