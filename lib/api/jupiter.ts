import { readCache, writeCache } from "@/lib/cache/upstash";
import { getServerEnv } from "@/lib/config";
import { fetchJson } from "@/lib/api/http";
import { timestampBucket } from "@/lib/utils";

const PRICE_TTL = 15;

interface JupiterPriceResponse {
  data: Record<string, { price: number }>;
}

interface JupiterQuoteResponse {
  priceImpactPct?: string;
  outAmount?: string;
  routePlan?: unknown[];
}

/**
 * Reads the current price for a mint from Jupiter Price API.
 *
 * @param mintAddress - Solana mint address.
 * @returns Price in USD or null.
 */
export async function getJupiterPrice(mintAddress: string): Promise<number | null> {
  const cacheKey = `scout:jupiter:price:${mintAddress}:${timestampBucket(PRICE_TTL)}`;
  const cached = await readCache<number>(cacheKey);
  if (cached !== null) {
    return cached;
  }

  const env = getServerEnv();
  const data = await fetchJson<JupiterPriceResponse>(
    `https://lite-api.jup.ag/price/v3?ids=${mintAddress}`,
    {
      headers: {
        "x-api-key": env.JUPITER_API_KEY,
      },
    },
  );

  const price = data.data[mintAddress]?.price ?? null;
  if (price !== null) {
    await writeCache(cacheKey, price, PRICE_TTL);
  }

  return price;
}

export interface QuoteSimulation {
  available: boolean;
  priceImpactPct: number | null;
  outAmount: number | null;
}

/**
 * Requests a Jupiter quote as a sell-path simulation.
 *
 * @param inputMint - Token to sell.
 * @param amount - Raw token amount.
 * @returns Quote availability and price impact details.
 */
export async function simulateJupiterSellQuote(
  inputMint: string,
  amount: number,
): Promise<QuoteSimulation> {
  const env = getServerEnv();
  const usdcMint = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
  const url = new URL("https://quote-api.jup.ag/v6/quote");
  url.searchParams.set("inputMint", inputMint);
  url.searchParams.set("outputMint", usdcMint);
  url.searchParams.set("amount", Math.max(1, Math.floor(amount)).toString());
  url.searchParams.set("slippageBps", "100");

  try {
    const data = await fetchJson<JupiterQuoteResponse>(url, {
      headers: {
        "x-api-key": env.JUPITER_API_KEY,
      },
    });

    return {
      available: Array.isArray(data.routePlan) && data.routePlan.length > 0,
      priceImpactPct: data.priceImpactPct ? Number(data.priceImpactPct) : null,
      outAmount: data.outAmount ? Number(data.outAmount) : null,
    };
  } catch {
    return {
      available: false,
      priceImpactPct: null,
      outAmount: null,
    };
  }
}
