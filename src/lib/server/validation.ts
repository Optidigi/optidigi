export class InputError extends Error {
  constructor(message: string, public status = 400, public code = "invalid_input") {
    super(message);
  }
}

const text = (value: unknown, name: string, minimum: number, maximum: number) => {
  if (typeof value !== "string") throw new InputError(`${name} ontbreekt.`);
  const normalized = value.trim().replace(/\r\n?/g, "\n");
  if (normalized.length < minimum || normalized.length > maximum) throw new InputError(`${name} heeft een ongeldige lengte.`);
  return normalized;
};

const optional = (value: unknown, name: string, maximum: number) => {
  if (value === undefined || value === null || value === "") return "";
  return text(value, name, 1, maximum);
};

const email = (value: unknown) => {
  const normalized = text(value, "E-mailadres", 3, 254).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) throw new InputError("Vul een geldig e-mailadres in.");
  return normalized;
};

const antiSpam = (input: Record<string, unknown>) => {
  if (input.website) throw new InputError("Ongeldige aanvraag.");
  if (input.formStartedAt !== undefined) {
    const startedAt = Number(input.formStartedAt);
    const age = Date.now() - startedAt;
    if (!Number.isFinite(startedAt) || age < 1_500 || age > 24 * 60 * 60 * 1_000) throw new InputError("Ongeldige aanvraag.");
  }
};

const locale = (value: unknown) => value === "en" ? "en" as const : "nl" as const;

export function contactInput(input: unknown) {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new InputError("Ongeldige aanvraag.");
  const value = input as Record<string, unknown>;
  antiSpam(value);
  const allowed = new Set(["AI & automatisering", "Maatwerk software", "Cloud & software", "Overig", "AI & automation", "Custom software", "Other"]);
  const subject = text(value.subject, "Onderwerp", 1, 80);
  if (!allowed.has(subject)) throw new InputError("Kies een geldig onderwerp.");
  return {
    name: text(value.name, "Naam", 2, 100),
    email: email(value.email),
    subject,
    message: text(value.message, "Bericht", 10, 5_000),
    locale: locale(value.locale),
  };
}

export function appointmentInput(input: unknown) {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new InputError("Ongeldige aanvraag.");
  const value = input as Record<string, unknown>;
  antiSpam(value);
  const type = value.type;
  if (type !== "video" && type !== "phone") throw new InputError("Kies een geldig gesprekstype.");
  const startAt = text(value.startAt, "Starttijd", 20, 30);
  const date = new Date(startAt);
  if (!Number.isFinite(date.getTime()) || date.toISOString() !== startAt) throw new InputError("Kies een geldig moment.");
  const phone = optional(value.phone, "Telefoonnummer", 40);
  if (type === "phone" && !phone) throw new InputError("Vul een telefoonnummer in.");
  return {
    startAt,
    type,
    name: text(value.name, "Naam", 2, 100),
    email: email(value.email),
    company: optional(value.company, "Bedrijf", 150),
    phone,
    subject: text(value.subject, "Onderwerp", 1, 100),
    note: optional(value.note, "Opmerking", 2_000),
    idempotencyKey: optional(value.idempotencyKey, "Idempotency key", 100),
    locale: locale(value.locale),
  };
}

export type ContactInput = ReturnType<typeof contactInput>;
export type AppointmentInput = ReturnType<typeof appointmentInput>;
