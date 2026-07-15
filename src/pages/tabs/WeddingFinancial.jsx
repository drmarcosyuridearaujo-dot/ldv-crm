import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';

function fmt(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' });
}

function eur(n) {
  return (n || 0).toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' });
}

// Catálogo de extras de menu — categorias e pratos replicados do original.
const EXTRAS_CATALOG = [
  { label: 'Aperitivos', items: ['Mesa de Sushi', 'Buffet de Marisco', 'Show Cooking'] },
  { label: 'Entrada à Mesa', items: ['Pêra abacate com gambas', 'Espargos com molho holandês e salmão fumado', 'Creme de espargos', 'Vol Au Vent de marisco'] },
  { label: 'Prato de Peixe', items: ['Camarão tigre grelhado', 'Folhado de robalo e gambas', 'Mil folhas de bacalhau'] },
  { label: 'Prato de Carne', items: ['Magret de pato', 'Cabritinho de leite', 'Tornedó de boi', 'Chateaubriand'] },
  { label: 'Sobremesa à Mesa', items: ['Delícia cremosa de chocolate', 'Creme Brulée', 'Tarte de limão desconstruída', 'Crumble de maçã'] },
  { label: 'Ceia', items: ['Finger Food', 'Tradicional', 'Churrasquinho'] },
];

// 5 estados de pagamento — cores mapeadas para as nossas variáveis CSS
// (Pendente = neutro, Enviado = aviso, restantes 3 = sucesso — tal como no original).
const PAYMENT_STATES = ['Pendente', 'Enviado', 'Pagamento Confirmado', 'Fatura emitida', 'Pago em Numerário'];
const PAID_STATES = ['Pagamento Confirmado', 'Fatura emitida', 'Pago em Numerário'];

function stateStyle(state) {
  if (PAID_STATES.includes(state)) return { bg: 'var(--success-bg)', color: 'var(--success)' };
  if (state === 'Enviado') return { bg: 'var(--warn-bg)', color: 'var(--warn)' };
  return { bg: 'var(--bg3)', color: 'var(--text2)' };
}

function ContractSummary({ contract, onChange }) {
  const [customExtra, setCustomExtra] = useState('');
  const c = contract || {};
  const extras = c.extras || [];
  const menuTotal = (c.menu_value || 0) + extras.filter(x => x.enabled).reduce((s, x) => s + (x.value || 0), 0);

  const availableCatalog = EXTRAS_CATALOG
    .map(cat => ({ ...cat, items: cat.items.filter(name => !extras.some(x => x.name === name)) }))
    .filter(cat => cat.items.length > 0);

  const addExtra = (name) => {
    if (!name) return;
    onChange({ ...c, extras: [...extras, { id: `extra_${Date.now()}`, name, value: 0, enabled: true }] });
  };
  const removeExtra = (id) => {
    onChange({ ...c, extras: extras.filter(x => x.id !== id) });
  };
  const updateExtraValue = (id, value) => {
    onChange({ ...c, extras: extras.map(x => x.id === id ? { ...x, value } : x) });
  };

  return (
    <div className="card">
      <div className="card-header"><div className="card-title">📄 Resumo Serviço Contratado</div></div>
      <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div className="form-group">
          <label className="label">Nome do Menu</label>
          <input className="input" value={c.menu_name || ''} onChange={e => onChange({ ...c, menu_name: e.target.value })} />
        </div>

        <div className="grid-3">
          <div className="form-group">
            <label className="label">Valor do Menu (€/pp)</label>
            <input className="input" type="number" min="0" step="0.01" value={c.menu_value || 0}
              onChange={e => onChange({ ...c, menu_value: parseFloat(e.target.value) || 0 })} />
          </div>
          <div className="form-group">
            <label className="label">Convidados Mínimos</label>
            <input className="input" type="number" min="0" value={c.min_guests || 0}
              onChange={e => onChange({ ...c, min_guests: parseInt(e.target.value, 10) || 0 })} />
          </div>
          <div className="form-group">
            <label className="label">Valor de Reserva (€)</label>
            <input className="input" type="number" min="0" step="0.01" value={c.reservation_value || 0}
              onChange={e => onChange({ ...c, reservation_value: parseFloat(e.target.value) || 0 })} />
          </div>
        </div>

        <div>
          <label className="label" style={{ display: 'block', marginBottom: 8 }}>Extras do Menu</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
            {extras.map(x => (
              <div key={x.id} style={{ display: 'flex', alignItems: 'center', gap: 6, border: '1px solid var(--border2)', borderRadius: 20, padding: '5px 8px 5px 12px', background: 'var(--bg2)' }}>
                <span style={{ fontSize: 12, whiteSpace: 'nowrap' }}>{x.name}</span>
                <input
                  className="input"
                  type="number" min="0" step="0.01"
                  style={{ width: 64, height: 24, fontSize: 11, padding: '2px 4px' }}
                  value={x.value || 0}
                  onChange={e => updateExtraValue(x.id, parseFloat(e.target.value) || 0)}
                />
                <span style={{ fontSize: 10, color: 'var(--text3)' }}>€/pp</span>
                <button className="btn-icon" style={{ padding: 2 }} onClick={() => removeExtra(x.id)}>✕</button>
              </div>
            ))}
            {extras.length === 0 && <span style={{ fontSize: 12, color: 'var(--text3)', fontStyle: 'italic' }}>Nenhum extra adicionado.</span>}
          </div>

          {availableCatalog.length > 0 && (
            <select className="input" style={{ maxWidth: 280, height: 32, fontSize: 12 }}
              value=""
              onChange={e => { addExtra(e.target.value); e.target.value = ''; }}
            >
              <option value="">+ Adicionar extra do catálogo...</option>
              {availableCatalog.map(cat => (
                <optgroup key={cat.label} label={cat.label}>
                  {cat.items.map(name => <option key={name} value={name}>{name}</option>)}
                </optgroup>
              ))}
            </select>
          )}

          <div style={{ display: 'flex', gap: 8, marginTop: 8, maxWidth: 340 }}>
            <input className="input" style={{ height: 32, fontSize: 12 }} placeholder="Extra personalizado..."
              value={customExtra} onChange={e => setCustomExtra(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && customExtra.trim()) { addExtra(customExtra.trim()); setCustomExtra(''); } }}
            />
            <button className="btn btn-outline btn-sm" disabled={!customExtra.trim()}
              onClick={() => { addExtra(customExtra.trim()); setCustomExtra(''); }}
            >
              + Adicionar
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, borderTop: '1px solid var(--border)' }}>
          <span style={{ fontSize: 13, fontWeight: 500 }}>Total do Menu</span>
          <span style={{ fontSize: 14, fontWeight: 700 }}>{eur(menuTotal)}/pp</span>
        </div>

        <div className="form-group">
          <label className="label">Notas do Contrato</label>
          <textarea className="input textarea" rows={2} value={c.notes || ''}
            onChange={e => onChange({ ...c, notes: e.target.value })}
            placeholder="Observações sobre o contrato..."
          />
        </div>
      </div>
    </div>
  );
}

// Nº de convidados mínimos faturados vs contagem real — replica a fórmula exata do
// original: efetivo = adultos + (crianças pagantes × 0,5) + (staff × 0,5).
// Crianças grátis (0–3) não entram na conta.
function GuestCountCheck({ wedding, minGuests }) {
  const adults = wedding.guests_adult || 0;
  const kidsPaying = wedding.guests_child_4_9 || 0;
  const kidsFree = wedding.guests_child_0_3 || 0;
  const staff = wedding.guests_staff || 0;
  const effective = adults + kidsPaying * 0.5 + staff * 0.5;
  const underMinimum = minGuests > 0 && effective < minGuests;

  const rows = [
    { label: 'Adultos', value: adults },
    { label: 'Crianças Pagantes (4–9)', value: kidsPaying },
    { label: 'Crianças Grátis (0–3)', value: kidsFree },
    { label: 'Staff', value: staff },
  ];

  return (
    <div className="card">
      <div className="card-header"><div className="card-title">👥 Convidados Mínimos vs. Contagem Real</div></div>
      <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {rows.map(r => (
          <div key={r.label} className="info-row">
            <div className="info-label">{r.label}</div>
            <div className="info-value">{r.value}</div>
          </div>
        ))}
        <div className="info-row">
          <div className="info-label" style={{ fontWeight: 600 }}>Contagem Efetiva (faturável)</div>
          <div className="info-value" style={{ fontWeight: 700 }}>{effective.toFixed(1)}</div>
        </div>
        <div className="info-row">
          <div className="info-label">Convidados Mínimos (Contrato)</div>
          <div className="info-value">{minGuests || '—'}</div>
        </div>

        {underMinimum && (
          <div style={{ display: 'flex', gap: 8, marginTop: 8, padding: '8px 12px', background: 'var(--warn-bg)', border: '1px solid #fde68a', borderRadius: 6, fontSize: 12, color: 'var(--warn)' }}>
            ⚠️ Contagem efetiva ({effective.toFixed(1)}) abaixo do mínimo contratado ({minGuests}).
          </div>
        )}
        <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 4, fontStyle: 'italic' }}>
          Fórmula: adultos + (crianças pagantes × 0,5) + (staff × 0,5). Crianças grátis não contam.
        </div>
      </div>
    </div>
  );
}

export default function WeddingFinancial() {
  const { wedding } = useOutletContext();
  const toast = useToast();

  const [payments, setPayments] = useState(
    (wedding.payments || []).map(p => ({ ...p }))
  );
  const [contract, setContract] = useState(() => ({ ...(wedding.financial_contract || {}) }));

  if (!wedding) return <div className="page-content">A carregar...</div>;

  const totalPaid = payments.filter(p => p.paid).reduce((sum, p) => sum + p.amount, 0);
  const pending   = wedding.budget - totalPaid;
  const percent   = Math.round((totalPaid / wedding.budget) * 100) || 0;

  const updateState = (id, state) => {
    setPayments(ps => ps.map(x => x.id === id ? { ...x, state, paid: PAID_STATES.includes(state) } : x));
    toast(PAID_STATES.includes(state) ? '✓ Pagamento atualizado!' : 'Estado atualizado', PAID_STATES.includes(state) ? 'success' : undefined);
  };

  const isOverdue = (p) => {
    if (p.paid) return false;
    return new Date(p.date) < new Date();
  };

  return (
    <div className="page-content" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: 18, fontWeight: 600 }}>Gestão Financeira</h2>
        <button
          className="btn btn-primary btn-sm"
          onClick={() => toast('Funcionalidade de nova fatura em desenvolvimento', 'info')}
        >
          + Nova Fatura
        </button>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 6 }}>Orçamento Global</div>
          <div style={{ fontSize: 26, fontWeight: 700 }}>{eur(wedding.budget)}</div>
        </div>
        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 6 }}>Total Pago</div>
          <div style={{ fontSize: 26, fontWeight: 700, color: 'var(--success)' }}>{eur(totalPaid)}</div>
        </div>
        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 6 }}>
            {pending > 0 ? 'Valor Pendente' : '✓ Liquidado!'}
          </div>
          <div style={{ fontSize: 26, fontWeight: 700, color: pending > 0 ? 'var(--error)' : 'var(--success)' }}>
            {eur(pending)}
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="card" style={{ padding: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, alignItems: 'center' }}>
          <span style={{ fontSize: 14, fontWeight: 600 }}>Progresso de Pagamentos</span>
          <span style={{
            fontSize: 13, fontWeight: 700,
            color: percent === 100 ? 'var(--success)' : percent > 60 ? 'var(--warn)' : 'var(--error)',
          }}>{percent}%</span>
        </div>
        <div style={{ height: 10, background: 'var(--bg2)', borderRadius: 5, overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: `${percent}%`,
            background: percent === 100 ? 'var(--success)' : 'linear-gradient(90deg, var(--accent), var(--success))',
            transition: 'width 0.5s ease',
            borderRadius: 5,
          }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 11, color: 'var(--text3)' }}>
          <span>{payments.filter(p => p.paid).length} prestações pagas</span>
          <span>{payments.filter(p => !p.paid).length} prestações pendentes</span>
        </div>
      </div>

      {/* Resumo de Contrato + Convidados mínimos */}
      <div className="grid-2">
        <ContractSummary contract={contract} onChange={setContract} />
        <GuestCountCheck wedding={wedding} minGuests={contract.min_guests} />
      </div>

      {/* Payments table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div className="card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="card-title">Plano de Pagamentos</div>
          <div className="card-sub">
            {payments.filter(p => isOverdue(p)).length > 0 && (
              <span style={{ color: 'var(--error)', fontWeight: 600 }}>
                ⚠️ {payments.filter(p => isOverdue(p)).length} em atraso
              </span>
            )}
          </div>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '10px 16px', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '.04em', color: 'var(--text3)' }}>Descrição</th>
              <th style={{ padding: '10px 16px', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '.04em', color: 'var(--text3)' }}>Data Limite</th>
              <th style={{ padding: '10px 16px', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '.04em', color: 'var(--text3)' }}>Valor</th>
              <th style={{ padding: '10px 16px', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '.04em', color: 'var(--text3)' }}>Método</th>
              <th style={{ padding: '10px 16px', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '.04em', color: 'var(--text3)' }}>Estado</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p, i) => {
              const overdue = isOverdue(p);
              const st = stateStyle(p.state || (p.paid ? 'Pagamento Confirmado' : 'Pendente'));
              return (
                <tr
                  key={p.id}
                  style={{
                    borderBottom: i < payments.length - 1 ? '1px solid var(--border)' : 'none',
                    background: overdue ? 'var(--error-bg)' : p.paid ? 'var(--success-bg)' : 'transparent',
                  }}
                >
                  <td style={{ padding: '13px 16px', fontWeight: 500 }}>{p.label}</td>
                  <td style={{ padding: '13px 16px', color: overdue ? 'var(--error)' : 'var(--text2)', fontWeight: overdue ? 600 : 400 }}>
                    {fmt(p.date)}{overdue && ' ⚠️'}
                  </td>
                  <td style={{ padding: '13px 16px', fontWeight: 700, fontSize: 14 }}>
                    {eur(p.amount)}
                  </td>
                  <td style={{ padding: '13px 16px' }}>
                    {p.method
                      ? <span style={{ padding: '2px 9px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 12, fontSize: 11 }}>{p.method}</span>
                      : <span style={{ color: 'var(--text3)', fontSize: 12 }}>—</span>
                    }
                  </td>
                  <td style={{ padding: '13px 16px' }}>
                    <select
                      className="input"
                      style={{ height: 30, fontSize: 12, padding: '2px 8px', background: st.bg, color: st.color, border: 'none', fontWeight: 600 }}
                      value={p.state || (p.paid ? 'Pagamento Confirmado' : 'Pendente')}
                      onChange={e => updateState(p.id, e.target.value)}
                    >
                      {PAYMENT_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                </tr>
              );
            })}
            {payments.length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: 24, textAlign: 'center', color: 'var(--text3)', fontStyle: 'italic' }}>
                  Nenhum plano de pagamentos registado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
