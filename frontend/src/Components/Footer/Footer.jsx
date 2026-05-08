import React from 'react';
import logo from '../../assets/RRSU1 logo.png'

const Footer = () => {
  return (
    <footer className="relative bottom-0 w-full bg-white border-t-4 border-[#2C2D86] text-[#2C2D86] pt-20 pb-12 px-6 xl:px-20">
      <div className="max-w-[1536px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-24">
        
        {/* Logo & Motto */}
        <div className="col-span-1">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 lg:w-20 lg:h-20 flex items-center justify-center">
              <img src={logo} alt="Logo" className="w-full h-full object-contain" />
            </div>
            <h2 className="font-black text-xl lg:text-2xl leading-tight">PHILIPPINE<br/>NATIONAL POLICE</h2>
          </div>
          <p className="text-sm italic opacity-70 leading-relaxed max-w-sm">"Serbisyo sa Bayan" — Protecting and serving every Filipino with honor, courage, and integrity.</p>
        </div>

        {/* Links Columns */}
        {[
          { title: 'RECRUITMENT', links: ['How to Apply', 'Requirements', 'Open Positions', 'Exam Schedules', 'FAQs'] },
          { title: 'ABOUT PNP', links: ['Our Mission', 'History', 'Leadership', 'Units & Commands', 'Regional Offices'] },
          { title: 'CONTACT', links: ['PNP Hotline: 117', 'Camp Crame, LU', 'pnprecruit@pnp.gov.ph', 'Facebook Page', 'pnp.gov.ph'] }
        ].map((section) => (
          <div key={section.title}>
            <h4 className="text-[#EB612A] font-bold tracking-[0.2em] mb-8 text-xs lg:text-sm uppercase">{section.title}</h4>
            <ul className="space-y-4">
              {section.links.map((link) => (
                <li key={link} className="text-sm font-medium hover:text-[#EB612A] cursor-pointer transition-colors duration-300">
                  {link}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom Bar */}
      <div className="max-w-[1536px] mx-auto border-t border-[#2C2D86]/20 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center text-[10px] lg:text-xs opacity-60 tracking-widest uppercase">
        <p>© 2026 PHILIPPINE NATIONAL POLICE. ALL RIGHTS RESERVED.</p>
        <p className="mt-4 md:mt-0">REPUBLIC OF THE PHILIPPINES</p>
      </div>
    </footer>
  );
};

export default Footer;
