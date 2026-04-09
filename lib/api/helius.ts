import { getServerEnv } from "@/lib/config";
import { fetchJson } from "@/lib/api/http";

export interface EnhancedTransaction {
  signature: string;
  slot: number;
  timestamp: number;
  feePayer: string;
  tokenTransfers?: Array<{
    fromUserAccount?: string;
    toUserAccount?: string;
    tokenAmount?: number;
    mint?: string;
  }>;
}

/**
 * Fetches enhanced transactions for a wallet or token adjacency analysis.
 *
 * @param address - Target address.
 * @param limit - Maximum number of transactions.
 * @returns Enhanced transaction list.
 */
export async function getEnhancedTransactions(
  address: string,
  limit = 50,
): Promise<EnhancedTransaction[]> {
  const env = getServerEnv();
  const url = new URL(`https://api.helius.xyz/v0/addresses/${address}/transactions`);
  url.searchParams.set("api-key", env.HELIUS_API_KEY);
  url.searchParams.set("limit", String(limit));

  return fetchJson<EnhancedTransaction[]>(url);
}
