import type { YearPlan } from '../types'
import { ACCOUNT_META, WARNING_META } from '../types'
import { formatCurrency } from '../engine/withdrawalEngine'

interface Props {
  years: YearPlan[]
  selectedYear: number | null
  onSelectYear: (year: number) => void
}

export function Timeline({ years, selectedYear, onSelectYear }: Props) {
  const maxWithdrawal = Math.max(...years.map((y) => y.totalWithdrawn), 1)

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-stone-800">Withdrawal Timeline</h2>
        <div className="flex flex-wrap gap-3 text-xs">
          {Object.entries(ACCOUNT_META).map(([key, meta]) => (
            <div key={key} className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: meta.color }} />
              <span className="text-stone-500">{meta.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto pb-2">
        <div className="flex gap-1 min-w-max">
          {years.map((yearPlan) => {
            const isSelected = selectedYear === yearPlan.year
            const hasWarning = yearPlan.warnings.some((w) => w.severity === 'high')
            const barHeight = Math.max(24, (yearPlan.totalWithdrawn / maxWithdrawal) * 120)

            return (
              <button
                key={yearPlan.year}
                onClick={() => onSelectYear(yearPlan.year)}
                className={`relative flex flex-col items-center group transition-all ${
                  isSelected ? 'scale-105' : 'hover:scale-102'
                }`}
                style={{ width: 44 }}
              >
                {/* Warning indicator */}
                {hasWarning && (
                  <div className="absolute -top-1 right-1 w-2 h-2 bg-red-500 rounded-full pulse-warning z-10" />
                )}

                {/* Stacked bar */}
                <div
                  className={`w-9 rounded-t-md overflow-hidden flex flex-col-reverse border ${
                    isSelected ? 'border-stone-800 shadow-md' : 'border-stone-200'
                  }`}
                  style={{ height: barHeight }}
                >
                  {yearPlan.withdrawals.map((w, i) => {
                    const pct = (w.amount / yearPlan.totalWithdrawn) * 100
                    return (
                      <div
                        key={i}
                        style={{
                          height: `${pct}%`,
                          backgroundColor: ACCOUNT_META[w.accountType].color,
                          minHeight: pct > 0 ? 2 : 0,
                        }}
                      />
                    )
                  })}
                  {yearPlan.rothConversion > 0 && (
                    <div
                      style={{
                        height: `${(yearPlan.rothConversion / yearPlan.totalWithdrawn) * 100}%`,
                        backgroundColor: '#10b981',
                        opacity: 0.5,
                        minHeight: 2,
                      }}
                    />
                  )}
                </div>

                {/* Age label */}
                <div
                  className={`text-xs mt-1.5 font-medium ${
                    isSelected ? 'text-stone-900' : 'text-stone-500'
                  }`}
                >
                  {yearPlan.age}
                </div>

                {/* Milestone markers */}
                {yearPlan.age === 65 && (
                  <div className="text-[9px] text-blue-500 font-medium">Medicare</div>
                )}
                {yearPlan.socialSecurityIncome > 0 && (
                  <div className="text-[9px] text-violet-500 font-medium">SS</div>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Phase labels */}
      <div className="flex mt-3 text-[10px] text-stone-400 uppercase tracking-wider font-medium">
        <div className="flex-1 text-center border-r border-stone-200">Bridge (52–54)</div>
        <div className="flex-1 text-center border-r border-stone-200">Rule of 55</div>
        <div className="flex-1 text-center border-r border-stone-200">ACA Window</div>
        <div className="flex-1 text-center">Medicare+</div>
      </div>
    </div>
  )
}

interface DetailProps {
  yearPlan: YearPlan | null
}

export function YearDetail({ yearPlan }: DetailProps) {
  if (!yearPlan) {
    return (
      <div className="flex items-center justify-center h-full text-stone-400 text-sm">
        Click a year on the timeline to see details
      </div>
    )
  }

  return (
    <div className="space-y-4 animate-fade-up">
      <div className="flex items-baseline justify-between">
        <div>
          <span className="text-2xl font-bold text-stone-900">Age {yearPlan.age}</span>
          <span className="text-stone-400 ml-2">{yearPlan.year}</span>
        </div>
        <div className="text-right">
          <div className="text-xs text-stone-500">Total Withdrawn</div>
          <div className="text-lg font-bold text-stone-800">
            {formatCurrency(yearPlan.totalWithdrawn)}
          </div>
        </div>
      </div>

      {/* Withdrawal breakdown */}
      <div className="space-y-2">
        {yearPlan.withdrawals.map((w, i) => {
          const meta = ACCOUNT_META[w.accountType]
          return (
            <div key={i} className={`flex items-center justify-between p-2.5 rounded-lg ${meta.bg} border ${meta.border}`}>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: meta.color }} />
                <span className="text-sm font-medium">{meta.label}</span>
              </div>
              <span className="text-sm font-semibold">{formatCurrency(w.amount)}</span>
            </div>
          )
        })}
        {yearPlan.rothConversion > 0 && (
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 border-dashed">
            <div className="flex items-center gap-2">
              <span className="text-sm">🔄</span>
              <span className="text-sm font-medium">Roth Conversion</span>
            </div>
            <span className="text-sm font-semibold text-emerald-700">
              {formatCurrency(yearPlan.rothConversion)}
            </span>
          </div>
        )}
      </div>

      {/* Income & eligibility */}
      <div className="grid grid-cols-2 gap-3 text-sm">
        <Stat label="Taxable Income (MAGI)" value={formatCurrency(yearPlan.taxableIncome)} />
        <Stat
          label="ACA Eligible"
          value={yearPlan.acaEligible ? '✓ Yes' : '✗ No'}
          alert={!yearPlan.acaEligible}
        />
        {yearPlan.socialSecurityIncome > 0 && (
          <Stat label="Social Security" value={formatCurrency(yearPlan.socialSecurityIncome)} />
        )}
        <Stat label="Medicare" value={yearPlan.medicareEligible ? '✓ Enrolled' : '—'} />
      </div>

      {/* Warnings */}
      {yearPlan.warnings.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs font-medium text-stone-500 uppercase tracking-wide">Alerts</div>
          {yearPlan.warnings.map((w, i) => {
            const meta = WARNING_META[w.type]
            return (
              <div
                key={i}
                className={`p-3 rounded-lg text-sm border ${
                  w.severity === 'high'
                    ? 'bg-red-50 border-red-200 text-red-800'
                    : w.severity === 'medium'
                      ? 'bg-orange-50 border-orange-200 text-orange-800'
                      : 'bg-stone-50 border-stone-200 text-stone-700'
                }`}
              >
                <span className="mr-1.5">{meta.icon}</span>
                {w.message}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function Stat({
  label,
  value,
  alert,
}: {
  label: string
  value: string
  alert?: boolean
}) {
  return (
    <div className="p-2.5 bg-stone-50 rounded-lg">
      <div className="text-xs text-stone-500">{label}</div>
      <div className={`font-semibold mt-0.5 ${alert ? 'text-red-600' : 'text-stone-800'}`}>
        {value}
      </div>
    </div>
  )
}
