export const TABLE_PRESETS = {
  rect_guests: {
    id: 'rect_guests', shape: "rect", width: 2.6, height: 0.8,
    defaultMinSeats: 6, defaultMaxSeats: 10,
    label_pt: "Mesa Retangular", hasSeatSlots: true
  },
  rect_bride: {
    id: 'rect_bride', shape: "rect", width: 1.35, height: 0.8,
    defaultMinSeats: 2, defaultMaxSeats: 2,
    label_pt: "Mesa Noivos Ret.", hasSeatSlots: true
  },
  rect_double: {
    id: 'rect_double', shape: "rect", width: 2.6, height: 1.6,
    defaultMinSeats: 10, defaultMaxSeats: 16,
    label_pt: "Mesa Dupla", hasSeatSlots: true
  },
  round_bride: {
    id: 'round_bride', shape: "round", width: 1.2, height: 1.2,
    defaultMinSeats: 2, defaultMaxSeats: 2,
    label_pt: "Mesa Noivos Red.", hasSeatSlots: true
  },
  round_small: {
    id: 'round_small', shape: "round", width: 1.4, height: 1.4,
    defaultMinSeats: 6, defaultMaxSeats: 8,
    label_pt: "Mesa Redonda Peq.", hasSeatSlots: true
  },
  round_medium: {
    id: 'round_medium', shape: "round", width: 1.5, height: 1.5,
    defaultMinSeats: 8, defaultMaxSeats: 10,
    label_pt: "Mesa Redonda", hasSeatSlots: true
  },
  s_curve_bride: {
    id: 's_curve_bride', shape: "s_curve", width: 4.05, height: 1.72,
    defaultMinSeats: 2, defaultMaxSeats: 2,
    label_pt: "Mesa Noivos S", hasSeatSlots: true
  },
  kids_zone: {
    id: 'kids_zone', shape: "rect", width: 2.86, height: 2.1,
    defaultMinSeats: 0, defaultMaxSeats: 0,
    label_pt: "Zona Kids", hasSeatSlots: false
  },
  lounge: {
    id: 'lounge', shape: "rect", width: 2.76, height: 1.9,
    defaultMinSeats: 0, defaultMaxSeats: 0,
    label_pt: "Zona Lounge", hasSeatSlots: false
  },
  buffet_dessert: {
    id: 'buffet_dessert', shape: "rect", width: 2.0, height: 0.36,
    defaultMinSeats: 0, defaultMaxSeats: 0,
    label_pt: "Buffet Sobremesas", hasSeatSlots: false
  }
};

export const CANVAS_SCALE = 30; // Scale up for better visibility, 1 metro = 30 px

// Mesas com nº de lugares fixo (não editável) — mesa dos noivos retangular/redonda.
// A Mesa Noivos S fica de fora propositadamente: aceita nº de lugares variável.
export const FIXED_SEAT_PRESETS = new Set(['rect_bride', 'round_bride']);

// Ângulos de rotação disponíveis dependem da forma da mesa.
export function rotationOptions(shape) {
  return shape === 'rect' || shape === 's_curve'
    ? [0, 90]
    : [0, 45, 90, 135, 180, 225, 270, 315];
}

export function seatPositions(shape, wPx, hPx, maxSeats) {
  if (maxSeats <= 0) return [];
  
  const seats  = [];
  const cx     = wPx / 2;
  const cy     = hPx / 2;
  const chairR = 7;
  const gap    = 8;

  if (shape === 'round') {
    const orbitR = wPx / 2 + gap + chairR;
    for (let i = 0; i < maxSeats; i++) {
      const angle = (i * 2 * Math.PI) / maxSeats - Math.PI / 2;
      seats.push({ x: cx + orbitR * Math.cos(angle), y: cy + orbitR * Math.sin(angle) });
    }
  } else if (shape === 'rect') {
    const perSide = Math.ceil(maxSeats / 2);
    const spacing = wPx / (perSide + 1);
    for (let i = 1; i <= perSide; i++) {
      if (seats.length < maxSeats) seats.push({ x: i * spacing, y: -(gap + chairR) });
      if (seats.length < maxSeats) seats.push({ x: i * spacing, y: hPx + gap + chairR });
    }
  } else if (shape === 's_curve') {
    // Basic approximation for S-curve
    const spacing = wPx / (maxSeats + 1);
    for (let i = 1; i <= maxSeats; i++) {
      seats.push({ x: i * spacing, y: -(gap + chairR) });
    }
  }
  return seats;
}
