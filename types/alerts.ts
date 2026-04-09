export type AlertCondition = "score_below" | "liquidity_below";
export type AlertStatus = "ACTIVE" | "TRIGGERED" | "DISABLED";

export interface Alert {
  id: string;
  walletAddress: string;
  tokenAddress: string;
  condition: AlertCondition;
  threshold: number;
  enabled: boolean;
  status: AlertStatus;
  lastEvaluatedAt: number | null;
  lastTriggeredAt: number | null;
  createdAt: number;
  updatedAt: number;
}

export interface AlertEvaluation {
  alert: Alert;
  matched: boolean;
  currentValue: number | null;
  reason: string;
}
