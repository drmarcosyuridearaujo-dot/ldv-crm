import { Outlet, NavLink, useParams } from 'react-router-dom';
import { MOCK_WEDDINGS } from '../data/mockData';

const ALL_TABS = [
  { id: 'overview',  label: 'Visão Geral',       icon: '📊' },
  { id: 'timeline',  label: 'Timeline & Ementa',  icon: '⏱️' },
  { id: 'financial', label: 'Financeiro',         icon: '💰' },
  { id: 'seating',   label: 'Mesas e Convidados', icon: '🪑' },
  { id: 'decor',     label: 'Decoração',          icon: '🌿' },
  { id: 'contacts',  label: 'Fornecedores',       icon: '📞' },
  { id: 'journey',   label: 'Journey',            icon: '🗺️' },
];

export default function WeddingDetailLayout({ role, allowedTabs }) {
  const { id } = useParams();
  const wedding = MOCK_WEDDINGS.find(w => w.id === id);

  if (!wedding) {
    return <div style={{ padding: 40, textAlign: 'center' }}>Casamento não encontrado.</div>;
  }

  // Filter tabs based on role permissions
  const visibleTabs = ALL_TABS.filter(t => (allowedTabs || []).includes(t.id));

  return (
    <div style={{ padding: '0 32px 40px' }}>
      {/* Secondary Nav */}
      <div className="ldv-tabs" style={{ marginBottom: 24, marginTop: 12 }}>
        {visibleTabs.map(t => (
          <NavLink
            key={t.id}
            to={`/wedding/${id}/${t.id}`}
            className={({ isActive }) => `ldv-tab ${isActive ? 'active' : ''}`}
          >
            <span style={{ fontSize: 16 }}>{t.icon}</span> {t.label}
          </NavLink>
        ))}
      </div>

      <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-lg)', minHeight: 600, padding: 32, boxShadow: 'var(--shadow)' }}>
        <Outlet context={{ wedding, role }} />
      </div>
    </div>
  );
}
