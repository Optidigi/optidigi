import type { APIRoute } from "astro";
import { createAppointment } from "../../../lib/server/booking";
import { flushEmailOutbox } from "../../../lib/server/email";
import { apiError, json, rateLimit, readJson, requireSameOrigin } from "../../../lib/server/http";
import { appointmentInput } from "../../../lib/server/validation";

export const prerender = false;

export const POST: APIRoute = async (context) => {
  try {
    requireSameOrigin(context.request);
    rateLimit(context, 8);
    const result = createAppointment(appointmentInput(await readJson(context.request)));
    // The database commit is the confirmation boundary; email is durable in the outbox and may retry later.
    await flushEmailOutbox(4);
    return json({ appointment: result }, result.created ? 201 : 200);
  } catch (error) {
    return apiError(error);
  }
};

