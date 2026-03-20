import React from 'react'

function InterviewScheduling() {
  return (
    <div className='module-content'>
      <h2>Interview Scheduling</h2>
      <p>Schedule and manage candidate interviews.</p>
      <div className="interview-scheduling-container">
        <div className="scheduling-header">
          <h3>Upcoming Interviews</h3>
          <button className="schedule-new-btn">Schedule New Interview</button>
        </div>
        <div className="interviews-list">
          <div className="interview-card">
            <div className="interview-info">
              <h4>John Smith - Senior Software Developer</h4>
              <p>Date: January 20, 2024</p>
              <p>Time: 2:00 PM</p>
              <p>Interviewer: Sarah Wilson</p>
            </div>
            <div className="interview-actions">
              <button className="reschedule-btn">Reschedule</button>
              <button className="cancel-btn">Cancel</button>
            </div>
          </div>
          <div className="interview-card">
            <div className="interview-info">
              <h4>Mike Johnson - Marketing Manager</h4>
              <p>Date: January 22, 2024</p>
              <p>Time: 10:00 AM</p>
              <p>Interviewer: David Brown</p>
            </div>
            <div className="interview-actions">
              <button className="reschedule-btn">Reschedule</button>
              <button className="cancel-btn">Cancel</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default InterviewScheduling