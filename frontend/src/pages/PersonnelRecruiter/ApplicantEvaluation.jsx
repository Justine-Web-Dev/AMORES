import React, { useState } from 'react'
import DetailedEvaluation from './DetailedEvaluation'
import Header from '../../Components/Header/Header'

function ApplicantEvaluation() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [sortBy, setSortBy] = useState('name')
  const [selectedApplicant, setSelectedApplicant] = useState(null)
  const [showEvaluationModal, setShowEvaluationModal] = useState(false)

  // Mock data for applicants
  const applicants = [
    { id: 1, name: 'John Smith', position: 'Senior Software Developer', status: 'Under Review', score: 85, dateApplied: '2024-03-15' },
    { id: 2, name: 'Jane Doe', position: 'Product Manager', status: 'Interviewed', score: 92, dateApplied: '2024-03-10' },
    { id: 3, name: 'Bob Johnson', position: 'UI/UX Designer', status: 'Rejected', score: 78, dateApplied: '2024-03-20' },
    { id: 4, name: 'Alice Brown', position: 'Data Analyst', status: 'Shortlisted', score: 88, dateApplied: '2024-03-12' },
  ]

  const filteredApplicants = applicants
    .filter(applicant =>
      applicant.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (statusFilter === 'All' || applicant.status === statusFilter)
    )
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name)
      if (sortBy === 'date') return new Date(a.dateApplied) - new Date(b.dateApplied)
      if (sortBy === 'score') return b.score - a.score
      return 0
    })

  const handleEvaluate = (applicant) => {
    setSelectedApplicant(applicant)
    setShowEvaluationModal(true)
  }

  const handleCloseEvaluation = () => {
    setShowEvaluationModal(false)
    setSelectedApplicant(null)
  }

  const handleSaveEvaluation = (applicantId, evaluation) => {
    // Here you would typically send the evaluation to your backend
    console.log('Saving evaluation for applicant', applicantId, evaluation)
    // For now, we'll just log it. In a real app, you'd update the applicant's status and score
    alert(`Evaluation saved for ${selectedApplicant.name}!`)
  }

  return (
    <div>
      <div className='module-content'>
        <h2>Applicant Evaluation</h2>
        <p>Utilize smart filtering to search, sort, and categorize applicants according to their current status.</p>

        <div className="filter-controls">
          <input
            type="text"
            placeholder="Search applicants..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="filter-select">
            <option value="All">All Statuses</option>
            <option value="Under Review">Under Review</option>
            <option value="Shortlisted">Shortlisted</option>
            <option value="Interviewed">Interviewed</option>
            <option value="Rejected">Rejected</option>
          </select>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="sort-select">
            <option value="date">Sort by Date</option>
            <option value="name">Sort by Name</option>
          </select>
        </div>

        <div className="applicant-list">
          {filteredApplicants.map(applicant => (
            <div key={applicant.id} className="applicant-card">
              <div className="applicant-info">
                <h3>{applicant.name}</h3>
                <p>Position: {applicant.position}</p>
                <p>Date Applied: {new Date(applicant.dateApplied).toLocaleDateString()}</p>
                <p>Status: <span className={`status-${applicant.status.toLowerCase().replace(' ', '-')}`}>{applicant.status}</span></p>
                <p>Score: {applicant.score}/100</p>
              </div>
              <div className="applicant-actions">
                <button className="evaluate-btn" onClick={() => handleEvaluate(applicant)}>Evaluate</button>
                <button className="view-details-btn">View Details</button>
              </div>
            </div>
          ))}
        </div>

        {showEvaluationModal && selectedApplicant && (
          <DetailedEvaluation
            applicant={selectedApplicant}
            onClose={handleCloseEvaluation}
            onSave={handleSaveEvaluation}
          />
        )}
      </div>
    </div>
  )
}

export default ApplicantEvaluation