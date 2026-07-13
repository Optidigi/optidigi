import { createHmac, timingSafeEqual } from "node:crypto";

export const ADMIN_SESSION_COOKIE = "optidigi_admin_session";
const SESSION_SECONDS = 12 * 60 * 60;

function equalSecret(left: string, right: string) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}

function sessionSecret() {
  return process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD || "";
}

function signature(payload: string) {
  return createHmac("sha256", sessionSecret()).update(payload).digest("base64url");
}

function cookieValue(request: Request, name: string) {
  const cookies = request.headers.get("cookie") || "";
  for (const part of cookies.split(";")) {
    const separator = part.indexOf("=");
    if (separator < 0) continue;
    if (part.slice(0, separator).trim() === name) return part.slice(separator + 1).trim();
  }
  return "";
}

export function adminConfigured() {
  return Boolean(process.env.ADMIN_USERNAME && process.env.ADMIN_PASSWORD);
}

export function verifyAdminCredentials(username: unknown, password: unknown) {
  if (typeof username !== "string" || typeof password !== "string" || !adminConfigured()) return false;
  return equalSecret(username, process.env.ADMIN_USERNAME || "") && equalSecret(password, process.env.ADMIN_PASSWORD || "");
}

export function createAdminSessionToken(now = Date.now()) {
  if (!adminConfigured()) throw new Error("Admin authentication is not configured");
  const payload = Buffer.from(JSON.stringify({ username: process.env.ADMIN_USERNAME, expiresAt: now + SESSION_SECONDS * 1000 })).toString("base64url");
  return `${payload}.${signature(payload)}`;
}

export function hasValidAdminSession(request: Request, now = Date.now()) {
  const token = cookieValue(request, ADMIN_SESSION_COOKIE);
  const separator = token.lastIndexOf(".");
  if (!token || separator < 1 || !sessionSecret()) return false;
  const payload = token.slice(0, separator);
  const suppliedSignature = token.slice(separator + 1);
  if (!equalSecret(suppliedSignature, signature(payload))) return false;
  try {
    const session = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { username?: unknown; expiresAt?: unknown };
    return session.username === process.env.ADMIN_USERNAME && typeof session.expiresAt === "number" && session.expiresAt > now;
  } catch {
    return false;
  }
}

export function hasAdminAccess(request: Request) {
  if (hasValidAdminSession(request)) return true;

  const configuredToken = process.env.ADMIN_API_TOKEN;
  const bearer = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") || "";
  if (configuredToken && bearer && equalSecret(bearer, configuredToken)) return true;

  const email = request.headers.get("cf-access-authenticated-user-email")?.toLowerCase();
  const assertion = request.headers.get("cf-access-jwt-assertion");
  const allowed = (process.env.ADMIN_EMAILS || process.env.MAIL_CONTACT_TO || "hey@optidigi.nl")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
  return Boolean(email && assertion && allowed.includes(email));
}

function secureAttribute() {
  return (process.env.SITE_URL || "https://optidigi.nl").startsWith("https://") ? "; Secure" : "";
}

export function adminSessionCookie(token: string) {
  return `${ADMIN_SESSION_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${SESSION_SECONDS}${secureAttribute()}`;
}

export function clearAdminSessionCookie() {
  return `${ADMIN_SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0${secureAttribute()}`;
}
