import { logger } from "@/infrastructure/logger/logger";
import { assetApiClient } from "@/modules/import-job/clients/asset-api.client";
import { importJobRepository } from "@/modules/import-job/repositories/import-job.repository";
import { toAssetApiPayload } from "@/modules/import-job/transformers/import-row.transformer";
import { validateAssetRow } from "@/modules/import-job/validators/import-job.validator";
import { AppError, normalizeError } from "@/shared/errors/app-error";

const BATCH_SIZE = 50;
const MAX_ROW_RETRIES = 3;

export async function processImportJob(jobId: string): Promise<void> {
  logger.info("Import job processing started", { jobId });

  await importJobRepository.updateJob(jobId, {
    status: "PROCESSING",
    startedAt: new Date(),
    errorMessage: null,
  });

  let hasMore = true;

  while (hasMore) {
    const rows = await importJobRepository.getPendingRows(jobId, BATCH_SIZE);
    hasMore = rows.length === BATCH_SIZE;

    for (const row of rows) {
      await processImportRow(jobId, row.id);
    }

    await importJobRepository.refreshJobProgress(jobId);
  }

  const summary = await importJobRepository.refreshJobProgress(jobId);

  logger.info("Import job processing completed", {
    jobId,
    status: summary.status,
    processedRows: summary.processedRows,
    failedRows: summary.failedRows,
  });
}

async function processImportRow(jobId: string, rowId: string): Promise<void> {
  const row = await importJobRepository.getRowWithRawData(rowId);

  if (!row) {
    return;
  }

  const startedAt = Date.now();

  await importJobRepository.updateRow(rowId, {
    status: "PROCESSING",
    failureReason: null,
  });

  try {
    const raw = JSON.parse(row.rawData) as Record<string, string>;
    const validated = validateAssetRow({
      rowNumber: row.rowNumber,
      data: raw,
    });
    const payload = toAssetApiPayload(validated);

    await assetApiClient.upsertAsset(payload, `${jobId}:${rowId}`);

    await importJobRepository.updateRow(rowId, {
      status: "SUCCESS",
      failureReason: null,
      durationMs: Date.now() - startedAt,
      processedAt: new Date(),
    });
  } catch (error) {
    const appError = normalizeError(error);
    const nextRetryCount = row.retryCount + 1;
    const shouldRetry =
      nextRetryCount < MAX_ROW_RETRIES &&
      appError.code !== "VALIDATION_ERROR";

    await importJobRepository.updateRow(rowId, {
      status: shouldRetry ? "RETRYING" : "FAILED",
      failureReason: appError.message,
      retryCount: nextRetryCount,
      durationMs: Date.now() - startedAt,
      processedAt: shouldRetry ? null : new Date(),
    });

    logger.warn("Import row processing failed", {
      jobId,
      rowId,
      rowNumber: row.rowNumber,
      retryCount: nextRetryCount,
      code: appError.code,
      message: appError.message,
    });

    if (error instanceof AppError && error.code === "VALIDATION_ERROR") {
      return;
    }
  }
}
