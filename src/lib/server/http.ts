import type { APIContext } from "astro";
import { siteOrigin } from "./config";
import { InputError } from "./validation";

const buckets = new Map<string, number[]>();

export const json = (body: unknown, status = 200, headers?: HeadersInit) =>
  Response.json(body, { status, headers: { "Cache-Control": "no-store", ...headers } });

export function apiError(error: unknown) {
  if (error instanceof InputError) return json({ error: error.code, message: error.message }, error.status);
  console.error("API request failed", error instanceof Error ? error.message : "Unknown error");
  return json({ error: "server_error", message: "Er ging iets mis. Probeer het later opnieuw." }, 500);
}

export function requireSameOrigin(request: Request) {
  const origin = request.headers.get("Origin");
  if (!origin) return;
  const allowed = siteOrigin();
  const isDevelopment = import.meta.env.DEV && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
  if (origin !== allowed && !isDevelopment) throw new InputError("Ongeldige herkomst.", 403, "forbidden");
}

export async function readJson(request: Request, maximumBytes = 16_384) {
  const declared = Number(request.headers.get("content-length") || 0);
  if (declared > maximumBytes) throw new InputError("Aanvraag is te groot.", 413, "payload_too_large");
  const raw = await request.text();
  if (new TextEncoder().encode(raw).byteLength > maximumBytes) throw new InputError("Aanvraag is te groot.", 413, "payload_too_large");
  try {
    return JSON.parse(raw);
  } catch {
    throw new InputError("Ongeldige JSON.");
  }
}

export function rateLimit(context: Pick<APIContext, "request" | "clientAddress">, limit: number, windowMs = 15 * 60_000) {
  const headers = context.request.headers;
  const key = headers.get("cf-connecting-ip") || headers.get("x-forwarded-for")?.split(",")[0]?.trim() || context.clientAddress || "unknown";
  const now = Date.now();
  const fresh = (buckets.get(key) || []).filter((timestamp) => now - timestamp < windowMs);
  if (fresh.length >= limit) throw new InputError("Te veel aanvragen. Probeer het later opnieuw.", 429, "rate_limited");
  fresh.push(now);
  buckets.set(key, fresh);
  if (buckets.size > 5_000) {
    for (const [bucketKey, entries] of buckets) if (!entries.some((timestamp) => now - timestamp < windowMs)) buckets.delete(bucketKey);
  }
}

