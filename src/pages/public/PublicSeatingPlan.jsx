import { useState, useCallback, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { GuestSidePanel } from '../../components/seating/GuestSidePanel';
import { DraggableTable } from '../../components/seating/DraggableTable';
import { GuestListEditor } from '../../components/seating/GuestListEditor';
import { CANVAS_SCALE, makeInitialTables } from '../../components/seating/tableConfig';
import { MOCK_WEDDINGS, MOCK_GUESTS } from '../../data/mockData';
import { useToast } from '../../context/ToastContext';

// Réplica de "/seating-plan/:dealId#hash" do original — o PRÓPRIO CASAL usa este
// link (sem login, protegido por token no fragmento) para submeter a lista de
// convidados e organizar as mesas, com as mesmas chaves de localStorage que a
// planta interna da coordenadora usa — por isso ficam sincronizadas.
function InvalidLink() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, color: 'var(--text3)', textAlign: 'center', padding: 20 }}>
      <p style={{ fontSize: 17 }}>Link inválido</p>
      <p style={{ fontSize: 13 }}>O link pode estar expirado ou ser inválido.</p>
    </div>
  );
}

export default function PublicSeatingPlan() {
  const { id } = useParams();
  const wedding = MOCK_WEDDINGS.find(w => w.id === id);
  const token = typeof window !== 'undefined' ? window.location.hash.slice(1) : '';
  const toast = useToast();

  const STORAGE_KEY_GUESTS = `ldv-guests-${id}`;
  const STORAGE_KEY_TABLES = `ldv-tables-${id}`;
  const STORAGE_KEY_APPROVED = `ldv-seating-approved-${id}`;

  const [view, setView] = useState('convidados'); // 'convidados' | 'planta'
  const [guests, setGuests] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY_GUESTS);
    return saved ? JSON.parse(saved) : [...MOCK_GUESTS];
  });
  const [tables] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY_TABLES);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.length > 0) return parsed;
    }
    return makeInitialTables();
  });
  const [approved, setApproved] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY_APPROVED);
    return saved ? JSON.parse(saved) : null;
  });
  const [selectedGuestId, setSelectedGuestId] = useState(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_GUESTS, JSON.stringify(guests));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [guests]);

  const handleSeatClick = useCallback((tableId, seatIdx) => {
    const seatId = `${tableId}:${seatIdx}`;
    const occupant = guests.find(g => g.assigned_seat === seatId);

    if (selectedGuestId) {
      if (occupant) {
        toast(`Cadeira já ocupada por ${occupant.first_name}`, 'error');
        return;
      }
      setGuests(gs => gs.map(g => g.id === selectedGuestId ? { ...g, assigned_seat: seatId } : g));
      setSelectedGuestId(null);
      toast('Convidado sentado ✓', 'success');
    } else if (occupant) {
      setGuests(gs => gs.map(g => g.id === occupant.id ? { ...g, assigned_seat: null } : g));
      toast(`${occupant.first_name} removido da cadeira`);
    }
  }, [guests, selectedGuestId, toast]);

  const addGuest = useCallback((partial) => {
    setGuests(gs => [...gs, { id: `g${Date.now()}`, assigned_seat: null, ...partial }]);
    toast('Convidado adicionado', 'success');
  }, [toast]);

  const approve = () => {
    if (!window.confirm('Aprovar este layout final? A nossa equipa vai preparar a planta com base nesta organização.')) return;
    const rec = { approved: true, approved_at: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEY_APPROVED, JSON.stringify(rec));
    setApproved(rec);
    toast('Layout aprovado! A equipa foi notificada. 🎉', 'success');
  };

  if (!wedding || !wedding.share_token || token !== wedding.share_token) {
    return <InvalidLink />;
  }

  const assignedCount = guests.filter(g => g.assigned_seat).length;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Cabeçalho */}
      <div style={{ padding: '24px 24px 16px', borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700 }}>{wedding.bride} & {wedding.groom} — Planta de Mesas</h1>
            <div style={{ fontSize: 13, color: 'var(--text3)', marginTop: 2 }}>
              {new Date(wedding.date).toLocaleDateString('pt-PT', { day: '2-digit', month: 'long', year: 'numeric' })} · {wedding.venue}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {approved ? (
              <span className="badge badge-green">✅ Layout aprovado em {new Date(approved.approved_at).toLocaleDateString('pt-PT')}</span>
            ) : (
              <button className="btn btn-primary btn-sm" onClick={approve}>✅ Aprovar Layout Final</button>
            )}
          </div>
        </div>
      </div>

      {/* Instruções */}
      {!approved && (
        <div style={{ padding: '10px 24px', background: 'var(--accent-bg)', borderBottom: '1px solid var(--accent-border)', textAlign: 'center', fontSize: 13, color: 'var(--accent)' }}>
          Adicionem os vossos convidados e sentem-nos nas mesas. Quando estiverem satisfeitos, aprovem o layout final.
        </div>
      )}

      {/* Seletor de vista */}
      <div style={{ padding: '14px 24px 0', maxWidth: 1100, margin: '0 auto', width: '100%' }}>
        <div style={{ display: 'flex', border: '1px solid var(--border2)', borderRadius: 6, overflow: 'hidden', width: 'fit-content' }}>
          <button
            className="btn btn-sm"
            style={{ borderRadius: 0, background: view === 'convidados' ? 'var(--text)' : 'transparent', color: view === 'convidados' ? '#fff' : 'var(--text2)', borderRight: '1px solid var(--border2)' }}
            onClick={() => setView('convidados')}
          >
            👥 Convidados
          </button>
          <button
            className="btn btn-sm"
            style={{ borderRadius: 0, background: view === 'planta' ? 'var(--text)' : 'transparent', color: view === 'planta' ? '#fff' : 'var(--text2)' }}
            onClick={() => setView('planta')}
          >
            🪑 Planta de Mesas
          </button>
        </div>
      </div>

      {view === 'convidados' ? (
        <div style={{ padding: 24, maxWidth: 1100, margin: '0 auto', width: '100%' }}>
          <GuestListEditor guests={guests} onChange={setGuests} />
        </div>
      ) : (
        <div style={{ flex: 1, display: 'flex', minHeight: 500 }}>
          <GuestSidePanel
            guests={guests}
            tables={tables}
            selectedGuestId={selectedGuestId}
            onSelectGuest={setSelectedGuestId}
            onAddGuest={addGuest}
          />
          <div style={{ flex: 1, position: 'relative', overflow: 'auto', background: '#f9fafb' }}>
            <div style={{
              position: 'absolute', inset: 0, pointerEvents: 'none',
              backgroundImage: [
                'linear-gradient(to right, rgba(0,0,0,.06) 1px, transparent 1px)',
                'linear-gradient(to bottom, rgba(0,0,0,.06) 1px, transparent 1px)',
              ].join(','),
              backgroundSize: '10px 10px',
            }} />
            <div style={{ position: 'absolute', inset: 20, border: '2px solid #c8bfb0', borderRadius: 4, pointerEvents: 'none' }} />

            {tables.map(t => (
              <DraggableTable
                key={t.id}
                table={t}
                guests={guests}
                isSelected={false}
                editable={false}
                onSelect={() => {}}
                onMove={undefined}
                onSeatClick={handleSeatClick}
              />
            ))}

            {selectedGuestId && (
              <div style={{
                position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)',
                background: 'var(--accent)', color: '#fff', padding: '6px 18px', borderRadius: 20,
                fontSize: 12, fontWeight: 500, pointerEvents: 'none', boxShadow: '0 2px 8px rgba(0,0,0,.2)',
              }}>
                Clique numa cadeira para sentar o convidado
              </div>
            )}

            <div style={{
              position: 'absolute', bottom: 16, right: 16,
              fontSize: 11, padding: '4px 12px', borderRadius: 20,
              background: assignedCount === guests.length && guests.length > 0 ? 'var(--success-bg)' : 'var(--gold-bg)',
              color: assignedCount === guests.length && guests.length > 0 ? 'var(--success)' : 'var(--gold)',
            }}>
              {assignedCount}/{guests.length} convidados sentados
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
