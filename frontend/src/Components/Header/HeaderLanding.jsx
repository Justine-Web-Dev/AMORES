import React from 'react'
import logo from '../../assets/RRSU1 logo.png'
import '../Header/Headerlanding.css'

function HeaderLanding() {
  return (
    <header className='flex justify-between items-center shadow my-header'>
      <div className='flex justify-center items-center w-[250px]'>
        <img src={logo} alt="Logo" className='h-14'/>
        <h3>PNP-AMORES</h3>
      </div>

      <nav className='flex-1 flex h-18 justify-center items-center gap-20 w-full my-nav'>
        <a href="">Home</a>
        <a href="">About Us</a>
      </nav>

      <div className='flex justify-center items-center h-[60px] w-[250px]'>
        <button className='bg-[#2C2D86] h-[40px] w-[160px] text-sm text-white rounded cursor-pointer apply-btn'>Apply Now</button>
      </div>
    </header>
  )
}

export default HeaderLanding
