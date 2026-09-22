import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { HiArrowNarrowLeft, HiOutlineCloudUpload, HiX } from "react-icons/hi";
import { api } from "../../../api/api";
import ApplicationLocked from "../../Modals/ApplicationLocked";
import ConfirmDocs from "../../Modals/ConfirmDocs";
import ErrorModal from "../../Modals/ErrorModal";
// --- CONFIGURATION SCHEMA ---
const DOC_SECTIONS = [
  {
    title: "Attrition Requirement",
    subtitle: "Required document for Attrition quota applicants:",
    gridCols: "md:grid-cols-2",
    quotaFilter: "Attrition",
    items: [
      {
        key: "attritionDoc",
        label: "Attrition Certificate / Endorsement (PDF)",
        backendType: "ATTRITION_DOC",
        required: true,
      },
    ],
  },
  {
    title: "Identity Documents",
    gridCols: "md:grid-cols-2",
    items: [
      {
        key: "birthCert",
        label: "Birth Certificate",
        backendType: "BIRTH_CERT",
        required: true,
      },
    ],
  },
  {
    title: "Scholastic Records",
    gridCols: "md:grid-cols-2",
    items: [
      {
        key: "otr",
        label: "Official Transcript of Records (OTR)",
        backendType: "OTR",
        required: true,
      },
      {
        key: "diploma",
        label: "Diploma",
        backendType: "DIPLOMA",
        required: true,
      },
    ],
  },
  {
    title: "Government Clearances",
    gridCols: "md:grid-cols-2",
    items: [
      {
        key: "barangayClearance",
        label: "Barangay Clearance",
        backendType: "BRGY_CLEARANCE",
        required: true,
      },
      {
        key: "policeClearance",
        label: "National Police Clearance",
        backendType: "POLICE_CLEARANCE",
        required: true,
      },
      {
        key: "prosecutorClearance",
        label: "Prosecutor's Clearance",
        backendType: "PROS_CLEARANCE",
        required: true,
      },
      {
        key: "nbiClearance",
        label: "NBI Clearance",
        backendType: "NBI_CLEARANCE",
        required: true,
      },
    ],
  },
  {
    title: "Career & Civil Service Eligibilities",
    subtitle:
      "Upload at least one item below that matches your qualifications:",
    gridCols: "md:grid-cols-2",
    items: [
      {
        key: "prc",
        label: "PRC License",
        backendType: "PRC",
        required: false,
        group: "eligibility",
      },
      {
        key: "napolcom",
        label: "Napolcom Entrance Rating",
        backendType: "NAPOLCOM",
        required: false,
        group: "eligibility",
      },
      {
        key: "pd907",
        label: "PD907 (Honor Graduate)",
        backendType: "PD907",
        required: false,
        group: "eligibility",
      },
      {
        key: "csProf",
        label: "CS Professional Eligibility",
        backendType: "CS_PROF",
        required: false,
        group: "eligibility",
      },
    ],
  },
];

const ALL_DOC_CONFIGS = DOC_SECTIONS.flatMap((s) => s.items);

// --- INDEXEDDB STORAGE HELPERS ---
const dbStorage = {
  async getDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open("DocumentStore", 1);
      request.onupgradeneeded = (e) =>
        e.target.result.createObjectStore("files");
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },
  async get(key) {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const req = db
        .transaction("files", "readonly")
        .objectStore("files")
        .get(key);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  },
  async set(key, val) {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const req = db
        .transaction("files", "readwrite")
        .objectStore("files")
        .put(val, key);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  },
  async del(key) {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const req = db
        .transaction("files", "readwrite")
        .objectStore("files")
        .delete(key);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  },
};

// --- SUB-COMPONENT: OUTSIDE TO PREVENT RE-RENDER LOOPS ---
const SingleUploadBox = React.memo(
  ({ label, docKey, file, isOptional, disabled, onUpload, onRemove }) => {
    const [previewUrl, setPreviewUrl] = useState(null);

    useEffect(() => {
      if (!file) {
        setPreviewUrl(null);
        return;
      }
      if (file.isExisting) {
        setPreviewUrl(file.file_url);
        return;
      }

      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);

      return () => URL.revokeObjectURL(objectUrl);
    }, [file]);

    return (
      <div className="bg-white border border-gray-300 rounded-lg p-4 transition duration-200 hover:border-gray-400 flex flex-col justify-between min-h-[100px]">
        <div className="flex justify-between items-start gap-2 mb-2">
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
              {label}{" "}
              {!isOptional && <span className="text-red-500 ml-0.5">*</span>}
            </span>
            <span className="text-[11px] text-gray-400 mt-0.5">
              PDF format required
            </span>
          </div>
        </div>

        <div className="mt-auto">
          {!file ? (
            <label className="flex items-center justify-center gap-2 w-full py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg text-xs font-semibold cursor-pointer transition border border-gray-200 focus-within:ring-2 focus-within:ring-[#2C2D86]">
              <HiOutlineCloudUpload size={16} className="text-gray-500" />
              <span>Upload Document</span>
              <input
                type="file"
                accept="application/pdf"
                disabled={disabled}
                onChange={(e) => onUpload(e.target.files?.[0], docKey)}
                className="hidden"
              />
            </label>
          ) : (
            <div className="flex flex-col gap-3 w-full">
              <div className="flex items-center justify-between bg-green-50 border border-green-200 px-3 py-2 rounded-lg w-full">
                <span className="text-xs font-medium text-green-700 truncate max-w-[150px]">
                  ✓ {file.name}
                </span>
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => onRemove(docKey)}
                  className="text-gray-400 hover:text-red-500 transition-colors p-0.5 rounded"
                >
                  <HiX size={14} />
                </button>
              </div>
              {previewUrl && (
                <iframe
                  src={`${previewUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                  title={`${label} Preview`}
                  className="w-full h-48 border border-gray-200 rounded-lg pointer-events-none"
                />
              )}
            </div>
          )}
        </div>
      </div>
    );
  },
);

// --- MAIN CONTAINER ---
export default function DocumentSubmission({ isApplicationOpen }) {
  const location = useLocation();
  const navigate = useNavigate();

  const formData = useMemo(
    () =>
      location.state?.formData ||
      JSON.parse(localStorage.getItem("applicationFormData") || "{}"),
    [location.state],
  );

  const isFirstRender = useRef(true);

  const cacheKey = useMemo(() => {
    const email = formData.email?.trim().toLowerCase();
    return email ? `docs_${email}` : "docs_anonymous";
  }, [formData.email]);

  const [documents, setDocuments] = useState(() => {
    const defaults = {};
    ALL_DOC_CONFIGS.forEach((item) => {
      defaults[item.key] = null;
    });

    if (formData.documents) {
      const typeMap = Object.fromEntries(
        ALL_DOC_CONFIGS.map((c) => [c.backendType, c.key]),
      );
      formData.documents.forEach((doc) => {
        const key = typeMap[doc.document_type];
        if (key && doc.file_url) {
          defaults[key] = {
            name: doc.file
              ? doc.file.split("/").pop()
              : "Previous Document.pdf",
            file_url: doc.file_url,
            isExisting: true,
            id: doc.id,
          };
        }
      });
    }
    return defaults;
  });

  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  // Restore cache if state is empty
  useEffect(() => {
    const isFormEmpty =
      !formData.email && !formData.firstname && !formData.lastname;
    if (isFormEmpty) return;

    // Clean up the old unscoped cache if it exists, just in case
    dbStorage.del("docs").catch(() => {});

    dbStorage
      .get(cacheKey)
      .then((cached) => {
        if (cached) {
          setDocuments(cached);
        }
      })
      .catch(console.error);
  }, [cacheKey]);

  // Persist documents locally
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const isFormEmpty =
      !formData.email && !formData.firstname && !formData.lastname;
    if (isFormEmpty) return;

    const hasFiles = Object.values(documents).some(Boolean);
    if (hasFiles) {
      dbStorage.set(cacheKey, documents).catch(console.error);
    } else {
      dbStorage.del(cacheKey).catch(console.error);
    }
  }, [documents, cacheKey]);

  const handleFileChange = useCallback((file, documentKey) => {
    if (!file) return;
    setDocuments((prev) => ({ ...prev, [documentKey]: file }));
  }, []);

  const handleRemoveFile = useCallback((documentKey) => {
    setDocuments((prev) => ({ ...prev, [documentKey]: null }));

    try {
      const saved = localStorage.getItem("applicationFormData");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.documents) {
          const cfg = ALL_DOC_CONFIGS.find((c) => c.key === documentKey);
          if (cfg) {
            parsed.documents = parsed.documents.filter(
              (doc) => doc.document_type !== cfg.backendType,
            );
            localStorage.setItem("applicationFormData", JSON.stringify(parsed));
          }
        }
      }
    } catch (err) {
      console.error("Error updating localStorage documents:", err);
    }
  }, []);

  const activeDocSections = useMemo(() => {
    let quotaTypeVal = formData.quota_type;
    if (!quotaTypeVal) {
      try {
        const saved = localStorage.getItem("applicationFormData");
        if (saved) {
          quotaTypeVal = JSON.parse(saved).quota_type;
        }
      } catch (e) {}
    }
    const targetQuota = (quotaTypeVal || "").toLowerCase();
    return DOC_SECTIONS.filter((section) => {
      if (section.quotaFilter) {
        return targetQuota.includes(section.quotaFilter.toLowerCase());
      }
      return true;
    });
  }, [formData.quota_type]);

  const activeDocConfigs = useMemo(() => {
    return activeDocSections.flatMap((s) => s.items);
  }, [activeDocSections]);

  const isFormValid = useMemo(() => {
    const requiredSatisfied = activeDocConfigs
      .filter((c) => c.required)
      .every((c) => Boolean(documents[c.key]));

    const eligibilitySatisfied = activeDocConfigs
      .filter((c) => c.group === "eligibility")
      .some((c) => Boolean(documents[c.key]));

    return requiredSatisfied && eligibilitySatisfied;
  }, [documents, activeDocConfigs]);

  const handleOpenConfirmModal = (e) => {
    e.preventDefault();
    setIsConfirmModalOpen(true);
  };

  const submitApplication = async () => {
    setIsConfirmModalOpen(false);
    setErrorMessage("");
    setLoading(true);

    try {
      const payload = {
        ...formData,
        date_graduated: formData.date_graduated
          ? new Date(formData.date_graduated).toISOString().split("T")[0]
          : null,
        address: {
          barangay: formData.barangay,
          city_municipality: formData.city_municipality,
          province: formData.province,
          zip_code: formData.zip_code
        }
      };

      const { data } = formData.tracking_code
        ? await api.patch(
            `users/applications/${formData.tracking_code}/reapply/`,
            payload,
          )
        : await api.post("users/register_applicant_info/", payload);

      const applicantId = data.id;
      const code = data.tracking_code;

      const uploadQueue = activeDocConfigs
        .filter(
          (cfg) => documents[cfg.key] && !documents[cfg.key]?.isExisting,
        )
        .map((cfg) => {
          const body = new FormData();
          body.append("applicant", applicantId);
          body.append("document_type", cfg.backendType);
          body.append("file", documents[cfg.key]);

          return api.post("users/upload-document/", body, {
            headers: { "Content-Type": "multipart/form-data" },
          });
        });

      if (uploadQueue.length > 0) {
        await Promise.all(uploadQueue);
      }

      localStorage.removeItem("applicationFormData");
      await dbStorage.del(cacheKey).catch(console.error);

      navigate("../success-submit", {
        state: { trackingCode: code, isReapply: !!formData.tracking_code },
        relative: "path",
      });
    } catch (err) {
      let errData = err?.response?.data;
      let msg = "Submission failed.";

      if (typeof errData === "string") {
        try {
          errData = JSON.parse(errData);
        } catch (e) {
          // Ignore parse errors
        }
      }
      
      if (typeof errData === "object" && errData !== null) {
        if (errData.error) {
          msg = errData.error;
        } else if (errData.detail) {
          msg = errData.detail;
        } else {
          const messages = [];
          Object.values(errData).forEach(val => {
            if (Array.isArray(val)) {
              messages.push(...val);
            } else if (typeof val === "string") {
              messages.push(val);
            }
          });
          if (messages.length > 0) {
            msg = messages.join(" ");
          } else {
            msg = "Please fill out the form completely before submitting.";
          }
        }
      } else if (errData && typeof errData === "string") {
        msg = errData;
      }
      
      // Replace the specific backend string as you originally requested
      if (msg === "Email, Contact number, Pag-IBIG number, and PhilHealth ID are required.") {
        msg = "Please fill out the form completely before submitting.";
      }
      
      setErrorMessage(msg);
      setErrorModalOpen(true);
    } finally {
      setLoading(false);
    }
  };

  if (isApplicationOpen === false) {
    return (
      <ApplicationLocked />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pt-28 pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white p-6 md:p-8 rounded-xl shadow-md space-y-8 w-full">
        <div className="border-b border-gray-200 pb-4 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 cursor-pointer mb-3 text-sm font-semibold text-[#2C2D86] hover:text-[#1f2063]"
            >
              <HiArrowNarrowLeft size={18} />
              <span>Back to Form</span>
            </button>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              Document Submission
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Please upload each specified requirement below.
            </p>
          </div>
          <div className="text-xs font-semibold text-red-500 bg-red-50 border border-red-200 px-3 py-1 rounded-md">
            * Indicates required document
          </div>
        </div>

        <form onSubmit={handleOpenConfirmModal} className="space-y-8">
          {activeDocSections.map((section, idx) => (
            <div key={idx} className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-800 border-l-4 border-[#2C2D86] pl-2">
                  {section.title}
                </h2>
                {section.subtitle && (
                  <p className="text-xs text-gray-400 mt-1 pl-3.5">
                    {section.subtitle}
                  </p>
                )}
              </div>

              <div className={`grid grid-cols-1 ${section.gridCols} gap-4`}>
                {section.items.map((item) => (
                  <SingleUploadBox
                    key={item.key}
                    label={item.label}
                    docKey={item.key}
                    file={documents[item.key]}
                    isOptional={!item.required}
                    disabled={loading}
                    onUpload={handleFileChange}
                    onRemove={handleRemoveFile}
                  />
                ))}
              </div>
            </div>
          ))}

          <div className="pt-6 border-t border-gray-200 flex justify-center md:justify-end">
            <button
              type="submit"
              disabled={loading || !isFormValid}
              className={`w-full md:w-[240px] h-11 rounded-lg bg-[#2C2D86] text-white font-bold text-sm tracking-wide shadow-md transition-all duration-200 ${
                loading || !isFormValid
                  ? "opacity-50 cursor-not-allowed bg-gray-400"
                  : "hover:bg-[#1f2063] active:scale-95 cursor-pointer"
              }`}
            >
              {loading
                ? "Uploading Application Files..."
                : "Submit Application"}
            </button>
          </div>
        </form>
      </div>
      <ConfirmDocs 
        isOpen={isConfirmModalOpen} 
        onConfirm={submitApplication} 
        onCancel={() => setIsConfirmModalOpen(false)} 
      />
      <ErrorModal
        isOpen={errorModalOpen}
        errorMessage={errorMessage}
        onClose={() => setErrorModalOpen(false)}
      />
    </div>
  );
}
