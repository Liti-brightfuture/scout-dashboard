import { getEnhancedTransactions } from "@/lib/api/helius";
import { getJupiterPrice } from "@/lib/api/jupiter";
import { getParsedTokenAccountsByOwner } from "@/lib/solana/rpc";
import { riskFromScore } from "@/lib/utils";
import type { WalletData, WalletTokenBalance, WalletTransaction } from "@/types/wallet";

/**
 * Fetches token balances held by a wallet.
 *
 * @param address - Wallet address.
 * @returns Token balances enriched with price data when available.
 */
export async function getWalletTokens(address: string): Promise<WalletTokenBalance[]> {
  const response = await getParsedTokenAccountsByOwner(address);
  const tokens = response.value
    .map((entry) => {
      const info = entry.account.data.parsed.info;
      const amount = Number(info.tokenAmount.uiAmount ?? 0);

      return {
        address: info.mint as string,
        amount,
        decimals: Number(info.tokenAmount.decimals ?? 0),
      };
    })
    .filter((entry) => entry.amount > 0)
    .slice(0, 12);

  return Promise.all(
    tokens.map(async (token) => {
      const priceUsd = await getJupiterPrice(token.address);
      const valueUsd = priceUsd !== null ? token.amount * priceUsd : null;

      return {
        ...token,
        symbol: token.address.slice(0, 4).toUpperCase(),
        name: "Wallet Asset",
        priceUsd,
        valueUsd,
        riskLevel: riskFromScore(55),
        score: null,
      };
    }),
  );
}

/**
 * Fetches recent enhanced transaction history for a wallet.
 *
 * @param address - Wallet address.
 * @returns Simplified transaction history.
 */
export async function getWalletHistory(address: string): Promise<WalletTransaction[]> {
  const transactions = await getEnhancedTransactions(address, 20);

  return transactions.map((tx) => ({
    signature: tx.signature,
    slot: tx.slot,
    timestamp: tx.timestamp,
    feePayer: tx.feePayer,
    source: tx.tokenTransfers?.[0]?.fromUserAccount,
    destination: tx.tokenTransfers?.[0]?.toUserAccount,
    amount: tx.tokenTransfers?.[0]?.tokenAmount,
  }));
}

/**
 * Fetches the combined wallet view model.
 *
 * @param address - Wallet address.
 * @returns Wallet balances and recent activity.
 */
export async function getWalletData(address: string): Promise<WalletData> {
  const [tokens, history] = await Promise.all([
    getWalletTokens(address),
    getWalletHistory(address),
  ]);

  return {
    address,
    tokens,
    history,
    fetchedAt: Date.now(),
  };
}
