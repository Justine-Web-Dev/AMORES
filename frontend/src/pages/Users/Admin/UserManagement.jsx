import React, { useEffect, useState } from "react";

import { IoIosAddCircleOutline } from "react-icons/io";
import { CiSearch } from "react-icons/ci";

import "./UserManagement.css";

import { api } from "../../../../api/api";
import AddNewUserForm from "../../Form/AddNewUserForm";
import ConfirmationModal from "../../../Modals/ConfirmationModal";
import RestoreModal from "../../../Modals/RestoreModal";
import MessageModal from "../../../Modals/MessageModal";

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [toggleModal, setToggleModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeSearchTerm, setActiveSearchTerm] = useState("");
  const [open, setOpen] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [userToArchive, setUserToArchive] = useState(null);
  const [userToRestore, setUserToRestore] = useState(null);
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    type: "success",
    title: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);

  const [activeTab, setActiveTab] = useState("active");

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get(
        `users/get_user/?archived=${activeTab === "archived"}`,
      );
      setUsers(response.data);
      console.log(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [activeTab]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.action-dropdown-container')) {
        setOpen(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);


  const handleEdit = (user) => {
    setSelectedUser(user);
    setToggleModal(true);
    setOpen(null); // Closes the action dropdown list layout cleanly
  };

  const handleArchive = (user) => {
    setUserToArchive(user);
    setShowConfirmModal(true);
    setOpen(null);
  };

  const handleRestore = (user) => {
    setUserToRestore(user);
    setShowRestoreModal(true);
    setOpen(null);
  };

  const confirmRestore = async () => {
    if (!userToRestore) return;
    try {
      await api.put(`users/update_user/${userToRestore.id}/`, {
        ...userToRestore,
        is_archived: false,
      });
      fetchUsers();
      setShowRestoreModal(false);
      setUserToRestore(null);
      setModalConfig({
        isOpen: true,
        type: "success",
        title: "User Restored",
        message: `User "${userToRestore.username}" has been successfully restored.`,
      });
    } catch (error) {
      console.error("Error restoring user:", error);
      setModalConfig({
        isOpen: true,
        type: "error",
        title: "Restore Failed",
        message: "There was an error restoring the user.",
      });
    }
  };

  const confirmArchive = async () => {
    if (!userToArchive) return;

    try {
      await api.delete(`users/update_user/${userToArchive.id}/`);
      fetchUsers();
      setShowConfirmModal(false);
      setUserToArchive(null);
      setModalConfig({
        isOpen: true,
        type: "success",
        title: "User Archived",
        message: `User "${userToArchive.username}" has been successfully archived.`,
      });
    } catch (error) {
      console.error("Error archiving user:", error.response || error);
      setModalConfig({
        isOpen: true,
        type: "error",
        title: "Archive Failed",
        message:
          error.response?.data?.error ||
          "There was an error archiving the user.",
      });
    }
  };

  const filteredAndSorted = users.filter((user) => {
    const fullName = `${user.name} ${user.username}`.toLowerCase();
    const matchesSearch = fullName.includes(activeSearchTerm.toLowerCase());
    return matchesSearch && user.role !== "SUPER_ADMIN";
  });

  const toggleMenu = (id) => {
    setOpen(open === id ? null : id);
  };

  // Extracted logic to re-verify state cleanly on closure changes
  const handleCloseUserForm = () => {
    setToggleModal(false);
    setSelectedUser(null);
    fetchUsers(); // CRITICAL FIX: Pulls down updated row info from database after submission saves
  };

  return (
    <div className="user-management-page">
      <div className="flex justify-between items-center add-btn-container">
        <div className="flex flex-col ">
          <h2>User Management</h2>
          <p>Manage system users, roles, and permissions.</p>
        </div>
        <button
          onClick={() => {
            setSelectedUser(null);
            setToggleModal(true);
          }}
          className="flex justify-evenly items-center w-[150px] h-[40px] bg-[#2C2D86] text-white rounded cursor-pointer hover:-translate-y-[2px] hover:shadow-lg transition"
        >
          <IoIosAddCircleOutline size={20} />
          Add New User
        </button>
      </div>

      <div className="flex gap-4 mt-6 mb-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("active")}
          className={`pb-2 px-4 text-sm font-medium transition-all duration-200 ${activeTab === "active" ? "border-b-2 border-[#2C2D86] text-[#2C2D86]" : "text-gray-500 hover:text-gray-700"}`}
        >
          Active Users (
          {activeTab === "active" ? filteredAndSorted.length : "..."})
        </button>
        <button
          onClick={() => setActiveTab("archived")}
          className={`pb-2 px-4 text-sm font-medium transition-all duration-200 ${activeTab === "archived" ? "border-b-2 border-[#2C2D86] text-[#2C2D86]" : "text-gray-500 hover:text-gray-700"}`}
        >
          Inactive Users (
          {activeTab === "archived" ? filteredAndSorted.length : "..."})
        </button>
      </div>

      <div className="flex gap-5 mt-4">
        <input
          type="text"
          placeholder="Search applicants..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <button
          onClick={() => setActiveSearchTerm(searchTerm)}
          className="flex items-center px-10 bg-[#2C2D86] text-white cursor-pointer rounded search-btn"
        >
          <CiSearch size={30} /> Search
        </button>
      </div>

      <hr className="border-gray-300 my-4" />

      <div className="my-4">
        <table className="w-full text-sm text-center text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-100 ">
            <tr>
              <th scope="col" className="th">
                Name
              </th>
              <th scope="col" className="th">
                Email
              </th>
              <th scope="col" className="th text-center">
                Role
              </th>
              <th scope="col" className="th text-center">
                Status
              </th>
              <th scope="col" className="th">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200 bg-white">
            {loading ? (
              <tr>
                <td colSpan="10" className="px-4 py-10">
                  <div className="flex justify-center items-center w-full">
                    <div className="border-[4px] border-gray-100 border-t-[#2C2D86] h-[30px] w-[30px] rounded-full animate-spin"></div>
                  </div>
                </td>
              </tr>
            ) : filteredAndSorted.length > 0 ? (
              filteredAndSorted.map((user) => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>
                    <span
                      className={
                        user.is_archived
                          ? "bg-red-100 text-red-800 font-semibold px-4 py-1 rounded-md"
                          : "bg-emerald-100 text-emerald-800 font-semibold px-4 py-1 rounded-md"
                      }
                    >
                      {user.is_archived ? "Inactive" : "Active"}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <div className="relative inline-block text-left action-dropdown-container">
                      <button
                        onClick={() => toggleMenu(user.id)}
                        className="flex items-center justify-center w-9 h-9 mx-auto text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all duration-200 active:scale-95"
                        title="More Options"
                      >
                        <span className="text-xl font-bold tracking-widest leading-none pb-2">
                          ...
                        </span>
                      </button>

                      {open === user.id && (
                        <div className="absolute top-full right-0 mt-2 z-[9999] w-40 bg-white shadow-lg border border-gray-100 rounded-md actions">
                          <ul className="flex flex-col text-[14px] gap-[5px]">
                            <h1 className="font-bold text-black border-b pb-1 border-gray-200 action-title">
                              Actions
                            </h1>
                          <button
                            onClick={() => handleEdit(user)}
                            className="text-left px-2 py-1 cursor-pointer view-details-btn-action"
                          >
                            Edit
                          </button>
                          {activeTab === "active" ? (
                            <button
                              onClick={() => handleArchive(user)}
                              className="text-left cursor-pointer deactivate-btn-action text-red-500 hover:text-white"
                            >
                              Deactivate
                            </button>
                          ) : (
                            <button
                              onClick={() => handleRestore(user)}
                              className="text-left text-green-600 font-medium cursor-pointer view-details-btn-action"
                            >
                              Restore
                            </button>
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
                <td colSpan="4" className="py-10 text-gray-500 italic col-8">
                  No {activeTab === "active" ? "active" : "inactive"} users
                  found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {toggleModal && (
        <AddNewUserForm onClose={handleCloseUserForm} user={selectedUser} />
      )}

      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={confirmArchive}
        title="Archive User"
        message={`Are you sure you want to archive "${userToArchive?.name}"? This will disable their account but preserve their data.`}
      />

      <RestoreModal
        isOpen={showRestoreModal}
        onClose={() => setShowRestoreModal(false)}
        onConfirm={confirmRestore}
        title="Restore User"
        message={`Are you sure you want to restore user "${userToRestore?.name}"? This will reactivate their account.`}
      />

      <MessageModal
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
        type={modalConfig.type}
        title={modalConfig.title}
        message={modalConfig.message}
      />
    </div>
  );
}

export default UserManagement;
