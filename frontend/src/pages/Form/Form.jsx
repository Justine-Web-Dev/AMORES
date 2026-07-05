import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../../api/api";
import MessageModal from "../../Modals/MessageModal";
import "./FormCss.css";

function Form() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    lastname: "",
    firstname: "",
    middle_name: "",
    birthdate: "",
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
  });
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Load saved form data from localStorage on mount
  useEffect(() => {
    const savedFormData = localStorage.getItem("applicationFormData");
    if (savedFormData) {
      try {
        const parsed = JSON.parse(savedFormData);
        // sanitize numeric fields in loaded data
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

      // CP number is strictly 11 max; Pag-IBIG and PhilHealth are 12 max
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

    // Check if form is valid
    if (!isFormValid) {
      setErrorMessage("Please fill in all required fields before proceeding.");
      setIsErrorModalOpen(true);
      return;
    }

    // Validate with backend
    setIsLoading(true);
    try {
      // Validate CP number (must be exactly 11)
      const cpDigits = (formData.cp_number || "").toString().replace(/\D/g, "");
      if (cpDigits.length !== 11) {
        setErrorMessage("CP number must be exactly 11 digits.");
        setIsErrorModalOpen(true);
        setIsLoading(false);
        return;
      }

      // Validate Pag-IBIG and PhilHealth (must be exactly 12 digits)
      const standardIds = ["pag_ibig_number", "phil_health_id_num"];
      for (const f of standardIds) {
        const v = (formData[f] || "").toString().replace(/\D/g, "");
        if (v.length !== 12) {
          const fieldLabel =
            f === "pag_ibig_number" ? "Pag-IBIG" : "PhilHealth ID";
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
      });

      // If validation passes, navigate to document submission
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

  const requiredFields = [
    "lastname",
    "firstname",
    "middle_name",
    "birthdate",
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
    <div className="form-application-container min-h-screen">
      <form
        className="my-form max-w-4xl mx-auto bg-white my-11 rounded-lg shadow-sm"
        onSubmit={handleSubmit}
      >
        <h1 className="text-2xl md:text-[24px] font-semibold title-application-form mb-6">
          Application Form
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-600">Lastname</label>
            <input
              name="lastname"
              value={formData.lastname}
              onChange={handleChange}
              className="border rounded px-3 py-2 text-sm w-full"
              type="text"
              placeholder="Lastname"
              required
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-600">Firstname</label>
            <input
              name="firstname"
              value={formData.firstname}
              onChange={handleChange}
              className="border rounded px-3 py-2 text-sm w-full"
              type="text"
              placeholder="Firstname"
              required
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-600">Middle Name</label>
            <input
              name="middle_name"
              value={formData.middle_name}
              onChange={handleChange}
              className="border rounded px-3 py-2 text-sm w-full"
              type="text"
              placeholder="M.N."
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-600">Birthdate</label>
            <input
              name="birthdate"
              value={formData.birthdate}
              onChange={handleChange}
              className="border rounded px-3 py-2 text-sm w-full"
              type="date"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-600">Age</label>
            <input
              className="border rounded px-3 py-2 text-sm w-full bg-gray-100 cursor-not-allowed text-gray-500"
              type="text"
              value={formData.birthdate ? (() => {
                const today = new Date();
                const birthDate = new Date(formData.birthdate);
                let age = today.getFullYear() - birthDate.getFullYear();
                const m = today.getMonth() - birthDate.getMonth();
                if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                  age--;
                }
                return age;
              })() : ""}
              placeholder="Auto-calculated"
              readOnly
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-600">Gender</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="border rounded px-3 py-2 text-sm w-full bg-white cursor-pointer"
              required
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-600">CP #</label>
            <input
              name="cp_number"
              value={formData.cp_number}
              onChange={handleChange}
              inputMode="numeric"
              className="border rounded px-3 py-2 text-sm w-full"
              type="text"
              placeholder="CP #"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-600">Program</label>
            <input
              name="program"
              value={formData.program}
              onChange={handleChange}
              className="border rounded px-3 py-2 text-sm w-full"
              type="text"
              placeholder="Program"
              required
            />
          </div>

          <div className="flex flex-col gap-1 md:col-span-2">
            <label className="text-sm text-gray-600">Name of school</label>
            <input
              name="name_of_school"
              value={formData.name_of_school}
              onChange={handleChange}
              className="border rounded px-3 py-2 text-sm w-full"
              type="text"
              placeholder="Name of school"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-600">Date graduated</label>
            <input
              name="date_graduated"
              value={formData.date_graduated}
              onChange={handleChange}
              className="border rounded px-3 py-2 text-sm w-full"
              type="date"
              required
            />
          </div>

          <div className="flex flex-col gap-1 md:col-span-2">
            <label className="text-sm text-gray-600">Email</label>
            <input
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="border rounded px-3 py-2 text-sm w-full"
              type="email"
              placeholder="example@gmail.com"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-600">
              Latin honor{" "}
              <span className="px-2 rounded bg-gray-200">optional</span>
            </label>
            <input
              name="latin_honor"
              value={formData.latin_honor}
              onChange={handleChange}
              className="border rounded px-3 py-2 text-sm w-full"
              type="text"
              placeholder="Latin honor"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-600">Pag-ibig #</label>
            <input
              name="pag_ibig_number"
              value={formData.pag_ibig_number}
              onChange={handleChange}
              inputMode="numeric"
              className="border rounded px-3 py-2 text-sm w-full"
              type="text"
              placeholder="Pag-ibig #"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-600">PhilHealth ID #</label>
            <input
              name="phil_health_id_num"
              value={formData.phil_health_id_num}
              onChange={handleChange}
              inputMode="numeric"
              className="border rounded px-3 py-2 text-sm w-full"
              type="text"
              placeholder="PhilHealth ID #"
              required
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-600">Height (e.g. 160cm)</label>
            <input
              name="height"
              value={formData.height}
              onChange={handleChange}
              className="border rounded px-3 py-2 text-sm w-full"
              type="text"
              placeholder="Height"
              required
            />
          </div>

          <div className="flex flex-col gap-1 md:col-span-2">
            <label className="text-sm text-gray-600">
              Tribe affiliated{" "}
              <span className="px-2 rounded bg-gray-200">optional</span>
            </label>
            <input
              name="tribe_affiliated"
              value={formData.tribe_affiliated}
              onChange={handleChange}
              className="border rounded px-3 py-2 text-sm w-full"
              type="text"
              placeholder="Tribe affiliated"
            />
          </div>

          <div className="md:col-span-3 flex justify-center md:justify-end mt-4">
            <button
              className="w-full md:w-[220px] h-10 rounded bg-[#2C2D86] text-white font-bold text-sm cursor-pointer hover:bg-[#3a3b9e] transition-colors submit-application-btn"
              type="submit"
              disabled={!isFormValid || isLoading}
            >
              {isLoading ? "Checking..." : "Next Step"}
            </button>
          </div>
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
