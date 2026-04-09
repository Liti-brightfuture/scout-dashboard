import { getDexScreenerTokenSnapshot } from "@/lib/api/dexscreener";
import { getLargestTokenAccounts, getParsedMintAccount, getTokenSupply } from "@/lib/solana/rpc";
import type { HolderDistributionSnapshot, TokenInfo } from "@/types/token";

const KNOWN_PROGRAM_OWNER_FRAGMENTS = [
  "11111111111111111111111111111111",
  "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
];

/**
 * Fetches token metadata from Solana and market metadata from DexScreener.
 *
 * @param address - Token mint address.
 * @returns Consolidated token info.
 */
export async function getTokenInfo(address: string): Promise<TokenInfo> {
  const [mintAccount, market, supplyResponse] = await Promise.all([
    getParsedMintAccount(address),
    getDexScreenerTokenSnapshot(address),
    getTokenSupply(address),
  ]);

  const parsed = mintAccount?.parsed?.info;

  return {
    address,
    symbol: parsed?.symbol ?? market.pairAddress?.slice(0, 4).toUpperCase() ?? "SCOUT",
    name: parsed?.name ?? "Solana Token",
    decimals: parsed?.decimals ?? supplyResponse.value.decimals,
    supply: Number(supplyResponse.value.uiAmount ?? 0),
    mintAuthority: parsed?.mintAuthority ?? null,
    freezeAuthority: parsed?.freezeAuthority ?? null,
    liquidityUsd: market.liquidityUsd,
    marketCapUsd: market.marketCapUsd,
    volume24hUsd: market.volume24hUsd,
    priceUsd: market.priceUsd,
    pairAddress: market.pairAddress,
    pairCreatedAt: market.pairCreatedAt,
  };
}

/**
 * Builds a lightweight holder concentration snapshot from largest accounts.
 *
 * @param address - Token mint address.
 * @returns Holder concentration aggregates.
 */
export async function getTokenHolders(address: string): Promise<HolderDistributionSnapshot> {
  const [largestAccounts, supply] = await Promise.all([
    getLargestTokenAccounts(address),
    getTokenSupply(address),
  ]);

  const uiSupply = Number(supply.value.uiAmount ?? 0);
  const filtered = largestAccounts.value.filter((account) =>
    !KNOWN_PROGRAM_OWNER_FRAGMENTS.some((fragment) =>
      account.address.toBase58().includes(fragment),
    ),
  );
  const percentages = filtered.map((account) =>
    uiSupply > 0 ? (Number(account.uiAmount ?? 0) / uiSupply) * 100 : 0,
  );

  const top1 = percentages.slice(0, 1).reduce((sum, value) => sum + value, 0);
  const top5 = percentages.slice(0, 5).reduce((sum, value) => sum + value, 0);
  const top10 = percentages.slice(0, 10).reduce((sum, value) => sum + value, 0);

  return {
    top1,
    top5,
    top10,
    distribution: [
      ...filtered.slice(0, 5).map((account, index) => ({
        label: `Top ${index + 1}`,
        address: account.address.toBase58(),
        percentage: percentages[index] ?? 0,
      })),
      {
        label: "Rest",
        percentage: Math.max(0, 100 - top5),
      },
    ],
  };
}
