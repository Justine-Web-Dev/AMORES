import React, { useState } from 'react'

function DetailedEvaluation({ applicant, onClose, onSave }) {
  const [evaluation, setEvaluation] = useState({
    technicalSkills: 0,
    communication: 0,
    problemSolving: 0,
    culturalFit: 0,
    experience: 0,
    overallRating: 0,
    comments: '',
    recommendation: 'pending'
  })

  const handleRatingChange = (criteria, rating) => {
    setEvaluation(prev => ({
      ...prev,
      [criteria]: rating
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Calculate overall rating as average
    const overall = Math.round(
      (evaluation.technicalSkills + evaluation.communication +
       evaluation.problemSolving + evaluation.culturalFit + evaluation.experience) / 5
    )

    const finalEvaluation = {
      ...evaluation,
      overallRating: overall
    }

    onSave(applicant.id, finalEvaluation)
    onClose()
  }

  const RatingStars = ({ criteria, value, onChange }) => (
    <div className="rating-stars">
      {[1, 2, 3, 4, 5].map(star => (
        <span
          key={star}
          className={`star ${value >= star ? 'filled' : ''}`}
          onClick={() => onChange(criteria, star)}
        >
          ★
        </span>
      ))}
      <span className="rating-value">({value}/5)</span>
    </div>
  )

  return (
    <div className="evaluation-modal-overlay">
      <div className="evaluation-modal">
        <div className="evaluation-header">
          <h2>Detailed Evaluation - {applicant.name}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="applicant-summary">
          <div className="summary-item">
            <strong>Position:</strong> {applicant.position}
          </div>
          <div className="summary-item">
            <strong>Current Status:</strong>
            <span className={`status-${applicant.status.toLowerCase().replace(' ', '-')}`}>
              {applicant.status}
            </span>
          </div>
          <div className="summary-item">
            <strong>Current Score:</strong> {applicant.score}/100
          </div>
        </div>

        <form onSubmit={handleSubmit} className="evaluation-form">
          <div className="evaluation-criteria">
            <h3>Evaluation Criteria</h3>

            <div className="criteria-item">
              <label>Technical Skills</label>
              <RatingStars
                criteria="technicalSkills"
                value={evaluation.technicalSkills}
                onChange={handleRatingChange}
              />
            </div>

            <div className="criteria-item">
              <label>Communication Skills</label>
              <RatingStars
                criteria="communication"
                value={evaluation.communication}
                onChange={handleRatingChange}
              />
            </div>

            <div className="criteria-item">
              <label>Problem Solving</label>
              <RatingStars
                criteria="problemSolving"
                value={evaluation.problemSolving}
                onChange={handleRatingChange}
              />
            </div>

            <div className="criteria-item">
              <label>Cultural Fit</label>
              <RatingStars
                criteria="culturalFit"
                value={evaluation.culturalFit}
                onChange={handleRatingChange}
              />
            </div>

            <div className="criteria-item">
              <label>Relevant Experience</label>
              <RatingStars
                criteria="experience"
                value={evaluation.experience}
                onChange={handleRatingChange}
              />
            </div>
          </div>

          <div className="evaluation-comments">
            <label htmlFor="comments">Comments & Notes</label>
            <textarea
              id="comments"
              value={evaluation.comments}
              onChange={(e) => setEvaluation(prev => ({ ...prev, comments: e.target.value }))}
              placeholder="Provide detailed feedback, strengths, areas for improvement..."
              rows="4"
            />
          </div>

          <div className="evaluation-recommendation">
            <label>Recommendation</label>
            <select
              value={evaluation.recommendation}
              onChange={(e) => setEvaluation(prev => ({ ...prev, recommendation: e.target.value }))}
            >
              <option value="pending">Pending Review</option>
              <option value="reject">Reject</option>
              <option value="interview">Schedule Interview</option>
              <option value="shortlist">Shortlist</option>
              <option value="hire">Recommend for Hire</option>
            </select>
          </div>

          <div className="evaluation-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="save-btn">
              Save Evaluation
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default DetailedEvaluation