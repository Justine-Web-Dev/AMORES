import React from 'react'
import { CiLogout } from "react-icons/ci";
import './LoginModal.css'
import { useNavigate } from 'react-router-dom';

function Logout({ setShowLogout }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/LoginUsers');
  };
  
  return (
    <div className='fixed top-0 left-0 right-0 bottom-0 bg-black/40 h-screen w-full flex justify-center items-center z-[9999]'>
      <div className='flex justify-center flex-col items-center px-10 py-5 rounded-[8px] bg-white'>
        <CiLogout size={50}/>
        <h3 className='text-center text-[22px] font-semibold w-[300px]'>Do you want to logout?</h3>
        <p className='text-center text-gray-600 text-[14px] w-[300px]'>You won't be able to revert this</p>
        <div className='flex gap-10 mt-3'>
            <button 
            onClick={handleLogout}
            className='bg-[#2C2D86] text-white px-6 py-2 rounded-[4px] cursor-pointer logout-yes-btn'>Yes</button>
            <button 
            onClick={() => setShowLogout(false)}
            className='bg-gray-500 text-white px-6 py-2 rounded-[4px] cursor-pointer logout-no-btn'>No</button>
        </div>
      </div>
    </div>
  )
}

export default Logout
