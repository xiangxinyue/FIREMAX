import type {
  Account,
  AccountType,
  PlanResult,
  UserProfile,
  Warning,
  YearPlan,
  YearWithdrawal,
} from '../types'

const ACA_MAGI_LIMIT_SINGLE = 58320
const ACA_MAGI_LIMIT_MARRIED = 78720
const RMD_AGE = 73
const MEDICARE_AGE = 65
const EARLY_PENALTY_AGE = 59.5
const RULE_OF_55_AGE = 55

function getAcaLimit(profile: UserProfile): number {
  return profile.filingStatus === 'single' ? ACA_MAGI_LIMIT_SINGLE : ACA_MAGI_LIMIT_MARRIED
}

function initBalances(accounts: Account[]): Record<AccountType, number> {
  const balances: Record<AccountType, number> = {
    '401k': 0,
    roth: 0,
    brokerage: 0,
    pension: 0,
    hsa: 0,
  }
  for (const a of accounts) {
    balances[a.type] += a.balance
  }
  return balances
}

function withdraw(
  balances: Record<AccountType, number>,
  type: AccountType,
  amount: number,
): number {
  const available = balances[type]
  const taken = Math.min(amount, available)
  balances[type] -= taken
  return taken
}

export function generatePlan(profile: UserProfile, accounts: Account[]): PlanResult {
  const currentYear = new Date().getFullYear()
  const balances = initBalances(accounts)
  const years: YearPlan[] = []
  let acaYearsProtected = 0
  let penaltyAvoided = 0
  let totalTaxesSaved = 0

  const hasEmployer401k = accounts.some((a) => a.type === '401k' && a.employer401k)
  const ruleOf55Applies =
    hasEmployer401k && profile.separationAge >= RULE_OF_55_AGE

  for (let age = profile.age; age <= 90; age++) {
    const year = currentYear + (age - profile.age)
    const withdrawals: YearWithdrawal[] = []
    const warnings: Warning[] = []
    let rothConversion = 0
    let taxableIncome = 0

    const medicareEligible = age >= MEDICARE_AGE
    const socialSecurityIncome =
      age >= profile.socialSecurityAge ? profile.socialSecurityMonthly * 12 * 0.85 : 0

    let remainingNeed = profile.annualSpending

    // Pension income (fixed annuity-style draw)
    if (balances.pension > 0) {
      const pensionDraw = Math.min(8400, balances.pension)
      const taken = withdraw(balances, 'pension', pensionDraw)
      if (taken > 0) {
        withdrawals.push({ accountType: 'pension', amount: taken })
        taxableIncome += taken
        remainingNeed -= taken
      }
    }

    // Social Security reduces portfolio need
    if (age >= profile.socialSecurityAge) {
      remainingNeed = Math.max(0, remainingNeed - profile.socialSecurityMonthly * 12)
    }

    const acaLimit = getAcaLimit(profile)
    const needsAcaCare = profile.targetAcaSubsidy && age < MEDICARE_AGE && age >= profile.age

    // Phase-based withdrawal strategy
    if (age < RULE_OF_55_AGE) {
      // Pre-55: brokerage + HSA for medical only
      const brokerAmt = withdraw(balances, 'brokerage', remainingNeed * 0.85)
      if (brokerAmt > 0) {
        withdrawals.push({ accountType: 'brokerage', amount: brokerAmt })
        taxableIncome += brokerAmt * 0.15
        remainingNeed -= brokerAmt
      }
      const rothAmt = withdraw(balances, 'roth', remainingNeed)
      if (rothAmt > 0) {
        withdrawals.push({ accountType: 'roth', amount: rothAmt })
        remainingNeed -= rothAmt
      }
      if (remainingNeed > 1000) {
        warnings.push({
          year,
          type: 'early_penalty',
          severity: 'high',
          message: `401(k) withdrawal would trigger 10% penalty ($${Math.round(remainingNeed * 0.1).toLocaleString()}) — using Roth/brokerage instead`,
        })
        penaltyAvoided += remainingNeed * 0.1
      }
    } else if (age < EARLY_PENALTY_AGE) {
      // 55-59.5: Rule of 55 for 401k
      if (ruleOf55Applies) {
        const k401Amt = withdraw(balances, '401k', remainingNeed * 0.6)
        if (k401Amt > 0) {
          withdrawals.push({ accountType: '401k', amount: k401Amt })
          taxableIncome += k401Amt
          remainingNeed -= k401Amt
          penaltyAvoided += k401Amt * 0.1
        }
      }
      const brokerAmt = withdraw(balances, 'brokerage', remainingNeed * 0.5)
      if (brokerAmt > 0) {
        withdrawals.push({ accountType: 'brokerage', amount: brokerAmt })
        taxableIncome += brokerAmt * 0.12
        remainingNeed -= brokerAmt
      }
      const rothAmt = withdraw(balances, 'roth', remainingNeed)
      if (rothAmt > 0) {
        withdrawals.push({ accountType: 'roth', amount: rothAmt })
        remainingNeed -= rothAmt
      }
    } else if (age < MEDICARE_AGE) {
      // 59.5-64: optimize for ACA + Roth conversions
      const brokerAmt = withdraw(balances, 'brokerage', remainingNeed * 0.3)
      if (brokerAmt > 0) {
        withdrawals.push({ accountType: 'brokerage', amount: brokerAmt })
        taxableIncome += brokerAmt * 0.12
        remainingNeed -= brokerAmt
      }

      const rothAmt = withdraw(balances, 'roth', remainingNeed * 0.4)
      if (rothAmt > 0) {
        withdrawals.push({ accountType: 'roth', amount: rothAmt })
        remainingNeed -= rothAmt
      }

      const k401Amt = withdraw(balances, '401k', remainingNeed)
      if (k401Amt > 0) {
        withdrawals.push({ accountType: '401k', amount: k401Amt })
        taxableIncome += k401Amt
        remainingNeed -= k401Amt
      }

      // Roth conversion ladder in low-income years
      if (profile.rothConversionEnabled && balances['401k'] > 50000) {
        const conversionRoom = Math.max(0, acaLimit * 0.85 - taxableIncome - socialSecurityIncome)
        rothConversion = Math.min(conversionRoom, balances['401k'] * 0.08, 35000)
        if (rothConversion > 5000) {
          withdraw(balances, '401k', rothConversion)
          balances.roth += rothConversion
          taxableIncome += rothConversion
          warnings.push({
            year,
            type: 'roth_conversion',
            severity: 'low',
            message: `Roth conversion of $${Math.round(rothConversion).toLocaleString()} fills ACA-safe tax bracket`,
          })
          totalTaxesSaved += rothConversion * 0.05
        }
      }
    } else if (age < RMD_AGE) {
      // 65-72: Medicare era, more 401k draw
      const k401Amt = withdraw(balances, '401k', remainingNeed * 0.55)
      if (k401Amt > 0) {
        withdrawals.push({ accountType: '401k', amount: k401Amt })
        taxableIncome += k401Amt
        remainingNeed -= k401Amt
      }
      const rothAmt = withdraw(balances, 'roth', remainingNeed * 0.3)
      if (rothAmt > 0) {
        withdrawals.push({ accountType: 'roth', amount: rothAmt })
        remainingNeed -= rothAmt
      }
      const brokerAmt = withdraw(balances, 'brokerage', remainingNeed)
      if (brokerAmt > 0) {
        withdrawals.push({ accountType: 'brokerage', amount: brokerAmt })
        taxableIncome += brokerAmt * 0.1
        remainingNeed -= brokerAmt
      }
    } else {
      // 73+: RMDs
      const rmdAmount = balances['401k'] * 0.04
      const k401Amt = withdraw(balances, '401k', Math.max(rmdAmount, remainingNeed * 0.7))
      if (k401Amt > 0) {
        withdrawals.push({ accountType: '401k', amount: k401Amt })
        taxableIncome += k401Amt
        remainingNeed -= k401Amt
      }
      warnings.push({
        year,
        type: 'rmd',
        severity: 'medium',
        message: `Required Minimum Distribution: $${Math.round(rmdAmount).toLocaleString()} from 401(k)`,
      })
      const rothAmt = withdraw(balances, 'roth', remainingNeed)
      if (rothAmt > 0) {
        withdrawals.push({ accountType: 'roth', amount: rothAmt })
        remainingNeed -= rothAmt
      }
    }

    const totalMAGI = taxableIncome + socialSecurityIncome
    const acaEligible = !needsAcaCare || totalMAGI <= acaLimit

    if (needsAcaCare && totalMAGI > acaLimit) {
      warnings.push({
        year,
        type: 'aca_cliff',
        severity: 'high',
        message: `MAGI $${Math.round(totalMAGI).toLocaleString()} exceeds ACA limit — subsidy at risk (~$${Math.round(8400).toLocaleString()}/yr lost)`,
      })
    } else if (needsAcaCare) {
      acaYearsProtected++
    }

    if (totalMAGI > 100000 && age >= MEDICARE_AGE) {
      warnings.push({
        year,
        type: 'medicare_irmaa',
        severity: 'medium',
        message: `Income may trigger Medicare IRMAA surcharge (+$${Math.round(2400).toLocaleString()}/yr)`,
      })
    }

    const totalWithdrawn = withdrawals.reduce((s, w) => s + w.amount, 0) + rothConversion

    years.push({
      age,
      year,
      withdrawals,
      rothConversion,
      taxableIncome: Math.round(totalMAGI),
      totalWithdrawn: Math.round(totalWithdrawn),
      acaEligible,
      medicareEligible,
      socialSecurityIncome: Math.round(socialSecurityIncome),
      warnings,
      accountBalances: { ...balances },
    })

    // Stop if all accounts depleted
    const totalRemaining = Object.values(balances).reduce((s, v) => s + v, 0)
    if (totalRemaining < 1000 && age > profile.age + 5) break
  }

  const endBalance = years.length > 0 ? years[years.length - 1].accountBalances : balances
  const projectedEndBalance = Object.values(endBalance).reduce((s: number, v: number) => s + v, 0)

  return {
    years,
    summary: {
      totalTaxesSaved: Math.round(totalTaxesSaved + penaltyAvoided * 0.5),
      acaYearsProtected,
      penaltyAvoided: Math.round(penaltyAvoided),
      projectedEndBalance: Math.round(projectedEndBalance),
    },
  }
}

export function formatCurrency(n: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(n)
}
