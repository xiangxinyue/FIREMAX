import type { Account, UserProfile } from '../types'
import { ACCOUNT_META } from '../types'
import { formatCurrency } from '../engine/withdrawalEngine'

interface Props {
  accounts: Account[]
  profile: UserProfile
  onProfileChange: (p: UserProfile) => void
  onAccountsChange: (a: Account[]) => void
  onGenerate: () => void
}

export function SetupPanel({ accounts, profile, onProfileChange, onAccountsChange, onGenerate }: Props) {
  const totalBalance = accounts.reduce((s, a) => s + a.balance, 0)

  const updateAccount = (id: string, balance: number) => {
    onAccountsChange(accounts.map((a) => (a.id === id ? { ...a, balance } : a)))
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-stone-800">Your Profile</h2>
        <p className="text-sm text-stone-500 mt-1">Tell us about your situation</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Current Age">
          <input
            type="number"
            value={profile.age}
            onChange={(e) => onProfileChange({ ...profile, age: +e.target.value })}
            className="input input-block"
          />
        </Field>
        <Field label="Separation Age">
          <input
            type="number"
            value={profile.separationAge}
            onChange={(e) => onProfileChange({ ...profile, separationAge: +e.target.value })}
            className="input input-block"
          />
        </Field>
        <Field label="Annual Spending">
          <input
            type="number"
            step={1000}
            value={profile.annualSpending}
            onChange={(e) => onProfileChange({ ...profile, annualSpending: +e.target.value })}
            className="input input-block"
          />
        </Field>
        <Field label="SS Start Age">
          <input
            type="number"
            value={profile.socialSecurityAge}
            onChange={(e) => onProfileChange({ ...profile, socialSecurityAge: +e.target.value })}
            className="input input-block"
          />
        </Field>
      </div>

      <div className="flex flex-wrap gap-4">
        <Toggle
          label="Target ACA Subsidy"
          checked={profile.targetAcaSubsidy}
          onChange={(v) => onProfileChange({ ...profile, targetAcaSubsidy: v })}
        />
        <Toggle
          label="Roth Conversions"
          checked={profile.rothConversionEnabled}
          onChange={(v) => onProfileChange({ ...profile, rothConversionEnabled: v })}
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-stone-800">Accounts</h2>
          <span className="text-sm font-medium text-brand-600">{formatCurrency(totalBalance)} total</span>
        </div>
        <div className="space-y-2">
          {accounts.map((account) => {
            const meta = ACCOUNT_META[account.type]
            return (
              <div
                key={account.id}
                className={`grid grid-cols-[auto_minmax(0,1fr)_6.5rem] items-center gap-3 p-3 rounded-xl border ${meta.border} ${meta.bg}`}
              >
                <div
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: meta.color }}
                />
                <div className="min-w-0">
                  <div className="text-sm font-medium text-stone-800 leading-tight">{account.name}</div>
                  <div className="text-xs text-stone-500 mt-0.5">{meta.label}</div>
                </div>
                <input
                  type="number"
                  step={5000}
                  value={account.balance}
                  onChange={(e) => updateAccount(account.id, +e.target.value)}
                  className="input text-right shrink-0 tabular-nums"
                />
              </div>
            )
          })}
        </div>
      </div>

      <button
        onClick={onGenerate}
        className="w-full py-3 px-4 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl transition-colors shadow-sm"
      >
        Generate Savings Map →
      </button>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-stone-500 uppercase tracking-wide">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  )
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <label className="flex items-center gap-2 cursor-pointer select-none">
      <div
        onClick={() => onChange(!checked)}
        className={`w-9 h-5 rounded-full transition-colors relative ${checked ? 'bg-brand-500' : 'bg-stone-300'}`}
      >
        <div
          className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-4' : 'translate-x-0.5'}`}
        />
      </div>
      <span className="text-sm text-stone-700">{label}</span>
    </label>
  )
}
