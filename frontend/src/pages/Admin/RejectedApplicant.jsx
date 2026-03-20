import React from 'react'

function RejectedApplicant() {
  return (
    <div className='module-content'>
      <h2>Rejected Applicant</h2>
      <p>View and manage rejected job applications.</p>
      <div className="rejected-applicant-container">
        <div className="applicant-stats">
          <h3>Application Statistics</h3>
          <div className="stat-card">
            <h4>Total Applications</h4>
            <span className="stat-number">500</span>
          </div>
          <div className="stat-card">
            <h4>Rejected Applications</h4>
            <span className="stat-number">120</span>
          </div>
          <div className="stat-card">
            <h4>Rejection Rate</h4>
            <span className="stat-number">24%</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RejectedApplicant