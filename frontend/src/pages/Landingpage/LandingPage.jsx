import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useScrollFade } from "../../useScrollFade";
import { HiOutlineCalendar, HiOutlineClipboardList, HiOutlineShieldCheck, HiArrowDown } from "react-icons/hi";
import "./LandingPageCss.css";
import AboutUs from "./AboutUs";
import Disclaimer from "../../Disclaimer";
import MinimumRequirement from "./MinimumRequirement";
import ApplicationProcess from "./ApplicationProcess";
import CalltoAction from "./CalltoAction";
import Footer from "../../Components/Footer/Footer";

const FadeInSection = ({ children }) => {
  const [ref, isVisible] = useScrollFade();
  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 ease-out transform ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
      }`}
    >
      {children}
    </div>
  );
};

const LandingPage = ({ isApplicationOpen = false, appDates }) => {
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const navigate = useNavigate();
  const requirementsRef = useRef(null);

  useEffect(() => {
    const sessionAccepted = sessionStorage.getItem("disclaimer_accepted_session");
    if (!sessionAccepted) {
      setShowDisclaimer(true);
    }
  }, []);

  const handleAccept = () => {
    sessionStorage.setItem("disclaimer_accepted_session", "true");
    setShowDisclaimer(false);
  };

  const handleCancel = () => {
    window.location.href = "https://www.google.com";
  };

  const handleStartApp = () => {
    if (isApplicationOpen) {
      navigate("/form-application");
    }
  };

  const scrollToRequirements = () => {
    requirementsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Helper function to safely parse YYYY-MM-DD to a localized Date object
  const getSafeDate = (dateStr) => {
    if (!dateStr) return null;
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  const endDateObject = getSafeDate(appDates?.end);

  return (
    <div className="bg-slate-50 min-h-screen font-sans overflow-x-hidden">
      {showDisclaimer && (
        <Disclaimer onAccept={handleAccept} onCancel={handleCancel} />
      )}

      {/* Hero Section */}
      <section className="relative pt-24 pb-16 md:pt-32 md:pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-8">
          
          {/* Left Column - Core Message */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left w-full lg:w-1/2 space-y-6">
            <div className="inline-flex items-center gap-3 px-3 py-1 bg-blue-50 rounded-full border border-blue-100">
              <span className="w-2 h-2 rounded-full bg-[#EB612A] animate-ping" />
              <span className="uppercase tracking-widest text-[11px] md:text-xs font-bold text-blue-900">
                PNP Recruitment 2026
              </span>
            </div>

            <div className="space-y-4">
              <h1 className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tight text-[#2C2D88] italic uppercase leading-none select-none">
                <span>Serve.</span><br />
                <span className="text-[#EB612A]">Protect.</span><br />
                <span>Honor.</span>
              </h1>

              <p className="text-gray-600 text-base md:text-lg max-w-lg leading-relaxed font-normal">
                Join the Philippine National Police force today. We are looking for honorable, 
                dedicated, and disciplined citizens committed to protecting public safety and 
                upholding justice across our nation.
              </p>
            </div>

            {/* Action Dynamic Control Group */}
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto pt-2">
              {isApplicationOpen ? (
                <button
                  onClick={handleStartApp}
                  className="w-full sm:w-auto px-8 py-4 bg-[#EB612A] hover:bg-[#d55320] text-white font-bold text-sm tracking-wider uppercase rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 focus:outline-none focus:ring-4 focus:ring-orange-300"
                >
                  Start Application
                </button>
              ) : (
                <div className="flex flex-col items-center sm:items-start gap-1 w-full sm:w-auto">
                  <button
                    disabled
                    className="w-full sm:w-auto px-8 py-4 bg-gray-300 text-gray-500 font-bold text-sm tracking-wider uppercase rounded-lg cursor-not-allowed opacity-75"
                  >
                    Applications Closed
                  </button>
                  <span className="text-[10px] text-rose-500 font-bold tracking-wider uppercase mt-1">
                    Registration portal is currently inactive
                  </span>
                </div>
              )}
              
              <button
                onClick={scrollToRequirements}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-white hover:bg-gray-50 border border-gray-300 text-[#2C2D88] font-bold text-sm tracking-wider uppercase rounded-lg transition-all duration-200 active:scale-95 shadow-sm"
              >
                View Requirements
                <HiArrowDown className="w-4 h-4 animate-bounce" />
              </button>
            </div>
          </div>

          {/* Right Column - Informational Glance Card */}
          <div className="w-full lg:w-[45%] bg-gradient-to-br from-[#2C2D88] to-[#1e1f5c] text-white border-t-8 border-[#EB612A] shadow-2xl rounded-2xl p-6 md:p-8 space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
              <HiOutlineShieldCheck className="w-40 h-40" />
            </div>
            
            <div>
              <h3 className="text-[#EB612A] uppercase tracking-widest text-xs font-bold mb-1">
                Recruitment Timeline & Target
              </h3>
              <p className="text-xs text-gray-300">National standard qualifications review panel indicators</p>
            </div>

            <div className="space-y-4">
              {/* Stat Item 1 */}
              <div className="flex items-start gap-4 p-3 rounded-lg hover:bg-white/5 transition-colors">
                <HiOutlineClipboardList className="w-6 h-6 text-[#EB612A] shrink-0 mt-1" />
                <div>
                  <h4 className="text-2xl md:text-3xl font-black tracking-tight text-[#EB612A]">2,400+</h4>
                  <p className="text-xs text-gray-200 font-medium">Available regular quotas allocated for qualified candidates nationwide.</p>
                </div>
              </div>

              <div className="h-[1px] bg-white/15 w-full"></div>

              {/* Stat Item 2 */}
              <div className="flex items-start gap-4 p-3 rounded-lg hover:bg-white/5 transition-colors">
                <HiOutlineShieldCheck className="w-6 h-6 text-[#EB612A] shrink-0 mt-1" />
                <div>
                  <h4 className="text-2xl md:text-3xl font-black tracking-tight text-[#EB612A]">16 Regional</h4>
                  <p className="text-xs text-gray-200 font-medium">Police Offices actively evaluating documentation channels simultaneously.</p>
                </div>
              </div>

              <div className="h-[1px] bg-white/15 w-full"></div>

              {/* Stat Item 3 */}
              <div className="flex items-start gap-4 p-3 rounded-lg hover:bg-white/5 transition-colors">
                <HiOutlineCalendar className="w-6 h-6 text-[#EB612A] shrink-0 mt-1" />
                <div>
                  <h4 className="text-2xl md:text-3xl font-black tracking-tight text-[#EB612A] uppercase">
                    {endDateObject ? endDateObject.toLocaleString("en-US", { month: "long", day: "numeric" }) : "TBA"}
                  </h4>
                  <p className="text-xs text-gray-200 font-medium">Strict statutory deadline for completing original documentation uploads.</p>
                </div>
              </div>
            </div>

            {/* Strategic Banner Tagline */}
            <div className="bg-white/5 border-l-4 border-[#EB612A] p-4 rounded-r-lg">
              <p className="text-xs md:text-sm italic text-slate-200 leading-relaxed">
                <span className="font-bold text-white block not-italic mb-0.5">"Serbisyo sa Bayan"</span>
                Our enduring sacred vow to defend, secure, and serve our communities with utmost discipline.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Dynamic Infinite Text Ticker Loop */}
      <div className="bg-white border-y border-gray-200 py-3 overflow-hidden shadow-sm select-none ticker">
        <div className="flex whitespace-nowrap animate-ticker inline-block ticker-track">
          {[...Array(4)].map((_, idx) => (
            <div key={idx} className="flex items-center space-x-12 mx-6 text-sm font-semibold tracking-wide uppercase text-gray-600 ">
              <span className={`inline-flex items-center gap-1.5 font-bold ${isApplicationOpen ? 'text-emerald-600' : 'text-rose-600'}`}>
                {isApplicationOpen ? "🟢 Applications Active Now" : "🔴 Applications Offline"}
              </span>
              <span>·</span>
              <span className="text-[#2C2D88]">Philippine National Police Recruitment Cycle 2026</span>
              <span>·</span>
              <span>Serve Your Fellow Citizens</span>
              <span>·</span>
              <span className="text-[#EB612A]">Protect With Honor</span>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll Sections Container */}
      <main className="space-y-4">
        <FadeInSection>
          <AboutUs />
        </FadeInSection>

        <div ref={requirementsRef} className="scroll-mt-12">
          <FadeInSection>
            <MinimumRequirement />
          </FadeInSection>
        </div>

        <FadeInSection>
          <ApplicationProcess />
        </FadeInSection>

        <FadeInSection>
          <CalltoAction isApplicationOpen={isApplicationOpen} />
        </FadeInSection>
      </main>

      <Footer />
    </div>
  );
};

export default LandingPage;