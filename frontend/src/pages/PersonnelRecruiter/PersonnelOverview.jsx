import React from 'react'
import Header from '../../Components/Header/Header'

function PersonnelOverview() {

  return (
    <div>
      <div className='module-content'>
        <h2>Personnel Dashboard Overview</h2>
        <p>Welcome to the Personnel Recruitment Dashboard</p>

        {/* Main Statistics */}
        <div className="personnel-stats">
          <div className="stat-card">
            <h4>Total Applications</h4>
            <span className="stat-number"></span>
          </div>

          <div className="stat-card">
            <h4>Interviews Scheduled</h4>
            <span className="stat-number"></span>
          </div>

          <div className="stat-card">
            <h4>New Applicant</h4>
            <span className="stat-number"></span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PersonnelOverview