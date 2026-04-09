import { z } from "zod";

const serverEnvSchema = z.object({
  HELIUS_API_KEY: z.string().min(1),
  JUPITER_API_KEY: z.string().min(1),
  NEON_DATABASE_URL: z.string().min(1),
  UPSTASH_REDIS_REST_URL: z.string().url(),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

let cachedEnv: ServerEnv | null = null;

/**
 * Validates the server environment before networked features are used.
 *
 * @returns The validated server environment.
 * @throws When one or more required variables are missing or malformed.
 */
export function getServerEnv(): ServerEnv {
  if (cachedEnv) {
    return cachedEnv;
  }

  const result = serverEnvSchema.safeParse(process.env);

  if (!result.success) {
    const formatted = result.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("; ");

    throw new Error(`Missing or invalid Scout server environment: ${formatted}`);
  }

  cachedEnv = result.data;
  return cachedEnv;
}
