import type { CheckResult, TokenInfo } from "@/types/token";
import { WEIGHTS } from "@/lib/scoring/weights";

/**
 * Scores whether freeze authority has been revoked.
 *
 * @param token - Token metadata.
 * @returns Freeze authority check result.
 */
export function runFreezeAuthorityCheck(token: TokenInfo): CheckResult {
  const passed = token.freezeAuthority === null;

  return {
    id: "freezeAuthority",
    name: "Freeze authority revoked",
    passed,
    severity: "HIGH",
    score: passed ? 0 : WEIGHTS.freezeAuthority,
    maxScore: WEIGHTS.freezeAuthority,
    details: passed
      ? "Freeze authority is revoked."
      : "Creator can freeze holder accounts and effectively block transfers.",
    dataSource: "Helius RPC",
    metadata: {
      freezeAuthority: token.freezeAuthority,
    },
  };
}
