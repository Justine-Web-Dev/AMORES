import React from 'react'
import { useState } from 'react'
import { api } from '../../../api/api'

function StatusManagement({applicantId, currentStatus, onUpdate}) {
  const [selectedStatus, setSelectedStatus] = useState(currentStatus)
  const [isUpdating, setIsUpdating] = useState(false)

  const handleUpdate = async () =>{
    setIsUpdating(true)
    try{
       const response = await api.put(`users/update_status/${applicantId}/`,{
      status: selectedStatus
    })
    console.log(response.data)

    alert("Status updated successfully")
    onUpdate()
    }catch(err){
      console.error("Update failed:", err)
      alert("Failed to update status.")
    }finally{
      setIsUpdating(false)
    }
   
  }

  return (
    <div className='flex flex-col justify-evenly bg-[#F9FAFB] shadow-sm w-[300px] rounded-[12px] status-management'>
      <div>
        <h1 className='text-[24px] font-semibold'>Update Status</h1>
        <p>Update the applicant's status in the recruitment workflow.</p>
      </div>

      <div>
        <select 
        value={selectedStatus}
        onChange={(e)=> setSelectedStatus(e.target.value)}
         className='status-option'>
          <option value="" disabled>Select Status</option>
          <option value="New Applicant">New Applicant</option>
          <option value="Under Review">Under Review</option>
          <option value="Accepted">Accepted</option>
          <option value="Rejected">Rejected</option>

        </select>
      </div>
      <button onClick={handleUpdate}
        disabled={isUpdating || selectedStatus === currentStatus}
        className={`rounded-[4px] text-white cursor-pointer save-changes-btn mt-4 h-10 ${
          isUpdating ? 'bg-gray-400' : 'bg-[#2C2D86]'
        }`}>{isUpdating ? 'Saving...' : 'Save Changes'}</button>
    </div>
  )
}

export default StatusManagement
