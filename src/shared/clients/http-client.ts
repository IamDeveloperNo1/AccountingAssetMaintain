import { AppError } from "@/shared/errors/app-error";
import { logger } from "@/infrastructure/logger/logger";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type HttpClientOptions = {
  baseUrl: string;
  timeoutMs: number;
  maxRetries: number;
  defaultHeaders?: Record<string, string>;
};

export type HttpRequestOptions = {
  method?: HttpMethod;
  path: string;
  body?: unknown;
  headers?: Record<string, string>;
  traceId?: string;
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class HttpClient {
  private readonly baseUrl: string;
  private readonly timeoutMs: number;
  private readonly maxRetries: number;
  private readonly defaultHeaders: Record<string, string>;

  constructor(options: HttpClientOptions) {
    this.baseUrl = options.baseUrl.replace(/\/$/, "");
    this.timeoutMs = options.timeoutMs;
    this.maxRetries = options.maxRetries;
    this.defaultHeaders = options.defaultHeaders ?? {};
  }

  async request<T>(options: HttpRequestOptions): Promise<T> {
    const method = options.method ?? "GET";
    const url = `${this.baseUrl}${options.path}`;
    let lastError: Error | undefined;

    for (let attempt = 0; attempt <= this.maxRetries; attempt += 1) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

      try {
        const response = await fetch(url, {
          method,
          headers: {
            "Content-Type": "application/json",
            ...this.defaultHeaders,
            ...options.headers,
            ...(options.traceId
              ? { "X-Request-Id": options.traceId }
              : {}),
          },
          body: options.body ? JSON.stringify(options.body) : undefined,
          signal: controller.signal,
        });

        if (!response.ok) {
          const body = await response.text();
          throw new AppError(
            "EXTERNAL_API_ERROR",
            `External API responded with ${response.status}`,
            response.status,
            { url, body, attempt },
          );
        }

        if (response.status === 204) {
          return undefined as T;
        }

        return (await response.json()) as T;
      } catch (error) {
        lastError =
          error instanceof Error ? error : new Error("Unknown HTTP error");

        logger.warn("HTTP request failed", {
          url,
          method,
          attempt,
          traceId: options.traceId,
          message: lastError.message,
        });

        if (attempt >= this.maxRetries) {
          break;
        }

        const backoffMs = Math.min(1000 * 2 ** attempt, 10_000);
        await sleep(backoffMs);
      } finally {
        clearTimeout(timeout);
      }
    }

    throw normalizeHttpError(lastError);
  }
}

function normalizeHttpError(error: Error | undefined): AppError {
  if (error instanceof AppError) {
    return error;
  }

  if (error?.name === "AbortError") {
    return new AppError("EXTERNAL_API_TIMEOUT", "External API request timed out");
  }

  return new AppError(
    "EXTERNAL_API_UNAVAILABLE",
    error?.message ?? "External API request failed",
  );
}
