import { useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { MOCK_WEDDINGS, MOCK_DECOR } from '../../data/mockData';

export default function PrintDecor() {
  const { id } = useParams();
  const wedding = MOCK_WEDDINGS.find(w => w.id === id);

  useEffect(() => {
    document.body.classList.add('print-mode');
    return () => document.body.classList.remove('print-mode');
  }, []);

  if (!wedding) return <Navigate to="/dashboard" replace />;

  const Section = ({ title, children }) => (
    <div style={{ marginBottom: 30, breakInside: 'avoid' }}>
      <h3 style={{ fontSize: 16, borderBottom: '1px solid #ccc', paddingBottom: 6, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</h3>
      {children}
    </div>
  );

  const Item = ({ label, value }) => {
    if (!value) return null;
    return (
      <div style={{ display: 'flex', gap: 16, marginBottom: 8, fontSize: 14 }}>
        <strong style={{ width: 160, flexShrink: 0, color: '#444' }}>{label}</strong>
        <div>{value}</div>
      </div>
    );
  };

  return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto', background: '#fff', color: '#000', minHeight: '100vh' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #000', paddingBottom: 20, marginBottom: 40 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Ficha de Decoração</h1>
          <div style={{ fontSize: 14, color: '#666', marginTop: 4 }}>
            {wedding.bride} & {wedding.groom} — {new Date(wedding.date).toLocaleDateString('pt-PT')}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <button className="btn btn-outline print-hide" onClick={() => window.print()} style={{ marginBottom: 10 }}>🖨️ Imprimir A4</button>
          <div style={{ fontSize: 12, color: '#666' }}>Pacote: {MOCK_DECOR.package.toUpperCase()}</div>
        </div>
      </div>

      <Section title="Cerimónia">
        <Item label="Local" value={wedding.local_cerimonia} />
        <Item label="Altar" value={MOCK_DECOR.cerimonia_altar} />
        <Item label="Corredor" value={MOCK_DECOR.cerimonia_corredor} />
        <Item label="Chuva de Amor" value={MOCK_DECOR.cerimonia_chuva_amor} />
      </Section>

      <Section title="Mesas & Layout">
        <Item label="Mesa dos Noivos" value={MOCK_DECOR.mesa_noivos} />
        <Item label="Mesa Redonda (Guest)" value={MOCK_DECOR.mesas_convidados_redondas} />
        <Item label="Mesa Retangular (Guest)" value={MOCK_DECOR.mesas_convidados_retangulares} />
        <Item label="Marcação de Mesas" value={MOCK_DECOR.marcacao_mesa} />
      </Section>

      <Section title="Composições Florais">
        <Item label="Floral Mesa Noivos" value={MOCK_DECOR.mesa_noivos_floral} />
        {MOCK_DECOR.mesa_redonda && (
          <div style={{ marginBottom: 8, fontSize: 14 }}>
            <strong style={{ display: 'block', marginBottom: 4, color: '#444' }}>Centro Mesa Redonda</strong>
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              <li>{MOCK_DECOR.mesa_redonda.centro}</li>
              <li>{MOCK_DECOR.mesa_redonda.velas}</li>
              <li>{MOCK_DECOR.mesa_redonda.extras}</li>
            </ul>
          </div>
        )}
        <Item label="Suspensão (Teto)" value={MOCK_DECOR.suspensao} />
        <Item label="Mesa do Bolo" value={MOCK_DECOR.corte_bolo} />
      </Section>

      <Section title="Pessoais & Outros">
        <Item label="Bouquets & Boutonnières" value={MOCK_DECOR.bouquets_boutonnieres} />
        <Item label="Outros Elementos" value={MOCK_DECOR.outros} />
      </Section>

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
