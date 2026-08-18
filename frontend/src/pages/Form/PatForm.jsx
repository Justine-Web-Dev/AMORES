import React from 'react'

const PAT_EVENTS = [
  {
    key: 'pushups',
    name: '1-Minute Push UPS',
    shortName: 'PUSH-UPS',
    labelName: 'Push-Ups',
    type: 'number',
    placeholder: 'Number',
  },
  {
    key: 'situps',
    name: '1-Minute Sit-Ups',
    shortName: 'SIT-UPS',
    labelName: 'Sit-Ups',
    type: 'number',
    placeholder: 'Number',
  },
  {
    key: 'run',
    name: '3 Kilometer Run',
    shortName: 'RUN',
    labelName: 'Run',
    type: 'text',
    placeholder: 'Time (e.g. 15:30)',
  },
]

function PatRow({ event, value, passed, onChange, onBlur, disabled, isLast }) {
  return (
    <div
      className={`grid grid-cols-[3fr_2fr_3fr] gap-4 p-3 items-center ${
        !isLast ? 'border-b border-gray-100' : ''
      }`}
    >
      <div className="font-semibold text-gray-800">{event.name}</div>
      <div>
        <input
          type={event.type}
          value={value ?? ''}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          placeholder={event.placeholder}
          className={`w-full p-2 border border-gray-300 rounded text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all ${
            disabled ? 'bg-gray-100 cursor-not-allowed' : ''
          }`}
        />
      </div>
      <div className="flex justify-center">
        {passed === null ? (
          <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
            PASSED/FAILED
          </span>
        ) : (
          <span
            className={`text-xs font-bold uppercase tracking-wider ${
              passed ? 'text-green-600' : 'text-red-500'
            }`}
          >
            {passed ? 'PASSED' : 'FAILED'}
          </span>
        )}
      </div>
    </div>
  )
}

function PatStamp({ allPassed, failedShortNames, failedLabels }) {
  if (allPassed) {
    return (
      <div className="flex justify-center mt-8 mb-4">
        <div className="stamp-animation stamp-circle text-emerald-600 border-emerald-600 bg-emerald-50/40">
          <div className="stars">★★★</div>
          <div className="stamp-text">PASSED</div>
          <div className="stamp-subtext">PAT EXAM</div>
          <div className="stars">★★★</div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex justify-center mt-8 mb-4">
      <div className="flex flex-col items-center">
        <div
          className="stamp-animation stamp-circle text-rose-600 border-rose-600 bg-rose-50/40"
          style={{ width: '150px', height: '150px' }}
        >
          <div className="stars">★★★</div>
          <div className="stamp-text">FAILED</div>
          <div className="stamp-subtext text-center w-[120px] leading-tight mt-1">
            {failedShortNames.join(', ')}
          </div>
          <div className="stars">★★★</div>
        </div>
        <div className="mt-3 text-center max-w-[280px]">
          <p className="text-xs font-semibold text-rose-600 bg-rose-50 px-3 py-2 rounded border border-rose-100 shadow-sm">
            Failed Physical Agility Test requirements in: {failedLabels.join(', ')}.
          </p>
        </div>
      </div>
    </div>
  )
}

export default function PatForm({
  schDate,
  schTime,
  patPushups,
  setPatPushups,
  setPatPushupsPassed,
  handlePatPushupsBlur,
  patPushupsPassed,
  patSitups,
  setPatSitups,
  setPatSitupsPassed,
  handlePatSitupsBlur,
  patSitupsPassed,
  patRun,
  setPatRun,
  setPatRunPassed,
  handlePatRunBlur,
  patRunPassed,
}) {
  const isDisabled = !schDate || !schTime

  const rowsData = {
    pushups: {
      value: patPushups,
      passed: patPushupsPassed,
      onChange: (e) => {
        setPatPushups(e.target.value)
        setPatPushupsPassed(null)
      },
      onBlur: handlePatPushupsBlur,
    },
    situps: {
      value: patSitups,
      passed: patSitupsPassed,
      onChange: (e) => {
        setPatSitups(e.target.value)
        setPatSitupsPassed(null)
      },
      onBlur: handlePatSitupsBlur,
    },
    run: {
      value: patRun,
      passed: patRunPassed,
      onChange: (e) => {
        setPatRun(e.target.value)
        setPatRunPassed(null)
      },
      onBlur: handlePatRunBlur,
    },
  }

  const allEvaluated =
    patPushupsPassed !== null &&
    patSitupsPassed !== null &&
    patRunPassed !== null

  const allPassed = patPushupsPassed && patSitupsPassed && patRunPassed

  const failedEvents = PAT_EVENTS.filter(
    (event) => rowsData[event.key].passed === false
  )

  return (
    <div className="pt-2">
      <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">
        PAT Detailed Scores
      </label>

      {isDisabled && (
        <div className="mb-3 text-xs font-semibold text-rose-500 bg-rose-50 p-2 rounded border border-rose-200">
          Please set a schedule date and time first before evaluating the applicant.
        </div>
      )}

      <div className="border border-gray-200 rounded-lg overflow-hidden text-sm">
        <div className="grid grid-cols-[3fr_2fr_3fr] gap-4 bg-gray-50 p-3 font-semibold text-gray-600 border-b border-gray-200">
          <div>Event</div>
          <div>Raw Score</div>
          <div className="text-center">Remarks</div>
        </div>

        {PAT_EVENTS.map((event, idx) => (
          <PatRow
            key={event.key}
            event={event}
            value={rowsData[event.key].value}
            passed={rowsData[event.key].passed}
            onChange={rowsData[event.key].onChange}
            onBlur={rowsData[event.key].onBlur}
            disabled={isDisabled}
            isLast={idx === PAT_EVENTS.length - 1}
          />
        ))}
      </div>

      {allEvaluated && (
        <PatStamp
          allPassed={allPassed}
          failedShortNames={failedEvents.map((e) => e.shortName)}
          failedLabels={failedEvents.map((e) => e.labelName)}
        />
      )}
    </div>
  )
}