// Max raw penalty = 120. Engine divides by NORMALIZATION_DENOMINATOR (1.2) to
// normalize output back to 0–100. When adding new checks, update NORMALIZATION_BASE
// and NORMALIZATION_DENOMINATOR to keep the invariant: BASE / DENOMINATOR = 100.
export const WEIGHTS = {
  mintAuthority: 25,
  freezeAuthority: 20,
  holderConcentration: 20,
  honeypotSimulation: 20,
  liquidityLock: 10,
  bundleDetection: 5,
  tokenAge: 10,
  liquidityDepth: 10,
} as const;

export const NORMALIZATION_BASE = 120;
export const NORMALIZATION_DENOMINATOR = 1.2;
export const AUTHORITY_CAP_RAW = 54; // 54 / 1.2 = 45 output cap
