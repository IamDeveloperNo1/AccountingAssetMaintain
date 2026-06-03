import type { ImportJobStatus, ImportRowStatus } from "@prisma/client";

export type ParsedImportRow = {
  rowNumber: number;
  data: Record<string, string>;
};

export type ImportJobSummary = {
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
};

export type ImportRowRecord = {
  id: string;
  jobId: string;
  rowNumber: number;
  status: ImportRowStatus;
  failureReason: string | null;
  retryCount: number;
  durationMs: number | null;
};

export type AssetApiPayload = {
  assetCode: string;
  assetName: string;
  category: string;
  acquisitionDate: string;
  cost: number;
  location: string;
  department: string;
};

export type StartImportInput = {
  fileName: string;
  fileType: "csv" | "xlsx";
  buffer: Buffer;
};

export const IMPORT_JOB_QUEUE_NAME = "import-job-processing";
