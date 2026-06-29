import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useScrollFade } from "../../useScrollFade";
import {
  HiOutlineCalendar,
  HiOutlineClipboardList,
  HiOutlineShieldCheck,
  HiArrowDown,
} from "react-icons/hi";
import "./LandingPageCss.css";
import AboutUs from "./AboutUs";
import Disclaimer from "../../Disclaimer";
import MinimumRequirement from "./MinimumRequirement";
import ApplicationProcess from "./ApplicationProcess";
import CalltoAction from "./CalltoAction";
import Footer from "../../Components/Footer/Footer";

// Image background imports
import bg1 from "../../assets/images/727158067_2118460255377570_254947536452482548_n.jpg";
import bg2 from "../../assets/images/727360558_2566632383766999_5332584861504799298_n.jpg";
import bg3 from "../../assets/images/727952682_1637535293985983_860112837579623096_n.jpg";
import bg4 from "../../assets/images/727952683_2248963705637351_5043322309707676461_n.jpg";
import bg5 from "../../assets/images/728439167_1570837254443057_571321623228497709_n.jpg";
import bg6 from "../../assets/images/729412827_1026276266459191_2529112448732116789_n.jpg";
import bg7 from "../../assets/images/729466576_1688058115766079_6099788687347698879_n.jpg";
import bg8 from "../../assets/images/729602774_2357531428376591_261620938935035837_n.jpg";
import bg9 from "../../assets/images/730244215_2128347391064463_6938904268787833576_n.jpg";

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
  const [currentBgIndex, setCurrentBgIndex] = useState(0);
  const navigate = useNavigate();
  const requirementsRef = useRef(null);

  // Grouping all your imported assets into an array for the background loop
  const backgroundImages = [bg1, bg2, bg3, bg4, bg5, bg6, bg7, bg8, bg9];

  useEffect(() => {
    const sessionAccepted = sessionStorage.getItem(
      "disclaimer_accepted_session",
    );
    if (!sessionAccepted) {
      setShowDisclaimer(true);
    }

    // Rotates the hero background image every 5 seconds
    const bgTimer = setInterval(() => {
      setCurrentBgIndex(
        (prevIndex) => (prevIndex + 1) % backgroundImages.length,
      );
    }, 5000);

    return () => clearInterval(bgTimer);
  }, [backgroundImages.length]);

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
    requirementsRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const getSafeDate = (dateStr) => {
    if (!dateStr) return null;
    const [year, month, day] = dateStr.split("-").map(Number);
    return new Date(year, month - 1, day);
  };

  const endDateObject = getSafeDate(appDates?.end);

  return (
    <div className="bg-slate-50 min-h-screen font-sans overflow-x-hidden">
      {showDisclaimer && (
        <Disclaimer onAccept={handleAccept} onCancel={handleCancel} />
      )}

      {/* Vibrant Light Background Hero Section */}
      <section className="relative min-h-[90vh] lg:min-h-screen flex items-center pt-24 pb-16 overflow-hidden bg-slate-100">
        {/* Dynamic Image Layers at higher clarity opacity */}
        {backgroundImages.map((bgImage, index) => (
          <div
            key={index}
            className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out"
            style={{
              backgroundImage: `url(${bgImage})`,
              opacity: index === currentBgIndex ? 0.75 : 0,
              zIndex: index === currentBgIndex ? 1 : 0,
            }}
          />
        ))}

        {/* Crisp Light Gradient Masks ensuring text and cards pull focus cleanly */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-50/95 via-slate-50/80 to-transparent z-10 hidden lg:block" />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-50/90 via-slate-50/85 to-slate-50 z-10 lg:hidden" />

        {/* Content Wrapper */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-20">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-8">
            {/* Left Column: Core Message */}
            <div className="flex flex-col items-center lg:items-start text-center lg:text-left w-full lg:w-1/2 space-y-6">
              <div className="inline-flex items-center gap-3 px-3 py-1 bg-[#2C2D88]/10 backdrop-blur-sm rounded-full border border-[#2C2D88]/20 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-[#EB612A] animate-ping" />
                <span className="uppercase tracking-widest text-[11px] md:text-xs font-bold text-[#2C2D88]">
                  PNP Recruitment 2026
                </span>
              </div>

              <div className="space-y-4">
                <h1 className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tight text-[#2C2D88] italic uppercase leading-none drop-shadow-sm select-none">
                  <span>Serve.</span>
                  <br />
                  <span className="text-[#EB612A]">Protect.</span>
                  <br />
                  <span>Honor.</span>
                </h1>

                <p className="text-gray-800 font-medium text-base md:text-lg max-w-lg leading-relaxed bg-white/60 backdrop-blur-xs p-3 rounded-xl border border-white/40 shadow-xs">
                  Join the Philippine National Police force today. We are
                  looking for honorable, dedicated, and disciplined citizens
                  committed to protecting public safety and upholding justice
                  across our nation.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto pt-2">
                {isApplicationOpen && endDateObject ? (
                  <button
                    onClick={handleStartApp}
                    className="w-full sm:w-auto px-8 py-4 bg-[#EB612A] hover:bg-[#d55320] text-white font-bold text-sm tracking-wider uppercase rounded-lg shadow-md hover:shadow-xl transition-all duration-200 active:scale-95 focus:outline-none focus:ring-4 focus:ring-orange-300"
                  >
                    Start Application
                  </button>
                ) : (
                  <div className="flex flex-col items-center sm:items-start gap-1 w-full sm:w-auto">
                    <button
                      disabled
                      className="w-full sm:w-auto px-8 py-4 bg-gray-300 text-gray-500 font-bold text-sm tracking-wider uppercase rounded-lg cursor-not-allowed opacity-75"
                    >
                      {endDateObject
                        ? "Applications Closed"
                        : "Applications TBA"}
                    </button>
                    <span className="text-[10px] text-rose-600 font-bold tracking-wider uppercase mt-1">
                      {endDateObject
                        ? "Registration portal is currently inactive"
                        : "Application dates are to be announced"}
                    </span>
                  </div>
                )}

                <button
                  onClick={scrollToRequirements}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/80 hover:bg-white border border-gray-300 text-[#2C2D88] font-bold text-sm tracking-wider uppercase rounded-lg transition-all duration-200 active:scale-95 shadow-sm backdrop-blur-xs"
                >
                  View Requirements
                  <HiArrowDown className="w-4 h-4 animate-bounce" />
                </button>
              </div>
            </div>

            {/* Right Column - Informational Card */}
            <div className="w-full lg:w-[45%] bg-gradient-to-br from-[#2C2D88] to-[#1e1f5c] text-white border-t-8 border-[#EB612A] shadow-2xl rounded-2xl p-6 md:p-8 space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                <HiOutlineShieldCheck className="w-40 h-40" />
              </div>

              <div>
                <h3 className="text-[#EB612A] uppercase tracking-widest text-xs font-bold mb-1">
                  Recruitment Timeline & Target
                </h3>
                <p className="text-xs text-gray-300">
                  National standard qualifications review panel indicators
                </p>
              </div>

              <div className="space-y-4">
                {/* Stat Item 1 */}
                <div className="flex items-start gap-4 p-3 rounded-lg hover:bg-white/5 transition-colors">
                  <HiOutlineClipboardList className="w-6 h-6 text-[#EB612A] shrink-0 mt-1" />
                  <div>
                    <h4 className="text-2xl md:text-3xl font-black tracking-tight text-[#EB612A]">
                      2,400+
                    </h4>
                    <p className="text-xs text-gray-200 font-medium">
                      Available regular quotas allocated for qualified
                      candidates nationwide.
                    </p>
                  </div>
                </div>

                <div className="h-[1px] bg-white/15 w-full"></div>

                {/* Stat Item 2 */}
                <div className="flex items-start gap-4 p-3 rounded-lg hover:bg-white/5 transition-colors">
                  <HiOutlineShieldCheck className="w-6 h-6 text-[#EB612A] shrink-0 mt-1" />
                  <div>
                    <h4 className="text-2xl md:text-3xl font-black tracking-tight text-[#EB612A]">
                      16 Regional
                    </h4>
                    <p className="text-xs text-gray-200 font-medium">
                      Police Offices actively evaluating documentation channels
                      simultaneously.
                    </p>
                  </div>
                </div>

                <div className="h-[1px] bg-white/15 w-full"></div>

                {/* Stat Item 3 */}
                <div className="flex items-start gap-4 p-3 rounded-lg hover:bg-white/5 transition-colors">
                  <HiOutlineCalendar className="w-6 h-6 text-[#EB612A] shrink-0 mt-1" />
                  <div>
                    <h4 className="text-2xl md:text-3xl font-black tracking-tight text-[#EB612A] uppercase">
                      {endDateObject
                        ? endDateObject.toLocaleString("en-US", {
                            month: "long",
                            day: "numeric",
                          })
                        : "TBA"}
                    </h4>
                    <p className="text-xs text-gray-200 font-medium">
                      Strict statutory deadline for completing original
                      documentation uploads.
                    </p>
                  </div>
                </div>
              </div>

              {/* Strategic Banner Tagline */}
              <div className="bg-white/5 border-l-4 border-[#EB612A] p-4 rounded-r-lg">
                <p className="text-xs md:text-sm italic text-slate-200 leading-relaxed">
                  <span className="font-bold text-white block not-italic mb-0.5">
                    "Serbisyo sa Bayan"
                  </span>
                  Our enduring sacred vow to defend, secure, and serve our
                  communities with utmost discipline.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dynamic Infinite Text Ticker Loop */}
      <div className="bg-white border-y border-gray-200 py-3 overflow-hidden shadow-sm select-none ticker">
        <div className="flex whitespace-nowrap animate-ticker inline-block ticker-track">
          {[...Array(4)].map((_, idx) => (
            <div
              key={idx}
              className="flex items-center space-x-12 mx-6 text-sm font-semibold tracking-wide uppercase text-gray-600"
            >
              <span className="inline-flex items-center gap-1.5 font-bold">
                {isApplicationOpen && endDateObject ? (
                  <span className="text-emerald-600">
                    {" "}
                    🟢 Applications Active Now
                  </span>
                ) : !endDateObject ? (
                  <span className="text-amber-500"> 🟡 Applications TBA</span>
                ) : (
                  <span className="text-rose-600">
                    {" "}
                    🔴 Applications Offline
                  </span>
                )}
              </span>
              <span>·</span>
              <span className="text-[#2C2D88]">
                Philippine National Police Recruitment Cycle 2026
              </span>
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
          <CalltoAction
            isApplicationOpen={isApplicationOpen}
            endDateObject={endDateObject}
          />
        </FadeInSection>
      </main>

      <Footer />
    </div>
  );
};

export default LandingPage;
