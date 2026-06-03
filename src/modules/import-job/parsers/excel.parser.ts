import ExcelJS from "exceljs";

import { validateImportHeaders } from "@/modules/import-job/validators/import-job.validator";
import type { ParsedImportRow } from "@/modules/import-job/types/import-job.types";
import { AppError } from "@/shared/errors/app-error";

function cellToString(value: ExcelJS.CellValue): string {
  if (value === null || value === undefined) {
    return "";
  }

  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }

  if (typeof value === "object" && "text" in value) {
    return String(value.text ?? "");
  }

  return String(value);
}

export async function parseExcelBuffer(
  buffer: Buffer,
): Promise<ParsedImportRow[]> {
  const workbook = new ExcelJS.Workbook();
  // ExcelJS types expect legacy Node Buffer; Node 22+ Buffer generics differ.
  await workbook.xlsx.load(buffer as unknown as ExcelJS.Buffer);

  const worksheet = workbook.worksheets[0];

  if (!worksheet) {
    throw new AppError("PARSE_ERROR", "Excel file has no worksheets", 400);
  }

  const headerRow = worksheet.getRow(1);
  const headerCells = Array.isArray(headerRow.values)
    ? headerRow.values.slice(1)
    : [];
  const headers = headerCells.map((value) =>
    cellToString(value as ExcelJS.CellValue),
  );

  validateImportHeaders(headers);

  const rows: ParsedImportRow[] = [];

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) {
      return;
    }

    const data: Record<string, string> = {};

    headers.forEach((header, index) => {
      data[header] = cellToString(row.getCell(index + 1).value);
    });

    const hasData = Object.values(data).some((value) => value.length > 0);

    if (hasData) {
      rows.push({ rowNumber, data });
    }
  });

  if (rows.length === 0) {
    throw new AppError(
      "PARSE_ERROR",
      "Excel file must include at least one data row",
      400,
    );
  }

  return rows;
}
