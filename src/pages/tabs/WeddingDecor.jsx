import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { MOCK_DECOR } from '../../data/mockData';

const CATEGORY_META = {
  bases: { icon: '🔘', label: 'Bases' },
  candeeiros: { icon: '💡', label: 'Candeeiros' },
  casticais: { icon: '🕯️', label: 'Castiçais' },
  campanulas: { icon: '🔔', label: 'Campânulas' },
  tealights: { icon: '✨', label: 'Tealights' },
  jarrinhas: { icon: '🏺', label: 'Jarrinhas' },
  tabuleiros: { icon: '🍽️', label: 'Tabuleiros' },
  outros: { icon: '📦', label: 'Outros' },
};

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

function CategoryCard({ icon, label, total, activeCount, active, onClick }) {
  return (
    <div
      className="card"
      onClick={onClick}
      style={{
        padding: '14px 12px',
        cursor: 'pointer',
        textAlign: 'center',
        borderColor: active ? 'var(--gold)' : 'var(--border)',
        background: active ? 'var(--gold-bg)' : 'var(--surface)',
        transition: 'border-color .15s, background .15s',
      }}
    >
      <div style={{ fontSize: 22, marginBottom: 4 }}>{icon}</div>
      <div style={{ fontSize: 12, fontWeight: 600, color: active ? 'var(--gold)' : 'var(--text)' }}>{label}</div>
      <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>{total} itens</div>
      {activeCount > 0 && (
        <span className="badge badge-green" style={{ marginTop: 6, display: 'inline-block' }}>{activeCount} em uso</span>
      )}
    </div>
  );
}

function ItemRow({ item, onDelta, onSetQty, onObs }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '10px 14px', border: '1px solid var(--border)', borderRadius: 8, background: item.qty > 0 ? 'var(--success-bg)' : 'var(--surface)' }}>
      <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{item.nome}</span>
        {item.qty > 0 && <span className="badge badge-green">{item.qty}</span>}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
        <button className="btn btn-outline btn-xs" onClick={() => onDelta(-1)}>−</button>
        <input
          type="number"
          min="0"
          className="input"
          style={{ width: 52, textAlign: 'center', padding: '5px 4px' }}
          value={item.qty}
          onChange={e => onSetQty(Math.max(0, Number(e.target.value) || 0))}
        />
        <button className="btn btn-outline btn-xs" onClick={() => onDelta(1)}>+</button>
      </div>

      <input
        className="input"
        placeholder="Observações..."
        style={{ width: 220, flexShrink: 0 }}
        value={item.obs}
        onChange={e => onObs(e.target.value)}
      />
    </div>
  );
}

export default function WeddingDecor() {
  const { wedding } = useOutletContext();
  const decor = MOCK_DECOR;
  const coupleName = `${wedding.bride} & ${wedding.groom}`;

  const categories = Object.keys(decor.items);
  const [items, setItems] = useState(() => {
    const clone = {};
    for (const cat of categories) clone[cat] = decor.items[cat].map(it => ({ ...it }));
    return clone;
  });
  const [activeCat, setActiveCat] = useState(categories[0]);

  const changeQty = (cat, idx, delta) => {
    setItems(prev => {
      const list = [...prev[cat]];
      list[idx] = { ...list[idx], qty: Math.max(0, list[idx].qty + delta) };
      return { ...prev, [cat]: list };
    });
  };
  const setQty = (cat, idx, value) => {
    setItems(prev => {
      const list = [...prev[cat]];
      list[idx] = { ...list[idx], qty: Math.max(0, value) };
      return { ...prev, [cat]: list };
    });
  };
  const setObs = (cat, idx, value) => {
    setItems(prev => {
      const list = [...prev[cat]];
      list[idx] = { ...list[idx], obs: value };
      return { ...prev, [cat]: list };
    });
  };

  const activeMeta = CATEGORY_META[activeCat] || { icon: '📦', label: activeCat };
  const activeList = items[activeCat];
  const activeUsedCount = activeList.filter(it => it.qty > 0).length;

  return (
    <div style={{ maxWidth: 900, display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Título dinâmico + ações */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 600 }}>Decoração de Mesa — {coupleName}</h2>
          <div style={{ fontSize: 13, color: 'var(--text3)', marginTop: 2 }}>Inventário e plano de decoração</div>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <span className={`badge ${decor.package === 'experience' ? 'badge-gold' : 'badge-blue'}`} style={{ fontSize: 13, padding: '5px 12px' }}>
            {decor.package === 'experience' ? '✨ Experience' : '⭐ Classic'}
          </span>
          <a href={`/wedding/${wedding.id}/decor-items/print`} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm">
            🖨️ Imprimir Lista
          </a>
          <a href={`/wedding/${wedding.id}/decor/print`} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm">
            🖨️ Imprimir Plano
          </a>
        </div>
      </div>

      {/* Grid de categorias */}
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text2)', marginBottom: 10 }}>📦 Inventário de Decoração</div>
        <div className="grid-4">
          {categories.map(cat => {
            const meta = CATEGORY_META[cat] || { icon: '📦', label: cat };
            const list = items[cat];
            const activeCount = list.filter(it => it.qty > 0).length;
            return (
              <CategoryCard
                key={cat}
                icon={meta.icon}
                label={meta.label}
                total={list.length}
                activeCount={activeCount}
                active={activeCat === cat}
                onClick={() => setActiveCat(cat)}
              />
            );
          })}
        </div>
      </div>

      {/* Lista de itens da categoria selecionada */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">{activeMeta.icon} {activeMeta.label}</div>
          <div className="card-sub">{activeUsedCount} de {activeList.length} itens em uso</div>
        </div>
        <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {activeList.map((item, idx) => (
            <ItemRow
              key={item.nome}
              item={item}
              onDelta={d => changeQty(activeCat, idx, d)}
              onSetQty={v => setQty(activeCat, idx, v)}
              onObs={v => setObs(activeCat, idx, v)}
            />
          ))}
        </div>
      </div>

      {/* ── Plano de Decoração ── */}
      <div style={{ borderTop: '1px solid var(--border)', paddingTop: 20, display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text2)' }}>📖 Plano de Decoração</div>

        <Section icon="🪑" title="Marcação de Mesa">
          <Row label="Marcação" value={decor.marcacao_mesa} />
        </Section>

        <Section icon="🌿" title="Mesas de Convidados">
          <Row label="Redondas" value={decor.mesas_convidados_redondas} />
          <Row label="Retangulares" value={decor.mesas_convidados_retangulares} />
          <Row label="Serpente/Quadrada" value={decor.mesas_convidados_serpente_quadrada} />
          <DetailCard title="Composição Mesa Redonda" data={decor.mesa_redonda} />
          <DetailCard title="Composição Mesa Retangular" data={decor.mesa_retangular} />
          <DetailCard title="Composição Mesa Serpente" data={decor.mesa_serpente_quadrada} />
        </Section>

        <Section icon="💍" title="Mesa dos Noivos">
          <Row label="Tipo escolhido" value={decor.mesa_noivos_escolhida} />
          <Row label="Configuração" value={decor.mesa_noivos} />
          <Row label="N.º pax mesa noivos" value={decor.nr_pax_mesa_noivos} />
          <Row label="Composição floral" value={decor.mesa_noivos_floral} />
        </Section>

        <Section icon="💒" title="Cerimónia">
          <Row label="Altar" value={decor.cerimonia_altar} />
          <Row label="Corredor" value={decor.cerimonia_corredor} />
          <Row label="Chuva de amor" value={decor.cerimonia_chuva_amor} />
        </Section>

        <Section icon="✨" title="Momentos Especiais">
          {decor.package === 'experience' && (
            <Row label="Suspensão" value={decor.suspensao} />
          )}
          <Row label="Corte do bolo" value={decor.corte_bolo} />
          <Row label="Bouquets / Boutonnières" value={decor.bouquets_boutonnieres} />
        </Section>

        {decor.outros && (
          <Section icon="📋" title="Outros Elementos">
            <Row label="Sinalética & Extras" value={decor.outros} />
          </Section>
        )}
      </div>
    </div>
  );
}
