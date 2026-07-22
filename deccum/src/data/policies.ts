import type { Policy, PolicyImpact, UserProfile } from '../types'

export const POLICIES: Policy[] = [
  {
    id: 'secure2-rmd-age',
    title: 'SECURE 2.0: RMD Age Raised to 73',
    summary:
      'Required Minimum Distribution age increased from 72 to 73 for those born 1951–1959, delaying forced 401(k)/IRA withdrawals.',
    category: 'rmd',
    status: 'enacted',
    effectiveDate: '2023-01-01',
    announcedDate: '2022-12-29',
    source: 'SECURE 2.0 Act',
    impact: {
      description: 'Delays your first RMD by one year, keeping more in tax-deferred accounts longer.',
      affectedAges: [73, 75],
      dollarImpact: 'Delays ~$18K/yr forced withdrawal',
      planFields: ['rmdAge'],
    },
    previousRule: 'RMD begins at age 72',
    newRule: 'RMD begins at age 73 (age 75 for those born 1960+)',
  },
  {
    id: 'secure2-rmd-age-75',
    title: 'SECURE 2.0: RMD Age 75 for Born 1960+',
    summary:
      'Starting in 2033, RMD age rises to 75 for anyone born in 1960 or later — two extra years of tax-deferred growth.',
    category: 'rmd',
    status: 'effective_soon',
    effectiveDate: '2033-01-01',
    announcedDate: '2022-12-29',
    source: 'SECURE 2.0 Act',
    impact: {
      description: 'If you were born 1960+, your RMD window shifts two years later than current rules.',
      affectedAges: [73, 90],
      planFields: ['rmdAge'],
    },
    previousRule: 'RMD at 73',
    newRule: 'RMD at 75 for birth year 1960+',
  },
  {
    id: 'aca-subsidy-extension',
    title: 'ACA Enhanced Subsidies Extended Through 2025',
    summary:
      'American Rescue Plan enhanced premium tax credits extended, keeping ACA subsidy cliffs higher than pre-2021 levels.',
    category: 'aca',
    status: 'enacted',
    effectiveDate: '2025-12-31',
    announcedDate: '2022-08-16',
    source: 'Inflation Reduction Act',
    impact: {
      description: 'Keeps MAGI limits effectively higher — more room for Roth conversions before losing subsidies.',
      affectedAges: [50, 64],
      dollarImpact: 'Up to $8,400/yr subsidy preserved',
      planFields: ['acaMagiLimit'],
    },
    previousRule: 'Subsidy cliff at 400% FPL (~$58K single)',
    newRule: 'No cliff through 2025 — subsidies cap premium at 8.5% of income',
  },
  {
    id: 'aca-subsidy-2026',
    title: 'ACA Subsidies Set to Expire After 2025',
    summary:
      'Enhanced ACA subsidies expire Dec 31, 2025 unless Congress extends them. Income cliff may return for early retirees.',
    category: 'aca',
    status: 'watching',
    effectiveDate: '2026-01-01',
    announcedDate: '2025-01-15',
    source: 'Congressional Budget Office',
    impact: {
      description: 'Your ACA window (ages 52–64) may hit a stricter cliff starting 2026. Monitor MAGI closely.',
      affectedAges: [50, 64],
      dollarImpact: 'Risk: lose $7K–$12K/yr in subsidies',
      planFields: ['acaMagiLimit'],
    },
    previousRule: 'Premium capped at 8.5% of income',
    newRule: 'Potential return to 400% FPL cliff (~$58,320 single)',
  },
  {
    id: 'roth-catch-up-high-earners',
    title: 'SECURE 2.0: Roth Catch-Up for High Earners',
    summary:
      'Employees earning $145K+ must make catch-up contributions to 401(k) as Roth (after-tax) starting 2026.',
    category: 'roth',
    status: 'effective_soon',
    effectiveDate: '2026-01-01',
    announcedDate: '2022-12-29',
    source: 'SECURE 2.0 Act',
    impact: {
      description: 'More Roth dollars in your 401(k) means larger penalty-free Roth bucket for bridge years.',
      affectedAges: [50, 65],
      planFields: ['rothConversion'],
    },
    previousRule: 'Catch-up contributions pre-tax by default',
    newRule: 'Catch-up must be Roth for income > $145K',
  },
  {
    id: '529-to-roth-rollover',
    title: '529-to-Roth Rollover Allowed',
    summary:
      'Unused 529 plan funds can roll into beneficiary Roth IRA (lifetime limit $35K) starting 2024.',
    category: 'roth',
    status: 'enacted',
    effectiveDate: '2024-01-01',
    announcedDate: '2022-12-29',
    source: 'SECURE 2.0 Act',
    impact: {
      description: 'Adds another Roth funding source for early retirees with leftover education savings.',
      dollarImpact: 'Up to $35K additional Roth',
      planFields: ['rothBalance'],
    },
    previousRule: '529 overage taxed + 10% penalty',
    newRule: 'Roll up to $35K to Roth IRA (15-year 529 rule applies)',
  },
  {
    id: 'ss-cola-2026',
    title: '2026 Social Security COLA: 2.8%',
    summary:
      'Social Security cost-of-living adjustment of 2.8% for 2026, raising average monthly benefit by ~$78.',
    category: 'social_security',
    status: 'enacted',
    effectiveDate: '2026-01-01',
    announcedDate: '2025-10-15',
    source: 'Social Security Administration',
    impact: {
      description: 'Slightly reduces portfolio withdrawal need once SS begins at your chosen age.',
      affectedAges: [62, 90],
      dollarImpact: '+$936/yr per recipient',
      planFields: ['socialSecurityIncome'],
    },
    previousRule: '2025 average benefit: $1,976/mo',
    newRule: '2026 average benefit: ~$2,054/mo',
  },
  {
    id: 'rule-of-55-clarification',
    title: 'IRS Clarifies Rule of 55 Separation Requirement',
    summary:
      'IRS confirms you must separate from the employer whose 401(k) you withdraw from in or after the year you turn 55.',
    category: 'penalty',
    status: 'enacted',
    effectiveDate: '2024-06-01',
    announcedDate: '2024-03-12',
    source: 'IRS Notice 2024-XX',
    impact: {
      description: 'Validates your strategy: 401(k) from separated employer is penalty-free at 55, not other 401(k)s.',
      affectedAges: [55, 59],
      dollarImpact: 'Avoids 10% penalty on ~$43K/yr',
      planFields: ['earlyPenalty'],
    },
    previousRule: 'Rule of 55 applied but ambiguous for multiple accounts',
    newRule: 'Only the separated employer 401(k) qualifies — not old or current plans',
  },
  {
    id: 'tcja-expiration-2025',
    title: 'Tax Cuts and Jobs Act Expires After 2025',
    summary:
      'Individual tax rates revert to pre-2018 levels in 2026 unless extended. Top bracket rises from 37% to 39.6%.',
    category: 'tax',
    status: 'watching',
    effectiveDate: '2026-01-01',
    announcedDate: '2025-06-01',
    source: 'Congressional Research Service',
    impact: {
      description: 'Roth conversions before 2026 may be cheaper. Post-2026 withdrawal tax could be higher.',
      affectedAges: [50, 90],
      dollarImpact: 'Potential +2.6% on top bracket',
      planFields: ['taxBrackets'],
    },
    previousRule: 'Top rate 37%, wider brackets',
    newRule: 'Top rate 39.6%, narrower brackets (if not extended)',
  },
  {
    id: 'hsa-catch-up-proposed',
    title: 'Proposed: HSA Contribution Limit Increase',
    summary:
      'Bipartisan bill would raise HSA family contribution limit from $8,550 to $10,000, indexed for inflation.',
    category: 'aca',
    status: 'proposed',
    effectiveDate: '2027-01-01',
    announcedDate: '2025-11-20',
    source: 'HSA Modernization Act (proposed)',
    impact: {
      description: 'More tax-free medical spending capacity during bridge years before Medicare.',
      affectedAges: [50, 64],
      dollarImpact: '+$1,450/yr tax-free medical',
      planFields: ['hsaLimit'],
    },
    previousRule: 'Family HSA limit $8,550',
    newRule: 'Proposed family limit $10,000',
  },
]

export function assessPolicyImpact(policy: Policy, profile: UserProfile): PolicyImpact {
  const { affectedAges } = policy.impact
  let relevance: PolicyImpact['relevance'] = 'low'
  let reason = 'General update — monitor for future planning.'

  if (affectedAges) {
    const [minAge, maxAge] = affectedAges
    const inRange = profile.age <= maxAge && profile.age + 38 >= minAge
    if (inRange && profile.age >= minAge && profile.age <= maxAge) {
      relevance = 'high'
      reason = `You're currently age ${profile.age} — directly in the affected window.`
    } else if (inRange) {
      relevance = 'medium'
      reason = `You'll reach the affected age range (${minAge}–${maxAge}) during your plan horizon.`
    }
  }

  if (policy.category === 'aca' && profile.targetAcaSubsidy && profile.age < 65) {
    relevance = 'high'
    reason = 'You have ACA subsidy optimization enabled and are pre-Medicare.'
  }

  if (policy.category === 'penalty' && profile.separationAge >= 55 && profile.age < 60) {
    relevance = 'high'
    reason = 'Rule of 55 applies to your separation timeline.'
  }

  if (policy.category === 'rmd' && profile.age >= 60) {
    relevance = relevance === 'low' ? 'medium' : relevance
    reason = 'RMD rules affect your withdrawal timeline within the next 15 years.'
  }

  return { policy, relevance, reason }
}

export function getRelevantPolicies(profile: UserProfile): PolicyImpact[] {
  return POLICIES.map((p) => assessPolicyImpact(p, profile)).sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 }
    return order[a.relevance] - order[b.relevance]
  })
}

export function formatPolicyDate(iso: string): string {
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function daysUntil(iso: string): number {
  const target = new Date(iso + 'T00:00:00')
  const now = new Date()
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
}
