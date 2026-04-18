import React from 'react';

const CalltoAction = () => {
  return (
    // Main Container (bg-gray-100 to match requirements section)
    <div className="bg-gray-100 flex flex-col items-center justify-center p-20 py-32 min-h-screen">
      <div className="max-w-4xl w-full flex flex-col items-center text-center">
        
        {/* Top Header Section */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-[1.5px] bg-[#2C2D86]/50"></div>
          <p className="text-[#2C2D86] text-xs font-semibold uppercase tracking-widest opacity-80">
            TAKE THE OATH
          </p>
          <div className="w-10 h-[1.5px] bg-[#2C2D86]/50"></div>
        </div>

        {/* The Headline (Blue and Accent Orange-Red) */}
        <h1 className="text-6xl md:text-7xl font-extrabold uppercase mb-8 leading-tight tracking-tight">
          <span className="text-[#2C2D86]">READY TO</span>{' '}
          <span className="text-[#EB612A]">SERVE THE</span>{' '}
          <br />
          <span className="text-[#2C2D86]">NATION?</span>
        </h1>

        {/* The Subtitle (Text Color - Blue) */}
        <p className="text-[#2C2D86]/90 text-xl font-medium max-w-2xl mb-16 leading-relaxed">
          Your decision to join the Philippine National Police is a commitment to
          something greater than yourself. Applications for 2025 are now open —
          don't miss this opportunity to become a guardian of peace.
        </p>

        {/* Button Container (Flexbox) */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-6 w-full">
          
          {/* Primary CTA (Filled - Accent Color) */}
          <button
            className=" text-center bg-[#EB612A] text-white px-10 py-5 rounded-lg text-lg font-extrabold uppercase tracking-wide hover:bg-[#EB612A]/90 transition-colors shadow-md cursor-pointer"
          >
            APPLY ONLINE NOW
          </button>

          {/* Secondary CTA (Outlined - Text Color) */}
          <button
            className=" text-center border-2 border-[#2C2D86] text-[#2C2D86] px-10 py-4 rounded-lg text-lg font-bold uppercase tracking-wide hover:bg-[#2C2D86]/10 transition-colors cursor-pointer"
          >
            LEARN MORE
          </button>
        </div>
      </div>
    </div>
  );
};

export default CalltoAction;