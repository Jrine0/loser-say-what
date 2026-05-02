# DEBTIFY

DEBTIFY is an AI-driven debt accountability platform with real financial consequences.
Users lock XLM on Stellar as a commitment stake, then either recover funds by hitting goals or lose the stake to a configured charity wallet.

## Core Flow

1. Create a debt-reduction goal.
2. Connect a Stellar wallet (Freighter or Albedo).
3. Lock an XLM stake into escrow.
4. Receive AI coaching and submit progress evidence.
5. Resolve outcome:
- Pass: stake is returned.
- Fail: stake is sent to charity.

## Features

1. Goal definition with accountability staking.
2. Stellar-based escrow and payout flow.
3. AI coaching chat experience.
4. Verdict screen for progress review and release action.
5. Dashboard and roast views for motivation and visibility.

## Tech Stack

1. Next.js 16 (App Router)
2. TypeScript
3. React 19
4. Clerk authentication
5. Stellar SDK
6. Freighter API integration

## Project Structure

1. app/api/stake: Build unsigned Stellar payment XDR.
2. app/api/confirm-stake: Submit signed transaction and persist stake record.
3. app/api/release: Return stake to user or donate to charity.
4. app/components: Shared UI and wallet provider.
5. lib/stellar.ts: Network config, explorer URL, and validation helpers.
6. lib/stakes-store.ts: In-memory stake state.
7. scripts: Escrow key generation helpers.

## Environment Variables

Create .env.local in the repository root.

```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
CLERK_SECRET_KEY=sk_test_your_key_here
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/signin
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/signup
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/dashboard
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/dashboard

# Stellar
NEXT_PUBLIC_STELLAR_NETWORK=testnet
NEXT_PUBLIC_STELLAR_ESCROW_PUBLIC_KEY=GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
STELLAR_ESCROW_SECRET=SXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
STELLAR_CHARITY_PUBLIC_KEY=GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

# AI
GEMINI_API_KEY=your_gemini_api_key
```

Notes:
1. Use testnet for development.
2. Keep STELLAR_ESCROW_SECRET server-side only.
3. Never expose private keys in client code or logs.

## Local Development

1. Install dependencies:

```bash
npm install
```

2. Generate escrow wallet credentials:

```bash
npx ts-node scripts/generate-keypair.ts
```

3. Start the app:

```bash
npm run dev
```

4. Open http://localhost:3000

## Quality Commands

```bash
npm run lint
npm run build
```

## API Overview

1. POST /api/stake
- Input: amountXLM, goalId, userId, userWallet
- Output: unsigned transactionXdr

2. POST /api/confirm-stake
- Input: signedXdr, goalId, userId, amountXLM, userWallet
- Output: txHash, explorerUrl

3. POST /api/release
- Input: goalId, userId, pass
- Output: txHash, explorerUrl, updated release message

## Security and Production Notes

1. Replace in-memory stake storage with a persistent database before production.
2. Add signed user session checks on all write endpoints.
3. Add rate limiting and request validation.
4. Store secrets in managed secret storage.

## License

ISC

