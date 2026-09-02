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

  const [schDate, setSchDate] = useState(applicantData?.scheduled_date || "");
  const [schTime, setSchTime] = useState(applicantData?.scheduled_time || "");
  const [drugResult, setDrugResult] = useState(
    applicantData?.drug_test_result || "",
  );
  const [bmiHeight, setBmiHeight] = useState(applicantData?.bmi_height || "");
  const [bmiWeight, setBmiWeight] = useState(applicantData?.bmi_weight || "");
  const [patPushups, setPatPushups] = useState(
    applicantData?.pat_pushups || "",
  );
  const [patPushupsPassed, setPatPushupsPassed] = useState(
    applicantData?.pat_pushups != null
      ? !!applicantData?.pat_pushups_passed
      : null,
  );
  const [patSitups, setPatSitups] = useState(applicantData?.pat_situps || "");
  const [patSitupsPassed, setPatSitupsPassed] = useState(
    applicantData?.pat_situps != null
      ? !!applicantData?.pat_situps_passed
      : null,
  );
  const [patRun, setPatRun] = useState(applicantData?.pat_run || "");
  const [patRunPassed, setPatRunPassed] = useState(
    applicantData?.pat_run != null ? !!applicantData?.pat_run_passed : null,
  );
  const [psychologicalResult, setPsychologicalResult] = useState(
    applicantData?.psychological_result || "",
  );
  const [medicalResult, setMedicalResult] = useState(
    applicantData?.medical_result || "",
  );

  // Final Interview detailed fields
  const [fiPatriotism, setFiPatriotism] = useState(
    applicantData?.fi_patriotism || "",
  );
  const [fiIntegrity, setFiIntegrity] = useState(
    applicantData?.fi_integrity || "",
  );
  const [fiAwareness, setFiAwareness] = useState(
    applicantData?.fi_awareness || "",
  );
  const [fiCommunication, setFiCommunication] = useState(
    applicantData?.fi_communication || "",
  );

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
      setSchDate(applicantData.scheduled_date || "");
      setSchTime(applicantData.scheduled_time || "");

      setDrugResult(applicantData.drug_test_result || "");

      setBmiHeight(applicantData.bmi_height || "");
      setBmiWeight(applicantData.bmi_weight || "");
      setPatPushups(applicantData.pat_pushups || "");
      setPatPushupsPassed(
        applicantData.pat_pushups != null
          ? !!applicantData.pat_pushups_passed
          : null,
      );
      setPatSitups(applicantData.pat_situps || "");
      setPatSitupsPassed(
        applicantData.pat_situps != null
          ? !!applicantData.pat_situps_passed
          : null,
      );
      setPatRun(applicantData.pat_run || "");
      setPatRunPassed(
        applicantData.pat_run != null ? !!applicantData.pat_run_passed : null,
      );

      setPsychologicalResult(applicantData.psychological_result || "");

      setMedicalResult(applicantData.medical_result || "");

      setFinalInterviewScore(applicantData.final_interview_score || "");
      setFiPatriotism(applicantData.fi_patriotism ?? "");
      setFiIntegrity(applicantData.fi_integrity ?? "");
      setFiAwareness(applicantData.fi_awareness ?? "");
      setFiCommunication(applicantData.fi_communication ?? "");
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
      const parts = patRun.split(":");
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
    if (
      fiPatriotism === "" &&
      fiIntegrity === "" &&
      fiAwareness === "" &&
      fiCommunication === ""
    )
      return finalInterviewScore;
    const total =
      (parseFloat(fiPatriotism) || 0) +
      (parseFloat(fiIntegrity) || 0) +
      (parseFloat(fiAwareness) || 0) +
      (parseFloat(fiCommunication) || 0);
    return Math.min(total, 100);
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
        statusToSave = selectedStatus;
      } else {
        const currentIndex = POST_ACCEPTANCE_STATUSES.indexOf(currentStatus);

        if (currentStatus === "Body Mass Index") {
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
            patPushupsPassed === false ||
            patSitupsPassed === false ||
            patRunPassed === false
          ) {
            statusToSave = "Failed";
            const failedEvents = [];
            if (patPushupsPassed === false) failedEvents.push("Push-Ups");
            if (patSitupsPassed === false) failedEvents.push("Sit-Ups");
            if (patRunPassed === false) failedEvents.push("Run");
            finalRejectionReason = `Failed Physical Agility Test requirements in: ${failedEvents.join(", ")}.`;
          } else {
            // Stay in Physical Agility Test tab so they can be scheduled for Neuro Examination
            statusToSave = "Physical Agility Test";
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
        } else if (
          currentIndex !== -1 &&
          currentIndex < POST_ACCEPTANCE_STATUSES.length - 2
        ) {
          // Advance to next status, assuming they pass (-2 skips Accepted and Failed)
          statusToSave = POST_ACCEPTANCE_STATUSES[currentIndex + 1];
        }
      }

      const dataToSend = {
        status: statusToSave,
        rejection_reason:
          statusToSave === "Failed" ? finalRejectionReason : null,
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
        fi_patriotism: fiPatriotism === "" ? null : parseFloat(fiPatriotism),
        fi_integrity: fiIntegrity === "" ? null : parseFloat(fiIntegrity),
        fi_awareness: fiAwareness === "" ? null : parseFloat(fiAwareness),
        fi_communication:
          fiCommunication === "" ? null : parseFloat(fiCommunication),
        final_interview_score:
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
                Only Interviewers can evaluate and input scores for the Final
                Interview.
              </div>
            )}
            <div className="border border-gray-200 rounded-lg p-5 text-sm bg-white shadow-sm">
              <CriteriaForm
                values={{
                  fiPatriotism,
                  fiIntegrity,
                  fiAwareness,
                  fiCommunication,
                }}
                onChange={(key, val) => {
                  const setters = {
                    fiPatriotism: setFiPatriotism,
                    fiIntegrity: setFiIntegrity,
                    fiAwareness: setFiAwareness,
                    fiCommunication: setFiCommunication,
                  };
                  setters[key]?.(val);
                }}
                isInterviewer={isInterviewer}
                totalScore={getFiComputedScore()}
              />
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
            className="w-full p-2 border border-gray-300 rounded mt-1 text-sm min-h-[200px] focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
            placeholder="Enter specific reason for rejection..."
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
          />
        </div>
      )}
      {(() => {
        const isEvaluated = (() => {
          if (currentStatus === "Final Interview")
            return applicantData?.final_interview_score != null;
          if (currentStatus === "Body Mass Index")
            return applicantData?.bmi_weight != null;
          if (currentStatus === "Physical Agility Test")
            return applicantData?.pat_pushups != null;
          return false;
        })();

        return (
          <button
            onClick={handleUpdate}
            disabled={
              isUpdating ||
              currentStatus === "Failed" ||
              (selectedStatus === "Body Mass Index" &&
                (!bmiHeight || !bmiWeight)) ||
              (selectedStatus === "Physical Agility Test" &&
                (patPushups === "" || patSitups === "" || patRun === "")) ||
              (selectedStatus === "Final Interview" &&
                (fiPatriotism === "" ||
                  fiIntegrity === "" ||
                  fiAwareness === "" ||
                  fiCommunication === "")) ||
              isEvaluated
            }
            className={`rounded-[4px] text-white font-semibold save-changes-btn mt-6 h-11 transition-all w-full ${
              isUpdating ||
              currentStatus === "Failed" ||
              (selectedStatus === "Body Mass Index" &&
                (!bmiHeight || !bmiWeight)) ||
              (selectedStatus === "Physical Agility Test" &&
                (patPushups === "" || patSitups === "" || patRun === "")) ||
              (selectedStatus === "Final Interview" &&
                (fiPatriotism === "" ||
                  fiIntegrity === "" ||
                  fiAwareness === "" ||
                  fiCommunication === "")) ||
              isEvaluated
                ? "bg-gray-400 cursor-not-allowed"
                : "cursor-pointer bg-[#2C2D86] hover:bg-[#1e1f5e] shadow-md hover:shadow-lg active:scale-[0.98]"
            }`}
          >
            {isEvaluated
              ? "Evaluated"
              : isUpdating
                ? "Evaluating..."
                : "Evaluate"}
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
