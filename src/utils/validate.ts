import { CONSENT_REQUIRED, FIELDS } from '../config/clinic';
import type { Patient } from '../types';

export type Errors = Partial<Record<keyof Patient | 'consent', string>>;

/** Validación solo para guiar al usuario. El servidor debe validar todo de nuevo (Fase 3). */
export function validate(values: Patient, consent: boolean): Errors {
  const errors: Errors = {};
  (Object.keys(FIELDS) as (keyof Patient)[]).forEach((key) => {
    const f = FIELDS[key];
    const v = values[key].trim();
    if (!v) { if (f.required) errors[key] = f.requiredMsg; }
    else if (f.pattern && !f.pattern.test(v)) errors[key] = f.invalidMsg;
  });
  if (CONSENT_REQUIRED && !consent) errors.consent = 'Debes autorizar el tratamiento de datos para continuar.';
  return errors;
}
