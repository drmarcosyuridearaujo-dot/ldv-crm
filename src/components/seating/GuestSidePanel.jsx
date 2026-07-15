import { useMemo, useState } from 'react';
import { GUEST_TYPE_LABELS, CHAIR_TYPE_LABELS, MENU_LABELS } from './GuestListEditor';

function QuickAddGuestForm({ onAdd, onCancel }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [guestType, setGuestType] = useState('adult');
  const [chairType, setChairType] = useState('simple');
  const [menu, setMenu] = useState('generic');
  const [dietary, setDietary] = useState('');

  const canAdd = firstName.trim() !== '';

  const submit = () => {
    if (!canAdd) return;
    onAdd({
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      guest_type: guestType,
      chair_type: chairType,
      menu,
      dietary_restriction: dietary.trim() || null,
      language: 'pt',
    });
  };

  const selectStyle = { height: 28, fontSize: 11, padding: '3px 6px' };

  return (
    <div style={{ padding: '10px 12px', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', background: 'var(--bg)', display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.04em', color: 'var(--text3)' }}>Novo Convidado</span>
        <button className="btn-icon" style={{ padding: 2 }} onClick={onCancel}>✕</button>
      </div>
      <input className="input" style={{ height: 28, fontSize: 12 }} placeholder="Nome *" autoFocus
        value={firstName} onChange={e => setFirstName(e.target.value)} />
      <input className="input" style={{ height: 28, fontSize: 12 }} placeholder="Apelido"
        value={lastName} onChange={e => setLastName(e.target.value)} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
        <select className="input" style={selectStyle} value={guestType} onChange={e => setGuestType(e.target.value)}>
          {Object.entries(GUEST_TYPE_LABELS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
        </select>
        <select className="input" style={selectStyle} value={chairType} onChange={e => setChairType(e.target.value)}>
          {Object.entries(CHAIR_TYPE_LABELS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
        </select>
      </div>
      <select className="input" style={selectStyle} value={menu} onChange={e => setMenu(e.target.value)}>
        {Object.entries(MENU_LABELS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
      </select>
      <input className="input" style={{ height: 28, fontSize: 12 }} placeholder="Restrição alimentar (opcional)"
        value={dietary} onChange={e => setDietary(e.target.value)} />
      <button className="btn btn-primary btn-sm" style={{ width: '100%' }} disabled={!canAdd} onClick={submit}>
        + Adicionar
      </button>
    </div>
  );
}

export function GuestSidePanel({ guests, tables, selectedGuestId, onSelectGuest, onAddGuest }) {
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);

  const unassigned = guests.filter(g => !g.assigned_seat);
  const assigned = guests.filter(g => g.assigned_seat);
  const allDone = unassigned.length === 0 && guests.length > 0;

  const filteredUnassigned = search.trim()
    ? unassigned.filter(g => `${g.first_name} ${g.last_name}`.toLowerCase().includes(search.trim().toLowerCase()))
    : unassigned;

  const tableLabelById = useMemo(() => {
    const m = new Map();
    for (const t of tables) m.set(t.id, t.label);
    return m;
  }, [tables]);

  const groupedAssigned = useMemo(() => {
    const m = new Map();
    for (const g of assigned) {
      const tableId = g.assigned_seat.split(':')[0];
      const label = tableLabelById.get(tableId) || '?';
      if (!m.has(label)) m.set(label, []);
      m.get(label).push(g);
    }
    return Array.from(m.entries());
  }, [assigned, tableLabelById]);

  const guestTypeLabel = (t) => GUEST_TYPE_LABELS[t] || t;

  const handleAdd = (partial) => {
    onAddGuest(partial);
    setShowAdd(false);
  };

  return (
    <div style={{
      width: 260, flexShrink: 0,
      borderRight: '1px solid var(--border)',
      background: 'var(--surface)',
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '10px 16px',
        borderBottom: '1px solid var(--border)',
        background: allDone ? 'var(--success-bg)' : 'var(--warn-bg)',
      }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: allDone ? 'var(--success)' : 'var(--warn)' }}>
          {allDone ? '✓ Todos sentados' : `${unassigned.length} por sentar`}
        </div>
        <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>
          {assigned.length} / {guests.length} atribuídos
        </div>
      </div>

      {/* Pesquisa */}
      <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)' }}>
        <input
          className="input"
          style={{ height: 30, fontSize: 12 }}
          placeholder="🔎 Procurar convidado..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>

        {/* ── Por sentar ── */}
        {filteredUnassigned.length > 0 && (
          <>
            <div style={{
              padding: '6px 12px', fontSize: 10, fontWeight: 700,
              textTransform: 'uppercase', letterSpacing: '.05em',
              color: 'var(--text3)', background: 'var(--bg)',
              borderBottom: '1px solid var(--border)',
            }}>
              Por sentar ({filteredUnassigned.length})
            </div>
            {filteredUnassigned.map(g => {
              const isSel = selectedGuestId === g.id;
              return (
                <div
                  key={g.id}
                  onClick={() => onSelectGuest(isSel ? null : g.id)}
                  style={{
                    padding: '10px 16px', cursor: 'pointer',
                    borderBottom: '1px solid var(--border)',
                    borderLeft:   `3px solid ${isSel ? 'var(--accent)' : 'transparent'}`,
                    background:   isSel ? 'var(--accent-bg)' : 'transparent',
                    transition: 'background .12s',
                  }}
                >
                  <div style={{ fontSize: 13, fontWeight: 500, color: isSel ? 'var(--accent)' : 'var(--text)' }}>
                    {g.first_name} {g.last_name}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <span>{guestTypeLabel(g.guest_type)}</span>
                    {g.chair_type && g.chair_type !== 'simple' && (
                      <span>· {CHAIR_TYPE_LABELS[g.chair_type]}</span>
                    )}
                    {g.dietary_restriction && (
                      <span style={{ color: 'var(--warn)', fontWeight: 500 }}>⚠ {g.dietary_restriction}</span>
                    )}
                  </div>
                  {isSel && (
                    <div style={{ fontSize: 11, color: 'var(--accent)', marginTop: 4, fontWeight: 500 }}>
                      ← Clique numa cadeira para sentar
                    </div>
                  )}
                </div>
              );
            })}
          </>
        )}

        {filteredUnassigned.length === 0 && search.trim() && (
          <div style={{ padding: '16px 12px', fontSize: 12, color: 'var(--text3)', fontStyle: 'italic', textAlign: 'center' }}>
            Nenhum convidado por sentar corresponde a "{search}".
          </div>
        )}

        {/* ── Adicionar novo convidado ── */}
        {!showAdd ? (
          <button
            type="button"
            onClick={() => setShowAdd(true)}
            style={{
              width: '100%', padding: '10px 16px', textAlign: 'left',
              fontSize: 12, color: 'var(--accent)', background: 'var(--accent-bg)',
              borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)',
              cursor: 'pointer',
            }}
          >
            + Adicionar novo convidado
          </button>
        ) : (
          <QuickAddGuestForm onAdd={handleAdd} onCancel={() => setShowAdd(false)} />
        )}

        {/* ── Já sentados (agrupados por mesa) ── */}
        {groupedAssigned.length > 0 && (
          <div style={{ marginTop: 4 }}>
            {groupedAssigned.map(([label, list]) => (
              <div key={label}>
                <div style={{
                  padding: '6px 12px', fontSize: 10, fontWeight: 700,
                  textTransform: 'uppercase', letterSpacing: '.05em',
                  color: 'var(--text3)', background: 'var(--bg)',
                  borderBottom: '1px solid var(--border)',
                }}>
                  {label} ({list.length})
                </div>
                {list.map(g => (
                  <div key={g.id} style={{
                    padding: '8px 16px', borderBottom: '1px solid var(--border)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  }}>
                    <div>
                      <div style={{ fontSize: 12, color: 'var(--text2)' }}>{g.first_name} {g.last_name}</div>
                      {g.dietary_restriction && (
                        <div style={{ fontSize: 11, color: 'var(--warn)' }}>⚠ {g.dietary_restriction}</div>
                      )}
                    </div>
                    <span style={{ fontSize: 11, color: 'var(--success)', fontWeight: 600 }}>✓</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Legenda */}
      <div style={{
        padding: '10px 16px', borderTop: '1px solid var(--border)',
        background: 'var(--bg)', fontSize: 11, color: 'var(--text3)',
        display: 'flex', flexDirection: 'column', gap: 5,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#10b981', border: '1px solid #059669', display: 'inline-block' }} />
          Lugar ocupado
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#d1d5db', border: '1px solid #9ca3af', display: 'inline-block' }} />
          Lugar vazio
        </div>
        <div style={{ fontSize: 10, color: 'var(--text3)', fontStyle: 'italic' }}>
          ⚠ Restrições alimentares — passe o rato sobre o lugar
        </div>
      </div>
    </div>
  );
}
