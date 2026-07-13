import { timingSafeEqual } from "node:crypto";
import { defineMiddleware } from "astro:middleware";

const ADMIN_PATHS = ["/beheer", "/api/admin"];

function secureEqual(left: string, right: string) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}

function unauthorized() {
  return new Response("Authenticatie vereist", {
    status: 401,
    headers: {
      "cache-control": "no-store",
      "content-type": "text/plain; charset=utf-8",
      "www-authenticate": 'Basic realm="Optidigi beheer", charset="UTF-8"',
    },
  });
}

export const onRequest = defineMiddleware(async ({ request, url }, next) => {
  const isAdmin = ADMIN_PATHS.some((path) => url.pathname === path || url.pathname.startsWith(`${path}/`));

  if (isAdmin) {
    const expectedUser = process.env.ADMIN_USERNAME;
    const expectedPassword = process.env.ADMIN_PASSWORD;
    if (!expectedUser || !expectedPassword) {
      return new Response("Beheer is nog niet geconfigureerd", { status: 503, headers: { "cache-control": "no-store" } });
    }

    const encoded = request.headers.get("authorization")?.match(/^Basic\s+(.+)$/i)?.[1];
    if (!encoded) return unauthorized();
    let credentials = "";
    try {
      credentials = Buffer.from(encoded, "base64").toString("utf8");
    } catch {
      return unauthorized();
    }
    const separator = credentials.indexOf(":");
    const username = separator >= 0 ? credentials.slice(0, separator) : "";
    const password = separator >= 0 ? credentials.slice(separator + 1) : "";
    if (!secureEqual(username, expectedUser) || !secureEqual(password, expectedPassword)) return unauthorized();
  }

  const response = await next();
  const headers = response.headers;
  headers.set("content-security-policy", "default-src 'self'; base-uri 'self'; connect-src 'self' https://cloudflareinsights.com; font-src 'self' data:; form-action 'self'; frame-ancestors 'none'; img-src 'self' data:; object-src 'none'; script-src 'self' 'unsafe-inline' https://static.cloudflareinsights.com; style-src 'self' 'unsafe-inline'; upgrade-insecure-requests");
  headers.set("permissions-policy", "camera=(), geolocation=(), microphone=(), payment=(), usb=()");
  headers.set("referrer-policy", "strict-origin-when-cross-origin");
  headers.set("strict-transport-security", "max-age=31536000; includeSubDomains; preload");
  headers.set("x-content-type-options", "nosniff");
  headers.set("x-frame-options", "DENY");

  if (isAdmin || url.pathname.startsWith("/api/")) {
    headers.set("cache-control", "no-store");
    headers.set("x-robots-tag", "noindex, nofollow");
  }

  return response;
});
