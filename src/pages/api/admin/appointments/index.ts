import type { APIRoute } from "astro";
import { listAppointments, requireAdmin } from "../../../../lib/server/admin";
import { apiError, json } from "../../../../lib/server/http";

export const prerender = false;
export const GET: APIRoute = async ({ request }) => {
  try {
    requireAdmin(request);
    return json({ appointments: listAppointments() });
  } catch (error) {
    return apiError(error);
  }
};

