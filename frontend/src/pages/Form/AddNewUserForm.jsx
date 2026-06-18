import React, { useState, useEffect } from "react";

import { IoIosClose } from "react-icons/io";
import "./AddNewUserForm.css";

import { api } from "../../../api/api";
import MessageModal from "../../Modals/MessageModal";

function AddNewUserForm({ onClose, user }) {
  const isEditMode = !!user;

  const [formData, setFormData] = useState({
    name: "",
    username: "",
    password: "",
    role: "Recruiter",
  });
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    type: "success",
    message: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        username: user.username || "",
        password: "",
        role: user.role || "Recruiter",
      });
    } else {
      setFormData({
        name: "",
        username: "",
        password: "",
        role: "Recruiter",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Get the current user from the token for audit logging
      const token = localStorage.getItem("token");
      let currentUser = "Unknown";
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split(".")[1]));
          currentUser = payload.username || "Unknown";
        } catch (e) {
          console.error("Token parse error:", e);
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
          message: "The new user has been registered successfully.",
        });
      }
    } catch (error) {
      console.error("Error:", error.response?.data || error.message);
      setModalConfig({
        isOpen: true,
        type: "error",
        message:
          error.response?.data?.error ||
          "There was an error processing your request.",
      });
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
          <IoIosClose size={30} className="cursor-pointer " onClick={onClose} />
        </div>

        <div className="flex flex-col gap-[5px]">
          <label htmlFor="">Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Name"
          />

          <label htmlFor="">Username</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="Username"
          />

          {!isEditMode && (
            <div className="flex flex-col gap-[5px]">
              <label htmlFor="">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                disabled={isEditMode}
                placeholder="Enter Password"
                className={isEditMode ? "opacity-50 cursor-not-allowed" : ""}
                required={!user}
              />
            </div>
          )}

          {!isEditMode && (
            <div className="flex flex-col role-container">
              <label htmlFor="">Role</label>
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

        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-[#2C2D86] text-white w-[180px] h-10 rounded shadow cursor-pointer hover:translate-y-[-2px] transition"
          >
            {user ? "Update User" : "Save and Confirm"}
          </button>
        </div>
      </form>

      <MessageModal
        isOpen={modalConfig.isOpen}
        onClose={() => {
          setModalConfig({ ...modalConfig, isOpen: false });
          if (modalConfig.type === "success") {
            onClose(); // Only close the form if the action was successful
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
