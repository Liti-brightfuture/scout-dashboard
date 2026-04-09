import { describe, expect, it } from "vitest";
import { runLiquidityDepthCheck } from "@/lib/scoring/checks/liquidityDepth";

const base = {
  address: "mint",
  symbol: "T",
  name: "Token",
  decimals: 6,
  supply: 1_000_000,
  mintAuthority: null,
  freezeAuthority: null,
};

describe("Liquidity Depth Check", () => {
  it("returns UNKNOWN with score 2 when liquidityUsd is null", () => {
    const result = runLiquidityDepthCheck({ ...base, liquidityUsd: null });
    expect(result.score).toBe(2);
    expect(result.metadata?.state).toBe("UNKNOWN");
  });

  it("passes with score 0 for liquidity above $500K", () => {
    const result = runLiquidityDepthCheck({ ...base, liquidityUsd: 600_000 });
    expect(result.passed).toBe(true);
    expect(result.score).toBe(0);
    expect(result.severity).toBe("INFO");
  });

  it("applies partial penalty (3) for $100K–$500K liquidity", () => {
    const result = runLiquidityDepthCheck({ ...base, liquidityUsd: 250_000 });
    expect(result.passed).toBe(false);
    expect(result.score).toBe(3);
    expect(result.severity).toBe("MEDIUM");
  });

  it("applies warning penalty (6) for $20K–$100K liquidity", () => {
    const result = runLiquidityDepthCheck({ ...base, liquidityUsd: 50_000 });
    expect(result.passed).toBe(false);
    expect(result.score).toBe(6);
    expect(result.severity).toBe("MEDIUM");
  });

  it("applies full penalty (10) for liquidity below $20K", () => {
    const result = runLiquidityDepthCheck({ ...base, liquidityUsd: 5_000 });
    expect(result.passed).toBe(false);
    expect(result.score).toBe(10);
    expect(result.severity).toBe("HIGH");
  });

  it("applies full penalty at exactly $0 liquidity", () => {
    const result = runLiquidityDepthCheck({ ...base, liquidityUsd: 0 });
    expect(result.passed).toBe(false);
    expect(result.score).toBe(10);
  });

  it("applies partial penalty at exactly $100K boundary", () => {
    const result = runLiquidityDepthCheck({ ...base, liquidityUsd: 100_000 });
    expect(result.passed).toBe(false);
    expect(result.score).toBe(3);
  });
});
