import React, { useState, useEffect, useMemo } from "react";
import { api } from "../../../../api/api";
import CriteriaForm from "../../Form/CriteriaForm";
import {
  FiUsers,
  FiCheckCircle,
  FiClock,
  FiArrowRightCircle,
  FiX,
  FiRefreshCw,
  FiCalendar,
} from "react-icons/fi";

function InterviewDashboard() {
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [activeTab, setActiveTab] = useState("today"); // "today" | "upcoming" | "all"

  const [scores, setScores] = useState({
    fiPatriotism: "",
    fiIntegrity: "",
    fiAwareness: "",
    fiCommunication: "",
  });

  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    type: "success",
    message: "",
  });
  const closeModal = () => setModalConfig((prev) => ({ ...prev, isOpen: false }));

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const targetDate = new Date(dateStr);
    if (isNaN(targetDate.getTime())) return dateStr;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dateCopy = new Date(targetDate);
    dateCopy.setHours(0, 0, 0, 0);

    const diffTime = dateCopy - today;
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    const formatted = targetDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    if (diffDays === 0) return `Today (${formatted})`;
    if (diffDays === 1) return `Tomorrow (${formatted})`;
    if (diffDays === -1) return `Yesterday (${formatted})`;

    return formatted;
  };

  const formatTime = (timeStr) => {
    if (!timeStr || timeStr === "TBA") return "TBA";

    if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(timeStr)) {
      const parts = timeStr.split(":");
      let hour = parseInt(parts[0], 10);
      const ampm = hour >= 12 ? "PM" : "AM";
      hour = hour % 12;
      hour = hour ? hour : 12;
      return `${hour}:${parts[1]} ${ampm}`;
    }

    const date = new Date(timeStr);
    if (!isNaN(date.getTime())) {
      return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    }
    return timeStr;
  };

  const isToday = (dateStr) => {
    if (!dateStr) return false;
    const targetDate = new Date(dateStr);
    if (isNaN(targetDate.getTime())) return false;
    const today = new Date();
    return targetDate.setHours(0, 0, 0, 0) === today.setHours(0, 0, 0, 0);
  };

  const isFuture = (dateStr) => {
    if (!dateStr) return false;
    const targetDate = new Date(dateStr);
    if (isNaN(targetDate.getTime())) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return targetDate.setHours(0, 0, 0, 0) > today.getTime();
  };

  const fetchApplicants = async () => {
    setLoading(true);
    try {
      const response = await api.get("/users/applicants/active/");
      const data = response.data;

      const isScheduleReached = (dateStr, timeStr) => {
        if (!dateStr || !timeStr || timeStr === "TBA") return true;
        const scheduleDate = new Date(`${dateStr}T${timeStr}`);
        if (isNaN(scheduleDate.getTime())) return true;
        return new Date() >= scheduleDate;
      };

      const formattedApplicants = data
        .filter((app) => app.status === "Final Interview")
        .map((app) => {
          const isEvaluated = app.final_interview_score != null;
          return {
            ...app,
            trackingId: app.tracking_code || `APP-${app.id}`,
            name: `${app.last_name || ""}, ${app.first_name || ""} ${app.middle_name ? app.middle_name.charAt(0) + "." : ""}`.trim(),
            time: app.scheduled_time || "TBA",
            date: app.scheduled_date || "",
            displayStatus: isEvaluated ? "Evaluated" : "Waiting",
            isReady: isScheduleReached(app.scheduled_date, app.scheduled_time),
          };
        });
      setApplicants(formattedApplicants);
    } catch (error) {
      console.error("Error fetching applicants:", error);
      setModalConfig({
        isOpen: true,
        type: "error",
        message: "Failed to load applicants. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplicants();
  }, []);

  const handleStartInterview = (applicant) => {
    setSelectedApplicant(applicant);
    setScores({
      fiPatriotism: applicant.fi_patriotism || "",
      fiIntegrity: applicant.fi_integrity || "",
      fiAwareness: applicant.fi_awareness || "",
      fiCommunication: applicant.fi_communication || "",
    });
  };

  const handleScoreChange = (key, val) => {
    setScores((prev) => ({ ...prev, [key]: val }));
  };

  const getFiComputedScore = () => {
    const { fiPatriotism, fiIntegrity, fiAwareness, fiCommunication } = scores;
    if (
      fiPatriotism === "" &&
      fiIntegrity === "" &&
      fiAwareness === "" &&
      fiCommunication === ""
    ) {
      return "";
    }
    const total =
      (parseFloat(fiPatriotism) || 0) +
      (parseFloat(fiIntegrity) || 0) +
      (parseFloat(fiAwareness) || 0) +
      (parseFloat(fiCommunication) || 0);
    return Math.min(total, 100);
  };

  const isFormValid =
    scores.fiPatriotism !== "" &&
    scores.fiIntegrity !== "" &&
    scores.fiAwareness !== "" &&
    scores.fiCommunication !== "";

  const handleSubmitEvaluation = async () => {
    const score = getFiComputedScore();
    if (!isFormValid) {
      alert("Please fill in all criteria scores.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        fi_patriotism: scores.fiPatriotism,
        fi_integrity: scores.fiIntegrity,
        fi_awareness: scores.fiAwareness,
        fi_communication: scores.fiCommunication,
        final_interview_score: score,
      };

      await api.put(`/users/update_status/${selectedApplicant.id}/`, payload);

      setApplicants((prev) =>
        prev.map((app) =>
          app.id === selectedApplicant.id
            ? {
                ...app,
                displayStatus: "Evaluated",
                fi_patriotism: scores.fiPatriotism,
                fi_integrity: scores.fiIntegrity,
                fi_awareness: scores.fiAwareness,
                fi_communication: scores.fiCommunication,
                final_interview_score: score,
              }
            : app,
        ),
      );

      setSelectedApplicant(null);
      setModalConfig({
        isOpen: true,
        type: "success",
        message: `Evaluation submitted successfully! Total Score: ${score}%`,
      });
    } catch (error) {
      console.error("Error submitting evaluation:", error);
      setModalConfig({
        isOpen: true,
        type: "error",
        message: "Failed to submit evaluation. Please check your connection.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const todayApplicants = useMemo(() => applicants.filter((a) => isToday(a.date)), [applicants]);
  const upcomingApplicants = useMemo(() => applicants.filter((a) => isFuture(a.date)), [applicants]);

  const totalToday = todayApplicants.length;
  const completedCount = applicants.filter((a) => a.displayStatus === "Evaluated").length;
  const waitingCount = applicants.filter((a) => a.displayStatus === "Waiting").length;
  const nextUp = applicants.find((a) => a.displayStatus === "Waiting");

  const filteredQueue = useMemo(() => {
    if (activeTab === "today") return todayApplicants;
    if (activeTab === "upcoming") return upcomingApplicants;
    return applicants;
  }, [activeTab, todayApplicants, upcomingApplicants, applicants]);

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-200">
        <div>
          <h1 className="text-2xl font-bold text-[#2C2D86] tracking-tight">
            Interviewer Dashboard
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage, evaluate, and track scheduled applicant interviews.
          </p>
        </div>
        <button
          onClick={fetchApplicants}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-[#2C2D86] bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors disabled:opacity-50 self-start sm:self-auto border border-blue-100 shadow-sm"
        >
          <FiRefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col justify-center items-center py-28 bg-white rounded-xl border border-gray-200">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-200 border-t-[#2C2D86]"></div>
          <p className="text-gray-500 mt-4 text-sm font-medium">Loading applicant queue...</p>
        </div>
      ) : (
        <>
          {/* Summary Stat Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between hover:border-gray-300 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Today's Schedule
                </span>
                <span className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <FiCalendar className="w-5 h-5" />
                </span>
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-3">{totalToday}</p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between hover:border-gray-300 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Completed
                </span>
                <span className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                  <FiCheckCircle className="w-5 h-5" />
                </span>
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-3">{completedCount}</p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between hover:border-gray-300 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Waiting
                </span>
                <span className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                  <FiClock className="w-5 h-5" />
                </span>
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-3">{waitingCount}</p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between hover:border-gray-300 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Next Up
                </span>
                <span className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                  <FiArrowRightCircle className="w-5 h-5" />
                </span>
              </div>
              <div className="mt-2 min-w-0">
                <p className="text-sm font-bold text-[#2C2D86] truncate" title={nextUp?.name || "None"}>
                  {nextUp ? nextUp.name : "None"}
                </p>
                <p className="text-xs text-gray-500 mt-0.5 truncate">
                  {nextUp ? `${formatDate(nextUp.date)} • ${formatTime(nextUp.time)}` : "Queue is clear"}
                </p>
              </div>
            </div>
          </div>

          {/* Main Working Area */}
          <div className="flex flex-col lg:flex-row gap-6 items-start">
            {/* List Column */}
            <div className={`transition-all duration-500 ease-in-out shrink-0 w-full ${selectedApplicant ? "lg:w-[calc(50%-12px)]" : "lg:w-full"}`}>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {/* List Header with Tabs */}
                <div className="px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gray-50/50">
                  <div>
                    <h2 className="text-base font-bold text-gray-900">
                      Interview Schedule
                    </h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {new Date().toLocaleDateString("en-US", {
                        weekday: "long",
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>

                  {/* Filter Tabs */}
                  <div className="flex items-center p-1 bg-gray-100 rounded-lg self-start sm:self-auto border border-gray-200">
                    <button
                      onClick={() => setActiveTab("today")}
                      className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                        activeTab === "today"
                          ? "bg-white text-gray-900 shadow-sm"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      Today ({totalToday})
                    </button>
                    <button
                      onClick={() => setActiveTab("upcoming")}
                      className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                        activeTab === "upcoming"
                          ? "bg-white text-gray-900 shadow-sm"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      Upcoming ({upcomingApplicants.length})
                    </button>
                    <button
                      onClick={() => setActiveTab("all")}
                      className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                        activeTab === "all"
                          ? "bg-white text-gray-900 shadow-sm"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      All ({applicants.length})
                    </button>
                  </div>
                </div>

                {/* List Items */}
                <div className="divide-y divide-gray-100">
                  {filteredQueue.length === 0 ? (
                    <div className="p-12 text-center">
                      <FiUsers className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm font-medium text-gray-600">No applicants found in this view.</p>
                      <p className="text-xs text-gray-400 mt-0.5">Scheduled candidates will appear here.</p>
                    </div>
                  ) : (
                    filteredQueue.map((app) => {
                      const isSelected = selectedApplicant?.id === app.id;
                      return (
                        <div
                          key={app.id}
                          className={`px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
                            isSelected ? "bg-blue-50/60 border-l-4 border-[#2C2D86]" : "hover:bg-gray-50/80"
                          }`}
                        >
                          <div className="flex items-center gap-4 min-w-0">
                            <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-sm shrink-0 border border-slate-200">
                              {app.name ? app.name.charAt(0) : "?"}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-gray-900 truncate">
                                {app.name || "Unknown Applicant"}
                              </p>
                              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-gray-500 mt-0.5">
                                <span className="font-mono text-gray-600">{app.trackingId}</span>
                                <span className="text-gray-300">•</span>
                                <span>{formatDate(app.date)}</span>
                                <span className="text-gray-300">•</span>
                                <span>{formatTime(app.time)}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                            {app.displayStatus === "Evaluated" ? (
                              <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                                Evaluated
                              </span>
                            ) : isSelected ? (
                              <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-700 animate-pulse border border-blue-200">
                                Evaluating...
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                                Waiting
                              </span>
                            )}

                            <button
                              onClick={() => handleStartInterview(app)}
                              disabled={!app.isReady && app.displayStatus !== "Evaluated"}
                              className={`min-w-[100px] px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 active:scale-95 border text-center ${
                                app.displayStatus === "Evaluated"
                                  ? "text-[#2C2D86] border-[#2C2D86] hover:bg-blue-50"
                                  : !app.isReady
                                    ? "bg-amber-50 text-amber-700 border-amber-200 cursor-not-allowed active:scale-100"
                                    : "bg-[#2C2D86] text-white border-transparent hover:bg-[#202165] shadow-sm"
                              }`}
                            >
                              {app.displayStatus === "Evaluated"
                                ? "Review"
                                : !app.isReady
                                  ? "Not Yet Time"
                                  : "Start"}
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Evaluation Form Drawer Column with Smooth Animation */}
            <div
              className={`transition-all duration-500 ease-in-out overflow-hidden shrink-0 ${
                selectedApplicant
                  ? "w-full lg:w-[calc(50%-12px)] opacity-100 max-h-[2000px]"
                  : "w-0 opacity-0 max-h-0 lg:max-h-[2000px]"
              }`}
            >
              {selectedApplicant && (
                <div className="w-full bg-white rounded-xl shadow-lg border border-gray-200 flex flex-col">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50 flex justify-between items-center">
                  <div className="min-w-0">
                    <h3 className="text-base font-bold text-[#2C2D86] truncate">
                      Evaluation: {selectedApplicant.name}
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5 truncate">
                      {selectedApplicant.trackingId} • {formatDate(selectedApplicant.date)} at {formatTime(selectedApplicant.time)}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedApplicant(null)}
                    className="text-gray-400 hover:text-gray-600 bg-white hover:bg-gray-100 p-1.5 rounded-lg border border-gray-200 transition-colors ml-3 shrink-0"
                  >
                    <FiX className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-6 max-h-[60vh] overflow-y-auto">
                  <CriteriaForm
                    values={scores}
                    onChange={handleScoreChange}
                    isInterviewer={true}
                    totalScore={getFiComputedScore()}
                    disabled={selectedApplicant.displayStatus === "Evaluated"}
                  />
                </div>

                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50/50 flex justify-end gap-3 shrink-0">
                  <button
                    onClick={() => setSelectedApplicant(null)}
                    disabled={submitting}
                    className="px-4 py-2 border border-gray-300 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitEvaluation}
                    disabled={
                      submitting ||
                      !isFormValid ||
                      selectedApplicant.displayStatus === "Evaluated"
                    }
                    className={`flex items-center gap-2 px-5 py-2 text-xs font-bold rounded-lg transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed ${
                      selectedApplicant.displayStatus === "Evaluated"
                        ? "bg-gray-400 text-white"
                        : "bg-[#2C2D86] text-white hover:bg-[#202165]"
                    }`}
                  >
                    {submitting && (
                      <span className="animate-spin h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full"></span>
                    )}
                    {selectedApplicant.displayStatus === "Evaluated"
                      ? "Already Evaluated"
                      : "Submit Evaluation"}
                  </button>
                </div>
              </div>
            )}
            </div>
          </div>
        </>
      )}

      {/* Confirmation Modal with Entry Animations */}
      {modalConfig.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-xl border border-gray-200 p-6 max-w-sm w-full flex flex-col items-center animate-in zoom-in-95 duration-200">
            {modalConfig.type === "success" ? (
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mb-3">
                <FiCheckCircle className="w-6 h-6" />
              </div>
            ) : (
              <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center text-rose-600 mb-3">
                <FiX className="w-6 h-6" />
              </div>
            )}
            <h3 className="text-base font-bold text-gray-900 mb-1">
              {modalConfig.type === "success" ? "Success" : "Notice"}
            </h3>
            <p className="text-gray-600 text-xs text-center mb-5">
              {modalConfig.message}
            </p>
            <button
              onClick={closeModal}
              className={`w-full py-2 rounded-lg text-xs font-bold text-white transition-colors ${
                modalConfig.type === "success"
                  ? "bg-emerald-600 hover:bg-emerald-700"
                  : "bg-rose-600 hover:bg-rose-700"
              }`}
            >
              Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default InterviewDashboard;