import React, { useState,useEffect } from 'react';
import './LandingPageCss.css';
import AboutUs from './AboutUs';
import Disclaimer from '../../Disclaimer';

const LandingPage = () => {
const [showDisclaimer, setShowDisclaimer] = useState(false);

  useEffect(() => {
    const sessionAccepted = sessionStorage.getItem('disclaimer_accepted_session');

    if (!sessionAccepted) {
      setShowDisclaimer(true);
    }
  }, []);

  const handleAccept = () => {
        sessionStorage.setItem('disclaimer_accepted_session', 'true');
        setShowDisclaimer(false);
      };

  const handleCancel = () => {
    window.location.href = 'https://www.google.com';
  };

  return (
    <div className="bg-gray-100 home-landing-page pt-20 md:pt-28">
      {showDisclaimer && (
        <Disclaimer onAccept={handleAccept} onCancel={handleCancel} />
      )}

      <section className="flex flex-col lg:flex-row items-start justify-between hero-section max-w-6xl mx-auto w-full">
        
        {/* Left Column */}
        <div className="flex flex-col text-[#2C2D88] items-center lg:items-start text-center lg:text-left w-full lg:w-1/2 content-left">
          
          <div className="flex items-center gap-3">
            <div className="h-[2px] w-8 bg-[#EB612A]"></div>
            <span className="uppercase tracking-[0.3em] text-[10px] md:text-xs font-bold text-gray-500">
              PNP Recruitment 2026
            </span>
          </div>

          <div className="leading-none">
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-black italic flex flex-col uppercase delay-1">
              <span>Serve.</span>
              <span className="text-[#EB612A]">Protect.</span>
              <span>Honor.</span>
            </h1>

            <p className="text-gray-700 text-sm sm:text-base md:text-lg max-w-md leading-relaxed hero-heading delay-2">
              Join the Philippine National Police and become part of a force committed to 
              upholding peace, justice, and public safety across the nation.
            </p>
          </div>

          <div className="button-group delay-3">
            <button className="bg-[#EB612A] application-btn">
              Start Application
            </button>
            <button className="btn-req">
              View Requirements
            </button>
          </div>
        </div>

        {/* Right Column */}
        <div className="bg-[#2C2D88] text-white border-t-8 border-[#EB612A] shadow-2xl w-full lg:w-[45%] info-card">
          
          <h3 className="text-[#EB612A] uppercase tracking-[0.2em] text-xs font-bold card-title">
            Recruitment at a Glance
          </h3>

          <div className="flex flex-col">
            {/* Stat 1 */}
            <div className="flex items-center gap-4 stat-item">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#EB612A] leading-none min-w-[80px] md:min-w-[120px]">
                2,400+
              </h2>
              <p className="text-xs md:text-sm text-gray-200 italic">
                Slots available for qualified applicants nationwide
              </p>
            </div>

            <div className="h-[1px] bg-white/20 w-full mb-6"></div>

            {/* Stat 2 */}
            <div className="flex items-center gap-4 stat-item">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-none min-w-[80px] md:min-w-[120px] text-[#EB612A]">
                16
              </h2>
              <p className="text-xs md:text-sm text-gray-200 italic">
                Regional police offices accepting applications
              </p>
            </div>

            <div className="h-[1px] bg-white/20 w-full mb-6"></div>

            {/* Stat 3 */}
            <div className="flex items-center gap-4 stat-item">
              <div className="min-w-[80px] md:min-w-[120px]">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-none uppercase text-[#EB612A]">
                  May
                </h2>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-none uppercase text-[#EB612A]">
                  '26
                </h2>
              </div>
              <p className="text-xs md:text-sm text-gray-200 italic">
                Deadline for submission of documents
              </p>
            </div>
          </div>

          <div className="bg-white/10 border-l-4 border-[#EB612A] quote-box">
            <p className="text-xs md:text-sm italic text-gray-200">
              <span className="font-bold text-white">"Serbisyo sa Bayan"</span> — Our commitment to serve with honor and dedication.
            </p>
          </div>
        </div>

      </section>

      <div className='bg-gray-100 ticker'>
        <div className="ticker-track">
          <div className="ticker-item">Applications Now Open</div>
          <div className="ticker-item">Philippine National Police Recruitment 2026</div>
          <div className="ticker-item">Serve Your Country</div>
          <div className="ticker-item">Be a Force for Good</div>
          <div className="ticker-item">· You Aspire We Inspire</div>
          <div className="ticker-item">Applications Now Open</div>
          <div className="ticker-item">Philippine National Police Recruitment 2026</div>
          <div className="ticker-item">Serve Your Country</div>
          <div className="ticker-item">Be a Force for Good</div>
          <div className="ticker-item">· You Aspire We Inspire</div>
          <div className="ticker-item">Applications Now Open</div>
          <div className="ticker-item">Philippine National Police Recruitment 2026</div>
          <div className="ticker-item">Serve Your Country</div>
          <div className="ticker-item">Be a Force for Good</div>
          <div className="ticker-item">· You Aspire We Inspire</div>
        </div>
      </div>

      <AboutUs />

    </div>
  );
};

export default LandingPage;