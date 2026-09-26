import React, { useEffect, useState } from 'react'
import { HiArrowNarrowLeft } from "react-icons/hi";
import { useNavigate } from 'react-router';
import './ViewDetailsCss.css'
import ApplicantInfoView from './ApplicantInfoView'
import { api } from '../../api/api'
import { useParams, useLocation } from 'react-router'
import ViewDocumentSubmitted from '../ViewDocumentSubmitted';

import StatusManagement from './Users/PersonnelRecruiter/StatusManagement';

function ViewDetails() {
  const {id} = useParams()
  const [applicant,setApplicant] = useState(null)
  const [loading,setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [aiFlaggedReason, setAiFlaggedReason] = useState("");
  const navigate = useNavigate()

    const statusColors = {
      "New Applicant": "inline-block mt-2 px-3 py-1 text-xs bg-blue-100 text-blue-600 rounded-full font-semibold ",
      "Technical Interview": "inline-block mt-2 px-3 py-1 text-xs rounded-full font-semibold  bg-cyan-100 text-cyan-600",
      "Qualified": "inline-block mt-2 px-3 py-1 text-xs rounded-full font-semibold bg-indigo-100 text-indigo-700",
      "Accepted": "inline-block mt-2 px-3 py-1 text-xs rounded-full font-semibold bg-emerald-100 text-emerald-700",
      "Failed": "inline-block mt-2 px-3 py-1 text-xs rounded-full font-semibold bg-rose-100 text-rose-700",
      "Body Mass Index": "inline-block mt-2 px-3 py-1 text-xs rounded-full font-semibold bg-blue-50 text-blue-500",
      "Physical Agility Test": "inline-block mt-2 px-3 py-1 text-xs rounded-full font-semibold bg-orange-100 text-orange-600",
      "Neuro Examination": "inline-block mt-2 px-3 py-1 text-xs rounded-full font-semibold bg-indigo-100 text-indigo-600",
      "Medical": "inline-block mt-2 px-3 py-1 text-xs rounded-full font-semibold bg-pink-100 text-pink-600",
      "Drug Test": "inline-block mt-2 px-3 py-1 text-xs rounded-full font-semibold bg-amber-100 text-amber-600",
      "Complete Background Investigation": "inline-block mt-2 px-3 py-1 text-xs rounded-full font-semibold bg-indigo-100 text-indigo-600",
      "Final Interview": "inline-block mt-2 px-3 py-1 text-xs rounded-full font-semibold bg-teal-100 text-teal-600",
      "Oath Taking": "inline-block mt-2 px-3 py-1 text-xs rounded-full font-semibold bg-emerald-100 text-emerald-600",
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
      
      // Lock the applicant to mark as evaluating
      if (id) {
        api.post(`users/applications/${id}/lock/`).catch(err => {
          console.warn("Failed to lock applicant:", err);
        });
      }

      // Unlock on unmount
      return () => {
        if (id) {
          api.delete(`users/applications/${id}/lock/`).catch(err => {
            console.warn("Failed to unlock applicant:", err);
          });
        }
      };
    },[id]) 

    const location = useLocation();
    
    const handleBack = () =>{
      if (window.history.state && window.history.state.idx > 0) {
        navigate(-1);
      } else {
        const isDashboard = location.pathname.startsWith('/Dashboard');
        const fallbackPath = isDashboard ? '/Dashboard/applications' : '/PersonnelDashboard/applications';
        navigate(fallbackPath);
      }
    }


    if (loading) return <div className="border-4 h-[40px] w-[40px] rounded-full border-gray-100 border-t-[#2C2D86] animate-spin m-auto "></div>
    if (!applicant) return <div className="p-10 text-center">Applicant not found.</div>

  const handleAiFlagged = async (docType, remarks) => {
    let current = aiFlaggedReason || "";
    
    if (!aiFlaggedReason && applicant.rejection_reason && applicant.rejection_reason.includes("Automated Screening Failed:")) {
        current = applicant.rejection_reason;
    }

    if (!current.includes("Automated Screening Failed:")) {
      current = "Automated Screening Failed:\n";
    }

    // Avoid duplicate entries for the same document
    if (!current.includes(`• ${docType}:`)) {
      const newReason = current + `• ${docType}: ${remarks}\n`;
      setAiFlaggedReason(newReason);
      
    }
  };

  return (
    <div className=' ViewDetails'>
      <div className='module-content mx-auto'>
        <div className='flex flex-col lg:flex-row gap-1'>
          <div className="flex-1 max-w-8xl bg-[#F9FAFB] rounded-xl shadow-sm card-detail">
            <div className="top-section">
              <h1 className="text-xl font-semibold text-gray-800"> Name: {applicant.firstname} {applicant.lastname}</h1>
              <p className="text-sm text-gray-500">Reference Code: {applicant.tracking_code}</p>

              <div className="flex items-center gap-3 mt-2">
                <span className={`${statusColors[applicant.status]} status-detail-text`}>
                  {applicant.status}
                </span>
                {applicant.quota_type && (
                  <span className="bg-blue-100 text-blue-700 px-3 py-1 text-xs rounded-full font-bold shadow-sm mt-2">
                    {applicant.quota_type}
                  </span>
                )}
                <span className="bg-[#2C2D86] text-white px-3 py-1 text-xs rounded-full font-black shadow-sm mt-2">
                  BATCH {applicant.batch || 1}
                </span>
              </div>
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
              <label htmlFor="">{applicant.is_reapplied ? 'Re-Application Date:' : 'Applied on:'}</label>
              <p>{applicant.created_at}</p>
            </div>
          </div> 
        </div>
        <ApplicantInfoView data={applicant}/>
        <ViewDocumentSubmitted applicantId={id} onUpdate={fetchApplicantDetails} onAiFlagged={handleAiFlagged} />

        {applicant.status === "New Applicant" && (
          <div className="mt-4 bg-white rounded-[12px]">
            <StatusManagement
              applicantId={applicant.id}
              applicantData={applicant}
              currentStatus={applicant.status}
              currentRejectionReason={aiFlaggedReason || applicant.rejection_reason}
              onUpdate={fetchApplicantDetails}
            />
          </div>
        )}
      </div>
      <button
        onClick={handleBack}
         className='flex items-center gap-1 cursor-pointer back-btn'>
          <HiArrowNarrowLeft size={25}/>
            <span className='text-md'>Back to Applications</span>
        </button>
    </div>
  )
}

export default ViewDetails
