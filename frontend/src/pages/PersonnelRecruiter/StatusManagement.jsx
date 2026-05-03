import React from 'react'
import { useState,useEffect } from 'react'
import { api } from '../../../api/api'
import MessageModal from '../../Modals/MessageModal'

function StatusManagement({applicantId, currentStatus, onUpdate,currentRejectionReason}) {
  const [selectedStatus, setSelectedStatus] = useState(currentStatus)
  const [rejectionReason,setRejectionReason] = useState(currentRejectionReason || "")
  const [isUpdating, setIsUpdating] = useState(false)
  const [modalConfig, setModalConfig] = useState({ isOpen: false, type: 'success', message: '' })

  useEffect(() => {
    setSelectedStatus(currentStatus);
    setRejectionReason(currentRejectionReason || "");
  }, [currentStatus, currentRejectionReason]);

  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      // Get the current user from the token for audit logging
      const token = localStorage.getItem('token');
      let currentUser = 'Unknown';
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          currentUser = payload.username || 'Unknown';
        } catch (e) {
          console.error("Token parse error:", e);
        }
      }

      const dataToSend = {
        status: selectedStatus,
        rejection_reason: selectedStatus === 'Rejected' ? rejectionReason : null,
        performed_by: currentUser // Pass the user explicitly
      };

      await api.put(`users/update_status/${applicantId}/`, dataToSend);
      setModalConfig({
        isOpen: true,
        type: 'success',
        message: 'The applicant status has been updated successfully.'
      });
      onUpdate(); 
    } catch (err) {
      console.error("Update failed:", err);
      setModalConfig({
        isOpen: true,
        type: 'error',
        message: 'There was an error updating the status. Please try again.'
      });
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

      <MessageModal 
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
        type={modalConfig.type}
        title={modalConfig.type === 'success' ? 'Update Successful' : 'Update Failed'}
        message={modalConfig.message}
      />
    </div>
  )
}

export default StatusManagement
