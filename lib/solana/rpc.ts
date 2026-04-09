import {
  Connection,
  PublicKey,
  type Commitment,
  type Finality,
  type ParsedAccountData,
} from "@solana/web3.js";

import { getServerEnv } from "@/lib/config";

const DEFAULT_COMMITMENT: Commitment = "confirmed";
const DEFAULT_FINALITY: Finality = "confirmed";
const MAX_RETRIES = 3;
const SAFETY_RPS = 8;

let connection: Connection | null = null;
const requestTimestamps: number[] = [];

async function enforceRateLimit(): Promise<void> {
  const now = Date.now();

  while (requestTimestamps.length > 0 && now - requestTimestamps[0] > 1000) {
    requestTimestamps.shift();
  }

  if (requestTimestamps.length >= SAFETY_RPS) {
    const waitMs = 1000 - (now - requestTimestamps[0]);
    await new Promise((resolve) => setTimeout(resolve, waitMs));
  }

  requestTimestamps.push(Date.now());
}

async function withRetry<T>(work: () => Promise<T>, attempt = 0): Promise<T> {
  await enforceRateLimit();

  try {
    return await work();
  } catch (error) {
    if (attempt >= MAX_RETRIES) {
      throw error;
    }

    const backoffMs = 250 * 2 ** attempt;
    await new Promise((resolve) => setTimeout(resolve, backoffMs));
    return withRetry(work, attempt + 1);
  }
}

/**
 * Returns the shared Helius-backed Solana connection.
 *
 * @returns The connection instance.
 */
export function getRpcConnection(): Connection {
  if (!connection) {
    const env = getServerEnv();
    connection = new Connection(
      `https://mainnet.helius-rpc.com/?api-key=${env.HELIUS_API_KEY}`,
      DEFAULT_COMMITMENT,
    );
  }

  return connection;
}

/**
 * Reads parsed mint account info from Solana.
 *
 * @param address - Mint address.
 * @returns Parsed account info.
 */
export async function getParsedMintAccount(address: string) {
  const publicKey = new PublicKey(address);
  const result = await withRetry(() =>
    getRpcConnection().getParsedAccountInfo(publicKey, DEFAULT_COMMITMENT),
  );

  return result.value?.data as ParsedAccountData | undefined;
}

/**
 * Returns the largest token accounts for a mint.
 *
 * @param address - Mint address.
 * @returns Largest accounts response.
 */
export async function getLargestTokenAccounts(address: string) {
  return withRetry(() =>
    getRpcConnection().getTokenLargestAccounts(new PublicKey(address), DEFAULT_COMMITMENT),
  );
}

/**
 * Returns token supply information for a mint.
 *
 * @param address - Mint address.
 * @returns Token supply response.
 */
export async function getTokenSupply(address: string) {
  return withRetry(() =>
    getRpcConnection().getTokenSupply(new PublicKey(address), DEFAULT_COMMITMENT),
  );
}

/**
 * Returns token accounts owned by a wallet.
 *
 * @param address - Wallet address.
 * @returns Parsed token accounts by owner.
 */
export async function getParsedTokenAccountsByOwner(address: string) {
  return withRetry(() =>
    getRpcConnection().getParsedTokenAccountsByOwner(
      new PublicKey(address),
      {
        programId: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
      },
      DEFAULT_COMMITMENT,
    ),
  );
}

/**
 * Returns recent signatures for a public key.
 *
 * @param address - Wallet or mint address.
 * @param limit - Signature limit.
 * @returns Signature info list.
 */
export async function getRecentSignatures(address: string, limit = 50) {
  return withRetry(() =>
    getRpcConnection().getSignaturesForAddress(new PublicKey(address), { limit }),
  );
}

/**
 * Returns parsed transactions for a set of signatures.
 *
 * @param signatures - Signatures to fetch.
 * @returns Parsed transactions.
 */
export async function getParsedTransactions(signatures: string[]) {
  return withRetry(() =>
    getRpcConnection().getParsedTransactions(signatures, {
      commitment: DEFAULT_FINALITY,
      maxSupportedTransactionVersion: 0,
    }),
  );
}
