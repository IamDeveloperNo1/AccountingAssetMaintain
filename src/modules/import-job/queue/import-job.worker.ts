import "dotenv/config";

import { Worker } from "bullmq";

import { env } from "@/configs/env";
import { logger } from "@/infrastructure/logger/logger";
import { getRedisConnectionOptions } from "@/infrastructure/redis/redis-connection";
import type { ImportJobQueuePayload } from "@/modules/import-job/queue/import-job.queue";
import { processImportJob } from "@/modules/import-job/services/import-job.processor";
import { IMPORT_JOB_QUEUE_NAME } from "@/modules/import-job/types/import-job.types";
import { normalizeError } from "@/shared/errors/app-error";

const concurrency = 2;

const worker = new Worker<ImportJobQueuePayload>(
  IMPORT_JOB_QUEUE_NAME,
  async (job) => {
    await processImportJob(job.data.jobId);
  },
  {
    connection: getRedisConnectionOptions(),
    concurrency,
  },
);

worker.on("completed", (job) => {
  logger.info("Queue job completed", {
    queueJobId: job.id,
    importJobId: job.data.jobId,
  });
});

worker.on("failed", (job, error) => {
  const normalized = normalizeError(error);

  logger.error("Queue job failed", {
    queueJobId: job?.id,
    importJobId: job?.data.jobId,
    code: normalized.code,
    message: normalized.message,
  });
});

logger.info("Import job worker started", {
  queue: IMPORT_JOB_QUEUE_NAME,
  redisUrl: env.REDIS_URL,
  concurrency,
});
