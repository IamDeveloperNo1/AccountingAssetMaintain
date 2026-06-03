import { Queue } from "bullmq";

import { getRedisConnectionOptions } from "@/infrastructure/redis/redis-connection";
import {
  IMPORT_JOB_QUEUE_NAME,
  type ImportJobSummary,
} from "@/modules/import-job/types/import-job.types";

export type ImportJobQueuePayload = {
  jobId: string;
};

let importJobQueue: Queue | null = null;

export function getImportJobQueue(): Queue {
  if (!importJobQueue) {
    importJobQueue = new Queue(IMPORT_JOB_QUEUE_NAME, {
      connection: getRedisConnectionOptions(),
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 2000,
        },
        removeOnComplete: 100,
        removeOnFail: 500,
      },
    });
  }

  return importJobQueue;
}

export async function enqueueImportJob(
  jobId: string,
): Promise<ImportJobSummary | void> {
  const queue = getImportJobQueue();

  await queue.add(
    "process-import-job",
    { jobId },
    {
      jobId,
    },
  );
}
