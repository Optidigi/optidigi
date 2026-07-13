import { useEffect, useMemo, useState, type SyntheticEvent } from "react";
import { ArrowLeft, Check, CheckCircle2, ChevronLeft, ChevronRight, Clock, Phone, Video } from "lucide-react";

type Slot = { startAt: string; endAt: string };
type Availability = { timezone: string; durationMinutes: number; slots: Slot[] };
type Draft = { name: string; email: string; company: string; phone: string; subject: string; note: string };

const weekDays = ["Ma", "Di", "Wo", "Do", "Vr", "Za", "Zo"];
const emptyDraft: Draft = { name: "", email: "", company: "", phone: "", subject: "AI & automatisering", note: "" };

function startOfDay(date: Date) { return new Date(date.getFullYear(), date.getMonth(), date.getDate()); }
function firstBookableDate() {
  const date = startOfDay(new Date());
  date.setDate(date.getDate() + 1);
  while (date.getDay() === 0 || date.getDay() === 6) date.setDate(date.getDate() + 1);
  return date;
}
function monthDays(month: Date) {
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const start = new Date(first);
  start.setDate(first.getDate() - ((first.getDay() + 6) % 7));
  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return date;
  });
}
function dateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
function slotDateKey(iso: string) {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Amsterdam", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date(iso));
  const value = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${value.year}-${value.month}-${value.day}`;
}
function slotTime(iso: string) {
  return new Intl.DateTimeFormat("nl-NL", { timeZone: "Europe/Amsterdam", hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date(iso));
}
function dateFromKey(key: string) {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day);
}
function makeIdempotencyKey() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export default function AppointmentScheduler() {
  const initialDate = useMemo(firstBookableDate, []);
  const [visibleMonth, setVisibleMonth] = useState(() => new Date(initialDate.getFullYear(), initialDate.getMonth(), 1));
  const [availability, setAvailability] = useState<Availability | null>(null);
  const [availabilityMessage, setAvailabilityMessage] = useState("");
  const [loadingAvailability, setLoadingAvailability] = useState(true);
  const [selectedDateKey, setSelectedDateKey] = useState("");
  const [selectedStartAt, setSelectedStartAt] = useState("");
  const [callType, setCallType] = useState<"video" | "phone">("video");
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState<{ name: string; email: string } | null>(null);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [idempotencyKey, setIdempotencyKey] = useState(makeIdempotencyKey);
  const [formStartedAt, setFormStartedAt] = useState(() => Date.now());
  const days = useMemo(() => monthDays(visibleMonth), [visibleMonth]);
  const minimumMonth = new Date(initialDate.getFullYear(), initialDate.getMonth(), 1);
  const canGoPrevious = visibleMonth.getTime() > minimumMonth.getTime();

  const slotsByDate = useMemo(() => {
    const grouped = new Map<string, Slot[]>();
    for (const slot of availability?.slots ?? []) {
      const key = slotDateKey(slot.startAt);
      grouped.set(key, [...(grouped.get(key) ?? []), slot]);
    }
    for (const slots of grouped.values()) slots.sort((a, b) => a.startAt.localeCompare(b.startAt));
    return grouped;
  }, [availability]);

  const selectedDate = selectedDateKey ? dateFromKey(selectedDateKey) : null;
  const selectedSlot = (slotsByDate.get(selectedDateKey) ?? []).find((slot) => slot.startAt === selectedStartAt);
  const monthLabel = new Intl.DateTimeFormat("nl-NL", { month: "long", year: "numeric" }).format(visibleMonth);
  const dateLabel = selectedDate
    ? new Intl.DateTimeFormat("nl-NL", { weekday: "long", day: "numeric", month: "long" }).format(selectedDate)
    : "Kies een datum";
  const displayDateLabel = dateLabel.charAt(0).toUpperCase() + dateLabel.slice(1);

  async function loadAvailability(month = visibleMonth) {
    setLoadingAvailability(true);
    setAvailabilityMessage("");
    const from = dateKey(new Date(month.getFullYear(), month.getMonth(), 1));
    const to = dateKey(new Date(month.getFullYear(), month.getMonth() + 1, 1));
    try {
      const response = await fetch(`/api/appointments/availability?from=${from}&to=${to}`, { headers: { Accept: "application/json" } });
      if (!response.ok) throw new Error("availability request failed");
      const data = await response.json() as Availability;
      setAvailability(data);
    } catch {
      setAvailability(null);
      setAvailabilityMessage("Beschikbaarheid laden lukte niet. Probeer het opnieuw.");
    } finally {
      setLoadingAvailability(false);
    }
  }

  useEffect(() => { void loadAvailability(visibleMonth); }, [visibleMonth]);
  useEffect(() => {
    const reset = () => {
      setStep(1); setSelectedDateKey(""); setSelectedStartAt(""); setMessage(""); setConfirmation(null);
      setDraft(emptyDraft); setIdempotencyKey(makeIdempotencyKey()); setFormStartedAt(Date.now()); void loadAvailability(visibleMonth);
    };
    document.addEventListener("booking-reset", reset);
    return () => document.removeEventListener("booking-reset", reset);
  }, [visibleMonth]);

  function shiftMonth(direction: number) {
    if (direction < 0 && !canGoPrevious) return;
    setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() + direction, 1));
    setSelectedDateKey(""); setSelectedStartAt("");
  }

  async function submit(event: SyntheticEvent<HTMLFormElement, SubmitEvent>) {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    const nextDraft: Draft = {
      name: String(fields.get("name") || "").trim(), email: String(fields.get("email") || "").trim(),
      company: String(fields.get("company") || "").trim(), phone: String(fields.get("phone") || "").trim(),
      subject: String(fields.get("subject") || "").trim(), note: String(fields.get("note") || "").trim(),
    };
    setDraft(nextDraft);
    if (!selectedStartAt || !nextDraft.name || !nextDraft.email || (callType === "phone" && !nextDraft.phone)) {
      setMessage(callType === "phone" ? "Vul ook het telefoonnummer in waarop we je kunnen bellen." : "Vul je naam en e-mailadres in.");
      return;
    }

    setSubmitting(true); setMessage("");
    try {
      const response = await fetch("/api/appointments", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startAt: selectedStartAt, type: callType, ...nextDraft, idempotencyKey, formStartedAt }),
      });
      if (response.status === 409) {
        await loadAvailability(visibleMonth);
        setSelectedStartAt(""); setStep(1);
        setAvailabilityMessage("Dit moment is zojuist geboekt. Kies een ander beschikbaar tijdstip.");
        return;
      }
      if (!response.ok) {
        const error = await response.json().catch(() => null) as { message?: string } | null;
        throw new Error(error?.message || "booking request failed");
      }
      setConfirmation({ name: nextDraft.name, email: nextDraft.email }); setStep(3);
    } catch (error) {
      setMessage(error instanceof Error && error.message !== "booking request failed"
        ? error.message
        : "Boeken lukte niet. Je gegevens zijn bewaard; probeer het nogmaals.");
    } finally { setSubmitting(false); }
  }

  return (
    <div className="grid min-w-0 lg:h-[29rem] lg:grid-cols-[15rem_minmax(0,1fr)]">
      <aside className="border-b border-foreground/10 bg-illustration/35 p-6 sm:p-8 lg:border-b-0 lg:border-r">
        <p className="text-sm font-medium text-muted-foreground">Optidigi</p>
        <h2 id="booking-dialog-title" className="mt-1 text-xl font-semibold tracking-tight">Plan een kennismaking</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">Kies rustig een moment dat past. We bespreken kort waar digitaal winst te behalen is.</p>
        <ul className="mt-6 space-y-3 text-sm text-muted-foreground">
          <li className="flex items-center gap-2.5"><Clock className="size-4 shrink-0" />15 tot 30 min.</li>
          <li className="flex items-center gap-2.5"><Check className="size-4 shrink-0" />Direct bevestigd</li>
        </ul>
        <fieldset className="mt-4" disabled={step === 3}>
          <legend className="sr-only">Kies het type gesprek</legend>
          <div className="brand-secondary-control inline-grid grid-cols-2 rounded-lg border border-transparent bg-card/75 p-1 ring-1 ring-foreground/10 backdrop-blur-md" aria-label="Gesprekstype">
            <button type="button" disabled={step === 3} aria-pressed={callType === "video"} onClick={() => setCallType("video")} className={`flex h-8 cursor-pointer items-center gap-1.5 rounded-md px-2.5 text-xs font-medium transition disabled:cursor-default ${callType === "video" ? "bg-primary/12 text-primary shadow-sm ring-1 ring-primary/25" : "text-muted-foreground hover:text-foreground"}`}><Video className="size-3.5 shrink-0" />Video</button>
            <button type="button" disabled={step === 3} aria-pressed={callType === "phone"} onClick={() => setCallType("phone")} className={`flex h-8 cursor-pointer items-center gap-1.5 rounded-md px-2.5 text-xs font-medium transition disabled:cursor-default ${callType === "phone" ? "bg-primary/12 text-primary shadow-sm ring-1 ring-primary/25" : "text-muted-foreground hover:text-foreground"}`}><Phone className="size-4 shrink-0 stroke-[2.25]" />Telefoon</button>
          </div>
        </fieldset>
      </aside>

      {step === 1 ? (
        <div className="grid min-w-0 lg:h-full lg:min-h-0 lg:grid-cols-[minmax(0,1fr)_13rem] lg:overflow-hidden">
          <section className="min-w-0 border-b border-foreground/10 p-5 sm:p-7 lg:min-h-0 lg:border-b-0 lg:border-r">
            <div className="flex items-center justify-between gap-3">
              <div><p className="text-xs font-medium text-muted-foreground">Kies een datum</p><h3 className="mt-1 text-lg font-semibold capitalize tracking-tight">{monthLabel}</h3></div>
              <div className="flex gap-1">
                <button type="button" disabled={!canGoPrevious} onClick={() => shiftMonth(-1)} aria-label="Vorige maand" className="flex size-8 cursor-pointer items-center justify-center rounded-md text-muted-foreground ring-1 ring-border-illustration transition hover:bg-illustration hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30"><ChevronLeft className="size-4" /></button>
                <button type="button" onClick={() => shiftMonth(1)} aria-label="Volgende maand" className="flex size-8 cursor-pointer items-center justify-center rounded-md text-muted-foreground ring-1 ring-border-illustration transition hover:bg-illustration hover:text-foreground"><ChevronRight className="size-4" /></button>
              </div>
            </div>
            <div className="mt-5 grid grid-cols-7 gap-1 text-center">
              {weekDays.map((day) => <div key={day} className="py-1 text-[10px] font-medium text-muted-foreground">{day}</div>)}
              {days.map((date) => {
                const key = dateKey(date); const current = date.getMonth() === visibleMonth.getMonth(); const hasSlots = (slotsByDate.get(key)?.length ?? 0) > 0;
                const disabled = !current || !hasSlots || loadingAvailability; const selected = selectedDateKey === key;
                return <button key={key} type="button" disabled={disabled} aria-pressed={selected} aria-label={`${date.getDate()} ${monthLabel}${hasSlots ? "" : ", niet beschikbaar"}`} onClick={() => { setSelectedDateKey(key); setSelectedStartAt(""); }} className={`mx-auto flex size-9 items-center justify-center rounded-md text-xs font-medium transition sm:size-10 ${selected ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" : disabled ? "cursor-not-allowed text-muted-foreground/25" : "cursor-pointer hover:bg-primary/10 hover:text-primary"}`}>{date.getDate()}</button>;
              })}
            </div>
          </section>
          <section className="flex min-w-0 flex-col overflow-hidden bg-illustration/20 p-5 sm:p-7">
            <p className="text-xs font-medium text-muted-foreground">Beschikbare tijden</p>
            <p className="mt-1 text-sm font-medium">{displayDateLabel}</p>
            <div className="mt-3 grid grid-cols-2 gap-2 pt-1 lg:min-h-0 lg:flex-1 lg:grid-cols-1 lg:content-start lg:overflow-y-auto lg:px-1 lg:pb-1 lg:[scrollbar-width:thin]">
              {loadingAvailability ? <p className="col-span-2 py-3 text-xs text-muted-foreground lg:col-span-1">Momenten laden…</p> :
                selectedDateKey ? (slotsByDate.get(selectedDateKey) ?? []).map((slot) => {
                  const time = slotTime(slot.startAt); const selected = selectedStartAt === slot.startAt;
                  return <button key={slot.startAt} type="button" aria-pressed={selected} onClick={() => setSelectedStartAt(slot.startAt)} className={`flex h-9 cursor-pointer items-center justify-between rounded-md px-3 text-xs font-medium ring-1 transition ${selected ? "bg-primary text-primary-foreground ring-primary shadow-sm" : "bg-card text-foreground ring-border-illustration hover:ring-primary/40"}`}><span className="flex items-center gap-2"><Clock className="size-3.5" />{time}</span>{selected && <Check className="size-3.5" />}</button>;
                }) : <p className="col-span-2 py-3 text-xs text-muted-foreground lg:col-span-1">Kies een beschikbare datum.</p>}
            </div>
            {availabilityMessage && <p className="mt-2 text-xs text-destructive" role="alert">{availabilityMessage}</p>}
            {!loadingAvailability && !availabilityMessage && (availability?.slots.length ?? 0) === 0 && <p className="mt-2 text-xs text-muted-foreground">Geen momenten beschikbaar in deze maand.</p>}
            <button type="button" disabled={!selectedStartAt} onClick={() => setStep(2)} className="brand-primary-action mt-5 inline-flex h-10 cursor-pointer items-center justify-center rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground shadow-md shadow-black/15 ring-1 ring-black/10 transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40">Verder</button>
          </section>
        </div>
      ) : step === 2 ? (
        <form onSubmit={submit} className="min-w-0 overflow-y-auto p-6">
          <button type="button" onClick={() => { setStep(1); setMessage(""); }} className="inline-flex cursor-pointer items-center gap-1.5 text-xs font-medium text-muted-foreground transition hover:text-foreground"><ArrowLeft className="size-3.5" />Moment wijzigen</button>
          <h3 className="mt-3 text-lg font-semibold tracking-tight">Vul je gegevens in</h3>
          <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground"><span>{displayDateLabel}</span><span aria-hidden="true">·</span><span>{selectedSlot ? slotTime(selectedSlot.startAt) : ""}</span><span aria-hidden="true">·</span><span>{callType === "video" ? "Videogesprek" : "Telefoongesprek"}</span></p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1 text-xs font-medium">Naam<input name="name" required autoComplete="name" defaultValue={draft.name} placeholder="Jouw naam" className="h-9 rounded-md bg-background px-3 text-sm font-normal outline-none ring-1 ring-border-illustration focus:ring-primary/50" /></label>
            <label className="grid gap-1 text-xs font-medium">E-mailadres<input name="email" required type="email" autoComplete="email" defaultValue={draft.email} placeholder="naam@bedrijf.nl" className="h-9 rounded-md bg-background px-3 text-sm font-normal outline-none ring-1 ring-border-illustration focus:ring-primary/50" /></label>
            <label className="grid gap-1 text-xs font-medium">Bedrijf <span className="sr-only">optioneel</span><input name="company" autoComplete="organization" defaultValue={draft.company} placeholder="Bedrijfsnaam (optioneel)" className="h-9 rounded-md bg-background px-3 text-sm font-normal outline-none ring-1 ring-border-illustration focus:ring-primary/50" /></label>
            <label className="grid gap-1 text-xs font-medium"><span>Telefoonnummer {callType === "video" && <span className="font-normal text-muted-foreground">(optioneel)</span>}</span><input name="phone" required={callType === "phone"} type="tel" autoComplete="tel" defaultValue={draft.phone} placeholder="06 12 34 56 78" className="h-9 rounded-md bg-background px-3 text-sm font-normal outline-none ring-1 ring-border-illustration focus:ring-primary/50" /></label>
          </div>
          <label className="mt-3 grid gap-1 text-xs font-medium">Onderwerp<select name="subject" required defaultValue={draft.subject} className="h-9 cursor-pointer rounded-md bg-background px-3 text-sm font-normal outline-none ring-1 ring-border-illustration focus:ring-primary/50"><option value="AI & automatisering">AI & automatisering</option><option value="Maatwerk software">Maatwerk software</option><option value="Cloud & software">Cloud & software</option><option value="Overig">Overig</option></select></label>
          <label className="mt-3 grid gap-1 text-xs font-medium"><span>Opmerking <span className="font-normal text-muted-foreground">(optioneel)</span></span><textarea name="note" rows={1} defaultValue={draft.note} placeholder="Wil je nog iets meegeven?" className="min-h-9 resize-none rounded-md bg-background px-3 py-2 text-sm font-normal outline-none ring-1 ring-border-illustration focus:ring-primary/50" /></label>
          <p className="mt-3 text-xs text-muted-foreground">We gebruiken je gegevens alleen voor deze afspraak. <a href="/privacy" className="text-primary underline-offset-4 hover:underline">Lees onze privacyverklaring</a>.</p>
          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="min-h-4 text-xs text-destructive" aria-live="polite">{message}</p>
            <button type="submit" disabled={submitting} className="brand-primary-action inline-flex h-10 cursor-pointer items-center justify-center rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground shadow-md shadow-black/15 ring-1 ring-black/10 transition hover:bg-primary/90 disabled:cursor-wait disabled:opacity-60">{submitting ? "Boeken…" : "Afspraak bevestigen"}</button>
          </div>
        </form>
      ) : (
        <section className="flex min-h-[24rem] min-w-0 items-center justify-center p-6 text-center lg:min-h-0">
          <div className="max-w-md">
            <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary ring-1 ring-primary/20"><CheckCircle2 className="size-6" aria-hidden="true" /></span>
            <h3 className="mt-5 text-xl font-semibold tracking-tight">Afspraak bevestigd</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">Bedankt{confirmation?.name ? `, ${confirmation.name}` : ""}. Het moment staat vast. Je ontvangt de bevestiging per e-mail.</p>
            <div className="mx-auto mt-5 w-fit rounded-lg bg-illustration/50 px-4 py-3 text-left ring-1 ring-border-illustration">
              <p className="text-sm font-medium">{displayDateLabel} om {selectedStartAt ? slotTime(selectedStartAt) : ""}</p>
              <p className="mt-1 text-xs text-muted-foreground">{callType === "video" ? "Videogesprek" : "Telefoongesprek"}{confirmation?.email ? ` · ${confirmation.email}` : ""}</p>
            </div>
            <button type="button" onClick={() => document.querySelector<HTMLDialogElement>("[data-booking-dialog]")?.close()} className="brand-primary-action mt-6 inline-flex h-10 cursor-pointer items-center justify-center rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground shadow-md shadow-black/15 ring-1 ring-black/10 transition hover:bg-primary/90">Sluiten</button>
          </div>
        </section>
      )}
    </div>
  );
}
