import type { RiskLevel } from "@/types/token";

export interface WalletTokenBalance {
  address: string;
  symbol: string;
  name: string;
  amount: number;
  decimals: number;
  riskLevel: RiskLevel;
  score?: number | null;
  priceUsd?: number | null;
  valueUsd?: number | null;
}

export interface WalletTransaction {
  signature: string;
  slot: number;
  timestamp: number;
  feePayer: string;
  source?: string;
  destination?: string;
  amount?: number;
}

export interface WalletData {
  address: string;
  tokens: WalletTokenBalance[];
  history: WalletTransaction[];
  fetchedAt: number;
}
