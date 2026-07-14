import React, { useState, useEffect } from "react";
import { IoIosClose } from "react-icons/io";
import "./AddNewUserForm.css";
import { api } from "../../../api/api";
import MessageModal from "../../Modals/MessageModal";

function AddNewUserForm({ onClose, user }) {
  const isEditMode = !!user;
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "Recruiter",
  });
  
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    type: "success",
    message: "",
  });

  // Client-side secure password generation utility
  const generateRandomPassword = () => {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let generatedPassword = "";
    const randomValues = new Uint32Array(14);
    window.crypto.getRandomValues(randomValues);

    for (let i = 0; i < 14; i++) {
      generatedPassword += charset[randomValues[i] % charset.length];
    }
    return generatedPassword;
  };

  // Watch for changes to the active user profile on load
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        password: "",
        role: user.role || "Recruiter",
      });
    } else {
      setFormData({
        name: "",
        email: "",
        password: "", // Left clear initially until email is fully resolved
        role: "Recruiter",
      });
    }
  }, [user]);

  // Automated trigger: Fills out password once valid email structure is completed
  useEffect(() => {
    if (isEditMode) return;

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (emailPattern.test(formData.email)) {
      if (!formData.password) {
        setFormData((prev) => ({
          ...prev,
          password: generateRandomPassword(),
        }));
      }
    } else {
      // Clear password out cleanly if email input goes back to an incomplete state
      if (formData.password) {
        setFormData((prev) => ({
          ...prev,
          password: "",
        }));
      }
    }
  }, [formData.email, isEditMode]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      let currentUser = "Unknown";
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split(".")[1]));
          currentUser = payload.email || "Unknown";
        } catch (err) {
          console.error("Token parse error:", err);
        }
      }

      if (user) {
        const { password, ...updateData } = formData; 
        updateData.performed_by = currentUser;

        await api.put(`users/update_user/${user.id}/`, updateData);
        setModalConfig({
          isOpen: true,
          type: "success",
          message: "The user information has been updated successfully.",
        });
      } else {
        const registerData = { ...formData, performed_by: currentUser };
        await api.post("users/register_user/", registerData);
        setModalConfig({
          isOpen: true,
          type: "success",
          message: `The new user has been registered successfully.`,
        });
      }
    } catch (error) {
      console.error("Error:", error.response?.data || error.message);
      setModalConfig({
        isOpen: true,
        type: "error",
        message: error.response?.data?.error || "There was an error processing your request.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="overlay fadeout">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col justify-evenly w-[450px] bg-[#F9FAFB] shadow rounded-[8px] add-new-form"
      >
        <div className="flex justify-between">
          <div>
            <h1 className="text-[1.5rem] font-bold">
              {user ? "Edit User" : "Add New User"}
            </h1>
            <p>
              {user
                ? "Update the personnel details"
                : "Input the new personnel details and assign a role."}
            </p>
          </div>
          <IoIosClose size={30} className="cursor-pointer" onClick={onClose} />
        </div>

        <div className="flex flex-col gap-[5px]">
          <label>Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Name"
            required
          />

          <label>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email Address"
            required
          />

          {!isEditMode && (
            <div className="flex flex-col gap-[5px]">
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                placeholder="Fill out email to auto-generate"
                disabled
                className="w-full bg-gray-100 border border-gray-300 text-gray-400 cursor-not-allowed"
              />
              <p className="text-[0.72rem] text-gray-400 mt-[-2px]">
                Auto-generated — will be sent to the user's email.
              </p>
            </div>
          )}


          {!isEditMode && (
            <div className="flex flex-col role-container">
              <label>Role</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="role"
              >
                <option value="Recruiter">Recruiter</option>
                <option value="Administrator">Administrator</option>
              </select>
            </div>
          )}
        </div>
        
        <div className="flex justify-end mt-3">
          <button
            type="submit"
            className="bg-[#2C2D86] text-white w-[180px] h-10 rounded shadow cursor-pointer hover:translate-y-[-2px] transition"
            disabled={loading}
          >
            {loading ? (
              <div className="flex justify-center items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>{user ? "Updating..." : "Saving..."}</span>
              </div>
            ) : (
              user ? "Update User" : "Save and Confirm"
            )}
          </button>
        </div>
      </form>

      <MessageModal
        isOpen={modalConfig.isOpen}
        onClose={() => {
          setModalConfig({ ...modalConfig, isOpen: false });
          if (modalConfig.type === "success") {
            onClose(); 
          }
        }}
        type={modalConfig.type}
        title={modalConfig.type === "success" ? "Success" : "Error"}
        message={modalConfig.message}
      />
    </div>
  );
}

export default AddNewUserForm;