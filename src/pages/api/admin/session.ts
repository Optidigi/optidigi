import type { APIRoute } from "astro";
import {
  adminConfigured,
  adminSessionCookie,
  clearAdminSessionCookie,
  createAdminSessionToken,
  verifyAdminCredentials,
} from "../../../lib/server/admin-auth";
import { apiError, json, rateLimit, readJson, requireSameOrigin } from "../../../lib/server/http";
import { InputError } from "../../../lib/server/validation";

export const prerender = false;

export const POST: APIRoute = async (context) => {
  try {
    requireSameOrigin(context.request);
    rateLimit(context, 10);
    if (!adminConfigured()) throw new InputError("Beheer is nog niet geconfigureerd.", 503, "service_unavailable");
    const input = await readJson(context.request);
    const values = input && typeof input === "object" && !Array.isArray(input) ? input as Record<string, unknown> : {};
    if (!verifyAdminCredentials(values.username, values.password)) {
      throw new InputError("De gebruikersnaam of het wachtwoord klopt niet.", 401, "invalid_credentials");
    }
    return json({ authenticated: true }, 200, { "Set-Cookie": adminSessionCookie(createAdminSessionToken()) });
  } catch (error) {
    return apiError(error);
  }
};

export const DELETE: APIRoute = async ({ request }) => {
  try {
    requireSameOrigin(request);
    return json({ authenticated: false }, 200, { "Set-Cookie": clearAdminSessionCookie() });
  } catch (error) {
    return apiError(error);
  }
};
