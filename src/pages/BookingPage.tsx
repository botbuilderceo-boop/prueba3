import { useEffect, useRef, useState } from 'react';
import Calendar from '../components/Calendar';
import PatientForm from '../components/PatientForm';
import SlotGrid from '../components/SlotGrid';
import { CLINIC, DEMO_MODE, SERVICES } from '../config/clinic';
import { bookingApi } from '../services/bookingApi';
import type { BookingResult, Patient, Service, Slot } from '../types';
import { longDate, monthOf, shiftMonth, timeLabel, todayBogota } from '../utils/dates';
import { validate, type Errors } from '../utils/validate';

type Step = 'service' | 'date' | 'time' | 'data' | 'review' | 'result';
const ORDER: Step[] = ['service', 'date', 'time', 'data', 'review'];
const LABEL: Record<string, string> = { service: 'Servicio', date: 'Fecha', time: 'Horario', data: 'Tus datos', review: 'Revisión' };
const TITLE: Record<string, string> = { service: '¿Qué servicio necesitas?', date: 'Elige una fecha', time: 'Elige un horario', data: 'Tus datos', review: 'Revisa tu cita' };
const EMPTY: Patient = { fullName: '', phone: '', documentId: '', email: '' };

export default function BookingPage() {
  const today = todayBogota();
  const [step, setStep] = useState<Step>('service');
  const [service, setService] = useState<Service | null>(null);
  const [month, setMonth] = useState(monthOf(today));
  const [days, setDays] = useState<Record<string, boolean>>({});
  const [daysLoading, setDaysLoading] = useState(false);
  const [daysError, setDaysError] = useState(false);
  const [date, setDate] = useState<string | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState(false);
  const [reload, setReload] = useState(0);
  const [slot, setSlot] = useState<Slot | null>(null);
  const [patient, setPatient] = useState<Patient>(EMPTY);
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<BookingResult | null>(null);
  const key = useRef('');
  const head = useRef<HTMLHeadingElement>(null);

  useEffect(() => { head.current?.focus(); }, [step]);

  useEffect(() => {
    if (!service || step !== 'date') return;
    let off = false;
    setDaysLoading(true); setDaysError(false);
    bookingApi.getDays(month, service.id)
      .then((d) => { if (!off) setDays(Object.fromEntries(d.map((x) => [x.date, x.hasAvailability]))); })
      .catch(() => { if (!off) setDaysError(true); })
      .finally(() => { if (!off) setDaysLoading(false); });
    return () => { off = true; };
  }, [service, month, step]);

  useEffect(() => {
    if (!service || !date || step !== 'time') return;
    let off = false;
    setSlotsLoading(true); setSlotsError(false);
    bookingApi.getSlots(date, service.id)
      .then((s) => { if (!off) setSlots(s); })
      .catch(() => { if (!off) setSlotsError(true); })
      .finally(() => { if (!off) setSlotsLoading(false); });
    return () => { off = true; };
  }, [service, date, step, reload]);

  const pickService = (s: Service) => {
    if (s.id !== service?.id) { setService(s); setDate(null); setSlot(null); setDays({}); key.current = ''; }
    setStep('date');
  };
  const pickSlot = (s: Slot) => { setSlot(s); key.current = ''; };
  const goData = () => {
    const e = validate(patient, consent);
    setErrors(e);
    if (Object.keys(e).length === 0) setStep('review');
  };
  const reset = () => {
    setStep('service'); setService(null); setDate(null); setSlot(null); setPatient(EMPTY); setConsent(false);
    setErrors({}); setResult(null); key.current = '';
  };

  async function submit() {
    if (!service || !slot || submitting) return;
    setSubmitting(true);
    if (!key.current) key.current = typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
    try {
      setResult(await bookingApi.createBooking({ idempotencyKey: key.current, serviceId: service.id, slotStart: slot.start, patient, consent }));
    } catch {
      setResult({ status: 'server_error' });
    } finally {
      setSubmitting(false);
      setStep('result');
    }
  }

  const back = (to: Step) => <button className="btn ghost" onClick={() => setStep(to)}>Atrás</button>;
  const idx = ORDER.indexOf(step);
  const when = slot && date ? `${longDate(date)}, ${timeLabel(slot.start)}` : '';

  function renderResult() {
    const r = result;
    if (!r) return null;
    if (r.status === 'confirmed') return (
      <div className="result ok"><span className="mark">✓</span><h1 ref={head} tabIndex={-1}>Cita confirmada</h1>
        <p>{longDate(r.start.slice(0, 10))}, {timeLabel(r.start)}. Referencia: <strong>{r.bookingRef}</strong></p>
        {DEMO_MODE && <p className="note">Es una prueba visual: no se creó ninguna cita real.</p>}
        <button className="btn" onClick={reset}>Hacer otra reserva</button></div>);
    if (r.status === 'slot_unavailable') return (
      <div className="result warn"><span className="mark">!</span><h1 ref={head} tabIndex={-1}>Ese horario ya no está disponible</h1>
        <p>Otra persona lo reservó mientras completabas tus datos. Tus datos siguen aquí: elige otro horario.</p>
        <button className="btn" onClick={() => { setSlot(null); key.current = ''; setReload((n) => n + 1); setStep('time'); }}>Elegir otro horario</button></div>);
    if (r.status === 'pending') return (
      <div className="result warn"><span className="mark">…</span><h1 ref={head} tabIndex={-1}>Solicitud enviada, pendiente de confirmación</h1>
        <p>Recibimos tu solicitud, pero todavía no está confirmada. No envíes otra para evitar duplicados.</p>
        <button className="btn ghost" onClick={reset}>Volver al inicio</button></div>);
    return (
      <div className="result bad"><span className="mark">×</span><h1 ref={head} tabIndex={-1}>No pudimos completar la reserva</h1>
        <p>Tuvimos un problema temporal y tu cita no fue confirmada. Puedes intentarlo de nuevo.</p>
        <button className="btn" onClick={() => setStep('review')}>Intentar de nuevo</button></div>);
  }

  return (
    <>
      {DEMO_MODE && <div className="demo" role="status">Modo demostración · No se crean reservas reales</div>}
      <div className="shell">
        <header className="brand"><span className="logo" aria-hidden="true">{CLINIC.initials}</span>{CLINIC.name}</header>
        {step !== 'result' && (
          <nav aria-label="Progreso">
            <p className="count">Paso {idx + 1} de {ORDER.length}: {LABEL[step]}</p>
            <ol className="steps">{ORDER.map((s, i) => <li key={s} className={i < idx ? 'done' : i === idx ? 'now' : ''} aria-current={i === idx ? 'step' : undefined} />)}</ol>
          </nav>
        )}
        <div className="layout">
          <section key={step} className="panel step-in">
            {step === 'result' ? renderResult() : <h1 ref={head} tabIndex={-1}>{TITLE[step]}</h1>}

            {step === 'service' && (
              <>
                <div className="cards">
                  {SERVICES.map((s) => (
                    <button key={s.id} className={`card ${service?.id === s.id ? 'sel' : ''}`} aria-pressed={service?.id === s.id} onClick={() => pickService(s)}>
                      <strong>{s.label}</strong><span>{s.description}</span><em>{s.durationMin} min</em>
                    </button>
                  ))}
                </div>
                <p className="note">Servicios de demostración: se reemplazan en <code>src/config/clinic.ts</code>.</p>
              </>
            )}

            {step === 'date' && (
              <>
                <Calendar month={month} today={today} selected={date} days={days} loading={daysLoading}
                  onSelect={(d) => { setDate(d); setSlot(null); setStep('time'); }} onMonth={(n) => setMonth(shiftMonth(month, n))} />
                {daysError && <p className="note err" role="alert">No pudimos consultar la disponibilidad. Vuelve a intentarlo en un momento.</p>}
                <div className="actions">{back('service')}</div>
              </>
            )}

            {step === 'time' && date && (
              <>
                <p className="lead">{longDate(date)} · {service?.durationMin} min</p>
                <SlotGrid slots={slots} loading={slotsLoading} error={slotsError} selected={slot?.start ?? null} onSelect={pickSlot} onRetry={() => setReload((n) => n + 1)} />
                <div className="actions">{back('date')}<button className="btn" disabled={!slot} onClick={() => setStep('data')}>Continuar</button></div>
              </>
            )}

            {step === 'data' && (
              <>
                <PatientForm values={patient} errors={errors} consent={consent}
                  onChange={(k, v) => setPatient({ ...patient, [k]: v })} onConsent={setConsent} />
                <div className="actions">{back('time')}<button className="btn" onClick={goData}>Revisar</button></div>
              </>
            )}

            {step === 'review' && (
              <>
                <dl className="sum">
                  <div><dt>Servicio</dt><dd>{service?.label}<button className="link" onClick={() => setStep('service')}>Cambiar</button></dd></div>
                  <div><dt>Fecha y hora</dt><dd>{when}<button className="link" onClick={() => setStep('date')}>Cambiar</button></dd></div>
                  <div><dt>Paciente</dt><dd>{patient.fullName}<br />{patient.documentId}<br />{patient.phone}<br />{patient.email}<button className="link" onClick={() => setStep('data')}>Cambiar</button></dd></div>
                </dl>
                <div className="actions">{back('data')}<button className={`btn ${submitting ? 'loading' : ''}`} disabled={submitting} onClick={submit}>{submitting ? 'Enviando…' : 'Confirmar reserva'}</button></div>
              </>
            )}
          </section>

          {step !== 'result' && (
            <aside className="aside" aria-label="Resumen de tu cita">
              <h2>Tu cita</h2>
              <dl className="mini">
                <dt>Servicio</dt><dd>{service?.label ?? '—'}</dd>
                <dt>Fecha</dt><dd>{date ? longDate(date) : '—'}</dd>
                <dt>Hora</dt><dd>{slot ? timeLabel(slot.start) : '—'}</dd>
              </dl>
            </aside>
          )}
        </div>
      </div>
    </>
  );
}
