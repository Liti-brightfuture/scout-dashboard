import { randomUUID } from "node:crypto";

import { ensureAlertsTable, getSql } from "@/lib/db/neon";
import type { Alert, AlertCondition, AlertStatus } from "@/types/alerts";

function mapAlertRow(row: Record<string, unknown>): Alert {
  return {
    id: String(row.id),
    walletAddress: String(row.wallet_address),
    tokenAddress: String(row.token_address),
    condition: row.condition as AlertCondition,
    threshold: Number(row.threshold),
    enabled: Boolean(row.enabled),
    status: row.status as AlertStatus,
    lastEvaluatedAt: row.last_evaluated_at ? Number(row.last_evaluated_at) : null,
    lastTriggeredAt: row.last_triggered_at ? Number(row.last_triggered_at) : null,
    createdAt: Number(row.created_at),
    updatedAt: Number(row.updated_at),
  };
}

/**
 * Fetches all alerts for a wallet.
 *
 * @param walletAddress - Wallet owner identifier.
 * @returns Stored alerts.
 */
export async function listAlerts(walletAddress: string): Promise<Alert[]> {
  await ensureAlertsTable();
  const sql = getSql();
  const rows = (await sql`
    SELECT * FROM scout_alerts
    WHERE wallet_address = ${walletAddress}
    ORDER BY created_at DESC;
  `) as Array<Record<string, unknown>>;
  return rows.map((row) => mapAlertRow(row));
}

/**
 * Creates a new wallet-linked alert.
 *
 * @param input - Alert creation payload.
 * @returns The inserted alert.
 */
export async function createAlert(input: {
  walletAddress: string;
  tokenAddress: string;
  condition: AlertCondition;
  threshold: number;
}): Promise<Alert> {
  await ensureAlertsTable();
  const sql = getSql();
  const now = Date.now();
  const id = randomUUID();

  const rows = (await sql`
    INSERT INTO scout_alerts (
      id, wallet_address, token_address, condition, threshold, enabled, status,
      last_evaluated_at, last_triggered_at, created_at, updated_at
    )
    VALUES (
      ${id}, ${input.walletAddress}, ${input.tokenAddress}, ${input.condition}, ${input.threshold},
      ${true}, ${"ACTIVE"}, ${null}, ${null}, ${now}, ${now}
    )
    RETURNING *;
  `) as Array<Record<string, unknown>>;

  return mapAlertRow(rows[0]);
}

/**
 * Updates alert enabled or status fields.
 *
 * @param input - Patch payload.
 * @returns The updated alert.
 */
export async function updateAlert(input: {
  id: string;
  walletAddress: string;
  enabled?: boolean;
  status?: AlertStatus;
  lastEvaluatedAt?: number | null;
  lastTriggeredAt?: number | null;
}): Promise<Alert> {
  await ensureAlertsTable();
  const sql = getSql();
  const rows = (await sql`
    UPDATE scout_alerts
    SET
      enabled = COALESCE(${input.enabled}, enabled),
      status = COALESCE(${input.status}, status),
      last_evaluated_at = COALESCE(${input.lastEvaluatedAt}, last_evaluated_at),
      last_triggered_at = COALESCE(${input.lastTriggeredAt}, last_triggered_at),
      updated_at = ${Date.now()}
    WHERE id = ${input.id} AND wallet_address = ${input.walletAddress}
    RETURNING *;
  `) as Array<Record<string, unknown>>;

  if (rows.length === 0) {
    throw new Error("Alert not found for wallet.");
  }

  return mapAlertRow(rows[0]);
}
