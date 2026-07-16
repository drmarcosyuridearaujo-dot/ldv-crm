import { useParams } from 'react-router-dom';
import { MOCK_WEDDINGS, MOCK_TIMELINE_GERAL, MOCK_CATERING_TIMELINE } from '../../data/mockData';

// Réplica das páginas públicas "/timeline/:dealId" e "/catering-timeline/:dealId" do
// original — sem login, protegidas por um token no fragmento do link (#token),
// tal como o hash de segurança usado em "/seating-plan/:dealId".
const COLUMN_META = {
  geral: {
    subtitle: 'Timeline Geral',
    data: MOCK_TIMELINE_GERAL,
    emptyMessage: 'Nenhuma timeline definida.',
    notPublished: 'Esta timeline ainda não foi publicada pela equipa.',
  },
  catering: {
    subtitle: 'Timeline Catering',
    data: MOCK_CATERING_TIMELINE,
    emptyMessage: 'A timeline do catering ainda não foi publicada.',
    notPublished: 'A timeline do catering ainda não foi publicada.',
  },
};

function CenteredMessage({ title, subtitle }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, color: 'var(--text3)', textAlign: 'center', padding: 20 }}>
      <p style={{ fontSize: 17 }}>{title}</p>
      {subtitle && <p style={{ fontSize: 13 }}>{subtitle}</p>}
    </div>
  );
}

export default function PublicTimeline() {
  const { id, column } = useParams();
  const wedding = MOCK_WEDDINGS.find(w => w.id === id);
  const meta = COLUMN_META[column];
  const token = typeof window !== 'undefined' ? window.location.hash.slice(1) : '';

  if (!wedding || !meta || !wedding.share_token || token !== wedding.share_token) {
    return <CenteredMessage title="Timeline indisponível" subtitle="O link pode estar expirado ou ser inválido." />;
  }

  const publishState = wedding.timeline_publish_state?.[column];
  if (!publishState?.published) {
    return <CenteredMessage title={meta.subtitle} subtitle={meta.notPublished} />;
  }

  const entries = (meta.data || []).filter(e => e.visible_to_vendors !== false);
  const guestCount = wedding.guests_adult + wedding.guests_child_4_9 + wedding.guests_child_0_3;

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '48px 24px', minHeight: '100vh' }}>
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>{wedding.bride} & {wedding.groom}</h1>
        <p style={{ fontSize: 16, color: 'var(--text3)', marginTop: 4 }}>{meta.subtitle}</p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: 8, fontSize: 13, color: 'var(--text3)' }}>
          <span>{new Date(wedding.date).toLocaleDateString('pt-PT', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
          <span>·</span>
          <span>{wedding.venue}</span>
          <span>·</span>
          <span>{guestCount} convidados</span>
        </div>
      </div>

      {entries.length === 0 ? (
        <p style={{ textAlign: 'center', color: 'var(--text3)' }}>{meta.emptyMessage}</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {entries.map(e => (
            <div key={e.id} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
              <span style={{ fontFamily: 'monospace', fontSize: 17, fontWeight: 700, minWidth: 56, flexShrink: 0 }}>{e.time}</span>
              <div>
                <div style={{ fontWeight: 500 }}>{e.label}</div>
                {e.local && <div style={{ fontSize: 13, color: 'var(--text3)', marginTop: 2 }}>📍 {e.local}</div>}
                {e.notes && <div style={{ fontSize: 13, color: 'var(--text3)', marginTop: 2 }}>{e.notes}</div>}
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ textAlign: 'center', marginTop: 40 }} className="print-hide">
        <button className="btn btn-outline" onClick={() => window.print()}>🖨️ Imprimir</button>
      </div>

      <style>{`
        @media print {
          .print-hide { display: none !important; }
          @page { margin: 1.5cm; }
        }
      `}</style>
    </div>
  );
}
