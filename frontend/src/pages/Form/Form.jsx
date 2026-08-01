import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../../api/api";
import MessageModal from "../../Modals/MessageModal";
import ApplicationTypeModal from "../../Modals/ApplicationTypeModal";
import "./FormCss.css";

function Form() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    lastname: "",
    firstname: "",
    middle_name: "",
    birthdate: "",
    street: "",
    barangay: "",
    city_municipality: "",
    province: "",
    zip_code: "",
    gender: "",
    cp_number: "",
    program: "",
    name_of_school: "",
    date_graduated: "",
    email: "",
    latin_honor: "",
    pag_ibig_number: "",
    phil_health_id_num: "",
    height: "",
    tribe_affiliated: "",
    tracking_code: "",
  });
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTypeModalOpen, setIsTypeModalOpen] = useState(() => {
    let shouldOpen = true;
    try {
      const navEntries = window.performance.getEntriesByType("navigation");
      const isReload = navEntries.length > 0 && navEntries[0].type === "reload";

      const savedFormData = localStorage.getItem("applicationFormData");
      if (savedFormData) {
        const parsed = JSON.parse(savedFormData);
        const fName = String(parsed.firstname || "").trim();
        const lName = String(parsed.lastname || "").trim();
        const email = String(parsed.email || "").trim();
        const tc = String(parsed.tracking_code || "").trim();
        
        if (fName.length > 0 || lName.length > 0 || email.length > 0 || tc.length > 0) {
          shouldOpen = false;
        }
      }
    } catch (e) {
      // fallback to true
    }
    return shouldOpen;
  });

  // Load saved form data from localStorage on mount
  useEffect(() => {
    const savedFormData = localStorage.getItem("applicationFormData");
    if (savedFormData) {
      try {
        const parsed = JSON.parse(savedFormData);
        const numericFields = [
          "cp_number",
          "pag_ibig_number",
          "phil_health_id_num",
        ];
        numericFields.forEach((f) => {
          if (parsed[f] !== undefined && parsed[f] !== null) {
            parsed[f] = parsed[f].toString().replace(/\D/g, "");
          } else {
            parsed[f] = "";
          }
        });
        setFormData(parsed);
      } catch (err) {
        console.error("Error loading saved form data:", err);
      }
    }
  }, []);

  const handleChange = (e) => {
    const name = e.target.name;
    let value = e.target.value;

    const numericFields = [
      "cp_number",
      "pag_ibig_number",
      "phil_health_id_num",
    ];
    if (numericFields.includes(name)) {
      const digits = value.toString().replace(/\D/g, "");
      const maxLength = name === "cp_number" ? 11 : 12;
      if (digits.length > maxLength) {
        return;
      }
      value = digits;
    }

    const updatedData = { ...formData, [name]: value };
    setFormData(updatedData);
    localStorage.setItem("applicationFormData", JSON.stringify(updatedData));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isFormValid) {
      setErrorMessage("Please fill in all required fields before proceeding.");
      setIsErrorModalOpen(true);
      return;
    }

    setIsLoading(true);
    try {
      const cpDigits = (formData.cp_number || "").toString().replace(/\D/g, "");
      if (cpDigits.length !== 11) {
        setErrorMessage("CP number must be exactly 11 digits.");
        setIsErrorModalOpen(true);
        setIsLoading(false);
        return;
      }

      if (formData.birthdate) {
        const birthDate = new Date(formData.birthdate);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        
        if (age < 21 || age > 30) {
          setErrorMessage(`Applicant age must be between 21 and 30 years old (Current Age: ${age}).`);
          setIsErrorModalOpen(true);
          setIsLoading(false);
          return;
        }
      }

      const standardIds = ["pag_ibig_number", "phil_health_id_num"];
      for (const f of standardIds) {
        const v = (formData[f] || "").toString().replace(/\D/g, "");
        if (v.length !== 12) {
          const fieldLabel = f === "pag_ibig_number" ? "Pag-IBIG" : "PhilHealth ID";
          setErrorMessage(`${fieldLabel} number must be exactly 12 digits.`);
          setIsErrorModalOpen(true);
          setIsLoading(false);
          return;
        }
      }

      await api.post("users/validate_applicant_form/", {
        email: formData.email,
        cp_number: formData.cp_number,
        pag_ibig_number: formData.pag_ibig_number,
        phil_health_id_num: formData.phil_health_id_num,
        tracking_code: formData.tracking_code,
      });

      window.scrollTo(0, 0);
      navigate("../document-submission", {
        state: { formData },
        relative: "path",
      });
    } catch (error) {
      const errorMessages =
        error.response?.data?.errors?.join("\n") ||
        error.response?.data?.error ||
        "Validation failed. Please check your information.";
      setErrorMessage(errorMessages);
      setIsErrorModalOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearForm = () => {
    const emptyForm = {
      lastname: "",
      firstname: "",
      middle_name: "",
      birthdate: "",
      street: "",
      barangay: "",
      city_municipality: "",
      province: "",
      zip_code: "",
      gender: "",
      cp_number: "",
      program: "",
      name_of_school: "",
      date_graduated: "",
      email: "",
      latin_honor: "",
      pag_ibig_number: "",
      phil_health_id_num: "",
      height: "",
      tribe_affiliated: "",
      tracking_code: "",
    };
    setFormData(emptyForm);
    localStorage.removeItem("applicationFormData");
  };

  const requiredFields = [
    "lastname",
    "firstname",
    "middle_name",
    "birthdate",
    "barangay",
    "city_municipality",
    "province",
    "zip_code",
    "gender",
    "cp_number",
    "program",
    "name_of_school",
    "date_graduated",
    "email",
    "pag_ibig_number",
    "phil_health_id_num",
    "height",
  ];

  const isFormValid = requiredFields.every((key) => {
    const value = formData[key];
    return (
      value !== null && value !== undefined && value.toString().trim() !== ""
    );
  });

  return (
    <div className="form-application-container min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      {isTypeModalOpen && (
        <ApplicationTypeModal 
          onClose={() => setIsTypeModalOpen(false)} 
          onRetrieve={(data) => {
            const updatedData = { ...formData };
            // Copy retrieved fields that exist in our formData schema, filtering out null/undefined
            Object.keys(data).forEach(key => {
              if (updatedData.hasOwnProperty(key) && data[key] !== null && data[key] !== undefined) {
                updatedData[key] = data[key];
              }
            });
            // Explicitly ensure tracking_code and documents are saved even if missing in old cached schema
            if (data.tracking_code) {
              updatedData.tracking_code = data.tracking_code;
            }
            if (data.documents) {
              updatedData.documents = data.documents;
            }
            setFormData(updatedData);
            localStorage.setItem("applicationFormData", JSON.stringify(updatedData));
            setIsTypeModalOpen(false);
          }}
        />
      )}
      <form
        className="my-form max-w-4xl mx-auto bg-white p-6 md:p-8 rounded-xl shadow-md space-y-8"
        onSubmit={handleSubmit}
      >
        <div className="border-b border-gray-200 pb-4 flex flex-col md:flex-row md:items-end md:justify-between gap-2">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 title-application-form">
              Application Form
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Please fill out all sections carefully to complete your application.
            </p>
          </div>
          <div className="flex items-center gap-3 self-start md:self-auto">
            <div className="text-xs font-semibold text-red-500 bg-red-50 border border-red-200 px-3 py-1 rounded-md">
              * Indicates required fields
            </div>
            <button
              className="flex items-center gap-2 h-9 px-3 rounded-lg border border-gray-300 text-gray-500 hover:bg-red-50 hover:border-red-200 hover:text-red-500 transition-all duration-200 active:scale-95 shadow-sm"
              type="button"
              onClick={handleClearForm}
              title="Clear all fields"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span className="text-xs font-semibold">Clear Form</span>
            </button>
          </div>
        </div>

        {/* SECTION 1: Personal Details */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-800 border-l-4 border-[#2C2D86] pl-2">
            Personal Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-600 uppercase tracking-wider">
                Lastname<span className="text-red-500 ml-1">*</span>
              </label>
              <input
                name="lastname"
                value={formData.lastname}
                onChange={handleChange}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-[#2C2D86] transition"
                type="text"
                placeholder="Lastname"
                required
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-600 uppercase tracking-wider">
                Firstname<span className="text-red-500 ml-1">*</span>
              </label>
              <input
                name="firstname"
                value={formData.firstname}
                onChange={handleChange}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-[#2C2D86] transition"
                type="text"
                placeholder="Firstname"
                required
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-600 uppercase tracking-wider">
                Middle Name<span className="text-red-500 ml-1">*</span>
              </label>
              <input
                name="middle_name"
                value={formData.middle_name}
                onChange={handleChange}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-[#2C2D86] transition"
                type="text"
                placeholder="M.N."
                required
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-600 uppercase tracking-wider">
                Birthdate<span className="text-red-500 ml-1">*</span>
              </label>
              <input
                name="birthdate"
                value={formData.birthdate}
                onChange={handleChange}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-[#2C2D86] transition"
                type="date"
                required
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-600 uppercase tracking-wider">Age</label>
              <input
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full bg-gray-100 cursor-not-allowed text-gray-500 font-medium"
                type="text"
                value={
                  formData.birthdate
                    ? (() => {
                        const today = new Date();
                        const birthDate = new Date(formData.birthdate);
                        let age = today.getFullYear() - birthDate.getFullYear();
                        const m = today.getMonth() - birthDate.getMonth();
                        if (
                          m < 0 ||
                          (m === 0 && today.getDate() < birthDate.getDate())
                        ) {
                          age--;
                        }
                        return age;
                      })()
                    : ""
                }
                placeholder="Auto-calculated"
                readOnly
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-600 uppercase tracking-wider">
                Gender<span className="text-red-500 ml-1">*</span>
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#2C2D86] transition"
                required
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-600 uppercase tracking-wider">
                Height (e.g. 160cm)<span className="text-red-500 ml-1">*</span>
              </label>
              <input
                name="height"
                value={formData.height}
                onChange={handleChange}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-[#2C2D86] transition"
                type="text"
                placeholder="Height"
                required
              />
            </div>
            <div className="flex flex-col gap-1 md:col-span-2">
              <label className="text-xs font-medium text-gray-600 uppercase tracking-wider">
                Tribe Affiliated <span className="text-[10px] lowercase text-gray-400 font-normal italic ml-1">(optional)</span>
              </label>
              <input
                name="tribe_affiliated"
                value={formData.tribe_affiliated}
                onChange={handleChange}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-[#2C2D86] transition"
                type="text"
                placeholder="Tribe affiliated"
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: Address Details */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-800 border-l-4 border-[#2C2D86] pl-2">
            Address Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1 md:col-span-2">
              <label className="text-xs font-medium text-gray-600 uppercase tracking-wider">
                Barangay<span className="text-red-500 ml-1">*</span>
              </label>
              <input
                name="barangay"
                value={formData.barangay}
                onChange={handleChange}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-[#2C2D86] transition"
                type="text"
                required
                placeholder="Barangay"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-600 uppercase tracking-wider">
                City/Municipality<span className="text-red-500 ml-1">*</span>
              </label>
              <input
                name="city_municipality"
                value={formData.city_municipality}
                onChange={handleChange}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-[#2C2D86] transition"
                type="text"
                required
                placeholder="City/Municipality"
              />
            </div>
            <div className="flex flex-col gap-1 md:col-span-2">
              <label className="text-xs font-medium text-gray-600 uppercase tracking-wider">
                Province<span className="text-red-500 ml-1">*</span>
              </label>
              <input
                name="province"
                value={formData.province}
                onChange={handleChange}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-[#2C2D86] transition"
                type="text"
                required
                placeholder="Province"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-600 uppercase tracking-wider">
                Zip Code<span className="text-red-500 ml-1">*</span>
              </label>
              <input
                name="zip_code"
                value={formData.zip_code}
                onChange={handleChange}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-[#2C2D86] transition"
                type="text"
                required
                placeholder="Zip Code"
              />
            </div>
          </div>
        </div>

        {/* SECTION 3: Educational Background */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-800 border-l-4 border-[#2C2D86] pl-2">
            Educational Background
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1 md:col-span-2">
              <label className="text-xs font-medium text-gray-600 uppercase tracking-wider">
                Name of school<span className="text-red-500 ml-1">*</span>
              </label>
              <input
                name="name_of_school"
                value={formData.name_of_school}
                onChange={handleChange}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-[#2C2D86] transition"
                type="text"
                placeholder="Name of school"
                required
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-600 uppercase tracking-wider">
                Program / Course<span className="text-red-500 ml-1">*</span>
              </label>
              <input
                name="program"
                value={formData.program}
                onChange={handleChange}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-[#2C2D86] transition"
                type="text"
                placeholder="e.g. BSCS"
                required
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-600 uppercase tracking-wider">
                Date Graduated<span className="text-red-500 ml-1">*</span>
              </label>
              <input
                name="date_graduated"
                value={formData.date_graduated}
                onChange={handleChange}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-[#2C2D86] transition"
                type="date"
                required
              />
            </div>
            <div className="flex flex-col gap-1 md:col-span-2">
              <label className="text-xs font-medium text-gray-600 uppercase tracking-wider">
                Latin Honor <span className="text-[10px] lowercase text-gray-400 font-normal italic ml-1">(optional)</span>
              </label>
              <input
                name="latin_honor"
                value={formData.latin_honor}
                onChange={handleChange}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-[#2C2D86] transition"
                type="text"
                placeholder="e.g. Cum Laude"
              />
            </div>
          </div>
        </div>

        {/* SECTION 4: Contact & Identity Identification */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-800 border-l-4 border-[#2C2D86] pl-2">
            Contact & Government Identifications
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1 md:col-span-2">
              <label className="text-xs font-medium text-gray-600 uppercase tracking-wider">
                Email Address<span className="text-red-500 ml-1">*</span>
              </label>
              <input
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-[#2C2D86] transition"
                type="email"
                placeholder="example@gmail.com"
                required
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-600 uppercase tracking-wider">
                CP # (Mobile)<span className="text-red-500 ml-1">*</span>
              </label>
              <input
                name="cp_number"
                value={formData.cp_number}
                onChange={handleChange}
                inputMode="numeric"
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-[#2C2D86] transition"
                type="text"
                placeholder="e.g. 0917XXXXXXX"
                required
              />
            </div>
            <div className="flex flex-col gap-1 md:col-span-1">
              <label className="text-xs font-medium text-gray-600 uppercase tracking-wider">
                Pag-ibig #<span className="text-red-500 ml-1">*</span>
              </label>
              <input
                name="pag_ibig_number"
                value={formData.pag_ibig_number}
                onChange={handleChange}
                inputMode="numeric"
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-[#2C2D86] transition"
                type="text"
                placeholder="12-digit number"
                required
              />
            </div>
            <div className="flex flex-col gap-1 md:col-span-2">
              <label className="text-xs font-medium text-gray-600 uppercase tracking-wider">
                PhilHealth ID #<span className="text-red-500 ml-1">*</span>
              </label>
              <input
                name="phil_health_id_num"
                value={formData.phil_health_id_num}
                onChange={handleChange}
                inputMode="numeric"
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-[#2C2D86] transition"
                type="text"
                placeholder="12-digit ID number"
                required
              />
            </div>
          </div>
        </div>

        {/* Form Submission Actions */}
        <div className="pt-6 border-t border-gray-200 flex justify-center md:justify-end">
          <button
            className={`w-full md:w-[220px] h-11 rounded-lg bg-[#2C2D86] text-white font-bold text-sm tracking-wide shadow-md transition-all duration-200 ${
              !isFormValid || isLoading
                ? "opacity-50 cursor-not-allowed bg-gray-400"
                : "hover:bg-[#1f2063] active:scale-95 cursor-pointer"
            }`}
            type="submit"
            disabled={!isFormValid || isLoading}
          >
            {isLoading ? "Checking..." : "Next Step →"}
          </button>
        </div>
      </form>

      <MessageModal
        isOpen={isErrorModalOpen}
        onClose={() => setIsErrorModalOpen(false)}
        type="error"
        title="Validation Error"
        message={errorMessage}
      />
    </div>
  );
}

export default Form;