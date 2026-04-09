# Scout - Solana Token Intelligence

> Real-time on-chain analysis. Scores Solana tokens from 0-100 using six automated checks to surface rug-pull patterns before you buy.

![Scout Demo](docs/assets/demo.gif)

Scout is a recruiter-grade Web3 portfolio project built as a serious MVP rather than a tutorial clone. It combines Solana mint analysis, holder concentration heuristics, live price and liquidity data, wallet relationship graphs, and wallet-linked alerts in one Next.js application.

## What makes this different

Most token scanners stop at basic holder percentages. Scout explains why those numbers matter, layers the signals into an interpretable score, and makes the tradeoffs visible when heuristics are involved.

The wallet relationship graph is the standout module: it traces early wallet interactions around a token so recruiter reviewers can see both UI depth and practical Solana data modeling.

## Stack

- Next.js 16 App Router with strict TypeScript
- Tailwind CSS v4 and CSS custom properties
- Zustand for client state
- Recharts for price and holder visuals
- react-force-graph-2d for wallet graph exploration
- Solana Wallet Adapter + `@solana/web3.js`
- Helius RPC and Enhanced API
- Jupiter Price and Quote API
- DexScreener and DexPaprika
- Neon Postgres and Upstash Redis
- Vitest + React Testing Library

## Features

- Wallet connect with Phantom and Solflare
- Token lookup and portfolio risk badges
- Token analyzer with:
  - score breakdown
  - mint/freeze authority checks
  - holder concentration analysis
  - honeypot sell simulation
  - liquidity lock heuristic
  - bundle detection heuristic
- Wallet graph view with cluster highlighting
- Wallet-linked alerts with polling-based evaluation

## Internal API

- `GET /api/token/[address]`
- `GET /api/wallet/[address]`
- `GET /api/graph/[tokenAddress]`
- `GET /api/alerts?wallet={address}`
- `POST /api/alerts`
- `PATCH /api/alerts`

## Environment

Copy `.env.example` to `.env.local` and provide:

- `HELIUS_API_KEY`
- `JUPITER_API_KEY`
- `NEON_DATABASE_URL`
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

All third-party API calls that require secrets run server-side only.

## Development

```bash
npm install
npm run dev
```

## Tests

```bash
npm run test
```

## Known limitations

Scout intentionally prefers honest heuristics over fake certainty. See [PRODUCTION_NOTES.md](./PRODUCTION_NOTES.md) for the current limits around bundle detection, liquidity lock coverage, holder snapshots, and free-tier rate constraints.
