import { useState } from "react";
import "./DisclaimerCSS.css";
import logo from '../src/assets/RRSU1 logo.png'

function Disclaimer({ onAccept, onCancel }) {
  const [checked, setChecked] = useState(false);

  return (
    <div className="disclaimer-overlay">
      <div className="disclaimer-modal">

        {/* Header */}
        <div className="disclaimer-header">
          <div className="disclaimer-header-icon">
            <img src={logo} alt="Pnp logo" />
          </div>
          <div>
            <div className="disclaimer-header-title">PNP Recruitment 2026</div>
            <div className="disclaimer-header-sub">
              Philippine National Police — Official Recruitment Portal
            </div>
          </div>
        </div>

        {/* Title bar */}
        <div className="disclaimer-titlebar">
          <div className="disclaimer-titlebar-text">
            Applicant Disclaimer and Privacy Notice
          </div>
        </div>

        {/* Body */}
        <div className="disclaimer-body">

          <p>
            Before proceeding with your application, please read and understand
            the following terms and conditions governing the PNP Recruitment
            process for 2026.
          </p>

          <div className="disclaimer-section-label">Data Usage</div>
          <p>
            Personal information submitted through this recruitment portal shall
            be collected, stored, and used <strong>exclusively for the purpose
            of processing your recruitment application</strong>. Said information
            shall not be used for any other purpose without your prior consent,
            except as required by law or authorized government processes.
          </p>

          <div className="disclaimer-section-label">Privacy & Consent</div>
          <p>
            By submitting your application, you acknowledge and consent to the
            collection and processing of your personal data in accordance with
            <strong> Republic Act No. 10173</strong>, otherwise known as the
            Data Privacy Act of 2012, and its Implementing Rules and Regulations.
            The Philippine National Police is committed to protecting the
            confidentiality and integrity of all applicant information.
          </p>

          <div className="disclaimer-section-label">Accuracy Certification</div>
          <p>
            You hereby certify that all information provided in this application —
            including but not limited to your personal details, educational
            background, civil service eligibility, and employment history —
            is <strong>true, accurate, and complete</strong> to the best of your
            knowledge. Any misrepresentation or omission of material facts shall
            be grounds for immediate disqualification from the recruitment process.
          </p>

          <div className="disclaimer-section-label">False Statement Notice</div>
          <p>
            The submission of false, misleading, or fraudulent information in
            connection with this application is a serious offense. Applicants
            found to have submitted false statements shall be subject to
            <strong> disqualification, administrative sanctions, and/or criminal
            prosecution</strong> under applicable Philippine laws, including
            Republic Act No. 6713 (Code of Conduct and Ethical Standards for
            Public Officials and Employees).
          </p>

          <div className="disclaimer-section-label">Reference Notice</div>
          <p>
            Recruitment quota figures, slot allocations, and other statistical
            information presented in this portal may be based on{" "}
            <strong>previous year's data</strong> and are provided for reference
            purposes only. Final figures are subject to change based on the
            official announcement of the PNP Recruitment and Selection Board.
          </p>

          <div className="disclaimer-note">
            For official recruitment updates, refer only to the PNP official
            website and authorized regional police offices. Beware of
            fixers and unauthorized recruitment facilitators.
          </div>

        </div>

        {/* Footer */}
        <div className="disclaimer-footer">
          <label className="disclaimer-checkbox-label">
            <input
              type="checkbox"
              className="disclaimer-checkbox"
              checked={checked}
              onChange={(e) => setChecked(e.target.checked)}
            />
            <span className="disclaimer-checkbox-text">
              I have read and fully understood the disclaimer above. I certify
              that all information I will provide is true and correct, and I
              consent to the processing of my personal data for recruitment
              purposes.
            </span>
          </label>

          <div className="disclaimer-actions">
            <button className="disclaimer-btn-cancel" onClick={onCancel}>
              Cancel
            </button>
            <button
              className={`disclaimer-btn-accept ${checked ? "active" : "disabled"}`}
              onClick={() => checked && onAccept && onAccept()}
            >
              I Agree & Continue
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Disclaimer;
