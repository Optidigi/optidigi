import { randomUUID } from "node:crypto";
import { database } from "./database";
import { InputError } from "./validation";
import { hasAdminAccess } from "./admin-auth";

export function requireAdmin(request: Request) {
  if (hasAdminAccess(request)) return;
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

export function deleteAppointment(id: string) {
  const db = database();
  db.exec("BEGIN IMMEDIATE");
  try {
    db.prepare(`DELETE FROM email_outbox WHERE related_type = 'appointment' AND related_id = ?`).run(id);
    const result = db.prepare(`DELETE FROM appointments WHERE id = ?`).run(id);
    if (!result.changes) throw new InputError("Afspraak niet gevonden.", 404, "not_found");
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
  return { id, deleted: true };
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
