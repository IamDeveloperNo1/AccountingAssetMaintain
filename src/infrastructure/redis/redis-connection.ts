import type { ConnectionOptions } from "bullmq";

import { env } from "@/configs/env";

export function getRedisConnectionOptions(): ConnectionOptions {
  return {
    url: env.REDIS_URL,
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  };
}
