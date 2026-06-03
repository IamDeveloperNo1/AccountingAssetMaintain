import { env } from "@/configs/env";
import { HttpClient } from "@/shared/clients/http-client";
import type { AssetApiPayload } from "@/modules/import-job/types/import-job.types";
import { AppError } from "@/shared/errors/app-error";

export class AssetApiClient {
  private readonly http: HttpClient | null;

  constructor() {
    this.http = env.EXTERNAL_API_BASE_URL
      ? new HttpClient({
          baseUrl: env.EXTERNAL_API_BASE_URL,
          timeoutMs: env.EXTERNAL_API_TIMEOUT_MS,
          maxRetries: env.EXTERNAL_API_MAX_RETRIES,
        })
      : null;
  }

  async upsertAsset(payload: AssetApiPayload, traceId: string): Promise<void> {
    if (!this.http) {
      return;
    }

    await this.http.request({
      method: "POST",
      path: "/assets",
      body: payload,
      traceId,
    });
  }
}

export function assertExternalApiConfigured(): void {
  if (!env.EXTERNAL_API_BASE_URL) {
    throw new AppError(
      "CONFIG_ERROR",
      "EXTERNAL_API_BASE_URL is not configured",
      503,
    );
  }
}

export const assetApiClient = new AssetApiClient();
