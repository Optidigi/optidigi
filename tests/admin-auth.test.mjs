import assert from "node:assert/strict";
import test from "node:test";

process.env.ADMIN_USERNAME = "manager";
process.env.ADMIN_PASSWORD = "a-strong-test-password";
process.env.ADMIN_SESSION_SECRET = "a-separate-test-session-secret";
process.env.SITE_URL = "https://optidigi.nl";

const {
  ADMIN_SESSION_COOKIE,
  adminSessionCookie,
  createAdminSessionToken,
  hasValidAdminSession,
  verifyAdminCredentials,
} = await import("../src/lib/server/admin-auth.ts");

test("admin credentials and a signed session cookie authenticate", () => {
  assert.equal(verifyAdminCredentials("manager", "a-strong-test-password"), true);
  assert.equal(verifyAdminCredentials("manager", "wrong"), false);
  const token = createAdminSessionToken(1_000);
  const request = new Request("https://optidigi.nl/agenda", { headers: { cookie: `${ADMIN_SESSION_COOKIE}=${token}` } });
  assert.equal(hasValidAdminSession(request, 2_000), true);
  assert.match(adminSessionCookie(token), /HttpOnly/);
  assert.match(adminSessionCookie(token), /SameSite=Strict/);
  assert.match(adminSessionCookie(token), /Secure/);
});

test("tampered and expired admin sessions are rejected", () => {
  const token = createAdminSessionToken(1_000);
  const tampered = new Request("https://optidigi.nl/agenda", { headers: { cookie: `${ADMIN_SESSION_COOKIE}=${token}x` } });
  const expired = new Request("https://optidigi.nl/agenda", { headers: { cookie: `${ADMIN_SESSION_COOKIE}=${token}` } });
  assert.equal(hasValidAdminSession(tampered, 2_000), false);
  assert.equal(hasValidAdminSession(expired, 13 * 60 * 60 * 1_000), false);
});
