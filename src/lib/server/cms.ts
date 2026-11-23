export interface HomepageContent {
  siteSettings?: { name?: string; title?: string; description?: string };
  homepage?: { heading?: string; description?: string };
}

function object(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? value as Record<string, unknown> : {};
}

function copy(value: unknown, max: number): string | undefined {
  if (typeof value !== "string") return undefined;
  const text = value.trim();
  return text && text.length <= max ? text : undefined;
}

export function cmsOrigin() {
  try {
    const url = new URL(process.env.OPTIDIGI_CMS_ORIGIN || "");
    const local = process.env.NODE_ENV !== "production" &&
      url.protocol === "http:" && ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
    if ((url.protocol !== "https:" && !local) || url.username || url.password ||
        url.pathname !== "/" || url.search || url.hash) return undefined;
    return url.origin;
  } catch {
    return undefined;
  }
}

// Payload's preview grant is `<base64url JSON>.<signature>`. The CMS checks the signature; the site
// only reads the expiry, so an expired or malformed link says so instead of quietly showing the
// published text (Payload treats an invalid grant as a signed-out reader).
export function previewGrantUsable(grant: string, now = Date.now()): boolean {
  const [body, signature, extra] = grant.split(".");
  if (!body || !signature || extra !== undefined) return false;
  try {
    const { exp } = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as { exp?: unknown };
    return typeof exp === "number" && exp > now;
  } catch {
    return false;
  }
}

const tenant = "optidigi";

// Reads the homepage copy through Payload's standard REST API: the tenant's site settings and its
// `home` page, in one language without falling back to the other. With a preview grant the drafts
// are read (the CMS's preview-grant strategy allows read-only access to these collections).
export async function fetchHomepageContent(origin: string, previewGrant?: string, locale: "nl" | "en" = "nl", fetcher: typeof fetch = fetch): Promise<HomepageContent | undefined> {
  if (previewGrant && !previewGrantUsable(previewGrant)) return undefined;
  const headers = new Headers({ accept: "application/json" });
  if (previewGrant) headers.set("authorization", `Bearer ${previewGrant}`);

  const read = async (collection: "site-settings" | "pages", where: Record<string, string>, fields: string[]) => {
    const url = new URL(`/api/${collection}`, origin);
    for (const [field, value] of Object.entries(where)) url.searchParams.set(`where[${field}][equals]`, value);
    for (const field of fields) url.searchParams.set(`select[${field}]`, "true");
    url.searchParams.set("locale", locale);
    url.searchParams.set("fallback-locale", "none");
    url.searchParams.set("depth", "0");
    url.searchParams.set("limit", "1");
    if (previewGrant) url.searchParams.set("draft", "true");
    const response = await fetcher(url, { headers, redirect: "error", signal: AbortSignal.timeout(2000) });
    if (!response.ok) throw new Error(`CMS answered ${response.status}`);
    const docs = object(await response.json()).docs;
    return object(Array.isArray(docs) ? docs[0] : undefined);
  };

  try {
    const [settings, page] = await Promise.all([
      read("site-settings", { "tenant.slug": tenant }, ["name", "seo"]),
      read("pages", { "tenant.slug": tenant, slug: "home" }, ["heading", "description"]),
    ]);
    const seo = object(settings.seo);
    return {
      siteSettings: {
        name: copy(settings.name, 150),
        title: copy(seo.title, 200),
        description: copy(seo.description, 500),
      },
      homepage: {
        heading: copy(page.heading, 200),
        description: copy(page.description, 1000),
      },
    };
  } catch {
    return undefined;
  }
}
