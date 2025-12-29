# EXLE - Peer-to-Peer Lending on Ergo

A decentralized lending platform built on the Ergo blockchain, enabling trustless peer-to-peer loans without intermediaries.

## Features

- **Solo Loans** - Single lender funds the entire loan
- **Crowdfund Loans** - Multiple lenders pool funds together
- **Real-time Blockchain Data** - All loan data fetched directly from Ergo blockchain
- **Nautilus Wallet Integration** - Secure transaction signing via browser wallet
- **Dark/Light Mode** - Full theme support

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **UI Components**: Radix UI + shadcn/ui
- **State Management**: Zustand
- **Blockchain**: Ergo via Fleet SDK
- **Forms**: React Hook Form + Zod
- **Testing**: Vitest + React Testing Library

## Getting Started

### Prerequisites

- Node.js 18+
- [Nautilus Wallet](https://chrome.google.com/webstore/detail/nautilus-wallet/gjlmehlldlphhljhpnlddaodbjjcchai) browser extension

### Installation

```bash
# Clone the repository
git clone https://github.com/Ergo-Lend/exle-fullstack.git
cd exle-fullstack

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment

The app connects to:
- **Ergo Node**: `crystalpool.cc:9055`
- **Transaction Service**: `crystalpool.cc:4004`

No environment variables required for development.

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── loans/              # Loan browsing and creation
│   ├── account/            # User dashboard
│   └── api/                # API routes
├── components/             # React components
│   ├── ui/                 # Base UI components (shadcn)
│   ├── loan/               # Loan-specific components
│   └── layout/             # Header, footer, navigation
├── lib/
│   └── exle/               # Blockchain integration
│       ├── exle.ts         # Core loan functions
│       ├── contracts.ts    # Smart contract addresses
│       └── transactions.ts # Transaction builders
├── stores/                 # Zustand state stores
├── hooks/                  # Custom React hooks
└── types/                  # TypeScript definitions
```

## Scripts

```bash
npm run dev        # Start development server
npm run build      # Production build
npm run start      # Start production server
npm run test       # Run tests
npm run test:watch # Run tests in watch mode
npm run lint       # Run ESLint
```

## How It Works

1. **Borrower** creates a loan request specifying amount, interest rate, and terms
2. **Lender(s)** fund the loan by sending tokens to the loan's smart contract
3. **Borrower** withdraws funds once the loan is fully funded
4. **Borrower** repays principal + interest before the deadline
5. **Lender(s)** withdraw their share of the repayment

All transactions are secured by Ergo smart contracts - no trust required.

## Documentation

See [architecture.md](./architecture.md) for detailed technical documentation.

## License

MIT
