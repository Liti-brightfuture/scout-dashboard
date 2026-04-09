import { neon } from "@neondatabase/serverless";

import { getServerEnv } from "@/lib/config";

let sqlClient: ReturnType<typeof neon> | null = null;

/**
 * Returns a singleton Neon SQL client.
 *
 * @returns The Neon SQL tagged template client.
 */
export function getSql() {
  if (!sqlClient) {
    sqlClient = neon(getServerEnv().NEON_DATABASE_URL);
  }

  return sqlClient;
}

/**
 * Ensures the alerts table exists before CRUD operations run.
 */
export async function ensureAlertsTable(): Promise<void> {
  const sql = getSql();

  await sql`
    CREATE TABLE IF NOT EXISTS scout_alerts (
      id TEXT PRIMARY KEY,
      wallet_address TEXT NOT NULL,
      token_address TEXT NOT NULL,
      condition TEXT NOT NULL,
      threshold DOUBLE PRECISION NOT NULL,
      enabled BOOLEAN NOT NULL DEFAULT TRUE,
      status TEXT NOT NULL DEFAULT 'ACTIVE',
      last_evaluated_at BIGINT,
      last_triggered_at BIGINT,
      created_at BIGINT NOT NULL,
      updated_at BIGINT NOT NULL
    );
  `;
}
