import React, { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import SidebarInterviewer from "../../../Components/Sidebar/SidebarInterviewer";
import Header from "../../../Components/Header/Header";
import InterviewDashboard from "./InterviewDashboard";
import AccountSettings from "../../Settings/AccountSettings";
import ApplicantEvaluation from "../PersonnelRecruiter/ApplicantEvaluation";
import ViewDetails from "../../ViewDetails";

function InterviewMain() {
  const [isCollapsed, setIsCollapsed] = useState(true);

  // Prevent back button from leaving the dashboard
  useEffect(() => {
    // Push two states so that when back is clicked, the URL doesn't actually change
    window.history.pushState(null, null, window.location.href);
    window.history.pushState(null, null, window.location.href);

    const handlePopState = () => {
      // Push state forward again
      window.history.pushState(null, null, window.location.href);
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  return (
    <div className="PersonnelDashboard">
      <SidebarInterviewer
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />
      <div className={`main-content ${isCollapsed ? "collapsed" : ""}`}>
        <Header />
        <Routes>
          <Route index element={<InterviewDashboard />} />
          <Route path="account-settings" element={<AccountSettings />} />
          <Route
            path="applications"
            element={<ApplicantEvaluation isInterviewer={true} />}
          />
          <Route path="view-details/:id" element={<ViewDetails />} />
        </Routes>
      </div>
    </div>
  );
}

export default InterviewMain;
