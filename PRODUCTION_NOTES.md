# Production Notes - Scout Dashboard

## What works now versus what would need to change at production scale

### Holder Concentration (Check #3)

**Current behavior**: Scout uses token-largest-account style holder snapshots to surface obvious concentration risks quickly.

**Critical limitation**: Top-holder snapshots do not fully represent fragmented distributions. A malicious deployer can split supply across many small wallets and appear healthier than reality.

**Production-scale path**: Full paginated token-account inventory plus clustering over historical fee-payer or funding relationships. That requires a much larger Helius credit budget and more aggressive caching than the free tier supports.

### Bundle Detection (Check #6)

**Current behavior**: The bundle detector scans the token's early transaction neighborhood and flags suspicious shared fee-payer or same-slot acquisition patterns.

**Critical limitation**: This is heuristic, not deterministic. Jito bundles are not directly identifiable from generic transaction history alone.

**Production-scale path**: Integrate Jito-specific data or a paid indexing partner, then validate the heuristic against labeled rug-pull samples.

### Liquidity Lock (Check #5)

**Current behavior**: Scout uses liquidity and pair metadata plus known lock/burn address heuristics.

**Critical limitation**: Solana does not expose a single universal, canonical lock registry. Custom lockers or unknown contract patterns can evade this check.

**Production-scale path**: Maintain a curated on-chain lock registry or partner with a specialized security dataset.

### Honeypot Simulation (Check #4)

**Current behavior**: Scout uses Jupiter quote responses to simulate a sell route and infer execution risk.

**Critical limitation**: A quote is not an execution guarantee. A route may quote successfully and still fail under real mempool or slippage conditions.

**Production-scale path**: Pair quoting with richer route diagnostics, historical execution outcomes, and tighter liquidity modeling.

### Rate limits

Scout is designed to be honest about free-tier ceilings.

| Provider | Current use | Practical concern |
| --- | --- | --- |
| Helius | Mint data, holders, wallet balances, graph signals | Credits become the bottleneck as usage grows |
| DexScreener | Pair, liquidity, volume | Public endpoint should be cached aggressively |
| Jupiter | Price and quote | Quotes are valuable but should be rate-limited and cached |
| DexPaprika | OHLCV chart data | Fine for MVP, but upstream availability should not be assumed |

### Current cache strategy

| Data type | TTL |
| --- | --- |
| Token metadata | 10 minutes |
| Holder data | 5 minutes |
| Risk score | 2 minutes |
| Live prices | 15 seconds |
| OHLCV | 60 seconds |

## Architecture decisions rejected

### Why not Birdeye

The free-tier economics are too restrictive for a real-time dashboard that performs multiple requests per token analysis.

### Why not a separate FastAPI service in v1

A split backend would add deployment and coordination cost before the MVP proves its shape. Next.js route handlers are sufficient for the first release while keeping future extraction paths clear.

### Why polling instead of background alerts

Polling while the user is present is honest, cheap, and easy to reason about. Real off-session alerting needs background infrastructure and ownership semantics that would distract from the core product.

## Manual test tokens

Record the real tokens you analyze during manual QA here before publishing the project publicly.
