import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom'
import { useScrollFade } from '../../useScrollFade';
import axios from 'axios';
import './LandingPageCss.css';
import AboutUs from './AboutUs';
import Disclaimer from '../../Disclaimer';
import MinimumRequirement from './MinimumRequirement';
import ApplicationProcess from './ApplicationProcess';
import CalltoAction from './CalltoAction';
import Footer from '../../Components/Footer/Footer';

const FadeInSection = ({ children }) => {
  const [ref, isVisible] = useScrollFade();
  return (
    <div 
      ref={ref} 
      className={`transition-all duration-1000 ease-out transform ${
        isVisible 
          ? 'opacity-100 translate-y-0' 
          : 'opacity-0 translate-y-20'
      }`}
    >
      {children}
    </div>
  );
};

const LandingPage = ({ isApplicationOpen, appDates }) => {
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const navigate = useNavigate()
  const requirementsRef = useRef(null);


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

  const handleStartApp = () =>{
    if (isApplicationOpen) {
      navigate("/form-application")
    }
  }

  const scrollToRequirements = () => {
    requirementsRef.current?.scrollIntoView({ behavior: 'smooth' });
  };


  return (
    <div className="bg-gray-100 home-landing-page ">
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
            {isApplicationOpen ? (
              <button 
                onClick={handleStartApp}
                className="bg-[#EB612A] cursor-pointer application-btn">
                Start Application
              </button>
            ) : (
              <div className="flex flex-col gap-2">
                <button 
                  disabled
                  className="bg-gray-400 cursor-not-allowed application-btn opacity-70">
                  Applications Closed
                </button>
                <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest">Currently not accepting new applicants</p>
              </div>
            )}
            <button 
            onClick={scrollToRequirements}
            className="btn-req cursor-pointer">
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
                  {appDates?.end ? new Date(appDates.end).toLocaleString('en-US', { month: 'long' }) : 'May'}
                </h2>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-none uppercase text-[#EB612A]">
                  {appDates?.end ? `'${new Date(appDates.end).getDate().toString().slice(-2)}` : "26"}
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

      <FadeInSection><AboutUs /></FadeInSection>
      <div ref={requirementsRef}>
        <FadeInSection><MinimumRequirement /></FadeInSection>
      </div>
      <FadeInSection><ApplicationProcess /></FadeInSection>
      <FadeInSection><CalltoAction isApplicationOpen={isApplicationOpen} /></FadeInSection>

      <div className='absolute left-0 right-0'>
        <Footer />
      </div>
    </div>
  );
};

export default LandingPage;