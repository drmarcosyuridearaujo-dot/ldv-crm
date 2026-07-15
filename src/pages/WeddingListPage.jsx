import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MOCK_WEDDINGS } from '../data/mockData';
import WeddingCalendarView from '../components/WeddingCalendarView';

function fmt(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('pt-PT', {
    day: '2-digit', month: 'long', year: 'numeric'
  });
}

function daysUntil(dateStr) {
  const d = new Date(dateStr) - new Date();
  const days = Math.ceil(d / 86400000);
  if (days < 0) return 'Realizado';
  if (days === 0) return 'Hoje!';
  return `em ${days} dias`;
}

function statusColor(days) {
  if (days < 0) return 'dot-gray';
  if (days < 30) return 'dot-red';
  if (days < 90) return 'dot-yellow';
  return 'dot-green';
}

function PackageBadge({ pkg }) {
  const map = { experience: { label: 'Experience', cls: 'badge-gold' }, classic: { label: 'Classic', cls: 'badge-blue' } };
  const { label, cls } = map[pkg] || { label: pkg, cls: 'badge-gray' };
  return <span className={`badge ${cls}`}>{label}</span>;
}

export default function WeddingListPage({ defaultView = 'list' }) {
  const navigate = useNavigate();
  const [view, setView] = useState(defaultView);
  const [search, setSearch] = useState('');

  const filtered = search.trim()
    ? MOCK_WEDDINGS.filter(w =>
        `${w.bride} ${w.groom} ${w.surname}`.toLowerCase().includes(search.trim().toLowerCase()))
    : MOCK_WEDDINGS;

  return (
    <div className="page-content">
      <div className="page-heading">
        <div>
          <div className="page-title">Casamentos</div>
          <div className="page-sub">{MOCK_WEDDINGS.length} eventos ativos</div>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <input
            className="input"
            style={{ width: 220 }}
            placeholder="Pesquisar casal..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <div style={{ display: 'flex', border: '1px solid var(--border2)', borderRadius: 6, overflow: 'hidden' }}>
            <button
              className="btn btn-sm"
              style={{ borderRadius: 0, background: view === 'list' ? 'var(--text)' : 'transparent', color: view === 'list' ? '#fff' : 'var(--text2)' }}
              onClick={() => setView('list')}
              title="Ver lista"
            >
              ☰ Lista
            </button>
            <button
              className="btn btn-sm"
              style={{ borderRadius: 0, background: view === 'calendar' ? 'var(--text)' : 'transparent', color: view === 'calendar' ? '#fff' : 'var(--text2)', borderLeft: '1px solid var(--border2)' }}
              onClick={() => setView('calendar')}
              title="Ver calendário"
            >
              📅 Calendário
            </button>
          </div>
        </div>
      </div>

      {view === 'calendar' ? (
        <WeddingCalendarView weddings={filtered} />
      ) : (
      <div className="grid-2" style={{ gap: 16 }}>
        {filtered.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'var(--text3)', padding: 24, fontStyle: 'italic' }}>
            Nenhum casamento encontrado.
          </div>
        )}
        {filtered.map(w => {
          const pct = Math.round((w.tasks_done / w.tasks_total) * 100);
          const days = Math.ceil((new Date(w.date) - new Date()) / 86400000);
          return (
            <div key={w.id} className="wedding-card" onClick={() => navigate(`/wedding/${w.id}`)}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                <div>
                  <div className="wedding-card-names">{w.bride} & {w.groom} {w.surname}</div>
                  <div className="wedding-card-date" style={{ marginTop: 4 }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                    {fmt(w.date)} · <span style={{ color: days < 30 ? 'var(--error)' : 'inherit' }}>{daysUntil(w.date)}</span>
                  </div>
                </div>
                <PackageBadge pkg={w.package} />
              </div>

              <div className="wedding-card-meta">
                <span className="badge badge-gray">
                  👥 {w.guests_adult + w.guests_child_4_9} convidados
                </span>
                <span className="badge badge-gray">
                  🏛 {w.venue}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span className={`status-dot ${statusColor(days)}`} />
                  <span style={{ fontSize: 12, color: 'var(--text3)' }}>Deal: {w.deal_id}</span>
                </span>
              </div>

              <div className="wedding-card-progress">
                <div className="wedding-card-progress-text">
                  <span>Progresso de tarefas</span>
                  <span>{w.tasks_done}/{w.tasks_total} ({pct}%)</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${pct}%` }} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--text3)' }}>
                <span>👤 {w.planner}</span>
                <span>🍽 {w.catering_planner}</span>
                <span>🌸 {w.decor_planner}</span>
              </div>
            </div>
          );
        })}
      </div>
      )}
    </div>
  );
}
