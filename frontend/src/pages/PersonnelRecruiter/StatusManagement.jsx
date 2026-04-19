import React from 'react'
import { useState,useEffect } from 'react'
import { api } from '../../../api/api'

function StatusManagement({applicantId, currentStatus, onUpdate,currentRejectionReason}) {
  const [selectedStatus, setSelectedStatus] = useState(currentStatus)
  const [rejectionReason,setRejectionReason] = useState(currentRejectionReason || "")
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    setSelectedStatus(currentStatus);
    setRejectionReason(currentRejectionReason || "");
  }, [currentStatus, currentRejectionReason]);

const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      const dataToSend = {
        status: selectedStatus,
        rejection_reason: selectedStatus === 'Rejected' ? rejectionReason : null
      };

      await api.put(`users/update_status/${applicantId}/`, dataToSend);
      alert("Status updated successfully");
      onUpdate(); 
    } catch (err) {
      console.error("Update failed:", err);
      alert("Failed to update status.");
    } finally {
      setIsUpdating(false);
    }
  };

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
      {selectedStatus === 'Rejected' && (
        <div className="mt-4">
          <label className="text-sm font-medium">Reason for Rejection:</label>
          <textarea
            className="w-full mt-1 p-2 border rounded"
            placeholder="Enter reason..."
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
          />
        </div>
      )}
      <button onClick={handleUpdate}
        disabled={isUpdating || selectedStatus === currentStatus}
        className={`rounded-[4px] text-white cursor-pointer save-changes-btn mt-4 h-10 ${
          isUpdating ? 'bg-gray-400' : 'bg-[#2C2D86]'
        }`}>{isUpdating ? 'Saving...' : 'Save Changes'}</button>
    </div>
  )
}

export default StatusManagement
