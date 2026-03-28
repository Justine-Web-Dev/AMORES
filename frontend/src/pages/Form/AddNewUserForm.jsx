import React, { useState } from 'react'

import { IoIosClose } from "react-icons/io"
import './AddNewUserForm.css'

import { api } from '../../../api/api'

function AddNewUserForm({onClose}) {
  const [formData,setFormData] = useState({
    name:"",
    username: "",
    password: "",
    role: "Recruiter"
  })

  const handleChange = (e) =>{
    setFormData({
      ...formData, [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) =>{
    e.preventDefault()

    try{
      const response = await api.post(
      "users/register_user/",
        formData
    )

    console.log("Success", response.data)

    setFormData({
      name: "",
      username: "",
      password: "",
    })
    onClose()

    }catch(error){
       console.error("Error:", error.response?.data || error.message);
    }

    
  }

  return (
    <div className='overlay fadeout'>
      <form 
      onSubmit={handleSubmit}
      className='flex flex-col justify-evenly bg-[#F9FAFB] shadow rounded-[8px] add-new-form'>

        <div className='flex '>
          <div>
            <h1 className='text-[1.5rem] font-bold'>Add New User</h1>
            <p>Input the new personnel details and assign a role.</p>
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
          placeholder='Enter you password'/>

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
          <button type='submit' className='bg-[#2C2D86] text-white w-[180px] h-10 rounded shadow cursor-pointer hover:translate-y-[-2px] transition'>Save and Confirm</button>
        </div>


      </form>
    </div>
  )
}

export default AddNewUserForm
