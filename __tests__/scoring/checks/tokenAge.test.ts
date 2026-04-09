import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { runTokenAgeCheck } from "@/lib/scoring/checks/tokenAge";

const DAY_MS = 24 * 60 * 60 * 1000;

const base = {
  address: "mint",
  symbol: "T",
  name: "Token",
  decimals: 6,
  supply: 1_000_000,
  mintAuthority: null,
  freezeAuthority: null,
};

describe("Token Age Check", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-06-01T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns UNKNOWN with score 2 when pairCreatedAt is null", () => {
    const result = runTokenAgeCheck({ ...base, pairCreatedAt: null });
    expect(result.score).toBe(2);
    expect(result.metadata?.state).toBe("UNKNOWN");
  });

  it("passes with score 0 for token older than 30 days with high liquidity", () => {
    const createdAt = Date.now() - 35 * DAY_MS;
    const result = runTokenAgeCheck({ ...base, pairCreatedAt: createdAt, liquidityUsd: 100_000 });
    expect(result.passed).toBe(true);
    expect(result.score).toBe(0);
    expect(result.severity).toBe("INFO");
  });

  it("applies partial penalty (4) for 7–30 day old token", () => {
    const createdAt = Date.now() - 15 * DAY_MS;
    const result = runTokenAgeCheck({ ...base, pairCreatedAt: createdAt, liquidityUsd: 200_000 });
    expect(result.passed).toBe(false);
    expect(result.score).toBe(4);
    expect(result.severity).toBe("MEDIUM");
  });

  it("applies warning penalty (7) for 1–7 day old token", () => {
    const createdAt = Date.now() - 3 * DAY_MS;
    const result = runTokenAgeCheck({ ...base, pairCreatedAt: createdAt });
    expect(result.passed).toBe(false);
    expect(result.score).toBe(7);
    expect(result.severity).toBe("MEDIUM");
  });

  it("applies full penalty (10) for token less than 24h old", () => {
    const createdAt = Date.now() - 2 * 60 * 60 * 1000;
    const result = runTokenAgeCheck({ ...base, pairCreatedAt: createdAt });
    expect(result.passed).toBe(false);
    expect(result.score).toBe(10);
    expect(result.severity).toBe("HIGH");
  });

  it("applies partial penalty (4) for token older than 30 days but below $50K liquidity", () => {
    const createdAt = Date.now() - 40 * DAY_MS;
    const result = runTokenAgeCheck({ ...base, pairCreatedAt: createdAt, liquidityUsd: 10_000 });
    expect(result.passed).toBe(false);
    expect(result.score).toBe(4);
  });

  it("normalizes a seconds-precision pairCreatedAt timestamp", () => {
    const nowSeconds = Math.floor(Date.now() / 1000);
    const createdAtSeconds = nowSeconds - 35 * 24 * 60 * 60;
    const result = runTokenAgeCheck({
      ...base,
      pairCreatedAt: createdAtSeconds,
      liquidityUsd: 100_000,
    });
    expect(result.passed).toBe(true);
    expect(result.score).toBe(0);
  });
});
