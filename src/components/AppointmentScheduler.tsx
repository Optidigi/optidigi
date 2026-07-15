import { useEffect, useMemo, useState, type SyntheticEvent } from "react";
import { ArrowLeft, Check, CheckCircle2, ChevronLeft, ChevronRight, Clock, Phone, Video } from "lucide-react";
import type { Locale } from "@/i18n";

type Slot = { startAt: string; endAt: string };
type Availability = { timezone: string; durationMinutes: number; slots: Slot[] };
type Draft = { name: string; email: string; company: string; phone: string; subject: string; note: string };

const weekDays = { nl: ["Ma", "Di", "Wo", "Do", "Vr", "Za", "Zo"], en: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] } as const;
const copy = {
  nl: { title: "Plan een kennismaking", intro: "Kies rustig een moment dat past. We bespreken kort waar digitaal winst te behalen is.", duration: "15 tot 30 min.", confirmedDirectly: "Direct bevestigd", chooseType: "Kies het type gesprek", phone: "Telefoon", chooseDate: "Kies een datum", previousMonth: "Vorige maand", nextMonth: "Volgende maand", unavailable: "niet beschikbaar", availableTimes: "Beschikbare tijden", loading: "Momenten laden…", chooseAvailable: "Kies een beschikbare datum.", none: "Geen momenten beschikbaar in deze maand.", continue: "Verder", changeTime: "Moment wijzigen", details: "Vul je gegevens in", videoCall: "Videogesprek", phoneCall: "Telefoongesprek", name: "Naam", yourName: "Jouw naam", email: "E-mailadres", emailPlaceholder: "naam@bedrijf.nl", company: "Bedrijf", optional: "optioneel", companyPlaceholder: "Bedrijfsnaam (optioneel)", phoneNumber: "Telefoonnummer", subject: "Onderwerp", note: "Opmerking", notePlaceholder: "Wil je nog iets meegeven?", privacyLead: "We gebruiken je gegevens alleen voor deze afspraak.", privacyLink: "Lees onze privacyverklaring", booking: "Boeken…", confirm: "Afspraak bevestigen", confirmed: "Afspraak bevestigd", thanks: "Bedankt", confirmation: "Het moment staat vast. Je ontvangt de bevestiging per e-mail.", at: "om", close: "Sluiten", availabilityError: "Beschikbaarheid laden lukte niet. Probeer het opnieuw.", phoneRequired: "Vul ook het telefoonnummer in waarop we je kunnen bellen.", detailsRequired: "Vul je naam en e-mailadres in.", slotTaken: "Dit moment is zojuist geboekt. Kies een ander beschikbaar tijdstip.", bookingError: "Boeken lukte niet. Je gegevens zijn bewaard; probeer het nogmaals.", subjects: ["AI & automatisering", "Maatwerk software", "Cloud & software", "Overig"] },
  en: { title: "Book an introductory call", intro: "Choose a time that works for you. We’ll briefly explore where digital improvements could make a difference.", duration: "15 to 30 min.", confirmedDirectly: "Confirmed instantly", chooseType: "Choose the type of call", phone: "Phone", chooseDate: "Choose a date", previousMonth: "Previous month", nextMonth: "Next month", unavailable: "unavailable", availableTimes: "Available times", loading: "Loading times…", chooseAvailable: "Choose an available date.", none: "No times available this month.", continue: "Continue", changeTime: "Change time", details: "Enter your details", videoCall: "Video call", phoneCall: "Phone call", name: "Name", yourName: "Your name", email: "Email address", emailPlaceholder: "name@company.com", company: "Company", optional: "optional", companyPlaceholder: "Company name (optional)", phoneNumber: "Phone number", subject: "Topic", note: "Note", notePlaceholder: "Anything else you would like us to know?", privacyLead: "We only use your details for this appointment.", privacyLink: "Read our privacy policy", booking: "Booking…", confirm: "Confirm appointment", confirmed: "Appointment confirmed", thanks: "Thank you", confirmation: "Your appointment is booked. You’ll receive a confirmation by email.", at: "at", close: "Close", availabilityError: "We couldn’t load availability. Please try again.", phoneRequired: "Please enter the phone number we should call.", detailsRequired: "Please enter your name and email address.", slotTaken: "This time has just been booked. Please choose another available time.", bookingError: "We couldn’t complete the booking. Your details have been saved; please try again.", subjects: ["AI & automation", "Custom software", "Cloud & software", "Other"] },
} as const;

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
function slotTime(iso: string, locale: Locale) {
  return new Intl.DateTimeFormat(locale === "nl" ? "nl-NL" : "en-GB", { timeZone: "Europe/Amsterdam", hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date(iso));
}
function dateFromKey(key: string) {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day);
}
function makeIdempotencyKey() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export default function AppointmentScheduler({ locale = "nl" }: { locale?: Locale }) {
  const t = copy[locale];
  const emptyDraft: Draft = { name: "", email: "", company: "", phone: "", subject: t.subjects[0], note: "" };
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
  const monthLabel = new Intl.DateTimeFormat(locale === "nl" ? "nl-NL" : "en-GB", { month: "long", year: "numeric" }).format(visibleMonth);
  const dateLabel = selectedDate
    ? new Intl.DateTimeFormat(locale === "nl" ? "nl-NL" : "en-GB", { weekday: "long", day: "numeric", month: "long" }).format(selectedDate)
    : t.chooseDate;
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
      setAvailabilityMessage(t.availabilityError);
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
      setMessage(callType === "phone" ? t.phoneRequired : t.detailsRequired);
      return;
    }

    setSubmitting(true); setMessage("");
    try {
      const response = await fetch("/api/appointments", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startAt: selectedStartAt, type: callType, ...nextDraft, idempotencyKey, formStartedAt, locale }),
      });
      if (response.status === 409) {
        await loadAvailability(visibleMonth);
        setSelectedStartAt(""); setStep(1);
        setAvailabilityMessage(t.slotTaken);
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
        : t.bookingError);
    } finally { setSubmitting(false); }
  }

  return (
    <div className="grid min-w-0 lg:h-[29rem] lg:grid-cols-[15rem_minmax(0,1fr)]">
      <aside className="border-b border-foreground/10 bg-illustration/35 p-6 sm:p-8 lg:border-b-0 lg:border-r">
        <p className="text-sm font-medium text-muted-foreground">Optidigi</p>
        <h2 id="booking-dialog-title" className="mt-1 text-xl font-semibold tracking-tight">{t.title}</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{t.intro}</p>
        <ul className="mt-6 space-y-3 text-sm text-muted-foreground">
          <li className="flex items-center gap-2.5"><Clock className="size-4 shrink-0" />{t.duration}</li>
          <li className="flex items-center gap-2.5"><Check className="size-4 shrink-0" />{t.confirmedDirectly}</li>
        </ul>
        <fieldset className="mt-4" disabled={step === 3}>
          <legend className="sr-only">{t.chooseType}</legend>
          <div className="brand-secondary-control inline-grid grid-cols-2 rounded-lg border border-transparent bg-card/75 p-1 ring-1 ring-foreground/10 backdrop-blur-md" aria-label={t.chooseType}>
            <button type="button" disabled={step === 3} aria-pressed={callType === "video"} onClick={() => setCallType("video")} className={`flex h-8 cursor-pointer items-center gap-1.5 rounded-md px-2.5 text-xs font-medium transition disabled:cursor-default ${callType === "video" ? "bg-primary/12 text-primary shadow-sm ring-1 ring-primary/25" : "text-muted-foreground hover:text-foreground"}`}><Video className="size-3.5 shrink-0" />Video</button>
            <button type="button" disabled={step === 3} aria-pressed={callType === "phone"} onClick={() => setCallType("phone")} className={`flex h-8 cursor-pointer items-center gap-1.5 rounded-md px-2.5 text-xs font-medium transition disabled:cursor-default ${callType === "phone" ? "bg-primary/12 text-primary shadow-sm ring-1 ring-primary/25" : "text-muted-foreground hover:text-foreground"}`}><Phone className="size-4 shrink-0 stroke-[2.25]" />{t.phone}</button>
          </div>
        </fieldset>
      </aside>

      {step === 1 ? (
        <div className="grid min-w-0 lg:h-full lg:min-h-0 lg:grid-cols-[minmax(0,1fr)_13rem] lg:overflow-hidden">
          <section className="min-w-0 border-b border-foreground/10 p-5 sm:p-7 lg:min-h-0 lg:border-b-0 lg:border-r">
            <div className="flex items-center justify-between gap-3">
              <div><p className="text-xs font-medium text-muted-foreground">{t.chooseDate}</p><h3 className="mt-1 text-lg font-semibold capitalize tracking-tight">{monthLabel}</h3></div>
              <div className="flex gap-1">
                <button type="button" disabled={!canGoPrevious} onClick={() => shiftMonth(-1)} aria-label={t.previousMonth} className="flex size-8 cursor-pointer items-center justify-center rounded-md text-muted-foreground ring-1 ring-border-illustration transition hover:bg-illustration hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30"><ChevronLeft className="size-4" /></button>
                <button type="button" onClick={() => shiftMonth(1)} aria-label={t.nextMonth} className="flex size-8 cursor-pointer items-center justify-center rounded-md text-muted-foreground ring-1 ring-border-illustration transition hover:bg-illustration hover:text-foreground"><ChevronRight className="size-4" /></button>
              </div>
            </div>
            <div className="mt-5 grid grid-cols-7 gap-1 text-center">
              {weekDays[locale].map((day) => <div key={day} className="py-1 text-[10px] font-medium text-muted-foreground">{day}</div>)}
              {days.map((date) => {
                const key = dateKey(date); const current = date.getMonth() === visibleMonth.getMonth(); const hasSlots = (slotsByDate.get(key)?.length ?? 0) > 0;
                const disabled = !current || !hasSlots || loadingAvailability; const selected = selectedDateKey === key;
                return <button key={key} type="button" disabled={disabled} aria-pressed={selected} aria-label={`${date.getDate()} ${monthLabel}${hasSlots ? "" : `, ${t.unavailable}`}`} onClick={() => { setSelectedDateKey(key); setSelectedStartAt(""); }} className={`mx-auto flex size-9 items-center justify-center rounded-md text-xs font-medium transition sm:size-10 ${selected ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" : disabled ? "cursor-not-allowed text-muted-foreground/25" : "cursor-pointer hover:bg-primary/10 hover:text-primary"}`}>{date.getDate()}</button>;
              })}
            </div>
          </section>
          <section className="flex min-w-0 flex-col overflow-hidden bg-illustration/20 p-5 sm:p-7">
            <p className="text-xs font-medium text-muted-foreground">{t.availableTimes}</p>
            <p className="mt-1 text-sm font-medium">{displayDateLabel}</p>
            <div className="mt-3 grid grid-cols-2 gap-2 pt-1 lg:min-h-0 lg:flex-1 lg:grid-cols-1 lg:content-start lg:overflow-y-auto lg:px-1 lg:pb-1 lg:[scrollbar-width:thin]">
              {loadingAvailability ? <p className="col-span-2 py-3 text-xs text-muted-foreground lg:col-span-1">{t.loading}</p> :
                selectedDateKey ? (slotsByDate.get(selectedDateKey) ?? []).map((slot) => {
                  const time = slotTime(slot.startAt, locale); const selected = selectedStartAt === slot.startAt;
                  return <button key={slot.startAt} type="button" aria-pressed={selected} onClick={() => setSelectedStartAt(slot.startAt)} className={`flex h-9 cursor-pointer items-center justify-between rounded-md px-3 text-xs font-medium ring-1 transition ${selected ? "bg-primary text-primary-foreground ring-primary shadow-sm" : "bg-card text-foreground ring-border-illustration hover:ring-primary/40"}`}><span className="flex items-center gap-2"><Clock className="size-3.5" />{time}</span>{selected && <Check className="size-3.5" />}</button>;
                }) : <p className="col-span-2 py-3 text-xs text-muted-foreground lg:col-span-1">{t.chooseAvailable}</p>}
            </div>
            {availabilityMessage && <p className="mt-2 text-xs text-destructive" role="alert">{availabilityMessage}</p>}
            {!loadingAvailability && !availabilityMessage && (availability?.slots.length ?? 0) === 0 && <p className="mt-2 text-xs text-muted-foreground">{t.none}</p>}
            <button type="button" disabled={!selectedStartAt} onClick={() => setStep(2)} className="brand-primary-action mt-5 inline-flex h-10 cursor-pointer items-center justify-center rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground shadow-md shadow-black/15 ring-1 ring-black/10 transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40">{t.continue}</button>
          </section>
        </div>
      ) : step === 2 ? (
        <form onSubmit={submit} className="min-w-0 overflow-y-auto p-6">
          <button type="button" onClick={() => { setStep(1); setMessage(""); }} className="inline-flex cursor-pointer items-center gap-1.5 text-xs font-medium text-muted-foreground transition hover:text-foreground"><ArrowLeft className="size-3.5" />{t.changeTime}</button>
          <h3 className="mt-3 text-lg font-semibold tracking-tight">{t.details}</h3>
          <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground"><span>{displayDateLabel}</span><span aria-hidden="true">·</span><span>{selectedSlot ? slotTime(selectedSlot.startAt, locale) : ""}</span><span aria-hidden="true">·</span><span>{callType === "video" ? t.videoCall : t.phoneCall}</span></p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1 text-xs font-medium">{t.name}<input name="name" required autoComplete="name" defaultValue={draft.name} placeholder={t.yourName} className="h-9 rounded-md bg-background px-3 text-sm font-normal outline-none ring-1 ring-border-illustration focus:ring-primary/50" /></label>
            <label className="grid gap-1 text-xs font-medium">{t.email}<input name="email" required type="email" autoComplete="email" defaultValue={draft.email} placeholder={t.emailPlaceholder} className="h-9 rounded-md bg-background px-3 text-sm font-normal outline-none ring-1 ring-border-illustration focus:ring-primary/50" /></label>
            <label className="grid gap-1 text-xs font-medium">{t.company} <span className="sr-only">{t.optional}</span><input name="company" autoComplete="organization" defaultValue={draft.company} placeholder={t.companyPlaceholder} className="h-9 rounded-md bg-background px-3 text-sm font-normal outline-none ring-1 ring-border-illustration focus:ring-primary/50" /></label>
            <label className="grid gap-1 text-xs font-medium"><span>{t.phoneNumber} {callType === "video" && <span className="font-normal text-muted-foreground">({t.optional})</span>}</span><input name="phone" required={callType === "phone"} type="tel" autoComplete="tel" defaultValue={draft.phone} placeholder="+31 6 12 34 56 78" className="h-9 rounded-md bg-background px-3 text-sm font-normal outline-none ring-1 ring-border-illustration focus:ring-primary/50" /></label>
          </div>
          <label className="mt-3 grid gap-1 text-xs font-medium">{t.subject}<select name="subject" required defaultValue={draft.subject} className="h-9 cursor-pointer rounded-md bg-background px-3 text-sm font-normal outline-none ring-1 ring-border-illustration focus:ring-primary/50">{t.subjects.map((subject) => <option value={subject}>{subject}</option>)}</select></label>
          <label className="mt-3 grid gap-1 text-xs font-medium"><span>{t.note} <span className="font-normal text-muted-foreground">({t.optional})</span></span><textarea name="note" rows={1} defaultValue={draft.note} placeholder={t.notePlaceholder} className="min-h-9 resize-none rounded-md bg-background px-3 py-2 text-sm font-normal outline-none ring-1 ring-border-illustration focus:ring-primary/50" /></label>
          <p className="mt-3 text-xs text-muted-foreground">{t.privacyLead} <a href={locale === "en" ? "/en/privacy" : "/privacy"} className="text-primary underline-offset-4 hover:underline">{t.privacyLink}</a>.</p>
          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="min-h-4 text-xs text-destructive" aria-live="polite">{message}</p>
            <button type="submit" disabled={submitting} className="brand-primary-action inline-flex h-10 cursor-pointer items-center justify-center rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground shadow-md shadow-black/15 ring-1 ring-black/10 transition hover:bg-primary/90 disabled:cursor-wait disabled:opacity-60">{submitting ? t.booking : t.confirm}</button>
          </div>
        </form>
      ) : (
        <section className="flex min-h-[24rem] min-w-0 items-center justify-center p-6 text-center lg:min-h-0">
          <div className="max-w-md">
            <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary ring-1 ring-primary/20"><CheckCircle2 className="size-6" aria-hidden="true" /></span>
            <h3 className="mt-5 text-xl font-semibold tracking-tight">{t.confirmed}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t.thanks}{confirmation?.name ? `, ${confirmation.name}` : ""}. {t.confirmation}</p>
            <div className="mx-auto mt-5 w-fit rounded-lg bg-illustration/50 px-4 py-3 text-left ring-1 ring-border-illustration">
              <p className="text-sm font-medium">{displayDateLabel} {t.at} {selectedStartAt ? slotTime(selectedStartAt, locale) : ""}</p>
              <p className="mt-1 text-xs text-muted-foreground">{callType === "video" ? t.videoCall : t.phoneCall}{confirmation?.email ? ` · ${confirmation.email}` : ""}</p>
            </div>
            <button type="button" onClick={() => document.querySelector<HTMLDialogElement>("[data-booking-dialog]")?.close()} className="brand-primary-action mt-6 inline-flex h-10 cursor-pointer items-center justify-center rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground shadow-md shadow-black/15 ring-1 ring-black/10 transition hover:bg-primary/90">{t.close}</button>
          </div>
        </section>
      )}
    </div>
  );
}
