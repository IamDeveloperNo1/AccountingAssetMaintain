import { NextResponse } from "next/server";

import { importJobService } from "@/modules/import-job/services/import-job.service";
import { importJobRepository } from "@/modules/import-job/repositories/import-job.repository";
import { AppError, normalizeError } from "@/shared/errors/app-error";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const resetCount = await importJobRepository.resetFailedRows(id);

    if (resetCount === 0) {
      throw new AppError("VALIDATION_ERROR", "No failed rows to retry", 400);
    }

    const job = await importJobService.retryFailedRows(id);
    return NextResponse.json({ job });
  } catch (error) {
    const appError = normalizeError(error);
    return NextResponse.json(
      { error: { code: appError.code, message: appError.message } },
      { status: appError.statusCode },
    );
  }
}
