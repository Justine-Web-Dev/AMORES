import React from 'react'

function FormInput({ label, placeholder, value, onChange, onBlur, disabled }) {
  return (
    <div className="flex-1">
      <label className="text-xs font-bold text-gray-500 uppercase">{label}</label>
      <input
        type="number"
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full p-2 border border-gray-300 rounded mt-1 text-sm h-[38px] focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all ${
          disabled ? 'bg-gray-100 cursor-not-allowed' : ''
        }`}
      />
    </div>
  )
}

function BmiStamp({ isPassing, bmiVal, rejectionReason }) {
  const isUnderweight = bmiVal < 18.5
  const statusType = isUnderweight ? 'UNDERWEIGHT' : 'OVERWEIGHT'
  const defaultReason = `${isUnderweight ? 'Underweight' : 'Overweight'}. Calculated BMI is ${bmiVal.toFixed(1)} (Normal range: 18.5 - 25.0).`

  const colorClass = isPassing
    ? 'text-emerald-600 border-emerald-600 bg-emerald-50/40'
    : 'text-rose-600 border-rose-600 bg-rose-50/40'

  return (
    <div className="flex flex-col items-center justify-center mt-6">
      <div className={`stamp-animation stamp-circle ${colorClass}`}>
        <div className="stars">★★★</div>
        <div className="stamp-text">{isPassing ? 'PASSED' : 'FAILED'}</div>
        <div className="stamp-subtext">{isPassing ? 'BMI' : statusType}</div>
        <div className="stars">★★★</div>
      </div>

      {!isPassing && (
        <div className="mt-3 text-center max-w-[280px]">
          <p className="text-xs font-semibold text-rose-600 bg-rose-50 px-3 py-2 rounded border border-rose-100 shadow-sm">
            {rejectionReason || defaultReason}
          </p>
        </div>
      )}
    </div>
  )
}

export default function BmiForm({
  bmiHeight,
  setBmiHeight,
  handleBmiBlur,
  bmiWeight,
  setBmiWeight,
  bmiVal,
  isBmiPassing,
  rejectionReason,
  schDate,
  schTime,
}) {
  const isDisabled = !schDate || !schTime

  const resultColorClass =
    bmiVal === null
      ? 'bg-gray-50 border-gray-200 text-gray-700'
      : isBmiPassing
        ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
        : 'bg-rose-50 border-rose-300 text-rose-700'

  return (
    <div className="pt-2 space-y-3">
      <div className="flex gap-4">
        <FormInput
          label="Height (cm)"
          placeholder="cm"
          value={bmiHeight}
          onChange={(e) => setBmiHeight(e.target.value)}
          onBlur={handleBmiBlur}
          disabled={isDisabled}
        />

        <FormInput
          label="Weight (kg)"
          placeholder="kg"
          value={bmiWeight}
          onChange={(e) => setBmiWeight(e.target.value)}
          onBlur={handleBmiBlur}
          disabled={isDisabled}
        />

        <div className="flex-1">
          <label className="text-xs font-bold text-gray-500 uppercase">
            BMI (Calculated)
          </label>
          <input
            type="text"
            readOnly
            value={bmiVal != null ? bmiVal.toFixed(1) : ''}
            placeholder="Result"
            className={`w-full p-2 border rounded mt-1 text-sm h-[38px] font-semibold focus:outline-none transition-all duration-300 ${resultColorClass}`}
          />
        </div>
      </div>

      {bmiVal !== null && (
        <BmiStamp
          isPassing={isBmiPassing}
          bmiVal={bmiVal}
          rejectionReason={rejectionReason}
        />
      )}
    </div>
  )
}