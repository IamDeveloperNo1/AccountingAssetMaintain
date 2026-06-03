import { z } from "zod";

import { assetRowSchema } from "@/modules/import-job/schemas/asset-row.schema";
import type { ParsedImportRow } from "@/modules/import-job/types/import-job.types";
import { ASSET_IMPORT_HEADERS } from "@/shared/constants/import-headers";
import { AppError } from "@/shared/errors/app-error";

const startImportSchema = z.object({
  fileName: z.string().min(1),
  fileType: z.enum(["csv", "xlsx"]),
});

export function validateStartImportInput(input: {
  fileName: string;
  fileType: string;
}): { fileName: string; fileType: "csv" | "xlsx" } {
  const parsed = startImportSchema.safeParse(input);

  if (!parsed.success) {
    throw new AppError(
      "VALIDATION_ERROR",
      "Invalid import file metadata",
      400,
      { issues: parsed.error.flatten() },
    );
  }

  return parsed.data;
}

export function validateImportHeaders(headers: string[]): void {
  const missing = ASSET_IMPORT_HEADERS.filter(
    (header) => !headers.includes(header),
  );

  if (missing.length > 0) {
    throw new AppError(
      "VALIDATION_ERROR",
      `Missing required headers: ${missing.join(", ")}`,
      400,
    );
  }
}

export function validateAssetRow(row: ParsedImportRow): ReturnType<
  typeof assetRowSchema.parse
> {
  const parsed = assetRowSchema.safeParse(row.data);

  if (!parsed.success) {
    throw new AppError(
      "VALIDATION_ERROR",
      `Row ${row.rowNumber}: ${parsed.error.issues.map((i) => i.message).join(", ")}`,
      400,
      { rowNumber: row.rowNumber },
    );
  }

  return parsed.data;
}
