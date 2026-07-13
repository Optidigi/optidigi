import type { APIRoute } from "astro";
import { availableSlots } from "../../../lib/server/booking";
import { apiError, json, rateLimit } from "../../../lib/server/http";

export const prerender = false;

export const GET: APIRoute = async (context) => {
  try {
    rateLimit(context, 120);
    const url = new URL(context.request.url);
    return json(availableSlots(url.searchParams.get("from"), url.searchParams.get("to")));
  } catch (error) {
    return apiError(error);
  }
};

