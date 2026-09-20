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
  HiArrowDown,
  HiArrowUp,
} from "react-icons/hi";
import "./ApplicantEval.css";
import MessageModal from "../../../Modals/MessageModal";
import StatusManagement from "./StatusManagement";
import ConfirmRecoModal from "../../../Modals/ConfirmRecoModal";
import ConfirmMedicalModal from "../../../Modals/ConfirmMedicalModal";

function ApplicantEvaluation({ isInterviewer = false }) {
  const pageRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState("");
  const location = useLocation();
  const [statusFilter, setStatusFilter] = useState(
    location.state?.tab ? location.state.tab : (isInterviewer ? "Final Interview" : "All"),
  );
  const [sortBy, setSortBy] = useState("default");
  const [selectionLimit, setSelectionLimit] = useState("300");
  const [provinceFilter, setProvinceFilter] = useState("All");
  const [evaluatingApplicant, setEvaluatingApplicant] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const statusColors = {
    "New Applicant": "bg-blue-100 text-blue-600",
    "Qualified": "bg-indigo-100 text-indigo-700",
    "Accepted": "bg-emerald-100 text-emerald-700",
    "Failed": "bg-rose-100 text-rose-700",
    "Body Mass Index": "bg-blue-50 text-blue-500",
    "Physical Agility Test": "bg-orange-100 text-orange-600",
    "Neuro Examination": "bg-indigo-100 text-indigo-600",
    "Medical": "bg-pink-100 text-pink-600",
    "Drug Test": "bg-amber-100 text-amber-600",
    "Final Interview": "bg-teal-100 text-teal-600",
    "Oath Taking": "bg-emerald-100 text-emerald-600",
  };

  const [applicantInfo, setApplicantInfo] = useState([]);
  const [open, setOpen] = useState(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [applicantToConfirm, setApplicantToConfirm] = useState(null);
  const [confirmNotRecoModalOpen, setConfirmNotRecoModalOpen] = useState(false);
  const [applicantToNotReco, setApplicantToNotReco] = useState(null);
  const [confirmMedicalModal, setConfirmMedicalModal] = useState(false);
  const [medicalApplicantToConfirm, setMedicalApplicantToConfirm] = useState(null);
  const [medicalIsPassed, setMedicalIsPassed] = useState(true);
  const scrollRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  // Pagination for performance
  const [visibleCount, setVisibleCount] = useState(30);
  useEffect(() => {
    setVisibleCount(30); // Reset visible count when filters change
  }, [statusFilter, searchTerm, provinceFilter, sortBy]);

  // Dashboard scroll state
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showScrollBottom, setShowScrollBottom] = useState(true);
  const scrollAnimationRef = useRef(null);

  const getScrollContainer = () => {
    const dashboardContainer = pageRef.current?.closest(".main-content");
    if (
      dashboardContainer &&
      dashboardContainer.scrollHeight > dashboardContainer.clientHeight
    ) {
      return dashboardContainer;
    }

    return document.scrollingElement || document.documentElement;
  };

  useEffect(() => {
    const scrollContainer = getScrollContainer();
    const handleScroll = () => {
      const scrollTop = scrollContainer.scrollTop;
      const viewportHeight = scrollContainer.clientHeight;
      const contentHeight = scrollContainer.scrollHeight;
      const maxScrollTop = Math.max(contentHeight - viewportHeight, 0);

      setShowScrollTop(scrollTop > 200);
      setShowScrollBottom(
        maxScrollTop === 0 || scrollTop < maxScrollTop - 2,
      );
    };

    scrollContainer.addEventListener("scroll", handleScroll);
    // Initial check
    handleScroll();

    return () => scrollContainer.removeEventListener("scroll", handleScroll);
  }, [applicantInfo, searchTerm, statusFilter]);

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(Math.ceil(scrollLeft + clientWidth) < scrollWidth);
    }
  };

  const animateScrollTo = (scrollContainer, targetTop) => {
    if (scrollAnimationRef.current) {
      cancelAnimationFrame(scrollAnimationRef.current);
    }

    const startTop = scrollContainer.scrollTop;
    const distance = targetTop - startTop;
    const duration = Math.min(900, Math.max(450, Math.abs(distance) * 0.6));
    const startTime = performance.now();

    const animate = (currentTime) => {
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 3);

      scrollContainer.scrollTop = startTop + distance * easedProgress;

      if (progress < 1) {
        scrollAnimationRef.current = requestAnimationFrame(animate);
      } else {
        scrollAnimationRef.current = null;
      }
    };

    scrollAnimationRef.current = requestAnimationFrame(animate);
  };

  const scrollToBottom = () => {
    const scrollContainer = getScrollContainer();
    setShowScrollTop(true);
    setShowScrollBottom(false);
    animateScrollTo(
      scrollContainer,
      scrollContainer.scrollHeight - scrollContainer.clientHeight,
    );
  };

  const scrollToTop = () => {
    const scrollContainer = getScrollContainer();
    setShowScrollTop(false);
    setShowScrollBottom(true);
    animateScrollTo(scrollContainer, 0);
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
        "Complete Background Investigation",
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
    "Complete Background Investigation": (
      <HiOutlineClipboardCheck
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
      const serverError = err.response?.data?.error || err.response?.data?.detail || err.message;
      setScheduleMessageConfig({
        isOpen: true,
        type: "error",
        message: `Failed to assign schedule. Error: ${serverError}`,
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

    const selectableIds = new Set(
      filteredAndSorted
        .filter((app) => isEvaluated(app))
        .map((app) => app.id),
    );
    const idsToSchedule = selectedIds.filter((id) => selectableIds.has(id));
    if (idsToSchedule.length === 0) {
      setSelectedIds([]);
      setScheduleMessageConfig({
        isOpen: true,
        type: "error",
        message: "Only evaluated applicants can be scheduled for the next step.",
      });
      return;
    }

    let nextStatus = null;
    if (statusFilter === "Qualified") nextStatus = "Body Mass Index";
    else if (statusFilter === "Body Mass Index") nextStatus = "Physical Agility Test";
    else if (statusFilter === "Physical Agility Test") nextStatus = "Neuro Examination";
    else if (statusFilter === "Drug Test") nextStatus = "Complete Background Investigation";
    else if (statusFilter === "Complete Background Investigation") nextStatus = "Final Interview";

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
        idsToSchedule.map((id) =>
          api.put(`users/update_status/${id}/`, dataToSend),
        ),
      );

      setScheduleMessageConfig({
        isOpen: true,
        type: "success",
        message: `Scheduled ${idsToSchedule.length} applicant(s) for ${scheduleDate} ${scheduleTime ? `@ ${scheduleTime}` : ""} successfully.`,
      });
      setIsSelectionMode(false);
      if (nextStatus) {
        setStatusFilter(nextStatus);
      }
      fetchInfo(true);
    } catch (err) {
      console.error("Failed to update schedules:", err);
      const serverError = err.response?.data?.error || err.response?.data?.detail || err.message;
      setScheduleMessageConfig({
        isOpen: true,
        type: "error",
        message: `Failed to assign schedules. Error: ${serverError}`,
      });
    } finally {
      setIsSavingSchedule(false);
    }
  };

  const handleUpdateRecommendation = async (applicant, isRecommended) => {
    try {
      const dataToSend = {};
      
      if (statusFilter === "Physical Agility Test") {
        dataToSend.pat_pushups_passed = isRecommended;
        dataToSend.pat_situps_passed = isRecommended;
        dataToSend.pat_run_passed = isRecommended;
        dataToSend.is_pat_evaluated = true;
        
        if (!isRecommended) {
          dataToSend.status = "Failed";
          dataToSend.rejection_reason = "Failed Physical Agility Test requirements.";
        }
      } else if (statusFilter === "Neuro Examination") {
        if (isRecommended) {
          dataToSend.status = "Medical";
          dataToSend.psychological_result = "Passed (Recommended)";
        } else {
          dataToSend.status = "Failed";
          dataToSend.rejection_reason = "Failed Neuro Examination.";
        }
      } else if (statusFilter === "Medical") {
        if (isRecommended) {
          dataToSend.status = "Drug Test";
          dataToSend.medical_result = "Passed";
        } else {
          dataToSend.status = "Failed";
          dataToSend.rejection_reason = "Failed Medical Examination.";
          dataToSend.medical_result = "Failed";
        }
      }
      
      await api.put(`users/update_status/${applicant.id}/`, dataToSend);
      const actionLabel = statusFilter === "Medical"
        ? (isRecommended ? "Passed" : "Failed")
        : (isRecommended ? "Recommended" : "Not Recommended");
      setScheduleMessageConfig({
        isOpen: true,
        type: "success",
        message: `Applicant successfully marked as ${actionLabel}.`,
      });
      setOpen(null);
      fetchInfo(true);
    } catch (err) {
      console.error("Failed to update recommendation:", err);
      setScheduleMessageConfig({
        isOpen: true,
        type: "error",
        message: "Failed to update recommendation. Please try again.",
      });
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const selectableApplicants = filteredAndSorted.filter(
        (app) => isEvaluated(app),
      );
      let limit = selectableApplicants.length;
      if (selectionLimit !== "All") {
        limit = parseInt(selectionLimit, 10);
      }
      setSelectedIds(
        selectableApplicants.slice(0, limit).map((app) => app.id),
      );
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id) => {
    const applicant = filteredAndSorted.find((app) => app.id === id);
    if (!applicant || !isEvaluated(applicant)) return;

    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const fetchInfo = async (isSilent = false) => {
    !isSilent && setLoading(true);
    try {
      const [response, failedResponse] = await Promise.all([
        api.get("users/applicants/all/"),
        api.get("users/applicants/failed/")
      ]);
      
      // Filter out the old failed applicants from the main list
      let activeApps = response.data.filter(app => app.status !== "Failed");
      
      // Map the new FailedApplicant records into the expected Applicant structure
      let failedApps = failedResponse.data.map(failed => ({
          ...failed.applicant_details,
          status: "Failed",
          rejection_reason: failed.reason,
          failed_stage: failed.failed_stage,
          failed_at: failed.failed_at
      }));
      
      setApplicantInfo([...activeApps, ...failedApps]);
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
    if (statusFilter === "Qualified") return applicant.is_qualified_evaluated === true;
    if (statusFilter === "Final Interview") return applicant.evaluation_final_interview != null;
    if (statusFilter === "Body Mass Index") return applicant.is_bmi_evaluated === true;
    if (statusFilter === "Physical Agility Test") return applicant.is_pat_evaluated === true;
    if (statusFilter === "Drug Test") return applicant.drug_test_result != null;
    if (statusFilter === "Complete Background Investigation") return true;
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
        if (sortBy === "attrition" && (applicant.quota_type || "").toLowerCase() !== "attrition")
          return false;
        if (sortBy === "regular" && (applicant.quota_type || "").toLowerCase() === "attrition")
          return false;

        const fullName =
          `${applicant.firstname} ${applicant.lastname} ${applicant.middle_initial || ""}`.toLowerCase();
        const matchesSearch = fullName.includes(searchTerm.toLowerCase());
        const matchesStatus =
          statusFilter === "All" || applicant.status === statusFilter;
        const normalizedProvince = (applicant.address?.province || "").trim().replace(/\b\w/g, c => c.toUpperCase());
        const matchesProvince =
          provinceFilter === "All" || normalizedProvince === provinceFilter;
        return matchesSearch && matchesStatus && matchesProvince;
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
        } else if (sortBy === "attrition") {
          const isA = (a.quota_type || "").toLowerCase() === 'attrition';
          const isB = (b.quota_type || "").toLowerCase() === 'attrition';
          if (isA && !isB) return -1;
          if (!isA && isB) return 1;
          return 0;
        } else if (sortBy === "regular") {
          const isA = (a.quota_type || "").toLowerCase() !== 'attrition';
          const isB = (b.quota_type || "").toLowerCase() !== 'attrition';
          if (isA && !isB) return -1;
          if (!isA && isB) return 1;
          return 0;
        }
        return 0;
      });
  }, [applicantInfo, searchTerm, statusFilter, sortBy, provinceFilter]);

  const handleExportExcel = () => {
    const dataForExport = applicantInfo.filter((applicant) => {
      const fullName =
        `${applicant.firstname} ${applicant.lastname} ${applicant.middle_initial || ""}`.toLowerCase();
      const matchesSearch = fullName.includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "All" || applicant.status === statusFilter;
      const normalizedProvince = (applicant.address?.province || "").trim().replace(/\b\w/g, c => c.toUpperCase());
      const matchesProvince =
        provinceFilter === "All" || normalizedProvince === provinceFilter;
      return matchesSearch && matchesStatus && matchesProvince;
    });

    const exportData = dataForExport.map((applicant) => {
      if (statusFilter === "Final Interview") {
        return {
          "First Name": applicant.firstname,
          "Last Name": applicant.lastname,
          "Middle Name": applicant.middle_name || "N/A",
          "Barangay": applicant.address?.barangay || "N/A",
          "Type of Quota": applicant.quota_type || "N/A",
          "Municipality": applicant.address?.city_municipality || "N/A",
          ...((applicant.criteria_scores || []).reduce((acc, scoreObj) => {
            acc[scoreObj.criterion_name || `Criterion ${scoreObj.criterion}`] = scoreObj.score;
            return acc;
          }, {})),
          "Total Score (%)": applicant.evaluation_final_interview !== null ? applicant.evaluation_final_interview : "N/A",
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
        "Permanent Address": applicant.address?.full_address || "N/A",
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
        "BMI Result": applicant.evaluation_bmi || "N/A",
        "PAT Score (%)": applicant.evaluation_pat || "N/A",
        "Final Interview Score (%)": applicant.evaluation_final_interview || "N/A",
        ...((applicant.criteria_scores || []).reduce((acc, scoreObj) => {
          let value = scoreObj.score !== null ? scoreObj.score : scoreObj.text_value;
          if (scoreObj.boolean_value !== null) {
            value = `${value || ""} (${scoreObj.boolean_value ? 'PASSED' : 'FAILED'})`.trim();
          }
          acc[scoreObj.criterion_name || `Criterion ${scoreObj.criterion}`] = value || "N/A";
          return acc;
        }, {})),
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
    <div ref={pageRef}>
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
            <option value="attrition">Sort by Attrition</option>
            <option value="regular">Sort by Regular</option>
          </select>

          <select
            value={provinceFilter}
            onChange={(e) => setProvinceFilter(e.target.value)}
            className="sort-select"
          >
            <option value="All">All Provinces</option>
            {[...new Set(
              applicantInfo
                .map(app => app.address?.province)
                .filter(Boolean)
                .map(p => p.trim().replace(/\b\w/g, c => c.toUpperCase()))
            )].sort().map(prov => (
              <option key={prov} value={prov}>{prov}</option>
            ))}
          </select>

          {["Qualified", "Body Mass Index", "Physical Agility Test", "Complete Background Investigation"].includes(statusFilter) && (
            <select
              value={selectionLimit}
              onChange={(e) => setSelectionLimit(e.target.value)}
              className="sort-select"
            >
              <option value="All">Applicant Limit: All</option>
              <option value="300">Applicant Limit: 300</option>
              <option value="400">Applicant Limit: 400</option>
              <option value="500">Applicant Limit: 500</option>
            </select>
          )}

          {(["Qualified", "Body Mass Index", "Physical Agility Test", "Complete Background Investigation"].includes(statusFilter) ||
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
                        : statusFilter === "Drug Test"
                          ? "CBI Date:"
                          : statusFilter === "Complete Background Investigation"
                            ? "Final Interview Date:"
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
                      .filter(
                        (app) =>
                          isEvaluated(app) &&
                          app.scheduled_date === scheduleDate,
                      )
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
                          filteredAndSorted.some((app) => isEvaluated(app)) &&
                          selectedIds.length > 0 &&
                          selectedIds.length ===
                            Math.min(
                              filteredAndSorted.filter((app) => isEvaluated(app)).length,
                              selectionLimit === "All"
                                ? Infinity
                                : parseInt(selectionLimit, 10),
                            )
                        }
                        disabled={filteredAndSorted.every((app) => !isEvaluated(app))}
                        onChange={handleSelectAll}
                        className="w-4 h-4 accent-[#2C2D86] cursor-pointer align-middle disabled:cursor-not-allowed disabled:opacity-40"
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
                <th scope="col" className="th text-center">
                  Quota
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
                filteredAndSorted.slice(0, visibleCount).map((applicant) => (
                  <tr
                    key={applicant.id}
                    className="hover:bg-gray-50 transition-colors text-center"
                  >
                    {isSelectionMode && (
                      <td className="w-12 text-center">
                        <input
                          type="checkbox"
                          checked={
                            isEvaluated(applicant) &&
                            selectedIds.includes(applicant.id)
                          }
                          disabled={!isEvaluated(applicant)}
                          onChange={() => handleSelectOne(applicant.id)}
                          className="w-4 h-4 accent-[#2C2D86] cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
                          title={
                            isEvaluated(applicant)
                              ? "Select for next step"
                              : "Evaluation required before scheduling"
                          }
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
                    <td>{applicant.address?.full_address || "N/A"}</td>
                    {/* <td>{applicant.name_of_school}</td> */}
                    <td>{applicant.date_graduated}</td>

                    <td>{applicant.created_at}</td>
                    <td className="font-bold text-[#2C2D86] text-center">
                      B{applicant.batch || 1}
                    </td>
                    <td className="text-center font-medium">
                      {!applicant.quota_type || applicant.quota_type === "N/A" ? (
                        <span className="bg-gray-100 text-gray-500 px-3 py-1 rounded-full text-xs font-semibold">N/A</span>
                      ) : applicant.quota_type.toLowerCase() === 'attrition' ? (
                        <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-xs font-semibold">Attrition</span>
                      ) : (
                        <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-xs font-semibold">Regular</span>
                      )}
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
                          <div className="absolute top-full right-0 mt-2 z-[9999] w-45 bg-white shadow-lg border border-gray-100 rounded-md actions">
                            <ul className="flex flex-col text-[14px] gap-[5px]">
                              <h1 className="font-bold text-black border-b pb-1 border-gray-200 action-title">
                                Actions
                              </h1>
                              {(statusFilter === "Physical Agility Test" && isEvaluated(applicant)) || statusFilter === "Neuro Examination" ? (
                                <>
                                  <button
                                    onClick={() => {
                                      setApplicantToConfirm(applicant);
                                      setConfirmModalOpen(true);
                                      setOpen(null);
                                    }}
                                    className="text-left px-2 py-1 cursor-pointer view-details-btn-action text-[#2C2D86] hover:bg-[#2C2D86]/10"
                                  >
                                    Recommended
                                  </button>
                                  <button
                                    onClick={() => {
                                      setApplicantToNotReco(applicant);
                                      setConfirmNotRecoModalOpen(true);
                                      setOpen(null);
                                    }}
                                    className="text-left px-2 py-1 cursor-pointer view-details-btn-action not-recommended-btn text-red-600 whitespace-nowrap"
                                  >
                                    Not Recommended
                                  </button>
                                </>
                              ) : statusFilter === "Medical" ? (
                                <>
                                  <button
                                    onClick={() => {
                                      setMedicalApplicantToConfirm(applicant);
                                      setMedicalIsPassed(true);
                                      setConfirmMedicalModal(true);
                                      setOpen(null);
                                    }}
                                    className="text-left px-2 py-1 cursor-pointer view-details-btn-action text-[#2C2D86] hover:bg-[#2C2D86]/10"
                                  >
                                    Passed
                                  </button>
                                  <button
                                    onClick={() => {
                                      setMedicalApplicantToConfirm(applicant);
                                      setMedicalIsPassed(false);
                                      setConfirmMedicalModal(true);
                                      setOpen(null);
                                    }}
                                    className="text-left px-2 py-1 cursor-pointer view-details-btn-action not-recommended-btn text-red-600 whitespace-nowrap"
                                  >
                                    Failed
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    onClick={() => navigate(`../view-details/${applicant.id}`)}
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
                                </>
                              )}
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
          
          {filteredAndSorted.length > visibleCount && (
            <div className="flex justify-center p-4 bg-gray-50 border-t border-gray-200">
              <button
                onClick={() => setVisibleCount(prev => prev + 30)}
                className="px-6 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-md shadow-sm hover:bg-gray-50 focus:outline-none transition-colors"
              >
                Load More ({filteredAndSorted.length - visibleCount} remaining)
              </button>
            </div>
          )}
        </div>
      </div>

      {scheduleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-500/20">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-500/20 p-4">
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

      {/* Floating Scroll Buttons */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
        <button
          onClick={scrollToTop}
          className={`p-3 bg-[#2C2D86] text-white rounded-full shadow-lg hover:bg-blue-800 focus:outline-none transition-all duration-300 ease-in-out transform ${
            showScrollTop
              ? "opacity-100 translate-y-0 pointer-events-auto"
              : "opacity-0 translate-y-4 pointer-events-none"
          }`}
          title="Scroll to Top"
        >
          <HiArrowUp size={24} />
        </button>

        <button
          onClick={scrollToBottom}
          className={`p-3 bg-[#2C2D86] text-white rounded-full shadow-lg hover:bg-blue-800 focus:outline-none transition-all duration-300 ease-in-out transform ${
            showScrollBottom
              ? "opacity-100 translate-y-0 pointer-events-auto"
              : "opacity-0 translate-y-4 pointer-events-none"
          }`}
          title="Scroll to Bottom"
        >
          <HiArrowDown size={24} />
        </button>
      </div>

      {confirmModalOpen && <ConfirmRecoModal setConfirmModalOpen={setConfirmModalOpen} applicantToConfirm={applicantToConfirm} handleUpdateRecommendation={handleUpdateRecommendation} />}

      {confirmNotRecoModalOpen && (
        <div>
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40">
            <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl border border-gray-100 transform transition-all">
              <h3 className="text-xl font-bold text-gray-900 mb-3 border-b border-gray-100 pb-3">
                Mark {applicantToNotReco?.firstname} {applicantToNotReco?.lastname} as Not Recommended?
              </h3>
              <p className="text-[15px] text-gray-600 mb-8 leading-relaxed">
                Marking this applicant as <span className="font-semibold text-red-600 bg-red-50 px-1.5 py-0.5 rounded">Not Recommended</span> will move them to the <span className="font-semibold">Failed</span> stage.
              </p>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setConfirmNotRecoModalOpen(false)}
                  className="px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 active:scale-95 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    handleUpdateRecommendation(applicantToNotReco, false);
                    setConfirmNotRecoModalOpen(false);
                  }}
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold cursor-pointer transition-all active:scale-95 shadow-md shadow-red-900/20"
                >
                  Not Recommend Applicant
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {confirmMedicalModal && (
        <ConfirmMedicalModal
          setConfirmMedicalModal={setConfirmMedicalModal}
          applicantToConfirm={medicalApplicantToConfirm}
          isPassed={medicalIsPassed}
          handleUpdateRecommendation={handleUpdateRecommendation}
        />
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