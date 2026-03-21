import React, { useState } from 'react'

function StatusManagement() {
  const [applicants, setApplicants] = useState([
    { id: 1, name: 'John Smith', status: 'Applied', progress: 10 },
    { id: 2, name: 'Jane Doe', status: 'Under Review', progress: 30 },
    { id: 3, name: 'Bob Johnson', status: 'Interviewed', progress: 70 },
    { id: 4, name: 'Alice Brown', status: 'Offer Extended', progress: 90 },
  ])

  const statusOptions = ['Applied', 'Under Review', 'Shortlisted', 'Interviewed', 'Offer Extended', 'Hired', 'Rejected']

  const updateStatus = (id, newStatus) => {
    setApplicants(applicants.map(applicant =>
      applicant.id === id
        ? { ...applicant, status: newStatus, progress: getProgressForStatus(newStatus) }
        : applicant
    ))
  }

  const getProgressForStatus = (status) => {
    const progressMap = {
      'Applied': 10,
      'Under Review': 30,
      'Shortlisted': 50,
      'Interviewed': 70,
      'Offer Extended': 90,
      'Hired': 100,
      'Rejected': 0
    }
    return progressMap[status] || 0
  }

  return (
    <div>
      <div className='module-content'>
        <h2>Status Management</h2>
        <p>Update applicant progress in real time, ensuring accurate tracking throughout all phases of recruitment.</p>

        <div className="status-management-container">
          <div className="applicant-status-list">
            {applicants.map(applicant => (
              <div key={applicant.id} className="status-card">
                <div className="applicant-info">
                  <h4>{applicant.name}</h4>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${applicant.progress}%` }}></div>
                  </div>
                  <p>{applicant.progress}% Complete</p>
                </div>
                <div className="status-controls">
                  <select
                    value={applicant.status}
                    onChange={(e) => updateStatus(applicant.id, e.target.value)}
                    className="status-select"
                  >
                    {statusOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                  <button className="update-btn">Update</button>
                </div>
              </div>
            ))}
            
          </div>
        </div>
      </div>
    </div>
  )
}

export default StatusManagement