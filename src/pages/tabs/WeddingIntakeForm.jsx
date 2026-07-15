import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { MOCK_INTAKE_QUESTIONS } from '../../data/mockData';
import { useToast } from '../../context/ToastContext';

function fmt(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('pt-PT', { day: '2-digit', month: 'long', year: 'numeric' });
}

export default function WeddingIntakeForm() {
  const { wedding } = useOutletContext();
  const toast = useToast();
  const [form, setForm] = useState(() => wedding.intake_form || { assigned: false, submitted_at: null, answers: {} });

  const sections = [...new Set(MOCK_INTAKE_QUESTIONS.map(q => q.section))];
  const answeredCount = Object.values(form.answers || {}).filter(a => a && a.trim()).length;

  const assign = () => {
    setForm({ assigned: true, submitted_at: null, answers: {} });
    toast('Formulário atribuído ao casal', 'success');
  };
  const removeForm = () => {
    if (!window.confirm('Remover o formulário de intake deste casamento?')) return;
    setForm({ assigned: false, submitted_at: null, answers: {} });
    toast('Formulário removido');
  };
  const markSubmitted = () => {
    setForm(f => ({ ...f, submitted_at: new Date().toISOString() }));
    toast('Formulário marcado como respondido', 'success');
  };
  const updateAnswer = (qId, value) => {
    setForm(f => ({ ...f, answers: { ...f.answers, [qId]: value } }));
  };

  return (
    <div style={{ maxWidth: 800, display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 600 }}>Formulário de Intake</h2>
          <div style={{ fontSize: 13, color: 'var(--text3)', marginTop: 2 }}>
            {!form.assigned
              ? 'Nenhum formulário atribuído a este casamento'
              : form.submitted_at
                ? `Respondido em ${fmt(form.submitted_at)} · ${answeredCount}/${MOCK_INTAKE_QUESTIONS.length} perguntas`
                : 'Formulário enviado — aguarda resposta do casal'}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {!form.assigned && (
            <button className="btn btn-primary btn-sm" onClick={assign}>+ Atribuir Formulário</button>
          )}
          {form.assigned && !form.submitted_at && (
            <button className="btn btn-outline btn-sm" onClick={markSubmitted}>Marcar como Respondido</button>
          )}
          {form.assigned && (
            <button className="btn btn-danger btn-sm" onClick={removeForm}>Remover</button>
          )}
        </div>
      </div>

      {!form.assigned ? (
        <div className="card" style={{ padding: 40, textAlign: 'center' }}>
          <div style={{ fontSize: 32, marginBottom: 10 }}>📝</div>
          <div style={{ fontSize: 14, color: 'var(--text2)', fontWeight: 500 }}>Sem formulário de intake</div>
          <div style={{ fontSize: 13, color: 'var(--text3)', marginTop: 4 }}>
            Atribui o formulário para começares a recolher informações do casal.
          </div>
        </div>
      ) : !form.submitted_at ? (
        <div className="card" style={{ padding: 40, textAlign: 'center', background: 'var(--warn-bg)', borderColor: 'var(--gold-border)' }}>
          <div style={{ fontSize: 32, marginBottom: 10 }}>⏳</div>
          <div style={{ fontSize: 14, color: 'var(--warn)', fontWeight: 600 }}>Formulário enviado ao casal</div>
          <div style={{ fontSize: 13, color: 'var(--text3)', marginTop: 4 }}>
            Ainda aguarda resposta. Podes registar as respostas assim que o casal responder.
          </div>
        </div>
      ) : (
        sections.map(section => (
          <div key={section} className="card">
            <div className="card-header"><div className="card-title">{section}</div></div>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {MOCK_INTAKE_QUESTIONS.filter(q => q.section === section).map(q => (
                <div key={q.id} className="form-group">
                  <label className="label">{q.question}</label>
                  <textarea
                    className="input textarea"
                    rows={2}
                    placeholder="Não respondido"
                    value={form.answers[q.id] || ''}
                    onChange={e => updateAnswer(q.id, e.target.value)}
                  />
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
