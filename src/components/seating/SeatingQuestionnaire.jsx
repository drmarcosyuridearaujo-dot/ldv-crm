const TABLE_STYLE_OPTIONS = [
  { id: 'rectangular', label: 'Retangular' },
  { id: 'round', label: 'Redonda' },
  { id: 'both', label: 'Ambas' },
];

const BRIDE_GROOM_OPTIONS = [
  { id: 'couple_only', label: 'Só o Casal' },
  { id: 'with_guests', label: 'Com Convidados' },
];

function OptionGroup({ options, value, onSelect }) {
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {options.map(opt => (
        <button
          key={opt.id}
          type="button"
          className="btn btn-sm"
          style={{
            background: value === opt.id ? 'var(--accent)' : 'var(--bg2)',
            color: value === opt.id ? '#fff' : 'var(--text2)',
          }}
          onClick={() => onSelect(value === opt.id ? null : opt.id)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export function SeatingQuestionnaire({ value, onChange }) {
  const v = value || {};

  return (
    <div className="card" style={{ maxWidth: 560 }}>
      <div className="card-header"><div className="card-title">📋 Questionário de Lugares</div></div>
      <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div className="form-group">
          <label className="label">Número Estimado de Convidados</label>
          <input
            type="number"
            min="0"
            className="input"
            style={{ maxWidth: 160 }}
            value={v.estimated_guests ?? ''}
            onChange={e => onChange({ ...v, estimated_guests: e.target.value ? parseInt(e.target.value, 10) : null })}
          />
        </div>

        <div className="form-group">
          <label className="label">Estilo de Mesa</label>
          <OptionGroup options={TABLE_STYLE_OPTIONS} value={v.table_style} onSelect={val => onChange({ ...v, table_style: val })} />
        </div>

        <div className="form-group">
          <label className="label">Mesa dos Noivos</label>
          <OptionGroup options={BRIDE_GROOM_OPTIONS} value={v.bride_groom_table} onSelect={val => onChange({ ...v, bride_groom_table: val })} />
        </div>
      </div>
    </div>
  );
}
