export type DashboardNavIconName =
  | "house"
  | "chart-pie"
  | "lightbulb"
  | "brain"
  | "globe"
  | "plug"
  | "users"
  | "book"
  | "layers";

export type DashboardKpi =
  | { type: "trend"; label: string; value: string; valueMuted?: string; trend: string; trendTone?: "emerald" | "rose" }
  | { type: "plain"; label: string; value: string };

export type DashboardInsight = {
  tone: "primary" | "warning";
  label: string;
  text: string;
  cta: string;
};

export type AutomationOverviewData = {
  mobileTitle: string;
  activeNav: string;
  nav: { id: string; label: string; icon: DashboardNavIconName }[];
  projects: { label: string; active?: boolean }[];
  filters: string[];
  overviewTitle: string;
  overviewDescription: string;
  kpis: DashboardKpi[];
  activityTitle: string;
  activityDescription: string;
  insightsTitle: string;
  insightsDescription: string;
  insights: DashboardInsight[];
};

export const automationOverviewPanel: AutomationOverviewData = {
  mobileTitle: "Automatisering",
  activeNav: "workflows",
  nav: [
    { id: "dashboard", label: "Dashboard", icon: "house" },
    { id: "workflows", label: "Workflows", icon: "chart-pie" },
    { id: "ai", label: "AI-inzichten", icon: "lightbulb" },
    { id: "integrations", label: "Integraties", icon: "plug" },
    { id: "customers", label: "Klanten", icon: "users" },
  ],
  projects: [
    { label: "offerte-opvolging", active: true },
    { label: "klantmail" },
    { label: "crm-sync" },
  ],
  filters: ["Workflows", "Deze week", "Dagelijks"],
  overviewTitle: "Deze week",
  overviewDescription: "Offerte-opvolging, klantmail en CRM-synchronisatie",
  kpis: [
    { type: "trend", label: "Nieuwe aanvragen", value: "18", trend: "+3" },
    { type: "trend", label: "Automatisch verwerkt", value: "47", trend: "+12%" },
    { type: "plain", label: "Opvolging gepland", value: "9" },
    { type: "plain", label: "Koppelingen actief", value: "6" },
  ],
  activityTitle: "Afhandeling deze week",
  activityDescription: "Taken die automatisch en handmatig zijn afgerond",
  insightsTitle: "In je werkvoorraad",
  insightsDescription: "Praktische updates voor vandaag",
  insights: [
    {
      tone: "primary",
      label: "Automatisch verwerkt",
      text: "7 nieuwe aanvragen zijn verrijkt met bedrijfsgegevens en aan de juiste workflow toegevoegd.",
      cta: "Bekijk aanvragen",
    },
    {
      tone: "primary",
      label: "Klaar voor controle",
      text: "3 conceptmails voor offerte-opvolging staan klaar. Je hoeft alleen nog te controleren en versturen.",
      cta: "Open concepten",
    },
  ],
};
