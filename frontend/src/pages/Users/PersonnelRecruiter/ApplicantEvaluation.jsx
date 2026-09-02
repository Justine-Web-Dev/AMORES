import React, { useState, useEffect, useMemo, useRef } from "react";
import { api } from "../../../../api/api";
import { useNavigate, useLocation } from "react-router-dom";
import * as XLSX from "xlsx";
import { RiFileExcel2Line } from "react-icons/ri";
import {
  HiOutlineClipboardCheck,
  HiOutlineUserGroup,
  HiOutlineUser,
  HiOutlineBadgeCheck,
  HiOutlineChatAlt2,
  HiOutlineHeart,
  HiOutlineBeaker,
  HiOutlineXCircle,
  HiChevronLeft,
  HiChevronRight,
} from "react-icons/hi";
import "./ApplicantEval.css";
import MessageModal from "../../../Modals/MessageModal";
import StatusManagement from "./StatusManagement";

function ApplicantEvaluation({ isInterviewer = false }) {
  const [searchTerm, setSearchTerm] = useState("");
  const location = useLocation();
  const [statusFilter, setStatusFilter] = useState(
    location.state?.tab ? location.state.tab : (isInterviewer ? "Final Interview" : "All"),
  );
  const [sortBy, setSortBy] = useState("default");
  const [selectionLimit, setSelectionLimit] = useState("300");
  const [evaluatingApplicant, setEvaluatingApplicant] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const statusColors = {
    "New Applicant": "bg-blue-100 text-blue-600",
    Qualified: "bg-indigo-100 text-indigo-700",
    Accepted: "bg-emerald-100 text-emerald-700",
    Disqualifed: "bg-rose-100 text-rose-700",
    Failed: "bg-rose-100 text-rose-700",
    "Body Mass Index": "bg-blue-50 text-blue-500",
    "Physical Agility Test": "bg-orange-100 text-orange-600",
    "Neuro Examination": "bg-indigo-100 text-indigo-600",
    Medical: "bg-pink-100 text-pink-600",
    "Drug Test": "bg-amber-100 text-amber-600",
    "Final Interview": "bg-teal-100 text-teal-600",
    "Oath Taking": "bg-emerald-100 text-emerald-600",
  };

  const [applicantInfo, setApplicantInfo] = useState([]);
  const [open, setOpen] = useState(null);

  const scrollRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(Math.ceil(scrollLeft + clientWidth) < scrollWidth);
    }
  };

  useEffect(() => {
    const handleScrollWithDelay = () => {
      handleScroll();
      setTimeout(handleScroll, 100);
      setTimeout(handleScroll, 500);
    };

    handleScrollWithDelay();
    window.addEventListener("resize", handleScroll);
    
    let observer;
    if (scrollRef.current) {
      observer = new ResizeObserver(() => handleScroll());
      observer.observe(scrollRef.current);
    }

    return () => {
      window.removeEventListener("resize", handleScroll);
      if (observer) {
        observer.disconnect();
      }
    };
  }, [applicantInfo]);

  const scrollTabs = (direction) => {
    if (scrollRef.current) {
      const { clientWidth } = scrollRef.current;
      const scrollAmount =
        direction === "left" ? -clientWidth / 2 : clientWidth / 2;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const STATUS_TABS = isInterviewer
    ? ["Final Interview"]
    : [
        "All",
        "New Applicant",
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

  const tabIcons = {
    All: (
      <HiOutlineUserGroup
        className="inline-block mr-1 align-text-bottom"
        size={16}
      />
    ),
    "New Applicant": (
      <HiOutlineUser
        className="inline-block mr-1 align-text-bottom"
        size={16}
      />
    ),
    Qualified: (
      <HiOutlineBadgeCheck
        className="inline-block mr-1 align-text-bottom"
        size={16}
      />
    ),
    "Body Mass Index": (
      <HiOutlineClipboardCheck
        className="inline-block mr-1 align-text-bottom"
        size={16}
      />
    ),
    "Physical Agility Test": (
      <HiOutlineClipboardCheck
        className="inline-block mr-1 align-text-bottom"
        size={16}
      />
    ),
    "Neuro Examination": (
      <HiOutlineChatAlt2
        className="inline-block mr-1 align-text-bottom"
        size={16}
      />
    ),
    Medical: (
      <HiOutlineHeart
        className="inline-block mr-1 align-text-bottom"
        size={16}
      />
    ),
    "Drug Test": (
      <HiOutlineBeaker
        className="inline-block mr-1 align-text-bottom"
        size={16}
      />
    ),
    "Final Interview": (
      <HiOutlineBadgeCheck
        className="inline-block mr-1 align-text-bottom"
        size={16}
      />
    ),
    "Oath Taking": (
      <HiOutlineBadgeCheck
        className="inline-block mr-1 align-text-bottom"
        size={16}
      />
    ),
    Accepted: (
      <HiOutlineBadgeCheck
        className="inline-block mr-1 align-text-bottom"
        size={16}
      />
    ),
    Failed: (
      <HiOutlineXCircle
        className="inline-block mr-1 align-text-bottom"
        size={16}
      />
    ),
  };

  const getTabCount = (tabName) => {
    if (tabName === "All") {
      return applicantInfo.filter((app) => app.status !== "Failed").length;
    }
    return applicantInfo.filter((app) => app.status === tabName).length;
  };

  // Scheduling states
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [isSavingSchedule, setIsSavingSchedule] = useState(false);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [scheduleMessageConfig, setScheduleMessageConfig] = useState({
    isOpen: false,
    type: "success",
    message: "",
  });

  useEffect(() => {
    setIsSelectionMode(false);
    setSelectedIds([]);
  }, [statusFilter]);

  const eligibleApplicants = useMemo(() => {
    return applicantInfo.filter((app) =>
      ["Body Mass Index", "Physical Agility Test"].includes(app.status),
    );
  }, [applicantInfo]);

  const handleAssignSchedule = async (applicant) => {
    if (!scheduleDate) {
      setScheduleMessageConfig({
        isOpen: true,
        type: "error",
        message: "Please select a date first.",
      });
      return;
    }

    setIsSavingSchedule(true);
    try {
      const dataToSend = {
        scheduled_date: scheduleDate,
        scheduled_time: scheduleTime || null,
      };
      await api.put(`users/update_status/${applicant.id}/`, dataToSend);
      setScheduleMessageConfig({
        isOpen: true,
        type: "success",
        message: `Scheduled ${applicant.firstname} ${applicant.lastname} for ${scheduleDate} ${scheduleTime ? `@ ${scheduleTime}` : ""} successfully.`,
      });
      fetchInfo(true);
    } catch (err) {
      console.error("Failed to update schedule:", err);
      setScheduleMessageConfig({
        isOpen: true,
        type: "error",
        message: "Failed to assign schedule. Please try again.",
      });
    } finally {
      setIsSavingSchedule(false);
    }
  };

  const handleBulkSaveSchedule = async () => {
    if (!scheduleDate) {
      setScheduleMessageConfig({
        isOpen: true,
        type: "error",
        message: "Please select a date first.",
      });
      return;
    }
    if (selectedIds.length === 0) {
      setScheduleMessageConfig({
        isOpen: true,
        type: "error",
        message: "Please select at least one applicant.",
      });
      return;
    }

    let nextStatus = null;
    if (statusFilter === "Qualified") nextStatus = "Body Mass Index";
    else if (statusFilter === "Body Mass Index") nextStatus = "Physical Agility Test";
    else if (statusFilter === "Physical Agility Test") nextStatus = "Neuro Examination";

    setIsSavingSchedule(true);
    try {
      const dataToSend = {
        scheduled_date: scheduleDate,
        scheduled_time: scheduleTime || null,
      };

      if (nextStatus) {
        dataToSend.status = nextStatus;
      }

      await Promise.all(
        selectedIds.map((id) =>
          api.put(`users/update_status/${id}/`, dataToSend),
        ),
      );

      setScheduleMessageConfig({
        isOpen: true,
        type: "success",
        message: `Scheduled ${selectedIds.length} applicant(s) for ${scheduleDate} ${scheduleTime ? `@ ${scheduleTime}` : ""} successfully.`,
      });
      setIsSelectionMode(false);
      if (nextStatus) {
        setStatusFilter(nextStatus);
      }
      fetchInfo(true);
    } catch (err) {
      console.error("Failed to update schedules:", err);
      setScheduleMessageConfig({
        isOpen: true,
        type: "error",
        message: "Failed to assign schedules. Please try again.",
      });
    } finally {
      setIsSavingSchedule(false);
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      let limit = filteredAndSorted.length;
      if (selectionLimit !== "All") {
        limit = parseInt(selectionLimit, 10);
      }
      setSelectedIds(filteredAndSorted.slice(0, limit).map((app) => app.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const fetchInfo = async (isSilent = false) => {
    !isSilent && setLoading(true);
    try {
      const response = await api.get("users/applicants/all/");
      setApplicantInfo(response.data);
      console.log(response.data);
    } catch (err) {
      console.error("Error fetching applicant info:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInfo(false);
    const interval = setInterval(() => {
      fetchInfo(true);
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setIsSelectionMode(false);
    setSelectedIds([]);
  }, [statusFilter]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.action-dropdown-container')) {
        setOpen(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleMenu = (id) => {
    setOpen(open === id ? null : id);
  };

  const isEvaluated = (applicant) => {
    if (statusFilter === "Final Interview") return applicant.final_interview_score != null;
    if (statusFilter === "Body Mass Index") return applicant.bmi_weight != null;
    if (statusFilter === "Physical Agility Test") return applicant.pat_pushups != null;
    return false;
  };

  const filteredAndSorted = useMemo(() => {
    return applicantInfo
      .filter((applicant) => {
        if (applicant.status === "Failed" && statusFilter !== "Failed")
          return false;
        
        if (sortBy === "batch1" && applicant.batch !== 1 && applicant.batch !== "B1")
          return false;
        if (sortBy === "batch2" && applicant.batch !== 2 && applicant.batch !== "B2")
          return false;

        const fullName =
          `${applicant.firstname} ${applicant.lastname} ${applicant.middle_initial || ""}`.toLowerCase();
        const matchesSearch = fullName.includes(searchTerm.toLowerCase());
        const matchesStatus =
          statusFilter === "All" || applicant.status === statusFilter;
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        const evalA = isEvaluated(a);
        const evalB = isEvaluated(b);
        
        if (evalA && !evalB) return 1;
        if (!evalA && evalB) return -1;

        if (sortBy === "name") {
          const nameA = `${a.firstname} ${a.lastname}`.toLowerCase();
          const nameB = `${b.firstname} ${b.lastname}`.toLowerCase();
          return nameA.localeCompare(nameB);
        } else if (sortBy === "default") {
          if (statusFilter === "Failed") {
            const dateA = a.status_updated_at ? new Date(a.status_updated_at) : new Date(a.created_at);
            const dateB = b.status_updated_at ? new Date(b.status_updated_at) : new Date(b.created_at);
            return dateB - dateA; // LIFO (most recently updated first)
          } else {
            const dateA = new Date(a.created_at);
            const dateB = new Date(b.created_at);
            return dateB - dateA;
          }
        } else if (sortBy === "date") {
          const dateA = new Date(a.created_at);
          const dateB = new Date(b.created_at);
          return dateA - dateB;
        } else if (sortBy === "batch1") {
          return (a.batch || 0) - (b.batch || 0);
        } else if (sortBy === "batch2") {
          return (b.batch || 0) - (a.batch || 0);
        }
        return 0;
      });
  }, [applicantInfo, searchTerm, statusFilter, sortBy]);

  const handleExportExcel = () => {
    const dataForExport = applicantInfo.filter((applicant) => {
      const fullName =
        `${applicant.firstname} ${applicant.lastname} ${applicant.middle_initial || ""}`.toLowerCase();
      const matchesSearch = fullName.includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "All" || applicant.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    const exportData = dataForExport.map((applicant) => {
      if (statusFilter === "Final Interview") {
        return {
          "First Name": applicant.firstname,
          "Last Name": applicant.lastname,
          "Middle Name": applicant.middle_name || "N/A",
          "Barangay": applicant.barangay || "N/A",
          //eligibility
          //marital status
          //place of application (attrition)
          "Municipality": applicant.city_municipality || "N/A",
          "Patriotism": applicant.fi_patriotism,
          "Integrity": applicant.fi_integrity,
          "Awareness": applicant.fi_awareness,
          "Communication": applicant.fi_communication,
        };
      }

      return {
        "Tracking Code": applicant.tracking_code,
        "First Name": applicant.firstname,
        "Last Name": applicant.lastname,
        "Middle Name": applicant.middle_name || "N/A",
        Birthdate: applicant.birthdate || "N/A",
        Age: applicant.age,
        Gender: applicant.gender || "N/A",
        Email: applicant.email,
        "Contact #": applicant.cp_number,
        "Permanent Address": applicant.address || "N/A",
        Height: applicant.height,
        Tribe: applicant.tribe || "N/A",
        "Pag-IBIG No.": applicant.pag_ibig_number,
        "PhilHealth ID": applicant.phil_health_id_num,
        "School Name": applicant.name_of_school,
        "Program/Course": applicant.program,
        "Date Graduated": applicant.date_graduated,
        "Latin Honor": applicant.latin_honor || "N/A",
        "Current Status": applicant.status,
        Batch: applicant.batch || 1,
        "Rejection Reason": applicant.rejection_reason || "N/A",
        "Next Scheduled Date": applicant.scheduled_date || "N/A",
        "Next Scheduled Time": applicant.scheduled_time || "N/A",
        "Oath Taking Date": applicant.oath_taking_date || "N/A",
        "Evaluation Remarks": applicant.evaluation_remarks || "N/A",
        "BMI Height (cm)": applicant.bmi_height || "N/A",
        "BMI Weight (kg)": applicant.bmi_weight || "N/A",
        "BMI Result": applicant.bmi_result || "N/A",
        "PAT Score (%)": applicant.pat_score || "N/A",
        "1-Min Push UPS":
          applicant.pat_pushups !== null
            ? `${applicant.pat_pushups} (${applicant.pat_pushups_passed ? "PASSED" : "FAILED"})`
            : "N/A",
        "1-Min Sit-On":
          applicant.pat_situps !== null
            ? `${applicant.pat_situps} (${applicant.pat_situps_passed ? "PASSED" : "FAILED"})`
            : "N/A",
        "3K Run": applicant.pat_run
          ? `${applicant.pat_run} (${applicant.pat_run_passed ? "PASSED" : "FAILED"})`
          : "N/A",
        "Neuro/Psych Results": applicant.psychological_result || "N/A",
        "Medical Findings": applicant.medical_result || "N/A",
        "Drug Test Result": applicant.drug_test_result || "N/A",
        "Final Interview Score (%)": applicant.final_interview_score || "N/A",
        "Registration Date": applicant.created_at,
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Master Applicant List");

    const wscols = [
      { wch: 15 },
      { wch: 20 },
      { wch: 20 },
      { wch: 20 },
      { wch: 15 },
      { wch: 5 },
      { wch: 10 },
      { wch: 30 },
      { wch: 15 },
      { wch: 10 },
      { wch: 20 },
      { wch: 15 },
      { wch: 15 },
      { wch: 30 },
      { wch: 30 },
      { wch: 15 },
      { wch: 15 },
      { wch: 25 },
      { wch: 30 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 40 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 40 },
      { wch: 40 },
      { wch: 15 },
      { wch: 20 },
      { wch: 15 },
    ];
    worksheet["!cols"] = wscols;

    const fileName = `Applicant_Master_Report_${new Date().toISOString().split("T")[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  const formatDisplaySchedule = (dateStr, timeStr) => {
    let formattedDate = "";
    if (dateStr) {
      const [year, month, day] = dateStr.split("-");
      formattedDate = `${day}-${month}-${year}`;
    }
    let formattedTime = "";
    if (timeStr) {
      let [hours, minutes] = timeStr.split(":");
      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12;
      hours = hours ? hours : 12;
      formattedTime = `${String(hours).padStart(2, "0")}:${minutes} ${ampm}`;
    }
    return formattedDate + (formattedTime ? ` ${formattedTime}` : "");
  };

  return (
    <div>
      <div className="module-content">
        <h2>Applicant Evaluation</h2>
        <p>
          Utilize smart filtering to search, sort, and categorize applicants
          according to their current status.
        </p>

        <div className="relative flex items-center w-full mt-6 mb-4 border-b border-gray-200">
          {showLeftArrow && (
            <button
              onClick={() => scrollTabs("left")}
              className="absolute left-0 z-10 p-1 bg-white border border-gray-200 rounded-full shadow-md text-gray-600 hover:text-[#2C2D86] hover:bg-gray-50 focus:outline-none flex items-center justify-center cursor-pointer"
              style={{ transform: "translateX(-20%)" }}
            >
              <HiChevronLeft size={16} />
            </button>
          )}

          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar w-full scroll-smooth"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {STATUS_TABS.map((tab) => {
              const count = getTabCount(tab);
              const isActive = statusFilter === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setStatusFilter(tab)}
                  className={`pb-2 px-3 text-sm font-medium transition-all duration-200 whitespace-nowrap cursor-pointer ${
                    isActive
                      ? "border-b-2 border-[#2C2D86] text-[#2C2D86]"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {tab} ({count})
                </button>
              );
            })}
          </div>

          {showRightArrow && (
            <button
              onClick={() => scrollTabs("right")}
              className="absolute right-0 z-10 p-1 bg-white border border-gray-200 rounded-full shadow-md text-gray-600 hover:text-[#2C2D86] hover:bg-gray-50 focus:outline-none flex items-center justify-center cursor-pointer"
              style={{ transform: "translateX(20%)" }}
            >
              <HiChevronRight size={16} />
            </button>
          )}
        </div>
        <div className="filter-controls">
          <input
            type="text"
            placeholder="Search applicants..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
          >
            <option value="default">Select Sorting</option>
            <option value="date">Sort by Date</option>
            <option value="name">Sort by Name</option>
            <option value="batch1">Sort by Batch 1</option>
            <option value="batch2">Sort by Batch 2</option>
          </select>

          {["Qualified", "Body Mass Index", "Physical Agility Test"].includes(statusFilter) && (
            <select
              value={selectionLimit}
              onChange={(e) => setSelectionLimit(e.target.value)}
              className="sort-select"
            >
              <option value="All">Applicant Limit: All</option>
              <option value="100">Applicant Limit: 100</option>
              <option value="200">Applicant Limit: 200</option>
              <option value="300">Applicant Limit: 300</option>
              <option value="400">Applicant Limit: 400</option>
              <option value="500">Applicant Limit: 500</option>
            </select>
          )}

          {(["Qualified", "Body Mass Index", "Physical Agility Test"].includes(statusFilter) ||
            (isInterviewer && statusFilter === "Final Interview")) && (
            <div className="flex items-center gap-2 border-l border-gray-300 pl-4 h-[38px] next-step-schedule-container">
              <div className="flex items-center gap-1.5">
                <label className="text-[10px] font-bold text-gray-500 uppercase whitespace-nowrap">
                  {statusFilter === "Final Interview" 
                    ? "Final Interview Date:" 
                    : statusFilter === "Qualified" 
                      ? "BMI Date:" 
                      : statusFilter === "Body Mass Index" 
                        ? "PAT Date:" 
                        : "Next Step Date:"}
                </label>
                <input
                  type="date"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  className="p-1.5 border border-gray-300 rounded text-xs outline-none focus:border-blue-500 bg-white h-[34px]"
                />
              </div>
              <div className="flex items-center gap-1.5">
                <label className="text-[10px] font-bold text-gray-500 uppercase whitespace-nowrap">
                  Time:
                </label>
                <input
                  type="time"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                  className="p-1.5 border border-gray-300 rounded text-xs outline-none focus:border-blue-500 bg-white h-[34px]"
                />
              </div>
              {!isSelectionMode ? (
                <button
                  onClick={() => {
                    if (!scheduleDate) {
                      setScheduleMessageConfig({
                        isOpen: true,
                        type: "error",
                        message: "Please select a date first.",
                      });
                      return;
                    }
                    setIsSelectionMode(true);
                    const preselected = filteredAndSorted
                      .filter((app) => app.scheduled_date === scheduleDate)
                      .map((app) => app.id);
                    setSelectedIds((prev) => {
                      const newSet = new Set([...prev, ...preselected]);
                      return Array.from(newSet);
                    });
                  }}
                  className="px-3 py-2 bg-[#2C2D86] hover:bg-[#3a3b9e] text-white rounded-md text-xs font-semibold shadow-sm active:scale-95 transition-all cursor-pointer h-[34px] flex items-center justify-center whitespace-nowrap ml-1"
                >
                  Select Applicant
                </button>
              ) : (
                <div className="flex items-center gap-1.5 ml-1">
                  <button
                    onClick={handleBulkSaveSchedule}
                    disabled={selectedIds.length === 0 || isSavingSchedule}
                    className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white rounded-md text-xs font-semibold shadow-sm active:scale-95 transition-all cursor-pointer h-[34px] flex items-center justify-center whitespace-nowrap"
                  >
                    {isSavingSchedule
                      ? "Saving..."
                      : `Save Schedule (${selectedIds.length})`}
                  </button>
                  <button
                    onClick={() => {
                      setIsSelectionMode(false);
                    }}
                    className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-xs font-semibold shadow-sm active:scale-95 transition-all cursor-pointer h-[34px] flex items-center justify-center whitespace-nowrap"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          )}

          <button
            onClick={handleExportExcel}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-all shadow-sm active:scale-95 text-sm font-medium"
            title="Export to Excel"
          >
            <RiFileExcel2Line size={24} />
            Export to Excel
          </button>
        </div>

        <div className="shadow sm:rounded-lg border border-gray-200">
          <table className="w-full text-sm text-center text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-100 ">
              <tr>
                {isSelectionMode && (
                  <th scope="col" className="th text-center w-12">
                      <input
                        type="checkbox"
                        checked={
                          filteredAndSorted.length > 0 &&
                          selectedIds.length > 0 &&
                          (selectedIds.length === filteredAndSorted.length || 
                           (selectionLimit !== "All" && selectedIds.length === parseInt(selectionLimit, 10)))
                        }
                        onChange={handleSelectAll}
                        className="w-4 h-4 accent-[#2C2D86] cursor-pointer align-middle"
                      />
                  </th>
                )}
                <th scope="col" className="th">
                  Name
                </th>
                <th scope="col" className="th text-center">
                  Status
                </th>
                {/* {statusFilter !== "New Applicant" && (
                  <th scope="col" className="th text-center whitespace-nowrap">
                    Date Updated
                  </th>
                )} */}

                {statusFilter === "Failed" && (
                  <th scope="col" className="th text-center">
                    Rejection Reason
                  </th>
                )}
                <th scope="col" className="th text-center">
                  Age
                </th>
                <th scope="col" className="th text-center">
                  Gender
                </th>
                <th scope="col" className="th">
                  Program
                </th>
                <th scope="col" className="th">
                  Permanent Address
                </th>
                {/* <th scope="col" className="th">
                  Name of School
                </th> */}
                <th scope="col" className="th whitespace-nowrap">
                  Date Graduated
                </th>
                <th scope="col" className="th text-center">
                  Applied On
                </th>
                <th scope="col" className="th text-center">
                  Batch
                </th>
                <th scope="col" className="th">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200 bg-white">
              {loading ? (
                <tr>
                  <td
                    colSpan={
                      (statusFilter === "Failed"
                        ? 12
                        : statusFilter === "New Applicant"
                          ? 10
                          : 11) + (isSelectionMode ? 1 : 0)
                    }
                    className="px-4 py-10"
                  >
                    <div className="flex justify-center items-center w-full">
                      <div className="border-[4px] border-gray-100 border-t-[#2C2D86] h-[30px] w-[30px] rounded-full animate-spin"></div>
                    </div>
                  </td>
                </tr>
              ) : filteredAndSorted.length > 0 ? (
                filteredAndSorted.map((applicant) => (
                  <tr
                    key={applicant.id}
                    className="hover:bg-gray-50 transition-colors text-center"
                  >
                    {isSelectionMode && (
                      <td className="w-12 text-center">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(applicant.id)}
                          onChange={() => handleSelectOne(applicant.id)}
                          className="w-4 h-4 accent-[#2C2D86] cursor-pointer"
                        />
                      </td>
                    )}
                    <td>
                      <div className="flex items-center justify-center gap-2">
                        <span>
                          {applicant.firstname} {applicant.lastname}{" "}
                          {applicant.middle_initial}
                        </span>
                        {isEvaluated(applicant) && (
                          <span className="text-green-600 bg-green-100 rounded-full px-2 py-0.5 flex items-center justify-center gap-1 text-[10px] font-bold" title="Evaluated">
                            <HiOutlineBadgeCheck size={14} /> Evaluated
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span
                        className={`status-label px-2 py-1 rounded-full text-xs font-semibold ${statusColors[applicant.status] || "bg-gray-100 text-gray-600"}`}
                      >
                        {applicant.status}
                      </span>
                    </td>
                    {/* {statusFilter !== "New Applicant" && (
                      <td className="text-center text-xs whitespace-nowrap text-gray-500">
                        {applicant.status !== "New Applicant" &&
                        applicant.status_updated_at
                          ? new Date(
                              applicant.status_updated_at,
                            ).toLocaleDateString()
                          : "-"}
                      </td>
                    )} */}

                    {statusFilter === "Failed" && (
                      <td
                        className="text-xs text-rose-600 font-medium px-2 py-1 max-w-[200px] truncate"
                        title={applicant.rejection_reason || ""}
                      >
                        {applicant.rejection_reason || "N/A"}
                      </td>
                    )}
                    <td>{applicant.age}</td>
                    <td>{applicant.gender}</td>
                    <td>{applicant.program}</td>
                    <td>{applicant.address || "N/A"}</td>
                    {/* <td>{applicant.name_of_school}</td> */}
                    <td>{applicant.date_graduated}</td>

                    <td>{applicant.created_at}</td>
                    <td className="font-bold text-[#2C2D86]">
                      B{applicant.batch || 1}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="relative inline-block text-left action-dropdown-container">
                        <button
                          onClick={() => toggleMenu(applicant.id)}
                          className="flex items-center justify-center w-9 h-9 mx-auto text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all duration-200 active:scale-95"
                          title="More Options"
                        >
                          <span className="text-xl font-bold tracking-widest leading-none pb-2">
                            ...
                          </span>
                        </button>

                        {open === applicant.id && (
                          <div className="absolute top-full right-0 mt-2 z-[9999] w-40 bg-white shadow-lg border border-gray-100 rounded-md actions">
                            <ul className="flex flex-col text-[14px] gap-[5px]">
                            <h1 className="font-bold text-black border-b pb-1 border-gray-200 action-title">
                              Actions
                            </h1>
                            <button
                              onClick={() =>
                                navigate(`../view-details/${applicant.id}`)
                              }
                              className="text-left px-2 py-1 cursor-pointer view-details-btn-action"
                            >
                              View Details
                            </button>
                            <button
                              onClick={() => {
                                setEvaluatingApplicant(applicant);
                                setOpen(null);
                              }}
                              className="text-left cursor-pointer view-details-btn-action"
                            >
                              Evaluate
                            </button>
                          </ul>
                        </div>
                      )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={
                      (statusFilter === "Failed"
                        ? 12
                        : statusFilter === "New Applicant"
                          ? 10
                          : 11) + (isSelectionMode ? 1 : 0)
                    }
                    className="py-10 text-gray-500 italic"
                  >
                    No applicants registered
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>



      {scheduleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-500/20 backdrop-blur-sm">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg shadow-2xl border border-gray-100 transform transition-all text-left">
            <h3 className="text-lg font-bold text-gray-900 border-b border-gray-200 pb-3 mb-4">
              Select Applicant to Schedule
            </h3>
            <p className="text-sm text-gray-600 mb-4 bg-indigo-50 p-2.5 rounded border border-indigo-100">
              Assigning schedule:{" "}
              <span className="font-semibold text-indigo-700">
                {formatDisplaySchedule(scheduleDate, scheduleTime)}
              </span>
            </p>

            <div className="max-h-[300px] overflow-y-auto space-y-2 pr-1">
              {eligibleApplicants.length > 0 ? (
                eligibleApplicants.map((app) => (
                  <div
                    key={app.id}
                    className="flex justify-between items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div>
                      <h4 className="font-semibold text-gray-800 text-sm">
                        {app.firstname} {app.lastname}
                      </h4>
                      <p className="text-xs text-gray-500">
                        Status:{" "}
                        <span className="text-indigo-600 font-medium">
                          {app.status}
                        </span>
                      </p>
                    </div>
                    <button
                      onClick={() => handleAssignSchedule(app)}
                      disabled={isSavingSchedule}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold cursor-pointer transition-all active:scale-95 disabled:bg-gray-300"
                    >
                      Assign Schedule
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500 text-sm italic">
                  No applicants currently in BMI or PAT stages.
                </div>
              )}
            </div>

            <div className="flex justify-end mt-6 border-t pt-4">
              <button
                onClick={() => setScheduleModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 active:scale-95 transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {evaluatingApplicant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-500/20 backdrop-blur-sm p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl shadow-2xl border border-gray-100 transform transition-all text-left relative flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center px-6 py-5 border-b border-gray-200 bg-white rounded-t-lg z-20 shrink-0">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 m-0">
                <span>Evaluate Applicant:</span>
                <span className="text-[#2C2D86] font-semibold">
                  {evaluatingApplicant.firstname} {evaluatingApplicant.lastname}
                </span>
              </h3>
              <button
                onClick={() => setEvaluatingApplicant(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold cursor-pointer"
              >
                &times;
              </button>
            </div>

            <div className="p-6 overflow-y-auto grow">
              <StatusManagement
                applicantId={evaluatingApplicant.id}
                applicantData={evaluatingApplicant}
                currentStatus={evaluatingApplicant.status}
                currentRejectionReason={evaluatingApplicant.rejection_reason}
                onUpdate={() => {
                  setEvaluatingApplicant(null);
                  fetchInfo(true);
                }}
              />
            </div>
          </div>
        </div>
      )}

      <MessageModal
        isOpen={scheduleMessageConfig.isOpen}
        onClose={() =>
          setScheduleMessageConfig({ ...scheduleMessageConfig, isOpen: false })
        }
        type={scheduleMessageConfig.type}
        title={
          scheduleMessageConfig.type === "success"
            ? "Update Successful"
            : "Update Failed"
        }
        message={scheduleMessageConfig.message}
      />
    </div>
  );
}

export default ApplicantEvaluation;
