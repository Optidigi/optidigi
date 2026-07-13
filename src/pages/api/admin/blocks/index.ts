import type { APIRoute } from "astro";
import { createBlock, listBlocks, requireAdmin } from "../../../../lib/server/admin";
import { apiError, json, readJson, requireSameOrigin } from "../../../../lib/server/http";

export const prerender = false;
export const GET: APIRoute = async ({ request }) => {
  try {
    requireAdmin(request);
    return json({ blocks: listBlocks() });
  } catch (error) {
    return apiError(error);
  }
};
export const POST: APIRoute = async ({ request }) => {
  try {
    requireAdmin(request);
    requireSameOrigin(request);
    return json({ block: createBlock(await readJson(request)) }, 201);
  } catch (error) {
    return apiError(error);
  }
};

