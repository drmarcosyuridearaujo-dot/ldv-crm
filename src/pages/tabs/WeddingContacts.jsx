import { useState } from 'react';
import { MOCK_STAFF, MOCK_FORNECEDORES } from '../../data/mockData';
import { useToast } from '../../context/ToastContext';

function CopyBtn({ text }) {
  const toast = useToast();
  if (!text) return null;
  return (
    <button
      className="btn btn-ghost btn-xs"
      style={{ padding: '2px 6px', fontSize: 11 }}
      onClick={(e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(text).then(() => toast('Copiado!', 'success'));
      }}
      title="Copiar"
    >
      📋
    </button>
  );
}

export default function WeddingContacts() {
  const [staffSearch, setStaffSearch] = useState('');
  const [fornSearch, setFornSearch] = useState('');

  const filteredStaff = MOCK_STAFF.filter(s =>
    s.name.toLowerCase().includes(staffSearch.toLowerCase()) ||
    s.role.toLowerCase().includes(staffSearch.toLowerCase())
  );

  const filteredForn = MOCK_FORNECEDORES.filter(f =>
    f.nome.toLowerCase().includes(fornSearch.toLowerCase()) ||
    f.tipo.toLowerCase().includes(fornSearch.toLowerCase())
  );

  const fornedoresByType = filteredForn.reduce((acc, f) => {
    if (!acc[f.tipo]) acc[f.tipo] = [];
    acc[f.tipo].push(f);
    return acc;
  }, {});

  const roleColor = (role) => {
    if (role.includes('Coordena')) return { bg: '#ede9fe', color: '#5b21b6' };
    if (role.includes('Chef') || role.includes('Cozinha')) return { bg: '#fef3c7', color: '#92400e' };
    if (role.includes('Catering')) return { bg: '#ecfdf5', color: '#059669' };
    if (role.includes('Sala')) return { bg: '#eff6ff', color: '#1e40af' };
    return { bg: 'var(--bg3)', color: 'var(--text2)' };
  };

  const tipoIcon = (tipo) => {
    const map = {
      'Música': '🎵', 'Fotografia': '📷', 'Vídeo': '🎬',
      'Florista': '🌸', 'Bolo': '🎂', 'Transporte': '🚌', 'Animação': '🎩',
      'Beleza': '💄', 'Celebrante': '🕊️',
    };
    return map[tipo] || '📋';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32, maxWidth: 1000 }}>

      {/* ── Equipa Interna ── */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600 }}>Equipa Interna</h2>
          <input
            className="input"
            style={{ width: 200 }}
            placeholder="Pesquisar..."
            value={staffSearch}
            onChange={e => setStaffSearch(e.target.value)}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
          {filteredStaff.map(s => {
            const rc = roleColor(s.role);
            return (
              <div key={s.id} className="card" style={{ padding: 16, display: 'flex', gap: 14, alignItems: 'center' }}>
                <div style={{
                  width: 44, height: 44, borderRadius: '50%',
                  background: rc.bg, color: rc.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: 15, flexShrink: 0,
                }}>
                  {s.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{s.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 6 }}>{s.role}</div>
                  {s.phone ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <a
                        href={`tel:${s.phone}`}
                        style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 500 }}
                      >
                        {s.phone}
                      </a>
                      <CopyBtn text={s.phone} />
                    </div>
                  ) : (
                    <div style={{ fontSize: 12, color: 'var(--text3)', fontStyle: 'italic' }}>Sem contacto</div>
                  )}
                </div>
              </div>
            );
          })}
          {filteredStaff.length === 0 && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'var(--text3)', padding: 24, fontStyle: 'italic' }}>
              Nenhum resultado.
            </div>
          )}
        </div>
      </div>

      {/* ── Fornecedores Externos ── */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600 }}>Fornecedores Externos</h2>
          <input
            className="input"
            style={{ width: 200 }}
            placeholder="Pesquisar..."
            value={fornSearch}
            onChange={e => setFornSearch(e.target.value)}
          />
        </div>

        {Object.keys(fornedoresByType).length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text3)', padding: 24, fontStyle: 'italic' }}>
            Nenhum resultado.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {Object.entries(fornedoresByType).map(([tipo, items]) => (
              <div key={tipo}>
                <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--text3)', marginBottom: 8 }}>
                  {tipoIcon(tipo)} {tipo}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {items.map(f => (
                    <div key={f.id} className="card" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                      <div style={{ flex: 1, minWidth: 160 }}>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{f.nome}</div>
                        {f.email && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                            <a href={`mailto:${f.email}`} style={{ fontSize: 12, color: 'var(--text3)' }}>{f.email}</a>
                            <CopyBtn text={f.email} />
                          </div>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <a
                          href={`tel:${f.contacto}`}
                          style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 500 }}
                        >
                          {f.contacto}
                        </a>
                        <CopyBtn text={f.contacto} />
                        <a
                          href={`https://wa.me/${f.contacto.replace(/\s|\+/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-ghost btn-xs"
                          style={{ fontSize: 11 }}
                          title="WhatsApp"
                        >
                          💬 WA
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
