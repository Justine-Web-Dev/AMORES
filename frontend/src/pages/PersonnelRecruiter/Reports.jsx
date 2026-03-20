import React from 'react'

function Reports() {
  return (
    <div className='module-content'>
      <h2>Reports</h2>
      <p>Generate and view recruitment reports and analytics.</p>
      <div className="reports-container">
        <div className="reports-header">
          <h3>Available Reports</h3>
          <button className="generate-report-btn">Generate Custom Report</button>
        </div>
        <div className="reports-grid">
          <div className="report-card">
            <h4>Application Trends</h4>
            <p>Monthly application statistics and trends</p>
            <button className="view-report-btn">View Report</button>
          </div>
          <div className="report-card">
            <h4>Hiring Pipeline</h4>
            <p>Current status of all open positions</p>
            <button className="view-report-btn">View Report</button>
          </div>
          <div className="report-card">
            <h4>Interview Success Rate</h4>
            <p>Analysis of interview outcomes</p>
            <button className="view-report-btn">View Report</button>
          </div>
          <div className="report-card">
            <h4>Diversity Metrics</h4>
            <p>Diversity and inclusion statistics</p>
            <button className="view-report-btn">View Report</button>
          </div>
          <div className="report-card">
            <h4>Time to Hire</h4>
            <p>Average time from application to hire</p>
            <button className="view-report-btn">View Report</button>
          </div>
          <div className="report-card">
            <h4>Source Effectiveness</h4>
            <p>Analysis of applicant sources</p>
            <button className="view-report-btn">View Report</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Reports