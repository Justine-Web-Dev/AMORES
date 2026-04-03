import React from 'react'

function StatusManagement() {
  return (
    <div className='flex flex-col justify-evenly bg-[#F9FAFB] shadow-sm w-[300px] rounded-[12px] status-management'>
      <div>
        <h1 className='text-[24px] font-semibold'>Update Status</h1>
        <p>Update the applicant's status in the recruitment workflow.</p>
      </div>

      <div>
        <select name="" id="" className='status-option'>
          <option value="" disabled selected>New Applicant</option>
          <option value="Under Review">Under Review</option>
          <option value="Accepted">Accepted</option>
          <option value="Rejected">Rejected</option>

        </select>
      </div>
      <button className='rounded-[4px] bg-[#2C2D86] text-white cursor-pointer save-changes-btn'>Save Changes</button>
    </div>
  )
}

export default StatusManagement
