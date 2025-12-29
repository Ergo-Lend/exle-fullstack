# EXLE Architecture

A simple guide to how EXLE works - explained for everyone.

---

## What is EXLE?

EXLE is a **peer-to-peer lending platform** built on the Ergo blockchain. It allows people to:
- **Borrow money** by creating loan requests
- **Lend money** by funding other people's loans
- **Earn interest** when borrowers repay their loans

Think of it like a digital marketplace where borrowers and lenders can connect directly, without a bank in the middle. The blockchain acts as the trustworthy middleman that ensures everyone plays by the rules.

---

## The Three Main Parts

```
┌─────────────────────────────────────────────────────────────────┐
│                         EXLE Platform                           │
├─────────────────┬─────────────────────┬─────────────────────────┤
│    FRONTEND     │      BACKEND        │      BLOCKCHAIN         │
│  (What you see) │ (Behind the scenes) │   (Where money lives)   │
├─────────────────┼─────────────────────┼─────────────────────────┤
│ • Website pages │ • Fetches data      │ • Stores all loans      │
│ • Buttons/forms │ • Monitors loans    │ • Processes payments    │
│ • Wallet popup  │ • Sends transactions│ • Enforces rules        │
└─────────────────┴─────────────────────┴─────────────────────────┘
```

---

## 1. Frontend (What Users See)

The website has these main pages:

### Home Page (`/`)
The landing page that explains what EXLE is and how it works. Has a big "Create Loan" button to get started.

### Loans Page (`/loans`)
Shows all available loans as cards. Each card displays:
- Loan title and description
- How much money is needed
- Interest rate offered
- Days left to fund the loan
- Progress bar showing how much is funded

### Create Loan Page (`/loans/create`)
A step-by-step wizard (5 steps) for borrowers:
1. **Choose loan type** - Solo (one lender) or Crowdfund (multiple lenders)
2. **Add details** - Title and description of what the loan is for
3. **Set terms** - Amount, interest rate, repayment period, deadline
4. **Accept terms** - Legal acknowledgments
5. **Pay & confirm** - Sign with your wallet to create the loan

### Loan Details Page (`/loans/[id]`)
Shows everything about one specific loan with action buttons:
- **If you're a lender**: "Fund this loan" button
- **If you're the borrower**: "Withdraw funds" or "Repay" buttons

### Account Pages (`/account/*`)
Your personal dashboard:
- **My Loans** - Loans you created
- **My Repayments** - Loans you need to repay
- **My Donations** - Loans you funded as a lender
- **Transaction History** - All your past activity

### Wallet Connection
- Click "Connect Wallet" in the top right
- Your Nautilus wallet extension opens
- Approve the connection
- Now you can create loans and make transactions

---

## 2. Backend (Behind the Scenes)

The backend is a set of services that keep everything running smoothly.

### Data Fetching
The app constantly pulls fresh data from the blockchain:
- Every **5 minutes**: Refreshes all loan and repayment data
- Every **hour**: Checks for important events (fully funded loans, completed repayments)
- **On demand**: When you open a page, it fetches the latest data

### API Endpoints (How the app talks to blockchain)

| What it does | How it works |
|--------------|--------------|
| Get all loans | Asks blockchain for all active loan boxes |
| Get loan details | Finds a specific loan by its unique ID |
| Get repayments | Lists all loans in repayment phase |
| Submit transaction | Sends your signed transaction to blockchain |
| Check transaction | Validates a transaction before sending |

### External Connection
The app connects to:
- **Ergo Node** (`crystalpool.cc:9055`) - Where all the blockchain data lives
- **Transaction Service** (`crystalpool.cc:4004`) - Processes and validates transactions

---

## 3. Blockchain (Where the Magic Happens)

### How Loans Work on the Blockchain

On Ergo, everything is stored in "boxes" (like digital containers). Each loan uses several boxes:

```
┌─────────────────────────────────────────────────────────────┐
│                      SERVICE BOX                             │
│  (The protocol's control center - manages all loans)         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                       LEND BOX                               │
│  Created when: Borrower requests a loan                      │
│  Contains: Loan amount, interest rate, deadline, borrower ID │
│  Purpose: Holds the loan request until it's fully funded     │
└─────────────────────────────────────────────────────────────┘
                              │
                     (when fully funded)
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    REPAYMENT BOX                             │
│  Created when: Loan reaches 100% funding                     │
│  Contains: Amount owed, repayment deadline, payments made    │
│  Purpose: Tracks repayment and distributes money to lenders  │
└─────────────────────────────────────────────────────────────┘
```

### The Loan Lifecycle

Here's what happens from start to finish:

```
STEP 1: CREATE LOAN
────────────────────
Borrower fills out the loan form:
• Amount needed: 100 SigUSD
• Interest rate: 10%
• Repayment period: 3 months
• Funding deadline: 30 days

→ A "Lend Box" is created on the blockchain
→ The loan appears on the Loans page

         ↓

STEP 2: FUNDING
────────────────────
Lenders see the loan and decide to fund it:
• Solo: One person provides all 100 SigUSD
• Crowdfund: Multiple people chip in (50 + 30 + 20 = 100)

→ Money flows into the Lend Box
→ Progress bar fills up

         ↓

STEP 3: WITHDRAWAL
────────────────────
Once 100% funded:
• Lend Box converts to "Repayment Box"
• Borrower can now withdraw the 100 SigUSD
• Repayment countdown begins

         ↓

STEP 4: REPAYMENT
────────────────────
Borrower pays back the loan:
• Principal: 100 SigUSD (what they borrowed)
• Interest: 10 SigUSD (the fee for borrowing)
• Total repayment: 110 SigUSD

→ Money flows into the Repayment Box

         ↓

STEP 5: LENDER PAYOUT
────────────────────
After borrower repays:
• Lenders withdraw their share
• If you lent 50 of 100, you get 55 back (50 + 5 interest)

→ Everyone gets their money!
```

### Smart Contracts (The Rules)

The blockchain has built-in rules that automatically enforce:
- Borrower can't steal the money (must repay)
- Lenders can't take more than their share
- Interest is calculated correctly
- Deadlines are enforced
- Protocol fees are handled automatically

**Nobody can cheat** because the rules are written in code that runs on the blockchain.

---

## How It All Connects

Here's what happens when you interact with EXLE:

### When You Browse Loans
```
You open /loans page
       ↓
Frontend asks Backend for loan data
       ↓
Backend fetches from Ergo blockchain
       ↓
Data flows back up
       ↓
You see loan cards on screen
```

### When You Create a Loan
```
You fill out the loan form
       ↓
Click "Pay via browser wallet"
       ↓
Nautilus wallet opens (you approve)
       ↓
Transaction is signed with your private key
       ↓
Backend sends transaction to blockchain
       ↓
Blockchain creates your Lend Box
       ↓
Your loan appears on the platform!
```

### When You Fund a Loan
```
You click "Fund" on a loan
       ↓
Enter the amount
       ↓
Nautilus wallet opens (you approve)
       ↓
Your money goes into the Lend Box
       ↓
If loan is 100% funded:
  → Converts to Repayment Box
  → Borrower can withdraw
```

---

## Technology Used

| Component | Technology | Purpose |
|-----------|------------|---------|
| Website | Next.js (React) | The pages you see and interact with |
| Styling | TailwindCSS | Makes everything look nice |
| State | Zustand | Remembers data as you navigate |
| Blockchain | Ergo + Fleet SDK | Talks to the Ergo blockchain |
| Wallet | Nautilus | Signs transactions securely |
| Testing | Vitest | Makes sure everything works |

---

## Summary

EXLE is like a **digital lending marketplace** where:

1. **Borrowers** create loan requests with their terms
2. **Lenders** browse loans and fund ones they like
3. **Blockchain** holds the money and enforces the rules
4. **Smart contracts** ensure everyone plays fair
5. **Your wallet** keeps your money secure (only you can sign)

The whole system runs without a bank - just code, math, and the Ergo blockchain.
