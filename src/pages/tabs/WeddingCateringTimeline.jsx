import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { MOCK_CATERING_TIMELINE } from '../../data/mockData';
import { useToast } from '../../context/ToastContext';

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

export default function WeddingCateringTimeline() {
  const { wedding } = useOutletContext();
  const [timeline, setTimeline] = useState([...MOCK_CATERING_TIMELINE]);
  const [view, setView] = useState('timeline'); // 'timeline' | 'ementa'
  const [expandedRow, setExpandedRow] = useState(null);
  const [now, setNow] = useState(new Date());
  const toast = useToast();

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

  return (
    <div style={{ maxWidth: 860 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 600 }}>Catering & Timeline</h2>
          <div style={{ fontSize: 13, color: 'var(--text3)', marginTop: 2 }}>
            {pendingCount === 0 ? '✅ Todos os eventos concluídos!' : `${doneCount} concluídos · ${pendingCount} pendentes`}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <a href={`/wedding/${wedding.id}/timeline/print/planning`} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm" style={{ marginRight: 8 }}>
            🖨️ Imprimir
          </a>
          <button
            className={`btn btn-sm ${view === 'timeline' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setView('timeline')}
          >
            📋 Timeline
          </button>
          <button
            className={`btn btn-sm ${view === 'ementa' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setView('ementa')}
          >
            🍽 Ementa
          </button>
        </div>
      </div>

      {/* Próximo momento card */}
      {view === 'timeline' && firstPending && (
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

      {view === 'timeline' ? (
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
      ) : (
        // Ementa view
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {wedding && [
            { label: '🥗 Entrada', value: wedding.ementa_entrada },
            { label: '🐟 Peixe', value: wedding.ementa_peixe },
            { label: '🥩 Carne', value: wedding.ementa_carne },
            { label: '🥦 Vegetariano', value: wedding.ementa_vegetariano },
            { label: '🎂 Sobremesa', value: wedding.ementa_sobremesa },
            { label: '🌙 Ceia', value: wedding.nota_ceia },
          ].map(item => item.value ? (
            <div key={item.label} className="card" style={{ padding: '16px 20px', display: 'flex', gap: 16, alignItems: 'flex-start' }}>
              <div style={{ fontSize: 22, flexShrink: 0, lineHeight: 1 }}>{item.label.split(' ')[0]}</div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--text3)', marginBottom: 4 }}>
                  {item.label.split(' ').slice(1).join(' ')}
                </div>
                <div style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.5 }}>{item.value}</div>
              </div>
            </div>
          ) : null)}

          {/* Restrições alimentares */}
          {wedding?.restricoes_alimentares && (
            <div className="card" style={{ padding: '16px 20px', borderColor: '#fde68a', background: 'var(--warn-bg)' }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <span style={{ fontSize: 18 }}>⚠️</span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>Restrições Alimentares</div>
                  <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 6 }}>{wedding.tipo_restricao}</div>
                  <div style={{ fontSize: 12, color: 'var(--text2)', fontStyle: 'italic' }}>{wedding.detalhe_restricao}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
