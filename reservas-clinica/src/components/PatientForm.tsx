import { CONSENT_REQUIRED, CONSENT_TEXT, FIELDS } from '../config/clinic';
import type { Patient } from '../types';
import type { Errors } from '../utils/validate';

interface Props {
  values: Patient;
  errors: Errors;
  consent: boolean;
  onChange: (key: keyof Patient, value: string) => void;
  onConsent: (v: boolean) => void;
}

export default function PatientForm({ values, errors, consent, onChange, onConsent }: Props) {
  return (
    <div className="form">
      {(Object.keys(FIELDS) as (keyof Patient)[]).map((key) => {
        const f = FIELDS[key];
        return (
          <div className="field" key={key}>
            <label htmlFor={key}>{f.label}{f.required ? '' : ' (opcional)'}</label>
            <input id={key} name={key} type={f.type} autoComplete={f.autoComplete} inputMode={f.inputMode}
              placeholder={f.placeholder} value={values[key]} aria-invalid={!!errors[key]}
              aria-describedby={errors[key] ? `${key}-e` : undefined} onChange={(e) => onChange(key, e.target.value)} />
            {errors[key] && <p className="error" id={`${key}-e`} role="alert">{errors[key]}</p>}
          </div>
        );
      })}
      {CONSENT_REQUIRED && (
        <div className="field">
          <label className="check">
            <input type="checkbox" checked={consent} aria-invalid={!!errors.consent} onChange={(e) => onConsent(e.target.checked)} />
            <span>{CONSENT_TEXT}</span>
          </label>
          {errors.consent && <p className="error" role="alert">{errors.consent}</p>}
        </div>
      )}
    </div>
  );
}
