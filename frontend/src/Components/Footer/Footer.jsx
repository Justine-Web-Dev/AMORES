import React from 'react';
import logo from '../../assets/RRSU1 logo.png'

const Footer = () => {
  return (
    <footer className="bg-white border-t-4 border-[#2C2D86] text-[#2C2D86] pt-16 pb-8 px-10">
      <div className="max-w-7xl grid grid-cols-1 md:grid-cols-4 gap-12">
        
        {/* Logo & Motto */}
        <div className="col-span-1 md:col-span-1">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-20 h-20 rounded-md flex items-center justify-center text-white font-bold">
              <img src={logo} alt="Logo" />
            </div>
            <h2 className="font-black text-xl leading-tight">PHILIPPINE<br/>NATIONAL POLICE</h2>
          </div>
          <p className="text-sm italic opacity-70">"Serbisyo sa Bayan" — Protecting and serving every Filipino with honor, courage, and integrity.</p>
        </div>

        {/* Links Columns */}
        {[
          { title: 'RECRUITMENT', links: ['How to Apply', 'Requirements', 'Open Positions', 'Exam Schedules', 'FAQs'] },
          { title: 'ABOUT PNP', links: ['Our Mission', 'History', 'Leadership', 'Units & Commands', 'Regional Offices'] },
          { title: 'CONTACT', links: ['PNP Hotline: 117', 'Camp Crame, LU', 'pnprecruit@pnp.gov.ph', 'Facebook Page', 'pnp.gov.ph'] }
        ].map((section) => (
          <div key={section.title}>
            <h4 className="text-[#EB612A] font-bold tracking-widest mb-6 text-sm">{section.title}</h4>
            <ul className="space-y-4">
              {section.links.map((link) => (
                <li key={link} className="text-sm font-medium hover:text-[#EB612A] cursor-pointer transition-colors">
                  {link}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto border-t border-[#2C2D86]/20 pt-8 flex flex-col md:flex-row justify-between text-xs opacity-60">
        <p>© 2026 PHILIPPINE NATIONAL POLICE. ALL RIGHTS RESERVED.</p>
        <p>REPUBLIC OF THE PHILIPPINES</p>
      </div>
    </footer>
  );
};

export default Footer;