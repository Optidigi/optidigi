export const locales = ["nl", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "nl";

export function isLocale(value: unknown): value is Locale {
  return locales.includes(value as Locale);
}

export function localePath(locale: Locale, path = "/") {
  const [pathname, hash] = path.split("#");
  const normalized = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const localized = locale === defaultLocale
    ? normalized
    : normalized === "/" ? `/${locale}/` : `/${locale}${normalized}`;
  return hash ? `${localized}#${hash}` : localized;
}

export function alternatePath(pathname: string, locale: Locale) {
  const withoutLocale = pathname.replace(/^\/en(?=\/|$)/, "") || "/";
  const legalRoutes: Record<string, string> = {
    "/juridisch": "/legal",
    "/legal": "/juridisch",
    "/juridisch/algemene-voorwaarden": "/legal/general-terms",
    "/legal/general-terms": "/juridisch/algemene-voorwaarden",
  };
  const mapped = legalRoutes[withoutLocale] ?? withoutLocale;
  if (locale === "nl" && mapped.startsWith("/juridisch")) return mapped;
  if (locale === "en" && mapped.startsWith("/legal")) return localePath(locale, mapped);
  return localePath(locale, withoutLocale);
}

export const localeMeta = {
  nl: { htmlLang: "nl", ogLocale: "nl_NL", dateLocale: "nl-NL", label: "Nederlands", shortLabel: "NL" },
  en: { htmlLang: "en", ogLocale: "en_GB", dateLocale: "en-GB", label: "English", shortLabel: "EN" },
} as const;

export const sharedCopy = {
  nl: {
    defaultTitle: "Optidigi | Software, AI en automatisering",
    description: "Optidigi ontwikkelt en integreert software, AI en automatisering die aansluiten op hoe je bedrijf werkt.",
    imageAlt: "Optidigi — software, AI en automatisering voor bedrijven",
    cta: "Plan een gesprek",
    scanCta: "Plan je digitale kansenscan",
    noObligation: "Vrijblijvend",
    duration: "Ongeveer 15 minuten",
    home: "Home",
    openMenu: "Menu openen",
    closeMenu: "Menu sluiten",
    closeDialog: "Venster sluiten",
  },
  en: {
    defaultTitle: "Optidigi | Software, AI and automation",
    description: "Optidigi builds and integrates software, AI and automation around the way your business works.",
    imageAlt: "Optidigi — software, AI and automation for businesses",
    cta: "Book a call",
    scanCta: "Book a discovery call",
    noObligation: "No obligation",
    duration: "Around 15 minutes",
    home: "Home",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    closeDialog: "Close dialog",
  },
} as const;
