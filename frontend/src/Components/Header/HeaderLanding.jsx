import React, { useState } from 'react'
import logo from '../../assets/RRSU1 logo.png'
import './HeaderLanding.css'
import { Link, useLocation, useNavigate } from 'react-router-dom';

function HeaderLanding() {
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

    const navLinkStyle = (path) => `
    relative text-sm font-medium py-1 transition-colors duration-200
    ${location.pathname === path ? 'text-[#2C2D86] font-semibold' : 'text-gray-600 hover:text-[#2C2D86]'}
    after:absolute after:bottom-0 after:left-0 after:h-[2px] after:bg-[#2C2D86] 
    after:transition-all after:duration-300
    ${location.pathname === path ? 'after:w-full' : 'after:w-0 hover:after:w-full'}
  `;
    
  return (
    <header className="fixed top-0 left-0 right-0 w-full my-header z-[120] bg-white/90 backdrop-blur-md border-b border-gray-100">
      {/* Top bar */}
      <div className="max-w-7xl mx-auto flex justify-between items-center px-4 sm:px-6 py-3">
        {/* Logo + Name */}
        <div className="flex items-center gap-2">
          <img src={logo} alt="Logo" className="h-12 w-auto" />
          <h3 className="text-[#2C2D86] font-bold text-base">PNP-AMORES</h3>
        </div>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          <nav className="flex items-center gap-8">
            <Link to={'/'} className={navLinkStyle('/')}>
              Home
            </Link>
            <a 
              href="#about-us" 
              onClick={handleAboutClick} 
              className={navLinkStyle('#about-us')}
            >
              About Us
            </a>
            <Link to={'/track-application'} className={navLinkStyle('/track-application')}>
              Track Application
            </Link>
          </nav>
        </div>

        {/* Mobile Toggle Button */}
        <button
          className="md:hidden flex flex-col gap-1.5 p-2 cursor-pointer focus:outline-none"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span className={`block w-6 h-0.5 bg-[#2C2D86] transition-all duration-300 ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
          <span className={`block w-6 h-0.5 bg-[#2C2D86] transition-all duration-300 ${menuOpen ? "opacity-0" : ""}`} />
          <span className={`block w-6 h-0.5 bg-[#2C2D86] transition-all duration-300 ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
        </button>
      </div>

      {/* Mobile Drawer */}
      <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${menuOpen ? "max-h-[350px]" : "max-h-0"}`}>
        <nav className="flex flex-col items-center gap-2 px-6 pb-5 pt-2 border-t border-gray-100 bg-white/95 backdrop-blur-md">
          <Link 
            to={'/'} 
            className="text-sm w-full text-center py-2.5 text-gray-700 hover:text-[#2C2D86] hover:bg-slate-50 rounded-lg transition-colors font-medium" 
            onClick={() => setMenuOpen(false)}
          >
            Home
          </Link>
          <a 
            href="#about-us" 
            className="text-sm w-full text-center py-2.5 text-gray-700 hover:text-[#2C2D86] hover:bg-slate-50 rounded-lg transition-colors font-medium" 
            onClick={handleAboutClick}
          >
            About Us
          </a>
          <Link 
            to={'/track-application'} 
            className="text-sm w-full text-center py-2.5 text-gray-700 hover:text-[#2C2D86] hover:bg-slate-50 rounded-lg transition-colors font-medium" 
            onClick={() => setMenuOpen(false)}
          >
            Track Application
          </Link>
        </nav>
      </div>
    </header>
  )
}

export default HeaderLanding
