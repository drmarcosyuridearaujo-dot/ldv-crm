import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Réplica fiel do calendário mensal do dashboard original (função `rP` do main.js):
// semana começa à Segunda, dias fora do mês esbatidos, "hoje" com badge, eventos
// como pills clicáveis por dia.
const WEEKDAYS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

function startOfMonth(d) { return new Date(d.getFullYear(), d.getMonth(), 1); }
function daysInMonth(year, month) { return new Date(year, month + 1, 0).getDate(); }
function mondayIndex(d) { return (d.getDay() + 6) % 7; }
function isoDate(d) {
  const y = d.getFullYear(), m = String(d.getMonth() + 1).padStart(2, '0'), dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}
function groupByDate(weddings) {
  const map = new Map();
  for (const w of weddings) {
    if (!w.date) continue;
    const key = w.date.slice(0, 10);
    const arr = map.get(key);
    arr ? arr.push(w) : map.set(key, [w]);
  }
  return map;
}
function monthLabel(d) {
  const label = d.toLocaleDateString('pt-PT', { month: 'long', year: 'numeric' });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export default function WeddingCalendarView({ weddings }) {
  const navigate = useNavigate();
  const today = new Date();
  const [cursor, setCursor] = useState(startOfMonth(today));

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const totalDays = daysInMonth(year, month);
  const leading = mondayIndex(new Date(year, month, 1));
  const prevMonthDays = daysInMonth(year, month - 1 < 0 ? 11 : month - 1);
  const byDate = groupByDate(weddings);
  const todayKey = isoDate(today);

  const cells = [];
  for (let k = leading - 1; k >= 0; k--) {
    const day = prevMonthDays - k;
    const m = month - 1 < 0 ? 11 : month - 1;
    const y = month - 1 < 0 ? year - 1 : year;
    cells.push({ day, key: isoDate(new Date(y, m, day)), inMonth: false });
  }
  for (let day = 1; day <= totalDays; day++) {
    cells.push({ day, key: isoDate(new Date(year, month, day)), inMonth: true });
  }
  const trailing = 7 - (cells.length % 7);
  if (trailing < 7) {
    for (let day = 1; day <= trailing; day++) {
      const m = month + 1 > 11 ? 0 : month + 1;
      const y = month + 1 > 11 ? year + 1 : year;
      cells.push({ day, key: isoDate(new Date(y, m, day)), inMonth: false });
    }
  }

  const hasEventsThisMonth = weddings.some(w => w.date && new Date(w.date).getFullYear() === year && new Date(w.date).getMonth() === month);

  const goPrev = () => setCursor(new Date(year, month - 1, 1));
  const goNext = () => setCursor(new Date(year, month + 1, 1));
  const goToday = () => setCursor(startOfMonth(today));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button className="btn btn-outline btn-sm" onClick={goPrev} aria-label="Mês anterior">‹</button>
          <h2 style={{ fontSize: 16, fontWeight: 600, minWidth: 180, textAlign: 'center' }}>{monthLabel(cursor)}</h2>
          <button className="btn btn-outline btn-sm" onClick={goNext} aria-label="Mês seguinte">›</button>
        </div>
        <button className="btn btn-outline btn-sm" onClick={goToday}>Hoje</button>
      </div>

      <div style={{ border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', background: 'var(--bg)' }}>
          {WEEKDAYS.map(wd => (
            <div key={wd} style={{ padding: '8px 0', textAlign: 'center', fontSize: 11, fontWeight: 600, color: 'var(--text3)' }}>
              {wd}
            </div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
          {cells.map((cell, i) => {
            const events = byDate.get(cell.key) || [];
            const isToday = cell.key === todayKey;
            return (
              <div
                key={i}
                style={{
                  minHeight: 100, padding: 6,
                  borderTop: '1px solid var(--border)',
                  borderLeft: i % 7 === 0 ? 'none' : '1px solid var(--border)',
                  background: cell.inMonth ? 'var(--surface)' : 'var(--bg)',
                }}
              >
                <div style={{
                  width: 24, height: 24, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 600, marginBottom: 4,
                  background: isToday ? 'var(--gold)' : 'transparent',
                  color: isToday ? '#fff' : cell.inMonth ? 'var(--text)' : 'var(--text3)',
                }}>
                  {cell.day}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {events.map(w => (
                    <span
                      key={w.id}
                      onClick={() => navigate(`/wedding/${w.id}`)}
                      className={`badge ${w.package === 'experience' ? 'badge-gold' : 'badge-blue'}`}
                      style={{ fontSize: 10, padding: '1px 6px', cursor: 'pointer', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}
                      title={`${w.bride} & ${w.groom}`}
                    >
                      {w.bride} & {w.groom}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {!hasEventsThisMonth && (
        <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--text3)', padding: '8px 0' }}>
          Sem casamentos agendados este mês.
        </div>
      )}
    </div>
  );
}
