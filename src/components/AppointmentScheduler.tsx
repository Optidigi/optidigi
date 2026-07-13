import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Phone,
  Video,
} from "lucide-react";

const timeSlots = ["10:00", "10:30", "11:00", "11:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00"];
const weekDays = ["Ma", "Di", "Wo", "Do", "Vr", "Za", "Zo"];

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function firstBookableDate() {
  const date = startOfDay(new Date());
  date.setDate(date.getDate() + 1);
  while (date.getDay() === 0 || date.getDay() === 6) date.setDate(date.getDate() + 1);
  return date;
}

function sameDay(a: Date | null, b: Date) {
  return Boolean(a && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate());
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

export default function AppointmentScheduler() {
  const initialDate = useMemo(firstBookableDate, []);
  const [visibleMonth, setVisibleMonth] = useState(() => new Date(initialDate.getFullYear(), initialDate.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState<Date | null>(initialDate);
  const [selectedTime, setSelectedTime] = useState("");
  const [callType, setCallType] = useState<"video" | "phone">("video");
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [message, setMessage] = useState("");
  const [confirmation, setConfirmation] = useState<{ name: string; email: string } | null>(null);
  const days = useMemo(() => monthDays(visibleMonth), [visibleMonth]);
  const minimumDate = useMemo(firstBookableDate, []);
  const minimumMonth = new Date(minimumDate.getFullYear(), minimumDate.getMonth(), 1);
  const canGoPrevious = visibleMonth.getTime() > minimumMonth.getTime();

  const monthLabel = new Intl.DateTimeFormat("nl-NL", { month: "long", year: "numeric" }).format(visibleMonth);
  const dateLabel = selectedDate
    ? new Intl.DateTimeFormat("nl-NL", { weekday: "long", day: "numeric", month: "long" }).format(selectedDate)
    : "Kies een datum";
  const displayDateLabel = dateLabel.charAt(0).toUpperCase() + dateLabel.slice(1);

  useEffect(() => {
    const reset = () => {
      setStep(1);
      setSelectedTime("");
      setMessage("");
      setConfirmation(null);
    };
    document.addEventListener("booking-reset", reset);
    return () => document.removeEventListener("booking-reset", reset);
  }, []);

  function shiftMonth(direction: number) {
    if (direction < 0 && !canGoPrevious) return;
    setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() + direction, 1));
    setSelectedDate(null);
    setSelectedTime("");
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") || "").trim();
    const email = String(form.get("email") || "").trim();
    const phone = String(form.get("phone") || "").trim();
    if (!name || !email || (callType === "phone" && !phone)) {
      setMessage(callType === "phone" ? "Vul ook het telefoonnummer in waarop we je kunnen bellen." : "Vul je naam en e-mailadres in.");
      return;
    }

    setConfirmation({ name, email });
    setMessage("");
    setStep(3);
  }

  return (
    <div className="grid min-w-0 lg:h-[29rem] lg:grid-cols-[15rem_minmax(0,1fr)]">
      <aside className="border-b border-foreground/10 bg-illustration/35 p-6 sm:p-8 lg:border-b-0 lg:border-r">
        <p className="text-sm font-medium text-muted-foreground">Optidigi</p>
        <h2 id="booking-dialog-title" className="mt-1 text-xl font-semibold tracking-tight">Plan een kennismaking</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">Kies rustig een moment dat past. We bespreken kort waar digitaal winst te behalen is.</p>

        <ul className="mt-6 space-y-3 text-sm text-muted-foreground">
          <li className="flex items-center gap-2.5"><Clock className="size-4 shrink-0" />15 tot 30 min.</li>
          <li className="flex items-center gap-2.5"><Check className="size-4 shrink-0" />Vrijblijvend</li>
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
                const isCurrentMonth = date.getMonth() === visibleMonth.getMonth();
                const disabled = !isCurrentMonth || startOfDay(date) < minimumDate || date.getDay() === 0 || date.getDay() === 6;
                const selected = sameDay(selectedDate, date);
                return <button key={date.toISOString()} type="button" disabled={disabled} aria-pressed={selected} onClick={() => { setSelectedDate(date); setSelectedTime(""); }} className={`mx-auto flex size-9 items-center justify-center rounded-md text-xs font-medium transition sm:size-10 ${selected ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" : disabled ? "cursor-not-allowed text-muted-foreground/25" : "cursor-pointer hover:bg-primary/10 hover:text-primary"}`}>{date.getDate()}</button>;
              })}
            </div>
          </section>

          <section className="flex min-w-0 flex-col overflow-hidden bg-illustration/20 p-5 sm:p-7">
            <p className="text-xs font-medium text-muted-foreground">Beschikbare tijden</p>
            <p className="mt-1 text-sm font-medium">{displayDateLabel}</p>
            <div className="mt-3 grid grid-cols-2 gap-2 pt-1 lg:min-h-0 lg:flex-1 lg:grid-cols-1 lg:content-start lg:overflow-y-auto lg:px-1 lg:pb-1 lg:[scrollbar-width:thin]">
              {timeSlots.map((time) => <button key={time} type="button" aria-pressed={selectedTime === time} onClick={() => setSelectedTime(time)} className={`flex h-9 cursor-pointer items-center justify-between rounded-md px-3 text-xs font-medium ring-1 transition ${selectedTime === time ? "bg-primary text-primary-foreground ring-primary shadow-sm" : "bg-card text-foreground ring-border-illustration hover:ring-primary/40"}`}><span className="flex items-center gap-2"><Clock className="size-3.5" />{time}</span>{selectedTime === time && <Check className="size-3.5" />}</button>)}
            </div>
            <button type="button" disabled={!selectedDate || !selectedTime} onClick={() => setStep(2)} className="brand-primary-action mt-5 inline-flex h-10 cursor-pointer items-center justify-center rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground shadow-md shadow-black/15 ring-1 ring-black/10 transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40">Verder</button>
          </section>
        </div>
      ) : step === 2 ? (
        <form onSubmit={submit} className="min-w-0 overflow-y-auto p-6">
          <button type="button" onClick={() => { setStep(1); setMessage(""); }} className="inline-flex cursor-pointer items-center gap-1.5 text-xs font-medium text-muted-foreground transition hover:text-foreground"><ArrowLeft className="size-3.5" />Moment wijzigen</button>
          <h3 className="mt-3 text-lg font-semibold tracking-tight">Vul je gegevens in</h3>
          <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground"><span>{displayDateLabel}</span><span aria-hidden="true">·</span><span>{selectedTime}</span><span aria-hidden="true">·</span><span>{callType === "video" ? "Videogesprek" : "Telefoongesprek"}</span></p>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1 text-xs font-medium">Naam<input name="name" required autoComplete="name" placeholder="Jouw naam" className="h-9 rounded-md bg-background px-3 text-sm font-normal outline-none ring-1 ring-border-illustration focus:ring-primary/50" /></label>
            <label className="grid gap-1 text-xs font-medium">E-mailadres<input name="email" required type="email" autoComplete="email" placeholder="naam@bedrijf.nl" className="h-9 rounded-md bg-background px-3 text-sm font-normal outline-none ring-1 ring-border-illustration focus:ring-primary/50" /></label>
            <label className="grid gap-1 text-xs font-medium">Bedrijf <span className="sr-only">optioneel</span><input name="company" autoComplete="organization" placeholder="Bedrijfsnaam (optioneel)" className="h-9 rounded-md bg-background px-3 text-sm font-normal outline-none ring-1 ring-border-illustration focus:ring-primary/50" /></label>
            <label className="grid gap-1 text-xs font-medium"><span>Telefoonnummer {callType === "video" && <span className="font-normal text-muted-foreground">(optioneel)</span>}</span><input name="phone" required={callType === "phone"} type="tel" autoComplete="tel" placeholder="06 12 34 56 78" className="h-9 rounded-md bg-background px-3 text-sm font-normal outline-none ring-1 ring-border-illustration focus:ring-primary/50" /></label>
          </div>
          <label className="mt-3 grid gap-1 text-xs font-medium">Onderwerp<select name="subject" required className="h-9 cursor-pointer rounded-md bg-background px-3 text-sm font-normal outline-none ring-1 ring-border-illustration focus:ring-primary/50"><option value="AI & automatisering">AI & automatisering</option><option value="Maatwerk software">Maatwerk software</option><option value="Cloud & software">Cloud & software</option><option value="Overig">Overig</option></select></label>
          <label className="mt-3 grid gap-1 text-xs font-medium"><span>Opmerking <span className="font-normal text-muted-foreground">(optioneel)</span></span><textarea name="note" rows={1} placeholder="Wil je nog iets meegeven?" className="min-h-9 resize-none rounded-md bg-background px-3 py-2 text-sm font-normal outline-none ring-1 ring-border-illustration focus:ring-primary/50" /></label>
          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="min-h-4 text-xs text-muted-foreground" aria-live="polite">{message}</p>
            <button type="submit" className="brand-primary-action inline-flex h-10 cursor-pointer items-center justify-center rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground shadow-md shadow-black/15 ring-1 ring-black/10 transition hover:bg-primary/90">Afspraak aanvragen</button>
          </div>
        </form>
      ) : (
        <section className="flex min-h-[24rem] min-w-0 items-center justify-center p-6 text-center lg:min-h-0">
          <div className="max-w-md">
            <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary ring-1 ring-primary/20">
              <CheckCircle2 className="size-6" aria-hidden="true" />
            </span>
            <h3 className="mt-5 text-xl font-semibold tracking-tight">Afspraak aangevraagd</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Bedankt{confirmation?.name ? `, ${confirmation.name}` : ""}. We nemen contact met je op om het moment te bevestigen.
            </p>
            <div className="mx-auto mt-5 w-fit rounded-lg bg-illustration/50 px-4 py-3 text-left ring-1 ring-border-illustration">
              <p className="text-sm font-medium">{displayDateLabel} om {selectedTime}</p>
              <p className="mt-1 text-xs text-muted-foreground">{callType === "video" ? "Videogesprek" : "Telefoongesprek"}{confirmation?.email ? ` · ${confirmation.email}` : ""}</p>
            </div>
            <button
              type="button"
              onClick={() => document.querySelector<HTMLDialogElement>("[data-booking-dialog]")?.close()}
              className="brand-primary-action mt-6 inline-flex h-10 cursor-pointer items-center justify-center rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground shadow-md shadow-black/15 ring-1 ring-black/10 transition hover:bg-primary/90"
            >
              Sluiten
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
