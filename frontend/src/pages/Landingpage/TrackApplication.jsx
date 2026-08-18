import React, { useState } from "react";
import "./TrackApplicationCss.css";
import { CiSearch } from "react-icons/ci";

import { api } from "../../../api/api";

import { HiOutlineXCircle, HiOutlineCalendar } from "react-icons/hi";

function TrackApplication() {
  const [code, setCode] = useState("");
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const statusColors = {
    "New Applicant": "bg-blue-100 text-blue-600",
    Qualified: "bg-indigo-100 text-indigo-700",
    Accepted: "bg-emerald-100 text-emerald-700",
    Rejected: "bg-rose-100 text-rose-700",
    Failed: "bg-red-100 text-red-700",
    "Body Mass Index": "bg-blue-50 text-blue-500",
    "Physical Agility Test": "bg-orange-100 text-orange-600",
    "Neuro Examination": "bg-indigo-100 text-indigo-600",
    Medical: "bg-pink-100 text-pink-600",
    "Drug Test": "bg-amber-100 text-amber-600",
    "Final Interview": "bg-teal-100 text-teal-600",
    "Oath Taking": "bg-emerald-100 text-emerald-600",
  };

  const INITIAL_STAGES = ["New Applicant", "Qualified"];

  const POST_ACCEPTANCE_STAGES = [
    "Body Mass Index",
    "Physical Agility Test",
    "Neuro Examination",
    "Medical",
    "Drug Test",
    "Final Interview",
    "Oath Taking",
  ];

  const getFailedStage = () => {
    if (
      !application ||
      (application.status !== "Failed" && application.status !== "Rejected")
    )
      return null;

    if (
      application.final_interview_score != null &&
      !application.oath_taking_date
    )
      return "Final Interview";
    if (
      application.drug_test_result != null &&
      application.final_interview_score == null
    )
      return "Drug Test";
    if (
      application.medical_result != null &&
      application.drug_test_result == null
    )
      return "Medical";
    if (
      application.psychological_result != null &&
      application.medical_result == null
    )
      return "Neuro Examination";
    if (
      (application.pat_score != null ||
        application.pat_pushups != null ||
        application.pat_situps != null ||
        application.pat_run != null) &&
      application.psychological_result == null
    )
      return "Physical Agility Test";
    if (
      application.bmi_height != null &&
      application.pat_score == null &&
      application.pat_pushups == null
    )
      return "Body Mass Index";

    return "New Applicant";
  };

  const isPostAccepted =
    application &&
    (application.status === "Qualified" ||
      application.status === "Accepted" ||
      POST_ACCEPTANCE_STAGES.includes(application.status) ||
      POST_ACCEPTANCE_STAGES.includes(getFailedStage()));

  const STAGES = isPostAccepted
    ? [...INITIAL_STAGES, ...POST_ACCEPTANCE_STAGES]
    : INITIAL_STAGES;

  const handleTrack = async () => {
    if (!code.trim()) {
      setError("Please enter a tracking code");
      return;
    }

    setLoading(true);
    setError("");
    setApplication(null);

    try {
      const response = await api.get(
        `users/track-status/?code=${code.toUpperCase()}`,
      );
      setApplication(response.data);
    } catch (err) {
      setError(err.response?.data?.error || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const getStageIndex = (status) => {
    if (status === "Rejected") return -1;
    return STAGES.indexOf(status);
  };

  const hasPassedStage = (stageName) => {
    if (!application) return false;

    const failedStage = getFailedStage();
    if (failedStage) {
      const failedIndex = STAGES.indexOf(failedStage);
      const stageIndex = STAGES.indexOf(stageName);
      return stageIndex < failedIndex;
    }

    const currentIndex = STAGES.indexOf(application.status);
    const stageIndex = STAGES.indexOf(stageName);
    return currentIndex > stageIndex || application.status === "Accepted";
  };

  const hasFailedStage = (stageName) => {
    return getFailedStage() === stageName;
  };

  return (
    <div className="min-h-screen p-4 flex justify-center items-start track-application-container">
      <div className="flex flex-col w-full max-w-6xl items-center rounded-[8px] gap-8 p-6 md:p-10 bg-white shadow-sm track-container">
        <div className="w-full text-left">
          <h1 className="text-2xl md:text-[32px] font-semibold leading-tight">
            Track Your Application
          </h1>
          <p className="text-gray-600 ">
            Enter your reference number to see the current status of your
            application.
          </p>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-4 w-full border-b-1 input-track-container">
          <div className="w-full md:flex-1">
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="e.g., TA-1234AB"
              className="w-full border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-800 track-application-input"
            />
          </div>

          <button
            onClick={handleTrack}
            className="w-full md:w-auto flex justify-center items-center gap-2 bg-[#2C2D86] text-white font-semibold rounded hover:bg-opacity-90 transition-all check-status-btn"
          >
            <CiSearch size={25} />
            {loading ? "Searching" : "Check status"}
          </button>
        </div>

        {error && (
          <div className="w-full p-4 text-red-700 bg-red-100 rounded error-msg">
            {error}
          </div>
        )}

        {application && (
          <div className="w-full  animate-fade-in rounded app-details">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold title-app-details">
                Application Progress
              </h3>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${statusColors[application.status] || "bg-gray-100 text-gray-600"}`}
              >
                {(application.status === "Failed" ||
                  application.status === "Rejected") &&
                getFailedStage()
                  ? `${application.status} at ${getFailedStage()}`
                  : application.status}
              </span>
            </div>

            {/* Visual Stepper */}
            <div className="w-full mb-14 mt-4 overflow-x-auto md:overflow-x-visible pb-10 stepper-scroll-container">
              <div className="relative flex justify-between items-center min-w-[1000px] md:min-w-full px-10">
                {/* Progress Line */}
                <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -translate-y-1/2 z-0"></div>
                <div
                  className="absolute top-1/2 left-0 h-1 -translate-y-1/2 z-0 transition-all duration-500"
                  style={{
                    width: `${Math.max(0, (STAGES.reduce((maxIdx, stage, idx) => (hasPassedStage(stage) || hasFailedStage(stage) || application.status === stage ? idx : maxIdx), 0) / (STAGES.length - 1)) * 100)}%`,
                    backgroundColor: "#2C2D86",
                  }}
                ></div>

                {STAGES.map((stage, index) => {
                  const isPassed = hasPassedStage(stage);
                  const isFailed = hasFailedStage(stage);
                  const isCurrent =
                    application.status !== "Failed" &&
                    application.status !== "Rejected" &&
                    stage === application.status;
                  const isActive = isPassed || isFailed || isCurrent;

                  return (
                    <div
                      key={stage}
                      className="relative z-10 flex flex-col items-center"
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                          isFailed
                            ? "bg-red-500 text-white shadow-md ring-4 ring-red-100"
                            : isPassed || isCurrent
                              ? "text-white shadow-md"
                              : "bg-white text-gray-400 border-2 border-gray-200"
                        } ${isCurrent ? "ring-4 ring-indigo-50" : ""}`}
                        style={
                          (isPassed || isCurrent) && !isFailed
                            ? { backgroundColor: "#2C2D86" }
                            : {}
                        }
                      >
                        {index + 1}
                      </div>
                      <span
                        className={`absolute -bottom-10 whitespace-nowrap text-[10px] font-bold uppercase tracking-tight text-center ${
                          isFailed
                            ? "text-red-600"
                            : isActive
                              ? ""
                              : "text-gray-400"
                        }`}
                        style={
                          isActive && !isFailed ? { color: "#2C2D86" } : {}
                        }
                      >
                        {stage === "New Applicant"
                          ? "Submitted"
                          : stage === "Qualified"
                            ? "Qualified"
                            : stage === "Accepted"
                              ? "Accepted"
                              : stage === "Body Mass Index"
                                ? "BMI"
                                : stage === "Physical Agility Test"
                                  ? "PAT"
                                  : stage === "Neuro Examination"
                                    ? "Neuro"
                                    : stage === "Drug Test"
                                      ? "Drug"
                                      : stage === "Final Interview"
                                        ? "Final"
                                        : stage === "Oath Taking"
                                          ? "Oath"
                                          : stage}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {(application.status === "Rejected" ||
              application.status === "Failed") &&
              application.rejection_reason && (
                <div className="w-full mt-2 mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-bold text-red-700 uppercase tracking-wider">
                      Remarks:
                    </span>
                    <p className="text-sm font-semibold text-red-600">
                      {application.rejection_reason}
                    </p>
                  </div>
                </div>
              )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 bg-gray-50 p-6 rounded-lg border border-gray-100">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase font-bold text-gray-400">
                  Applicant Name
                </span>
                <p className="font-semibold text-gray-800">
                  {application.full_name}
                </p>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase font-bold text-gray-400">
                  Desired Program
                </span>
                <p className="font-semibold text-gray-800">
                  {application.program}
                </p>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase font-bold text-gray-400">
                  Reference Number
                </span>
                <p className="font-semibold ">{application.tracking_code}</p>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase font-bold text-gray-400">
                  Submission Date
                </span>
                <p className="font-semibold text-gray-800">
                  {new Date(application.date_applied).toLocaleDateString(
                    undefined,
                    { dateStyle: "long" },
                  )}
                </p>
              </div>

              {POST_ACCEPTANCE_STAGES.includes(application?.status) && (
                <div className="flex flex-col gap-1 col-span-1 md:col-span-2 mt-4 pt-4 border-t border-gray-200">
                  <span className="text-[10px] uppercase font-bold text-purple-600">
                    Scheduled Date & Time for {application.status}
                  </span>
                  <p className="font-bold text-gray-800 text-lg">
                    {application?.scheduled_date
                      ? new Date(application.scheduled_date).toLocaleDateString(
                          undefined,
                          { dateStyle: "long" },
                        )
                      : "TBA"}
                    {application?.scheduled_date && application?.scheduled_time
                      ? " at " +
                        (() => {
                          const [hourString, minute] =
                            application.scheduled_time.split(":");
                          const hour = parseInt(hourString, 10);
                          const ampm = hour >= 12 ? "PM" : "AM";
                          const formattedHour = hour % 12 || 12;
                          return `${formattedHour}:${minute} ${ampm}`;
                        })()
                      : ""}
                  </p>
                </div>
              )}

              {application?.bmi_height && (
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase font-bold text-gray-400">
                    BMI Data (H/W)
                  </span>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-gray-800">
                      {application.bmi_height} cm / {application.bmi_weight} kg
                    </p>
                    {hasPassedStage("Body Mass Index") && (
                      <div className="inline-block px-2 py-0.5 border border-green-600 text-green-600 font-bold text-[10px] uppercase tracking-wider rounded w-max bg-green-50">
                        PASSED
                      </div>
                    )}
                    {hasFailedStage("Body Mass Index") && (
                      <div className="inline-block px-2 py-0.5 border border-red-600 text-red-600 font-bold text-[10px] uppercase tracking-wider rounded w-max bg-red-50">
                        FAILED
                      </div>
                    )}
                  </div>
                </div>
              )}

              {(application?.pat_score ||
                application?.pat_pushups ||
                application?.pat_situps ||
                application?.pat_run) && (
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] uppercase font-bold text-gray-400">
                    Physical Agility Test Result
                  </span>

                  {application.pat_pushups !== null && (
                    <div className="flex items-center gap-2 text-xs border-b border-gray-100 pb-1">
                      <span className="text-gray-500 w-32">
                        1-Min Push UPS:
                      </span>
                      <p className="font-bold text-gray-800">
                        {application.pat_pushups}
                      </p>
                      {application.pat_pushups_passed ? (
                        <div className="inline-block px-2 py-0.5 border border-green-600 text-green-600 font-bold text-[10px] uppercase tracking-wider rounded w-max bg-green-50">
                          PASSED
                        </div>
                      ) : (
                        <div className="inline-block px-2 py-0.5 border border-red-600 text-red-600 font-bold text-[10px] uppercase tracking-wider rounded w-max bg-red-50">
                          FAILED
                        </div>
                      )}
                    </div>
                  )}
                  {application.pat_situps !== null && (
                    <div className="flex items-center gap-2 text-xs border-b border-gray-100 pb-1">
                      <span className="text-gray-500 w-32">1-Min Sit-On:</span>
                      <p className="font-bold text-gray-800">
                        {application.pat_situps}
                      </p>
                      {application.pat_situps_passed ? (
                        <div className="inline-block px-2 py-0.5 border border-green-600 text-green-600 font-bold text-[10px] uppercase tracking-wider rounded w-max bg-green-50">
                          PASSED
                        </div>
                      ) : (
                        <div className="inline-block px-2 py-0.5 border border-red-600 text-red-600 font-bold text-[10px] uppercase tracking-wider rounded w-max bg-red-50">
                          FAILED
                        </div>
                      )}
                    </div>
                  )}
                  {application.pat_run && (
                    <div className="flex items-center gap-2 text-xs border-b border-gray-100 pb-1">
                      <span className="text-gray-500 w-32">3K Run:</span>
                      <p className="font-bold text-gray-800">
                        {application.pat_run}
                      </p>
                      {application.pat_run_passed ? (
                        <div className="inline-block px-2 py-0.5 border border-green-600 text-green-600 font-bold text-[10px] uppercase tracking-wider rounded w-max bg-green-50">
                          PASSED
                        </div>
                      ) : (
                        <div className="inline-block px-2 py-0.5 border border-red-600 text-red-600 font-bold text-[10px] uppercase tracking-wider rounded w-max bg-red-50">
                          FAILED
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {application?.psychological_result && (
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase font-bold text-gray-400">
                    Neuro Examination Result
                  </span>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-gray-800">
                      {application.psychological_result}
                    </p>
                    {hasPassedStage("Neuro Examination") && (
                      <div className="inline-block px-2 py-0.5 border border-green-600 text-green-600 font-bold text-[10px] uppercase tracking-wider rounded w-max bg-green-50">
                        PASSED
                      </div>
                    )}
                    {hasFailedStage("Neuro Examination") && (
                      <div className="inline-block px-2 py-0.5 border border-red-600 text-red-600 font-bold text-[10px] uppercase tracking-wider rounded w-max bg-red-50">
                        FAILED
                      </div>
                    )}
                  </div>
                </div>
              )}

              {application?.medical_result && (
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase font-bold text-gray-400">
                    Medical Examination Result
                  </span>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-gray-800">
                      {application.medical_result}
                    </p>
                    {hasPassedStage("Medical") && (
                      <div className="inline-block px-2 py-0.5 border border-green-600 text-green-600 font-bold text-[10px] uppercase tracking-wider rounded w-max bg-green-50">
                        PASSED
                      </div>
                    )}
                    {hasFailedStage("Medical") && (
                      <div className="inline-block px-2 py-0.5 border border-red-600 text-red-600 font-bold text-[10px] uppercase tracking-wider rounded w-max bg-red-50">
                        FAILED
                      </div>
                    )}
                  </div>
                </div>
              )}

              {application?.drug_test_result && (
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase font-bold text-gray-400">
                    Drug Test Result
                  </span>
                  <div className="flex items-center gap-2">
                    <p
                      className={`font-bold ${application.drug_test_result === "Positive" ? "text-red-600" : "text-green-600"}`}
                    >
                      {application.drug_test_result}
                    </p>
                    {hasPassedStage("Drug Test") &&
                      application.drug_test_result !== "Positive" && (
                        <div className="inline-block px-2 py-0.5 border border-green-600 text-green-600 font-bold text-[10px] uppercase tracking-wider rounded w-max bg-green-50">
                          PASSED
                        </div>
                      )}
                    {hasFailedStage("Drug Test") && (
                      <div className="inline-block px-2 py-0.5 border border-red-600 text-red-600 font-bold text-[10px] uppercase tracking-wider rounded w-max bg-red-50">
                        FAILED
                      </div>
                    )}
                  </div>
                </div>
              )}

              {application?.final_interview_score && (
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase font-bold text-gray-400">
                    Final Interview Score
                  </span>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-gray-800">
                      {application.final_interview_score}
                    </p>
                    {parseFloat(application.final_interview_score) >= 75 ? (
                      <div className="inline-block px-2 py-0.5 border border-green-600 text-green-600 font-bold text-[10px] uppercase tracking-wider rounded w-max bg-green-50">
                        PASSED
                      </div>
                    ) : (
                      <div className="inline-block px-2 py-0.5 border border-red-600 text-red-600 font-bold text-[10px] uppercase tracking-wider rounded w-max bg-red-50">
                        FAILED
                      </div>
                    )}
                  </div>
                </div>
              )}

              {application?.oath_taking_date && (
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase font-bold text-gray-400">
                    Oath Taking Date
                  </span>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-blue-800">
                      {new Date(
                        application.oath_taking_date,
                      ).toLocaleDateString(undefined, { dateStyle: "long" })}
                    </p>
                    {hasPassedStage("Oath Taking") && (
                      <div className="inline-block px-2 py-0.5 border border-green-600 text-green-600 font-bold text-[10px] uppercase tracking-wider rounded w-max bg-green-50">
                        PASSED
                      </div>
                    )}
                  </div>
                </div>
              )}

              {application?.evaluation_remarks &&
                application?.status === "Rejected" && (
                  <div className="flex flex-col gap-1 col-span-1 md:col-span-2 mt-2 p-4 bg-blue-50 border border-blue-100 rounded-lg">
                    <span className="text-[10px] uppercase font-bold text-blue-400 mb-1">
                      Evaluation Message / Remarks
                    </span>
                    <p className="text-blue-800 text-sm italic">
                      "{application.evaluation_remarks}"
                    </p>
                  </div>
                )}

              {application?.status === "Rejected" &&
                application?.rejection_reason && (
                  <div className="col-span-1 md:col-span-2 mt-2 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <HiOutlineXCircle className="text-red-600" size={20} />
                      <strong className="text-red-800 text-sm">
                        Application Update
                      </strong>
                    </div>
                    <p className="text-red-700 text-sm">
                      {application.rejection_reason}
                    </p>
                  </div>
                )}


            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TrackApplication;
