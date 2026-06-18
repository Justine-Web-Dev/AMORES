import React, { useState } from 'react'
import logo from '../../assets/RRSU1 logo.png'
import '../Header/Headerlanding.css'
import { Link, useLocation, useNavigate } from 'react-router-dom';

function HeaderLanding({ isApplicationOpen = true }) {
    const [menuOpen, setMenuOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    const handleAboutClick = (e) => {
        e.preventDefault();
        const headerHeight = 80; 

        const scrollToSection = () => {
            const section = document.getElementById('about-us');
            if (section) {
                const top = section.getBoundingClientRect().top + window.pageYOffset - headerHeight;
                window.scrollTo({ top, behavior: 'smooth' });
            }
        };

        if (location.pathname === '/') {
            scrollToSection();
        } else {
            navigate('/');
            // Small delay to allow navigation to complete before scrolling
            setTimeout(scrollToSection, 100);
        }
        setMenuOpen(false);
    };
    
  return (
    <header className="fixed top-0 left-0 right-0 shadow w-full my-header z-[100]">
      {/* Top bar */}
      <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-2">
        {/* Logo + Name */}
        <div className="flex items-center gap-2">
          <img src={logo} alt="Logo" className="h-14" />
          <h3 className="text-[#2C2D86] font-bold text-base">PNP-AMORES</h3>
        </div>

        <div className="hidden md:flex items-center gap-6">
          <nav className="flex items-center gap-6">
            <Link to={'/'} className="text-sm  home">Home</Link>
            <a href="#about-us" onClick={handleAboutClick} className="text-sm about-us">About Us</a>
            <Link to={'/track-application'} className="text-sm track-app">Track Application</Link>
          </nav>
          
          <div className="flex items-center gap-3">
            {/* <Link to={'/LoginUsers'} 
              className="flex justify-center items-center border border-[#2C2D86] text-[#2C2D86] font-semibold h-[40px] px-5 text-sm rounded cursor-pointer login-staff-btn hover:bg-[#2C2D86] hover:text-white transition-all"
            >
              Personnel Login
            </Link> */}

            {isApplicationOpen ? (
              <Link to={'/form-application'} 
              className="flex justify-center items-center bg-[#2C2D86] h-[40px] w-[140px] text-sm text-white rounded cursor-pointer apply-btn hover:bg-[#1a1b5c] transition-all"
              >
                Apply Now
              </Link>
            ) : (
              <button 
              disabled
              className="flex justify-center items-center bg-gray-400 h-[40px] w-[140px] text-sm text-white rounded cursor-not-allowed opacity-70"
              >
                Closed
              </button>
            )}
          </div>
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

      <div className={`md:hidden overflow-hidden transition-all duration-300 ${menuOpen ? "max-h-[350px]" : "max-h-0"}`}>
        <nav className="flex flex-col items-center gap-4 px-6 pb-5 pt-2 border-t border-gray-100 bg-white">
          <Link to={'/'} className="text-sm w-full text-center py-2 home" onClick={() => setMenuOpen(false)}>Home</Link>
          <a href="#about-us" className="text-sm w-full text-center py-2 about-us" onClick={handleAboutClick}>About Us</a>
          <Link to={'/track-application'} className="text-sm w-full text-center py-2 track-app" onClick={() => setMenuOpen(false)}>Track Application</Link>
          
          {/* <Link to={'/LoginUsers'} 
            className="flex justify-center items-center border border-[#2C2D86] text-[#2C2D86] h-[40px] w-full text-sm font-semibold rounded cursor-pointer login-staff-btn hover:bg-[#2C2D86] hover:text-white transition-all"
            onClick={() => setMenuOpen(false)}
          >
            Personnel Login
          </Link> */}

          {isApplicationOpen ? (
            <Link to={'/form-application'} 
            className="flex justify-center items-center bg-[#2C2D86] h-[40px] w-full text-sm text-white rounded cursor-pointer apply-btn"
            onClick={() => setMenuOpen(false)}
            >
              Apply Now
            </Link>
          ) : (
            <button 
            disabled
            className="flex justify-center items-center bg-gray-400 h-[40px] w-full text-sm text-white rounded cursor-not-allowed opacity-70"
            >
              Closed
            </button>
          )}
        </nav>
      </div>
    </header>
  )
}

export default HeaderLanding
