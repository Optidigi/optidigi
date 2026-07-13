import type { APIRoute } from "astro";
import { requireAdmin, setAppointmentStatus } from "../../../../lib/server/admin";
import { apiError, json, readJson, requireSameOrigin } from "../../../../lib/server/http";

export const prerender = false;
export const PATCH: APIRoute = async ({ request, params }) => {
  try {
    requireAdmin(request);
    requireSameOrigin(request);
    const input = await readJson(request);
    const status = input && typeof input === "object" && !Array.isArray(input) ? (input as Record<string, unknown>).status : undefined;
    return json({ appointment: setAppointmentStatus(params.id || "", status) });
  } catch (error) {
    return apiError(error);
  }
};

