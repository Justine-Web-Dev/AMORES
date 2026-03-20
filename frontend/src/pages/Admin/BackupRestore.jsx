import React from 'react'

function BackupRestore() {
  return (
    <div className='module-content'>
      <h2>Backup & Restore</h2>
      <p>Manage system backups and data restoration.</p>
      <div className="backup-restore-container">
        <div className="backup-section">
          <h3>Create Backup</h3>
          <button className="backup-btn">Create Full Backup</button>
          <button className="backup-btn secondary">Create Incremental Backup</button>
        </div>
        <div className="restore-section">
          <h3>Restore Data</h3>
          <div className="restore-options">
            <label>
              <input type="radio" name="restore-type" value="full" />
              Full System Restore
            </label>
            <label>
              <input type="radio" name="restore-type" value="partial" />
              Partial Restore
            </label>
          </div>
          <button className="restore-btn">Browse Backup Files</button>
        </div>
      </div>
    </div>
  )
}

export default BackupRestore