import type { APIRoute } from "astro";
import { createContact } from "../../lib/server/booking";
import { flushEmailOutbox, requireMailConfiguration } from "../../lib/server/email";
import { apiError, json, rateLimit, readJson, requireSameOrigin } from "../../lib/server/http";
import { contactInput } from "../../lib/server/validation";

export const prerender = false;

export const POST: APIRoute = async (context) => {
  try {
    requireSameOrigin(context.request);
    rateLimit(context, 6);
    requireMailConfiguration();
    const result = createContact(contactInput(await readJson(context.request)));
    await flushEmailOutbox(4);
    return json({ contact: result }, 201);
  } catch (error) {
    return apiError(error);
  }
};
