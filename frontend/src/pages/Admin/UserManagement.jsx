import React, { useEffect, useState } from 'react'

import { IoIosAddCircleOutline } from "react-icons/io";
import { CiSearch } from "react-icons/ci";

import './UserManagement.css'

import { api } from '../../../api/api'
import UserCard from './UserCard'
import AddNewUserForm from '../Form/AddNewUserForm'

function UserManagement() {
  const [users,setUsers] = useState([])
  const [toggleModal,setToggleModal] = useState(false)
  const [selectedUser,setSelectedUser] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeSearchTerm, setActiveSearchTerm] = useState('')
  const [open,setOpen] = useState(null)

  useEffect(()=>{
   const fetchUsers = async () => {
      const response = await api.get("users/get_user")
      setUsers(response.data)
      console.log(response.data)
    }
    fetchUsers()
  },[])

  const handleEdit = (user) =>{
    setSelectedUser(user)
    setToggleModal(true)
    setOpen(null)
  }

  const filteredAndSorted = users
  .filter((user) => {
    // 1. Filter by Search Term (Name)
    const fullName = `${user.name} ${user.username}`.toLowerCase();
    const matchesSearch = fullName.includes(activeSearchTerm.toLowerCase());

    return matchesSearch;
  })
  

  const toggleMenu = (id) =>{
    setOpen(open === id ? null : id)
  }

  return (
    <div className='module-content'>
      <div className='flex justify-between items-center add-btn-container'>
        <div className='flex flex-col '>
          <h2>User Management</h2>
          <p>Manage system users, roles, and permissions.</p>
        </div>
         <button 
         onClick={()=> {
          setSelectedUser(null)
          setToggleModal(true)
         }}
          className='flex justify-evenly items-center w-[150px] h-[40px] bg-[#2C2D86] text-white rounded cursor-pointer hover:-translate-y-[2px] hover:shadow-lg transition'>
            <IoIosAddCircleOutline size={20}/>
             Add New User
          </button>
      </div>

      <div className='flex gap-5'>
        <input
            type="text"
            placeholder="Search applicants..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <button onClick={()=> setActiveSearchTerm(searchTerm)}
          className='flex items-center px-10 bg-[#2C2D86] text-white cursor-pointer rounded search-btn'><CiSearch size={30} /> Search</button>
      </div>

      <hr className='border-gray-300 my-4'/>

      <div className='my-4'>

        <table className="w-full text-sm text-center text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-100 ">
              <tr>
                <th scope="col" className="th">Name</th>
                <th scope="col" className="th">Username</th>
                <th scope="col" className="th text-center">Status</th>
                <th scope="col" className="th">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200 bg-white">
              {
                filteredAndSorted.length > 0 ? (
                  filteredAndSorted.map((user)=>(
                  <tr key={user.id}>
                    <td>{user.name}</td>
                    <td>{user.username}</td>
                    <td>{user.role}</td>
                    <td className="px-4 py-4 text-center relative">
                      <div className="flex justify-center items-center">
                        <button 
                          onClick={() => toggleMenu(user.id)}
                          className="flex items-center justify-center w-9 h-9 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all duration-200 active:scale-95"
                          title="More Options"
                        >
                          <span className="text-xl font-bold tracking-widest leading-none pb-2">...</span>
                        </button>
                      </div>

                      {open === user.id && (
                        <div className="absolute right-10 z-10 w-40 bg-white shadow-lg border border-gray-100 rounded-md actions">
                          <ul className="flex flex-col text-[14px] gap-[5px]">
                            <h1 className='font-bold text-black border-b pb-1 border-gray-200 action-title'>Actions</h1>
                            <button 
                              onClick={()=>handleEdit(user)}
                              className="text-left px-2 py-1 cursor-pointer view-details-btn-action">
                              Edit
                            </button>
                            <button 
                              className="text-left  cursor-pointer view-details-btn-action">
                              Archive
                            </button>
                          </ul>
                        </div>
                      )}
                      
                    </td>
                  </tr>
                ))):(
                  <tr>
                  <td colSpan="8" className="py-10 text-gray-500 italic col-8">
                    No users registered
                  </td>
                </tr>
                )
              }
              
            </tbody>
          </table> 
      </div>
      
        {toggleModal && <AddNewUserForm onClose={()=>{
          setToggleModal(false)
          setSelectedUser(null)
        }} user={selectedUser}/>}
    </div>
  )
}

export default UserManagement