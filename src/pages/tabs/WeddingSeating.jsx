import { useState, useCallback, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { GuestSidePanel } from '../../components/seating/GuestSidePanel';
import { DraggableTable } from '../../components/seating/DraggableTable';
import { GuestListEditor } from '../../components/seating/GuestListEditor';
import { SeatingQuestionnaire } from '../../components/seating/SeatingQuestionnaire';
import { SeatToggleGrid } from '../../components/seating/SeatToggleGrid';
import { TABLE_PRESETS, FIXED_SEAT_PRESETS, rotationOptions } from '../../components/seating/tableConfig';
import { MOCK_GUESTS } from '../../data/mockData';
import { useToast } from '../../context/ToastContext';

// ── Estado inicial ──
function makeInitialTables() {
  return [
    { id: 'tb1', label: 'Noivos', preset: 'rect_bride', x: 20, y: 5, rotation: 0, min_seats: 2, max_seats: 2, disabled_seats: [] },
    { id: 'tb2', label: 'Mesa 1', preset: 'round_medium', x: 8, y: 15, rotation: 0, min_seats: 8, max_seats: 10, disabled_seats: [] },
    { id: 'tb3', label: 'Mesa 2', preset: 'round_medium', x: 32, y: 15, rotation: 0, min_seats: 8, max_seats: 10, disabled_seats: [] },
    { id: 'tb4', label: 'Mesa 3', preset: 'round_medium', x: 20, y: 22, rotation: 0, min_seats: 8, max_seats: 10, disabled_seats: [] }
  ];
}

export default function WeddingSeating() {
  const { wedding } = useOutletContext();
  const toast = useToast();

  const STORAGE_KEY_GUESTS = `ldv-guests-${wedding.id}`;
  const STORAGE_KEY_TABLES = `ldv-tables-${wedding.id}`;
  const STORAGE_KEY_QUESTIONNAIRE = `ldv-seating-questionnaire-${wedding.id}`;

  const [subTab, setSubTab] = useState('questionario'); // 'questionario' | 'convidados' | 'planta'

  const [guests, setGuests] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY_GUESTS);
    return saved ? JSON.parse(saved) : [...MOCK_GUESTS];
  });

  const [tables, setTables] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY_TABLES);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.length > 0) return parsed;
    }
    return makeInitialTables();
  });

  const [questionnaire, setQuestionnaire] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY_QUESTIONNAIRE);
    return saved ? JSON.parse(saved) : (wedding.seating_questionnaire || {});
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_GUESTS, JSON.stringify(guests));
  }, [guests, wedding.id]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_TABLES, JSON.stringify(tables));
  }, [tables, wedding.id]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_QUESTIONNAIRE, JSON.stringify(questionnaire));
  }, [questionnaire, wedding.id]);

  const [selectedGuestId, setSelectedGuestId] = useState(null);
  const [selectedTableId, setSelectedTableId] = useState(null);

  // ── Adicionar convidado (via painel lateral) ──
  const addGuest = useCallback((partial) => {
    setGuests(gs => [...gs, {
      id: `g${Date.now()}`,
      assigned_seat: null,
      ...partial,
    }]);
    toast('Convidado adicionado', 'success');
  }, [toast]);

  // ── Mover mesa (pointer) ──
  const handleMove = useCallback((id, x, y) => {
    setTables(ts => ts.map(t => t.id === id ? { ...t, x, y } : t));
  }, []);

  // ── Selecionar mesa ──
  // Clicar numa mesa seleciona-a sempre (nunca "desliga" ao clicar outra vez) —
  // só se desseleciona clicando no fundo vazio do canvas. Replica o comportamento do original.
  const handleSelectTable = useCallback((id) => {
    setSelectedTableId(id);
  }, []);

  // ── Clique numa cadeira ──
  const handleSeatClick = useCallback((tableId, seatIdx) => {
    const seatId  = `${tableId}:${seatIdx}`;
    const occupant = guests.find(g => g.assigned_seat === seatId);

    if (selectedGuestId) {
      // Já há convidado selecionado → tentamos sentar
      if (occupant) {
        toast(`Cadeira já ocupada por ${occupant.first_name}`, 'error');
        return;
      }
      setGuests(gs => gs.map(g => g.id === selectedGuestId
        ? { ...g, assigned_seat: seatId }
        : g
      ));
      setSelectedGuestId(null);
      toast('Convidado sentado ✓', 'success');
    } else if (occupant) {
      // Sem convidado selecionado e há alguém → levanta
      setGuests(gs => gs.map(g => g.id === occupant.id
        ? { ...g, assigned_seat: null }
        : g
      ));
      toast(`${occupant.first_name} removido da cadeira`);
    }
  }, [guests, selectedGuestId, toast]);

  // ── Adicionar mesa ──
  const addTable = (presetId) => {
    const p = TABLE_PRESETS[presetId];
    const newId = `tb${Date.now()}`;
    setTables(ts => [...ts, {
      id: newId, label: `Mesa ${ts.length + 1}`,
      preset: presetId,
      x: 10 + Math.round(Math.random() * 20),
      y: 10 + Math.round(Math.random() * 10),
      rotation: 0,
      min_seats: p.defaultMinSeats,
      max_seats: p.defaultMaxSeats,
      disabled_seats: [],
    }]);
    toast('Mesa adicionada');
  };

  // ── Remover mesa selecionada ──
  const removeSelected = () => {
    if (!selectedTableId) return;
    setTables(ts => ts.filter(t => t.id !== selectedTableId));
    setGuests(gs => gs.map(g =>
      g.assigned_seat?.startsWith(selectedTableId + ':')
        ? { ...g, assigned_seat: null }
        : g
    ));
    setSelectedTableId(null);
    toast('Mesa removida');
  };

  // ── Editar mesa selecionada ──
  const editSelected = (patch) => {
    setTables(ts => ts.map(t => t.id === selectedTableId ? { ...t, ...patch } : t));
  };

  // ── Ativar/desativar um lugar específico da mesa selecionada ──
  const toggleSeatDisabled = (seatIdx) => {
    if (!selectedTableId) return;
    const current = tables.find(t => t.id === selectedTableId)?.disabled_seats ?? [];
    const isDisabling = !current.includes(seatIdx);

    setTables(ts => ts.map(t => {
      if (t.id !== selectedTableId) return t;
      const disabled_seats = isDisabling
        ? [...current, seatIdx]
        : current.filter(i => i !== seatIdx);
      return { ...t, disabled_seats };
    }));

    // Ao desativar um lugar ocupado, levanta o convidado para não ficar "escondido".
    if (isDisabling) {
      const seatId = `${selectedTableId}:${seatIdx}`;
      const occupant = guests.find(g => g.assigned_seat === seatId);
      if (occupant) {
        setGuests(gs => gs.map(g => g.id === occupant.id ? { ...g, assigned_seat: null } : g));
        toast(`${occupant.first_name} removido — lugar desativado`);
      }
    }
  };

  // ── Reset layout ──
  const resetAll = () => {
    if (!window.confirm('Limpar toda a planta?')) return;
    setTables(makeInitialTables());
    setGuests(MOCK_GUESTS.map(g => ({ ...g, assigned_seat: null })));
    setSelectedTableId(null);
    setSelectedGuestId(null);
    toast('Planta reiniciada');
  };

  const selectedTable = tables.find(t => t.id === selectedTableId) ?? null;
  const totalSeats    = tables.reduce((s, t) => s + t.max_seats, 0);
  const assignedCount = guests.filter(g => g.assigned_seat).length;

  return (
    <div>
      {/* Sub-tabs */}
      <div className="ldv-tabs" style={{ marginBottom: subTab === 'planta' ? 0 : 24 }}>
        <button className={`ldv-tab ${subTab === 'questionario' ? 'active' : ''}`} onClick={() => setSubTab('questionario')}>
          📋 Questionário
        </button>
        <button className={`ldv-tab ${subTab === 'convidados' ? 'active' : ''}`} onClick={() => setSubTab('convidados')}>
          👥 Convidados
        </button>
        <button className={`ldv-tab ${subTab === 'planta' ? 'active' : ''}`} onClick={() => setSubTab('planta')}>
          🪑 Planta de Mesas
        </button>
      </div>

      {/* ── SUB-TAB: QUESTIONÁRIO ── */}
      {subTab === 'questionario' && (
        <div style={{ paddingTop: 20 }}>
          <SeatingQuestionnaire value={questionnaire} onChange={setQuestionnaire} />
        </div>
      )}

      {/* ── SUB-TAB: CONVIDADOS ── */}
      {subTab === 'convidados' && (
        <div style={{ paddingTop: 20, maxWidth: 1100 }}>
          <GuestListEditor guests={guests} onChange={setGuests} />
        </div>
      )}

      {/* ── SUB-TAB: PLANTA DE MESAS ── */}
      {subTab === 'planta' && (
        <div style={{
          display: 'flex',
          height: 'calc(100vh - 260px)',
          margin: '20px -32px -32px',
          borderTop: '1px solid var(--border)',
          overflow: 'hidden',
        }}>
          {/* ══ Painel Esquerdo: Convidados ══ */}
          <GuestSidePanel
            guests={guests}
            tables={tables}
            selectedGuestId={selectedGuestId}
            onSelectGuest={setSelectedGuestId}
            onAddGuest={addGuest}
          />

          {/* ══ Área Central: Toolbar + Canvas ══ */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>

            {/* Toolbar */}
            <div style={{
              padding: '10px 20px',
              background: 'var(--surface)',
              borderBottom: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap',
            }}>
              <span style={{ fontSize: 13, fontWeight: 600, marginRight: 4 }}>Planta de Lugares</span>

              {/* Estatística */}
              <span style={{
                fontSize: 11, padding: '3px 10px', borderRadius: 20,
                background: assignedCount === guests.length && guests.length > 0 ? 'var(--success-bg)' : 'var(--gold-bg)',
                color:      assignedCount === guests.length && guests.length > 0 ? 'var(--success)' : 'var(--gold)',
                border:     '1px solid',
                borderColor: assignedCount === guests.length && guests.length > 0 ? '#a7f3d0' : 'var(--gold-border)',
              }}>
                {assignedCount}/{guests.length} convidados · {totalSeats} lugares
              </span>

              <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
                <select
                  className="input btn-sm"
                  style={{ padding: '0 10px', height: 32, fontSize: 13 }}
                  onChange={(e) => {
                    if (e.target.value) {
                      addTable(e.target.value);
                      e.target.value = '';
                    }
                  }}
                >
                  <option value="">+ Adicionar Elemento...</option>
                  {Object.entries(TABLE_PRESETS).map(([key, p]) => (
                    <option key={key} value={key}>{p.label_pt}</option>
                  ))}
                </select>

                <button
                  className="btn btn-danger btn-sm"
                  onClick={removeSelected}
                  disabled={!selectedTableId}
                  style={{ opacity: selectedTableId ? 1 : 0.4 }}
                >
                  Remover Mesa
                </button>
                <button className="btn btn-ghost btn-sm" onClick={resetAll} title="Reiniciar planta">
                  ↺ Reset
                </button>
                <div style={{ width: 1, height: 24, background: 'var(--border)' }} />
                <a href={`/wedding/${wedding.id}/seating/print`} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm">
                  🖨️ Imprimir
                </a>
              </div>
            </div>

            {/* Canvas */}
            <div
              style={{ flex: 1, position: 'relative', overflow: 'auto', background: '#f9fafb' }}
              onClick={(e) => { if (e.target === e.currentTarget) setSelectedTableId(null); }}
            >
              {/* Grelha de fundo */}
              <div style={{
                position: 'absolute', inset: 0, pointerEvents: 'none',
                backgroundImage: [
                  'linear-gradient(to right, rgba(0,0,0,.06) 1px, transparent 1px)',
                  'linear-gradient(to bottom, rgba(0,0,0,.06) 1px, transparent 1px)',
                ].join(','),
                backgroundSize: '10px 10px',
              }} />
              {/* Paredes da sala */}
              <div style={{
                position: 'absolute', inset: 20,
                border: '2px solid #c8bfb0',
                borderRadius: 4, pointerEvents: 'none',
              }} />

              {/* Mesas */}
              {tables.map(t => (
                <DraggableTable
                  key={t.id}
                  table={t}
                  guests={guests}
                  isSelected={selectedTableId === t.id}
                  onSelect={handleSelectTable}
                  onMove={handleMove}
                  onSeatClick={handleSeatClick}
                />
              ))}

              {/* Hint quando convidado selecionado */}
              {selectedGuestId && (
                <div style={{
                  position: 'absolute', top: 28, left: '50%', transform: 'translateX(-50%)',
                  background: 'var(--accent)', color: '#fff',
                  padding: '6px 18px', borderRadius: 20, fontSize: 12, fontWeight: 500,
                  pointerEvents: 'none', boxShadow: '0 2px 8px rgba(0,0,0,.2)',
                }}>
                  Clique numa cadeira para sentar o convidado
                </div>
              )}
            </div>
          </div>

          {/* ══ Painel Direito: Editar Mesa ══ */}
          <div style={{
            width: 220, flexShrink: 0,
            borderLeft: '1px solid var(--border)',
            background: 'var(--surface)',
            display: 'flex', flexDirection: 'column',
            overflow: 'hidden',
          }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text2)' }}>
                {selectedTable ? 'Editar Mesa' : 'Selecione uma mesa'}
              </div>
            </div>

            {selectedTable ? (
              <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14, overflow: 'auto' }}>
                {/* Tipo */}
                <div className="form-group">
                  <label className="label">Tipo</label>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{TABLE_PRESETS[selectedTable.preset]?.label_pt}</div>
                </div>

                {/* Label */}
                <div className="form-group">
                  <label className="label">Nome da Mesa</label>
                  <input
                    className="input"
                    value={selectedTable.label}
                    onChange={e => editSelected({ label: e.target.value })}
                  />
                </div>

                {/* Nº de lugares — mesas de noivos (rect/redonda) têm contagem fixa */}
                {(() => {
                  const preset = TABLE_PRESETS[selectedTable.preset];
                  const seatsFixed = FIXED_SEAT_PRESETS.has(selectedTable.preset);
                  if (!preset.hasSeatSlots) return null;
                  if (seatsFixed) {
                    return (
                      <div className="form-group">
                        <label className="label">Lugares</label>
                        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text3)' }}>
                          {selectedTable.max_seats} (fixo)
                        </div>
                      </div>
                    );
                  }
                  return (
                    <>
                      <div className="form-group">
                        <label className="label">Lugares (mín)</label>
                        <input
                          className="input"
                          type="number" min={0} max={selectedTable.max_seats}
                          value={selectedTable.min_seats ?? 0}
                          onChange={e => editSelected({ min_seats: Math.max(0, parseInt(e.target.value) || 0) })}
                        />
                      </div>
                      <div className="form-group">
                        <label className="label">Lugares (máx)</label>
                        <input
                          className="input"
                          type="number" min={selectedTable.min_seats ?? 0} max={30}
                          value={selectedTable.max_seats}
                          onChange={e => editSelected({ max_seats: Math.max(1, parseInt(e.target.value) || 1) })}
                        />
                      </div>
                    </>
                  );
                })()}

                {/* Rotação — ângulos disponíveis dependem da forma da mesa */}
                <div className="form-group">
                  <label className="label">Rotação</label>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {rotationOptions(TABLE_PRESETS[selectedTable.preset]?.shape).map(deg => (
                      <button
                        key={deg}
                        className="btn btn-xs"
                        style={{
                          background: selectedTable.rotation === deg ? 'var(--text)' : 'var(--bg2)',
                          color:      selectedTable.rotation === deg ? '#fff' : 'var(--text2)',
                        }}
                        onClick={() => editSelected({ rotation: deg })}
                      >
                        {deg}°
                      </button>
                    ))}
                    <input
                      className="input" type="number" min={0} max={359}
                      style={{ width: 60, padding: '3px 6px', fontSize: 12 }}
                      value={selectedTable.rotation ?? 0}
                      onChange={e => editSelected({ rotation: ((parseInt(e.target.value) || 0) % 360 + 360) % 360 })}
                    />
                  </div>
                </div>

                {/* Ativar/desativar lugares individuais — só mesas de convidados normais */}
                {TABLE_PRESETS[selectedTable.preset]?.hasSeatSlots &&
                 !FIXED_SEAT_PRESETS.has(selectedTable.preset) &&
                 TABLE_PRESETS[selectedTable.preset]?.shape !== 's_curve' && (
                  <div className="form-group" style={{ borderTop: '1px solid var(--border)', paddingTop: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <label className="label" style={{ margin: 0 }}>Ativar/Desativar Lugares</label>
                      {(selectedTable.disabled_seats?.length ?? 0) > 0 && (
                        <button
                          style={{ fontSize: 10, color: 'var(--accent)', cursor: 'pointer' }}
                          onClick={() => editSelected({ disabled_seats: [] })}
                        >
                          Repor
                        </button>
                      )}
                    </div>
                    <SeatToggleGrid
                      preset={TABLE_PRESETS[selectedTable.preset]}
                      maxSeats={selectedTable.max_seats}
                      disabledSeats={selectedTable.disabled_seats ?? []}
                      onToggle={toggleSeatDisabled}
                    />
                    <div style={{ fontSize: 10, color: 'var(--text3)', textAlign: 'center', marginTop: 4 }}>
                      {selectedTable.max_seats - (selectedTable.disabled_seats?.length ?? 0)} lugares ativos
                    </div>
                  </div>
                )}

                {/* Convidados nesta mesa */}
                <div className="form-group">
                  <label className="label">Convidados nesta mesa</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {guests.filter(g => g.assigned_seat?.startsWith(selectedTable.id + ':')).length === 0
                      ? <div style={{ fontSize: 12, color: 'var(--text3)', fontStyle: 'italic' }}>Nenhum</div>
                      : guests
                          .filter(g => g.assigned_seat?.startsWith(selectedTable.id + ':'))
                          .map(g => (
                            <div key={g.id} style={{
                              fontSize: 12, display: 'flex', justifyContent: 'space-between',
                              padding: '4px 0', borderBottom: '1px solid var(--border)',
                            }}>
                              <span>{g.first_name} {g.last_name}</span>
                              <button
                                style={{ fontSize: 11, color: 'var(--error)', cursor: 'pointer' }}
                                onClick={() => setGuests(gs => gs.map(x => x.id === g.id ? { ...x, assigned_seat: null } : x))}
                              >
                                ✕
                              </button>
                            </div>
                          ))
                    }
                  </div>
                </div>

                <button className="btn btn-danger btn-sm" onClick={removeSelected}>
                  Remover Mesa
                </button>
              </div>
            ) : (
              <div style={{ padding: 20, fontSize: 12, color: 'var(--text3)', textAlign: 'center', fontStyle: 'italic' }}>
                Clique numa mesa para editar
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
