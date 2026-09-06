export const JSON_REVALIDATE_SECONDS = 600;
export const SCRAPE_REVALIDATE_SECONDS = 86_400;

const DEFAULT_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
  Accept: "application/json,text/plain,*/*",
  "Accept-Language": "en-GB,en;q=0.9",
};

async function fetchResponse(
  url: string,
  options?: {
    revalidate?: number;
    timeoutMs?: number;
    accept?: string;
    tags?: string[];
    headers?: Record<string, string>;
  },
): Promise<Response> {
  const timeoutMs = options?.timeoutMs ?? 20_000;
  const revalidate = options?.revalidate ?? JSON_REVALIDATE_SECONDS;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      headers: {
        ...DEFAULT_HEADERS,
        ...(options?.accept ? { Accept: options.accept } : {}),
        ...options?.headers,
      },
      signal: controller.signal,
      cache: revalidate === 0 ? "no-store" : "force-cache",
      next: {
        revalidate,
        ...(options?.tags?.length ? { tags: options.tags } : {}),
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} for ${url}`);
    }
    return response;
  } finally {
    clearTimeout(timer);
  }
}

export async function fetchJson<T>(
  url: string,
  options?: {
    revalidate?: number;
    timeoutMs?: number;
    tags?: string[];
    headers?: Record<string, string>;
  },
): Promise<T> {
  const response = await fetchResponse(url, {
    ...options,
    tags: options?.tags ?? ["listings-json"],
  });
  return (await response.json()) as T;
}

export async function fetchText(
  url: string,
  options?: {
    revalidate?: number;
    timeoutMs?: number;
    accept?: string;
    tags?: string[];
    headers?: Record<string, string>;
  },
): Promise<string> {
  const response = await fetchResponse(url, {
    revalidate: options?.revalidate ?? SCRAPE_REVALIDATE_SECONDS,
    timeoutMs: options?.timeoutMs,
    accept: options?.accept ?? "text/html,application/javascript,text/plain,*/*",
    tags: options?.tags ?? ["listings-scrape"],
    headers: options?.headers,
  });
  return response.text();
}

export async function fetchRaw(
  url: string,
  options?: {
    revalidate?: number;
    timeoutMs?: number;
    accept?: string;
    tags?: string[];
    headers?: Record<string, string>;
  },
): Promise<Response> {
  return fetchResponse(url, options);
}

export async function mapPool<T, R>(
  items: T[],
  limit: number,
  mapper: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let next = 0;
  async function worker() {
    while (next < items.length) {
      const index = next;
      next += 1;
      results[index] = await mapper(items[index], index);
    }
  }
  const workers = Array.from({ length: Math.min(limit, items.length) }, () => worker());
  await Promise.all(workers);
  return results;
}
