import React from 'react'

function AuditLogs() {
  return (
    <div className='module-content'>
      <h2>Audit Logs</h2>
      <p>View system activity logs and audit trails.</p>
      <div className="audit-logs-container">
        <div className="logs-header">
          <h3>Recent Activity</h3>
          <button className="export-btn">Export Logs</button>
        </div>
        <div className="logs-list">
          <div className="log-entry">
            <span className="timestamp">2024-01-15 10:30:00</span>
            <span className="action">User login</span>
            <span className="user">admin@example.com</span>
          </div>
          <div className="log-entry">
            <span className="timestamp">2024-01-15 10:25:00</span>
            <span className="action">User created</span>
            <span className="user">john.doe@example.com</span>
          </div>
          <div className="log-entry">
            <span className="timestamp">2024-01-15 10:20:00</span>
            <span className="action">Application submitted</span>
            <span className="user">jane.smith@example.com</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AuditLogs