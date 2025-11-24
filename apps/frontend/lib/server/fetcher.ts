type FetchRetryOptions = {
  timeoutMs?: number;
  retries?: number;
  retryDelayMs?: number;
  retryOnStatuses?: number[];
};

const DEFAULT_RETRY_STATUSES = [502, 503, 504];

function sanitizeHeaders(headers?: HeadersInit): Headers {
  const clean = new Headers(headers);
  clean.delete("cookie");
  clean.delete("Cookie");
  return clean;
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchWithRetry(
  input: RequestInfo | URL,
  init: RequestInit = {},
  {
    timeoutMs = 2000,
    retries = 1,
    retryDelayMs = 250,
    retryOnStatuses = DEFAULT_RETRY_STATUSES,
  }: FetchRetryOptions = {},
): Promise<Response> {
  let attempt = 0;
  let lastError: unknown;

  while (attempt <= retries) {
    const controller = new AbortController();
    const timer: ReturnType<typeof setTimeout> = setTimeout(() => {
      controller.abort();
    }, timeoutMs);

    try {
      const response = await fetch(input, {
        ...init,
        headers: sanitizeHeaders(init.headers),
        signal: controller.signal,
      });

      const shouldRetry =
        attempt < retries && retryOnStatuses.includes(response.status);

      if (shouldRetry) {
        attempt++;
        lastError = new Error(`HTTP ${response.status}`);
        await delay(retryDelayMs);
        continue;
      }

      return response;
    } catch (error) {
      lastError = error;
      const isAbortError =
        error instanceof DOMException && error.name === "AbortError";

      if (attempt >= retries || !isAbortError) {
        throw error;
      }

      attempt++;
      await delay(retryDelayMs);
    } finally {
      clearTimeout(timer);
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("fetchWithRetry failed");
}
