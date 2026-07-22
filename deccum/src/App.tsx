import { useMemo, useState } from 'react'
import type { Account, PlanResult, UserProfile } from './types'
import {
  DEFAULT_ACCOUNTS,
  DEFAULT_PROFILE,
} from './types'
import { generatePlan } from './engine/withdrawalEngine'
import { getRelevantPolicies } from './data/policies'
import { SetupPanel } from './components/SetupPanel'
import { SummaryCards } from './components/SummaryCards'
import { Timeline, YearDetail } from './components/Timeline'
import { PolicyAlertBanner, PolicyNavBadge, PolicyTracker } from './components/PolicyTracker'

type Step = 'setup' | 'plan' | 'policies'

const TRACKED_KEY = 'deccum-tracked-policies'

function loadTracked(): Set<string> {
  try {
    const raw = localStorage.getItem(TRACKED_KEY)
    return raw ? new Set(JSON.parse(raw) as string[]) : new Set()
  } catch {
    return new Set()
  }
}

function saveTracked(ids: Set<string>) {
  localStorage.setItem(TRACKED_KEY, JSON.stringify([...ids]))
}

export default function App() {
  const [step, setStep] = useState<Step>('setup')
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE)
  const [accounts, setAccounts] = useState<Account[]>(DEFAULT_ACCOUNTS)
  const [plan, setPlan] = useState<PlanResult | null>(null)
  const [selectedYear, setSelectedYear] = useState<number | null>(null)
  const [trackedIds, setTrackedIds] = useState<Set<string>>(loadTracked)

  const policyImpacts = useMemo(() => getRelevantPolicies(profile), [profile])
  const urgentPolicyCount = policyImpacts.filter(
    (i) => i.relevance === 'high' && i.policy.status !== 'enacted',
  ).length

  const selectedYearPlan = useMemo(
    () => plan?.years.find((y) => y.year === selectedYear) ?? null,
    [plan, selectedYear],
  )

  const handleGenerate = () => {
    const result = generatePlan(profile, accounts)
    setPlan(result)
    setSelectedYear(result.years[0]?.year ?? null)
    setStep('plan')
  }

  const handleToggleTrack = (id: string) => {
    setTrackedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      saveTracked(next)
      return next
    })
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-stone-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <span className="font-bold text-stone-900">Deccum</span>
              <span className="text-stone-400 ml-1.5 text-sm hidden sm:inline">Savings Map</span>
            </div>
          </div>
          <nav className="flex items-center gap-1 sm:gap-2 text-sm">
            <NavTab active={step === 'setup'} onClick={() => setStep('setup')}>
              Setup
            </NavTab>
            <NavTab active={step === 'plan'} onClick={() => plan && setStep('plan')} disabled={!plan}>
              Savings Map
            </NavTab>
            <NavTab active={step === 'policies'} onClick={() => setStep('policies')} badge={urgentPolicyCount}>
              Policy Tracker
            </NavTab>
          </nav>
        </div>
      </header>

      {step === 'setup' && (
        <SetupView
          profile={profile}
          accounts={accounts}
          onProfileChange={setProfile}
          onAccountsChange={setAccounts}
          onGenerate={handleGenerate}
          onViewPolicies={() => setStep('policies')}
          policyImpacts={policyImpacts}
        />
      )}

      {step === 'plan' && plan && (
        <PlanView
          plan={plan}
          selectedYear={selectedYear}
          onSelectYear={setSelectedYear}
          selectedYearPlan={selectedYearPlan}
          onEdit={() => setStep('setup')}
          onViewPolicies={() => setStep('policies')}
          policyImpacts={policyImpacts}
        />
      )}

      {step === 'policies' && (
        <PoliciesView
          profile={profile}
          trackedIds={trackedIds}
          onToggleTrack={handleToggleTrack}
        />
      )}
    </div>
  )
}

function NavTab({
  active,
  onClick,
  disabled,
  badge,
  children,
}: {
  active: boolean
  onClick: () => void
  disabled?: boolean
  badge?: number
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`relative px-3 py-1.5 rounded-lg font-medium transition-colors ${
        active
          ? 'bg-stone-100 text-stone-900'
          : disabled
            ? 'text-stone-300 cursor-not-allowed'
            : 'text-stone-500 hover:text-stone-800 hover:bg-stone-50'
      }`}
    >
      {children}
      {badge !== undefined && badge > 0 && <PolicyNavBadge count={badge} />}
    </button>
  )
}

function SetupView({
  profile,
  accounts,
  onProfileChange,
  onAccountsChange,
  onGenerate,
  onViewPolicies,
  policyImpacts,
}: {
  profile: UserProfile
  accounts: Account[]
  onProfileChange: (p: UserProfile) => void
  onAccountsChange: (a: Account[]) => void
  onGenerate: () => void
  onViewPolicies: () => void
  policyImpacts: ReturnType<typeof getRelevantPolicies>
}) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 lg:py-12">
      <div className="mb-6">
        <PolicyAlertBanner impacts={policyImpacts} onViewAll={onViewPolicies} />
      </div>

      <div className="grid lg:grid-cols-2 gap-12 items-start">
        <div className="animate-fade-up">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-100 text-brand-700 text-xs font-medium mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
            Retirement Withdrawal Planner
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl text-stone-900 leading-tight">
            Know exactly which account to tap—<em>every year</em>
          </h1>
          <p className="mt-4 text-lg text-stone-500 leading-relaxed max-w-lg">
            You left work at 52 with money in five places. Deccum maps your withdrawal strategy across
            401(k), Roth, brokerage & pension—optimizing for Rule of 55, ACA subsidies, and Social Security.
          </p>

          <div className="mt-8 space-y-3">
            {[
              { icon: '⚠️', text: 'Avoid 10% early withdrawal penalties' },
              { icon: '🏥', text: 'Stay under ACA subsidy income cliffs' },
              { icon: '🔄', text: 'Time Roth conversions in low-tax years' },
              { icon: '📊', text: 'Visual timeline of every withdrawal source' },
              { icon: '📡', text: 'Auto-track tax law & policy changes' },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-3 text-stone-600">
                <span className="text-lg">{item.icon}</span>
                <span className="text-sm">{item.text}</span>
              </div>
            ))}
          </div>

          <div className="mt-8 p-4 bg-stone-100 rounded-xl border border-stone-200">
            <div className="text-xs font-medium text-stone-500 uppercase tracking-wide">Example Scenario</div>
            <p className="text-sm text-stone-600 mt-1">
              52-year-old, just separated. $450K 401(k), $180K Roth, $95K brokerage, $42K pension.
              Needs $72K/yr. Without a plan, a wrong 401(k) draw costs{' '}
              <strong className="text-red-600">$7,200/yr in penalties</strong> alone.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 animate-fade-up" style={{ animationDelay: '0.1s' }}>
          <SetupPanel
            profile={profile}
            accounts={accounts}
            onProfileChange={onProfileChange}
            onAccountsChange={onAccountsChange}
            onGenerate={onGenerate}
          />
        </div>
      </div>
    </div>
  )
}

function PlanView({
  plan,
  selectedYear,
  onSelectYear,
  selectedYearPlan,
  onEdit,
  onViewPolicies,
  policyImpacts,
}: {
  plan: PlanResult
  selectedYear: number | null
  onSelectYear: (y: number) => void
  selectedYearPlan: PlanResult['years'][0] | null
  onEdit: () => void
  onViewPolicies: () => void
  policyImpacts: ReturnType<typeof getRelevantPolicies>
}) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <PolicyAlertBanner impacts={policyImpacts} onViewAll={onViewPolicies} />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Your Savings Map</h1>
          <p className="text-sm text-stone-500 mt-0.5">
            {plan.years.length} years planned · click any bar for details
          </p>
        </div>
        <button
          onClick={onEdit}
          className="text-sm px-4 py-2 rounded-lg border border-stone-200 hover:bg-stone-50 transition-colors"
        >
          Adjust Inputs
        </button>
      </div>

      <SummaryCards summary={plan.summary} />

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-stone-200 shadow-sm p-6">
          <Timeline
            years={plan.years}
            selectedYear={selectedYear}
            onSelectYear={onSelectYear}
          />
        </div>
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 min-h-[320px]">
          <YearDetail yearPlan={selectedYearPlan} />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6">
        <h3 className="font-semibold text-stone-800 mb-4">Strategy Phases</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              phase: 'Bridge Years (52–54)',
              desc: 'Brokerage + Roth only. Zero 401(k) touches to avoid 10% penalty.',
              color: 'border-amber-200 bg-amber-50',
            },
            {
              phase: 'Rule of 55 (55–59)',
              desc: '401(k) from separated employer penalty-free. Brokerage for ACA-friendly MAGI.',
              color: 'border-blue-200 bg-blue-50',
            },
            {
              phase: 'ACA Window (59–64)',
              desc: 'Roth conversions fill low brackets. Keep MAGI under $58,320 for subsidies.',
              color: 'border-orange-200 bg-orange-50',
            },
            {
              phase: 'Medicare Era (65+)',
              desc: 'Higher 401(k) draws. Watch IRMAA thresholds. RMDs begin at 73.',
              color: 'border-violet-200 bg-violet-50',
            },
          ].map((p) => (
            <div key={p.phase} className={`p-4 rounded-xl border ${p.color}`}>
              <div className="text-sm font-semibold text-stone-800">{p.phase}</div>
              <div className="text-xs text-stone-600 mt-1 leading-relaxed">{p.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <footer className="text-center text-xs text-stone-400 py-4">
        Prototype only — not financial advice. Tax rules simplified for demonstration.
      </footer>
    </div>
  )
}

function PoliciesView({
  profile,
  trackedIds,
  onToggleTrack,
}: {
  profile: UserProfile
  trackedIds: Set<string>
  onToggleTrack: (id: string) => void
}) {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8 animate-fade-up">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-medium mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
          Live Policy Monitor
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl text-stone-900">Policy Tracker</h1>
        <p className="mt-2 text-stone-500 max-w-2xl">
          Tax laws and retirement rules change constantly. Deccum monitors SECURE Act updates,
          ACA subsidy changes, RMD age shifts, and more — then tells you how each one affects{' '}
          <em>your</em> withdrawal plan.
        </p>
      </div>

      <div className="animate-fade-up" style={{ animationDelay: '0.05s' }}>
        <PolicyTracker
          profile={profile}
          trackedIds={trackedIds}
          onToggleTrack={onToggleTrack}
        />
      </div>

      <footer className="text-center text-xs text-stone-400 py-8 mt-4">
        Policy data is illustrative for prototype demo. Not legal or tax advice.
      </footer>
    </div>
  )
}
