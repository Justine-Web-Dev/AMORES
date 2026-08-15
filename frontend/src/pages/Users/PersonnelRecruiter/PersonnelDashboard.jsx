import React, { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import SidebarRecruiter from "../../../Components/Sidebar/SidebarRecruiter";
import ApplicantEvaluation from "./ApplicantEvaluation";
import PersonnelOverview from "./PersonnelOverview";
import "./PersonnelDashboard.css";
import DeclinedApplicants from "../../DeclinedApplicants";
import Header from "../../../Components/Header/Header";
import ViewDetails from "../../ViewDetails";
import Form from "../../Form/Form";
import DocumentSubmission from "../../Form/DocumentSubmission";
import SubmitApplicationModal from "../../../Modals/SubmitApplicationModal";
import AccountSettings from "../../Settings/AccountSettings";
import GenerateReport from "../../GenerateReport";

function PersonnelDashboard() {
  const [isCollapsed, setIsCollapsed] = useState(true);

  return (
    <div className="PersonnelDashboard">
      <SidebarRecruiter
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />
      <div className={`main-content ${isCollapsed ? "collapsed" : ""}`}>
        <Header />
        <Routes>
          <Route index element={<PersonnelOverview />} />
          <Route path="applications" element={<ApplicantEvaluation />} />
          <Route path="declined-applicants" element={<DeclinedApplicants />} />
          <Route path="view-details/:id" element={<ViewDetails />} />
          <Route path="application-form" element={<Form />} />
          <Route path="document-submission" element={<DocumentSubmission />} />
          <Route path="success-submit" element={<SubmitApplicationModal />} />
          <Route path="account-settings" element={<AccountSettings />} />
          <Route path="generate-report" element={<GenerateReport />} />
        </Routes>
      </div>
    </div>
  );
}

export default PersonnelDashboard;
