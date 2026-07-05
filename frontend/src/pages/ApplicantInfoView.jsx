import React from "react";

function ApplicantInfoView({ data }) {
  if (!data) return null;

  return (
    <div className="bg-[#F9FAFB] shadow-md rounded-[12px] summary-container">
      <header className="summary-header">
        <h1 className="text-[28px] font-semibold">Applicant Information </h1>
        <p>A detailed overview of the applicant's submitted information.</p>
      </header>

      {/* Personal Information Section */}
      <section className="info-section">
        <h1 className="text-black label-info">Personal Information</h1>
        <div className="grid-layout">
          <div className="info-item">
            <label>Last Name</label>
            <p>{data.lastname || "N/A"}</p>
          </div>
          <div className="info-item">
            <label>First Name</label>
            <p>{data.firstname || "N/A"}</p>
          </div>
          <div className="info-item">
            <label>Birthdate</label>
            <p>{data.birthdate || "N/A"}</p>
          </div>
          <div className="info-item">
            <label>Age</label>
            <p>{data.age || "N/A"}</p>
          </div>
          <div className="info-item">
            <label>CP #</label>
            <p>{data.cp_number || "N/A"}</p>
          </div>
          <div className="info-item">
            <label>Height</label>
            <p>{data.height || "N/A"}</p>
          </div>
        </div>
      </section>

      {/* Educational Background Section */}
      <section className="info-section">
        <h1 className="text-black label-info">Educational Background</h1>
        <div className="grid-layout">
          <div className="info-item">
            <label>School</label>
            <p>{data.name_of_school || "N/A"}</p>
          </div>
          <div className="info-item">
            <label>Course</label>
            <p>{data.program || "N/A"}</p>
          </div>
          <div className="info-item">
            <label>Date Graduated</label>
            <p>{data.date_graduated || "N/A"}</p>
          </div>
        </div>
      </section>

      {/* Assessment Results Section */}
      {(data.bmi_height ||
        data.pat_score ||
        data.psychological_result ||
        data.medical_result ||
        data.drug_test_result ||
        data.final_interview_score ||
        data.oath_taking_date ||
        data.scheduled_date ||
        data.scheduled_time) && (
        <section className="info-section">
          <h1 className="text-black label-info">
            Assessment & Screening Results
          </h1>
          <div className="grid-layout">
            {(data.scheduled_date || data.scheduled_time) && (
              <div className="info-item">
                <label className="text-blue-600">BMI Schedule</label>
                <p className="font-bold text-blue-800">
                  {data.scheduled_date || "No date set"}{" "}
                  {data.scheduled_time ? `/ ${data.scheduled_time}` : ""}
                </p>
              </div>
            )}
            {data.bmi_height && (
              <div className="info-item">
                <label>BMI Data</label>
                <p>
                  {data.bmi_height}cm / {data.bmi_weight}kg
                </p>
              </div>
            )}
            {data.pat_score !== null && data.pat_score !== undefined && (
              <div className="info-item">
                <label>PAT Score</label>
                <p>{data.pat_score}</p>
              </div>
            )}
            {data.psychological_result && (
            <div className="info-item mt-4">
              <label>Neurological Examination</label>
              <p className="whitespace-pre-wrap">{data.psychological_result}</p>
            </div>
          )}
          {data.medical_result && (
            <div className="info-item mt-4">
              <label>Medical Findings</label>
              <p className="whitespace-pre-wrap">{data.medical_result}</p>
            </div>
          )}
            {data.drug_test_result && (
              <div className="info-item">
                <label>Drug Test</label>
                <p>{data.drug_test_result}</p>
              </div>
            )}
            {data.final_interview_score !== null &&
              data.final_interview_score !== undefined && (
                <div className="info-item">
                  <label>Final Interview</label>
                  <p>{data.final_interview_score}</p>
                </div>
              )}
            {data.oath_taking_date && (
              <div className="info-item">
                <label>Oath Taking</label>
                <p>{data.oath_taking_date}</p>
              </div>
            )}
            
          </div>
          {data.evaluation_remarks && (
            <div className="info-item mt-4">
              <label>Remarks / Findings</label>
              <p className="whitespace-pre-wrap">{data.evaluation_remarks}</p>
            </div>
          )}
          
        </section>
      )}
    </div>
  );
}

export default ApplicantInfoView;
