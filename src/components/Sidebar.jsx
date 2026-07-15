import { NavLink } from 'react-router-dom';
import { MOCK_WEDDINGS } from '../data/mockData';

function weddingStatus(w) {
  const isPast = new Date(w.date) < new Date();
  if (w.status === 'cancelled') return { label: 'Cancelado', cls: 'badge-red' };
  if (isPast || w.status === 'completed') return { label: 'Concluído', cls: 'badge-gray' };
  return { label: 'Ativo', cls: 'badge-green' };
}

export default function Sidebar({ role }) {
  return (
    <div className="ldv-sidebar">
      <div className="sidebar-logo" style={{ borderBottom: '1px solid var(--border)', marginBottom: 8 }}>
        <div className="sidebar-logo-icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 21s-7.5-4.6-10-9.3C.3 8.1 2 4.5 5.5 4c2-.3 3.8.7 6.5 3 2.7-2.3 4.5-3.3 6.5-3 3.5.5 5.2 4.1 3.5 7.7C19.5 16.4 12 21 12 21z" />
          </svg>
        </div>
        <div>
          <div className="sidebar-logo-text">Largo da Vila</div>
          <div className="sidebar-logo-sub">CRM de Casamentos</div>
        </div>
      </div>

      <div className="ldv-sidebar-nav">
        <div className="ldv-sidebar-title">Geral</div>
        <NavLink to="/dashboard" className={({ isActive }) => `ldv-nav-item ${isActive ? 'active' : ''}`}>
          <span className="ldv-nav-icon">📊</span> Dashboard
        </NavLink>
        <NavLink to="/calendar" className={({ isActive }) => `ldv-nav-item ${isActive ? 'active' : ''}`}>
          <span className="ldv-nav-icon">📅</span> Calendário
        </NavLink>
        <NavLink to="/tasks" className={({ isActive }) => `ldv-nav-item ${isActive ? 'active' : ''}`}>
          <span className="ldv-nav-icon">✅</span> Tarefas
        </NavLink>
      </div>

      <div className="ldv-sidebar-nav" style={{ marginTop: 24 }}>
        <div className="ldv-sidebar-title">Casamentos</div>
        {MOCK_WEDDINGS.map(w => {
          const status = weddingStatus(w);
          return (
            <NavLink
              key={w.id}
              to={`/wedding/${w.id}`}
              className={({ isActive }) => `ldv-nav-item ${isActive ? 'active' : ''}`}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%' }}>
                <div className="ldv-avatar-sm">{w.bride[0]}{w.groom[0]}</div>
                <div style={{ overflow: 'hidden', flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {w.bride} & {w.groom}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text3)' }}>
                    {new Date(w.date).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short' })}
                  </div>
                </div>
                <span className={`badge ${status.cls}`} style={{ fontSize: 9, padding: '1px 6px', flexShrink: 0 }}>
                  {status.label}
                </span>
              </div>
            </NavLink>
          );
        })}
      </div>
    </div>
  );
}
