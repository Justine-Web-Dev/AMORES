import React from 'react'

function ApplicantInfoView({data}) {
  if (!data) return null
  
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
            <p>{data.lastname || 'N/A'}</p>
            </div>
          <div className="info-item">
            <label>First Name</label>
            <p>{data.firstname || 'N/A'}</p>
          </div>
          <div className="info-item">
            <label>Age</label>
            <p>{data.age || 'N/A'}</p>
          </div>
          <div className="info-item">
            <label>CP #</label>
            <p>{data.cp_number || 'N/A'}</p>
          </div>
          <div className="info-item">
            <label>Height</label>
            <p>{data.height || 'N/A'}</p>
          </div>
        </div>
      </section>

      {/* Educational Background Section */}
      <section className="info-section">
        <h1 className='text-black label-info'>Educational Background</h1>
        <div className="grid-layout">
          <div className="info-item"><label>School</label><p>{data.name_of_school || 'N/A'}</p></div>
          <div className="info-item"><label>Course</label><p>{data.program || 'N/A'}</p></div>
          <div className="info-item"><label>Date Graduated</label><p>{data.date_graduated || 'N/A'}</p></div>
        </div>
      </section>
    </div>
  )
}

export default ApplicantInfoView
