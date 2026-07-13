import type { APIRoute } from "astro";
import { timingSafeEqual } from "node:crypto";
import { flushEmailOutbox } from "../../../lib/server/email";
import { apiError, json } from "../../../lib/server/http";
import { InputError } from "../../../lib/server/validation";

export const prerender = false;
export const POST: APIRoute = async ({ request }) => {
  try {
    const configured = process.env.OUTBOX_CRON_SECRET || "";
    const supplied = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") || "";
    const a = Buffer.from(configured);
    const b = Buffer.from(supplied);
    if (!configured || a.length !== b.length || !timingSafeEqual(a, b)) throw new InputError("Niet geautoriseerd.", 401, "unauthorized");
    return json(await flushEmailOutbox(25));
  } catch (error) {
    return apiError(error);
  }
};

