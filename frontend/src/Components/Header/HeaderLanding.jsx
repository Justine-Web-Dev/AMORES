import React from 'react'
import { useState } from 'react';

import logo from '../../assets/RRSU1 logo.png'
import '../Header/Headerlanding.css'
import { Link } from 'react-router-dom';

function HeaderLanding() {
    const [menuOpen, setMenuOpen] = useState(false);
    
  return (
    <header className="fixed top-0 left-0 right-0 bg-[#fff] shadow w-full my-header">
      {/* Top bar */}
      <div className="flex justify-around items-center px-6 py-3">
        {/* Logo + Name */}
        <div className="flex items-center gap-2">
          <img src={logo} alt="Logo" className="h-14" />
          <h3 className="text-[#2C2D86] font-bold text-base">PNP-AMORES</h3>
        </div>

        <div className="hidden md:flex items-center gap-10">
          <nav className="flex items-center gap-8">
            <Link to={'/'} className="text-sm  home">Home</Link>
            <Link to={'/about-us'} className="text-sm about-us">About Us</Link>
            <Link to={'/track-application'} className="text-sm track-app">Track Application</Link>
          </nav>
          <Link to={'/form-informations'} 
          className="flex justify-center items-center bg-[#2C2D86] h-[40px] w-[160px] text-sm text-white rounded cursor-pointer apply-btn"
          >
            Apply Now
          </Link>
        </div>

        <button
          className="md:hidden flex flex-col gap-1.5 p-2 cursor-pointer"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span className={`block w-6 h-0.5 bg-[#2C2D86] transition-all duration-300 ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
          <span className={`block w-6 h-0.5 bg-[#2C2D86] transition-all duration-300 ${menuOpen ? "opacity-0" : ""}`} />
          <span className={`block w-6 h-0.5 bg-[#2C2D86] transition-all duration-300 ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
        </button>
      </div>

      <div className={`md:hidden overflow-hidden transition-all duration-300 ${menuOpen ? "max-h-64" : "max-h-0"}`}>
        <nav className="flex flex-col items-center gap-4 px-6 pb-5 pt-2 border-t border-gray-100">
          <Link to={'/'} className="text-sm w-full text-center py-2 home">Home</Link>
          <Link to={'/about-us'} className="text-sm w-full text-center py-2 about-us">About Us</Link>
          <Link to={'/track-application'} className="text-sm w-full text-center py-2 track-app">Track Application</Link>
          <Link to={'/form-informations'} className="flex justify-center items-center bg-[#2C2D86] h-[40px] w-full text-sm text-white rounded cursor-pointer apply-btn"
          
          >
            Apply Now
          </Link>
        </nav>
      </div>
    </header>
  )
}

export default HeaderLanding
