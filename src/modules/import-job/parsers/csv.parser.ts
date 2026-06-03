import { validateImportHeaders } from "@/modules/import-job/validators/import-job.validator";
import type { ParsedImportRow } from "@/modules/import-job/types/import-job.types";
import { AppError } from "@/shared/errors/app-error";

function parseCsvLine(line: string): string[] {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === "," && !inQuotes) {
      values.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  values.push(current.trim());
  return values;
}

export function parseCsvBuffer(buffer: Buffer): ParsedImportRow[] {
  const content = buffer.toString("utf-8").replace(/^\uFEFF/, "");
  const lines = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    throw new AppError(
      "PARSE_ERROR",
      "CSV file must include a header row and at least one data row",
      400,
    );
  }

  const headers = parseCsvLine(lines[0]);
  validateImportHeaders(headers);

  return lines.slice(1).map((line, index) => {
    const cells = parseCsvLine(line);
    const data: Record<string, string> = {};

    headers.forEach((header, headerIndex) => {
      data[header] = cells[headerIndex] ?? "";
    });

    return {
      rowNumber: index + 2,
      data,
    };
  });
}
