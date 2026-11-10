import type { APIRoute } from "astro";

export const prerender = false;

// Keep existing links, including #verwijdering, working after retiring the notice.
export const GET: APIRoute = () => new Response(null, {
  status: 301,
  headers: { location: "https://optidigi.nl/privacy" },
});

export const HEAD = GET;
