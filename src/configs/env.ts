import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1).default("file:./dev.db"),
  REDIS_URL: z.string().default("redis://127.0.0.1:6379"),
  EXTERNAL_API_BASE_URL: z.string().url().optional(),
  EXTERNAL_API_TIMEOUT_MS: z.coerce.number().positive().default(30_000),
  EXTERNAL_API_MAX_RETRIES: z.coerce.number().int().min(0).max(10).default(3),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
});

export type AppEnv = z.infer<typeof envSchema>;

function loadEnv(): AppEnv {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    throw new Error(
      `Invalid environment configuration: ${parsed.error.flatten().fieldErrors}`,
    );
  }

  return parsed.data;
}

export const env = loadEnv();
