import { NextResponse } from "next/server";

import { importJobService } from "@/modules/import-job/services/import-job.service";
import { AppError, normalizeError } from "@/shared/errors/app-error";

export const runtime = "nodejs";

function errorResponse(error: unknown) {
  const appError = normalizeError(error);

  return NextResponse.json(
    {
      error: {
        code: appError.code,
        message: appError.message,
      },
    },
    { status: appError.statusCode },
  );
}

export async function GET() {
  try {
    const jobs = await importJobService.listJobs();
    return NextResponse.json({ jobs });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      throw new AppError("VALIDATION_ERROR", "File is required", 400);
    }

    const extension = file.name.split(".").pop()?.toLowerCase();

    if (extension !== "csv" && extension !== "xlsx") {
      throw new AppError(
        "VALIDATION_ERROR",
        "Only .csv and .xlsx files are supported",
        400,
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const job = await importJobService.startImport({
      fileName: file.name,
      fileType: extension,
      buffer,
    });

    return NextResponse.json({ job }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
