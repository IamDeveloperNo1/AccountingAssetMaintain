import type { ImportJobStatus, ImportRowStatus, Prisma } from "@prisma/client";

import { prisma } from "@/infrastructure/database/prisma-client";
import type {
  ImportJobSummary,
  ImportRowRecord,
} from "@/modules/import-job/types/import-job.types";

function toJobSummary(job: {
  id: string;
  fileName: string;
  fileType: string;
  status: ImportJobStatus;
  totalRows: number;
  processedRows: number;
  successRows: number;
  failedRows: number;
  progressPercent: number;
  errorMessage: string | null;
  startedAt: Date | null;
  completedAt: Date | null;
  createdAt: Date;
}): ImportJobSummary {
  return { ...job };
}

export const importJobRepository = {
  async createJob(input: {
    fileName: string;
    fileType: string;
    totalRows: number;
  }): Promise<ImportJobSummary> {
    const job = await prisma.importJob.create({
      data: {
        fileName: input.fileName,
        fileType: input.fileType,
        totalRows: input.totalRows,
        status: "PENDING",
      },
    });

    return toJobSummary(job);
  },

  async createRows(
    jobId: string,
    rows: { rowNumber: number; rawData: string }[],
  ): Promise<void> {
    const batchSize = 500;

    for (let offset = 0; offset < rows.length; offset += batchSize) {
      const chunk = rows.slice(offset, offset + batchSize);

      await prisma.importRow.createMany({
        data: chunk.map((row) => ({
          jobId,
          rowNumber: row.rowNumber,
          rawData: row.rawData,
          status: "PENDING",
        })),
      });
    }
  },

  async listJobs(limit = 20): Promise<ImportJobSummary[]> {
    const jobs = await prisma.importJob.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return jobs.map(toJobSummary);
  },

  async getJobById(jobId: string): Promise<ImportJobSummary | null> {
    const job = await prisma.importJob.findUnique({ where: { id: jobId } });
    return job ? toJobSummary(job) : null;
  },

  async getPendingRows(
    jobId: string,
    batchSize: number,
  ): Promise<ImportRowRecord[]> {
    const rows = await prisma.importRow.findMany({
      where: {
        jobId,
        status: { in: ["PENDING", "RETRYING"] },
      },
      orderBy: { rowNumber: "asc" },
      take: batchSize,
      select: {
        id: true,
        jobId: true,
        rowNumber: true,
        status: true,
        failureReason: true,
        retryCount: true,
        durationMs: true,
        rawData: true,
      },
    });

    return rows.map(({ rawData: _raw, ...row }) => row);
  },

  async getRowWithRawData(rowId: string) {
    return prisma.importRow.findUnique({ where: { id: rowId } });
  },

  async updateJob(
    jobId: string,
    data: Prisma.ImportJobUpdateInput,
  ): Promise<ImportJobSummary> {
    const job = await prisma.importJob.update({
      where: { id: jobId },
      data,
    });

    return toJobSummary(job);
  },

  async updateRow(
    rowId: string,
    data: {
      status: ImportRowStatus;
      failureReason?: string | null;
      retryCount?: number;
      durationMs?: number | null;
      processedAt?: Date | null;
    },
  ): Promise<void> {
    await prisma.importRow.update({
      where: { id: rowId },
      data,
    });
  },

  async resetFailedRows(jobId: string): Promise<number> {
    const result = await prisma.importRow.updateMany({
      where: { jobId, status: "FAILED" },
      data: {
        status: "RETRYING",
        failureReason: null,
        processedAt: null,
      },
    });

    return result.count;
  },

  async refreshJobProgress(jobId: string): Promise<ImportJobSummary> {
    const [totalRows, processedRows, successRows, failedRows] =
      await Promise.all([
        prisma.importRow.count({ where: { jobId } }),
        prisma.importRow.count({
          where: {
            jobId,
            status: { in: ["SUCCESS", "FAILED"] },
          },
        }),
        prisma.importRow.count({ where: { jobId, status: "SUCCESS" } }),
        prisma.importRow.count({ where: { jobId, status: "FAILED" } }),
      ]);

    const progressPercent =
      totalRows === 0 ? 0 : Math.round((processedRows / totalRows) * 100);

    let status: ImportJobStatus = "PROCESSING";

    if (processedRows >= totalRows && totalRows > 0) {
      if (failedRows === 0) {
        status = "COMPLETED";
      } else if (successRows === 0) {
        status = "FAILED";
      } else {
        status = "PARTIAL";
      }
    }

    const job = await prisma.importJob.update({
      where: { id: jobId },
      data: {
        totalRows,
        processedRows,
        successRows,
        failedRows,
        progressPercent,
        status,
        completedAt:
          processedRows >= totalRows && totalRows > 0 ? new Date() : null,
      },
    });

    return toJobSummary(job);
  },
};
