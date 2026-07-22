export type PolicyCategory = 'aca' | 'rmd' | 'tax' | 'social_security' | 'roth' | 'penalty'
export type PolicyStatus = 'enacted' | 'proposed' | 'effective_soon' | 'watching'

export interface Policy {
  id: string
  title: string
  summary: string
  category: PolicyCategory
  status: PolicyStatus
  effectiveDate: string
  announcedDate: string
  source: string
  sourceUrl?: string
  impact: {
    description: string
    affectedAges?: [number, number]
    dollarImpact?: string
    planFields?: string[]
  }
  previousRule?: string
  newRule: string
}

export interface PolicyImpact {
  policy: Policy
  relevance: 'high' | 'medium' | 'low'
  reason: string
}

export const POLICY_CATEGORY_META: Record<
  PolicyCategory,
  { label: string; icon: string; color: string; bg: string }
> = {
  aca: { label: 'ACA / Healthcare', icon: '🏥', color: 'text-orange-700', bg: 'bg-orange-50' },
  rmd: { label: 'RMD', icon: '📋', color: 'text-purple-700', bg: 'bg-purple-50' },
  tax: { label: 'Tax Brackets', icon: '💰', color: 'text-yellow-700', bg: 'bg-yellow-50' },
  social_security: { label: 'Social Security', icon: '🏛️', color: 'text-blue-700', bg: 'bg-blue-50' },
  roth: { label: 'Roth / Conversions', icon: '🔄', color: 'text-emerald-700', bg: 'bg-emerald-50' },
  penalty: { label: 'Early Withdrawal', icon: '⚠️', color: 'text-red-700', bg: 'bg-red-50' },
}

export const POLICY_STATUS_META: Record<
  PolicyStatus,
  { label: string; color: string; bg: string; dot: string }
> = {
  enacted: { label: 'Enacted', color: 'text-emerald-700', bg: 'bg-emerald-50', dot: 'bg-emerald-500' },
  proposed: { label: 'Proposed', color: 'text-amber-700', bg: 'bg-amber-50', dot: 'bg-amber-500' },
  effective_soon: { label: 'Effective Soon', color: 'text-blue-700', bg: 'bg-blue-50', dot: 'bg-blue-500' },
  watching: { label: 'Watching', color: 'text-stone-600', bg: 'bg-stone-100', dot: 'bg-stone-400' },
}

export type AccountType = '401k' | 'roth' | 'brokerage' | 'pension' | 'hsa'

export interface Account {
  id: string
  type: AccountType
  name: string
  balance: number
  employer401k?: boolean
}

export interface UserProfile {
  age: number
  separationAge: number
  annualSpending: number
  filingStatus: 'single' | 'married'
  socialSecurityAge: number
  socialSecurityMonthly: number
  targetAcaSubsidy: boolean
  rothConversionEnabled: boolean
}

export type WarningType =
  | 'early_penalty'
  | 'aca_cliff'
  | 'roth_conversion'
  | 'rmd'
  | 'tax_bracket'
  | 'medicare_irmaa'

export interface Warning {
  year: number
  type: WarningType
  severity: 'high' | 'medium' | 'low'
  message: string
}

export interface YearWithdrawal {
  accountType: AccountType
  amount: number
}

export interface YearPlan {
  age: number
  year: number
  withdrawals: YearWithdrawal[]
  rothConversion: number
  taxableIncome: number
  totalWithdrawn: number
  acaEligible: boolean
  medicareEligible: boolean
  socialSecurityIncome: number
  warnings: Warning[]
  accountBalances: Record<AccountType, number>
}

export interface PlanResult {
  years: YearPlan[]
  summary: {
    totalTaxesSaved: number
    acaYearsProtected: number
    penaltyAvoided: number
    projectedEndBalance: number
  }
}

export const ACCOUNT_META: Record<
  AccountType,
  { label: string; color: string; bg: string; border: string }
> = {
  '401k': {
    label: '401(k)',
    color: '#2563eb',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
  },
  roth: {
    label: 'Roth IRA',
    color: '#16a34a',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
  },
  brokerage: {
    label: 'Brokerage',
    color: '#d97706',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
  },
  pension: {
    label: 'Pension',
    color: '#7c3aed',
    bg: 'bg-violet-50',
    border: 'border-violet-200',
  },
  hsa: {
    label: 'HSA',
    color: '#0891b2',
    bg: 'bg-cyan-50',
    border: 'border-cyan-200',
  },
}

export const WARNING_META: Record<
  WarningType,
  { label: string; icon: string; color: string }
> = {
  early_penalty: { label: 'Early Withdrawal', icon: '⚠️', color: 'text-red-600' },
  aca_cliff: { label: 'ACA Cliff', icon: '🏥', color: 'text-orange-600' },
  roth_conversion: { label: 'Roth Conversion', icon: '🔄', color: 'text-emerald-600' },
  rmd: { label: 'RMD Required', icon: '📋', color: 'text-purple-600' },
  tax_bracket: { label: 'Tax Bracket', icon: '💰', color: 'text-yellow-600' },
  medicare_irmaa: { label: 'IRMAA Surcharge', icon: '💊', color: 'text-pink-600' },
}

export const DEFAULT_PROFILE: UserProfile = {
  age: 52,
  separationAge: 52,
  annualSpending: 72000,
  filingStatus: 'single',
  socialSecurityAge: 67,
  socialSecurityMonthly: 2800,
  targetAcaSubsidy: true,
  rothConversionEnabled: true,
}

export const DEFAULT_ACCOUNTS: Account[] = [
  { id: '1', type: '401k', name: 'Fidelity 401(k)', balance: 450000, employer401k: true },
  { id: '2', type: 'roth', name: 'Vanguard Roth IRA', balance: 180000 },
  { id: '3', type: 'brokerage', name: 'Schwab Taxable', balance: 95000 },
  { id: '4', type: 'pension', name: 'Old Employer Pension', balance: 42000 },
  { id: '5', type: 'hsa', name: 'HealthEquity HSA', balance: 28000 },
]
