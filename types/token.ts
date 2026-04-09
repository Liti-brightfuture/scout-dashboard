export type RiskLevel = "SAFE" | "WARNING" | "DANGER" | "UNKNOWN";
export type CheckSeverity = "CRITICAL" | "HIGH" | "MEDIUM" | "INFO";

export interface HolderBucket {
  label: string;
  percentage: number;
  address?: string;
}

export interface HolderDistributionSnapshot {
  top1: number;
  top5: number;
  top10: number;
  distribution: HolderBucket[];
}

export interface TokenInfo {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  supply: number;
  mintAuthority: string | null;
  freezeAuthority: string | null;
  imageUrl?: string | null;
  description?: string | null;
  liquidityUsd?: number | null;
  marketCapUsd?: number | null;
  volume24hUsd?: number | null;
  priceUsd?: number | null;
  pairAddress?: string | null;
  pairCreatedAt?: number | null;
}

export interface PriceCandle {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface CheckResult {
  id: string;
  name: string;
  passed: boolean;
  severity: CheckSeverity;
  score: number;
  maxScore: number;
  details: string;
  dataSource: string;
  metadata?: Record<string, number | string | boolean | null>;
}

export interface ScoreResult {
  total: number;
  breakdown: CheckResult[];
  riskLevel: RiskLevel;
  summary: string;
  analyzedAt: number;
  dataVersion: string;
}

export interface TokenAnalysis {
  token: TokenInfo;
  holderSnapshot: HolderDistributionSnapshot;
  priceCandles: PriceCandle[];
  score: ScoreResult;
}
