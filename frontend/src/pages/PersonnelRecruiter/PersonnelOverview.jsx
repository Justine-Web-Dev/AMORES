import React from 'react'

function PersonnelOverview() {
  // Mock data for recent evaluations
  const recentEvaluations = [
    { id: 1, name: 'John Smith', position: 'Senior Software Developer', score: 85, status: 'Shortlisted', date: '2026-03-14' },
    { id: 2, name: 'Jane Doe', position: 'Product Manager', score: 92, status: 'Interviewed', date: '2026-03-13' },
    { id: 3, name: 'Bob Johnson', position: 'UI/UX Designer', score: 78, status: 'Rejected', date: '2026-03-12' },
  ]

  const pendingEvaluations = [
    { id: 4, name: 'Alice Brown', position: 'Data Analyst', submitted: '2026-03-10' },
    { id: 5, name: 'Charlie Wilson', position: 'DevOps Engineer', submitted: '2026-03-09' },
    { id: 6, name: 'Diana Prince', position: 'Marketing Manager', submitted: '2026-03-08' },
  ]

  return (
    <div className='module-content'>
      <h2>Personnel Dashboard Overview</h2>
      <p>Welcome to the Personnel Recruitment Dashboard</p>

      {/* Main Statistics */}
      <div className="personnel-stats">
        <div className="stat-card">
          <h4>Active Job Postings</h4>
          <span className="stat-number">12</span>
        </div>
        <div className="stat-card">
          <h4>Total Applications</h4>
          <span className="stat-number">245</span>
        </div>
        <div className="stat-card">
          <h4>Interviews Scheduled</h4>
          <span className="stat-number">18</span>
        </div>
        <div className="stat-card">
          <h4>Pending Evaluations</h4>
          <span className="stat-number">8</span>
        </div>
      </div>

      {/* Evaluation Section */}
      <div className="evaluation-dashboard-section">
        <div className="evaluation-stats">
          <div className="evaluation-stat-card">
            <h4>Average Evaluation Score</h4>
            <span className="evaluation-score">84.2</span>
            <span className="score-trend positive">+2.1%</span>
          </div>
          <div className="evaluation-stat-card">
            <h4>Evaluations This Week</h4>
            <span className="evaluation-count">23</span>
          </div>
          <div className="evaluation-stat-card">
            <h4>Top Performing Candidates</h4>
            <span className="top-candidates">12</span>
          </div>
        </div>

        {/* Recent Evaluations */}
        <div className="recent-evaluations">
          <h3>Recent Evaluations</h3>
          <div className="evaluations-list">
            {recentEvaluations.map(evaluation => (
              <div key={evaluation.id} className="evaluation-item">
                <div className="evaluation-info">
                  <h4>{evaluation.name}</h4>
                  <p>{evaluation.position}</p>
                  <span className={`status-${evaluation.status.toLowerCase().replace(' ', '-')}`}>
                    {evaluation.status}
                  </span>
                </div>
                <div className="evaluation-score-display">
                  <span className="score">{evaluation.score}/100</span>
                  <span className="date">{evaluation.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pending Evaluations */}
        <div className="pending-evaluations">
          <h3>Pending Evaluations</h3>
          <div className="pending-list">
            {pendingEvaluations.map(pending => (
              <div key={pending.id} className="pending-item">
                <div className="pending-info">
                  <h4>{pending.name}</h4>
                  <p>{pending.position}</p>
                  <span className="submitted-date">Submitted: {pending.submitted}</span>
                </div>
                <button className="evaluate-now-btn">Evaluate Now</button>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <h3>Quick Actions</h3>
          <div className="action-buttons">
            <button className="action-btn primary">Start New Evaluation</button>
            <button className="action-btn secondary">View All Evaluations</button>
            <button className="action-btn secondary">Generate Report</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PersonnelOverview