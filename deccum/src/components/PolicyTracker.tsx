import { useMemo, useState } from 'react'
import type { Policy, PolicyCategory, PolicyImpact, UserProfile } from '../types'
import { POLICY_CATEGORY_META, POLICY_STATUS_META } from '../types'
import {
  daysUntil,
  formatPolicyDate,
  getRelevantPolicies,
  POLICIES,
} from '../data/policies'

interface Props {
  profile: UserProfile
  trackedIds: Set<string>
  onToggleTrack: (id: string) => void
}

export function PolicyTracker({ profile, trackedIds, onToggleTrack }: Props) {
  const [filter, setFilter] = useState<PolicyCategory | 'all'>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const impacts = useMemo(() => getRelevantPolicies(profile), [profile])

  const filtered = useMemo(() => {
    const list = filter === 'all' ? impacts : impacts.filter((i) => i.policy.category === filter)
    return list
  }, [impacts, filter])

  const highCount = impacts.filter((i) => i.relevance === 'high').length
  const trackedCount = trackedIds.size

  return (
    <div className="space-y-6">
      {/* Header stats */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Relevant to You" value={highCount} sub="high-impact policies" alert={highCount > 0} />
        <StatCard label="Tracking" value={trackedCount} sub="policies watched" />
        <StatCard label="Total Monitored" value={POLICIES.length} sub="in policy database" />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <FilterChip active={filter === 'all'} onClick={() => setFilter('all')}>
          All
        </FilterChip>
        {(Object.entries(POLICY_CATEGORY_META) as [PolicyCategory, typeof POLICY_CATEGORY_META[PolicyCategory]][]).map(
          ([key, meta]) => (
            <FilterChip key={key} active={filter === key} onClick={() => setFilter(key)}>
              {meta.icon} {meta.label}
            </FilterChip>
          ),
        )}
      </div>

      {/* Policy list */}
      <div className="space-y-3">
        {filtered.map(({ policy, relevance, reason }) => (
          <PolicyCard
            key={policy.id}
            policy={policy}
            relevance={relevance}
            reason={reason}
            tracked={trackedIds.has(policy.id)}
            expanded={expandedId === policy.id}
            onToggleExpand={() => setExpandedId(expandedId === policy.id ? null : policy.id)}
            onToggleTrack={() => onToggleTrack(policy.id)}
          />
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-8 text-stone-400 text-sm">No policies in this category</div>
        )}
      </div>
    </div>
  )
}

function PolicyCard({
  policy,
  relevance,
  reason,
  tracked,
  expanded,
  onToggleExpand,
  onToggleTrack,
}: {
  policy: Policy
  relevance: PolicyImpact['relevance']
  reason: string
  tracked: boolean
  expanded: boolean
  onToggleExpand: () => void
  onToggleTrack: () => void
}) {
  const catMeta = POLICY_CATEGORY_META[policy.category]
  const statusMeta = POLICY_STATUS_META[policy.status]
  const days = daysUntil(policy.effectiveDate)
  const isFuture = days > 0

  return (
    <div
      className={`rounded-xl border transition-shadow ${
        relevance === 'high'
          ? 'border-orange-200 bg-orange-50/30 shadow-sm'
          : 'border-stone-200 bg-white'
      }`}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className={`shrink-0 w-9 h-9 rounded-lg ${catMeta.bg} flex items-center justify-center text-lg`}>
            {catMeta.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className={`text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full ${statusMeta.bg} ${statusMeta.color}`}>
                {statusMeta.label}
              </span>
              <span className={`text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full ${
                relevance === 'high' ? 'bg-red-100 text-red-700' :
                relevance === 'medium' ? 'bg-amber-100 text-amber-700' :
                'bg-stone-100 text-stone-500'
              }`}>
                {relevance} impact
              </span>
              {isFuture && policy.status !== 'proposed' && (
                <span className="text-[10px] text-stone-400">
                  {days} days until effective
                </span>
              )}
            </div>
            <h3 className="font-semibold text-stone-900 text-sm leading-snug">{policy.title}</h3>
            <p className="text-xs text-stone-500 mt-1 line-clamp-2">{policy.summary}</p>
          </div>
          <button
            onClick={onToggleTrack}
            className={`shrink-0 p-2 rounded-lg transition-colors ${
              tracked
                ? 'bg-brand-100 text-brand-700'
                : 'bg-stone-100 text-stone-400 hover:text-stone-600'
            }`}
            title={tracked ? 'Untrack policy' : 'Track policy'}
          >
            <svg className="w-4 h-4" fill={tracked ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </button>
        </div>

        {relevance === 'high' && (
          <div className="mt-3 px-3 py-2 bg-orange-100/60 rounded-lg text-xs text-orange-800">
            <strong>Why it matters:</strong> {reason}
          </div>
        )}

        <button
          onClick={onToggleExpand}
          className="mt-3 text-xs text-brand-600 hover:text-brand-700 font-medium"
        >
          {expanded ? 'Hide details ↑' : 'View impact & details →'}
        </button>
      </div>

      {expanded && (
        <div className="border-t border-stone-200 px-4 py-4 bg-stone-50/50 space-y-4 animate-fade-up">
          <div className="grid sm:grid-cols-2 gap-3 text-xs">
            <Detail label="Effective Date" value={formatPolicyDate(policy.effectiveDate)} />
            <Detail label="Announced" value={formatPolicyDate(policy.announcedDate)} />
            <Detail label="Source" value={policy.source} />
            {policy.impact.dollarImpact && (
              <Detail label="Estimated Impact" value={policy.impact.dollarImpact} highlight />
            )}
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <RuleBox label="Previous Rule" value={policy.previousRule ?? 'N/A'} variant="old" />
            <RuleBox label="New Rule" value={policy.newRule} variant="new" />
          </div>

          <div className="p-3 bg-white rounded-lg border border-stone-200 text-xs text-stone-600">
            <strong className="text-stone-800">Plan impact:</strong> {policy.impact.description}
          </div>

          {relevance !== 'low' && (
            <div className="flex items-center gap-2 p-3 bg-brand-50 rounded-lg border border-brand-100 text-xs">
              <span className="text-brand-600">💡</span>
              <span className="text-brand-800">
                {getRecommendation(policy)}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function getRecommendation(policy: Policy): string {
  switch (policy.id) {
    case 'aca-subsidy-2026':
      return 'Consider front-loading Roth conversions in 2025 while subsidies remain enhanced.'
    case 'tcja-expiration-2025':
      return 'Accelerate Roth conversions before 2026 when rates may increase.'
    case 'secure2-rmd-age-75':
      return 'Your plan already accounts for RMD at 73 — we\'ll auto-update when you turn 59.'
    case 'rule-of-55-clarification':
      return 'Ensure withdrawals come only from your separated employer\'s 401(k), not rolled-over IRAs.'
    default:
      return 'Regenerate your Savings Map to incorporate this policy change.'
  }
}

function StatCard({ label, value, sub, alert }: { label: string; value: number; sub: string; alert?: boolean }) {
  return (
    <div className={`rounded-xl p-4 border ${alert ? 'border-orange-200 bg-orange-50' : 'border-stone-200 bg-white'}`}>
      <div className="text-xs font-medium text-stone-500 uppercase tracking-wide">{label}</div>
      <div className={`text-2xl font-bold mt-1 ${alert ? 'text-orange-600' : 'text-stone-800'}`}>{value}</div>
      <div className="text-xs text-stone-400 mt-0.5">{sub}</div>
    </div>
  )
}

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
        active
          ? 'bg-stone-800 text-white'
          : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
      }`}
    >
      {children}
    </button>
  )
}

function Detail({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div>
      <div className="text-stone-400 uppercase tracking-wide text-[10px] font-medium">{label}</div>
      <div className={`mt-0.5 font-medium ${highlight ? 'text-emerald-700' : 'text-stone-700'}`}>{value}</div>
    </div>
  )
}

function RuleBox({ label, value, variant }: { label: string; value: string; variant: 'old' | 'new' }) {
  return (
    <div className={`p-3 rounded-lg border text-xs ${
      variant === 'old'
        ? 'bg-red-50/50 border-red-100 text-red-800 line-through decoration-red-300'
        : 'bg-emerald-50/50 border-emerald-100 text-emerald-800'
    }`}>
      <div className="text-[10px] uppercase tracking-wide font-medium opacity-60 mb-1">{label}</div>
      {value}
    </div>
  )
}

export function PolicyAlertBanner({
  impacts,
  onViewAll,
}: {
  impacts: PolicyImpact[]
  onViewAll: () => void
}) {
  const urgent = impacts.filter((i) => i.relevance === 'high' && i.policy.status !== 'enacted')
  if (urgent.length === 0) return null

  return (
    <div className="flex items-center gap-3 p-3 bg-orange-50 border border-orange-200 rounded-xl">
      <div className="shrink-0 w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
        <svg className="w-4 h-4 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-orange-900">
          {urgent.length} upcoming {urgent.length === 1 ? 'policy' : 'policies'} may affect your plan
        </div>
        <div className="text-xs text-orange-700 truncate">
          {urgent.map((i) => i.policy.title).join(' · ')}
        </div>
      </div>
      <button
        onClick={onViewAll}
        className="shrink-0 text-xs font-medium text-orange-700 hover:text-orange-900 px-3 py-1.5 rounded-lg bg-orange-100 hover:bg-orange-200 transition-colors"
      >
        Review →
      </button>
    </div>
  )
}

export function PolicyNavBadge({ count }: { count: number }) {
  if (count === 0) return null
  return (
    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
      {count > 9 ? '9+' : count}
    </span>
  )
}
