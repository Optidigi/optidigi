import { randomUUID, timingSafeEqual } from "node:crypto";
import { database } from "./database";
import { InputError } from "./validation";

function equalSecret(left: string, right: string) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function requireAdmin(request: Request) {
  const expectedUser = process.env.ADMIN_USERNAME || "";
  const expectedPassword = process.env.ADMIN_PASSWORD || "";
  const basic = request.headers.get("authorization")?.match(/^Basic\s+(.+)$/i)?.[1];
  if (expectedUser && expectedPassword && basic) {
    let decoded = "";
    try {
      decoded = Buffer.from(basic, "base64").toString("utf8");
    } catch {
      decoded = "";
    }
    const separator = decoded.indexOf(":");
    const username = separator >= 0 ? decoded.slice(0, separator) : "";
    const password = separator >= 0 ? decoded.slice(separator + 1) : "";
    if (equalSecret(username, expectedUser) && equalSecret(password, expectedPassword)) return;
  }

  const configuredToken = process.env.ADMIN_API_TOKEN;
  const bearer = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") || "";
  if (configuredToken && bearer && equalSecret(bearer, configuredToken)) return;

  const email = request.headers.get("cf-access-authenticated-user-email")?.toLowerCase();
  const assertion = request.headers.get("cf-access-jwt-assertion");
  const allowed = (process.env.ADMIN_EMAILS || process.env.MAIL_CONTACT_TO || "hey@optidigi.nl")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
  if (email && assertion && allowed.includes(email)) return;
  throw new InputError("Niet geautoriseerd.", 401, "unauthorized");
}

export function listAppointments() {
  return database().prepare(`
    SELECT id, start_at AS startAt, end_at AS endAt, timezone, type, name, company, email, phone,
      subject, note, status, created_at AS createdAt, updated_at AS updatedAt
    FROM appointments ORDER BY start_at ASC
  `).all();
}

export function setAppointmentStatus(id: string, status: unknown) {
  if (status !== "confirmed" && status !== "cancelled") throw new InputError("Ongeldige status.");
  try {
    const result = database().prepare(`UPDATE appointments SET status = ?, updated_at = ? WHERE id = ?`).run(status, new Date().toISOString(), id);
    if (!result.changes) throw new InputError("Afspraak niet gevonden.", 404, "not_found");
  } catch (error) {
    if (error instanceof Error && /UNIQUE constraint failed/.test(error.message)) throw new InputError("Dit moment is al bezet.", 409, "slot_unavailable");
    throw error;
  }
  return { id, status };
}

export function listBlocks() {
  return database().prepare(`SELECT id, start_at AS startAt, end_at AS endAt, reason, created_at AS createdAt FROM blocked_periods ORDER BY start_at ASC`).all();
}

export function createBlock(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new InputError("Ongeldige aanvraag.");
  const input = value as Record<string, unknown>;
  if (typeof input.startAt !== "string" || typeof input.endAt !== "string") throw new InputError("Start- en eindtijd ontbreken.");
  const start = new Date(input.startAt);
  const end = new Date(input.endAt);
  if (!Number.isFinite(start.getTime()) || start.toISOString() !== input.startAt || !Number.isFinite(end.getTime()) || end.toISOString() !== input.endAt || end <= start) {
    throw new InputError("Ongeldige start- of eindtijd.");
  }
  const reason = typeof input.reason === "string" ? input.reason.trim().slice(0, 250) : "";
  const id = randomUUID();
  database().prepare(`INSERT INTO blocked_periods (id, start_at, end_at, reason, created_at) VALUES (?, ?, ?, ?, ?)`)
    .run(id, start.toISOString(), end.toISOString(), reason || null, new Date().toISOString());
  return { id, startAt: start.toISOString(), endAt: end.toISOString(), reason };
}

export function deleteBlock(id: string) {
  const result = database().prepare(`DELETE FROM blocked_periods WHERE id = ?`).run(id);
  if (!result.changes) throw new InputError("Blokkade niet gevonden.", 404, "not_found");
}
