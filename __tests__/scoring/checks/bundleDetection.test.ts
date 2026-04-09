import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/api/helius", () => ({
  getEnhancedTransactions: vi.fn(),
}));

import { getEnhancedTransactions } from "@/lib/api/helius";
import { runBundleDetectionCheck } from "@/lib/scoring/checks/bundleDetection";

describe("Bundle Detection Check", () => {
  it("returns UNKNOWN when pair creation time is missing", async () => {
    const result = await runBundleDetectionCheck({
      address: "mint",
      symbol: "TEST",
      name: "Token",
      decimals: 6,
      supply: 1_000_000,
      mintAuthority: null,
      freezeAuthority: null,
      pairCreatedAt: null,
    });

    expect(result.score).toBe(2);
    expect(result.metadata?.state).toBe("UNKNOWN");
  });

  it("only flags suspicious activity inside the first 30 minutes", async () => {
    vi.mocked(getEnhancedTransactions).mockResolvedValue([
      {
        signature: "1",
        slot: 1,
        timestamp: 1_700_000_100,
        feePayer: "payer",
        tokenTransfers: [
          { fromUserAccount: "a", toUserAccount: "b" },
          { fromUserAccount: "a", toUserAccount: "c" },
          { fromUserAccount: "a", toUserAccount: "d" },
        ],
      },
      {
        signature: "2",
        slot: 2,
        timestamp: 1_700_100_100,
        feePayer: "payer",
        tokenTransfers: [{ fromUserAccount: "a", toUserAccount: "z" }],
      },
    ]);

    const result = await runBundleDetectionCheck({
      address: "mint",
      symbol: "TEST",
      name: "Token",
      decimals: 6,
      supply: 1_000_000,
      mintAuthority: null,
      freezeAuthority: null,
      pairCreatedAt: 1_700_000_000,
    });

    expect(result.passed).toBe(false);
    expect(result.score).toBe(5);
    expect(result.metadata?.sampledTransactions).toBe(1);
  });
});
