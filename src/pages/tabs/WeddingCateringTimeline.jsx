import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { MOCK_CATERING_TIMELINE, MOCK_TIMELINE_GERAL, MOCK_TIMELINE_PLANNING } from '../../data/mockData';
import { useToast } from '../../context/ToastContext';

const TIMELINE_COLUMNS = [
  { id: 'geral', label: 'Geral', icon: '🗓️' },
  { id: 'planning', label: 'Planning', icon: '🧭' },
  { id: 'catering', label: 'Catering', icon: '🍽️' },
];

function fmtPublishedAt(d) {
  if (!d) return null;
  return new Date(d).toLocaleString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function PublishBar({ state, onPublish, showCopyFromPlanning, onCopyFromPlanning }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
      <span style={{ fontSize: 11, color: state.published ? 'var(--success)' : 'var(--warn)' }}>
        {state.published ? `✅ Publicado em ${fmtPublishedAt(state.last_published_at)}` : '⚠️ Nunca publicado'}
      </span>
      {showCopyFromPlanning && (
        <button className="btn btn-outline btn-sm" onClick={onCopyFromPlanning} title="Copiar entradas da timeline Planning">
          ⧉ Copiar de Planning
        </button>
      )}
      <button className="btn btn-primary btn-sm" onClick={onPublish}>
        {state.published ? '↻ Republicar' : '📤 Publicar'}
      </button>
    </div>
  );
}

// Coluna de timeline simples (Geral / Planning) — editável, com visibilidade a fornecedores.
function SimpleTimelineColumn({ entries, onChange }) {
  const updateEntry = (idx, patch) => onChange(entries.map((e, i) => i === idx ? { ...e, ...patch } : e));
  const removeEntry = (idx) => onChange(entries.filter((_, i) => i !== idx));
  const addEntry = () => onChange([...entries, { id: `e${Date.now()}`, time: '', label: '', local: '', notes: '', visible_to_vendors: true }]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {entries.length === 0 && (
        <div style={{ fontSize: 13, color: 'var(--text3)', fontStyle: 'italic', padding: 16, textAlign: 'center' }}>
          Sem momentos nesta timeline.
        </div>
      )}
      {entries.map((e, idx) => (
        <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', border: '1px solid var(--border)', borderRadius: 8, background: 'var(--surface)', flexWrap: 'wrap' }}>
          <input className="input" style={{ width: 70, height: 32, fontSize: 12, flexShrink: 0 }} value={e.time} placeholder="HH:MM"
            onChange={ev => updateEntry(idx, { time: ev.target.value })} />
          <input className="input" style={{ flex: 1, minWidth: 160, height: 32, fontSize: 13 }} value={e.label} placeholder="Momento"
            onChange={ev => updateEntry(idx, { label: ev.target.value })} />
          <input className="input" style={{ width: 150, height: 32, fontSize: 12 }} value={e.local || ''} placeholder="Local"
            onChange={ev => updateEntry(idx, { local: ev.target.value })} />
          <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--text3)', whiteSpace: 'nowrap', flexShrink: 0 }}>
            <input type="checkbox" checked={e.visible_to_vendors !== false} onChange={ev => updateEntry(idx, { visible_to_vendors: ev.target.checked })} />
            Fornecedores
          </label>
          <button className="btn-icon" onClick={() => removeEntry(idx)}>✕</button>
        </div>
      ))}
      <button className="btn btn-outline btn-sm" style={{ alignSelf: 'flex-start' }} onClick={addEntry}>+ Adicionar Momento</button>
    </div>
  );
}

function parseTime(timeStr) {
  const [h, m] = timeStr.split(':').map(Number);
  const d = new Date();
  if (h < 6) d.setDate(d.getDate() + 1); // after midnight
  d.setHours(h, m, 0, 0);
  return d;
}

function getCountdown(targetDate) {
  const diff = targetDate - new Date();
  if (diff <= 0) return 'Agora';
  const m = Math.floor(diff / 60000);
  if (m < 60) return `em ${m} min`;
  const h = Math.floor(m / 60);
  const rm = m % 60;
  return `em ${h}h ${rm}min`;
}

function isEmpty(value) {
  return value === undefined || value === null || value === '';
}

function SectionCard({ title, children }) {
  return (
    <div className="card">
      <div className="card-header"><div className="card-title">{title}</div></div>
      <div className="card-body" style={{ padding: '8px 20px' }}>{children}</div>
    </div>
  );
}

function Field({ label, value, placeholder = 'Não definido' }) {
  const empty = isEmpty(value);
  return (
    <div className="info-row">
      <div className="info-label">{label}</div>
      <div className="info-value" style={{ color: empty ? 'var(--text3)' : 'var(--text)', fontStyle: empty ? 'italic' : 'normal' }}>
        {empty ? placeholder : value}
      </div>
    </div>
  );
}

function TogglePill({ label, value, onToggle }) {
  return (
    <div className="info-row">
      <div className="info-label">{label}</div>
      <div className="info-value">
        <span
          className={`badge ${value ? 'badge-green' : 'badge-gray'}`}
          style={{ cursor: 'pointer' }}
          onClick={onToggle}
          title="Clique para alternar"
        >
          {value ? '✓ Sim' : '✗ Não'}
        </span>
      </div>
    </div>
  );
}

// Editável pelo catering: mostra o valor com um lápis; clicar troca para input/textarea inline.
function InlineEdit({ value, placeholder = 'Não definido', onSave, multiline = false, small = false }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value || '');
  const empty = isEmpty(value);

  if (editing) {
    const commit = () => {
      setEditing(false);
      if (draft !== (value || '')) onSave(draft);
    };
    const cancel = () => { setDraft(value || ''); setEditing(false); };
    return multiline ? (
      <textarea
        className="input textarea"
        rows={2}
        autoFocus
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={e => e.key === 'Escape' && cancel()}
        style={{ width: '100%' }}
      />
    ) : (
      <input
        className="input"
        autoFocus
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') cancel(); }}
      />
    );
  }

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      <span style={{ fontSize: small ? 12 : 'inherit', color: empty ? 'var(--text3)' : 'var(--text)', fontStyle: empty ? 'italic' : 'normal' }}>
        {empty ? placeholder : value}
      </span>
      <button
        className="btn-icon"
        title="Editável pelo catering"
        onClick={() => { setDraft(value || ''); setEditing(true); }}
        style={{ padding: 2 }}
      >
        ✏️
      </button>
    </span>
  );
}

function EditableRow({ label, value, onSave, multiline, placeholder }) {
  return (
    <div className="info-row">
      <div className="info-label">{label}</div>
      <div className="info-value" style={{ flex: 1 }}>
        <InlineEdit value={value} onSave={onSave} multiline={multiline} placeholder={placeholder} />
      </div>
    </div>
  );
}

function DishCard({ icon, label, value, onSave, ponto, onSavePonto }) {
  return (
    <div className="card" style={{ padding: '16px 20px', display: 'flex', gap: 16, alignItems: 'flex-start' }}>
      <div style={{ fontSize: 22, flexShrink: 0, lineHeight: 1 }}>{icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--text3)', marginBottom: 6 }}>
          {label}
        </div>
        <div style={{ fontSize: 14, lineHeight: 1.5 }}>
          <InlineEdit value={value} onSave={onSave} multiline />
        </div>
        {onSavePonto && (
          <div style={{ marginTop: 8, fontSize: 12, color: 'var(--text3)', display: 'flex', alignItems: 'center', gap: 6 }}>
            Ponto: <InlineEdit value={ponto} onSave={onSavePonto} small />
          </div>
        )}
      </div>
    </div>
  );
}

function EditableList({ items, onChange, placeholder }) {
  const [draft, setDraft] = useState('');
  const list = items || [];

  const add = () => {
    const v = draft.trim();
    if (!v) return;
    onChange([...list, v]);
    setDraft('');
  };
  const remove = (idx) => onChange(list.filter((_, i) => i !== idx));

  return (
    <div>
      {list.length === 0 && (
        <div style={{ fontSize: 13, color: 'var(--text3)', fontStyle: 'italic', marginBottom: 8 }}>Não definido</div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 10 }}>
        {list.map((it, idx) => (
          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg2)', padding: '7px 12px', borderRadius: 6, fontSize: 13 }}>
            <span style={{ flex: 1 }}>{it}</span>
            <button className="btn-icon" style={{ padding: 2 }} title="Remover" onClick={() => remove(idx)}>✕</button>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          className="input"
          placeholder={placeholder}
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && add()}
        />
        <button className="btn btn-outline btn-sm" onClick={add}>+ Adicionar</button>
      </div>
    </div>
  );
}

export default function WeddingCateringTimeline() {
  const { wedding } = useOutletContext();
  const [subTab, setSubTab] = useState('timeline'); // 'timeline' | 'ementa' | 'degustacao'

  // Timeline (sub-tab 1) — 3 colunas: Geral / Planning / Catering
  const [timelineColumn, setTimelineColumn] = useState('catering');
  const [timeline, setTimeline] = useState([...MOCK_CATERING_TIMELINE]); // coluna Catering — lógica rica inalterada
  const [geralEntries, setGeralEntries] = useState(() => [...MOCK_TIMELINE_GERAL]);
  const [planningEntries, setPlanningEntries] = useState(() => [...MOCK_TIMELINE_PLANNING]);
  const [publishState, setPublishState] = useState(() => wedding.timeline_publish_state || {
    geral: { published: false, last_published_at: null },
    planning: { published: false, last_published_at: null },
    catering: { published: false, last_published_at: null },
  });
  const [expandedRow, setExpandedRow] = useState(null);
  const [now, setNow] = useState(new Date());
  const toast = useToast();

  const publishColumn = (col) => {
    setPublishState(ps => ({ ...ps, [col]: { published: true, last_published_at: new Date().toISOString() } }));
    toast(`Timeline "${TIMELINE_COLUMNS.find(c => c.id === col)?.label}" publicada`, 'success');
  };

  const copyFromPlanning = () => {
    if (!window.confirm('Substituir a timeline de Catering pelas entradas da Planning?')) return;
    setTimeline(planningEntries.map(e => ({
      id: `ct-${e.id}-${Date.now()}`,
      time: e.time,
      label: e.label,
      local: e.local,
      notes: e.notes || undefined,
      done: false,
    })));
    toast('Timeline de Catering substituída pela Planning', 'success');
  };

  // Cópia local editável dos campos de catering — reinicia quando muda de casamento
  const [data, setData] = useState(() => ({ ...wedding }));
  useEffect(() => { setData({ ...wedding }); }, [wedding.id]);

  const updateField = (key, value) => {
    setData(d => ({ ...d, [key]: value }));
    toast('Atualizado com sucesso', 'success');
  };

  useEffect(() => {
    const iv = setInterval(() => setNow(new Date()), 10000); // tick every 10s
    return () => clearInterval(iv);
  }, []);

  const toggleEvent = (e, id) => {
    e.stopPropagation();
    setTimeline(tl => {
      const idx = tl.findIndex(x => x.id === id);
      const newTl = [...tl];
      newTl[idx] = { ...newTl[idx], done: !newTl[idx].done };
      return newTl;
    });
    toast('Timeline atualizada');
  };

  const notifyCoord = (e) => {
    e.stopPropagation();
    toast('Coordenadora notificada!', 'success');
  };

  const doneCount = timeline.filter(x => x.done).length;
  const pendingCount = timeline.length - doneCount;
  const firstPendingIdx = timeline.findIndex(x => !x.done);
  const firstPending = timeline[firstPendingIdx];

  const progressPct = Math.round((doneCount / timeline.length) * 100);

  const dishes = [
    { icon: '🥗', label: 'Entrada', value: data.ementa_entrada, key: 'ementa_entrada' },
    { icon: '🐟', label: 'Peixe', value: data.ementa_peixe, key: 'ementa_peixe' },
    { icon: '🍋', label: 'Corta Sabores', value: data.ementa_corta_sabores, key: 'ementa_corta_sabores' },
    { icon: '🥩', label: 'Carne', value: data.ementa_carne, key: 'ementa_carne', ponto: data.ementa_carne_ponto, pontoKey: 'ementa_carne_ponto' },
    ...(data.ementa_vegetariano ? [{ icon: '🥦', label: 'Vegetariano', value: data.ementa_vegetariano, key: 'ementa_vegetariano' }] : []),
    { icon: '🍮', label: 'Sobremesa à Mesa', value: data.ementa_sobremesa, key: 'ementa_sobremesa' },
    { icon: '🌙', label: 'Ceia', value: data.nota_ceia, key: 'nota_ceia' },
  ];

  return (
    <div style={{ maxWidth: 900 }}>
      {/* Sub-tabs */}
      <div className="ldv-tabs" style={{ marginBottom: 24 }}>
        <button className={`ldv-tab ${subTab === 'timeline' ? 'active' : ''}`} onClick={() => setSubTab('timeline')}>
          📋 Timeline
        </button>
        <button className={`ldv-tab ${subTab === 'ementa' ? 'active' : ''}`} onClick={() => setSubTab('ementa')}>
          🍽 Ementa
        </button>
        <button className={`ldv-tab ${subTab === 'degustacao' ? 'active' : ''}`} onClick={() => setSubTab('degustacao')}>
          🍷 Degustação
        </button>
      </div>

      {/* ── SUB-TAB: TIMELINE — 3 colunas (Geral / Planning / Catering) ── */}
      {subTab === 'timeline' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Seletor de coluna */}
          <div style={{ display: 'flex', border: '1px solid var(--border2)', borderRadius: 6, overflow: 'hidden', width: 'fit-content' }}>
            {TIMELINE_COLUMNS.map(col => (
              <button
                key={col.id}
                className="btn btn-sm"
                style={{
                  borderRadius: 0,
                  background: timelineColumn === col.id ? 'var(--text)' : 'transparent',
                  color: timelineColumn === col.id ? '#fff' : 'var(--text2)',
                  borderRight: col.id !== 'catering' ? '1px solid var(--border2)' : 'none',
                }}
                onClick={() => setTimelineColumn(col.id)}
              >
                {col.icon} {col.label}
              </button>
            ))}
          </div>

          {timelineColumn === 'geral' && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                <div>
                  <h2 style={{ fontSize: 16, fontWeight: 600 }}>Timeline Geral</h2>
                  <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>Visão macro do dia, partilhável com o casal.</div>
                </div>
                <PublishBar state={publishState.geral} onPublish={() => publishColumn('geral')} />
              </div>
              <SimpleTimelineColumn entries={geralEntries} onChange={setGeralEntries} />
            </>
          )}

          {timelineColumn === 'planning' && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                <div>
                  <h2 style={{ fontSize: 16, fontWeight: 600 }}>Timeline Planning</h2>
                  <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>Cronograma operacional detalhado da coordenação.</div>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <a href={`/wedding/${wedding.id}/timeline/print/planning`} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm">
                    🖨️ Imprimir
                  </a>
                  <PublishBar state={publishState.planning} onPublish={() => publishColumn('planning')} />
                </div>
              </div>
              <SimpleTimelineColumn entries={planningEntries} onChange={setPlanningEntries} />
            </>
          )}

          {timelineColumn === 'catering' && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 600 }}>Catering & Timeline</h2>
              <div style={{ fontSize: 13, color: 'var(--text3)', marginTop: 2 }}>
                {pendingCount === 0 ? '✅ Todos os eventos concluídos!' : `${doneCount} concluídos · ${pendingCount} pendentes`}
              </div>
            </div>
            <PublishBar
              state={publishState.catering}
              onPublish={() => publishColumn('catering')}
              showCopyFromPlanning
              onCopyFromPlanning={copyFromPlanning}
            />
          </div>

          {/* Próximo momento card */}
          {firstPending && (
            <div className="card" style={{ marginBottom: 24, background: 'var(--text)', color: '#fff', padding: 20 }}>
              <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '.05em', color: 'rgba(255,255,255,.6)', marginBottom: 6 }}>
                Próximo Momento
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 700 }}>{firstPending.label}</div>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,.8)', marginTop: 4 }}>
                    {firstPending.time} {firstPending.local ? `· 📍 ${firstPending.local}` : ''}
                  </div>
                </div>
                <div style={{ background: 'rgba(255,255,255,.15)', padding: '8px 16px', borderRadius: 20, fontSize: 14, fontWeight: 600 }}>
                  ⏳ {getCountdown(parseTime(firstPending.time))}
                </div>
              </div>
            </div>
          )}

          {/* Progress bar */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text3)', marginBottom: 6 }}>
              <span>Progresso do serviço</span>
              <span>{progressPct}%</span>
            </div>
            <div style={{ height: 8, background: 'var(--bg3)', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${progressPct}%`, background: 'var(--success)', transition: 'width .5s' }} />
            </div>
          </div>

          <div className="card" style={{ overflow: 'hidden' }}>
            <div style={{ borderLeft: '3px solid var(--border)', marginLeft: 28, paddingLeft: 0 }}>
              {timeline.map((ev, idx) => {
                const isDone = ev.done;
                const isActive = idx === firstPendingIdx;
                const evTime = parseTime(ev.time);
                const isLate = !isDone && evTime < now;
                const isCourse = ev._isCourse;
                const isExpanded = expandedRow === ev.id;

                let dotBg = 'var(--border2)';
                let dotShadow = 'none';
                let rowBg = 'transparent';
                let badgeClass = 'tl-pending';
                let badgeText = 'Pendente';

                if (isDone) {
                  dotBg = 'var(--success)';
                  badgeClass = 'tl-done';
                  badgeText = 'Concluído';
                } else if (isLate) {
                  dotBg = 'var(--error)';
                  dotShadow = '0 0 0 4px rgba(220,38,38,.15)';
                  rowBg = 'var(--error-bg)';
                  badgeClass = 'tl-late';
                  badgeText = 'Atrasado';
                } else if (isActive) {
                  dotBg = 'var(--warn)';
                  dotShadow = '0 0 0 4px rgba(217,119,6,.18)';
                  rowBg = 'var(--warn-bg)';
                  badgeClass = 'tl-active';
                  badgeText = 'Em curso';
                }

                if (isCourse) {
                  dotBg = isDone ? 'var(--success)' : 'transparent';
                  dotShadow = 'none';
                }

                return (
                  <div key={ev.id} style={{ display: 'flex', flexDirection: 'column', background: isExpanded ? 'var(--bg)' : rowBg, borderBottom: idx < timeline.length - 1 ? '1px solid var(--border)' : 'none', transition: 'background .15s' }}>

                    {/* Row Header */}
                    <div
                      onClick={() => setExpandedRow(isExpanded ? null : ev.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 14,
                        padding: isCourse ? '8px 20px 8px 40px' : '13px 20px',
                        cursor: 'pointer',
                        position: 'relative',
                      }}
                      onMouseEnter={e => { if (!isActive && !isLate && !isExpanded) e.currentTarget.style.background = 'var(--bg)'; }}
                      onMouseLeave={e => { if (!isExpanded) e.currentTarget.style.background = 'transparent'; }}
                    >
                      {/* Dot */}
                      <div style={{
                        position: 'absolute',
                        left: -6,
                        width: isCourse ? 8 : 12,
                        height: isCourse ? 8 : 12,
                        borderRadius: '50%',
                        background: dotBg,
                        boxShadow: dotShadow,
                        border: isCourse ? (isDone ? 'none' : '2px solid var(--border2)') : '2px solid var(--surface)',
                        flexShrink: 0,
                      }} />

                      {/* Time */}
                      <div style={{
                        width: 52,
                        fontSize: isCourse ? 12 : 13,
                        fontWeight: 600,
                        color: isDone ? 'var(--text3)' : (isCourse ? 'var(--text2)' : 'var(--text)'),
                        flexShrink: 0,
                        opacity: isDone ? 0.5 : 1,
                      }}>
                        {ev.time}
                      </div>

                      {/* Label */}
                      <div style={{
                        flex: 1,
                        fontSize: isCourse ? 12 : 13,
                        color: isDone ? 'var(--text3)' : (isCourse ? 'var(--text2)' : 'var(--text)'),
                        textDecoration: isDone ? 'line-through' : 'none',
                        opacity: isDone ? 0.5 : 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                      }}>
                        {ev.label}
                        {ev.notes && <span style={{ fontSize: 14, color: 'var(--warn)' }}>⚠️</span>}
                      </div>

                      {/* Badge / Actions */}
                      {!isCourse && (
                        <span className={`tl-badge ${badgeClass}`}>{badgeText}</span>
                      )}

                      <div style={{ width: 16, textAlign: 'center', color: 'var(--text3)' }}>
                        {isExpanded ? '▲' : '▼'}
                      </div>
                    </div>

                    {/* Expanded Content */}
                    {isExpanded && (
                      <div style={{ padding: '0 20px 16px 86px' }}>
                        <div style={{ background: 'var(--surface)', padding: 16, borderRadius: 8, border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 12 }}>

                          <div style={{ display: 'flex', gap: 20, fontSize: 13 }}>
                            {ev.local && (
                              <div><span style={{ color: 'var(--text3)' }}>📍 Local:</span> <strong>{ev.local}</strong></div>
                            )}
                            {ev.equipa && (
                              <div><span style={{ color: 'var(--text3)' }}>👤 Equipa:</span> <strong>{ev.equipa}</strong></div>
                            )}
                          </div>

                          {ev.notes && (
                            <div style={{ padding: 10, background: 'var(--warn-bg)', borderRadius: 6, fontSize: 12, borderLeft: '3px solid var(--warn)' }}>
                              {ev.notes}
                            </div>
                          )}

                          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                            <button
                              className={`btn btn-sm ${isDone ? 'btn-outline' : 'btn-primary'}`}
                              onClick={(e) => toggleEvent(e, ev.id)}
                            >
                              {isDone ? '✗ Desmarcar' : '✓ Marcar como Concluído'}
                            </button>

                            <button className="btn btn-sm btn-outline" onClick={notifyCoord}>
                              🔔 Notificar Coordenadora
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                  </div>
                );
              })}
            </div>
          </div>
        </>
          )}
        </div>
      )}

      {/* ── SUB-TAB: EMENTA ── */}
      {subTab === 'ementa' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          <div className="grid-2">
            <SectionCard title="🕐 Serviço">
              <Field label="Hora de Chegada" value={data.arrival_time} />
              <Field label="Hora da Cerimónia" value={data.ceremony_time} />
              <Field label="Horas de Serviço" value={data.service_hours} />
              <Field label="Local da Cerimónia" value={data.ceremony_location} />
              <Field label="Tipo de Cerimónia" value={data.ceremony_type} />
            </SectionCard>

            <SectionCard title="🥂 Cocktail">
              {[1, 2, 3, 4, 5, 6].map(n => (
                data[`appetizer_station_${n}`] ? (
                  <Field key={n} label={`Estação ${n}`} value={data[`appetizer_station_${n}`]} />
                ) : null
              ))}
              <TogglePill label="Serviço Volante" value={data.servico_volante} onToggle={() => updateField('servico_volante', !data.servico_volante)} />
              <EditableRow label="Observações" value={data.observacoes_cocktail} multiline onSave={v => updateField('observacoes_cocktail', v)} />
            </SectionCard>
          </div>

          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text2)', marginBottom: 10 }}>🍽 Ementa à Mesa</div>
            <div className="grid-2">
              {dishes.map(d => (
                <DishCard
                  key={d.key}
                  icon={d.icon}
                  label={d.label}
                  value={d.value}
                  onSave={v => updateField(d.key, v)}
                  ponto={d.ponto}
                  onSavePonto={d.pontoKey ? (v => updateField(d.pontoKey, v)) : undefined}
                />
              ))}
            </div>
          </div>

          <div className="grid-2">
            <SectionCard title="➕ Extras">
              <TogglePill label="Kids Menu" value={data.kids_menu} onToggle={() => updateField('kids_menu', !data.kids_menu)} />
              {data.kids_menu && (
                <EditableRow label="Descrição Kids Menu" value={data.kids_menu_descricao} multiline onSave={v => updateField('kids_menu_descricao', v)} />
              )}
              <TogglePill label="Hora Extra" value={data.hora_extra} onToggle={() => updateField('hora_extra', !data.hora_extra)} />
              <EditableRow label="Set Up Mesa" value={data.set_up_mesa} multiline onSave={v => updateField('set_up_mesa', v)} />
              <Field label="Pessoas Extra na Prova" value={data.degustacao_pessoas_extra} />
            </SectionCard>

            {data.restricoes_alimentares && (
              <div className="card" style={{ borderColor: '#fde68a', background: 'var(--warn-bg)' }}>
                <div className="card-header" style={{ borderBottomColor: '#fde68a' }}>
                  <div className="card-title">⚠️ Restrições Alimentares</div>
                </div>
                <div className="card-body" style={{ padding: '8px 20px' }}>
                  <Field label="Tipo" value={data.tipo_restricao} />
                  <Field label="Detalhe" value={data.detalhe_restricao} />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── SUB-TAB: DEGUSTAÇÃO ── */}
      {subTab === 'degustacao' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          <div className="card">
            <div className="card-header"><div className="card-title">🍷 Prova de Degustação</div></div>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-group">
                <label className="label">Data da Prova</label>
                <input
                  type="date"
                  className="input"
                  style={{ maxWidth: 220 }}
                  value={data.degustacao_data || ''}
                  onChange={e => updateField('degustacao_data', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="label">Notas da Prova</label>
                <textarea
                  className="input textarea"
                  rows={4}
                  placeholder="Não definido"
                  value={data.degustacao_notas || ''}
                  onChange={e => updateField('degustacao_notas', e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16 }}>
                <div className="form-group" style={{ maxWidth: 140 }}>
                  <label className="label">Pessoas Extra</label>
                  <input
                    type="number"
                    min="0"
                    className="input"
                    value={data.degustacao_pessoas_extra ?? 0}
                    onChange={e => updateField('degustacao_pessoas_extra', Number(e.target.value))}
                  />
                </div>
                <span
                  className={`badge ${data.degustacao_pessoas_extra_pago ? 'badge-green' : 'badge-red'}`}
                  style={{ cursor: 'pointer', marginBottom: 9 }}
                  onClick={() => updateField('degustacao_pessoas_extra_pago', !data.degustacao_pessoas_extra_pago)}
                >
                  {data.degustacao_pessoas_extra_pago ? '✓ Pago' : '✗ Não Pago'}
                </span>
              </div>
            </div>
          </div>

          <div className="grid-2">
            <div className="card">
              <div className="card-header"><div className="card-title">🍷 Vinhos a Provar</div></div>
              <div className="card-body">
                <EditableList items={data.degustacao_vinhos} placeholder="Ex: Douro DOC Reserva Tinto" onChange={v => updateField('degustacao_vinhos', v)} />
              </div>
            </div>
            <div className="card">
              <div className="card-header"><div className="card-title">🍽 Pratos a Provar</div></div>
              <div className="card-body">
                <EditableList items={data.degustacao_pratos} placeholder="Ex: Rodovalho grelhado" onChange={v => updateField('degustacao_pratos', v)} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
