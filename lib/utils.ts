import { clsx } from "clsx";

/**
 * Joins conditional class names into a single string.
 *
 * @param inputs - CSS class values that may be truthy or falsy.
 * @returns A space-separated class string.
 */
export function cn(...inputs: Array<string | false | null | undefined>): string {
  return clsx(inputs);
}

/**
 * Truncates a Solana address for compact UI presentation.
 *
 * @param value - A wallet or token address.
 * @param size - Visible prefix/suffix length.
 * @returns A shortened address.
 */
export function truncateAddress(value: string, size = 4): string {
  if (value.length <= size * 2) {
    return value;
  }

  return `${value.slice(0, size)}...${value.slice(-size)}`;
}

/**
 * Clamps a number between a minimum and maximum value.
 *
 * @param value - The number to clamp.
 * @param min - Minimum allowed value.
 * @param max - Maximum allowed value.
 * @returns The clamped number.
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Maps a score to a coarse risk label.
 *
 * @param score - Numeric score from 0 to 100.
 * @returns A risk level label.
 */
export function riskFromScore(score: number): "SAFE" | "WARNING" | "DANGER" {
  if (score >= 75) {
    return "SAFE";
  }

  if (score >= 45) {
    return "WARNING";
  }

  return "DANGER";
}

/**
 * Creates a deterministic cache bucket timestamp.
 *
 * @param ttlSeconds - Desired bucket size in seconds.
 * @returns A coarse current timestamp bucket.
 */
export function timestampBucket(ttlSeconds: number): number {
  return Math.floor(Date.now() / (ttlSeconds * 1000));
}
