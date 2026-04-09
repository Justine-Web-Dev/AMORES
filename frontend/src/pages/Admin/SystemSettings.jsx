import React from 'react'

function SystemSettings() {
  return (
    <div className='module-content'>
      <h2>System Settings</h2>
      <p>Configure system-wide settings and preferences.</p>
      <div className="system-settings-container">
        <div className="settings-section">
          <h3>General Settings</h3>
          <div className="setting-item">
            <label>System Name:</label>
            <input type="text" defaultValue="AMORes System" />
          </div>
          <div className="setting-item">
            <label>Default Language:</label>
            <select defaultValue="en">
              <option value="en">English</option>
              <option value="tg">Tagalog</option>
            </select>
          </div>
        </div>
        <div className="settings-section">
          <h3>Security Settings</h3>
          <div className="setting-item">
            <label>Session Timeout (minutes):</label>
            <input type="number" defaultValue="30" />
          </div>
        </div>
        <button className="save-settings-btn">Save Settings</button>
      </div>
    </div>
  )
}

export default SystemSettings