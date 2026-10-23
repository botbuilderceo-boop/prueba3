import { mockProvider } from '../mocks/mockProvider';
import type { BookingApi } from '../types';

/**
 * PUNTO DE CAMBIO PARA n8n (Fase 4).
 * Hoy se usa el proveedor simulado. Para conectar el backend real:
 *  1. Crear src/services/httpProvider.ts que implemente la interfaz BookingApi
 *     (getDays, getSlots, createBooking) con fetch() hacia [URL_FUNCION_NETLIFY].
 *  2. Cambiar la línea de abajo por: export const bookingApi: BookingApi = httpProvider;
 * La URL de n8n y sus secretos NO van aquí: viven en una Netlify Function (servidor).
 */
export const bookingApi: BookingApi = mockProvider;
