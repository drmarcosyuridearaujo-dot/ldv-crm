import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';

export default function WeddingActionItems() {
  const { wedding } = useOutletContext();
  const toast = useToast();
  const [sections, setSections] = useState(() => (wedding.action_items || []).map(s => ({ ...s, items: s.items.map(i => ({ ...i })) })));
  const [newSectionName, setNewSectionName] = useState('');
  const [newItemDraft, setNewItemDraft] = useState({});

  const totalItems = sections.reduce((s, sec) => s + sec.items.length, 0);
  const doneItems = sections.reduce((s, sec) => s + sec.items.filter(i => i.done).length, 0);
  const allDone = totalItems > 0 && doneItems === totalItems;

  const addSection = () => {
    const name = newSectionName.trim();
    if (!name) return;
    setSections(s => [...s, { id: `ai${Date.now()}`, section: name, items: [] }]);
    setNewSectionName('');
  };

  const removeSection = (sectionId) => {
    if (!window.confirm('Remover esta secção e todos os seus itens?')) return;
    setSections(s => s.filter(sec => sec.id !== sectionId));
  };

  const addItem = (sectionId) => {
    const text = (newItemDraft[sectionId] || '').trim();
    if (!text) return;
    setSections(s => s.map(sec => sec.id === sectionId
      ? { ...sec, items: [...sec.items, { id: `${sectionId}-${Date.now()}`, text, done: false }] }
      : sec
    ));
    setNewItemDraft(d => ({ ...d, [sectionId]: '' }));
  };

  const toggleItem = (sectionId, itemId) => {
    setSections(s => s.map(sec => sec.id === sectionId
      ? { ...sec, items: sec.items.map(i => i.id === itemId ? { ...i, done: !i.done } : i) }
      : sec
    ));
  };

  const removeItem = (sectionId, itemId) => {
    setSections(s => s.map(sec => sec.id === sectionId
      ? { ...sec, items: sec.items.filter(i => i.id !== itemId) }
      : sec
    ));
  };

  return (
    <div style={{ maxWidth: 800, display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 600 }}>Action Items</h2>
          <div style={{ fontSize: 13, color: 'var(--text3)', marginTop: 2 }}>
            {totalItems === 0 ? 'Sem itens registados' : allDone ? '✓ Tudo concluído' : `${doneItems}/${totalItems} concluídos`}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            className="input"
            style={{ width: 220 }}
            placeholder="Nome da nova secção (ex: Reunião 20 Fev)"
            value={newSectionName}
            onChange={e => setNewSectionName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addSection()}
          />
          <button className="btn btn-primary btn-sm" disabled={!newSectionName.trim()} onClick={addSection}>
            + Secção
          </button>
        </div>
      </div>

      {sections.length === 0 ? (
        <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--text3)', fontStyle: 'italic' }}>
          Nenhuma secção de action items ainda. Cria a primeira acima.
        </div>
      ) : (
        sections.map(sec => {
          const secDone = sec.items.length > 0 && sec.items.every(i => i.done);
          return (
            <div key={sec.id} className="card">
              <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div className="card-title">{sec.section}</div>
                  <div className="card-sub">
                    {sec.items.length === 0 ? 'Sem itens' : secDone ? '✓ Tudo concluído' : `${sec.items.filter(i => i.done).length}/${sec.items.length} concluídos`}
                  </div>
                </div>
                <button className="btn-icon" title="Remover secção" onClick={() => removeSection(sec.id)}>✕</button>
              </div>
              <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {sec.items.map(item => (
                  <div
                    key={item.id}
                    className={`task-item ${item.done ? 'done' : ''}`}
                    onClick={() => toggleItem(sec.id, item.id)}
                  >
                    <div className="task-check">
                      {item.done && (
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </div>
                    <div className="task-text" style={{ flex: 1 }}>{item.text}</div>
                    <button
                      style={{ fontSize: 11, color: 'var(--error)', cursor: 'pointer', flexShrink: 0 }}
                      onClick={e => { e.stopPropagation(); removeItem(sec.id, item.id); }}
                    >
                      ✕
                    </button>
                  </div>
                ))}

                <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                  <input
                    className="input"
                    style={{ flex: 1, height: 32, fontSize: 13 }}
                    placeholder="+ Adicionar item..."
                    value={newItemDraft[sec.id] || ''}
                    onChange={e => setNewItemDraft(d => ({ ...d, [sec.id]: e.target.value }))}
                    onKeyDown={e => e.key === 'Enter' && addItem(sec.id)}
                  />
                  <button className="btn btn-outline btn-sm" onClick={() => addItem(sec.id)}>Adicionar</button>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
