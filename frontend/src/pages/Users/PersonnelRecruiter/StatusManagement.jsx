import React from "react";
import { useState, useEffect } from "react";
import { api } from "../../../../api/api";
import MessageModal from "../../../Modals/MessageModal";
import { HiOutlineCheckCircle, HiOutlineXCircle } from "react-icons/hi";

function StatusManagement({
  applicantId,
  applicantData,
  currentStatus,
  onUpdate,
  currentRejectionReason,
}) {
  const [selectedStatus, setSelectedStatus] = useState(currentStatus);
  const [rejectionReason, setRejectionReason] = useState(
    currentRejectionReason || "",
  );
  const isInterviewer = sessionStorage.getItem("role") === "Interviewer";
  const [isUpdating, setIsUpdating] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    type: "success",
    message: "",
  });

  const [schDate, setSchDate] = useState(applicantData?.scheduled_date || "");
  const [schTime, setSchTime] = useState(applicantData?.scheduled_time || "");
  const [drugResult, setDrugResult] = useState(
    applicantData?.drug_test_result || "",
  );
  const [bmiHeight, setBmiHeight] = useState(applicantData?.bmi_height || "");
  const [bmiWeight, setBmiWeight] = useState(applicantData?.bmi_weight || "");
  const [patPushups, setPatPushups] = useState(applicantData?.pat_pushups || "");
  const [patPushupsPassed, setPatPushupsPassed] = useState(applicantData?.pat_pushups != null ? !!applicantData?.pat_pushups_passed : null);
  const [patSitups, setPatSitups] = useState(applicantData?.pat_situps || "");
  const [patSitupsPassed, setPatSitupsPassed] = useState(applicantData?.pat_situps != null ? !!applicantData?.pat_situps_passed : null);
  const [patRun, setPatRun] = useState(applicantData?.pat_run || "");
  const [patRunPassed, setPatRunPassed] = useState(applicantData?.pat_run != null ? !!applicantData?.pat_run_passed : null);
  const [psychologicalResult, setPsychologicalResult] = useState(
    applicantData?.psychological_result || "",
  );
  const [medicalResult, setMedicalResult] = useState(
    applicantData?.medical_result || "",
  );
  
  // Final Interview detailed fields
  const [fiVoice, setFiVoice] = useState(applicantData?.fi_voice_quality || "");
  const [fiComprehension, setFiComprehension] = useState(applicantData?.fi_comprehension || "");
  const [fiGesture, setFiGesture] = useState(applicantData?.fi_gesture || "");
  const [fiBearing, setFiBearing] = useState(applicantData?.fi_bearing || "");
  const [fiGeneralKnowledge, setFiGeneralKnowledge] = useState(applicantData?.fi_general_knowledge || "");
  const [fiEloquence, setFiEloquence] = useState(applicantData?.fi_eloquence || "");
  
  // No longer a raw state, it will be computed from the fields, but fallback to applicantData if fields are empty
  const [finalInterviewScore, setFinalInterviewScore] = useState(
    applicantData?.final_interview_score || "",
  );

  const isAccepted = currentStatus === "Accepted";

  useEffect(() => {
    // If current status is 'New Applicant', preselect based on AI screening result
    if (currentStatus === "New Applicant") {
      const remarks = applicantData?.evaluation_remarks || "";
      const rejReason =
        currentRejectionReason || applicantData?.rejection_reason || "";

      if (
        remarks.includes("AI Passed") ||
        remarks.includes("Initial screening passed")
      ) {
        setSelectedStatus("Qualified");
        setRejectionReason("");
      } else if (
        remarks.includes("Failed") ||
        rejReason.includes("Failed") ||
        remarks.includes("failed") ||
        rejReason.includes("failed")
      ) {
        setSelectedStatus("Failed");
        setRejectionReason(rejReason || remarks);
      } else {
        setSelectedStatus("Qualified");
        setRejectionReason(currentRejectionReason || "");
      }
    } else {
      setSelectedStatus(currentStatus);
      setRejectionReason(currentRejectionReason || "");
    }

    // Sync evaluation states if data refreshes
    if (applicantData) {
      setSchDate(applicantData.scheduled_date || "");
      setSchTime(applicantData.scheduled_time || "");
      setDrugResult(applicantData.drug_test_result || "");
      setBmiHeight(applicantData.bmi_height || "");
      setBmiWeight(applicantData.bmi_weight || "");
      setPatPushups(applicantData.pat_pushups || "");
      setPatPushupsPassed(applicantData.pat_pushups != null ? !!applicantData.pat_pushups_passed : null);
      setPatSitups(applicantData.pat_situps || "");
      setPatSitupsPassed(applicantData.pat_situps != null ? !!applicantData.pat_situps_passed : null);
      setPatRun(applicantData.pat_run || "");
      setPatRunPassed(applicantData.pat_run != null ? !!applicantData.pat_run_passed : null);
      setPsychologicalResult(applicantData.psychological_result || "");
      setMedicalResult(applicantData.medical_result || "");
      setFinalInterviewScore(applicantData.final_interview_score || "");
      setFiVoice(applicantData.fi_voice_quality ?? "");
      setFiComprehension(applicantData.fi_comprehension ?? "");
      setFiGesture(applicantData.fi_gesture ?? "");
      setFiBearing(applicantData.fi_bearing ?? "");
      setFiGeneralKnowledge(applicantData.fi_general_knowledge ?? "");
      setFiEloquence(applicantData.fi_eloquence ?? "");
    }
  }, [currentStatus, currentRejectionReason, applicantData]);

  const handleBmiBlur = () => {
    if (currentStatus === "Body Mass Index" && bmiHeight && bmiWeight) {
      const h = parseFloat(bmiHeight);
      const w = parseFloat(bmiWeight);
      if (h >= 100 && w >= 30) {
        const heightInM = h / 100;
        const bmi = w / (heightInM * heightInM);
        if (bmi >= 18.5 && bmi <= 25.0) {
          setRejectionReason("");
        } else {
          const category = bmi < 18.5 ? "Underweight" : "Overweight";
          setRejectionReason(
            `${category}. Calculated BMI is ${bmi.toFixed(1)} (Normal range: 18.5 - 25.0).`,
          );
        }
      }
    }
  };

  const handlePatPushupsBlur = () => {
    if (patPushups !== "") {
      const score = parseInt(patPushups, 10);
      if (!isNaN(score)) {
        setPatPushupsPassed(score >= 30);
      } else {
        setPatPushupsPassed(null);
      }
    } else {
      setPatPushupsPassed(null);
    }
  };

  const handlePatSitupsBlur = () => {
    if (patSitups !== "") {
      const score = parseInt(patSitups, 10);
      if (!isNaN(score)) {
        setPatSitupsPassed(score >= 30);
      } else {
        setPatSitupsPassed(null);
      }
    } else {
      setPatSitupsPassed(null);
    }
  };

  const handlePatRunBlur = () => {
    if (patRun !== "") {
      const parts = patRun.split(':');
      let totalSeconds = 0;
      if (parts.length === 2) {
        totalSeconds = parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
      } else {
        totalSeconds = parseFloat(patRun) * 60;
      }
      
      if (!isNaN(totalSeconds) && totalSeconds > 0) {
        setPatRunPassed(totalSeconds <= 900);
      } else {
        setPatRunPassed(null);
      }
    } else {
      setPatRunPassed(null);
    }
  };

  const getFiComputedScore = () => {
    if (fiVoice === "" && fiComprehension === "" && fiGesture === "" && fiBearing === "" && fiGeneralKnowledge === "" && fiEloquence === "") return finalInterviewScore;
    return (
      (parseFloat(fiVoice) || 0) +
      (parseFloat(fiComprehension) || 0) +
      (parseFloat(fiGesture) || 0) +
      (parseFloat(fiBearing) || 0) +
      (parseFloat(fiGeneralKnowledge) || 0) +
      (parseFloat(fiEloquence) || 0)
    );
  };

  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      // Get the current user from the token for audit logging
      const token = sessionStorage.getItem("token");
      let currentUser = "Unknown";
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split(".")[1]));
          currentUser = payload.username || "Unknown";
        } catch (e) {
          console.error("Token parse error:", e);
        }
      }

      let statusToSave = selectedStatus;
      let finalRejectionReason = rejectionReason;

      if (currentStatus === "New Applicant") {
        if (selectedStatus === "Qualified") {
          statusToSave = "Body Mass Index";
        } else {
          statusToSave = selectedStatus;
        }
      } else {
        const currentIndex = POST_ACCEPTANCE_STATUSES.indexOf(currentStatus);
        
        if (currentStatus === "Body Mass Index") {
          const bmiVal = getBmiValue();
          if (bmiVal !== null) {
            if (bmiVal >= 18.5 && bmiVal <= 25.0) {
              statusToSave = "Physical Agility Test";
              finalRejectionReason = "";
            } else {
              statusToSave = "Failed";
              const category = bmiVal < 18.5 ? "Underweight" : "Overweight";
              finalRejectionReason = `${category}. Calculated BMI is ${bmiVal.toFixed(1)} (Normal range: 18.5 - 25.0).`;
            }
          }
        } else if (currentStatus === "Physical Agility Test") {
          if (patPushupsPassed === false || patSitupsPassed === false || patRunPassed === false) {
            statusToSave = "Failed";
            const failedEvents = [];
            if (patPushupsPassed === false) failedEvents.push("Push-Ups");
            if (patSitupsPassed === false) failedEvents.push("Sit-Ups");
            if (patRunPassed === false) failedEvents.push("Run");
            finalRejectionReason = `Failed Physical Agility Test requirements in: ${failedEvents.join(", ")}.`;
          } else {
            statusToSave = "Neuro Examination";
          }
        } else if (currentStatus === "Drug Test") {
          if (drugResult === "Negative") {
            statusToSave = "Final Interview";
          } else if (drugResult === "Positive") {
            statusToSave = "Failed";
            finalRejectionReason = "Positive Drug Test result.";
          }
        } else if (currentStatus === "Final Interview") {
          const fiScore = getFiComputedScore();
          if (fiScore !== "" && fiScore !== null && fiScore >= 70) {
            statusToSave = "Oath Taking";
          } else {
            statusToSave = "Failed";
            finalRejectionReason = `Failed Final Interview with a score of ${fiScore !== "" && fiScore !== null ? parseFloat(fiScore).toFixed(2) : "0"}%.`;
          }
        } else if (currentIndex !== -1 && currentIndex < POST_ACCEPTANCE_STATUSES.length - 2) {
          // Advance to next status, assuming they pass (-2 skips Accepted and Failed)
          statusToSave = POST_ACCEPTANCE_STATUSES[currentIndex + 1];
        }
      }

      const dataToSend = {
        status: statusToSave,
        rejection_reason: statusToSave === "Failed" ? finalRejectionReason : null,
        performed_by: currentUser,
        drug_test_result: drugResult || null,
        bmi_height: bmiHeight === "" ? null : bmiHeight,
        bmi_weight: bmiWeight === "" ? null : bmiWeight,
        bmi_result:
          bmiHeight && bmiWeight
            ? (
                parseFloat(bmiWeight) /
                ((parseFloat(bmiHeight) / 100) * (parseFloat(bmiHeight) / 100))
              ).toFixed(1)
            : null,
        pat_pushups: patPushups === "" ? null : parseInt(patPushups),
        pat_pushups_passed: patPushupsPassed,
        pat_situps: patSitups === "" ? null : parseInt(patSitups),
        pat_situps_passed: patSitupsPassed,
        pat_run: patRun === "" ? null : patRun,
        pat_run_passed: patRunPassed,
        psychological_result: psychologicalResult || null,
        medical_result: medicalResult || null,
        fi_voice_quality: fiVoice === "" ? null : parseFloat(fiVoice),
        fi_comprehension: fiComprehension === "" ? null : parseFloat(fiComprehension),
        fi_gesture: fiGesture === "" ? null : parseFloat(fiGesture),
        fi_bearing: fiBearing === "" ? null : parseFloat(fiBearing),
        fi_general_knowledge: fiGeneralKnowledge === "" ? null : parseFloat(fiGeneralKnowledge),
        fi_eloquence: fiEloquence === "" ? null : parseFloat(fiEloquence),
        final_interview_score:
          getFiComputedScore() === "" ? null : getFiComputedScore(),
        // Schedule
        scheduled_date: (statusToSave !== currentStatus && statusToSave !== "Failed") ? null : (schDate || null),
        scheduled_time: (statusToSave !== currentStatus && statusToSave !== "Failed") ? null : (schTime || null),
        oath_taking_date:
          statusToSave === "Oath Taking"
            ? schDate || null
            : applicantData?.oath_taking_date || null,
        evaluation_remarks: finalRejectionReason || null,
      };

      await api.put(`users/update_status/${applicantId}/`, dataToSend);
      setModalConfig({
        isOpen: true,
        type: "success",
        message:
          "The applicant status and information have been updated successfully.",
      });
      onUpdate(statusToSave);
    } catch (err) {
      console.error("Update failed:", err);
      setModalConfig({
        isOpen: true,
        type: "error",
        message: "There was an error updating the status. Please try again.",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const INITIAL_STATUSES = ["New Applicant", "Qualified", "Failed"];

  const POST_ACCEPTANCE_STATUSES = [
    "Qualified",
    "Body Mass Index",
    "Physical Agility Test",
    "Neuro Examination",
    "Medical",
    "Drug Test",
    "Final Interview",
    "Oath Taking",
    "Accepted",
    "Failed",
  ];

  // If current status is 'Qualified' or any of the post-acceptance stages, show the second list
  const isPostAcceptance =
    currentStatus === "Qualified" ||
    currentStatus === "Accepted" ||
    POST_ACCEPTANCE_STATUSES.includes(currentStatus);
  const statusOptions = isPostAcceptance
    ? POST_ACCEPTANCE_STATUSES
    : INITIAL_STATUSES;

  const getBmiValue = () => {
    if (!bmiHeight || !bmiWeight) return null;
    const h = parseFloat(bmiHeight);
    const w = parseFloat(bmiWeight);
    if (h < 100 || w < 30) return null;
    const heightInM = h / 100;
    return w / (heightInM * heightInM);
  };
  const bmiVal = getBmiValue();
  const isBmiPassing = bmiVal !== null && bmiVal >= 18.5 && bmiVal <= 25.0;

  return (
    <div className="flex flex-col justify-evenly bg-[#F9FAFB] shadow-sm mt-5 rounded-[12px] status-management">
      <div>
        <h1 className="text-[24px] font-semibold">Update Status</h1>
        <p className="text-gray-500">
          Update the applicant's status.
          {applicantData?.status !== "New Applicant" && applicantData?.status_updated_at && (
            <span className="text-gray-400 text-sm ml-2 border-l pl-2">
              Last Updated: {new Date(applicantData.status_updated_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
            </span>
          )}
        </p>
      </div>
        <br />
      <div className="flex flex-col gap-4">
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase">
            Status
          </label>
          <select
            value={selectedStatus}
            disabled
            className="status-option mt-1 bg-gray-50 border border-gray-200 text-gray-500 cursor-not-allowed"
          >
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        {/* BMI Specific Options */}
        {selectedStatus === "Body Mass Index" && (
          <div className="pt-2 space-y-3">
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="text-xs font-bold text-gray-500 uppercase">
                  Height (cm)
                </label>
                <input
                  type="number"
                  value={bmiHeight}
                  onChange={(e) => setBmiHeight(e.target.value)}
                  onBlur={handleBmiBlur}
                  className={`w-full p-2 border border-gray-300 rounded mt-1 text-sm h-[38px] focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all ${(!schDate || !schTime) ? "bg-gray-100 cursor-not-allowed" : ""}`}
                  placeholder="cm"
                  disabled={!schDate || !schTime}
                />
              </div>
              <div className="flex-1">
                <label className="text-xs font-bold text-gray-500 uppercase">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  value={bmiWeight}
                  onChange={(e) => setBmiWeight(e.target.value)}
                  onBlur={handleBmiBlur}
                  className={`w-full p-2 border border-gray-300 rounded mt-1 text-sm h-[38px] focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all ${(!schDate || !schTime) ? "bg-gray-100 cursor-not-allowed" : ""}`}
                  placeholder="kg"
                  disabled={!schDate || !schTime}
                />
              </div>
              <div className="flex-1">
                <label className="text-xs font-bold text-gray-500 uppercase">
                  BMI (Calculated)
                </label>
                <input
                  type="text"
                  readOnly
                  value={bmiVal ? bmiVal.toFixed(1) : ""}
                  className={`w-full p-2 border rounded mt-1 text-sm h-[38px] font-semibold focus:outline-none transition-all duration-300 ${
                    bmiVal === null
                      ? "bg-gray-50 border-gray-200 text-gray-700"
                      : isBmiPassing
                        ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                        : "bg-rose-50 border-rose-300 text-rose-700"
                  }`}
                  placeholder="Result"
                />
              </div>
            </div>
            {bmiVal !== null && (
              <div className="flex justify-center mt-6">
                {isBmiPassing ? (
                  <div className="stamp-animation stamp-circle text-emerald-600 border-emerald-600 bg-emerald-50/40">
                    <div className="stars">★★★</div>
                    <div className="stamp-text">PASSED</div>
                    <div className="stamp-subtext">BMI</div>
                    <div className="stars">★★★</div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="stamp-animation stamp-circle text-rose-600 border-rose-600 bg-rose-50/40">
                      <div className="stars">★★★</div>
                      <div className="stamp-text">FAILED</div>
                      <div className="stamp-subtext">{bmiVal < 18.5 ? "UNDERWEIGHT" : "OVERWEIGHT"}</div>
                      <div className="stars">★★★</div>
                    </div>
                    <div className="mt-3 text-center max-w-[280px]">
                      <p className="text-xs font-semibold text-rose-600 bg-rose-50 px-3 py-2 rounded border border-rose-100 shadow-sm">
                        {rejectionReason || `${bmiVal < 18.5 ? "Underweight" : "Overweight"}. Calculated BMI is ${bmiVal.toFixed(1)} (Normal range: 18.5 - 25.0).`}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* PAT Specific Options */}
        {selectedStatus === "Physical Agility Test" && (
          <div className="pt-2">
            <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">
              PAT Detailed Scores
            </label>
            {(!schDate || !schTime) && (
              <div className="mb-3 text-xs font-semibold text-rose-500 bg-rose-50 p-2 rounded border border-rose-200">
                Please set a schedule date and time first before evaluating the applicant.
              </div>
            )}
            <div className="border border-gray-200 rounded-lg overflow-hidden text-sm">
              <div className="grid grid-cols-[3fr_2fr_3fr] gap-4 bg-gray-50 p-3 font-semibold text-gray-600 border-b border-gray-200">
                <div>Event</div>
                <div>Raw Score</div>
                <div className="text-center">Remarks</div>
              </div>
              
              {/* Push UPS */}
              <div className="grid grid-cols-[3fr_2fr_3fr] gap-4 p-3 items-center border-b border-gray-100">
                <div className="font-semibold text-gray-800">1-Minute Push UPS</div>
                <div>
                  <input
                    type="number"
                    value={patPushups}
                    onChange={(e) => {
                      setPatPushups(e.target.value);
                      setPatPushupsPassed(null);
                    }}
                    onBlur={handlePatPushupsBlur}
                    className={`w-full p-2 border border-gray-300 rounded text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all ${(!schDate || !schTime) ? "bg-gray-100 cursor-not-allowed" : ""}`}
                    placeholder="Number"
                    disabled={!schDate || !schTime}
                  />
                </div>
                <div className="flex justify-center">
                  {patPushupsPassed === null ? (
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-400">PASSED/FAILED</span>
                  ) : (
                    <span className={`text-xs font-bold uppercase tracking-wider ${patPushupsPassed ? "text-green-600" : "text-red-500"}`}>
                      {patPushupsPassed ? "PASSED" : "FAILED"}
                    </span>
                  )}
                </div>
              </div>

              {/* Sit-On */}
              <div className="grid grid-cols-[3fr_2fr_3fr] gap-4 p-3 items-center border-b border-gray-100">
                <div className="font-semibold text-gray-800">1-Minute Sit-Ups</div>
                <div>
                  <input
                    type="number"
                    value={patSitups}
                    onChange={(e) => {
                      setPatSitups(e.target.value);
                      setPatSitupsPassed(null);
                    }}
                    onBlur={handlePatSitupsBlur}
                    className={`w-full p-2 border border-gray-300 rounded text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all ${(!schDate || !schTime) ? "bg-gray-100 cursor-not-allowed" : ""}`}
                    placeholder="Number"
                    disabled={!schDate || !schTime}
                  />
                </div>
                <div className="flex justify-center">
                  {patSitupsPassed === null ? (
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-400">PASSED/FAILED</span>
                  ) : (
                    <span className={`text-xs font-bold uppercase tracking-wider ${patSitupsPassed ? "text-green-600" : "text-red-500"}`}>
                      {patSitupsPassed ? "PASSED" : "FAILED"}
                    </span>
                  )}
                </div>
              </div>

              {/* Run */}
              <div className="grid grid-cols-[3fr_2fr_3fr] gap-4 p-3 items-center">
                <div className="font-semibold text-gray-800">3 Kilometer Run</div>
                <div>
                  <input
                    type="text"
                    value={patRun}
                    onChange={(e) => {
                      setPatRun(e.target.value);
                      setPatRunPassed(null);
                    }}
                    onBlur={handlePatRunBlur}
                    className={`w-full p-2 border border-gray-300 rounded text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all ${(!schDate || !schTime) ? "bg-gray-100 cursor-not-allowed" : ""}`}
                    placeholder="Time (e.g. 15:30)"
                    disabled={!schDate || !schTime}
                  />
                </div>
                <div className="flex justify-center">
                  {patRunPassed === null ? (
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-400">PASSED/FAILED</span>
                  ) : (
                    <span className={`text-xs font-bold uppercase tracking-wider ${patRunPassed ? "text-green-600" : "text-red-500"}`}>
                      {patRunPassed ? "PASSED" : "FAILED"}
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            {(patPushupsPassed !== null && patSitupsPassed !== null && patRunPassed !== null) && (
              <div className="flex justify-center mt-8 mb-4">
                {(patPushupsPassed && patSitupsPassed && patRunPassed) ? (
                  <div className="stamp-animation stamp-circle text-emerald-600 border-emerald-600 bg-emerald-50/40">
                    <div className="stars">★★★</div>
                    <div className="stamp-text">PASSED</div>
                    <div className="stamp-subtext">PAT EXAM</div>
                    <div className="stars">★★★</div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="stamp-animation stamp-circle text-rose-600 border-rose-600 bg-rose-50/40" style={{ width: '150px', height: '150px' }}>
                      <div className="stars">★★★</div>
                      <div className="stamp-text">FAILED</div>
                      <div className="stamp-subtext text-center w-[120px] leading-tight mt-1">
                        {[
                          patPushupsPassed === false ? "PUSH-UPS" : null,
                          patSitupsPassed === false ? "SIT-UPS" : null,
                          patRunPassed === false ? "RUN" : null
                        ].filter(Boolean).join(", ")}
                      </div>
                      <div className="stars">★★★</div>
                    </div>
                    <div className="mt-3 text-center max-w-[280px]">
                      <p className="text-xs font-semibold text-rose-600 bg-rose-50 px-3 py-2 rounded border border-rose-100 shadow-sm">
                        Failed Physical Agility Test requirements in: {[
                          patPushupsPassed === false ? "Push-Ups" : null,
                          patSitupsPassed === false ? "Sit-Ups" : null,
                          patRunPassed === false ? "Run" : null
                        ].filter(Boolean).join(", ")}.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Neuro Examination Specific Option */}
        {selectedStatus === "Neuro Examination" && (
          <div className="pt-2">
            <label className="text-xs font-bold text-gray-500 uppercase">
              Neuro/Psychological Findings
            </label>
            <textarea
              value={psychologicalResult}
              onChange={(e) => setPsychologicalResult(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded mt-1 text-sm min-h-[80px] focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
              placeholder="Enter psychological examination results..."
            />
          </div>
        )}

        {/* Medical Specific Option */}
        {selectedStatus === "Medical" && (
          <div className="pt-2">
            <label className="text-xs font-bold text-gray-500 uppercase">
              Medical Examination Findings
            </label>
            <textarea
              value={medicalResult}
              onChange={(e) => setMedicalResult(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded mt-1 text-sm min-h-[80px] focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
              placeholder="Enter medical examination findings..."
            />
          </div>
        )}

        {/* Final Interview Specific Option */}
        {selectedStatus === "Final Interview" && (
          <div className="pt-2">
            <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">
              Final Interview Scoring Sheet
            </label>
            {!isInterviewer && (
              <div className="mb-3 text-xs font-semibold text-rose-500 bg-rose-50 p-2 rounded border border-rose-200">
                Only Interviewers can evaluate and input scores for the Final Interview.
              </div>
            )}
            <div className="border border-gray-200 rounded-lg p-5 text-sm bg-white shadow-sm">
              {/* Communication Skills */}
              <div className="mb-6">
                <h4 className="text-sm font-bold text-[#2C2D86] mb-3 border-b border-gray-100 pb-2">I. COMMUNICATION SKILLS (30%)</h4>
                <div className="grid grid-cols-3 gap-6">
                  <div>
                    <label className="text-xs text-gray-600 font-semibold uppercase">a. Voice Quality (10%)</label>
                    <input type="number" min="0" max="10" step="0.1" value={fiVoice} onChange={(e) => setFiVoice(e.target.value)} disabled={!isInterviewer} className={`w-full p-2.5 border border-gray-300 rounded-md mt-1.5 text-sm outline-none focus:border-[#2C2D86] focus:ring-1 focus:ring-[#2C2D86] transition-all bg-gray-50 ${!isInterviewer ? "cursor-not-allowed opacity-70" : ""}`} placeholder="Score /10" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 font-semibold uppercase">b. Comprehension (10%)</label>
                    <input type="number" min="0" max="10" step="0.1" value={fiComprehension} onChange={(e) => setFiComprehension(e.target.value)} disabled={!isInterviewer} className={`w-full p-2.5 border border-gray-300 rounded-md mt-1.5 text-sm outline-none focus:border-[#2C2D86] focus:ring-1 focus:ring-[#2C2D86] transition-all bg-gray-50 ${!isInterviewer ? "cursor-not-allowed opacity-70" : ""}`} placeholder="Score /10" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 font-semibold uppercase">c. Gesture (10%)</label>
                    <input type="number" min="0" max="10" step="0.1" value={fiGesture} onChange={(e) => setFiGesture(e.target.value)} disabled={!isInterviewer} className={`w-full p-2.5 border border-gray-300 rounded-md mt-1.5 text-sm outline-none focus:border-[#2C2D86] focus:ring-1 focus:ring-[#2C2D86] transition-all bg-gray-50 ${!isInterviewer ? "cursor-not-allowed opacity-70" : ""}`} placeholder="Score /10" />
                  </div>
                </div>
              </div>

              {/* Other Categories */}
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <h4 className="text-sm font-bold text-[#2C2D86] mb-3 border-b border-gray-100 pb-2">II. BEARING (20%)</h4>
                  <input type="number" min="0" max="20" step="0.1" value={fiBearing} onChange={(e) => setFiBearing(e.target.value)} disabled={!isInterviewer} className={`w-full p-2.5 border border-gray-300 rounded-md text-sm outline-none focus:border-[#2C2D86] focus:ring-1 focus:ring-[#2C2D86] transition-all bg-gray-50 ${!isInterviewer ? "cursor-not-allowed opacity-70" : ""}`} placeholder="Score /20" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#2C2D86] mb-3 border-b border-gray-100 pb-2">III. KNOWLEDGE (25%)</h4>
                  <input type="number" min="0" max="25" step="0.1" value={fiGeneralKnowledge} onChange={(e) => setFiGeneralKnowledge(e.target.value)} disabled={!isInterviewer} className={`w-full p-2.5 border border-gray-300 rounded-md text-sm outline-none focus:border-[#2C2D86] focus:ring-1 focus:ring-[#2C2D86] transition-all bg-gray-50 ${!isInterviewer ? "cursor-not-allowed opacity-70" : ""}`} placeholder="Score /25" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#2C2D86] mb-3 border-b border-gray-100 pb-2">IV. ELOQUENCE (25%)</h4>
                  <input type="number" min="0" max="25" step="0.1" value={fiEloquence} onChange={(e) => setFiEloquence(e.target.value)} disabled={!isInterviewer} className={`w-full p-2.5 border border-gray-300 rounded-md text-sm outline-none focus:border-[#2C2D86] focus:ring-1 focus:ring-[#2C2D86] transition-all bg-gray-50 ${!isInterviewer ? "cursor-not-allowed opacity-70" : ""}`} placeholder="Score /25" />
                </div>
              </div>

              {/* Total Score */}
              <div className="sticky bottom-0 mt-6 border-t-2 border-gray-200 flex justify-between items-center bg-white p-4 rounded-b-lg shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.05)] z-10">
                <span className="text-base font-bold text-gray-800 uppercase tracking-wider">Total Score (100%):</span>
                <span className={`text-2xl font-black ${getFiComputedScore() >= 70 ? "text-emerald-600" : "text-rose-600"}`}>
                  {getFiComputedScore() !== "" && getFiComputedScore() !== null ? parseFloat(getFiComputedScore()).toFixed(2) : "0.00"}%
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Drug Test Specific Option */}
        {selectedStatus === "Drug Test" && (
          <div className="pt-2">
            <label className="text-xs font-bold text-gray-500 uppercase">
              Drug Test Result
            </label>
            <select
              value={drugResult}
              onChange={(e) => setDrugResult(e.target.value)}
              className="status-option mt-1"
            >
              <option value="">Select Result</option>
              <option value="Negative">Negative</option>
              <option value="Positive">Positive</option>
            </select>
          </div>
        )}
      </div>

      {selectedStatus === "Failed" && (
        <div className="mt-4">
          <label className="text-xs font-bold text-gray-500 uppercase">
            Reason for Rejection
          </label>
          <textarea
            className="w-full p-2 border border-gray-300 rounded mt-1 text-sm min-h-[80px] focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
            placeholder="Enter specific reason for rejection..."
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
          />
        </div>
      )}
      <button
        onClick={handleUpdate}
        disabled={
          isUpdating || 
          currentStatus === "Failed" ||
          (selectedStatus === "Body Mass Index" && (!bmiHeight || !bmiWeight)) ||
          (selectedStatus === "Physical Agility Test" && (patPushups === "" || patSitups === "" || patRun === "")) ||
          (selectedStatus === "Final Interview" && (fiVoice === "" || fiComprehension === "" || fiGesture === "" || fiBearing === "" || fiGeneralKnowledge === "" || fiEloquence === ""))
        }
        className={`rounded-[4px] text-white font-semibold save-changes-btn mt-6 h-11 transition-all ${
          isUpdating || 
          currentStatus === "Failed" ||
          (selectedStatus === "Body Mass Index" && (!bmiHeight || !bmiWeight)) ||
          (selectedStatus === "Physical Agility Test" && (patPushups === "" || patSitups === "" || patRun === "")) ||
          (selectedStatus === "Final Interview" && (fiVoice === "" || fiComprehension === "" || fiGesture === "" || fiBearing === "" || fiGeneralKnowledge === "" || fiEloquence === ""))
            ? "bg-gray-400 cursor-not-allowed"
            : "cursor-pointer bg-[#2C2D86] hover:bg-[#1e1f5e] shadow-md hover:shadow-lg active:scale-[0.98]"
        }`}
      >
        {isUpdating ? "Proceeding..." : "Proceed to Next Level"}
      </button>

      <MessageModal
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
        type={modalConfig.type}
        title={
          modalConfig.type === "success" ? "Update Successful" : "Update Failed"
        }
        message={modalConfig.message}
      />
    </div>
  );
}

export default StatusManagement;
