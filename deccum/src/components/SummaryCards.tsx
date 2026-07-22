import type { PlanResult } from '../types'
import { formatCurrency } from '../engine/withdrawalEngine'

interface Props {
  summary: PlanResult['summary']
}

export function SummaryCards({ summary }: Props) {
  const cards = [
    {
      label: 'Penalty Avoided',
      value: formatCurrency(summary.penaltyAvoided),
      sub: 'via Rule of 55 & Roth ladder',
      color: 'text-red-600',
      bg: 'bg-red-50',
    },
    {
      label: 'ACA Years Protected',
      value: `${summary.acaYearsProtected} yrs`,
      sub: 'subsidy-eligible income',
      color: 'text-orange-600',
      bg: 'bg-orange-50',
    },
    {
      label: 'Tax Optimization',
      value: formatCurrency(summary.totalTaxesSaved),
      sub: 'estimated lifetime savings',
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      label: 'End Balance (age 90)',
      value: formatCurrency(summary.projectedEndBalance),
      sub: 'remaining across accounts',
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map((card) => (
        <div key={card.label} className={`${card.bg} rounded-xl p-4 border border-stone-200/60`}>
          <div className="text-xs font-medium text-stone-500 uppercase tracking-wide">{card.label}</div>
          <div className={`text-2xl font-bold mt-1 ${card.color}`}>{card.value}</div>
          <div className="text-xs text-stone-400 mt-1">{card.sub}</div>
        </div>
      ))}
    </div>
  )
}
