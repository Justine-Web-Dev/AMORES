import React, { useEffect, useState } from 'react'

import { IoIosAddCircleOutline } from "react-icons/io";

import './UserManagement.css'

import { api } from '../../../api/api'
import UserCard from './UserCard'
import AddNewUserForm from '../Form/AddNewUserForm'

function UserManagement() {
const [users,setUsers] = useState([])
const [toggleModal,setToggleModal] = useState(false)

  useEffect(()=>{
    const fetchUsers = async () => {
      const response = await api.get("users/get_user")
      setUsers(response.data)
      console.log(response.data)
    }

    fetchUsers()
  },[])


  return (
    <div className='module-content'>
      <div className='flex justify-between items-center add-btn-container'>
        <div className='flex flex-col '>
          <h2>User Management</h2>
          <p>Manage system users, roles, and permissions.</p>
        </div>
         <button 
         onClick={()=> setToggleModal(true)}
          className='flex justify-evenly items-center w-[150px] h-[40px] bg-[#2C2D86] text-white rounded cursor-pointer hover:-translate-y-[2px] hover:shadow-lg transition'>
            <IoIosAddCircleOutline size={20}/>
             Add New User
          </button>
      </div>

      <hr className='border-gray-300'/>

      <div className="user-management-container">
          {
            users.map(user => ((
              <UserCard  users={user} key={user.id}/>
            )))
          }
      </div>

        {toggleModal && <AddNewUserForm onClose={()=> setToggleModal(false)}/>}
    </div>
  )
}

export default UserManagement