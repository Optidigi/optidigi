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

export const siteConfig = {
  name: "Optidigi",
  url: "https://optidigi.nl",
  locale: "nl_NL",
  defaultTitle: "Software, AI en automatisering voor bedrijven | Optidigi",
  email: "hey@optidigi.nl",
  phone: "+31 6 25052591",
  phoneHref: "+31625052591",
  kvk: "99460165",
  btw: "NL869001073B01",
  ctaHref: "/contact#afspraak",
  ctaLabel: "Plan een gesprek",
  description:
    "Optidigi ontwikkelt en integreert software, AI en automatisering die aansluiten op hoe je bedrijf werkt.",
} as const;

export type NavMegaItem = {
  title: string;
  href: string;
  description: string;
  icon: LucideIcon;
  iconFill: string;
};

export const navDienstenPrimary: NavMegaItem[] = [
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
];

export const navDienstenSecondary: NavMegaItem[] = [
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
];

export const navDienstenFeatured = {
  title: "Digitale kansenscan",
  description:
    "Ontdek in 15 minuten waar software, AI of automatisering het meeste oplevert.",
  href: siteConfig.ctaHref,
} as const;

export const navAanpakItems: NavMegaItem[] = [
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
];

export const navAanpakFeatured = {
  title: "Plan een gesprek",
  description: "Vrijblijvend. We denken mee over je volgende stap.",
  href: siteConfig.ctaHref,
} as const;

export const navPlainLinks = [
  { title: "FAQ", href: "/#faq" },
  { title: "Contact", href: "/contact" },
] as const;
