import { useOutletContext } from 'react-router-dom';
import { MOCK_DECOR } from '../../data/mockData';

function Section({ icon, title, children }) {
  return (
    <div className="card" style={{ marginBottom: 0 }}>
      <div className="card-header">
        <div className="card-title" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span>{icon}</span> {title}
        </div>
      </div>
      <div className="card-body" style={{ padding: '8px 20px' }}>{children}</div>
    </div>
  );
}

function Row({ label, value }) {
  if (!value) return null;
  return (
    <div className="info-row">
      <div className="info-label" style={{ width: 200, flexShrink: 0 }}>{label}</div>
      <div className="info-value" style={{ flex: 1 }}>{value}</div>
    </div>
  );
}

function DetailCard({ title, data }) {
  if (!data) return null;
  return (
    <div style={{
      background: 'var(--bg)',
      border: '1px solid var(--border)',
      borderRadius: 8,
      padding: 14,
      marginTop: 10,
    }}>
      <div style={{ fontWeight: 600, fontSize: 12, color: 'var(--text2)', marginBottom: 10 }}>{title}</div>
      {Object.entries(data).filter(([, v]) => v).map(([k, v]) => (
        <div key={k} style={{ fontSize: 12, display: 'flex', gap: 8, marginBottom: 6, lineHeight: 1.5 }}>
          <span style={{ color: 'var(--text3)', width: 70, flexShrink: 0, textTransform: 'capitalize' }}>
            {k === 'centro' ? 'Centro' : k === 'velas' ? 'Velas' : k === 'extras' ? 'Extras' : k}:
          </span>
          <span style={{ color: 'var(--text)' }}>{v}</span>
        </div>
      ))}
    </div>
  );
}

export default function WeddingDecor() {
  const { wedding } = useOutletContext();
  const decor = MOCK_DECOR;

  return (
    <div style={{ maxWidth: 800, display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Badge do pacote e Print */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 style={{ fontSize: 18, fontWeight: 600 }}>Plano de Decoração</h2>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <a href={`/wedding/${wedding.id}/decor/print`} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm">
            🖨️ Imprimir
          </a>
          <span className={`badge ${decor.package === 'experience' ? 'badge-gold' : 'badge-blue'}`} style={{ fontSize: 13, padding: '5px 12px' }}>
            {decor.package === 'experience' ? '✨ Experience' : '⭐ Classic'}
          </span>
        </div>
      </div>

      {/* Marcação de mesa */}
      <Section icon="🪑" title="Marcação de Mesa">
        <Row label="Marcação" value={decor.marcacao_mesa} />
      </Section>

      {/* Mesas de convidados */}
      <Section icon="🌿" title="Mesas de Convidados">
        <Row label="Redondas" value={decor.mesas_convidados_redondas} />
        <Row label="Retangulares" value={decor.mesas_convidados_retangulares} />
        <Row label="Serpente/Quadrada" value={decor.mesas_convidados_serpente_quadrada} />
        <DetailCard title="Composição Mesa Redonda" data={decor.mesa_redonda} />
        <DetailCard title="Composição Mesa Retangular" data={decor.mesa_retangular} />
        <DetailCard title="Composição Mesa Serpente" data={decor.mesa_serpente_quadrada} />
      </Section>

      {/* Mesa dos noivos */}
      <Section icon="💍" title="Mesa dos Noivos">
        <Row label="Tipo escolhido" value={decor.mesa_noivos_escolhida} />
        <Row label="Configuração" value={decor.mesa_noivos} />
        <Row label="N.º pax mesa noivos" value={decor.nr_pax_mesa_noivos} />
        <Row label="Composição floral" value={decor.mesa_noivos_floral} />
      </Section>

      {/* Cerimónia */}
      <Section icon="💒" title="Cerimónia">
        <Row label="Altar" value={decor.cerimonia_altar} />
        <Row label="Corredor" value={decor.cerimonia_corredor} />
        <Row label="Chuva de amor" value={decor.cerimonia_chuva_amor} />
      </Section>

      {/* Momentos especiais */}
      <Section icon="✨" title="Momentos Especiais">
        {decor.package === 'experience' && (
          <Row label="Suspensão" value={decor.suspensao} />
        )}
        <Row label="Corte do bolo" value={decor.corte_bolo} />
        <Row label="Bouquets / Boutonnières" value={decor.bouquets_boutonnieres} />
      </Section>

      {/* Outros */}
      {decor.outros && (
        <Section icon="📋" title="Outros Elementos">
          <Row label="Sinalética & Extras" value={decor.outros} />
        </Section>
      )}
    </div>
  );
}
