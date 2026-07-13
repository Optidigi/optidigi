import {
  AlertTriangle,
  Ban,
  Building2,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Filter,
  Mail,
  MoreHorizontal,
  Phone,
  RefreshCw,
  RotateCcw,
  Sparkles,
  Trash2,
  UserRound,
  Video,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

type Appointment = {
  id: string;
  startAt: string;
  endAt: string;
  type: "video" | "phone";
  name: string;
  email: string;
  company?: string;
  phone?: string;
  subject?: string;
  note?: string;
  status: "confirmed" | "cancelled";
};

type Block = { id: string; startAt: string; endAt: string; reason?: string };
type View = "upcoming" | "cancelled" | "past" | "all";
type Notice = { kind: "success" | "error" | "info"; message: string } | null;

const TIMEZONE = "Europe/Amsterdam";
const dayKey = (value: string | Date) => new Intl.DateTimeFormat("en-CA", { timeZone: TIMEZONE, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(value));
const fullDate = new Intl.DateTimeFormat("nl-NL", { timeZone: TIMEZONE, weekday: "long", day: "numeric", month: "long", year: "numeric" });
const dateTime = new Intl.DateTimeFormat("nl-NL", { timeZone: TIMEZONE, weekday: "short", day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
const time = new Intl.DateTimeFormat("nl-NL", { timeZone: TIMEZONE, hour: "2-digit", minute: "2-digit" });
const monthName = new Intl.DateTimeFormat("nl-NL", { month: "long", year: "numeric" });
const weekdays = ["Ma", "Di", "Wo", "Do", "Vr", "Za", "Zo"];

function monthStart(value = new Date()) { return new Date(value.getFullYear(), value.getMonth(), 1); }
function nextMonth(value: Date, amount: number) { return new Date(value.getFullYear(), value.getMonth() + amount, 1); }
function dateInputValue(value = new Date()) {
  const local = new Date(value.getTime() - value.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 10);
}

function amsterdamWallTimeToIso(date: string, value: string) {
  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute] = value.split(":").map(Number);
  const guess = new Date(Date.UTC(year, month - 1, day, hour, minute));
  const formatter = new Intl.DateTimeFormat("en-CA", { timeZone: TIMEZONE, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23" });
  const parts = Object.fromEntries(formatter.formatToParts(guess).filter((part) => part.type !== "literal").map((part) => [part.type, Number(part.value)]));
  const represented = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second);
  const result = new Date(guess.getTime() - (represented - guess.getTime()));
  return result.toISOString();
}

function StatusBadge({ status }: { status: Appointment["status"] }) {
  return status === "confirmed" ? (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300"><Check className="size-3" />Bevestigd</span>
  ) : (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-[11px] font-semibold text-muted-foreground"><X className="size-3" />Geannuleerd</span>
  );
}

function SummaryCard({ label, value, note, icon: Icon, active, tone, onClick }: { label: string; value: number; note: string; icon: typeof CalendarDays; active?: boolean; tone: "green" | "amber" | "slate"; onClick?: () => void }) {
  const tones = {
    green: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    amber: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
    slate: "bg-slate-500/10 text-slate-700 dark:text-slate-300",
  };
  const Component = onClick ? "button" : "article";
  return (
    <Component type={onClick ? "button" : undefined} onClick={onClick} className={`group rounded-2xl bg-card p-5 text-left shadow-sm ring-1 transition ${active ? "ring-2 ring-primary/50" : "ring-border-illustration"} ${onClick ? "cursor-pointer hover:-translate-y-0.5 hover:shadow-lg" : ""}`}>
      <div className="flex items-start justify-between gap-3">
        <div><p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">{label}</p><p className="mt-2 text-3xl font-semibold tabular-nums tracking-tight">{value}</p></div>
        <span className={`grid size-10 place-items-center rounded-xl ${tones[tone]}`}><Icon className="size-5" /></span>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">{note}</p>
    </Component>
  );
}

function AppointmentCard({ appointment, busy, onStatus, onDelete }: { appointment: Appointment; busy: string | null; onStatus: (appointment: Appointment) => void; onDelete: (appointment: Appointment) => void }) {
  const cancelled = appointment.status === "cancelled";
  const isBusy = busy === appointment.id;
  return (
    <article className="group relative overflow-visible rounded-2xl bg-card p-5 shadow-sm ring-1 ring-border-illustration transition hover:shadow-md sm:p-6">
      <div className={`absolute inset-y-5 left-0 w-1 rounded-r-full ${cancelled ? "bg-muted-foreground/30" : "bg-emerald-500"}`} aria-hidden="true" />
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0 flex-1 pl-1">
          <div className="flex flex-wrap items-center gap-2.5"><h3 className="text-lg font-semibold tracking-tight">{appointment.name}</h3><StatusBadge status={appointment.status} /></div>
          <p className="mt-1.5 flex flex-wrap items-center gap-x-2 text-sm font-medium"><CalendarDays className="size-4 text-muted-foreground" /><span>{dateTime.format(new Date(appointment.startAt))}</span><span className="text-muted-foreground">– {time.format(new Date(appointment.endAt))}</span></p>
          <dl className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Detail icon={appointment.type === "phone" ? Phone : Video} label="Gesprek" value={appointment.type === "phone" ? "Telefonisch" : "Videogesprek"} />
            <Detail icon={Mail} label="E-mail" value={appointment.email} href={`mailto:${appointment.email}`} />
            <Detail icon={Phone} label="Telefoon" value={appointment.phone || "Niet opgegeven"} href={appointment.phone ? `tel:${appointment.phone.replace(/\s/g, "")}` : undefined} />
            <Detail icon={Building2} label="Bedrijf" value={appointment.company || "Niet opgegeven"} />
            <Detail icon={Sparkles} label="Onderwerp" value={appointment.subject || "Niet opgegeven"} />
            <Detail icon={UserRound} label="Opmerking" value={appointment.note || "Geen opmerking"} />
          </dl>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2 xl:justify-end">
          <button type="button" disabled={isBusy} onClick={() => onStatus(appointment)} className={`inline-flex h-10 cursor-pointer items-center gap-2 rounded-xl px-3.5 text-xs font-semibold transition disabled:cursor-wait disabled:opacity-60 ${cancelled ? "bg-primary text-primary-foreground hover:bg-primary/90" : "text-destructive ring-1 ring-destructive/25 hover:bg-destructive/10"}`}>
            {cancelled ? <RotateCcw className="size-4" /> : <Ban className="size-4" />}{isBusy ? "Bezig…" : cancelled ? "Opnieuw bevestigen" : "Afspraak annuleren"}
          </button>
          <details className="relative">
            <summary className="flex size-10 cursor-pointer list-none items-center justify-center rounded-xl text-muted-foreground ring-1 ring-border-illustration transition hover:bg-illustration hover:text-foreground" aria-label={`Meer acties voor ${appointment.name}`}><MoreHorizontal className="size-5" /></summary>
            <div className="absolute right-0 z-20 mt-2 w-56 rounded-xl bg-card p-1.5 shadow-xl ring-1 ring-border-illustration">
              <button type="button" onClick={() => onDelete(appointment)} className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2.5 text-left text-xs font-semibold text-destructive transition hover:bg-destructive/10"><Trash2 className="size-4" />Definitief verwijderen</button>
            </div>
          </details>
        </div>
      </div>
    </article>
  );
}

function Detail({ icon: Icon, label, value, href }: { icon: typeof Mail; label: string; value: string; href?: string }) {
  return <div className="flex min-w-0 gap-3"><span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-illustration text-muted-foreground"><Icon className="size-4" /></span><div className="min-w-0"><dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">{label}</dt><dd className="mt-0.5 break-words text-sm">{href ? <a className="underline-offset-4 hover:underline" href={href}>{value}</a> : value}</dd></div></div>;
}

export default function AgendaDashboard() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [notice, setNotice] = useState<Notice>(null);
  const [view, setView] = useState<View>("upcoming");
  const [visibleMonth, setVisibleMonth] = useState(() => monthStart());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Appointment | null>(null);
  const deleteDialog = useRef<HTMLDialogElement>(null);

  const redirectOnUnauthorized = (response: Response) => { if (response.status === 401) { window.location.assign("/agenda/login"); return true; } return false; };
  const load = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true);
    try {
      const [appointmentsResponse, blocksResponse] = await Promise.all([fetch("/api/admin/appointments"), fetch("/api/admin/blocks")]);
      if (redirectOnUnauthorized(appointmentsResponse) || redirectOnUnauthorized(blocksResponse)) return;
      if (!appointmentsResponse.ok || !blocksResponse.ok) throw new Error("De agendagegevens konden niet worden geladen.");
      const appointmentsData = await appointmentsResponse.json() as { appointments: Appointment[] };
      const blocksData = await blocksResponse.json() as { blocks: Block[] };
      setAppointments(appointmentsData.appointments); setBlocks(blocksData.blocks);
    } catch (error) { setNotice({ kind: "error", message: error instanceof Error ? error.message : "De agendagegevens konden niet worden geladen." }); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { void load(); }, [load]);
  useEffect(() => {
    if (deleteTarget && deleteDialog.current && !deleteDialog.current.open) deleteDialog.current.showModal();
    if (!deleteTarget && deleteDialog.current?.open) deleteDialog.current.close();
  }, [deleteTarget]);

  const now = Date.now();
  const counts = useMemo(() => ({
    upcoming: appointments.filter((item) => item.status === "confirmed" && new Date(item.endAt).getTime() >= now).length,
    cancelled: appointments.filter((item) => item.status === "cancelled").length,
    blocks: blocks.filter((item) => new Date(item.endAt).getTime() >= now).length,
  }), [appointments, blocks]);

  const filtered = useMemo(() => appointments.filter((item) => {
    const future = new Date(item.endAt).getTime() >= now;
    const matchesView = view === "all" || (view === "upcoming" && item.status === "confirmed" && future) || (view === "cancelled" && item.status === "cancelled") || (view === "past" && item.status === "confirmed" && !future);
    return matchesView && (!selectedDate || dayKey(item.startAt) === selectedDate);
  }), [appointments, selectedDate, view]);

  const calendarDays = useMemo(() => {
    const year = visibleMonth.getFullYear(); const month = visibleMonth.getMonth();
    const leading = (new Date(year, month, 1).getDay() + 6) % 7;
    const days = new Date(year, month + 1, 0).getDate();
    return [...Array(leading).fill(null), ...Array.from({ length: days }, (_, index) => new Date(year, month, index + 1))];
  }, [visibleMonth]);

  async function updateStatus(appointment: Appointment) {
    setBusy(appointment.id); setNotice(null);
    const status = appointment.status === "cancelled" ? "confirmed" : "cancelled";
    try {
      const response = await fetch(`/api/admin/appointments/${encodeURIComponent(appointment.id)}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
      if (redirectOnUnauthorized(response)) return;
      const result = await response.json().catch(() => null) as { message?: string } | null;
      if (!response.ok) throw new Error(result?.message || "De afspraak kon niet worden aangepast.");
      await load(true); setNotice({ kind: "success", message: status === "cancelled" ? "De afspraak is geannuleerd; het tijdstip is weer boekbaar." : "De afspraak is opnieuw bevestigd." });
    } catch (error) { setNotice({ kind: "error", message: error instanceof Error ? error.message : "De afspraak kon niet worden aangepast." }); }
    finally { setBusy(null); }
  }

  async function removeAppointment() {
    if (!deleteTarget) return;
    setBusy(deleteTarget.id);
    try {
      const response = await fetch(`/api/admin/appointments/${encodeURIComponent(deleteTarget.id)}`, { method: "DELETE", headers: { "Content-Type": "application/json" } });
      if (redirectOnUnauthorized(response)) return;
      if (!response.ok) throw new Error("De afspraak kon niet worden verwijderd.");
      setDeleteTarget(null); await load(true); setNotice({ kind: "success", message: "De afspraak en gekoppelde e-mailadministratie zijn definitief verwijderd." });
    } catch (error) { setNotice({ kind: "error", message: error instanceof Error ? error.message : "De afspraak kon niet worden verwijderd." }); }
    finally { setBusy(null); }
  }

  async function createBlock(event: React.SyntheticEvent<HTMLFormElement>) {
    event.preventDefault(); setNotice(null);
    const form = event.currentTarget; const fields = new FormData(form);
    const startAt = amsterdamWallTimeToIso(String(fields.get("startDate")), String(fields.get("startTime")));
    const endAt = amsterdamWallTimeToIso(String(fields.get("endDate")), String(fields.get("endTime")));
    if (new Date(endAt) <= new Date(startAt)) { setNotice({ kind: "error", message: "De eindtijd moet na de begintijd liggen." }); return; }
    setBusy("block");
    try {
      const response = await fetch("/api/admin/blocks", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ startAt, endAt, reason: String(fields.get("reason") || "").trim() }) });
      if (redirectOnUnauthorized(response)) return;
      const result = await response.json().catch(() => null) as { message?: string } | null;
      if (!response.ok) throw new Error(result?.message || "De blokkering kon niet worden opgeslagen.");
      form.reset(); await load(true); setNotice({ kind: "success", message: "De periode is geblokkeerd en wordt niet meer aangeboden aan klanten." });
    } catch (error) { setNotice({ kind: "error", message: error instanceof Error ? error.message : "De blokkering kon niet worden opgeslagen." }); }
    finally { setBusy(null); }
  }

  async function removeBlock(id: string) {
    setBusy(id);
    try {
      const response = await fetch(`/api/admin/blocks/${encodeURIComponent(id)}`, { method: "DELETE", headers: { "Content-Type": "application/json" } });
      if (redirectOnUnauthorized(response)) return;
      if (!response.ok) throw new Error("De blokkering kon niet worden verwijderd.");
      await load(true); setNotice({ kind: "success", message: "De blokkering is verwijderd; de periode kan weer worden geboekt." });
    } catch (error) { setNotice({ kind: "error", message: error instanceof Error ? error.message : "De blokkering kon niet worden verwijderd." }); }
    finally { setBusy(null); }
  }

  const today = dateInputValue();
  return (
    <>
      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-10">
        <section className="relative overflow-hidden rounded-3xl bg-[#111318] px-6 py-7 text-white shadow-2xl shadow-black/10 sm:px-8 sm:py-9">
          <div className="absolute -right-16 -top-20 size-64 rounded-full bg-emerald-400/15 blur-3xl" aria-hidden="true" />
          <div className="absolute -bottom-24 left-1/3 size-52 rounded-full bg-sky-400/10 blur-3xl" aria-hidden="true" />
          <div className="relative flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div><p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/55"><Sparkles className="size-3.5" />Optidigi beheer</p><h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Agenda & beschikbaarheid</h1><p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/60">Plan met overzicht. Beheer afspraken, sluit momenten uit en houd de komende gesprekken scherp in beeld.</p></div>
            <button type="button" onClick={() => void load()} className="inline-flex h-10 w-fit cursor-pointer items-center gap-2 rounded-xl bg-white/10 px-4 text-xs font-semibold ring-1 ring-white/15 transition hover:bg-white/15"><RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />Vernieuwen</button>
          </div>
        </section>

        {notice && <div role={notice.kind === "error" ? "alert" : "status"} className={`mt-5 flex items-start gap-3 rounded-xl px-4 py-3 text-sm ring-1 ${notice.kind === "error" ? "bg-destructive/8 text-destructive ring-destructive/20" : notice.kind === "success" ? "bg-emerald-500/8 text-emerald-800 ring-emerald-500/20 dark:text-emerald-200" : "bg-card text-foreground ring-border-illustration"}`}>{notice.kind === "error" ? <AlertTriangle className="mt-0.5 size-4 shrink-0" /> : <Check className="mt-0.5 size-4 shrink-0" />}<span className="flex-1">{notice.message}</span><button onClick={() => setNotice(null)} className="cursor-pointer opacity-60 hover:opacity-100" aria-label="Melding sluiten"><X className="size-4" /></button></div>}

        <section className="mt-5 grid gap-3 sm:grid-cols-3" aria-label="Samenvatting">
          <SummaryCard label="Komende afspraken" value={counts.upcoming} note="Bevestigd en nog te voeren" icon={CalendarDays} tone="green" active={view === "upcoming"} onClick={() => { setView("upcoming"); setSelectedDate(null); }} />
          <SummaryCard label="Geannuleerd" value={counts.cancelled} note="Bewaard in de administratie" icon={Ban} tone="slate" active={view === "cancelled"} onClick={() => { setView("cancelled"); setSelectedDate(null); }} />
          <SummaryCard label="Blokkeringen" value={counts.blocks} note="Niet boekbaar voor klanten" icon={Clock3} tone="amber" />
        </section>

        <div className="mt-6 grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
          <section className="h-fit rounded-2xl bg-card p-5 shadow-sm ring-1 ring-border-illustration" aria-labelledby="calendar-title">
            <div className="flex items-center justify-between gap-3"><div><p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Maandoverzicht</p><h2 id="calendar-title" className="mt-1 text-lg font-semibold capitalize">{monthName.format(visibleMonth)}</h2></div><div className="flex gap-1"><button type="button" onClick={() => setVisibleMonth(nextMonth(visibleMonth, -1))} className="grid size-9 cursor-pointer place-items-center rounded-lg ring-1 ring-border-illustration transition hover:bg-illustration" aria-label="Vorige maand"><ChevronLeft className="size-4" /></button><button type="button" onClick={() => setVisibleMonth(nextMonth(visibleMonth, 1))} className="grid size-9 cursor-pointer place-items-center rounded-lg ring-1 ring-border-illustration transition hover:bg-illustration" aria-label="Volgende maand"><ChevronRight className="size-4" /></button></div></div>
            <button type="button" onClick={() => { setVisibleMonth(monthStart()); setSelectedDate(null); }} className="mt-3 text-xs font-semibold text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">Naar vandaag</button>
            <div className="mt-5 grid grid-cols-7 gap-1 text-center">{weekdays.map((day) => <span key={day} className="pb-1 text-[10px] font-semibold uppercase text-muted-foreground">{day}</span>)}
              {calendarDays.map((date, index) => {
                if (!date) return <span key={`blank-${index}`} aria-hidden="true" />;
                const key = dateInputValue(date); const dayAppointments = appointments.filter((item) => dayKey(item.startAt) === key); const confirmed = dayAppointments.filter((item) => item.status === "confirmed").length; const blocked = blocks.some((block) => dayKey(block.startAt) <= key && dayKey(block.endAt) >= key); const selected = selectedDate === key; const current = key === today;
                const label = `${fullDate.format(date)}${confirmed ? `, ${confirmed} bevestigde ${confirmed === 1 ? "afspraak" : "afspraken"}` : ""}${blocked ? ", bevat een blokkering" : ""}`;
                return <button key={key} type="button" onClick={() => setSelectedDate(selected ? null : key)} aria-pressed={selected} aria-label={label} className={`relative flex h-10 cursor-pointer flex-col items-center justify-center rounded-xl text-xs font-semibold transition ${selected ? "bg-primary text-primary-foreground shadow-md" : "hover:bg-illustration"} ${current && !selected ? "ring-1 ring-primary/40" : ""}`}><span>{date.getDate()}</span><span className="absolute bottom-1.5 flex gap-0.5" aria-hidden="true">{confirmed > 0 && <i className={`size-1 rounded-full ${selected ? "bg-white" : "bg-emerald-500"}`} />}{blocked && <i className={`size-1 rounded-full ${selected ? "bg-white/70" : "bg-amber-500"}`} />}</span></button>;
              })}
            </div>
            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 border-t border-foreground/8 pt-4 text-[11px] text-muted-foreground"><span className="flex items-center gap-1.5"><i className="size-2 rounded-full bg-emerald-500" />Afspraak</span><span className="flex items-center gap-1.5"><i className="size-2 rounded-full bg-amber-500" />Blokkering</span></div>
          </section>

          <section aria-labelledby="appointments-title">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Planning</p><h2 id="appointments-title" className="mt-1 text-2xl font-semibold tracking-tight">{selectedDate ? fullDate.format(new Date(`${selectedDate}T12:00:00`)) : view === "upcoming" ? "Komende afspraken" : view === "cancelled" ? "Geannuleerde afspraken" : view === "past" ? "Afgelopen afspraken" : "Alle afspraken"}</h2></div><div className="relative w-full sm:w-56"><Filter className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><select value={view} onChange={(event) => setView(event.target.value as View)} aria-label="Afspraken filteren" className="h-10 w-full cursor-pointer appearance-none rounded-xl bg-card pl-9 pr-9 text-xs font-semibold outline-none ring-1 ring-border-illustration focus:ring-2 focus:ring-primary/25"><option value="upcoming">Komende afspraken</option><option value="cancelled">Geannuleerd</option><option value="past">Afgelopen</option><option value="all">Alles</option></select><ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /></div></div>
            {selectedDate && <button type="button" onClick={() => setSelectedDate(null)} className="mt-3 inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-illustration px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"><X className="size-3.5" />Datumfilter wissen</button>}
            <div className="mt-4 grid gap-3">
              {loading ? <>{[0, 1].map((item) => <div key={item} className="h-48 animate-pulse rounded-2xl bg-card ring-1 ring-border-illustration" />)}</> : filtered.length ? filtered.map((appointment) => <AppointmentCard key={appointment.id} appointment={appointment} busy={busy} onStatus={updateStatus} onDelete={setDeleteTarget} />) : <div className="rounded-2xl border border-dashed border-foreground/15 bg-card/50 px-6 py-12 text-center"><span className="mx-auto grid size-12 place-items-center rounded-2xl bg-illustration text-muted-foreground"><CalendarDays className="size-5" /></span><h3 className="mt-4 font-semibold">Geen afspraken in deze weergave</h3><p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">Kies een andere status of wis het datumfilter om meer afspraken te zien.</p></div>}
            </div>
          </section>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <section className="rounded-2xl bg-card p-5 shadow-sm ring-1 ring-border-illustration sm:p-6" aria-labelledby="block-title"><div className="flex items-start gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-300"><Ban className="size-5" /></span><div><h2 id="block-title" className="font-semibold">Beschikbaarheid blokkeren</h2><p className="mt-1 text-sm text-muted-foreground">Tijden hieronder zijn altijd in Europe/Amsterdam.</p></div></div>
            <form onSubmit={createBlock} className="mt-6 grid gap-4"><div className="grid gap-4 sm:grid-cols-2"><Field label="Begindatum"><input required name="startDate" type="date" defaultValue={today} className="field" /></Field><Field label="Starttijd"><input required name="startTime" type="time" defaultValue="09:00" className="field" /></Field><Field label="Einddatum"><input required name="endDate" type="date" defaultValue={today} className="field" /></Field><Field label="Eindtijd"><input required name="endTime" type="time" defaultValue="17:00" className="field" /></Field></div><Field label="Reden" hint="optioneel"><input name="reason" placeholder="Bijvoorbeeld: vrije dag" className="field" /></Field><button type="submit" disabled={busy === "block"} className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90 disabled:cursor-wait disabled:opacity-60"><Ban className="size-4" />{busy === "block" ? "Opslaan…" : "Periode blokkeren"}</button></form>
          </section>

          <section className="overflow-hidden rounded-2xl bg-card shadow-sm ring-1 ring-border-illustration" aria-labelledby="blocks-title"><div className="border-b border-foreground/8 px-5 py-5 sm:px-6"><p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Beschikbaarheid</p><h2 id="blocks-title" className="mt-1 font-semibold">Niet-boekbare perioden</h2></div><div className="divide-y divide-foreground/8">{blocks.filter((block) => new Date(block.endAt).getTime() >= now).length ? blocks.filter((block) => new Date(block.endAt).getTime() >= now).map((block) => <article key={block.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-start sm:justify-between sm:px-6"><div><p className="text-sm font-semibold">{dateTime.format(new Date(block.startAt))} – {dateTime.format(new Date(block.endAt))}</p><p className="mt-1 text-xs text-muted-foreground">{block.reason || "Geen reden opgegeven"}</p></div><button type="button" disabled={busy === block.id} onClick={() => void removeBlock(block.id)} className="inline-flex w-fit cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-semibold text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"><Trash2 className="size-3.5" />Verwijderen</button></article>) : <div className="px-6 py-12 text-center"><Clock3 className="mx-auto size-5 text-muted-foreground" /><p className="mt-3 text-sm font-semibold">Alles staat open</p><p className="mt-1 text-xs text-muted-foreground">Er zijn geen toekomstige blokkeringen.</p></div>}</div></section>
        </div>
      </div>

      <dialog ref={deleteDialog} onClose={() => setDeleteTarget(null)} aria-labelledby="delete-title" className="m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl bg-card p-0 text-foreground shadow-2xl backdrop:bg-black/55"><div className="p-6"><span className="grid size-11 place-items-center rounded-xl bg-destructive/10 text-destructive"><AlertTriangle className="size-5" /></span><h2 id="delete-title" className="mt-4 text-xl font-semibold">Afspraak definitief verwijderen?</h2><p className="mt-2 text-sm leading-relaxed text-muted-foreground">{deleteTarget ? `${deleteTarget.name} · ${dateTime.format(new Date(deleteTarget.startAt))}` : ""}</p><p className="mt-4 rounded-xl bg-destructive/8 px-4 py-3 text-sm text-destructive">De afspraak en gekoppelde e-mailadministratie worden verwijderd. Dit kan niet ongedaan worden gemaakt.</p><div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><button type="button" onClick={() => setDeleteTarget(null)} className="h-10 cursor-pointer rounded-xl px-4 text-sm font-semibold ring-1 ring-border-illustration transition hover:bg-illustration">Behouden</button><button type="button" disabled={busy === deleteTarget?.id} onClick={() => void removeAppointment()} className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-xl bg-destructive px-4 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-wait disabled:opacity-60"><Trash2 className="size-4" />{busy === deleteTarget?.id ? "Verwijderen…" : "Definitief verwijderen"}</button></div></div></dialog>
    </>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return <label className="grid gap-1.5 text-xs font-semibold"><span>{label}{hint && <span className="ml-1 font-normal text-muted-foreground">({hint})</span>}</span>{children}</label>;
}
