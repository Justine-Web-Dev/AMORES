import React from 'react'
import './AddNewUserForm.css'

function AddNewUserForm() {
  return (
    <div>
      <form className='shadow '>
        <label htmlFor="">Name</label>
        <input type="text" placeholder='Name'/>

        <label htmlFor="">Email</label>
        <input type="email" placeholder='example@gmail.com'/>

        <label htmlFor="">Username</label>
        <input type="text" placeholder='Username'/>

        <label htmlFor="">Role</label>
        <select name="" id="" className='role'>
          <option value="Recruitment Personnel">Recruitment Personnel</option>
          <option value="Administrator" disabled>Administrator</option>
        </select>

        <button type='submit' className='bg-[#2C2D86] text-white w-[180px] h-10 rounded shadow cursor-pointer hover:translate-y-[-2px] transition'>Save and Confirm</button>

      </form>
    </div>
  )
}

export default AddNewUserForm
