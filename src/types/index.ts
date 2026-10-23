export interface Service {
  id: string;
  label: string;
  description: string;
  durationMin: number;
}

/** busy = ocupado (gris), unavailable = no reservable (bloqueado, fuera de horario, muy pronto). */
export type SlotStatus = 'available' | 'busy' | 'unavailable';

export interface Slot {
  start: string; // ISO con zona, p. ej. 2026-11-12T09:00:00-05:00
  end: string;
  status: SlotStatus;
  demo?: boolean; // true = dato de demostración
}

export interface DayAvailability {
  date: string; // YYYY-MM-DD
  hasAvailability: boolean;
}

export interface Patient {
  fullName: string;
  phone: string;
  documentId: string;
  email: string;
}

export interface BookingRequest {
  idempotencyKey: string;
  serviceId: string;
  slotStart: string;
  patient: Patient;
  consent: boolean;
}

export type BookingResult =
  | { status: 'confirmed'; bookingRef: string; start: string; end: string }
  | { status: 'slot_unavailable' }
  | { status: 'server_error' }
  | { status: 'pending' };

/** Contrato que implementarán el proveedor simulado y, después, n8n. */
export interface BookingApi {
  getDays(month: string, serviceId: string): Promise<DayAvailability[]>;
  getSlots(date: string, serviceId: string): Promise<Slot[]>;
  createBooking(req: BookingRequest): Promise<BookingResult>;
}
