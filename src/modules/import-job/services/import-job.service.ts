import { logger } from "@/infrastructure/logger/logger";
import { enqueueImportJob } from "@/modules/import-job/queue/import-job.queue";
import { parseImportFile } from "@/modules/import-job/parsers/import-file.parser";
import { importJobRepository } from "@/modules/import-job/repositories/import-job.repository";
import type {
  ImportJobSummary,
  StartImportInput,
} from "@/modules/import-job/types/import-job.types";
import { validateStartImportInput } from "@/modules/import-job/validators/import-job.validator";
import { AppError, normalizeError } from "@/shared/errors/app-error";

export const importJobService = {
  async startImport(input: StartImportInput): Promise<ImportJobSummary> {
    const metadata = validateStartImportInput({
      fileName: input.fileName,
      fileType: input.fileType,
    });

    logger.info("Import job requested", {
      fileName: metadata.fileName,
      fileType: metadata.fileType,
    });

    try {
      const parsedRows = await parseImportFile({
        ...input,
        ...metadata,
      });

      const job = await importJobRepository.createJob({
        fileName: metadata.fileName,
        fileType: metadata.fileType,
        totalRows: parsedRows.length,
      });

      await importJobRepository.createRows(
        job.id,
        parsedRows.map((row) => ({
          rowNumber: row.rowNumber,
          rawData: JSON.stringify(row.data),
        })),
      );

      await importJobRepository.updateJob(job.id, {
        status: "QUEUED",
      });

      await enqueueImportJob(job.id);

      logger.info("Import job queued", { jobId: job.id, totalRows: parsedRows.length });

      return (await importJobRepository.getJobById(job.id)) as ImportJobSummary;
    } catch (error) {
      const appError = normalizeError(error);
      logger.error("Import job failed to start", {
        fileName: metadata.fileName,
        code: appError.code,
        message: appError.message,
      });
      throw appError;
    }
  },

  async listJobs(): Promise<ImportJobSummary[]> {
    return importJobRepository.listJobs();
  },

  async getJob(jobId: string): Promise<ImportJobSummary> {
    const job = await importJobRepository.getJobById(jobId);

    if (!job) {
      throw new AppError("NOT_FOUND", "Import job not found", 404);
    }

    return job;
  },

  async retryFailedRows(jobId: string): Promise<ImportJobSummary> {
    await this.getJob(jobId);

    await importJobRepository.updateJob(jobId, {
      status: "QUEUED",
      errorMessage: null,
      completedAt: null,
    });

    await enqueueImportJob(jobId);

    logger.info("Import job retry queued", { jobId });

    return (await importJobRepository.getJobById(jobId)) as ImportJobSummary;
  },
};
