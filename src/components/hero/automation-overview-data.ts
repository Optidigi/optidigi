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

export const automationOverviewPanelEn: AutomationOverviewData = {
  mobileTitle: "Automation", activeNav: "workflows",
  nav: [
    { id: "dashboard", label: "Dashboard", icon: "house" }, { id: "workflows", label: "Workflows", icon: "chart-pie" },
    { id: "ai", label: "AI insights", icon: "lightbulb" }, { id: "integrations", label: "Integrations", icon: "plug" }, { id: "customers", label: "Customers", icon: "users" },
  ],
  projects: [{ label: "quote-follow-up", active: true }, { label: "customer-email" }, { label: "crm-sync" }],
  filters: ["Workflows", "This week", "Daily"],
  overviewTitle: "This week", overviewDescription: "Quote follow-up, customer email and CRM synchronisation",
  kpis: [
    { type: "trend", label: "New enquiries", value: "18", trend: "+3" }, { type: "trend", label: "Processed automatically", value: "47", trend: "+12%" },
    { type: "plain", label: "Follow-ups scheduled", value: "9" }, { type: "plain", label: "Active integrations", value: "6" },
  ],
  activityTitle: "Completed this week", activityDescription: "Tasks completed automatically and manually",
  insightsTitle: "In your queue", insightsDescription: "Practical updates for today",
  insights: [
    { tone: "primary", label: "Processed automatically", text: "7 new enquiries were enriched with company data and added to the right workflow.", cta: "View enquiries" },
    { tone: "primary", label: "Ready to review", text: "3 draft follow-up emails are ready. You only need to review and send them.", cta: "Open drafts" },
  ],
};
