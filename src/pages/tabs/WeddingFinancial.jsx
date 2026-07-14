import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';

function fmt(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function WeddingFinancial() {
  const { wedding } = useOutletContext();
  const toast = useToast();

  const [payments, setPayments] = useState(
    (wedding.payments || []).map(p => ({ ...p }))
  );

  if (!wedding) return <div className="page-content">A carregar...</div>;

  const totalPaid = payments.filter(p => p.paid).reduce((sum, p) => sum + p.amount, 0);
  const pending   = wedding.budget - totalPaid;
  const percent   = Math.round((totalPaid / wedding.budget) * 100) || 0;

  const togglePaid = (id) => {
    setPayments(ps => {
      const p = ps.find(x => x.id === id);
      if (!p) return ps;
      const wasPaid = p.paid;
      const updated = ps.map(x => x.id === id ? { ...x, paid: !x.paid } : x);
      toast(wasPaid ? 'Pagamento marcado como pendente' : '✓ Pagamento registado!', wasPaid ? undefined : 'success');
      return updated;
    });
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
          <div style={{ fontSize: 26, fontWeight: 700 }}>
            {wedding.budget.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' })}
          </div>
        </div>
        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 6 }}>Total Pago</div>
          <div style={{ fontSize: 26, fontWeight: 700, color: 'var(--success)' }}>
            {totalPaid.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' })}
          </div>
        </div>
        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 6 }}>
            {pending > 0 ? 'Valor Pendente' : '✓ Liquidado!'}
          </div>
          <div style={{ fontSize: 26, fontWeight: 700, color: pending > 0 ? 'var(--error)' : 'var(--success)' }}>
            {pending.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' })}
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
              <th style={{ padding: '10px 16px', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '.04em', color: 'var(--text3)' }}></th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p, i) => {
              const overdue = isOverdue(p);
              return (
                <tr
                  key={p.id}
                  style={{
                    borderBottom: i < payments.length - 1 ? '1px solid var(--border)' : 'none',
                    background: overdue ? '#fef2f2' : p.paid ? '#f0fdf4' : 'transparent',
                  }}
                >
                  <td style={{ padding: '13px 16px', fontWeight: 500 }}>{p.label}</td>
                  <td style={{ padding: '13px 16px', color: overdue ? 'var(--error)' : 'var(--text2)', fontWeight: overdue ? 600 : 400 }}>
                    {fmt(p.date)}{overdue && ' ⚠️'}
                  </td>
                  <td style={{ padding: '13px 16px', fontWeight: 700, fontSize: 14 }}>
                    {p.amount.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' })}
                  </td>
                  <td style={{ padding: '13px 16px' }}>
                    {p.method
                      ? <span style={{ padding: '2px 9px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 12, fontSize: 11 }}>{p.method}</span>
                      : <span style={{ color: 'var(--text3)', fontSize: 12 }}>—</span>
                    }
                  </td>
                  <td style={{ padding: '13px 16px' }}>
                    {p.paid
                      ? <span style={{ color: 'var(--success)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <span>✓</span> Pago
                        </span>
                      : <span style={{ color: overdue ? 'var(--error)' : 'var(--warn)', fontWeight: 600 }}>
                          {overdue ? '⚠️ Em atraso' : '⏳ Pendente'}
                        </span>
                    }
                  </td>
                  <td style={{ padding: '13px 16px' }}>
                    <button
                      className={`btn btn-sm ${p.paid ? 'btn-ghost' : 'btn-outline'}`}
                      onClick={() => togglePaid(p.id)}
                    >
                      {p.paid ? 'Desmarcar' : '✓ Pago'}
                    </button>
                  </td>
                </tr>
              );
            })}
            {payments.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: 24, textAlign: 'center', color: 'var(--text3)', fontStyle: 'italic' }}>
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
