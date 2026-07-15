import { useRef } from 'react';
import { TABLE_PRESETS, CANVAS_SCALE, seatPositions } from './tableConfig';

export function DraggableTable({ table, isSelected, editable = true, guests, onSelect, onMove, onSeatClick }) {
  const preset = TABLE_PRESETS[table.preset] ?? TABLE_PRESETS.round_medium;
  const wPx    = preset.width  * CANVAS_SCALE;
  const hPx    = preset.height * CANVAS_SCALE;
  const seats  = seatPositions(preset.shape, wPx, hPx, table.max_seats);
  const disabledSeats = table.disabled_seats ?? [];

  // ── Drag via mousedown + listeners globais (replica o comportamento do original) ──
  const dragRef = useRef(null);

  const onMouseDown = (e) => {
    if (e.button !== 0) return; // só botão esquerdo
    if (e.target.dataset.seat) return; // cadeira → não arrastar, deixa o clique da cadeira acontecer

    if (!editable || !onMove) {
      // Modo só-leitura: apenas seleciona, sem arrastar
      e.stopPropagation();
      onSelect(table.id);
      return;
    }

    e.stopPropagation();
    onSelect(table.id);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      origX:  table.x,
      origY:  table.y,
    };

    const handleMouseMove = (ev) => {
      if (!dragRef.current) return;
      const snap = 0.5;
      const dx = (ev.clientX - dragRef.current.startX) / CANVAS_SCALE;
      const dy = (ev.clientY - dragRef.current.startY) / CANVAS_SCALE;
      const nx = Math.round((dragRef.current.origX + dx) / snap) * snap;
      const ny = Math.round((dragRef.current.origY + dy) / snap) * snap;
      onMove(table.id, Math.max(0, nx), Math.max(0, ny));
    };
    const handleMouseUp = () => {
      dragRef.current = null;
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // Clique simples (sem arrastar) também deve selecionar — e nunca deve "escapar"
  // para o fundo do canvas e desselecionar a mesa que acabou de ser clicada.
  const onClick = (e) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    onSelect(table.id);
  };

  const isRound  = preset.shape === 'round';
  const isSCurve = preset.shape === 's_curve';
  const hasSeats = preset.hasSeatSlots !== false;

  // Cores fiéis ao original (Tailwind: amber-50 #fffbeb, stone-100 #f5f5f4,
  // stone-400 #a8a29e, blue-500 #3b82f6, blue-200 #bfdbfe, stone-600 #57534e).
  const tableBoxStyle = isSCurve
    ? {
        background:   '#fffbeb',
        border:       `${isSelected ? 3 : 2}px solid ${isSelected ? '#3b82f6' : '#78716c'}`,
        borderRadius: 6,
      }
    : {
        background:   hasSeats ? '#fffbeb' : '#f5f5f4',
        border:       `2px solid ${isSelected ? '#3b82f6' : '#a8a29e'}`,
        borderRadius: isRound ? '50%' : 2,
        boxShadow:    isSelected ? '0 0 0 2px #bfdbfe' : 'none',
      };

  return (
    <div
      onMouseDown={onMouseDown}
      onClick={onClick}
      style={{
        position:        'absolute',
        left:            table.x * CANVAS_SCALE,
        top:             table.y * CANVAS_SCALE,
        width:           wPx,
        height:          hPx,
        transform:       `rotate(${table.rotation ?? 0}deg)`,
        transformOrigin: 'center center',
        cursor:          editable ? 'grab' : 'pointer',
        zIndex:          isSelected ? 10 : 1,
        userSelect:      'none',
      }}
    >
      {/* ── Mesa ── */}
      <div style={{
        width: '100%', height: '100%',
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        ...tableBoxStyle,
      }}>
        <span style={{
          fontSize: 9, fontWeight: 600, color: '#57534e',
          textAlign: 'center', lineHeight: 1.2, pointerEvents: 'none',
        }}>
          {table.label}
        </span>
      </div>

      {/* ── Cadeiras ── */}
      {hasSeats && seats.map((pos, idx) => {
        const isDisabled = disabledSeats.includes(idx);
        const seatKey = `${table.id}:${idx}`;
        const guest   = !isDisabled ? guests.find(g => g.assigned_seat === seatKey) : null;
        const hasDiet = !!guest?.dietary_restriction;
        return (
          <div
            key={idx}
            data-seat="1"
            className="ldv-seat-dot"
            onClick={(e) => {
              e.stopPropagation();
              if (isDisabled) return;
              onSeatClick(table.id, idx);
            }}
            title={isDisabled
              ? 'Lugar desativado'
              : guest
                ? `${guest.first_name} ${guest.last_name}${hasDiet ? ' ⚠ ' + guest.dietary_restriction : ''}`
                : 'Lugar vazio'}
            style={{
              position:   'absolute',
              left:       pos.x, top: pos.y,
              width: 16,  height: 16,
              marginLeft: -8, marginTop: -8,
              borderRadius: '50%',
              background:  isDisabled ? '#fff' : guest ? '#10b981' : '#d1d5db',
              border:      isDisabled ? '2px dashed #9ca3af' : `1px solid ${guest ? '#059669' : '#9ca3af'}`,
              cursor:      isDisabled ? 'default' : 'pointer',
              opacity:     isDisabled ? 0.6 : 1,
              zIndex:      3,
              transition:  'background-color .15s, box-shadow .15s',
            }}
          />
        );
      })}
    </div>
  );
}
