import { NextResponse } from "next/server";

import { importJobService } from "@/modules/import-job/services/import-job.service";
import { normalizeError } from "@/shared/errors/app-error";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const job = await importJobService.getJob(id);
    return NextResponse.json({ job });
  } catch (error) {
    const appError = normalizeError(error);
    return NextResponse.json(
      { error: { code: appError.code, message: appError.message } },
      { status: appError.statusCode },
    );
  }
}
