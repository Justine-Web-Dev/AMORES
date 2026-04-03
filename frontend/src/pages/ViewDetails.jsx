import React from 'react'
import './ViewDetailsCss.css'
import StatusManagement from './PersonnelRecruiter/StatusManagement'
import ApplicantInfoView from './ApplicantInfoView'

function ViewDetails() {


  return (
    <div className=' ViewDetails'>
      <div className='module-content'>
        <div className='flex gap-10'>
          <div className="w-[650px] bg-[#F9FAFB] rounded-xl shadow-sm card-detail">
            <div className="top-section">
              <h1 className="text-xl font-semibold text-gray-800">Name</h1>
              <p className="text-sm text-gray-500">Track Number</p>

              <span className="inline-block mt-2 px-3 py-1 text-xs bg-blue-100 text-blue-600 rounded-full status-detail-text">
                Status
              </span>
            </div>

            <div className="flex justify-between items-center text-sm text-gray-700 border-t email-section">
              <div className="flex items-center gap-2">
                <p>Email</p>
              </div>

              <div className="flex items-center gap-2">
                <p>Contact Number</p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-500 mt-4">
              <p>Date Applied</p>
            </div>
          </div> 
          {/* Update Status */}
          <StatusManagement />
        </div>
        <ApplicantInfoView />
      </div>
      
    </div>
  )
}

export default ViewDetails
