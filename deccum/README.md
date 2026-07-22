# Deccum — Savings Map (Prototype)

Retirement withdrawal planning tool prototype. Maps year-by-year withdrawal strategy across 401(k), Roth, brokerage, and pension accounts — optimizing for Rule of 55, ACA subsidies, Roth conversions, and Social Security timing.

## Run

```bash
cd deccum
npm install
npm run dev
```

Open http://localhost:5173

## What's included

- **Setup flow** — age, separation age, annual spending, account balances
- **Withdrawal engine** — phase-based strategy with simplified tax rules
- **Color timeline** — stacked bars per year, color-coded by account type
- **Year detail panel** — withdrawals, Roth conversions, MAGI, ACA eligibility
- **Warning system** — early penalty, ACA cliff, RMD, IRMAA alerts
- **Summary metrics** — penalty avoided, ACA years protected, tax savings

## Disclaimer

Prototype for demonstration only. Not financial or tax advice.
