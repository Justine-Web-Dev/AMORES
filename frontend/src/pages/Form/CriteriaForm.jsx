import React from "react";
const CRITERIA_FIELD = [
  {
    key: "fiPatriotism",
    title: "I. PATRIOTISM AND SERVICE ORIENTATION",
    max: 25,
  },
  {
    key: "fiIntegrity",
    title: "II. INTEGRITY/VALUES",
    max: 25,
  },
  {
    key: "fiAwareness",
    title: "III. AWARENESS OF ISSUES",
    max: 25,
  },
  {
    key: "fiCommunication",
    title: "IV. COMMUNICATION SKILLS",
    max: 25,
  },
];

function CritriaField({ label, max, value, onChange, disabled }) {
  const handleChange = (e) => {
    let val = e.target.value;
    if (val !== "" && parseFloat(val) > max) val = String(max);
    if (val !== "" && parseFloat(val) < 0) val = "0";
    onChange(val);
  };
  return (
    <div className="flex flex-col h-full">
      <h4 className="flex-grow text-sm font-bold text-[#2C2D86] mb-3 border-b border-gray-100 pb-2">
        {label} ({max} pts)
      </h4>
      <input
        type="number"
        min="0"
        max={max}
        step="0.1"
        value={value}
        onChange={handleChange}
        disabled={disabled}
        placeholder={`Score /${max}`}
        className={`w-full p-2.5 border border-gray-300 rounded-md text-sm outline-none focus:border-[#2C2D86] focus:ring-1 focus:ring-[#2C2D86] transition-all bg-gray-50 ${
          disabled ? "cursor-not-allowed opacity-70" : ""
        }`}
      />
    </div>
  );
}

function CriteriaForm({ values, onChange, isInterviewer, totalScore, disabled }) {
  return (
    <>
      <div className="grid grid-cols-2 gap-6 items-stretch">
        {CRITERIA_FIELD.map((field) => (
          <CritriaField
            key={field.key}
            label={field.title}
            max={field.max}
            value={values[field.key]}
            onChange={(val) => onChange(field.key, val)}
            disabled={!isInterviewer || disabled}
          />
        ))}
      </div>

      {/* Total Score */}
      <div className="sticky bottom-0 mt-6 border-t-2 border-gray-200 flex justify-between items-center bg-white p-4 rounded-b-lg shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.05)] z-10">
        <span className="text-base font-bold text-gray-800 uppercase tracking-wider">
          Total Score (100%):
        </span>
        <span
          className={`text-2xl font-black ${totalScore !== "" && totalScore !== null && parseFloat(totalScore) >= 70 ? "text-emerald-600" : "text-rose-600"}`}
        >
          {totalScore !== "" && totalScore !== null
            ? parseFloat(totalScore).toFixed(2)
            : "0.00"}
          %
        </span>
      </div>
    </>
  );
}

export default CriteriaForm;
