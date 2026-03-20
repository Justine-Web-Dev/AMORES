import React, { useState } from 'react'

function FailSafeVerification() {
  const [selectedApplicant, setSelectedApplicant] = useState(null)

  // Mock data
  const applicants = [
    { id: 1, name: 'John Smith', position: 'Senior Software Developer', status: 'Under Review', summary: 'Experienced developer with 5+ years in React and Node.js. Strong portfolio.' },
    { id: 2, name: 'Jane Doe', position: 'Product Manager', status: 'Shortlisted', summary: 'MBA graduate with 3 years in product management. Led successful product launches.' },
  ]

  const handleAdvance = (applicantId) => {
    // Logic to advance applicant to next stage
    alert(`Advancing applicant ${applicantId} to next stage`)
  }

  return (
    <div className='module-content'>
      <h2>Fail-safe Verification</h2>
      <p>Review a summarized version of an applicant's information before advancing them to the next stage to minimize processing errors.</p>

      <div className="verification-container">
        <div className="applicant-queue">
          <h3>Applicants Ready for Verification</h3>
          {applicants.map(applicant => (
            <div key={applicant.id} className="verification-card" onClick={() => setSelectedApplicant(applicant)}>
              <h4>{applicant.name}</h4>
              <p>{applicant.position}</p>
              <p>Status: {applicant.status}</p>
            </div>
          ))}
        </div>

        {selectedApplicant && (
          <div className="verification-details">
            <h3>Verification Details</h3>
            <div className="summary-card">
              <h4>{selectedApplicant.name}</h4>
              <p><strong>Position:</strong> {selectedApplicant.position}</p>
              <p><strong>Current Status:</strong> {selectedApplicant.status}</p>
              <p><strong>Summary:</strong> {selectedApplicant.summary}</p>
            </div>
            <div className="verification-actions">
              <button className="advance-btn" onClick={() => handleAdvance(selectedApplicant.id)}>Advance to Next Stage</button>
              <button className="reject-btn">Reject Application</button>
              <button className="back-btn" onClick={() => setSelectedApplicant(null)}>Back to Queue</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default FailSafeVerification