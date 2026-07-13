import { defineMiddleware } from "astro:middleware";
import { adminConfigured, hasAdminAccess } from "./lib/server/admin-auth";

function protectedHeaders(response: Response) {
  response.headers.set("cache-control", "no-store");
  response.headers.set("x-robots-tag", "noindex, nofollow");
  return response;
}

export const onRequest = defineMiddleware(async ({ request, url, redirect }, next) => {
  const isAgenda = url.pathname === "/agenda" || url.pathname.startsWith("/agenda/");
  const isLogin = url.pathname === "/agenda/login";
  const isAdminApi = url.pathname === "/api/admin" || url.pathname.startsWith("/api/admin/");
  const isSessionApi = url.pathname === "/api/admin/session";
  const authenticated = (isAgenda || isAdminApi) && hasAdminAccess(request);

  if (isAgenda && !isLogin && !authenticated) return protectedHeaders(redirect("/agenda/login", 303));
  if (isLogin && authenticated) return protectedHeaders(redirect("/agenda", 303));
  if (isAdminApi && !isSessionApi && !authenticated) {
    const status = adminConfigured() ? 401 : 503;
    const message = status === 401 ? "Log opnieuw in om verder te gaan." : "Beheer is nog niet geconfigureerd.";
    return protectedHeaders(Response.json({ error: status === 401 ? "unauthorized" : "service_unavailable", message }, { status }));
  }

  const response = await next();
  const headers = response.headers;
  headers.set("content-security-policy", "default-src 'self'; base-uri 'self'; connect-src 'self' https://cloudflareinsights.com; font-src 'self' data:; form-action 'self'; frame-ancestors 'none'; img-src 'self' data:; object-src 'none'; script-src 'self' 'unsafe-inline' https://static.cloudflareinsights.com; style-src 'self' 'unsafe-inline'; upgrade-insecure-requests");
  headers.set("permissions-policy", "camera=(), geolocation=(), microphone=(), payment=(), usb=()");
  headers.set("referrer-policy", "strict-origin-when-cross-origin");
  headers.set("strict-transport-security", "max-age=31536000; includeSubDomains; preload");
  headers.set("x-content-type-options", "nosniff");
  headers.set("x-frame-options", "DENY");

  if (isAgenda || isAdminApi || url.pathname.startsWith("/api/")) protectedHeaders(response);
  return response;
});
