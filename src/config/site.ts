import type { LucideIcon } from "lucide-react";
import {
  Bot,
  CircleHelp,
  Cpu,
  Globe,
  LayoutTemplate,
  Mail,
  ScanSearch,
  Sparkles,
  Workflow,
  Wrench,
} from "lucide-react";
import { localePath, sharedCopy, type Locale } from "@/i18n";

const baseSiteConfig = {
  name: "Optidigi",
  url: "https://optidigi.nl",
  email: "hey@optidigi.nl",
  phone: "+31 6 25052591",
  phoneHref: "+31625052591",
  kvk: "99460165",
  btw: "NL869001073B01",
} as const;

export function getSiteConfig(locale: Locale = "nl") {
  return {
    ...baseSiteConfig,
    locale: locale === "nl" ? "nl_NL" : "en_GB",
    defaultTitle: sharedCopy[locale].defaultTitle,
    ctaHref: localePath(locale, locale === "en" ? "/contact#appointment" : "/contact#afspraak"),
    ctaLabel: sharedCopy[locale].cta,
    description: sharedCopy[locale].description,
  } as const;
}

export const siteConfig = getSiteConfig("nl");

export type NavMegaItem = {
  title: string;
  href: string;
  description: string;
  icon: LucideIcon;
  iconFill: string;
};

const navByLocale: Record<Locale, {
  dienstenPrimary: NavMegaItem[];
  dienstenSecondary: NavMegaItem[];
  dienstenFeatured: { title: string; description: string; href: string };
  aanpakItems: NavMegaItem[];
  aanpakFeatured: { title: string; description: string; href: string };
  plainLinks: { title: string; href: string }[];
}> = {
nl: {
  dienstenPrimary: [
  {
    title: "AI-toepassingen",
    href: "/#diensten",
    description: "AI die meedenkt in je processen",
    icon: Sparkles,
    iconFill: "fill-green-500/15",
  },
  {
    title: "Automatisering",
    href: "/#diensten",
    description: "Terugkerend werk automatisch afhandelen",
    icon: Bot,
    iconFill: "fill-yellow-500/15",
  },
  {
    title: "Integraties",
    href: "/#diensten",
    description: "Koppelingen met bestaande tools",
    icon: Workflow,
    iconFill: "fill-indigo-500/15",
  },
],

dienstenSecondary: [
  {
    title: "Websites",
    href: "/#diensten",
    description: "Snelle, conversiegerichte websites",
    icon: Globe,
    iconFill: "fill-sky-500/15",
  },
  {
    title: "Software op maat",
    href: "/#diensten",
    description: "Oplossingen die passen bij je team",
    icon: Cpu,
    iconFill: "fill-orange-500/15",
  },
  {
    title: "Klantportalen",
    href: "/#diensten",
    description: "Selfservice voor je klanten",
    icon: LayoutTemplate,
    iconFill: "fill-teal-500/15",
  },
  {
    title: "Procesoptimalisatie",
    href: "/#diensten",
    description: "Minder handwerk, meer overzicht",
    icon: Wrench,
    iconFill: "fill-blue-500/15",
  },
],

dienstenFeatured: {
  title: "Digitale kansenscan",
  description:
    "Ontdek in 15 minuten waar software, AI of automatisering het meeste oplevert.",
  href: siteConfig.ctaHref,
},

aanpakItems: [
  {
    title: "Bedrijfsscan",
    href: "/#aanpak",
    description: "Processen en knelpunten in kaart",
    icon: ScanSearch,
    iconFill: "fill-emerald-500/25",
  },
  {
    title: "Implementatie",
    href: "/#aanpak",
    description: "Bouwen en koppelen wat werkt",
    icon: Wrench,
    iconFill: "fill-blue-500/15",
  },
  {
    title: "Veelgestelde vragen",
    href: "/#faq",
    description: "Antwoorden op praktische vragen",
    icon: CircleHelp,
    iconFill: "fill-violet-500/15",
  },
  {
    title: "Contact",
    href: "/contact",
    description: "Stuur ons een bericht",
    icon: Mail,
    iconFill: "fill-pink-500/15",
  },
],

aanpakFeatured: {
  title: "Plan een gesprek",
  description: "Vrijblijvend. We denken mee over je volgende stap.",
  href: siteConfig.ctaHref,
},

plainLinks: [
  { title: "FAQ", href: "/#faq" },
  { title: "Contact", href: "/contact" },
],
},
en: {
  dienstenPrimary: [
    { title: "AI applications", href: "/en/#services", description: "AI that supports your processes", icon: Sparkles, iconFill: "fill-green-500/15" },
    { title: "Automation", href: "/en/#services", description: "Handle recurring work automatically", icon: Bot, iconFill: "fill-yellow-500/15" },
    { title: "Integrations", href: "/en/#services", description: "Connect the tools you already use", icon: Workflow, iconFill: "fill-indigo-500/15" },
  ],
  dienstenSecondary: [
    { title: "Websites", href: "/en/#services", description: "Fast websites built to convert", icon: Globe, iconFill: "fill-sky-500/15" },
    { title: "Custom software", href: "/en/#services", description: "Solutions shaped around your team", icon: Cpu, iconFill: "fill-orange-500/15" },
    { title: "Customer portals", href: "/en/#services", description: "Self-service for your customers", icon: LayoutTemplate, iconFill: "fill-teal-500/15" },
    { title: "Process improvement", href: "/en/#services", description: "Less manual work, more visibility", icon: Wrench, iconFill: "fill-blue-500/15" },
  ],
  dienstenFeatured: { title: "Digital opportunity review", description: "Discover in 15 minutes where software, AI or automation can make the biggest difference.", href: "/en/contact#appointment" },
  aanpakItems: [
    { title: "Process review", href: "/en/#approach", description: "Map processes and bottlenecks", icon: ScanSearch, iconFill: "fill-emerald-500/25" },
    { title: "Implementation", href: "/en/#approach", description: "Build and connect what works", icon: Wrench, iconFill: "fill-blue-500/15" },
    { title: "Frequently asked questions", href: "/en/#faq", description: "Answers to practical questions", icon: CircleHelp, iconFill: "fill-violet-500/15" },
    { title: "Contact", href: "/en/contact", description: "Send us a message", icon: Mail, iconFill: "fill-pink-500/15" },
  ],
  aanpakFeatured: { title: "Book a call", description: "No obligation. We’ll help you identify the next step.", href: "/en/contact#appointment" },
  plainLinks: [{ title: "FAQ", href: "/en/#faq" }, { title: "Contact", href: "/en/contact" }],
},
};

export function getNavigation(locale: Locale = "nl") {
  return navByLocale[locale];
}
