import { SERVICES } from '../config/clinic';
import type { BookingApi, Slot } from '../types';
import { minutesOf, toIso, weekdayOf } from '../utils/dates';

// DATOS DE DEMOSTRACIÓN: nada de este archivo proviene de un calendario real.
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
const hash = (s: string) => { let h = 7; for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0; return h; };
const OPEN = 8 * 60; // [HORARIO_ATENCION] provisional
const CLOSE = 17 * 60;

function buildSlots(date: string, serviceId: string): Slot[] {
  const dur = SERVICES.find((s) => s.id === serviceId)?.durationMin ?? 60;
  if (weekdayOf(date) >= 5) return [];
  const out: Slot[] = [];
  for (let t = OPEN; t + dur <= CLOSE; t += dur) {
    const r = hash(`${date}${serviceId}${t}`) % 10;
    out.push({ start: toIso(date, t), end: toIso(date, t + dur), status: r < 3 ? 'busy' : r === 3 ? 'unavailable' : 'available', demo: true });
  }
  return out;
}

/** Para probar pantallas de resultado: añade ?demo=conflict, ?demo=error o ?demo=pending a la URL. */
const mode = () => (typeof location !== 'undefined' ? new URLSearchParams(location.search).get('demo') : null);

export const mockProvider: BookingApi = {
  async getDays(month, serviceId) {
    await wait(350);
    const total = new Date(Date.UTC(+month.slice(0, 4), +month.slice(5, 7), 0)).getUTCDate();
    return Array.from({ length: total }, (_, i) => {
      const date = `${month}-${String(i + 1).padStart(2, '0')}`;
      return { date, hasAvailability: buildSlots(date, serviceId).some((s) => s.status === 'available') };
    });
  },
  async getSlots(date, serviceId) {
    await wait(450);
    return buildSlots(date, serviceId);
  },
  async createBooking(req) {
    await wait(900);
    const m = mode();
    if (m === 'conflict') return { status: 'slot_unavailable' };
    if (m === 'error') return { status: 'server_error' };
    if (m === 'pending') return { status: 'pending' };
    const dur = SERVICES.find((s) => s.id === req.serviceId)?.durationMin ?? 60;
    return { status: 'confirmed', bookingRef: `DEMO-${hash(req.idempotencyKey).toString(36).toUpperCase()}`, start: req.slotStart, end: toIso(req.slotStart.slice(0, 10), minutesOf(req.slotStart) + dur) };
  },
};
