export const TZ = 'America/Bogota';
const p = (n: number) => String(n).padStart(2, '0');
const parts = (m: string) => m.split('-').map(Number);

export const todayBogota = () => new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(new Date());
export const monthOf = (d: string) => d.slice(0, 7);
export const shiftMonth = (m: string, delta: number) => {
  const [y, mo] = parts(m);
  const d = new Date(Date.UTC(y, mo - 1 + delta, 1));
  return `${d.getUTCFullYear()}-${p(d.getUTCMonth() + 1)}`;
};
export const daysInMonth = (m: string) => { const [y, mo] = parts(m); return new Date(Date.UTC(y, mo, 0)).getUTCDate(); };
/** Lunes = 0 … domingo = 6 */
export const firstWeekday = (m: string) => { const [y, mo] = parts(m); return (new Date(Date.UTC(y, mo - 1, 1)).getUTCDay() + 6) % 7; };
export const weekdayOf = (d: string) => (new Date(`${d}T12:00:00Z`).getUTCDay() + 6) % 7;
export const dayKey = (m: string, day: number) => `${m}-${p(day)}`;

export const longDate = (d: string) =>
  new Intl.DateTimeFormat('es-CO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${d}T12:00:00Z`));
export const monthLabel = (m: string) =>
  new Intl.DateTimeFormat('es-CO', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${m}-01T12:00:00Z`));

/** Lee la hora directamente del ISO (siempre en hora de Bogotá, UTC-5, sin horario de verano). */
export const timeLabel = (iso: string) => {
  const h = Number(iso.slice(11, 13));
  return `${h % 12 || 12}:${iso.slice(14, 16)} ${h < 12 ? 'a. m.' : 'p. m.'}`;
};
export const toIso = (date: string, minutes: number) => `${date}T${p(Math.floor(minutes / 60))}:${p(minutes % 60)}:00-05:00`;
export const minutesOf = (iso: string) => Number(iso.slice(11, 13)) * 60 + Number(iso.slice(14, 16));
