import React from 'react'
import './HeaderAdmin.css'
import logoAcc from '../../assets/RRSU1 logo.png'

function HeaderAdmin() {
  return (
    <header className='HeaderAdmin'>
      <div className='label-dashboard'>
        <h4>Dashboard</h4>
        <p>Home / Dashboard</p>
      </div>

      <div className='greetings-account'>
        <h4>Welcome, Administrator</h4>
        <img src={logoAcc} alt="acc logo" className="h-8 w-auto object-contain" />
      </div>

    </header>
  )
}

export default HeaderAdmin
