import React, { useState,useEffect } from 'react'

import { IoIosClose } from "react-icons/io"
import './AddNewUserForm.css'

import { api } from '../../../api/api'

function AddNewUserForm({onClose,user}) {

  const [formData,setFormData] = useState({
    name:"",
    username: "",
    password: "",
    role: "Recruiter"
  })

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        username: user.username || "",
        password: "",
        role: user.role || "Recruiter"
      })
    } else {
      setFormData({
        name: "",
        username: "",
        password: "",
        role: "Recruiter"
      })
    }
  }, [user])

  const handleChange = (e) =>{
    setFormData({
      ...formData, [e.target.name]: e.target.value
    })
  }

 const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    if (user) {
      const { password, ...updateData } = formData;

      const response = await api.put(`users/update_user/${user.id}/`, updateData);
      console.log("Updated", response.data);
    } else {
      const response = await api.post("users/register_user/", formData);
      console.log("Success", response.data);
    }
    onClose();
  } catch (error) {
    console.error("Error:", error.response?.data || error.message);
  }
};

  return (
    <div className='overlay fadeout'>
      <form 
      onSubmit={handleSubmit}
      className='flex flex-col justify-evenly w-[450px] bg-[#F9FAFB] shadow rounded-[8px] add-new-form'>

        <div className='flex justify-between'>
          <div>
            <h1 className='text-[1.5rem] font-bold'>{user ? "Edit User" : "Add New User"}</h1>
            <p>{user ? "Update the personnel details": "Input the new personnel details and assign a role."}</p>
          </div>
          <IoIosClose 
          size={30} 
          className='cursor-pointer '
          onClick={onClose}
          />
        </div>

        <div className='flex flex-col gap-[5px]'>
          <label htmlFor="">Name</label>
          <input type="text" 
          name='name'
          value={formData.name}
          onChange={handleChange}
          placeholder='Name'/>

          <label htmlFor="">Username</label>
          <input type="text" 
          name='username'
          value={formData.username}
          onChange={handleChange}
          placeholder='Username'/>

          <label htmlFor="">Password</label>
          <input type="password" 
          name='password'
          value={formData.password}
          onChange={handleChange}
          placeholder={user ? 'Leave blank to keep current' : 'Enter password'}
          required={!user}/>

          <div className='flex flex-col role-container'>
            <label htmlFor="">Role</label>
            <select name="role"
            value={formData.role}
            onChange={handleChange}
            className='role'>
              <option value="Recruiter">Recruiter</option>
              <option value="Administrator" disabled>Administrator</option>
            </select>
           </div>
        </div>

        <div className='flex justify-end'>
          <button type='submit' className='bg-[#2C2D86] text-white w-[180px] h-10 rounded shadow cursor-pointer hover:translate-y-[-2px] transition'>{user ? "Update User" : "Save and Confirm"}</button>
        </div>

      </form>
    </div>
  )
}

export default AddNewUserForm
