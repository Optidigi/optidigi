import { isLocale, type Locale } from "@/i18n";

const localeCookieName = "optidigi-locale";

export function getLocaleCookieName() {
  return localeCookieName;
}

export function localeFromCookie(cookieHeader: string | null): Locale | undefined {
  if (!cookieHeader) return undefined;

  for (const entry of cookieHeader.split(";")) {
    const [name, value] = entry.trim().split("=", 2);
    if (name === localeCookieName && isLocale(value)) return value;
  }

  return undefined;
}

export function localeFromAcceptLanguage(header: string | null): Locale | undefined {
  if (!header) return undefined;

  return header
    .split(",")
    .map((entry, index) => {
      const [tag, ...parameters] = entry.trim().toLowerCase().split(";");
      const qualityParameter = parameters.find((parameter) => parameter.trim().startsWith("q="));
      const parsedQuality = qualityParameter ? Number.parseFloat(qualityParameter.split("=", 2)[1] ?? "") : 1;
      return {
        locale: tag.split("-", 1)[0],
        quality: Number.isFinite(parsedQuality) ? parsedQuality : 0,
        index,
      };
    })
    .filter(({ locale, quality }) => isLocale(locale) && quality > 0)
    .sort((a, b) => b.quality - a.quality || a.index - b.index)[0]?.locale as Locale | undefined;
}

export function preferredLocale(request: Request): Locale | undefined {
  return localeFromCookie(request.headers.get("cookie"))
    ?? localeFromAcceptLanguage(request.headers.get("accept-language"));
}
