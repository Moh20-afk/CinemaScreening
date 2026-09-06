export function vercelPublicOrigin(): string | null {
  const host = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
  if (!host) return null;
  return host.startsWith("http") ? host : `https://${host}`;
}

export async function fetchVercelInternalJson<T>(path: string): Promise<T> {
  const origin = vercelPublicOrigin();
  if (!origin) {
    throw new Error("No Vercel host for internal listings fetch");
  }
  const headers: Record<string, string> = { Accept: "application/json" };
  const bypass = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;
  if (bypass) {
    headers["x-vercel-protection-bypass"] = bypass;
    headers["x-vercel-set-bypass-cookie"] = "true";
  }
  const response = await fetch(`${origin}${path}`, {
    cache: "no-store",
    headers,
  });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} for ${path}`);
  }
  return (await response.json()) as T;
}
