import React from 'react'

function Applications() {
  return (
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
        <div className="applications-list">
          <div className="application-card">
            <div className="applicant-info">
              <h4>John Smith</h4>
              <p>Applied for: Senior Software Developer</p>
              <span className="status pending">Pending Review</span>
            </div>
            <div className="application-actions">
              <button className="review-btn">Review</button>
              <button className="schedule-btn">Schedule Interview</button>
            </div>
          </div>
          <div className="application-card">
            <div className="applicant-info">
              <h4>Sarah Johnson</h4>
              <p>Applied for: Marketing Manager</p>
              <span className="status review">Under Review</span>
            </div>
            <div className="application-actions">
              <button className="review-btn">Review</button>
              <button className="schedule-btn">Schedule Interview</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Applications