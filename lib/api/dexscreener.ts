import { readCache, writeCache } from "@/lib/cache/upstash";
import { fetchJson } from "@/lib/api/http";
import { timestampBucket } from "@/lib/utils";

const TTL_SECONDS = 30;

interface DexScreenerResponse {
  pairs?: Array<{
    pairAddress: string;
    baseToken: { address: string; name: string; symbol: string };
    liquidity?: { usd?: number };
    volume?: { h24?: number };
    fdv?: number;
    priceUsd?: string;
    pairCreatedAt?: number;
  }>;
}

export interface PairSnapshot {
  pairAddress: string | null;
  liquidityUsd: number | null;
  volume24hUsd: number | null;
  marketCapUsd: number | null;
  priceUsd: number | null;
  pairCreatedAt: number | null;
}

/**
 * Fetches pair data for a token from DexScreener.
 *
 * @param tokenAddress - Solana mint address.
 * @returns The best available pair snapshot.
 */
export async function getDexScreenerTokenSnapshot(
  tokenAddress: string,
): Promise<PairSnapshot> {
  const cacheKey = `scout:dexscreener:${tokenAddress}:${timestampBucket(TTL_SECONDS)}`;
  const cached = await readCache<PairSnapshot>(cacheKey);
  if (cached) {
    return cached;
  }

  const data = await fetchJson<DexScreenerResponse>(
    `https://api.dexscreener.com/latest/dex/tokens/${tokenAddress}`,
  );
  const pair = data.pairs?.[0];

  const snapshot: PairSnapshot = {
    pairAddress: pair?.pairAddress ?? null,
    liquidityUsd: pair?.liquidity?.usd ?? null,
    volume24hUsd: pair?.volume?.h24 ?? null,
    marketCapUsd: pair?.fdv ?? null,
    priceUsd: pair?.priceUsd ? Number(pair.priceUsd) : null,
    pairCreatedAt: pair?.pairCreatedAt ?? null,
  };

  await writeCache(cacheKey, snapshot, TTL_SECONDS);
  return snapshot;
}
