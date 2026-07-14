import { useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { MOCK_WEDDINGS, MOCK_GUESTS } from '../../data/mockData';

export default function PrintSeating() {
  const { id } = useParams();
  const wedding = MOCK_WEDDINGS.find(w => w.id === id);

  useEffect(() => {
    // Add print class to body when mounted to handle any global print styles if needed
    document.body.classList.add('print-mode');
    return () => document.body.classList.remove('print-mode');
  }, []);

  if (!wedding) return <Navigate to="/dashboard" replace />;

  const savedTables = localStorage.getItem(`ldv-tables-${id}`);
  const tables = savedTables ? JSON.parse(savedTables) : [];

  const savedGuests = localStorage.getItem(`ldv-guests-${id}`);
  const guests = savedGuests ? JSON.parse(savedGuests) : MOCK_GUESTS;

  // Group guests by table
  const guestsByTable = {};
  tables.forEach(t => { guestsByTable[t.id] = []; });
  const unassigned = [];

  guests.forEach(g => {
    if (g.assigned_seat) {
      const tableId = g.assigned_seat.split(':')[0];
      if (guestsByTable[tableId]) {
        guestsByTable[tableId].push(g);
      } else {
        unassigned.push(g);
      }
    } else {
      unassigned.push(g);
    }
  });

  return (
    <div style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto', background: '#fff', color: '#000', minHeight: '100vh' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #000', paddingBottom: 20, marginBottom: 40 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Planta de Mesas</h1>
          <div style={{ fontSize: 14, color: '#666', marginTop: 4 }}>
            {wedding.bride} & {wedding.groom} — {new Date(wedding.date).toLocaleDateString('pt-PT')}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <button className="btn btn-outline print-hide" onClick={() => window.print()} style={{ marginBottom: 10 }}>🖨️ Imprimir A4</button>
          <div style={{ fontSize: 12, color: '#666' }}>LDV CRM</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '40px' }}>
        {tables.map(table => {
          const tableGuests = guestsByTable[table.id] || [];
          return (
            <div key={table.id} style={{ border: '1px solid #ccc', borderRadius: 8, padding: 20 }}>
              <div style={{ borderBottom: '1px solid #eee', paddingBottom: 10, marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
                <strong style={{ fontSize: 16 }}>{table.label}</strong>
                <span style={{ fontSize: 12, color: '#666' }}>{tableGuests.length} / {table.max_seats} pax</span>
              </div>
              
              {tableGuests.length === 0 ? (
                <div style={{ fontSize: 13, color: '#999', fontStyle: 'italic' }}>Mesa vazia</div>
              ) : (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {tableGuests.map(g => (
                    <li key={g.id} style={{ fontSize: 14, display: 'flex', justifyContent: 'space-between' }}>
                      <span>{g.first_name} {g.last_name}</span>
                      {g.dietary_restriction && (
                        <span style={{ fontSize: 11, background: '#fef3c7', color: '#92400e', padding: '2px 6px', borderRadius: 4 }}>
                          {g.dietary_restriction}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>

      {unassigned.length > 0 && (
        <div style={{ marginTop: 40, border: '1px solid #fee2e2', borderRadius: 8, padding: 20, background: '#fef2f2' }}>
          <strong style={{ color: '#dc2626', display: 'block', marginBottom: 16 }}>⚠️ Convidados não sentados ({unassigned.length})</strong>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            {unassigned.map(g => (
              <li key={g.id} style={{ fontSize: 13, color: '#dc2626' }}>{g.first_name} {g.last_name}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Global styles for this specific page to hide header/sidebar during print via CSS classes */}
      <style>{`
        @media print {
          .print-hide { display: none !important; }
          body { background: white !important; }
          @page { margin: 1.5cm; }
        }
      `}</style>
    </div>
  );
}
