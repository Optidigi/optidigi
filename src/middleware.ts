import { defineMiddleware } from "astro:middleware";

const ADMIN_PATHS = ["/beheer", "/api/admin"];

export const onRequest = defineMiddleware(async ({ url }, next) => {
  const isAdmin = ADMIN_PATHS.some((path) => url.pathname === path || url.pathname.startsWith(`${path}/`));

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
