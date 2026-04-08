import React from 'react';
import './LandingPageCss.css';

const PNPLanding = () => {
  return (
    <div className="bg-gray-100 home-landing-page pt-28">
      <section className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 items-center hero-section">
        
        {/* Left Column */}
        <div className="flex flex-col text-[#2C2D88] content-left items-center lg:items-start text-center lg:text-left">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-[2px] w-8 bg-[#EB612A]"></div>
            <span className="uppercase tracking-[0.3em] text-[10px] md:text-xs font-bold text-gray-500">
              PNP Recruitment 2026
            </span>
          </div>

          <div className="leading-none">
            {/* Responsive font size: 5xl on mobile, 7xl on desktop */}
            <h1 className="text-5xl md:text-7xl font-black italic flex flex-col uppercase delay-1">
              <span>Serve.</span>
              <span className="text-[#EB612A]">Protect.</span>
              <span>Honor.</span>
            </h1>
            <p className="text-gray-700 text-base md:text-lg max-w-md leading-relaxed hero-heading delay-2">
              Join the Philippine National Police and become part of a force committed to 
              upholding peace, justice, and public safety across the nation.
            </p>
          </div>

          <div className="button-group delay-3">
            <button className="bg-[#EB612A] hover:bg-[#d45624] text-white font-bold uppercase tracking-wider transition-colors shadow-lg start-application">
              Start Application
            </button>
            <button className="font-bold uppercase tracking-widest text-[#2C2D88] ">
              View Requirements
            </button>
          </div>
        </div>

        {/* Right Column (Info Card) */}
        <div className="bg-[#2C2D88] text-white border-t-8 border-[#EB612A] shadow-2xl info-card w-full">
          <h3 className="text-[#EB612A] uppercase tracking-[0.2em] text-xs font-bold card-title">
            Recruitment at a Glance
          </h3>

          <div className="flex flex-col">
            {/* Stat 1 */}
            <div className="flex items-center gap-4 stat-item">
              <h2 className="text-3xl md:text-4xl font-bold text-[#EB612A] leading-none min-w-[100px] md:min-w-[120px]">2,400+</h2>
              <p className="text-xs md:text-sm text-gray-200 italic">
                Slots available for qualified applicants nationwide
              </p>
            </div>

            <div className="h-[1px] bg-white/20 w-full mb-6"></div>

            {/* Stat 2 */}
            <div className="flex items-center gap-4 stat-item">
              <h2 className="text-3xl md:text-4xl font-bold leading-none min-w-[100px] md:min-w-[120px] text-[#EB612A]">16</h2>
              <p className="text-xs md:text-sm text-gray-200 italic">
                Regional police offices accepting applications
              </p>
            </div>

            <div className="h-[1px] bg-white/20 w-full mb-6"></div>

            {/* Stat 3 */}
            <div className="flex items-center gap-4 stat-item">
              <div className="min-w-[100px] md:min-w-[120px]">
                <h2 className="text-3xl md:text-4xl font-bold leading-none uppercase text-[#EB612A]">May</h2>
                <h2 className="text-3xl md:text-4xl font-bold leading-none uppercase text-[#EB612A]">'26</h2>
              </div>
              <p className="text-xs md:text-sm text-gray-200 italic">
                Deadline for submission of documents
              </p>
            </div>
          </div>

          {/* Footer Quote */}
          <div className="bg-white/10 border-l-4 border-[#EB612A] quote-box">
            <p className="text-xs md:text-sm italic text-gray-200">
              <span className="font-bold text-white">"Serbisyo sa Bayan"</span> — Our commitment to serve with honor and dedication.
            </p>
          </div>
        </div>

      </section>
    </div>
  );
};

export default PNPLanding;