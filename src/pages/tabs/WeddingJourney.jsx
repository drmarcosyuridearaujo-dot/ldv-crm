import { useState, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { MOCK_TASKS_TEMPLATE, MOCK_PHASES, DEADLINE_TYPE_LABELS } from '../../data/mockData';
import { useToast } from '../../context/ToastContext';

const ASSIGNEES = [...new Set(MOCK_TASKS_TEMPLATE.map(t => t.assignee))].sort();

const DEADLINE_BADGE_STYLE = {
  immediate:   { bg: 'var(--accent-bg)', color: 'var(--accent)' },
  before:      { bg: 'var(--bg3)', color: 'var(--text2)' },
  wedding_day: { bg: 'var(--gold-bg)', color: 'var(--gold)' },
  after:       { bg: 'var(--success-bg)', color: 'var(--success)' },
};

export default function WeddingJourney() {
  const { wedding } = useOutletContext();
  // Tarefas do pacote Experience só aparecem para casamentos Experience —
  // réplica de "journey.essentialsLabel" / "journey.experienceLabel" do original.
  const packageTasks = useMemo(
    () => MOCK_TASKS_TEMPLATE.filter(t => !t.package || t.package === 'all' || t.package === wedding.package),
    [wedding.package]
  );
  const [tasks, setTasks] = useState(() => packageTasks.map(t => ({ ...t, done: false })));
  const [expandedPhases, setExpandedPhases] = useState(MOCK_PHASES.map(p => p.id));
  const [filterAssignee, setFilterAssignee] = useState('');
  const [filterDone, setFilterDone] = useState('all'); // 'all' | 'done' | 'pending'
  const toast = useToast();

  const toggleTask = (id) => {
    setTasks(ts => ts.map(t => t.id === id ? { ...t, done: !t.done } : t));
    const task = tasks.find(t => t.id === id);
    toast(task?.done ? 'Tarefa reaberta' : 'Tarefa concluída ✓', task?.done ? undefined : 'success');
  };

  const togglePhase = (id) => {
    setExpandedPhases(ep =>
      ep.includes(id) ? ep.filter(x => x !== id) : [...ep, id]
    );
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      if (filterAssignee && t.assignee !== filterAssignee) return false;
      if (filterDone === 'done' && !t.done) return false;
      if (filterDone === 'pending' && t.done) return false;
      return true;
    });
  }, [tasks, filterAssignee, filterDone]);

  const totalDone = tasks.filter(t => t.done).length;
  const pct = Math.round((totalDone / tasks.length) * 100);

  return (
    <div style={{ maxWidth: 840 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, gap: 16, flexWrap: 'wrap' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <h2 style={{ fontSize: 18, fontWeight: 600 }}>Workflow de Tarefas</h2>
            <span className={`badge ${wedding.package === 'experience' ? 'badge-gold' : 'badge-blue'}`}>
              {wedding.package === 'experience' ? '✨ Experience' : '⭐ Classic'}
            </span>
          </div>
          <div style={{ fontSize: 13, color: 'var(--text3)', marginTop: 2 }}>
            {totalDone} / {tasks.length} concluídas · {pct}%
          </div>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <select
            className="input"
            style={{ width: 140, height: 34, padding: '0 10px', fontSize: 13 }}
            value={filterAssignee}
            onChange={e => setFilterAssignee(e.target.value)}
          >
            <option value="">Todos os membros</option>
            {ASSIGNEES.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
          <div style={{ display: 'flex', border: '1px solid var(--border2)', borderRadius: 6, overflow: 'hidden' }}>
            {[['all', 'Todas'], ['pending', 'Pendentes'], ['done', 'Concluídas']].map(([v, l]) => (
              <button
                key={v}
                className="btn"
                style={{
                  borderRadius: 0, fontSize: 12, padding: '5px 12px',
                  background: filterDone === v ? 'var(--text)' : 'transparent',
                  color: filterDone === v ? '#fff' : 'var(--text2)',
                  borderRight: v !== 'done' ? '1px solid var(--border2)' : 'none',
                }}
                onClick={() => setFilterDone(v)}
              >
                {l}
              </button>
            ))}
          </div>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => setExpandedPhases(MOCK_PHASES.map(p => p.id))}
            title="Expandir tudo"
          >
            ⊞
          </button>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => setExpandedPhases([])}
            title="Recolher tudo"
          >
            ⊟
          </button>
        </div>
      </div>

      {/* Progress bar global */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ height: 8, background: 'var(--bg3)', borderRadius: 4, overflow: 'hidden' }}>
          <div style={{
            height: '100%', width: `${pct}%`,
            background: pct === 100 ? 'var(--success)' : 'var(--accent)',
            transition: 'width .4s',
          }} />
        </div>
      </div>

      {/* Phases */}
      {MOCK_PHASES.map(phase => {
        const allPhaseTasks = tasks.filter(t => t.phaseId === phase.id);
        const phaseTasks = filteredTasks.filter(t => t.phaseId === phase.id);
        if (allPhaseTasks.length === 0) return null;
        if (filterAssignee && phaseTasks.length === 0) return null;

        const isExpanded = expandedPhases.includes(phase.id);
        const doneCount = allPhaseTasks.filter(t => t.done).length;
        const allDone = doneCount === allPhaseTasks.length;

        return (
          <div key={phase.id} className="journey-phase">
            <div
              className="journey-phase-header"
              style={{ cursor: 'pointer', userSelect: 'none' }}
              onClick={() => togglePhase(phase.id)}
            >
              <div style={{
                width: 24, height: 24, borderRadius: '50%',
                background: allDone ? 'var(--success)' : 'var(--surface)',
                border: `1px solid ${allDone ? 'var(--success)' : 'var(--border)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                {allDone ? (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                       style={{ transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }}>
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                )}
              </div>

              <div className="journey-phase-title">{phase.label}</div>

              <span className={`phase-tag ${phase.color}`} style={{ marginLeft: 8 }}>
                {doneCount}/{allPhaseTasks.length}
              </span>

              {phase.deadlineType && (
                <span style={{
                  fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 20, marginLeft: 6,
                  background: DEADLINE_BADGE_STYLE[phase.deadlineType]?.bg,
                  color: DEADLINE_BADGE_STYLE[phase.deadlineType]?.color,
                }}>
                  {DEADLINE_TYPE_LABELS[phase.deadlineType]}
                </span>
              )}

              {/* Mini progress */}
              <div style={{ flex: 1, height: 4, background: 'var(--bg3)', borderRadius: 2, overflow: 'hidden', marginLeft: 8 }}>
                <div style={{
                  height: '100%',
                  width: `${Math.round((doneCount / allPhaseTasks.length) * 100)}%`,
                  background: allDone ? 'var(--success)' : 'var(--accent)',
                  transition: 'width .3s',
                }} />
              </div>
            </div>

            {isExpanded && (
              <div style={{
                paddingLeft: 17,
                marginLeft: 11,
                borderLeft: '1px solid var(--border)',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
              }}>
                {phaseTasks.length === 0 ? (
                  <div style={{ padding: '8px 14px', fontSize: 12, color: 'var(--text3)', fontStyle: 'italic' }}>
                    Nenhuma tarefa para o filtro selecionado.
                  </div>
                ) : phaseTasks.map(t => (
                  <div
                    key={t.id}
                    className={`task-item ${t.done ? 'done' : ''}`}
                    onClick={() => toggleTask(t.id)}
                  >
                    <div className="task-check">
                      {t.done && (
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      )}
                    </div>
                    <div className="task-text" style={{ flex: 1 }}>
                      <div>{t.description}</div>
                      <div className="task-assignee">👤 {t.assignee}</div>
                    </div>
                    <div style={{
                      fontSize: 11, padding: '2px 8px', borderRadius: 12,
                      background: t.done ? 'var(--success-bg)' : 'var(--bg3)',
                      color: t.done ? 'var(--success)' : 'var(--text3)',
                      flexShrink: 0,
                    }}>
                      {t.done ? 'Feito' : 'Por fazer'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
