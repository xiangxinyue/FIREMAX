# FIREMAX — Deccum / Savings Map

A prototype **retirement withdrawal planner** for people pursuing early retirement. It connects assets scattered across 401(k), Roth, brokerage, and pension accounts, plans which account to draw from each year, and tracks new policy changes that affect the plan.

> Cursor Hackathon Toronto project

---

## Quick Start

### Requirements

- [Node.js](https://nodejs.org/) **18+** (20+ recommended)
- npm (bundled with Node.js)

### Run Locally

```bash
# 1. Clone the repository
git clone https://github.com/xiangxinyue/FIREMAX.git
cd FIREMAX

# 2. Enter the frontend project directory
cd deccum

# 3. Install dependencies
npm install

# 4. Start the dev server
npm run dev
```

Then open **http://localhost:5173** in your browser.

### Production Build (optional)

```bash
cd deccum
npm run build    # Build static files into dist/
npm run preview  # Preview the build locally
```

---

## How to Use

1. **Setup** — Enter your age, target retirement age, annual spending, and account balances
2. **Generate Savings Map** — Build a year-by-year withdrawal timeline
3. **Savings Map** — View the color-coded timeline, each year's withdrawal sources, and warnings such as ACA / penalties
4. **Policy Tracker** — Browse how policy changes like SECURE 2.0, ACA subsidies, and RMDs affect you

---

## Features

| Module | Description |
|--------|-------------|
| Account Setup | 401(k), Roth IRA, brokerage, pension, HSA |
| Withdrawal Engine | Rule of 55, Roth conversions, ACA thresholds, Social Security timing |
| Color Timeline | Stacked by account type per year, click for details |
| Warning System | Early withdrawal penalties, ACA cliff, RMD, IRMAA |
| Policy Tracker | 10+ mock policy entries with personalized impact assessment |

---

## Project Structure

```
FIREMAX/
└── deccum/                  # Frontend prototype (React + Vite + Tailwind)
    ├── src/
    │   ├── App.tsx          # Main app
    │   ├── components/      # UI components
    │   ├── data/policies.ts # Policy database
    │   └── engine/          # Withdrawal strategy engine
    ├── package.json
    └── vite.config.ts
```

---

## Tech Stack

- **React 19** + **TypeScript**
- **Vite 6** — dev server and build
- **Tailwind CSS 4** — styling

---

## FAQ

**Q: Port 5173 is already in use?**

Vite automatically tries the next available port. Check the terminal output for the actual address.

**Q: `npm install` fails?**

Make sure your Node.js version is ≥ 18, then delete `node_modules` and `package-lock.json` and reinstall:

```bash
rm -rf node_modules package-lock.json
npm install
```

**Q: Is this real financial advice?**

No. This is a product prototype. Tax rules are simplified and for demonstration only. It is not investment or tax advice.

---

## Disclaimer

Prototype for demonstration only. All revenue estimates, policy data, and withdrawal strategies are illustrative. Not financial, legal, or tax advice.

---

## License

See [LICENSE](LICENSE).
