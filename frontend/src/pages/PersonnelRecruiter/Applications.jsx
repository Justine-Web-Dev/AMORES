import React from 'react'
import Header from '../../Components/Header/Header'

function Applications() {
  return (
    <div>
      <Header />
      <div className='module-content'>
        <h2>Applications</h2>
        <p>Review and manage job applications from candidates.</p>
        <div className="applications-container">
          <div className="applications-header">
            <h3>Recent Applications</h3>
            <div className="filter-options">
              <select>
                <option>All Positions</option>
                <option>Software Developer</option>
                <option>Marketing Manager</option>
                <option>HR Specialist</option>
              </select>
              <select>
                <option>All Status</option>
                <option>Pending Review</option>
                <option>Under Review</option>
                <option>Interview Scheduled</option>
                <option>Rejected</option>
              </select>
            </div>
          </div>
        </div>
        {/* Applicant Forms table*/}
      </div>
    </div>
  )
}

export default Applications