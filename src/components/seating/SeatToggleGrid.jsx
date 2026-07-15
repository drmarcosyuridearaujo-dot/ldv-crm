import { seatPositions } from './tableConfig';

// Mini-planta SVG da mesa selecionada — clicar num lugar ativa/desativa esse lugar
// (ex.: lugar bloqueado por estar junto a uma coluna, sem removê-lo da contagem).
export function SeatToggleGrid({ preset, maxSeats, disabledSeats, onToggle }) {
  const previewW = 110;
  const previewH = Math.max(50, previewW * (preset.height / preset.width));
  const seats = seatPositions(preset.shape, previewW, previewH, maxSeats);

  if (seats.length === 0) return null;

  const pad = 10;
  const minX = Math.min(...seats.map(s => s.x)) - pad;
  const minY = Math.min(...seats.map(s => s.y)) - pad;
  const maxX = Math.max(...seats.map(s => s.x)) + pad;
  const maxY = Math.max(...seats.map(s => s.y)) + pad;

  return (
    <svg
      viewBox={`${minX} ${minY} ${maxX - minX} ${maxY - minY}`}
      style={{ width: '100%', maxHeight: 130, background: 'var(--bg)', borderRadius: 8 }}
    >
      {preset.shape === 'round' ? (
        <circle cx={previewW / 2} cy={previewH / 2} r={previewW / 2} fill="#f5f0eb" stroke="#d4c8b8" strokeWidth="1" />
      ) : (
        <rect x={0} y={0} width={previewW} height={previewH} rx={4} fill="#f5f0eb" stroke="#d4c8b8" strokeWidth="1" />
      )}
      {seats.map((pos, idx) => {
        const isDisabled = disabledSeats.includes(idx);
        return (
          <circle
            key={idx}
            cx={pos.x}
            cy={pos.y}
            r={5}
            fill={isDisabled ? '#fff' : '#6ee7b7'}
            stroke={isDisabled ? '#d1d5db' : '#059669'}
            strokeWidth="1.5"
            strokeDasharray={isDisabled ? '2,2' : undefined}
            style={{ cursor: 'pointer' }}
            onClick={() => onToggle(idx)}
          >
            <title>{isDisabled ? 'Desativado — clique para ativar' : `Lugar ${idx + 1} — clique para desativar`}</title>
          </circle>
        );
      })}
    </svg>
  );
}
