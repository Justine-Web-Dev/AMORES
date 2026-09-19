import React from "react";


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

function CriteriaForm({ criteriaList = [], values = {}, onChange, isInterviewer, totalScore, disabled, maxTotal = 100 }) {
  return (
    <>
      <div className="grid grid-cols-2 gap-6 items-stretch">
        {criteriaList.map((field) => (
          <CritriaField
            key={field.id}
            label={field.name}
            max={field.max_score}
            value={values[field.id] || ""}
            onChange={(val) => onChange(field.id, val)}
            disabled={!isInterviewer || disabled}
          />
        ))}
      </div>

      {/* Total Score */}
      <div className="sticky bottom-0 mt-6 border-t-2 border-gray-200 flex justify-between items-center bg-white p-4 rounded-b-lg shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.05)] z-10">
        <span className="text-base font-bold text-gray-800 uppercase tracking-wider">
          Total Score ({maxTotal}%):
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
