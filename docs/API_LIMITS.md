# API Limits

Scout is designed around external APIs that may rate limit or degrade. This document is the implementation-facing snapshot of the current assumptions.

## Helius

- Used for mint metadata, token accounts, wallet balances, and enhanced transaction lookups
- Client includes retry with exponential backoff
- App-level rate target stays below the advertised free-tier ceiling

## Jupiter

- Used for live price batches and honeypot quote simulation
- Quotes are cached briefly and treated as directional rather than deterministic execution proof

## DexScreener

- Used for pair, liquidity, market cap, and volume metadata
- Public endpoint should be cached because it may be hot on the token page

## DexPaprika

- Used only for OHLCV chart data
- Failures should degrade the chart gracefully rather than breaking the full analysis page
