import type { CheckResult, TokenInfo } from "@/types/token";
import { WEIGHTS } from "@/lib/scoring/weights";

/**
 * Scores whether mint authority has been revoked.
 *
 * @param token - Token metadata.
 * @returns Mint authority check result.
 */
export function runMintAuthorityCheck(token: TokenInfo): CheckResult {
  const passed = token.mintAuthority === null;

  return {
    id: "mintAuthority",
    name: "Mint authority revoked",
    passed,
    severity: "CRITICAL",
    score: passed ? 0 : WEIGHTS.mintAuthority,
    maxScore: WEIGHTS.mintAuthority,
    details: passed
      ? "Mint authority is revoked."
      : "Creator can mint additional tokens and dilute supply.",
    dataSource: "Helius RPC",
    metadata: {
      mintAuthority: token.mintAuthority,
    },
  };
}
