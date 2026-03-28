import React from 'react'
import profile from '../../assets/RRSU1 logo.png'

function UserCard({users}) {
  return (
    <div className='flex flex-col justify-evenly items-center h-[280px] w-[270px] shadow-md bg-[#F9FAFB] rounded '>
      <img src={profile} alt="profile pic" className='h-[60px]'/>
      
      <div>
        <p>Name: {users.name}</p>
        <p>Status: {users.role}</p>
      </div>

      <div className='flex flex-col w-full items-center justify-center gap-2'>
        <button className='bg-[#2C2D86] w-[90%] h-[30px] rounded text-white cursor-pointer'>Edit</button>
        <button className='bg-gray-300 w-[90%] h-[30px] rounded cursor-pointer'>Archive</button>
      </div>

    </div>
  )
}

export default UserCard
