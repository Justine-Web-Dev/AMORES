import React from 'react'

function ApplicantInfoView() {
  return (
<div className="bg-[#F9FAFB] shadow-md rounded-[12px] summary-container">
      <header className="summary-header">
        <h1 className='text-[28px] font-semibold'>Applicant Information </h1>
        <p>A detailed overview of the applicant's submitted information.</p>
      </header>

      {/* Personal Information Section */}
      <section className="info-section">
        <h1 className='text-black label-info'>Personal Information</h1>
        <div className="grid-layout">
          <div className="info-item">
            <label>Last Name</label>
            <p>Jones</p>
            </div>
          <div className="info-item">
            <label>First Name</label>
            <p>Peter</p>
          </div>
          <div className="info-item">
            <label>Age</label>
            <p>22</p>
          </div>
          <div className="info-item">
            <label>CP #</label>
            <p>09205555555</p>
          </div>
          <div className="info-item">
            <label>Height</label>
            <p>180cm</p>
          </div>
        </div>
      </section>

      {/* Educational Background Section */}
      <section className="info-section">
        <h1 className='text-black label-info'>Educational Background</h1>
        <div className="grid-layout">
          <div className="info-item"><label>School</label><p>De La Salle University</p></div>
          <div className="info-item"><label>Course</label><p>BS Information Technology</p></div>
          <div className="info-item"><label>Date Graduated</label><p>June 1st, 2023</p></div>
        </div>
      </section>
    </div>
  )
}

export default ApplicantInfoView
