import { Redis } from "@upstash/redis";

import { getServerEnv } from "@/lib/config";

let redis: Redis | null = null;

/**
 * Returns a singleton Upstash Redis client.
 *
 * @returns The Redis client.
 */
export function getRedis(): Redis {
  if (!redis) {
    const env = getServerEnv();
    redis = new Redis({
      url: env.UPSTASH_REDIS_REST_URL,
      token: env.UPSTASH_REDIS_REST_TOKEN,
    });
  }

  return redis;
}

/**
 * Reads a cached JSON payload.
 *
 * @param key - Cache key.
 * @returns The cached value, if any.
 */
export async function readCache<T>(key: string): Promise<T | null> {
  return getRedis().get<T>(key);
}

/**
 * Writes a JSON payload with TTL.
 *
 * @param key - Cache key.
 * @param value - Serializable value.
 * @param ttlSeconds - Time to live in seconds.
 */
export async function writeCache<T>(
  key: string,
  value: T,
  ttlSeconds: number,
): Promise<void> {
  await getRedis().set(key, value, { ex: ttlSeconds });
}
