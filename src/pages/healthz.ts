import type { APIRoute } from "astro";

export const prerender = false;

export const GET: APIRoute = () =>
  new Response("ok\n", {
    headers: {
      "cache-control": "no-store",
      "content-type": "text/plain; charset=utf-8",
    },
  });
