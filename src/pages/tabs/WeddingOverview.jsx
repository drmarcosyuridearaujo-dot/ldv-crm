import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import { MOCK_TASKS_TEMPLATE, MOCK_PHASES } from '../../data/mockData';

function InfoRow({ label, value, highlight }) {
  if (!value && value !== 0) return null;
  return (
    <div className="info-row">
      <div className="info-label">{label}</div>
      <div className="info-value" style={highlight ? { color: 'var(--error)', fontWeight: 600 } : {}}>{value}</div>
    </div>
  );
}

function BoolRow({ label, value, trueLabel = '✓ Sim', falseLabel = '✗ Não' }) {
  if (value === undefined || value === null) return null;
  return (
    <div className="info-row">
      <div className="info-label">{label}</div>
      <div className="info-value">
        <span style={{
          color: value ? 'var(--success)' : 'var(--text3)',
          fontWeight: value ? 600 : 400,
        }}>
          {value ? trueLabel : falseLabel}
        </span>
      </div>
    </div>
  );
}

function fmt(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('pt-PT', { day: '2-digit', month: 'long', year: 'numeric' });
}

function fmtTime(d) {
  if (!d) return '—';
  return new Date(d).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
}

function SectionCard({ title, children }) {
  return (
    <div className="card" style={{ marginBottom: 0 }}>
      <div className="card-header"><div className="card-title">{title}</div></div>
      <div className="card-body" style={{ padding: '8px 20px' }}>{children}</div>
    </div>
  );
}

export default function WeddingOverview() {
  const { wedding: w } = useOutletContext();
  const toast = useToast();
  const pct = Math.round((w.tasks_done / w.tasks_total) * 100);
  const daysLeft = Math.ceil((new Date(w.date) - new Date()) / 86400000);
  const totalPaid = w.payments?.filter(p => p.paid).reduce((s, p) => s + p.amount, 0) ?? w.paid ?? 0;
  const pending = w.budget - totalPaid;

  const STORAGE_KEY = `ldv-coord-notes-${w.id}`;
  const [coordNotes, setCoordNotes] = useState(() => localStorage.getItem(STORAGE_KEY) || '');
  const [isSaving, setIsSaving] = useState(false);

  const saveNotes = () => {
    setIsSaving(true);
    localStorage.setItem(STORAGE_KEY, coordNotes);
    setTimeout(() => {
      setIsSaving(false);
      toast('Notas da coordenadora guardadas com sucesso!', 'success');
    }, 400);
  };

  return (
    <div style={{ maxWidth: 1000 }}>

      {/* ── Stats row ── */}
      <div className="grid-4" style={{ marginBottom: 24 }}>
        {[
          { label: 'Adultos', value: w.guests_adult, icon: '👥' },
          { label: 'Crianças 4–9', value: w.guests_child_4_9, icon: '🧒' },
          { label: 'Bebés 0–3', value: w.guests_child_0_3, icon: '👶' },
          { label: 'Staff', value: w.guests_staff, icon: '👔' },
        ].map(s => (
          <div key={s.label} className="card" style={{ padding: '16px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: 22, marginBottom: 4 }}>{s.icon}</div>
            <div style={{ fontSize: 26, fontWeight: 700 }}>{s.value}</div>
            <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Main grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

        {/* Evento */}
        <SectionCard title="📅 Informações do Evento">
          <InfoRow label="Data" value={fmt(w.date)} />
          <InfoRow label="Hora" value={fmtTime(w.date)} />
          <InfoRow label="Local" value={w.venue} />
          <InfoRow label="Local Cerimónia" value={w.local_cerimonia} />
          {w.local_cerimonia_alt && <InfoRow label="Alternativa (chuva)" value={w.local_cerimonia_alt} />}
          <InfoRow label="Pacote" value={w.package === 'experience' ? '✨ Experience' : '⭐ Classic'} />
          <InfoRow label="Deal ID" value={w.deal_id} />
          <InfoRow label="Dias para o evento" value={daysLeft > 0 ? `${daysLeft} dias` : '✅ Realizado'} highlight={daysLeft > 0 && daysLeft < 30} />
        </SectionCard>

        {/* Equipa */}
        <SectionCard title="👤 Equipa">
          <InfoRow label="Planner" value={w.planner} />
          <InfoRow label="Catering Planner" value={w.catering_planner} />
          <InfoRow label="Decor Planner" value={w.decor_planner} />
        </SectionCard>

        {/* Detalhes Cerimónia */}
        <SectionCard title="💒 Cerimónia & Chegadas">
          <InfoRow label="Hora chegada noiva" value={fmtTime(w.hora_chegada_p1)} />
          <InfoRow label="Hora chegada noivo" value={fmtTime(w.hora_chegada_p2)} />
          <BoolRow label="Convidados antes dos noivos" value={w.convidados_antes_noivos} />
          <InfoRow label="Lugares reservados" value={w.lugares_reservados} />
          <BoolRow label="Lançamento do ramo" value={w.lancamento_ramo} />
          <InfoRow label="Local cerimónia" value={w.local_cerimonia} />
        </SectionCard>

        {/* Cocktail & Jantar */}
        <SectionCard title="🥂 Cocktail & Jantar">
          <InfoRow label="Fotos cocktail" value={w.fotos_cocktail} />
          <InfoRow label="Animação cocktail" value={w.animacao_cocktail} />
          <InfoRow label="Entrada na sala" value={fmtTime(w.hora_entrada_sala)} />
          <InfoRow label="Início da refeição" value={fmtTime(w.hora_inicio_refeicao)} />
          <InfoRow label="Atividade jantar" value={w.atividade_jantar} />
          <BoolRow label="Same Day Edit" value={w.same_day_edit} />
          {w.same_day_edit && <InfoRow label="Local SDE" value={w.local_sde} />}
        </SectionCard>

        {/* Ementa */}
        <SectionCard title="🍽 Ementa">
          <InfoRow label="Entrada" value={w.ementa_entrada} />
          <InfoRow label="Peixe" value={w.ementa_peixe} />
          <InfoRow label="Carne" value={w.ementa_carne} />
          <InfoRow label="Vegetariano" value={w.ementa_vegetariano} />
          <InfoRow label="Sobremesa" value={w.ementa_sobremesa} />
          <InfoRow label="Ceia" value={w.nota_ceia} />
        </SectionCard>

        {/* Restrições & Extras */}
        <SectionCard title="⚠️ Restrições & Extras">
          <BoolRow label="Restrições alimentares" value={w.restricoes_alimentares} />
          {w.restricoes_alimentares && (
            <>
              <InfoRow label="Tipo" value={w.tipo_restricao} highlight />
              <InfoRow label="Detalhe" value={w.detalhe_restricao} />
            </>
          )}
          <BoolRow label="Menus personalizados" value={w.menus_personalizados} />
          <BoolRow label="Lareira" value={w.lareira} />
          <BoolRow label="Cascata de fogo" value={w.cascata_fogo} />
          <BoolRow label="Sparkles" value={w.sparkles} />
          <InfoRow label="Corte do bolo" value={fmtTime(w.hora_corte_bolo)} />
          <BoolRow label="Surpresas aos convidados" value={w.surpresas_convidados} />
          <BoolRow label="Autocarros" value={w.autocarros} />
          {w.autocarros && <InfoRow label="Hora autocarros" value={fmtTime(w.hora_autocarros)} />}
        </SectionCard>

        {/* Progresso */}
        <div className="card" style={{ gridColumn: '1 / -1' }}>
          <div className="card-header">
            <div className="card-title">📋 Progresso de Tarefas</div>
            <div className="card-sub">{w.tasks_done} de {w.tasks_total} tarefas concluídas ({pct}%)</div>
          </div>
          <div className="card-body">
            <div className="progress-bar" style={{ height: 10, marginBottom: 16 }}>
              <div className="progress-fill" style={{ width: `${pct}%` }} />
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {MOCK_PHASES.map(ph => {
                const phaseTasks = MOCK_TASKS_TEMPLATE.filter(t => t.phaseId === ph.id);
                return (
                  <span key={ph.id} className={`phase-tag ${ph.color}`}>
                    {ph.label} · {phaseTasks.length} tarefas
                  </span>
                );
              })}
            </div>
          </div>
        </div>

        {/* Financeiro resumo */}
        <div className="card" style={{ gridColumn: '1 / -1' }}>
          <div className="card-header"><div className="card-title">💰 Financeiro (Resumo)</div></div>
          <div className="card-body" style={{ padding: '8px 20px' }}>
            <div style={{ display: 'flex', gap: 32, marginBottom: 16, flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 2 }}>Orçamento Global</div>
                <div style={{ fontSize: 22, fontWeight: 700 }}>
                  {w.budget?.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' })}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 2 }}>Total Pago</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--success)' }}>
                  {totalPaid.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' })}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 2 }}>Pendente</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: pending > 0 ? 'var(--error)' : 'var(--success)' }}>
                  {pending.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' })}
                </div>
              </div>
            </div>
            <div style={{ height: 8, background: 'var(--bg2)', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${Math.round((totalPaid / w.budget) * 100)}%`, background: 'var(--success)', transition: 'width .5s' }} />
            </div>
          </div>
        </div>

        {/* Notas do Casal */}
        {w.notes && (
          <div className="card" style={{ gridColumn: '1 / -1' }}>
            <div className="card-header"><div className="card-title">📝 Notas do Casal</div></div>
            <div className="card-body">
              <div style={{
                padding: '12px 16px',
                background: 'var(--warn-bg)',
                border: '1px solid #fde68a',
                borderLeft: '4px solid var(--warn)',
                borderRadius: 6,
                fontSize: 13,
                lineHeight: 1.6,
                color: 'var(--text)',
              }}>
                {w.notes}
              </div>
            </div>
          </div>
        )}

        {/* Notas da Coordenadora (Editável) */}
        <div className="card" style={{ gridColumn: '1 / -1' }}>
          <div className="card-header">
            <div className="card-title">📓 Notas da Coordenadora</div>
            <div className="card-sub">Anotações operacionais para o dia do evento</div>
          </div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <textarea
              className="input textarea"
              rows={4}
              placeholder="Ex: Avisar chefe de sala sobre a alergia da mesa 4. Ter atenção à chegada do avô..."
              value={coordNotes}
              onChange={e => setCoordNotes(e.target.value)}
            />
            <button 
              className="btn btn-primary" 
              style={{ alignSelf: 'flex-start' }}
              onClick={saveNotes}
              disabled={isSaving}
            >
              {isSaving ? 'A guardar...' : 'Guardar Notas'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
