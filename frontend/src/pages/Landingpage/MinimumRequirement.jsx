import React from "react";

function MinimumRequirement() {
  const requirementsData = [
    {
      id: "01",
      title: "PERSONAL PROFILE",
      points: [
        "At least 21 years old...",
        "Must not more than 30 years old...",
        "Natural born Filipino",
      ],
    },
    { id: "02", title: "EDUCATION ATTAINMENT", points: ["Baccalaureate"] },
    {
      id: "03",
      title: "PHYSICAL STANDARDS",
      points: [
        "Must be physically fit",
        "Male: min 157 cm",
        "Female: min 152 cm",
        "Weight proportionate to height",
      ],
    },
    {
      id: "04",
      title: "CHARACTER & BACKGROUND",
      points: [
        "No criminal records",
        "No pending cases",
        "Good moral character",
        "Not a member of illegal org",
      ],
    },
  ];

  const generalRequirements = [
    {
      id: "01",
      title: "DOCUMENTARY REQUIREMENTS",
      points: [
        "PSA birth certificate",
        "Diploma & transcript",
        "NBI and Police clearances",
        "Barangay clearance",
        "Medical results",
      ],
    },
    {
      id: "02",
      title: "ADDITIONAL CRITERIA",
      points: [
        "Pass written exam",
        "Pass Physical Agility Test",
        "Pass medical/neuro exams",
        "Pass background investigation",
      ],
    },
  ];

  const Qualifications = ({ id, title, points }) => (
    <div className="border-2 border-[#2C2D86] p-6 rounded-lg bg-white shadow-sm">
      <div className="flex justify-between items-start">
        <h3 className="text-[#2C2D86] font-bold text-xl">{title}</h3>
        <span className="text-[#EB612A] font-bold text-3xl opacity-50">
          {id}
        </span>
      </div>
      <ul className="mt-4 space-y-2 text-gray-700">
        {points.map((pt, i) => (
          <li key={i} className="flex items-start">
            <span className="mr-2 text-[#EB612A]">•</span> {pt}
          </li>
        ))}
      </ul>
    </div>
  );

  const GeneralReq = ({ id, title, points }) => (
    <div className="border-2 border-[#2C2D86] p-6 rounded-lg bg-white shadow-sm">
      <div className="flex justify-between items-start">
        <h3 className="text-[#2C2D86] font-bold text-xl">{title}</h3>
        <span className="text-[#EB612A] font-bold text-3xl opacity-50">
          {id}
        </span>
      </div>
      <ul className="mt-4 space-y-2 text-gray-700">
        {points.map((pt, i) => (
          <li key={i} className="flex items-start">
            <span className="mr-2 text-[#EB612A]">•</span> {pt}
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <div className="bg-gray-100 p-10 lg:p-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center gap-3">
          <div className="h-[2px] w-8 bg-[#EB612A]"></div>
          <span className="uppercase tracking-[0.3em] text-[10px] md:text-xs font-bold text-gray-500">
            Who may apply
          </span>
        </div>
        <h2 className="text-[#2C2D86] text-4xl font-black mb-2">
          GENERAL QUALIFICATIONS
        </h2>
        <div className="w-40 h-1 bg-[#EB612A] mb-10"></div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {requirementsData.map((item) => (
            <Qualifications key={item.id} {...item} />
          ))}
        </div>

        <div className="mt-6">
          <div className="mb-6">
            <h2 className="text-[#2C2D86] text-3xl md:text-4xl font-black tracking-tight mb-2">
              GENERAL REQUIREMENTS
            </h2>
            <div className="w-40 h-1 bg-[#EB612A]"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {generalRequirements.map((item) => (
              <GeneralReq key={item.id} {...item} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MinimumRequirement;
