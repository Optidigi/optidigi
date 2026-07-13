const integer = (name: string, fallback: number, minimum = 0) => {
  const raw = process.env[name];
  if (!raw) return fallback;
  const value = Number.parseInt(raw, 10);
  if (!Number.isFinite(value) || value < minimum) throw new Error(`${name} must be an integer >= ${minimum}`);
  return value;
};

const clock = (name: string, fallback: string) => {
  const value = process.env[name] || fallback;
  if (!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value)) throw new Error(`${name} must use HH:mm`);
  return value;
};

const workdays = () => {
  const values = (process.env.BOOKING_WORKDAYS || "1,2,3,4,5")
    .split(",")
    .map((value) => Number.parseInt(value.trim(), 10));
  if (!values.length || values.some((value) => !Number.isInteger(value) || value < 0 || value > 6)) {
    throw new Error("BOOKING_WORKDAYS must contain comma-separated weekday numbers (0-6)");
  }
  return new Set(values);
};

export const bookingConfig = () => ({
  timezone: process.env.BOOKING_TIMEZONE || "Europe/Amsterdam",
  durationMinutes: integer("BOOKING_DURATION_MINUTES", 30, 5),
  intervalMinutes: integer("BOOKING_INTERVAL_MINUTES", 30, 5),
  minimumNoticeHours: integer("BOOKING_MIN_NOTICE_HOURS", 24),
  horizonDays: integer("BOOKING_HORIZON_DAYS", 30, 1),
  startTime: clock("BOOKING_START_TIME", "09:00"),
  endTime: clock("BOOKING_END_TIME", "17:00"),
  workdays: workdays(),
  databasePath: process.env.BOOKING_DATABASE_PATH || "/data/optidigi.sqlite",
});

export const mailConfig = () => ({
  accountId: process.env.CLOUDFLARE_ACCOUNT_ID || "",
  apiToken: process.env.CLOUDFLARE_EMAIL_API_TOKEN || "",
  fromAddress: process.env.MAIL_FROM_ADDRESS || "website@optidigi.nl",
  fromName: process.env.MAIL_FROM_NAME || "Optidigi",
  contactTo: process.env.MAIL_CONTACT_TO || "hey@optidigi.nl",
});

export const siteOrigin = () => new URL(process.env.SITE_URL || "https://optidigi.nl").origin;

