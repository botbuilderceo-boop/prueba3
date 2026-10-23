import { dayKey, daysInMonth, firstWeekday, longDate, monthLabel, monthOf } from '../utils/dates';

interface Props {
  month: string;
  today: string;
  selected: string | null;
  days: Record<string, boolean>;
  loading: boolean;
  onSelect: (date: string) => void;
  onMonth: (delta: number) => void;
}

const WEEK = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

export default function Calendar({ month, today, selected, days, loading, onSelect, onMonth }: Props) {
  const blanks = firstWeekday(month);
  const total = daysInMonth(month);
  return (
    <div className="cal" aria-busy={loading}>
      <div className="cal-head">
        <button className="icon" aria-label="Mes anterior" disabled={month <= monthOf(today)} onClick={() => onMonth(-1)}>‹</button>
        <strong aria-live="polite">{monthLabel(month)}</strong>
        <button className="icon" aria-label="Mes siguiente" onClick={() => onMonth(1)}>›</button>
      </div>
      <div className="cal-grid">
        {WEEK.map((w, i) => <span key={i} className="cal-wd" aria-hidden="true">{w}</span>)}
        {Array.from({ length: blanks }, (_, i) => <span key={`b${i}`} />)}
        {Array.from({ length: total }, (_, i) => {
          const date = dayKey(month, i + 1);
          const open = !!days[date] && date >= today;
          const cls = ['day', open ? 'open' : '', date === selected ? 'sel' : '', date === today ? 'today' : ''].join(' ');
          return (
            <button key={date} className={cls} disabled={loading || !open} aria-pressed={date === selected}
              aria-label={`${longDate(date)}${open ? '' : ', sin horarios'}`} onClick={() => onSelect(date)}>
              {i + 1}
            </button>
          );
        })}
      </div>
    </div>
  );
}
