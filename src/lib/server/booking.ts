import { randomUUID } from "node:crypto";
import { bookingConfig, mailConfig } from "./config";
import { database } from "./database";
import { enqueueEmail } from "./email";
import { appointmentEmails, contactEmails } from "./email-templates";
import { addUtcDays, dateKey, formatDutch, localParts, parseDateKey, zonedDate } from "./time";
import { InputError } from "./validation";
import type { AppointmentInput, ContactInput } from "./validation";

const minutes = (clock: string) => {
  const [hour, minute] = clock.split(":").map(Number);
  return hour * 60 + minute;
};

export function availableSlots(fromValue?: string | null, toValue?: string | null, now = new Date()) {
  const config = bookingConfig();
  const todayKey = dateKey(localParts(now, config.timezone));
  const today = parseDateKey(todayKey)!;
  const last = addUtcDays(today, config.horizonDays);
  const requestedFrom = fromValue ? parseDateKey(fromValue) : today;
  const requestedTo = toValue ? parseDateKey(toValue) : last;
  if (!requestedFrom || !requestedTo || requestedTo < requestedFrom) throw new InputError("Ongeldig datumbereik.");
  const from = requestedFrom < today ? today : requestedFrom;
  const to = requestedTo > last ? last : requestedTo;
  if ((to.getTime() - from.getTime()) / 86_400_000 > 62) throw new InputError("Datumbereik is te groot.");

  const rangeStart = zonedDate(dateKey({ year: from.getUTCFullYear(), month: from.getUTCMonth() + 1, day: from.getUTCDate() }), "00:00", config.timezone)!;
  const afterTo = addUtcDays(to, 1);
  const rangeEnd = zonedDate(dateKey({ year: afterTo.getUTCFullYear(), month: afterTo.getUTCMonth() + 1, day: afterTo.getUTCDate() }), "00:00", config.timezone)!;
  const unavailable = database().prepare(`
    SELECT start_at, end_at FROM appointments WHERE status = 'confirmed' AND start_at < ? AND end_at > ?
    UNION ALL
    SELECT start_at, end_at FROM blocked_periods WHERE start_at < ? AND end_at > ?
  `).all(rangeEnd.toISOString(), rangeStart.toISOString(), rangeEnd.toISOString(), rangeStart.toISOString()) as { start_at: string; end_at: string }[];

  const minimum = now.getTime() + config.minimumNoticeHours * 3_600_000;
  const slots: { startAt: string; endAt: string }[] = [];
  for (let day = from; day <= to; day = addUtcDays(day, 1)) {
    if (!config.workdays.has(day.getUTCDay())) continue;
    const key = dateKey({ year: day.getUTCFullYear(), month: day.getUTCMonth() + 1, day: day.getUTCDate() });
    const start = minutes(config.startTime);
    const end = minutes(config.endTime);
    for (let value = start; value + config.durationMinutes <= end; value += config.intervalMinutes) {
      const clock = `${String(Math.floor(value / 60)).padStart(2, "0")}:${String(value % 60).padStart(2, "0")}`;
      const slotStart = zonedDate(key, clock, config.timezone);
      if (!slotStart || slotStart.getTime() < minimum) continue;
      const slotEnd = new Date(slotStart.getTime() + config.durationMinutes * 60_000);
      const overlap = unavailable.some((period) => new Date(period.start_at) < slotEnd && new Date(period.end_at) > slotStart);
      if (!overlap) slots.push({ startAt: slotStart.toISOString(), endAt: slotEnd.toISOString() });
    }
  }
  return { timezone: config.timezone, durationMinutes: config.durationMinutes, slots };
}

export function createAppointment(input: AppointmentInput) {
  const config = bookingConfig();
  const requested = new Date(input.startAt);
  const localDate = dateKey(localParts(requested, config.timezone));
  const valid = availableSlots(localDate, localDate).slots.find((slot) => slot.startAt === input.startAt);
  if (!valid) throw new InputError("Dit moment is niet meer beschikbaar.", 409, "slot_unavailable");

  const db = database();
  if (input.idempotencyKey) {
    const existing = db.prepare(`SELECT id, start_at, end_at FROM appointments WHERE idempotency_key = ?`).get(input.idempotencyKey) as { id: string; start_at: string; end_at: string } | undefined;
    if (existing) return { id: existing.id, startAt: existing.start_at, endAt: existing.end_at, created: false };
  }
  const id = randomUUID();
  const now = new Date().toISOString();
  db.exec("BEGIN IMMEDIATE");
  try {
    const conflict = db.prepare(`
      SELECT 1 FROM appointments WHERE status = 'confirmed' AND start_at < ? AND end_at > ?
      UNION ALL SELECT 1 FROM blocked_periods WHERE start_at < ? AND end_at > ? LIMIT 1
    `).get(valid.endAt, valid.startAt, valid.endAt, valid.startAt);
    if (conflict) throw new InputError("Dit moment is zojuist geboekt.", 409, "slot_unavailable");
    db.prepare(`
      INSERT INTO appointments
        (id, start_at, end_at, timezone, type, name, company, email, phone, subject, note, idempotency_key, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, valid.startAt, valid.endAt, config.timezone, input.type, input.name, input.company || null, input.email, input.phone || null, input.subject, input.note || null, input.idempotencyKey || null, now, now);

    const label = formatDutch(requested, config.timezone);
    const type = input.type === "video" ? "Videogesprek" : "Telefoongesprek";
    const mail = mailConfig();
    const emails = appointmentEmails({ ...input, id, label, type, contactEmail: mail.contactTo });
    enqueueEmail({ relatedType: "appointment", relatedId: id, to: mail.contactTo, replyTo: input.email, ...emails.admin });
    enqueueEmail({ relatedType: "appointment", relatedId: id, to: input.email, replyTo: mail.contactTo, ...emails.customer });
    db.exec("COMMIT");
    return { id, startAt: valid.startAt, endAt: valid.endAt, created: true };
  } catch (error) {
    db.exec("ROLLBACK");
    if (error instanceof InputError) throw error;
    if (error instanceof Error && /UNIQUE constraint failed/.test(error.message)) throw new InputError("Dit moment is zojuist geboekt.", 409, "slot_unavailable");
    throw error;
  }
}

export function createContact(input: ContactInput) {
  const db = database();
  const id = randomUUID();
  const now = new Date().toISOString();
  db.exec("BEGIN IMMEDIATE");
  try {
    db.prepare(`INSERT INTO contacts (id, name, email, subject, message, created_at) VALUES (?, ?, ?, ?, ?, ?)`)
      .run(id, input.name, input.email, input.subject, input.message, now);
    const mail = mailConfig();
    const emails = contactEmails({ id, ...input, contactEmail: mail.contactTo });
    enqueueEmail({ relatedType: "contact", relatedId: id, to: mail.contactTo, replyTo: input.email, ...emails.admin });
    enqueueEmail({ relatedType: "contact", relatedId: id, to: input.email, replyTo: mail.contactTo, ...emails.customer });
    db.exec("COMMIT");
    return { id };
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}
