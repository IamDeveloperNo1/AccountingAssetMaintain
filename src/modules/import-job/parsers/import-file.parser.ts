import { parseCsvBuffer } from "@/modules/import-job/parsers/csv.parser";
import { parseExcelBuffer } from "@/modules/import-job/parsers/excel.parser";
import type {
  ParsedImportRow,
  StartImportInput,
} from "@/modules/import-job/types/import-job.types";

export async function parseImportFile(
  input: StartImportInput,
): Promise<ParsedImportRow[]> {
  if (input.fileType === "csv") {
    return parseCsvBuffer(input.buffer);
  }

  return parseExcelBuffer(input.buffer);
}
