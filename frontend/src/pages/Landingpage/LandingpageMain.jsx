import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { api } from "../../../api/api";
import LandingPage from "./LandingPage";
import TrackApplication from "./TrackApplication";
import HeaderLanding from "../../Components/Header/HeaderLanding";
import Form from "../Form/Form";
import DocumentSubmission from "../Form/DocumentSubmission";
import NotFound from "../../NotFound";
import DraftCodeApplication from "../../Modals/DraftCodeApplication";

function LandingpageMain() {
  const [isApplicationOpen, setIsApplicationOpen] = useState(true);
  const [appDates, setAppDates] = useState({ start: null, end: null });

  const fetchApplicationStatus = async () => {
    try {
      const response = await api.get("/users/system-settings/");
      const {
        is_application_open,
        application_start_date,
        application_end_date,
      } = response.data;

      let isOpen = is_application_open;

      // If dates are set, use date-based logic (date-driven)
      // This means: if today is within the date range, the application is open
      if (application_start_date && application_end_date) {
        const now = new Date();
        // Create date at midnight in local timezone for comparison
        const today = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
        );

        const parseDate = (dateStr) => {
          const [year, month, day] = dateStr.split("-").map(Number);
          // Create date at midnight in local timezone
          return new Date(year, month - 1, day);
        };

        const start = parseDate(application_start_date);
        const end = parseDate(application_end_date);

        // Check if today is within the date range
        // Button will be enabled if today >= start AND today <= end
        isOpen = today >= start && today <= end;
      }

      setIsApplicationOpen(isOpen);
      setAppDates({ start: application_start_date, end: application_end_date });
    } catch (error) {
      console.error("Error fetching application status:", error);
    }
  };

  useEffect(() => {
    fetchApplicationStatus();

    const pollInterval = setInterval(fetchApplicationStatus, 30000);

    // Also re-fetch when page becomes visible (user returns to tab)
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchApplicationStatus();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(pollInterval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const token = sessionStorage.getItem("token");
  const role = sessionStorage.getItem("role");

  if (token && (role === "Administrator" || role === "Recruiter")) {
    return (
      <Navigate
        to={role === "Administrator" ? "/Dashboard" : "/PersonnelDashboard"}
        replace
      />
    );
  }

  return (
    <div className="bg-gray-100">
      <Routes>
        <Route
          path="/"
          element={
            <>
              <HeaderLanding isApplicationOpen={isApplicationOpen} appDates={appDates} />
              <LandingPage
                isApplicationOpen={isApplicationOpen}
                appDates={appDates}
              />
            </>
          }
        />
        <Route
          path="/track-application"
          element={
            <>
              <HeaderLanding isApplicationOpen={isApplicationOpen} appDates={appDates} />
              <TrackApplication />
            </>
          }
        />

        {/* FIXED: Passed props down to Form and DocumentSubmission */}
        <Route
          path="/form-application"
          element={
            <>
              <HeaderLanding isApplicationOpen={isApplicationOpen} appDates={appDates} />
              <Form isApplicationOpen={isApplicationOpen} />
            </>
          }
        />
        <Route path="/draft-code" element={<DraftCodeApplication />} />

        <Route
          path="/document-submission"
          element={
            <>
              <HeaderLanding isApplicationOpen={isApplicationOpen} appDates={appDates} />
              <div className="mt-20">
                <DocumentSubmission isApplicationOpen={isApplicationOpen} />
              </div>
            </>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default LandingpageMain;
