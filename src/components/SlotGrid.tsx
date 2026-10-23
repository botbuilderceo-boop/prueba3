import type { Slot } from '../types';
import { timeLabel } from '../utils/dates';

interface Props {
  slots: Slot[];
  loading: boolean;
  error: boolean;
  selected: string | null;
  onSelect: (slot: Slot) => void;
  onRetry: () => void;
}

export default function SlotGrid({ slots, loading, error, selected, onSelect, onRetry }: Props) {
  if (loading) {
    return <div className="slots" aria-busy="true" aria-label="Consultando horarios">{Array.from({ length: 8 }, (_, i) => <span key={i} className="slot skeleton" />)}</div>;
  }
  if (error) {
    return <p className="note err" role="alert">No pudimos consultar los horarios. <button className="link" onClick={onRetry}>Reintentar</button></p>;
  }
  if (!slots.some((s) => s.status === 'available')) {
    return <p className="note">No hay horarios disponibles este día. Elige otra fecha.</p>;
  }
  return (
    <>
      <div className="slots" role="group" aria-label="Horarios">
        {slots.map((s) => (
          <button key={s.start} className={`slot ${s.status} ${s.start === selected ? 'sel' : ''}`}
            disabled={s.status !== 'available'} aria-pressed={s.start === selected} onClick={() => onSelect(s)}>
            {timeLabel(s.start)}
          </button>
        ))}
      </div>
      <p className="legend"><i className="k ok" />Disponible <i className="k sel" />Seleccionado <i className="k busy" />Ocupado</p>
    </>
  );
}
