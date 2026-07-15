import { useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { MOCK_WEDDINGS, MOCK_TIMELINE_PLANNING } from '../../data/mockData';

export default function PrintTimeline() {
  const { id } = useParams();
  const wedding = MOCK_WEDDINGS.find(w => w.id === id);

  useEffect(() => {
    document.body.classList.add('print-mode');
    return () => document.body.classList.remove('print-mode');
  }, []);

  if (!wedding) return <Navigate to="/dashboard" replace />;

  return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto', background: '#fff', color: '#000', minHeight: '100vh' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #000', paddingBottom: 20, marginBottom: 40 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Timeline Planning</h1>
          <div style={{ fontSize: 14, color: '#666', marginTop: 4 }}>
            {wedding.bride} & {wedding.groom} — {new Date(wedding.date).toLocaleDateString('pt-PT')}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <button className="btn btn-outline print-hide" onClick={() => window.print()} style={{ marginBottom: 10 }}>🖨️ Imprimir A4</button>
          <div style={{ fontSize: 12, color: '#666' }}>Convidados: {wedding.guests_adult + wedding.guests_child_4_9} pax</div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {MOCK_TIMELINE_PLANNING.map((item, idx) => (
          <div key={item.id} style={{
            display: 'flex',
            padding: '12px 0',
            borderBottom: idx < MOCK_TIMELINE_PLANNING.length - 1 ? '1px solid #eee' : 'none',
            pageBreakInside: 'avoid'
          }}>
            <div style={{ width: '80px', fontWeight: 600, fontSize: 14, flexShrink: 0 }}>
              {item.time}
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                {item.label}
                {item.visible_to_vendors === false && (
                  <span style={{ fontSize: 10, fontWeight: 400, color: '#999' }}>(interno)</span>
                )}
              </div>

              {(item.local || item.notes) && (
                <div style={{ marginTop: 6, fontSize: 12, color: '#555', display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {item.local && <div>📍 Local: {item.local}</div>}
                  {item.notes && <div style={{ color: '#d97706', fontWeight: 500 }}>⚠ Nota: {item.notes}</div>}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

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
