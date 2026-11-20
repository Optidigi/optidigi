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

export async function fetchHomepageContent(origin: string, previewGrant?: string, locale: "nl" | "en" = "nl"): Promise<HomepageContent | undefined> {
  const url = new URL("/api/site-content", origin);
  url.searchParams.set("tenant", "optidigi");
  url.searchParams.set("locale", locale);
  const headers = new Headers({ accept: "application/json" });
  if (previewGrant) {
    url.searchParams.set("draft", "true");
    headers.set("authorization", `Bearer ${previewGrant}`);
  }

  try {
    const response = await fetch(url, { headers, redirect: "error", signal: AbortSignal.timeout(2000) });
    if (!response.ok) return undefined;
    const data = object(await response.json());
    const settings = object(data.siteSettings);
    const homepage = object(data.homepage);
    return {
      siteSettings: {
        name: copy(settings.name, 150),
        title: copy(settings.title, 200),
        description: copy(settings.description, 500),
      },
      homepage: {
        heading: copy(homepage.heading, 200),
        description: copy(homepage.description, 1000),
      },
    };
  } catch {
    return undefined;
  }
}
