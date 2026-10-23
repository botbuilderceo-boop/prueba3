import type { Patient, Service } from '../types';

/** Mientras sea true se muestra la insignia de demostración. Cambiar solo con el backend real. */
export const DEMO_MODE = true;

/** Identidad provisional. Los colores están en src/styles/global.css (variables CSS). */
export const CLINIC = { name: '[NOMBRE_DE_LA_CLINICA]', initials: 'C' };

/** DATOS DE DEMOSTRACIÓN: reemplazar por los servicios reales aprobados por la clínica. */
export const SERVICES: Service[] = [
  { id: 'demo-a', label: 'Servicio de demostración A', description: '[DEMO] Descripción de ejemplo.', durationMin: 60 },
  { id: 'demo-b', label: 'Servicio de demostración B', description: '[DEMO] Descripción de ejemplo.', durationMin: 30 },
  { id: 'demo-c', label: 'Servicio de demostración C', description: '[DEMO] Descripción de ejemplo.', durationMin: 45 },
];

export interface FieldConfig {
  label: string;
  type: 'text' | 'tel' | 'email';
  autoComplete: string;
  inputMode?: 'text' | 'numeric' | 'tel' | 'email';
  placeholder: string;
  required: boolean; // la clínica decide cuáles son obligatorios
  pattern?: RegExp; // formato provisional, a confirmar
  requiredMsg: string;
  invalidMsg: string;
}

export const FIELDS: Record<keyof Patient, FieldConfig> = {
  fullName: { label: 'Nombre completo', type: 'text', autoComplete: 'name', placeholder: 'Nombre de prueba', required: true, pattern: /^.{5,}$/, requiredMsg: 'Escribe tu nombre completo.', invalidMsg: 'Escribe nombre y apellido.' },
  phone: { label: 'Teléfono', type: 'tel', autoComplete: 'tel', inputMode: 'tel', placeholder: '3000000000', required: true, pattern: /^(\+?57)?\s?3\d{9}$/, requiredMsg: 'Escribe tu número de teléfono.', invalidMsg: 'Escribe un celular de 10 dígitos que empiece por 3.' },
  documentId: { label: 'Número de identificación', type: 'text', autoComplete: 'off', inputMode: 'numeric', placeholder: '1000000000', required: true, pattern: /^\d{5,12}$/, requiredMsg: 'Escribe tu número de identificación.', invalidMsg: 'Usa solo números, entre 5 y 12 dígitos.' },
  email: { label: 'Correo electrónico', type: 'email', autoComplete: 'email', inputMode: 'email', placeholder: 'prueba@ejemplo.com', required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, requiredMsg: 'Escribe tu correo electrónico.', invalidMsg: 'Revisa el correo: parece incompleto.' },
};

export const CONSENT_REQUIRED = true;
export const CONSENT_TEXT =
  '[TEXTO PROVISIONAL] Autorizo el tratamiento de mis datos personales para gestionar esta cita. El texto legal definitivo debe ser redactado y validado por la clínica.';
