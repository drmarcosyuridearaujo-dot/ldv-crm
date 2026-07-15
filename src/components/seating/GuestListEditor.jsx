import { Fragment } from 'react';

export const GUEST_TYPE_LABELS = {
  adult: 'Adulto',
  child_0_3: 'Bebé (0–3)',
  child_4_9: 'Criança (4–9)',
  staff: 'Staff',
};

export const CHAIR_TYPE_LABELS = {
  simple: 'Cadeira Normal',
  wheelchair: 'Cadeira de Rodas',
  highchair: 'Cadeira Alta',
  stroller: 'Carrinho de Bebé',
};

export const MENU_LABELS = {
  generic: 'Padrão',
  kids: 'Infantil',
  veggie: 'Vegetariano',
  restriction_based: 'Com Restrição',
  no_menu_baby: 'Sem Menu (bebé)',
};

const LANGUAGE_OPTIONS = ['pt', 'en', 'es', 'fr', 'de', 'other'];

function isComplete(g) {
  return g.first_name.trim() !== '' && g.last_name.trim() !== '' && !!g.guest_type && !!g.chair_type && !!g.menu &&
    (g.dietary_restriction === null || g.dietary_restriction === undefined || g.dietary_restriction.trim() !== '');
}

function isDuplicate(guests, idx) {
  const g = guests[idx];
  if (!g.first_name.trim() || !g.last_name.trim()) return false;
  return guests.some((o, i) => i !== idx &&
    o.first_name.trim().toLowerCase() === g.first_name.trim().toLowerCase() &&
    o.last_name.trim().toLowerCase() === g.last_name.trim().toLowerCase());
}

const cellInput = { height: 32, fontSize: 12, padding: '4px 8px' };

export function GuestListEditor({ guests, onChange }) {
  const incompleteCount = guests.filter(g => !isComplete(g)).length;

  const updateGuest = (idx, patch) => {
    onChange(guests.map((g, i) => i === idx ? { ...g, ...patch } : g));
  };
  const removeGuest = (idx) => {
    onChange(guests.filter((_, i) => i !== idx));
  };
  const addGuest = () => {
    onChange([...guests, {
      id: `g${Date.now()}`,
      first_name: '', last_name: '',
      guest_type: '', dietary_restriction: null,
      chair_type: '', menu: '', language: 'pt',
      assigned_seat: null,
    }]);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
        <div style={{ fontSize: 13, fontWeight: 600 }}>
          Lista de Convidados {guests.length > 0 && <span style={{ fontWeight: 400, color: 'var(--text3)' }}>({guests.length})</span>}
        </div>
        <button className="btn btn-outline btn-sm" onClick={addGuest}>+ Adicionar Convidado</button>
      </div>

      {incompleteCount > 0 && (
        <div style={{ marginBottom: 12, padding: '8px 12px', background: 'var(--warn-bg)', border: '1px solid #fde68a', borderRadius: 6, fontSize: 12, color: 'var(--warn)', display: 'flex', gap: 8, alignItems: 'center' }}>
          ⚠️ <strong>{incompleteCount}</strong> convidado(s) com dados incompletos — preencha nome, tipo, cadeira e menu.
        </div>
      )}

      {guests.length === 0 ? (
        <div style={{ fontSize: 13, color: 'var(--text3)', fontStyle: 'italic', padding: 20, textAlign: 'center' }}>
          Nenhum convidado adicionado.
        </div>
      ) : (
        <div style={{ overflowX: 'auto', border: '1px solid var(--border)', borderRadius: 8 }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Apelido</th>
                <th>Tipo</th>
                <th>Restrição Alimentar</th>
                <th>Cadeira</th>
                <th>Menu</th>
                <th>Idioma</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {guests.map((g, idx) => {
                const dup = isDuplicate(guests, idx);
                const complete = isComplete(g);
                const hasRestriction = g.dietary_restriction !== null && g.dietary_restriction !== undefined;
                return (
                  <Fragment key={g.id}>
                    <tr style={{ background: dup ? 'var(--error-bg)' : !complete ? 'var(--warn-bg)' : 'transparent' }}>
                      <td>
                        <input className="input" style={cellInput} value={g.first_name} placeholder="Nome"
                          onChange={e => updateGuest(idx, { first_name: e.target.value })} />
                      </td>
                      <td>
                        <input className="input" style={cellInput} value={g.last_name} placeholder="Apelido"
                          onChange={e => updateGuest(idx, { last_name: e.target.value })} />
                      </td>
                      <td>
                        <select className="input" style={cellInput} value={g.guest_type}
                          onChange={e => updateGuest(idx, { guest_type: e.target.value })}>
                          <option value="">—</option>
                          {Object.entries(GUEST_TYPE_LABELS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
                        </select>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 4, minWidth: 160 }}>
                          <select
                            className="input"
                            style={{ ...cellInput, width: 64, flexShrink: 0 }}
                            value={hasRestriction ? 'yes' : 'no'}
                            onChange={e => updateGuest(idx, { dietary_restriction: e.target.value === 'yes' ? '' : null })}
                          >
                            <option value="no">Não</option>
                            <option value="yes">Sim</option>
                          </select>
                          {hasRestriction && (
                            <input
                              className="input"
                              style={{ ...cellInput, flex: 1 }}
                              value={g.dietary_restriction}
                              placeholder="Qual?"
                              onChange={e => updateGuest(idx, { dietary_restriction: e.target.value })}
                            />
                          )}
                        </div>
                      </td>
                      <td>
                        <select className="input" style={cellInput} value={g.chair_type}
                          onChange={e => updateGuest(idx, { chair_type: e.target.value })}>
                          <option value="">—</option>
                          {Object.entries(CHAIR_TYPE_LABELS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
                        </select>
                      </td>
                      <td>
                        <select className="input" style={cellInput} value={g.menu}
                          onChange={e => updateGuest(idx, { menu: e.target.value })}>
                          <option value="">—</option>
                          {Object.entries(MENU_LABELS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
                        </select>
                      </td>
                      <td>
                        <select className="input" style={cellInput} value={g.language}
                          onChange={e => updateGuest(idx, { language: e.target.value })}>
                          {LANGUAGE_OPTIONS.map(l => <option key={l} value={l}>{l.toUpperCase()}</option>)}
                        </select>
                      </td>
                      <td>
                        <button className="btn-icon" title="Remover convidado" onClick={() => removeGuest(idx)}>✕</button>
                      </td>
                    </tr>
                    {dup && (
                      <tr>
                        <td colSpan={8} style={{ background: 'var(--error-bg)', color: 'var(--error)', fontSize: 11, padding: '4px 12px' }}>
                          ⚠️ Convidado duplicado: {g.first_name} {g.last_name}
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
