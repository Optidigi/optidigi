import assert from "node:assert/strict";
import test from "node:test";

process.env.BOOKING_DATABASE_PATH = ":memory:";
process.env.BOOKING_TIMEZONE = "Europe/Amsterdam";
process.env.BOOKING_DURATION_MINUTES = "30";
process.env.BOOKING_INTERVAL_MINUTES = "30";
process.env.BOOKING_MIN_NOTICE_HOURS = "0";
process.env.BOOKING_HORIZON_DAYS = "30";
process.env.BOOKING_WORKDAYS = "1,2,3,4,5";
process.env.BOOKING_START_TIME = "09:00";
process.env.BOOKING_END_TIME = "10:00";

const { availableSlots, createAppointment } = await import("../src/lib/server/booking.ts");
const { setAppointmentStatus, createBlock, deleteAppointment, listAppointments } = await import("../src/lib/server/admin.ts");
const { resetDatabaseForTests } = await import("../src/lib/server/database.ts");

test.afterEach(() => resetDatabaseForTests());

test("a confirmed appointment atomically removes its slot and cancellation reopens it", () => {
  const now = new Date("2026-07-13T06:00:00.000Z");
  const initial = availableSlots("2026-07-20", "2026-07-20", now);
  assert.equal(initial.slots.length, 2);

  const selected = initial.slots[0];
  const appointment = createAppointment({
    startAt: selected.startAt,
    type: "video",
    name: "Test Klant",
    email: "test@example.com",
    company: "Voorbeeld BV",
    phone: "",
    subject: "Kennismaking",
    note: "",
    idempotencyKey: "booking-test-1",
  }, now);

  assert.equal(appointment.created, true);
  assert.equal(availableSlots("2026-07-20", "2026-07-20", now).slots.length, 1);
  assert.throws(
    () => createAppointment({
      startAt: selected.startAt,
      type: "video",
      name: "Tweede Klant",
      email: "second@example.com",
      company: "",
      phone: "",
      subject: "Kennismaking",
      note: "",
      idempotencyKey: "booking-test-2",
    }, now),
    (error) => error?.code === "slot_unavailable",
  );

  setAppointmentStatus(appointment.id, "cancelled");
  assert.equal(availableSlots("2026-07-20", "2026-07-20", now).slots.length, 2);
});

test("a blocked period is excluded from public availability", () => {
  const now = new Date("2026-07-13T06:00:00.000Z");
  const initial = availableSlots("2026-07-20", "2026-07-20", now);
  createBlock({ startAt: initial.slots[1].startAt, endAt: initial.slots[1].endAt, reason: "Niet beschikbaar" });
  const remaining = availableSlots("2026-07-20", "2026-07-20", now);
  assert.deepEqual(remaining.slots, [initial.slots[0]]);
});

test("permanent deletion removes the appointment and reopens its slot", () => {
  const now = new Date("2026-07-13T06:00:00.000Z");
  const selected = availableSlots("2026-07-20", "2026-07-20", now).slots[0];
  const appointment = createAppointment({
    startAt: selected.startAt,
    type: "video",
    name: "Te verwijderen",
    email: "remove@example.com",
    company: "",
    phone: "",
    subject: "Overig",
    note: "",
    idempotencyKey: "booking-delete-test",
  }, now);

  deleteAppointment(appointment.id);

  assert.equal(listAppointments().some((item) => item.id === appointment.id), false);
  assert.equal(availableSlots("2026-07-20", "2026-07-20", now).slots.length, 2);
});
