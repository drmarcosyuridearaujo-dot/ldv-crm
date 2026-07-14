export function GuestSidePanel({ guests, selectedGuestId, onSelectGuest }) {
  const unassigned = guests.filter(g => !g.assigned_seat);
  const assigned   = guests.filter(g =>  g.assigned_seat);
  const allDone    = unassigned.length === 0 && guests.length > 0;

  const guestTypeLabel = (t) =>
    t === 'adult' ? 'Adulto' : t === 'staff' ? 'Staff' : t === 'child_4_9' ? 'Criança 4–9' : 'Bebé';

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

      <div style={{ flex: 1, overflowY: 'auto' }}>

        {/* ── Por sentar ── */}
        {unassigned.length > 0 && (
          <>
            <div style={{
              padding: '6px 12px', fontSize: 10, fontWeight: 700,
              textTransform: 'uppercase', letterSpacing: '.05em',
              color: 'var(--text3)', background: 'var(--bg)',
              borderBottom: '1px solid var(--border)',
            }}>
              Por sentar ({unassigned.length})
            </div>
            {unassigned.map(g => {
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
                  <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2, display: 'flex', gap: 6 }}>
                    <span>{guestTypeLabel(g.guest_type)}</span>
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

        {/* ── Já sentados ── */}
        {assigned.length > 0 && (
          <>
            <div style={{
              padding: '6px 12px', fontSize: 10, fontWeight: 700,
              textTransform: 'uppercase', letterSpacing: '.05em',
              color: 'var(--text3)', background: 'var(--bg)',
              borderBottom: '1px solid var(--border)',
              borderTop: unassigned.length > 0 ? '1px solid var(--border2)' : undefined,
              marginTop: unassigned.length > 0 ? 8 : 0,
            }}>
              Sentados ({assigned.length})
            </div>
            {assigned.map(g => (
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
          </>
        )}
      </div>

      {/* Legenda */}
      <div style={{
        padding: '10px 16px', borderTop: '1px solid var(--border)',
        background: 'var(--bg)', fontSize: 11, color: 'var(--text3)',
        display: 'flex', flexDirection: 'column', gap: 5,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
          Lugar ocupado
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#f59e0b', display: 'inline-block' }} />
          Restrição alimentar
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#e5e7eb', border: '2px solid #9ca3af', display: 'inline-block' }} />
          Lugar vazio
        </div>
      </div>
    </div>
  );
}
