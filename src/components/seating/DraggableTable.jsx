import { useRef } from 'react';
import { TABLE_PRESETS, CANVAS_SCALE, seatPositions } from './tableConfig';

export function DraggableTable({ table, isSelected, guests, onSelect, onMove, onSeatClick }) {
  const preset = TABLE_PRESETS[table.preset] ?? TABLE_PRESETS.round_medium;
  const wPx    = preset.width  * CANVAS_SCALE;
  const hPx    = preset.height * CANVAS_SCALE;
  const seats  = seatPositions(preset.shape, wPx, hPx, table.max_seats);

  // ── Drag via refs — sem stale closures ──
  const rootRef  = useRef(null);
  const dragRef  = useRef(null);

  const onPointerDown = (e) => {
    if (e.target.dataset.seat) return; // cadeira → não arrastar
    e.preventDefault();
    e.stopPropagation();
    onSelect(table.id);
    rootRef.current.setPointerCapture(e.pointerId);
    dragRef.current = {
      startCX: e.clientX,
      startCY: e.clientY,
      origX:   table.x,
      origY:   table.y,
    };
  };

  const onPointerMove = (e) => {
    if (!dragRef.current) return;
    const snap = 0.5;
    const dx   = (e.clientX - dragRef.current.startCX) / CANVAS_SCALE;
    const dy   = (e.clientY - dragRef.current.startCY) / CANVAS_SCALE;
    const nx   = Math.round((dragRef.current.origX + dx) / snap) * snap;
    const ny   = Math.round((dragRef.current.origY + dy) / snap) * snap;
    onMove(table.id, Math.max(0, nx), Math.max(0, ny));
  };

  const onPointerUp = () => { dragRef.current = null; };

  const isRound = preset.shape === 'round';

  return (
    <div
      ref={rootRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      style={{
        position:        'absolute',
        left:            table.x * CANVAS_SCALE,
        top:             table.y * CANVAS_SCALE,
        width:           wPx,
        height:          hPx,
        transform:       `rotate(${table.rotation ?? 0}deg)`,
        transformOrigin: 'center center',
        cursor:          'grab',
        zIndex:          isSelected ? 10 : 1,
        touchAction:     'none',
        userSelect:      'none',
      }}
    >
      {/* ── Mesa ── */}
      <div style={{
        width: '100%', height: '100%',
        background:   '#f5f0eb',
        border:       `2px solid ${isSelected ? '#1d4ed8' : '#c7b89a'}`,
        borderRadius: isRound ? '50%' : 6,
        boxShadow:    isSelected
          ? '0 0 0 3px rgba(29,78,216,.25)'
          : '0 1px 4px rgba(0,0,0,.1)',
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
      }}>
        <span style={{
          fontSize: 9, fontWeight: 700, color: '#78716c',
          textAlign: 'center', lineHeight: 1.2, pointerEvents: 'none',
        }}>
          {table.label}
        </span>
      </div>

      {/* ── Cadeiras ── */}
      {preset.hasSeatSlots !== false && seats.map((pos, idx) => {
        const seatKey = `${table.id}:${idx}`;
        const guest   = guests.find(g => g.assigned_seat === seatKey);
        const hasDiet = !!guest?.dietary_restriction;
        return (
          <div
            key={idx}
            data-seat="1"
            onClick={(e) => { e.stopPropagation(); onSeatClick(table.id, idx); }}
            title={guest
              ? `${guest.first_name} ${guest.last_name}${hasDiet ? ' ⚠ ' + guest.dietary_restriction : ''}`
              : 'Lugar vazio'}
            style={{
              position:   'absolute',
              left:       pos.x, top: pos.y,
              width: 14,  height: 14,
              marginLeft: -7, marginTop: -7,
              borderRadius: '50%',
              background:  guest ? (hasDiet ? '#f59e0b' : '#10b981') : '#e5e7eb',
              border:      `2px solid ${guest ? (hasDiet ? '#d97706' : '#059669') : '#9ca3af'}`,
              cursor:      'pointer',
              zIndex:      3,
              transition:  'transform .1s, background .15s',
            }}
          />
        );
      })}
    </div>
  );
}
