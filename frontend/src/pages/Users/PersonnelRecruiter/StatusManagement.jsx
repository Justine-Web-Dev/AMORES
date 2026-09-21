import React from "react";
import { useState, useEffect } from "react";
import { api } from "../../../../api/api";
import MessageModal from "../../../Modals/MessageModal";
import { HiOutlineCheckCircle, HiOutlineXCircle } from "react-icons/hi";
import CriteriaForm from "../../Form/CriteriaForm";
import BmiForm from "../../Form/BmiForm";
import PatForm from "../../Form/PatForm";

const formatRejectionReason = (reason) => {
  if (!reason) return "";
  if (
    reason.startsWith("Automated Screening Failed:") &&
    reason.includes(";")
  ) {
    const prefix = "Automated Screening Failed:\n";
    let rest = reason.substring(27).trim();
    if (rest.startsWith("Automated Screening Failed:")) {
      rest = reason;
    }
    const list = rest
      .split(";")
      .map((item) => {
        let cleanItem = item.trim();
        // Make document names cleaner (e.g. PROS__CLEARANCE -> PROS CLEARANCE)
        cleanItem = cleanItem.replace(/__/g, " ");
        // Remove repetitive 'AI verification failed:' text
        cleanItem = cleanItem.replace(/AI verification failed:\s*/g, "");
        return "• " + cleanItem;
      })
      .join("\n");
    return prefix + list;
  }
  return reason;
};

function StatusManagement({
  applicantId,
  applicantData,
  currentStatus,
  onUpdate,
  currentRejectionReason,
}) {
  const [selectedStatus, setSelectedStatus] = useState(currentStatus);
  const [rejectionReason, setRejectionReason] = useState(
    formatRejectionReason(currentRejectionReason) || "",
  );
  const isInterviewer =
    sessionStorage.getItem("role") ===
    "Recruitment Screening Committee (Interviewer)";
  const [isUpdating, setIsUpdating] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    type: "success",
    message: "",
  });

  const [draftData] = useState(() => {
    if (!applicantId) return null;
    try {
      const str = sessionStorage.getItem(`eval_draft_${applicantId}`);
      return str ? JSON.parse(str) : null;
    } catch(e) { return null; }
  });

  const [schDate, setSchDate] = useState(draftData?.schDate ?? applicantData?.scheduled_date ?? "");
  const [schTime, setSchTime] = useState(draftData?.schTime ?? applicantData?.scheduled_time ?? "");
  const [bmiHeight, setBmiHeight] = useState(draftData?.bmiHeight ?? applicantData?.bmi_height ?? "");
  const [bmiWeight, setBmiWeight] = useState(draftData?.bmiWeight ?? applicantData?.bmi_weight ?? "");
  const [patPushups, setPatPushups] = useState(draftData?.patPushups ?? applicantData?.pat_pushups ?? "");
  const [patPushupsPassed, setPatPushupsPassed] = useState(draftData?.patPushupsPassed ?? (applicantData?.pat_pushups != null ? !!applicantData?.pat_pushups_passed : null));
  const [patSitups, setPatSitups] = useState(draftData?.patSitups ?? applicantData?.pat_situps ?? "");
  const [patSitupsPassed, setPatSitupsPassed] = useState(draftData?.patSitupsPassed ?? (applicantData?.pat_situps != null ? !!applicantData?.pat_situps_passed : null));
  const [patRun, setPatRun] = useState(draftData?.patRun ?? applicantData?.pat_run ?? "");
  const [patRunPassed, setPatRunPassed] = useState(draftData?.patRunPassed ?? (applicantData?.pat_run != null ? !!applicantData?.pat_run_passed : null));
  const [psychologicalResult, setPsychologicalResult] = useState(draftData?.psychologicalResult ?? applicantData?.psychological_result ?? "");
  const [medicalResult, setMedicalResult] = useState(draftData?.medicalResult ?? applicantData?.medical_result ?? "");
  const [drugResult, setDrugResult] = useState(draftData?.drugResult ?? applicantData?.drug_test_result ?? "");

  const [criteriaList, setCriteriaList] = useState([]);
  const [scores, setScores] = useState(() => {
    if (draftData?.scores) return draftData.scores;
    const initScores = {};
    if (applicantData?.criteria_scores) {
      applicantData.criteria_scores.forEach(s => {
        initScores[s.criterion] = s.score;
      });
    }
    return initScores;
  });

  useEffect(() => {
    api.get("/users/evaluation-criteria/")
      .then(res => setCriteriaList(res.data))
      .catch(err => console.error("Failed to fetch criteria", err));
  }, []);

  const [finalInterviewScore, setFinalInterviewScore] = useState(
    draftData?.finalInterviewScore ?? applicantData?.evaluation_final_interview ?? ""
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
        setRejectionReason(formatRejectionReason(rejReason || remarks));
      } else {
        setSelectedStatus("Qualified");
        setRejectionReason(formatRejectionReason(currentRejectionReason || ""));
      }
    } else {
      setSelectedStatus(currentStatus);
      setRejectionReason(formatRejectionReason(currentRejectionReason || ""));
    }

    // Sync evaluation states if data refreshes
    if (applicantData) {
      const draftKey = `eval_draft_${applicantId}`;
      const draftStr = sessionStorage.getItem(draftKey);
      let draft = null;
      try { if (draftStr) draft = JSON.parse(draftStr); } catch (e) {}

      let dSchDate = applicantData.scheduled_date || "";
      let dSchTime = applicantData.scheduled_time || "";
      let dBmiHeight = "";
      let dBmiWeight = "";
      let dPatPushups = "";
      let dPatPushupsPassed = null;
      let dPatSitups = "";
      let dPatSitupsPassed = null;
      let dPatRun = "";
      let dPatRunPassed = null;
      let dPsychologicalResult = "";
      let dMedicalResult = "";
      let dDrugResult = "";
      let dScores = {};
      let dFinalInterviewScore = applicantData.evaluation_final_interview || "";

      if (applicantData.criteria_scores) {
        applicantData.criteria_scores.forEach(s => {
          dScores[s.criterion] = s.score;
      const name = s.criterion_name;
          if (name === 'BMI Height' && !draftData) dBmiHeight = s.score || "";
          if (name === 'BMI Weight' && !draftData) dBmiWeight = s.score || "";
          if (name === 'PAT Pushups' && !draftData) { dPatPushups = s.score || ""; dPatPushupsPassed = s.boolean_value; }
          if (name === 'PAT Situps' && !draftData) { dPatSitups = s.score || ""; dPatSitupsPassed = s.boolean_value; }
          if (name === 'PAT Run' && !draftData) { dPatRun = s.text_value || ""; dPatRunPassed = s.boolean_value; }
          if (name === 'Psychological Result' && !draftData) dPsychologicalResult = s.text_value || "";
          if (name === 'Medical Result' && !draftData) dMedicalResult = s.text_value || "";
          if (name === 'Drug Test Result' && !draftData) dDrugResult = s.text_value || "";
        });
      }

      setSchDate(draft?.schDate ?? dSchDate);
      setSchTime(draft?.schTime ?? dSchTime);
      if (!draftData) {
        setBmiHeight(dBmiHeight);
        setBmiWeight(dBmiWeight);
        setPatPushups(dPatPushups);
        setPatPushupsPassed(dPatPushupsPassed);
        setPatSitups(dPatSitups);
        setPatSitupsPassed(dPatSitupsPassed);
        setPatRun(dPatRun);
        setPatRunPassed(dPatRunPassed);
        setPsychologicalResult(dPsychologicalResult);
        setMedicalResult(dMedicalResult);
        setDrugResult(dDrugResult);
        setScores(dScores);
        setFinalInterviewScore(dFinalInterviewScore);
      }
    }
  }, [currentStatus, currentRejectionReason, applicantData, applicantId, draftData]);

  useEffect(() => {
    if (applicantId) {
      const draftKey = `eval_draft_${applicantId}`;
      const draft = {
        schDate, schTime, bmiHeight, bmiWeight, patPushups, patPushupsPassed, patSitups, patSitupsPassed, patRun, patRunPassed, psychologicalResult, medicalResult, drugResult, scores, finalInterviewScore
      };
      sessionStorage.setItem(draftKey, JSON.stringify(draft));
    }
  }, [applicantId, schDate, schTime, bmiHeight, bmiWeight, patPushups, patPushupsPassed, patSitups, patSitupsPassed, patRun, patRunPassed, psychologicalResult, medicalResult, drugResult, scores, finalInterviewScore]);

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
        const isFemale = applicantData?.gender?.toLowerCase() === 'female';
        const minPushups = isFemale ? 25 : 35;
        setPatPushupsPassed(score >= minPushups);
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
        const isFemale = applicantData?.gender?.toLowerCase() === 'female';
        const minSitups = isFemale ? 25 : 35;
        setPatSitupsPassed(score >= minSitups);
      } else {
        setPatSitupsPassed(null);
      }
    } else {
      setPatSitupsPassed(null);
    }
  };

  const handlePatRunBlur = () => {
    if (patRun !== "") {
      const parts = patRun.split(":");
      let totalSeconds = 0;
      if (parts.length === 2) {
        totalSeconds = parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
      } else {
        totalSeconds = parseFloat(patRun) * 60;
      }

      if (!isNaN(totalSeconds) && totalSeconds > 0) {
        const isFemale = applicantData?.gender?.toLowerCase() === 'female';
        const maxSeconds = isFemale ? 1260 : 1140;
        setPatRunPassed(totalSeconds <= maxSeconds);
      } else {
        setPatRunPassed(null);
      }
    } else {
      setPatRunPassed(null);
    }
  };

  const getFiComputedScore = () => {
    let total = 0;
    let hasAny = false;
    const interviewCriteria = criteriaList.filter(c => c.category === 'Interview');
    interviewCriteria.forEach(c => {
      if (scores[c.id] !== undefined && scores[c.id] !== "") {
        total += parseFloat(scores[c.id]) || 0;
        hasAny = true;
      }
    });
    if (!hasAny) return finalInterviewScore;
    return Math.min(total, interviewCriteria.reduce((acc, c) => acc + c.max_score, 0));
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

      const isFemale = applicantData?.gender?.toLowerCase() === 'female';
      const minPushups = isFemale ? 25 : 35;
      const minSitups = isFemale ? 25 : 35;
      const finalPatPushupsPassed = patPushups !== "" ? (parseInt(patPushups, 10) >= minPushups) : null;
      const finalPatSitupsPassed = patSitups !== "" ? (parseInt(patSitups, 10) >= minSitups) : null;
      let finalPatRunPassed = null;
      if (patRun !== "") {
        const parts = patRun.split(":");
        let totalSeconds = 0;
        if (parts.length === 2) {
          totalSeconds = parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
        } else {
          totalSeconds = parseFloat(patRun) * 60;
        }
        if (!isNaN(totalSeconds) && totalSeconds > 0) {
          const maxSeconds = isFemale ? 1260 : 1140;
          finalPatRunPassed = totalSeconds <= maxSeconds;
        }
      }

      if (currentStatus === "New Applicant") {
        statusToSave = selectedStatus;
      } else {
        const currentIndex = POST_ACCEPTANCE_STATUSES.indexOf(currentStatus);

        if (currentStatus === "Qualified") {
          if (schDate) {
            statusToSave = "Body Mass Index";
          } else {
            statusToSave = "Qualified";
          }
        } else if (currentStatus === "Body Mass Index") {
          const bmiVal = getBmiValue();
          if (bmiVal !== null) {
            if (bmiVal >= 18.5 && bmiVal <= 25.0) {
              // Stay in Body Mass Index tab so they can be scheduled for PAT
              statusToSave = "Body Mass Index";
              finalRejectionReason = "";
            } else {
              statusToSave = "Failed";
              const category = bmiVal < 18.5 ? "Underweight" : "Overweight";
              finalRejectionReason = `${category}. Calculated BMI is ${bmiVal.toFixed(1)} (Normal range: 18.5 - 25.0).`;
            }
          }
        } else if (currentStatus === "Physical Agility Test") {
          if (
            finalPatPushupsPassed === false ||
            finalPatSitupsPassed === false ||
            finalPatRunPassed === false
          ) {
            statusToSave = "Failed";
            const failedEvents = [];
            if (finalPatPushupsPassed === false) failedEvents.push("Push-Ups");
            if (finalPatSitupsPassed === false) failedEvents.push("Sit-Ups");
            if (finalPatRunPassed === false) failedEvents.push("Run");
            finalRejectionReason = `Failed Physical Agility Test requirements in: ${failedEvents.join(", ")}.`;
          } else {
            // Stay in Physical Agility Test tab so they can be scheduled for Neuro Examination
            statusToSave = "Physical Agility Test";
          }
        } else if (currentStatus === "Neuro Examination") {
          if (psychologicalResult === "Recommended") {
            statusToSave = "Medical Examination";
          } else if (psychologicalResult === "Not Recommended") {
            statusToSave = "Failed";
            finalRejectionReason = "Failed Neuro Examination: Not Recommended.";
          }
        } else if (currentStatus === "Drug Test") {
          if (drugResult === "Passed") {
            statusToSave = "Complete Background Investigation";
          } else if (drugResult === "Failed") {
            statusToSave = "Failed";
            finalRejectionReason = "Failed Drug Test result.";
          }
        } else if (currentStatus === "Final Interview") {
          const fiScore = getFiComputedScore();
          if (fiScore !== "" && fiScore !== null && fiScore >= 70) {
            statusToSave = "Oath Taking";
          } else {
            statusToSave = "Failed";
            finalRejectionReason = `Failed Final Interview with a score of ${fiScore !== "" && fiScore !== null ? parseFloat(fiScore).toFixed(2) : "0"}%.`;
          }
        } else if (
          currentIndex !== -1 &&
          currentIndex < POST_ACCEPTANCE_STATUSES.length - 2
        ) {
          // Advance to next status, assuming they pass (-2 skips Accepted and Failed)
          statusToSave = POST_ACCEPTANCE_STATUSES[currentIndex + 1];
        }
      }

      const combinedScores = criteriaList.filter(c => c.category === 'Interview').map(c => ({
        criterion_id: c.id,
        score: parseFloat(scores[c.id]) || 0
      }));

      const addCriteria = (name, scoreVal, textVal, boolVal) => {
        const criterion = criteriaList.find(c => c.name === name);
        if (criterion) {
          combinedScores.push({
            criterion_id: criterion.id,
            score: scoreVal !== null && scoreVal !== "" && !isNaN(scoreVal) ? parseFloat(scoreVal) : null,
            text_value: textVal || null,
            boolean_value: boolVal !== null ? boolVal : null
          });
        }
      };

      addCriteria('BMI Height', bmiHeight, null, null);
      addCriteria('BMI Weight', bmiWeight, null, null);
      addCriteria('BMI Result', null, bmiHeight && bmiWeight ? (parseFloat(bmiWeight) / ((parseFloat(bmiHeight) / 100) * (parseFloat(bmiHeight) / 100))).toFixed(1) : null, null);
      
      addCriteria('PAT Pushups', patPushups, null, finalPatPushupsPassed);
      addCriteria('PAT Situps', patSitups, null, finalPatSitupsPassed);
      addCriteria('PAT Run', null, patRun, finalPatRunPassed);
      
      addCriteria('Psychological Result', null, psychologicalResult, null);
      addCriteria('Medical Result', null, medicalResult, null);
      addCriteria('Drug Test Result', null, drugResult, null);

      const dataToSend = {
        status: statusToSave,
        rejection_reason:
          statusToSave === "Failed" ? finalRejectionReason : null,
        performed_by: currentUser,
        evaluation_bmi:
          bmiHeight && bmiWeight
            ? (
                parseFloat(bmiWeight) /
                ((parseFloat(bmiHeight) / 100) * (parseFloat(bmiHeight) / 100))
              ).toFixed(1)
            : null,
        evaluation_pat: null, // PAT Score is computed manually or left null for now
        criteria_scores: combinedScores,
        evaluation_final_interview:
          getFiComputedScore() === "" ? null : getFiComputedScore(),
        // Schedule
        scheduled_date:
          statusToSave !== currentStatus && statusToSave !== "Failed"
            ? null
            : schDate || null,
        scheduled_time:
          statusToSave !== currentStatus && statusToSave !== "Failed"
            ? null
            : schTime || null,
        oath_taking_date:
          statusToSave === "Oath Taking"
            ? schDate || null
            : applicantData?.oath_taking_date || null,
        evaluation_remarks: finalRejectionReason || null,
        is_qualified_evaluated:
          currentStatus === "Qualified" || statusToSave === "Qualified"
            ? true
            : applicantData?.is_qualified_evaluated || false,
        is_bmi_evaluated:
          currentStatus === "Body Mass Index" || statusToSave === "Body Mass Index"
            ? true
            : applicantData?.is_bmi_evaluated || false,
        is_pat_evaluated:
          currentStatus === "Physical Agility Test" || statusToSave === "Physical Agility Test"
            ? true
            : applicantData?.is_pat_evaluated || false,
      };

      await api.put(`users/update_status/${applicantId}/`, dataToSend);
      sessionStorage.removeItem(`eval_draft_${applicantId}`);
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
    "Complete Background Investigation",
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
          {applicantData?.status !== "New Applicant" &&
            applicantData?.status_updated_at && (
              <span className="text-gray-400 text-sm ml-2 border-l pl-2">
                Last Updated:{" "}
                {new Date(applicantData.status_updated_at).toLocaleString([], {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
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
            disabled={currentStatus !== "New Applicant"}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className={`status-option mt-1 ${
              currentStatus !== "New Applicant"
                ? "bg-gray-50 border border-gray-200 text-gray-500 cursor-not-allowed"
                : ""
            }`}
          >
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        {/* Qualified Specific Banner */}
        {selectedStatus === "Qualified" && (
          <div className="pt-2">
            <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-md text-xs text-indigo-700 font-medium">
              This applicant is evaluated for the Qualified stage. Recruitment personnel can set a schedule date and time to advance them to the next step (Body Mass Index).
            </div>
          </div>
        )}

        {/* BMI Specific Options */}
        {selectedStatus === "Body Mass Index" && (
          <BmiForm
            bmiHeight={bmiHeight}
            setBmiHeight={setBmiHeight}
            handleBmiBlur={handleBmiBlur}
            bmiWeight={bmiWeight}
            setBmiWeight={setBmiWeight}
            bmiVal={bmiVal}
            isBmiPassing={isBmiPassing}
            rejectionReason={rejectionReason}
            schDate={schDate}
            schTime={schTime}
          />
        )}

        {/* PAT Specific Options */}
        {selectedStatus === "Physical Agility Test" && (
          <PatForm
            schDate={schDate}
            schTime={schTime}
            patPushups={patPushups}
            setPatPushups={setPatPushups}
            setPatPushupsPassed={setPatPushupsPassed}
            handlePatPushupsBlur={handlePatPushupsBlur}
            patPushupsPassed={patPushupsPassed}
            patSitups={patSitups}
            setPatSitups={setPatSitups}
            setPatSitupsPassed={setPatSitupsPassed}
            handlePatSitupsBlur={handlePatSitupsBlur}
            patSitupsPassed={patSitupsPassed}
            patRun={patRun}
            setPatRun={setPatRun}
            setPatRunPassed={setPatRunPassed}
            handlePatRunBlur={handlePatRunBlur}
            patRunPassed={patRunPassed}
          />
        )}

        {/* Neuro Examination Specific Option */}
        {selectedStatus === "Neuro Examination" && (
          <div className="pt-2">
            <label className="text-xs font-bold text-gray-500 uppercase">
              Neuro Remarks
            </label>
            <select
              value={psychologicalResult}
              onChange={(e) => setPsychologicalResult(e.target.value)}
              className="status-option mt-1"
            >
              <option value="">Select Remarks</option>
              <option value="Recommended">Recommended</option>
              <option value="Not Recommended">Not Recommended</option>
            </select>
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
              <option value="Passed">Passed</option>
              <option value="Failed">Failed</option>
            </select>
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
                Only Interviewers can evaluate and input scores for the Final
                Interview.
              </div>
            )}
            <div className="border border-gray-200 rounded-lg p-5 text-sm bg-white shadow-sm">
              <CriteriaForm
                criteriaList={criteriaList.filter(c => c.category === 'Interview')}
                values={scores}
                onChange={(key, val) => {
                  setScores(prev => ({ ...prev, [key]: val }));
                }}
                isInterviewer={isInterviewer}
                totalScore={getFiComputedScore()}
                maxTotal={criteriaList.filter(c => c.category === 'Interview').reduce((acc, c) => acc + c.max_score, 0)}
              />
            </div>
          </div>
        )}

      </div>

      {selectedStatus === "Failed" && (
        <div className="mt-4">
          <label className="text-xs font-bold text-gray-500 uppercase">
            Reason for Rejection
          </label>
          <textarea
            className="w-full p-2 border border-gray-300 rounded mt-1 text-sm min-h-[200px] focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
            placeholder="Enter specific reason for rejection..."
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
          />
        </div>
      )}
      {(() => {
        const isEvaluated = (() => {
          if (currentStatus === "Qualified")
            return true;
          if (currentStatus === "Final Interview")
            return applicantData?.final_interview_score != null;
          if (currentStatus === "Body Mass Index")
            return applicantData?.bmi_weight != null;
          if (currentStatus === "Physical Agility Test")
            return applicantData?.pat_pushups != null;
          return false;
        })();

        const isAlreadyEvaluatedStage = isEvaluated && (currentStatus === "Qualified" || currentStatus === "Body Mass Index" || currentStatus === "Physical Agility Test");

        return (
          <button
            onClick={handleUpdate}
            disabled={
              isUpdating ||
              isAlreadyEvaluatedStage ||
              currentStatus === "Failed" ||
              (selectedStatus === "Body Mass Index" &&
                (!bmiHeight || !bmiWeight)) ||
              (selectedStatus === "Physical Agility Test" &&
                (patPushups === "" || patSitups === "" || patRun === "")) ||
              (selectedStatus === "Neuro Examination" && !psychologicalResult) ||
              (selectedStatus === "Drug Test" && !drugResult) ||
              selectedStatus === "Complete Background Investigation" ||
              (selectedStatus === "Final Interview" && !isInterviewer) ||
              (selectedStatus === "Final Interview" &&
                criteriaList.filter(c => c.category === 'Interview').some(c => scores[c.id] === undefined || scores[c.id] === ""))
            }
            className={`rounded-[4px] text-white font-semibold save-changes-btn mt-6 h-11 transition-all w-full ${
              isUpdating ||
              isAlreadyEvaluatedStage ||
              currentStatus === "Failed" ||
              (selectedStatus === "Body Mass Index" &&
                (!bmiHeight || !bmiWeight)) ||
              (selectedStatus === "Physical Agility Test" &&
                (patPushups === "" || patSitups === "" || patRun === "")) ||
              (selectedStatus === "Drug Test" && !drugResult) ||
              selectedStatus === "Complete Background Investigation" ||
              (selectedStatus === "Final Interview" && !isInterviewer) ||
              (selectedStatus === "Final Interview" &&
                criteriaList.filter(c => c.category === 'Interview').some(c => scores[c.id] === undefined || scores[c.id] === ""))
                ? "bg-gray-400 cursor-not-allowed"
                : "cursor-pointer bg-[#2C2D86] hover:bg-[#1e1f5e] shadow-md hover:shadow-lg active:scale-[0.98]"
            }`}
          >
            {isUpdating ? "Evaluating..." : isAlreadyEvaluatedStage ? "Evaluated" : isEvaluated ? "Update Evaluation" : "Evaluate"}
          </button>
        );
      })()}

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