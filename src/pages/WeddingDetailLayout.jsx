import { useRef, useState } from 'react';
import { Outlet, NavLink, useParams } from 'react-router-dom';
import { MOCK_WEDDINGS } from '../data/mockData';
import { useToast } from '../context/ToastContext';

const ALL_TABS = [
  { id: 'overview',  label: 'Visão Geral',       icon: '📊' },
  { id: 'timeline',  label: 'Timeline & Ementa',  icon: '⏱️' },
  { id: 'financial', label: 'Financeiro',         icon: '💰' },
  { id: 'seating',   label: 'Mesas e Convidados', icon: '🪑' },
  { id: 'decor',     label: 'Decoração',          icon: '🌿' },
  { id: 'contacts',  label: 'Fornecedores',       icon: '📞' },
  { id: 'journey',   label: 'Journey',            icon: '🗺️' },
  { id: 'intake',    label: 'Intake',             icon: '📝' },
  { id: 'actions',   label: 'Ação',               icon: '✅' },
];

const PACKAGE_BADGE = {
  experience: { label: 'Experience', cls: 'badge-gold' },
  classic: { label: 'Classic', cls: 'badge-blue' },
};

function CouplePhoto({ wedding }) {
  const STORAGE_KEY = `ldv-couple-photo-${wedding.id}`;
  const [photo, setPhoto] = useState(() => localStorage.getItem(STORAGE_KEY));
  const [hover, setHover] = useState(false);
  const fileInputRef = useRef(null);
  const toast = useToast();

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      setPhoto(dataUrl);
      localStorage.setItem(STORAGE_KEY, dataUrl);
      toast('Foto do casal atualizada', 'success');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const removePhoto = (e) => {
    e.stopPropagation();
    setPhoto(null);
    localStorage.removeItem(STORAGE_KEY);
    toast('Foto do casal removida');
  };

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={() => fileInputRef.current?.click()}
      style={{ position: 'relative', width: 64, height: 64, flexShrink: 0, cursor: 'pointer' }}
      title={photo ? 'Trocar foto do casal' : 'Adicionar foto do casal'}
    >
      {photo ? (
        <img
          src={photo}
          alt={`${wedding.bride} & ${wedding.groom}`}
          style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--gold-border)', display: 'block' }}
        />
      ) : (
        <div className="ldv-avatar-sm" style={{ width: 64, height: 64, fontSize: 20 }}>
          {wedding.bride[0]}{wedding.groom[0]}
        </div>
      )}

      {hover && (
        <div style={{
          position: 'absolute', inset: 0, borderRadius: '50%',
          background: 'rgba(0,0,0,.5)', color: '#fff', fontSize: 16,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          📷
        </div>
      )}

      {photo && hover && (
        <button
          onClick={removePhoto}
          title="Remover foto"
          style={{
            position: 'absolute', top: -4, right: -4, width: 18, height: 18,
            borderRadius: '50%', background: 'var(--error)', color: '#fff', fontSize: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '2px solid var(--surface)', cursor: 'pointer',
          }}
        >
          ✕
        </button>
      )}

      <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
    </div>
  );
}

function WeddingHeaderBanner({ wedding }) {
  const pct = Math.round((wedding.tasks_done / wedding.tasks_total) * 100);
  const pkg = PACKAGE_BADGE[wedding.package] || { label: wedding.package, cls: 'badge-gray' };
  const dateFmt = new Date(wedding.date).toLocaleDateString('pt-PT', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <div className="card" style={{ padding: 20, marginTop: 12, display: 'flex', gap: 20, alignItems: 'center' }}>
      <CouplePhoto key={wedding.id} wedding={wedding} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <div style={{ fontSize: 19, fontWeight: 700, color: 'var(--text)' }}>
            {wedding.bride} & {wedding.groom} {wedding.surname}
          </div>
          <span className={`badge ${pkg.cls}`}>{pkg.label}</span>
        </div>
        <div style={{ display: 'flex', gap: 16, marginTop: 6, fontSize: 13, color: 'var(--text2)', flexWrap: 'wrap' }}>
          <span>📅 {dateFmt}</span>
          <span>🏛 {wedding.venue}</span>
        </div>
        <div style={{ marginTop: 12, maxWidth: 340 }}>
          <div className="wedding-card-progress-text">
            <span>Progresso de tarefas</span>
            <span>{wedding.tasks_done}/{wedding.tasks_total} tarefas ({pct}%)</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${pct}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}

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
      <WeddingHeaderBanner wedding={wedding} />

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
