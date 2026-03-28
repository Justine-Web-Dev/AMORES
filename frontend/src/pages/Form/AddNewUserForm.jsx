import React from 'react'

import { IoIosClose } from "react-icons/io";

import './AddNewUserForm.css'

function AddNewUserForm({onClose}) {
  return (
    <div className='overlay fadeout'>
      <form className='flex flex-col justify-evenly bg-[#F9FAFB] shadow rounded-[8px] add-new-form'>

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
          <input type="text" placeholder='Name'/>

          <label htmlFor="">Email</label>
          <input type="email" placeholder='example@gmail.com'/>

          <label htmlFor="">Username</label>
          <input type="text" placeholder='Username'/>

          <div className='flex flex-col role-container'>
            <label htmlFor="">Role</label>
            <select name="" id="" className='role'>
              <option value="Recruitment Personnel">Recruitment Personnel</option>
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
