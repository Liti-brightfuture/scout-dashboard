import { readCache, writeCache } from "@/lib/cache/upstash";
import { fetchJson } from "@/lib/api/http";
import { timestampBucket } from "@/lib/utils";
import type { PriceCandle } from "@/types/token";

const TTL_SECONDS = 60;

interface DexPaprikaCandle {
  timeOpen?: string;
  open?: number;
  high?: number;
  low?: number;
  close?: number;
  volume?: number;
}

/**
 * Fetches recent OHLCV candles for a Solana pool.
 *
 * @param poolAddress - Pool address from market metadata.
 * @returns Candle series suitable for the chart.
 */
export async function getDexPaprikaCandles(poolAddress: string): Promise<PriceCandle[]> {
  const cacheKey = `scout:dexpaprika:${poolAddress}:${timestampBucket(TTL_SECONDS)}`;
  const cached = await readCache<PriceCandle[]>(cacheKey);
  if (cached) {
    return cached;
  }

  const data = await fetchJson<DexPaprikaCandle[]>(
    `https://api.dexpaprika.com/networks/solana/pools/${poolAddress}/ohlcv/hour?limit=24`,
  );

  const candles = data.map((entry) => ({
    timestamp: entry.timeOpen ? new Date(entry.timeOpen).getTime() : Date.now(),
    open: entry.open ?? 0,
    high: entry.high ?? 0,
    low: entry.low ?? 0,
    close: entry.close ?? 0,
    volume: entry.volume ?? 0,
  }));

  await writeCache(cacheKey, candles, TTL_SECONDS);
  return candles;
}
