import { useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { MOCK_WEDDINGS, MOCK_DECOR } from '../../data/mockData';

const CATEGORY_LABELS = {
  bases: 'Bases',
  candeeiros: 'Candeeiros',
  casticais: 'Castiçais',
  campanulas: 'Campânulas',
  tealights: 'Tealights',
  jarrinhas: 'Jarrinhas',
  tabuleiros: 'Tabuleiros',
  outros: 'Outros',
};

export default function PrintDecorItems() {
  const { id } = useParams();
  const wedding = MOCK_WEDDINGS.find(w => w.id === id);

  useEffect(() => {
    document.body.classList.add('print-mode');
    return () => document.body.classList.remove('print-mode');
  }, []);

  if (!wedding) return <Navigate to="/dashboard" replace />;

  return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto', background: '#fff', color: '#000', minHeight: '100vh' }}>

      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #000', paddingBottom: 20, marginBottom: 30 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Lista de Inventário — Decoração</h1>
          <div style={{ fontSize: 14, color: '#666', marginTop: 4 }}>
            {wedding.bride} & {wedding.groom} — {new Date(wedding.date).toLocaleDateString('pt-PT')}
          </div>
        </div>
        <button className="btn btn-outline print-hide" onClick={() => window.print()} style={{ marginBottom: 10, height: 'fit-content' }}>
          🖨️ Imprimir A4
        </button>
      </div>

      {Object.entries(MOCK_DECOR.items).map(([cat, list]) => (
        <div key={cat} style={{ marginBottom: 26, breakInside: 'avoid' }}>
          <h3 style={{ fontSize: 15, borderBottom: '1px solid #ccc', paddingBottom: 6, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '.05em' }}>
            {CATEGORY_LABELS[cat] || cat}
          </h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <tbody>
              {list.map(item => (
                <tr key={item.nome} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '6px 4px', width: 24 }}>☐</td>
                  <td style={{ padding: '6px 4px' }}>{item.nome}</td>
                  <td style={{ padding: '6px 4px', width: 80, color: '#666' }}>Qtd: ____</td>
                  <td style={{ padding: '6px 4px', width: 200, color: '#666' }}>Obs: _______________</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}

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
