import type { APIRoute } from "astro";
import { deleteBlock, requireAdmin } from "../../../../lib/server/admin";
import { apiError, json, requireSameOrigin } from "../../../../lib/server/http";

export const prerender = false;
export const DELETE: APIRoute = async ({ request, params }) => {
  try {
    requireAdmin(request);
    requireSameOrigin(request);
    deleteBlock(params.id || "");
    return json({ deleted: true });
  } catch (error) {
    return apiError(error);
  }
};

