// ═══════════════════════════════════════════════════════════════════════════
// ── EDITABLE DATA BLOCK — actualiza estos valores cuando cambien los datos ──
// ═══════════════════════════════════════════════════════════════════════════
const DEFAULT_GAS_PRICE  = 23.68;   // MXN/litro · Magna promedio nacional — PETROIntelligence mayo 2026
const DEFAULT_ELEC_PRICE = 2.00;    // MXN/kWh — CFE tarifa doméstica estimada
const DEFAULT_CETES      = 0.075;   // 7.5% anual — rendimiento conservador instrumentos financieros
const DEFAULT_KM         = 10000;   // km/año promedio conductor mexicano — INEGI / El Universal
const DEFAULT_INFL_RATE  = 0.045;   // 4.5% anual — INEGI inflación promedio MX 2024-2026
// ═══════════════════════════════════════════════════════════════════════════

// ── VEHICLE PRESETS ────────────────────────────────────────────────────────
const PRESETS = {
  car: [
    {
      id: 'car-compact',
      label: 'Subcompacto / Compacto',
      examples: 'Aveo, Versa, Vento, March',
      icon: '🚗',
      new:  { purchasePrice: 310000, fuelEfficiency: 14, insurance: 9500,  maintenance: 5000, fees: 2000, deprRate: 0.18 },
      used: { purchasePrice: 130000, fuelEfficiency: 13, insurance: 7000,  maintenance: 7000, fees: 1500, deprRate: 0.15 },
    },
    {
      id: 'car-sedan',
      label: 'Sedán mediano',
      examples: 'Altima, Jetta, Corolla, Mazda 3',
      icon: '🚗',
      new:  { purchasePrice: 450000, fuelEfficiency: 13, insurance: 12000, maintenance: 6000, fees: 2500, deprRate: 0.18 },
      used: { purchasePrice: 200000, fuelEfficiency: 12, insurance: 9000,  maintenance: 8000, fees: 2000, deprRate: 0.15 },
    },
    {
      id: 'car-suv',
      label: 'SUV compacta',
      examples: 'Tiguan, HR-V, Equinox, CX-5',
      icon: '🚙',
      new:  { purchasePrice: 580000, fuelEfficiency: 11, insurance: 14000, maintenance: 7000, fees: 3000, deprRate: 0.20 },
      used: { purchasePrice: 280000, fuelEfficiency: 10, insurance: 11000, maintenance: 9000, fees: 2500, deprRate: 0.16 },
    },
    {
      id: 'car-truck',
      label: 'SUV grande / Pickup',
      examples: 'Silverado, Hilux, Expedition, RAM',
      icon: '🛻',
      new:  { purchasePrice: 850000, fuelEfficiency: 9,  insurance: 18000, maintenance: 9000, fees: 4000, deprRate: 0.20 },
      used: { purchasePrice: 400000, fuelEfficiency: 8,  insurance: 13000, maintenance: 11000,fees: 3000, deprRate: 0.16 },
    },
  ],
  ev: [
    {
      id: 'ev-compact',
      label: 'Compacto eléctrico',
      examples: 'BYD Dolphin, Ora, MG4',
      icon: '⚡',
      new:  { purchasePrice: 420000, consumption: 15, insurance: 9500,  maintenance: 2500, fees: 1500, deprRate: 0.20 },
      used: { purchasePrice: 280000, consumption: 16, insurance: 8000,  maintenance: 3000, fees: 1200, deprRate: 0.18 },
    },
    {
      id: 'ev-suv',
      label: 'SUV eléctrica',
      examples: 'BYD Atto 3, Tesla Model Y, Volvo EX40',
      icon: '⚡',
      new:  { purchasePrice: 750000, consumption: 19, insurance: 13000, maintenance: 3000, fees: 2000, deprRate: 0.22 },
      used: { purchasePrice: 480000, consumption: 20, insurance: 10000, maintenance: 3500, fees: 1800, deprRate: 0.20 },
    },
  ],
  moto: [
    {
      id: 'moto-urban',
      label: 'Urbana / De trabajo',
      examples: 'Italika, Honda CB, Carabela, Yamaha FZ',
      icon: '🏍',
      new:  { purchasePrice: 35000,  fuelEfficiency: 40, insurance: 2000, maintenance: 2500, deprRate: 0.20 },
      used: { purchasePrice: 18000,  fuelEfficiency: 38, insurance: 1500, maintenance: 3000, deprRate: 0.18 },
    },
    {
      id: 'moto-sport',
      label: 'Deportiva / Grande',
      examples: 'Honda CB500, Kawasaki, Triumph, BMW GS',
      icon: '🏍',
      new:  { purchasePrice: 120000, fuelEfficiency: 22, insurance: 5000, maintenance: 5000, deprRate: 0.22 },
      used: { purchasePrice: 60000,  fuelEfficiency: 20, insurance: 3500, maintenance: 6000, deprRate: 0.20 },
    },
  ],
};

// ── MODE DEFINITIONS ───────────────────────────────────────────────────────
const MODES = [
  {
    id: 'car',
    icon: '🚗',
    name: 'Auto de gasolina',
    hasCapital: true,
    hasPresets: true,
    kmEstimators: ['odometer', 'commute'],
    defaultParams: { purchasePrice: 516000, fuelEfficiency: 12, insurance: 12338, maintenance: 6000, fees: 2500, deprRate: 0.18 },
    fields: [
      { key: 'purchasePrice', label: 'Precio de compra', unit: 'MXN', isCurrency: true, tip: 'Precio que pagaste por el vehículo. Los presets usan promedios nacionales — cambia por el tuyo si lo sabes.' },
      { key: 'fuelEfficiency', label: 'Rendimiento', unit: 'km/litro', step: 0.5, min: 6, max: 25, tip: 'Km por litro en uso urbano real. Puedes calcularlo: llena el tanque, resetea el odómetro, divide km recorridos entre litros en la siguiente carga.' },
      { key: 'insurance', label: 'Seguro anual', unit: 'MXN/año', isCurrency: true, tip: 'Prima anual de tu seguro. Promedio nacional cobertura amplia: ~$12,338. Fuente: CONDUSEF / Rastreator.mx 2025.' },
      { key: 'maintenance', label: 'Mantenimiento anual', unit: 'MXN/año', isCurrency: true, tip: 'Aceite, afinaciones, llantas, frenos, filtros. Promedio: ~$6,000/año auto compacto.' },
      { key: 'fees', label: 'Tenencia + trámites', unit: 'MXN/año', isCurrency: true, tip: 'Tenencia, verificación, refrendo de placas. Varía mucho por estado.' },
      { key: 'deprRate', label: 'Depreciación anual', unit: '%', isPct: true, step: 1, min: 5, max: 35, tip: 'Porcentaje del valor que pierdes cada año. Promedio: ~18%. El primer año puede ser 25-30%.' },
    ],
    calc(p, km, gasPrice, cetes, elecPrice, oppOn) {
      const op = (km / p.fuelEfficiency) * gasPrice + p.insurance + p.maintenance + p.fees;
      const cap = p.purchasePrice;
      const depr = cap * p.deprRate;
      const residual = cap * (1 - p.deprRate);
      const opp = oppOn ? residual * cetes : 0;
      return { op, depr, opp, cap, residual };
    }
  },
  {
    id: 'ev',
    icon: '⚡',
    name: 'Auto eléctrico',
    hasCapital: true,
    hasPresets: true,
    kmEstimators: ['odometer', 'commute'],
    defaultParams: { purchasePrice: 600000, consumption: 16, insurance: 11000, maintenance: 3000, fees: 2500, deprRate: 0.20 },
    fields: [
      { key: 'purchasePrice', label: 'Precio de compra', unit: 'MXN', isCurrency: true, tip: 'Precio del vehículo eléctrico. Rango: ~$350k (BYD Dolphin) hasta $1.2M+ (Tesla).' },
      { key: 'consumption', label: 'Consumo eléctrico', unit: 'kWh/100km', step: 0.5, min: 10, max: 30, tip: 'Energía consumida por 100 km. Compactos: 13-17 kWh. SUVs: 18-25 kWh. Ver especificaciones del fabricante.' },
      { key: 'insurance', label: 'Seguro anual', unit: 'MXN/año', isCurrency: true, tip: 'Seguros para EV son ligeramente menores que autos de gasolina equivalentes.' },
      { key: 'maintenance', label: 'Mantenimiento anual', unit: 'MXN/año', isCurrency: true, tip: 'Sin cambios de aceite ni bujías. Principalmente revisión eléctrica y neumáticos. ~$3,000/año.' },
      { key: 'fees', label: 'Tenencia + trámites', unit: 'MXN/año', isCurrency: true, tip: 'Varios estados tienen exenciones para EVs. Verifica en tu estado — puede ser $0.' },
      { key: 'deprRate', label: 'Depreciación anual', unit: '%', isPct: true, step: 1, min: 5, max: 40, tip: 'EVs deprecian más rápido por incertidumbre en vida útil de batería y rápida evolución tecnológica. ~20%/año.' },
    ],
    calc(p, km, gasPrice, cetes, elecPrice, oppOn) {
      const op = (km / 100) * p.consumption * elecPrice + p.insurance + p.maintenance + p.fees;
      const cap = p.purchasePrice;
      const depr = cap * p.deprRate;
      const residual = cap * (1 - p.deprRate);
      const opp = oppOn ? residual * cetes : 0;
      return { op, depr, opp, cap, residual };
    }
  },
  {
    id: 'moto',
    icon: '🏍',
    name: 'Motocicleta',
    hasCapital: true,
    hasPresets: true,
    kmEstimators: ['odometer', 'commute'],
    defaultParams: { purchasePrice: 45000, fuelEfficiency: 32, insurance: 2500, maintenance: 3000, deprRate: 0.20 },
    fields: [
      { key: 'purchasePrice', label: 'Precio de compra', unit: 'MXN', isCurrency: true, tip: 'Motos de trabajo: $20-35k. Deportivas o de marca: $80k+.' },
      { key: 'fuelEfficiency', label: 'Rendimiento', unit: 'km/litro', step: 1, min: 15, max: 60, tip: 'Motos de trabajo: 35-50 km/l. Deportivas: 20-30 km/l. Grandes/touring: 15-20 km/l.' },
      { key: 'insurance', label: 'Seguro básico anual', unit: 'MXN/año', isCurrency: true, tip: 'Seguro básico de responsabilidad civil. Promedio: ~$2,500/año. Muchos motociclistas circulan sin seguro — riesgo financiero significativo.' },
      { key: 'maintenance', label: 'Mantenimiento anual', unit: 'MXN/año', isCurrency: true, tip: 'Aceite, cadena, llantas, frenos. Más frecuente que autos pero más barato por servicio. ~$3,000/año.' },
      { key: 'deprRate', label: 'Depreciación anual', unit: '%', isPct: true, step: 1, min: 5, max: 40, tip: 'Motos populares de trabajo mantienen mejor valor. Deportivas deprecian más rápido. ~20%/año.' },
    ],
    calc(p, km, gasPrice, cetes, elecPrice, oppOn) {
      const op = (km / p.fuelEfficiency) * gasPrice + p.insurance + p.maintenance;
      const cap = p.purchasePrice;
      const depr = cap * p.deprRate;
      const residual = cap * (1 - p.deprRate);
      const opp = oppOn ? residual * cetes : 0;
      return { op, depr, opp, cap, residual };
    }
  },
  {
    id: 'scooter',
    icon: '🛴',
    name: 'Ebike / Scooter eléctrico',
    hasCapital: true,
    hasPresets: false,
    kmEstimators: ['commute'],
    defaultParams: { purchasePrice: 20000, kmPerKwh: 30, maintenance: 1500, deprRate: 0.18 },
    fields: [
      { key: 'purchasePrice', label: 'Precio de compra', unit: 'MXN', isCurrency: true, tip: 'Ebikes de entrada: $12-20k. Buena calidad: $30-80k+. Scooters eléctricos: $8-60k.' },
      { key: 'kmPerKwh', label: 'Eficiencia energética', unit: 'km/kWh', step: 1, min: 5, max: 80, tip: 'Ebikes urbanas: 30-50 km/kWh. Scooters ligeros: 20-35 km/kWh. Scooters pesados: 10-20 km/kWh.' },
      { key: 'maintenance', label: 'Mantenimiento anual', unit: 'MXN/año', isCurrency: true, tip: 'Llantas, frenos, cadena, revisión eléctrica. ~$1,500/año. El gasto mayor a mediano plazo: reemplazo de batería (3-5 años).' },
      { key: 'deprRate', label: 'Depreciación anual', unit: '%', isPct: true, step: 1, min: 2, max: 40, tip: 'Deprecian más que bicicletas mecánicas por degradación de batería. ~18%/año.' },
    ],
    calc(p, km, gasPrice, cetes, elecPrice, oppOn) {
      const op = (km / p.kmPerKwh) * elecPrice + p.maintenance;
      const cap = p.purchasePrice;
      const depr = cap * p.deprRate;
      const residual = cap * (1 - p.deprRate);
      const opp = oppOn ? residual * cetes : 0;
      return { op, depr, opp, cap, residual };
    }
  },
  {
    id: 'bike',
    icon: '🚲',
    name: 'Bicicleta',
    hasCapital: true,
    hasPresets: false,
    kmEstimators: ['commute'],
    defaultParams: { purchasePrice: 8000, maintenance: 2000, deprRate: 0.08 },
    fields: [
      { key: 'purchasePrice', label: 'Precio de compra', unit: 'MXN', isCurrency: true, tip: 'Bici básica urbana: $1,500-4,000. Buena calidad: $5,000-15,000. Carbono o eléctrica: $20,000+.' },
      { key: 'maintenance', label: 'Mantenimiento anual', unit: 'MXN/año', isCurrency: true, tip: 'Llantas, cadena, cables, frenos, ajustes. Para uso urbano diario: ~$2,000/año.' },
      { key: 'deprRate', label: 'Depreciación anual', unit: '%', isPct: true, step: 1, min: 2, max: 25, tip: 'Las bicis deprecian mucho menos que vehículos motorizados. Una bien mantenida conserva el 70-80% de su valor por años. ~8%/año.' },
    ],
    calc(p, km, gasPrice, cetes, elecPrice, oppOn) {
      const op = p.maintenance;
      const cap = p.purchasePrice;
      const depr = cap * p.deprRate;
      const residual = cap * (1 - p.deprRate);
      const opp = oppOn ? residual * cetes : 0;
      return { op, depr, opp, cap, residual };
    }
  },
  {
    id: 'transit',
    icon: '🚌',
    name: 'Transporte público',
    hasCapital: false,
    hasPresets: false,
    kmEstimators: ['commute'],
    defaultParams: { farePerTrip: 12.00, tripsPerMonth: 44 },
    fields: [
      { key: 'farePerTrip', label: 'Tarifa por viaje', unit: 'MXN/viaje', step: 0.5, min: 3, max: 30, tip: 'Promedio nacional (excluyendo CDMX): ~$12. CDMX: $5-7.50. Monterrey: ~$17. Guadalajara: ~$11. Fuente: Ciudadanos Observando, 26 ciudades 2025.' },
      { key: 'tripsPerMonth', label: 'Viajes al mes', unit: 'viajes/mes', step: 2, min: 10, max: 120, tip: '44 viajes/mes = 2 viajes por día hábil (ida y vuelta). Ajusta si usas transporte también fines de semana.' },
    ],
    calc(p, km, gasPrice, cetes, elecPrice, oppOn) {
      const op = p.farePerTrip * p.tripsPerMonth * 12;
      return { op, depr: 0, opp: 0, cap: 0, residual: 0 };
    }
  },
  {
    id: 'uber',
    icon: '🚕',
    name: 'Uber / Didi',
    hasCapital: false,
    hasPresets: false,
    kmEstimators: ['commute'],
    defaultParams: { costPerKm: 8.00, baseFare: 12.00, avgTripKm: 8 },
    fields: [
      { key: 'costPerKm', label: 'Tarifa por km', unit: 'MXN/km', step: 0.5, min: 3, max: 25, tip: 'Varía por ciudad y demanda. Estimado post-reforma laboral julio 2025.' },
      { key: 'baseFare', label: 'Tarifa base por viaje', unit: 'MXN/viaje', step: 1, min: 5, max: 50, tip: 'Cargo fijo por viaje independiente de la distancia.' },
      { key: 'avgTripKm', label: 'Km promedio por viaje', unit: 'km/viaje', step: 1, min: 2, max: 30, tip: 'Distancia típica de cada trayecto. Viaje urbano MX: 6-12 km.' },
    ],
    calc(p, km, gasPrice, cetes, elecPrice, oppOn) {
      const trips = km / p.avgTripKm;
      const op = p.costPerKm * km + p.baseFare * trips;
      return { op, depr: 0, opp: 0, cap: 0, residual: 0 };
    }
  },
];

const BAR_COLORS = {
  car:     '#E05252',
  ev:      '#4A9EDB',
  moto:    '#F4A642',
  scooter: '#1FC8B0',
  bike:    '#52C878',
  transit: '#A78BFA',
  uber:    '#FB923C',
};

// ── KEY PARAMS per mode — the 1-2 most impactful fields shown on alt cards ─
const KEY_PARAMS = {
  car:     ['purchasePrice', 'fuelEfficiency'],
  ev:      ['purchasePrice', 'consumption'],
  moto:    ['purchasePrice', 'fuelEfficiency'],
  scooter: ['purchasePrice', 'kmPerKwh'],
  bike:    ['purchasePrice'],
  transit: ['farePerTrip', 'tripsPerMonth'],
  uber:    ['costPerKm', 'avgTripKm'],
};

// ── PRESET MATCH TABLE — maps selected preset tier → alt mode default preset
// Keys: selected mode preset id. Values: { modeId: presetId }
// Modes without presets just use their default params (no entry needed).
const PRESET_MATCH = {
  'car-compact': { ev: 'ev-compact', moto: 'moto-urban' },
  'car-sedan':   { ev: 'ev-compact', moto: 'moto-urban' },
  'car-suv':     { ev: 'ev-suv',     moto: 'moto-sport' },
  'car-truck':   { ev: 'ev-suv',     moto: 'moto-sport' },
  'ev-compact':  { car: 'car-compact' },
  'ev-suv':      { car: 'car-suv' },
  'moto-urban':  { car: 'car-compact' },
  'moto-sport':  { car: 'car-sedan' },
};

// Apply matched presets to alt modes when user confirms step 2
function applyMatchedPresets() {
  const selectedPreset = state.activePreset;
  if (!selectedPreset) return;
  const matches = PRESET_MATCH[selectedPreset] || {};
  Object.entries(matches).forEach(([modeId, presetId]) => {
    const modePresets = PRESETS[modeId];
    if (!modePresets) return;
    const preset = modePresets.find(p => p.id === presetId);
    if (!preset) return;
    const condition = state.presetCondition || 'new';
    const vals = preset[condition] || preset.new;
    Object.entries(vals).forEach(([k, v]) => {
      state.params[modeId][k] = v;
    });
    // Track which preset is active for display on alt cards
    if (!state.altPresets) state.altPresets = {};
    state.altPresets[modeId] = { presetId, condition };
  });
}

// ── STATE ──────────────────────────────────────────────────────────────────
const state = {
  step: 1,
  selectedMode: null,
  km: DEFAULT_KM,
  gasPrice: DEFAULT_GAS_PRICE,
  elecPrice: DEFAULT_ELEC_PRICE,
  cetes: DEFAULT_CETES,
  oppOn: true,
  params: {},
  costPeriod: 'year',
  openMixId: null,       // unused, kept for forward compat
  mixRatio: 0.5,
  // standalone mix mode row
  freeMix: { modeA: 'transit', modeB: 'uber', ratio: 0.5, open: false },
  altPresets: {},        // { modeId: { presetId, condition } } — applied by matching
  altEditing: null,      // modeId whose key-param mini-edit is open on an alt card
};

// Initialize params for all modes from defaults
MODES.forEach(m => {
  state.params[m.id] = { ...m.defaultParams };
});

// ── HELPERS ────────────────────────────────────────────────────────────────
const fmt    = n => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(n);
const fmtKm  = n => new Intl.NumberFormat('es-MX').format(n);
const pct    = n => (n * 100).toFixed(1) + '%';

function formatCurrencyInput(val) {
  const num = parseFloat(val);
  if (isNaN(num)) return '';
  return new Intl.NumberFormat('es-MX', { maximumFractionDigits: 0 }).format(num);
}

function calcMode(modeId, km) {
  const mode = MODES.find(m => m.id === modeId);
  const p = state.params[modeId];
  const r = mode.calc(p, km, state.gasPrice, state.cetes, state.elecPrice, state.oppOn);
  const total = r.op + r.depr + r.opp;
  return { ...r, total, perKm: km > 0 ? total / km : 0, perMonth: total / 12 };
}

function formatPeriod(annual, period) {
  switch (period) {
    case 'day':   return fmt(annual / 365);
    case 'week':  return fmt(annual / 52);
    case 'month': return fmt(annual / 12);
    default:      return fmt(annual);
  }
}

function periodLabel(period) {
  switch (period) {
    case 'day':   return 'al día';
    case 'week':  return 'a la semana';
    case 'month': return 'al mes';
    default:      return 'al año';
  }
}

function scrollToStep(stepEl) {
  if (!stepEl) return;
  setTimeout(() => {
    const y = stepEl.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top: y, behavior: 'smooth' });
  }, 80);
}

// ── STEP 1: MODE SELECTION ─────────────────────────────────────────────────
function renderStep1() {
  const container = document.getElementById('step1-modes');
  container.innerHTML = '';
  MODES.forEach(mode => {
    const card = document.createElement('button');
    card.className = 'mode-card' + (state.selectedMode === mode.id ? ' selected' : '');
    card.dataset.id = mode.id;
    card.innerHTML = `
      <span class="mode-card-icon">${mode.icon}</span>
      <span class="mode-card-name">${mode.name}</span>
    `;
    card.addEventListener('click', () => selectMode(mode.id));
    container.appendChild(card);
  });
}

function selectMode(id) {
  state.selectedMode = id;
  renderStep1();

  // Reveal step 2
  const step2 = document.getElementById('step2');
  const wasHidden = step2.classList.contains('step-hidden');
  step2.classList.remove('step-hidden');
  step2.classList.add('step-visible');
  renderStep2();
  if (wasHidden) scrollToStep(step2);

  // Hide steps 3+ if mode changes
  hideStepsFrom(3);
}

// ── STEP 2: VEHICLE DETAILS ────────────────────────────────────────────────
function renderStep2() {
  const mode = MODES.find(m => m.id === state.selectedMode);
  if (!mode) return;

  document.getElementById('step2-icon').textContent = mode.icon;
  document.getElementById('step2-modename').textContent = mode.name;

  const presetsEl = document.getElementById('step2-presets');
  const presetsSection = document.getElementById('step2-presets-section');

  if (mode.hasPresets && PRESETS[mode.id]) {
    presetsSection.style.display = '';
    renderPresets(mode);
  } else {
    presetsSection.style.display = 'none';
  }

  renderFields(mode);
}

function renderPresets(mode) {
  const presetsEl = document.getElementById('step2-presets');
  presetsEl.innerHTML = '';

  // New/Used toggle
  const toggleWrap = document.createElement('div');
  toggleWrap.className = 'preset-condition-row';
  toggleWrap.innerHTML = `
    <span class="preset-condition-label">¿Como lo adquiriste?</span>
    <div class="preset-condition-toggle">
      <button class="condition-btn ${state.presetCondition !== 'used' ? 'active' : ''}" data-val="new">Nuevo</button>
      <button class="condition-btn ${state.presetCondition === 'used' ? 'active' : ''}" data-val="used">Usado</button>
    </div>
  `;
  toggleWrap.querySelectorAll('.condition-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      state.presetCondition = btn.dataset.val;
      renderPresets(mode);
      renderFields(mode);
    });
  });
  presetsEl.appendChild(toggleWrap);

  // Preset cards
  const grid = document.createElement('div');
  grid.className = 'presets-grid';

  PRESETS[mode.id].forEach(preset => {
    const card = document.createElement('button');
    card.className = 'preset-card' + (state.activePreset === preset.id ? ' selected' : '');
    card.innerHTML = `
      <span class="preset-card-icon">${preset.icon}</span>
      <span class="preset-card-label">${preset.label}</span>
      <span class="preset-card-examples">${preset.examples}</span>
    `;
    card.addEventListener('click', () => {
      state.activePreset = preset.id;
      const condition = state.presetCondition === 'used' ? 'used' : 'new';
      const vals = preset[condition];
      Object.entries(vals).forEach(([k, v]) => {
        state.params[mode.id][k] = v;
      });
      renderPresets(mode);
      renderFields(mode);
    });
    grid.appendChild(card);
  });

  presetsEl.appendChild(grid);
}

function renderFields(mode) {
  const container = document.getElementById('step2-fields');
  container.innerHTML = '';

  mode.fields.forEach(field => {
    const val = state.params[mode.id][field.key];
    const div = document.createElement('div');
    div.className = 'detail-field';

    const tipHTML = field.tip
      ? `<span class="tt" data-tip="${field.tip.replace(/"/g, '&quot;')}">?</span>`
      : '';

    let inputHTML = '';
    if (field.isCurrency) {
      inputHTML = `
        <div class="currency-wrap">
          <span class="currency-prefix">$</span>
          <input type="text" class="field-input" data-key="${field.key}"
            data-iscurrency="1" value="${formatCurrencyInput(val)}" inputmode="numeric">
        </div>`;
    } else if (field.isPct) {
      inputHTML = `
        <div class="plain-input-wrap">
          <input type="number" class="field-input" data-key="${field.key}"
            data-ispct="1" value="${(val * 100).toFixed(0)}"
            step="${field.step || 1}" min="${(field.min || 0)}" max="${(field.max || 100)}">
          <span class="field-suffix">%</span>
        </div>`;
    } else {
      inputHTML = `
        <div class="plain-input-wrap">
          <input type="number" class="field-input" data-key="${field.key}"
            value="${val}" step="${field.step || 1}"
            min="${field.min || 0}" max="${field.max || 99999}">
          <span class="field-suffix">${field.unit}</span>
        </div>`;
    }

    div.innerHTML = `
      <div class="detail-field-label">${field.label} ${tipHTML}</div>
      <div class="detail-field-input">${inputHTML}</div>
    `;
    container.appendChild(div);
  });

  // Wire up field inputs
  container.querySelectorAll('input.field-input').forEach(inp => {
    inp.addEventListener('input', () => {
      const key = inp.dataset.key;
      if (inp.dataset.iscurrency) {
        const val = parseFloat(inp.value.replace(/,/g, '')) || 0;
        state.params[mode.id][key] = val;
      } else if (inp.dataset.ispct) {
        const val = parseFloat(inp.value) / 100;
        if (!isNaN(val)) state.params[mode.id][key] = val;
      } else {
        const val = parseFloat(inp.value);
        if (!isNaN(val)) state.params[mode.id][key] = val;
      }
      if (state.step >= 4) rerenderResults();
    });
    if (inp.dataset.iscurrency) {
      inp.addEventListener('blur', () => {
        inp.value = formatCurrencyInput(state.params[mode.id][inp.dataset.key]);
      });
      inp.addEventListener('focus', () => {
        inp.value = state.params[mode.id][inp.dataset.key] || '';
      });
    }
  });
}

// Confirm step 2 → reveal step 3
function confirmStep2() {
  applyMatchedPresets();
  const step3 = document.getElementById('step3');
  const wasHidden = step3.classList.contains('step-hidden');
  step3.classList.remove('step-hidden');
  step3.classList.add('step-visible');
  state.step = Math.max(state.step, 3);
  renderStep3();
  if (wasHidden) scrollToStep(step3);
  hideStepsFrom(4);
}

// ── STEP 3: DISTANCE ───────────────────────────────────────────────────────
function renderStep3() {
  const mode = MODES.find(m => m.id === state.selectedMode);
  if (!mode) return;

  // Update km slider display
  document.getElementById('km-slider').value = Math.min(Math.max(state.km, 2000), 75000);
  document.getElementById('km-display').textContent = fmtKm(state.km) + ' km';

  // Show/hide odometer estimator
  const odoSection = document.getElementById('km-odo-section');
  if (mode.kmEstimators.includes('odometer')) {
    odoSection.style.display = '';
  } else {
    odoSection.style.display = 'none';
  }
}

function calcOdoKm() {
  const odo  = parseFloat(document.getElementById('km-odo-val').value);
  const yrs  = parseFloat(document.getElementById('km-odo-years').value);
  const res  = document.getElementById('km-odo-result');
  if (!isNaN(odo) && !isNaN(yrs) && yrs > 0 && odo > 0) {
    const km = Math.round(odo / yrs);
    res.textContent = `→ ${fmtKm(km)} km/año`;
    res.dataset.km = km;
    res.style.display = '';
    document.getElementById('km-odo-apply').style.display = '';
  } else {
    res.style.display = 'none';
    document.getElementById('km-odo-apply').style.display = 'none';
  }
}

function applyOdoKm() {
  const km = parseInt(document.getElementById('km-odo-result').dataset.km);
  if (!km) return;
  const clamped = Math.min(Math.max(km, 2000), 75000);
  state.km = clamped;
  document.getElementById('km-slider').value = clamped;
  document.getElementById('km-display').textContent = fmtKm(clamped) + ' km';
}

let commuteMultiplier = 1.5;

function calcCommuteKm() {
  const dist = parseFloat(document.getElementById('km-commute-dist').value);
  const days  = parseFloat(document.getElementById('km-commute-days').value);
  const res   = document.getElementById('km-commute-result');
  if (!isNaN(dist) && !isNaN(days) && dist > 0 && days > 0) {
    const km = Math.round(dist * 2 * days * 50 * commuteMultiplier);
    res.textContent = `→ ${fmtKm(km)} km/año`;
    res.dataset.km = km;
    res.style.display = '';
    document.getElementById('km-commute-apply').style.display = '';
  } else {
    res.style.display = 'none';
    document.getElementById('km-commute-apply').style.display = 'none';
  }
}

function setCommuteActivity(level) {
  const map = { low: 1.2, med: 1.5, high: 2.0 };
  commuteMultiplier = map[level];
  document.querySelectorAll('.activity-btn').forEach(b => b.classList.toggle('active', b.dataset.level === level));
  calcCommuteKm();
}

function applyCommuteKm() {
  const km = parseInt(document.getElementById('km-commute-result').dataset.km);
  if (!km) return;
  const clamped = Math.min(Math.max(km, 2000), 75000);
  state.km = clamped;
  document.getElementById('km-slider').value = clamped;
  document.getElementById('km-display').textContent = fmtKm(clamped) + ' km';
}

function confirmStep3() {
  const step4 = document.getElementById('step4');
  const wasHidden = step4.classList.contains('step-hidden');
  step4.classList.remove('step-hidden');
  step4.classList.add('step-visible');
  state.step = Math.max(state.step, 4);
  renderStep4();
  if (wasHidden) scrollToStep(step4);
}

// ── STEP 4: RESULTS ────────────────────────────────────────────────────────
function renderStep4() {
  rerenderResults();
}

function rerenderResults() {
  if (state.step < 4 || !state.selectedMode) return;
  renderCurrentCost();
  renderAlternativeCards();
}

function renderCurrentCost() {
  const mode = MODES.find(m => m.id === state.selectedMode);
  const r = calcMode(state.selectedMode, state.km);

  document.getElementById('result-mode-icon').textContent = mode.icon;
  document.getElementById('result-mode-name').textContent = mode.name;

  // Big number
  document.getElementById('result-big-number').textContent = formatPeriod(r.total, state.costPeriod);
  document.getElementById('result-period-label').textContent = periodLabel(state.costPeriod);

  // Period toggles
  document.querySelectorAll('.period-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.period === state.costPeriod);
  });

  // Breakdown
  const breakdownEl = document.getElementById('result-breakdown');
  const parts = [];
  if (r.op > 0) parts.push(`<span class="breakdown-item"><span class="breakdown-dot op"></span>Operación: <strong>${fmt(r.op)}</strong></span>`);
  if (r.depr > 0) parts.push(`<span class="breakdown-item"><span class="breakdown-dot depr"></span>Depreciación: <strong>${fmt(r.depr)}</strong></span>`);
  if (r.opp > 0) parts.push(`<span class="breakdown-item"><span class="breakdown-dot opp"></span>Costo de oportunidad: <strong>${fmt(r.opp)}</strong></span>`);
  breakdownEl.innerHTML = parts.join('<span class="breakdown-sep">·</span>');

  // Per km
  document.getElementById('result-perkm').textContent = `${fmt(r.perKm)} por kilómetro`;
}

function renderAlternativeCards() {
  const myTotal = calcMode(state.selectedMode, state.km).total;
  const container = document.getElementById('alternatives-container');
  container.innerHTML = '';

  const alternatives = MODES.filter(m => m.id !== state.selectedMode)
    .map(m => {
      const r = calcMode(m.id, state.km);
      return { mode: m, r, delta: r.total - myTotal };
    })
    .sort((a, b) => a.delta - b.delta);

  alternatives.forEach(({ mode, r, delta }) => {
    const isSaving = delta < 0;
    const card = document.createElement('div');
    card.className = 'alt-card' + (state.altEditing === mode.id ? ' editing-open' : '');
    card.dataset.id = mode.id;

    const color = BAR_COLORS[mode.id];
    const deltaLabel = isSaving
      ? `<span class="delta saving">Ahorrarías ${fmt(Math.abs(delta))}/año</span>`
      : `<span class="delta spending">Gastarías ${fmt(delta)} más/año</span>`;

    // Build assumption summary line
    const assumptionHTML = buildAssumptionLine(mode);

    // Build inline edit panel if open
    const editHTML = state.altEditing === mode.id ? buildAltEditPanel(mode) : '';

    card.innerHTML = `
      <div class="alt-card-main">
        <div class="alt-card-left">
          <div class="alt-card-icon" style="background:${color}22;color:${color}">${mode.icon}</div>
          <div class="alt-card-info">
            <div class="alt-card-name">${mode.name}</div>
            <div class="alt-card-total">${fmt(r.total)}/año · ${fmt(r.perKm)}/km</div>
            <div class="alt-card-assumptions">
              <span class="assumption-label">Basado en:</span>
              ${assumptionHTML}
              <button class="assumption-edit-btn" data-id="${mode.id}" title="Ajustar supuestos">
                ${state.altEditing === mode.id ? 'Cerrar ▲' : 'Ajustar ✎'}
              </button>
            </div>
          </div>
        </div>
        <div class="alt-card-right">
          ${deltaLabel}
        </div>
      </div>
      ${editHTML}
    `;

    card.querySelector('.assumption-edit-btn').addEventListener('click', () => {
      state.altEditing = state.altEditing === mode.id ? null : mode.id;
      renderAlternativeCards();
    });

    if (state.altEditing === mode.id) {
      wireAltEditPanel(card, mode);
    }

    container.appendChild(card);
  });

  // Standalone free-mix row
  container.appendChild(buildFreeMixRow(myTotal));
}

// Build the assumption summary text for an alt card
function buildAssumptionLine(mode) {
  const keys = KEY_PARAMS[mode.id] || [];
  const p = state.params[mode.id];
  const modeObj = MODES.find(m => m.id === mode.id);

  const parts = keys.map(key => {
    const fieldDef = modeObj.fields.find(f => f.key === key);
    if (!fieldDef) return '';
    const val = p[key];
    if (fieldDef.isCurrency) return `${fieldDef.label}: ${fmt(val)}`;
    if (fieldDef.isPct)      return `${fieldDef.label}: ${(val * 100).toFixed(0)}%`;
    return `${fieldDef.label}: ${val} ${fieldDef.unit}`;
  });

  return parts.map(t => `<span class="assumption-chip">${t}</span>`).join('');
}

// Build the inline mini-edit panel HTML for an alt card
function buildAltEditPanel(mode) {
  const keys = KEY_PARAMS[mode.id] || [];
  const p = state.params[mode.id];
  const modeObj = MODES.find(m => m.id === mode.id);

  const fieldsHTML = keys.map(key => {
    const fieldDef = modeObj.fields.find(f => f.key === key);
    if (!fieldDef) return '';
    const val = p[key];
    const tipHTML = fieldDef.tip
      ? `<span class="tt" data-tip="${fieldDef.tip.replace(/"/g, '&quot;')}">?</span>`
      : '';

    let inputHTML;
    if (fieldDef.isCurrency) {
      inputHTML = `
        <div class="currency-wrap">
          <span class="currency-prefix">$</span>
          <input type="text" class="alt-edit-input" data-key="${key}" data-iscurrency="1"
            data-modeid="${mode.id}" value="${formatCurrencyInput(val)}" inputmode="numeric">
        </div>`;
    } else if (fieldDef.isPct) {
      inputHTML = `
        <div class="plain-input-wrap">
          <input type="number" class="alt-edit-input" data-key="${key}" data-ispct="1"
            data-modeid="${mode.id}" value="${(val * 100).toFixed(0)}"
            step="${fieldDef.step || 1}" min="${fieldDef.min || 0}" max="${fieldDef.max || 100}">
          <span class="field-suffix">%</span>
        </div>`;
    } else {
      inputHTML = `
        <div class="plain-input-wrap">
          <input type="number" class="alt-edit-input" data-key="${key}"
            data-modeid="${mode.id}" value="${val}"
            step="${fieldDef.step || 1}" min="${fieldDef.min || 0}" max="${fieldDef.max || 99999}">
          <span class="field-suffix">${fieldDef.unit}</span>
        </div>`;
    }

    return `
      <div class="alt-edit-field">
        <div class="alt-edit-label">${fieldDef.label} ${tipHTML}</div>
        ${inputHTML}
      </div>`;
  }).join('');

  return `<div class="alt-edit-panel"><div class="alt-edit-grid">${fieldsHTML}</div></div>`;
}

// Wire up input events on the inline edit panel
function wireAltEditPanel(card, mode) {
  card.querySelectorAll('.alt-edit-input').forEach(inp => {
    inp.addEventListener('input', () => {
      const key = inp.dataset.key;
      const modeId = inp.dataset.modeid;
      if (inp.dataset.iscurrency) {
        const val = parseFloat(inp.value.replace(/,/g, '')) || 0;
        state.params[modeId][key] = val;
      } else if (inp.dataset.ispct) {
        const val = parseFloat(inp.value) / 100;
        if (!isNaN(val)) state.params[modeId][key] = val;
      } else {
        const val = parseFloat(inp.value);
        if (!isNaN(val)) state.params[modeId][key] = val;
      }
      rerenderResults();
    });
    if (inp.dataset.iscurrency) {
      inp.addEventListener('blur', () => {
        inp.value = formatCurrencyInput(state.params[inp.dataset.modeid][inp.dataset.key]);
      });
      inp.addEventListener('focus', () => {
        inp.value = state.params[inp.dataset.modeid][inp.dataset.key] || '';
      });
    }
  });
}

// ── STANDALONE FREE-MIX ROW ────────────────────────────────────────────────
function buildFreeMixRow(myTotal) {
  const wrapper = document.createElement('div');
  wrapper.className = 'free-mix-row';

  const allModes = MODES;
  const modeOptions = allModes.map(m =>
    `<option value="${m.id}" ${state.freeMix.modeA === m.id ? 'selected' : ''}>${m.icon} ${m.name}</option>`
  ).join('');
  const modeOptionsB = allModes.map(m =>
    `<option value="${m.id}" ${state.freeMix.modeB === m.id ? 'selected' : ''}>${m.icon} ${m.name}</option>`
  ).join('');

  const mixResult = state.freeMix.open ? calcFreeMixCost() : null;
  const mixDelta  = mixResult !== null ? mixResult - myTotal : null;
  const isSaving  = mixDelta !== null && mixDelta < 0;
  const ratio     = state.freeMix.ratio;

  wrapper.innerHTML = `
    <div class="free-mix-header">
      <span class="free-mix-icon">⊕</span>
      <span class="free-mix-title">Calcular modo mixto</span>
      <span class="free-mix-desc">¿Qué pasaría si combinaras dos modos distintos?</span>
    </div>
    <div class="free-mix-selectors">
      <select class="free-mix-select" id="fmix-a">${modeOptions}</select>
      <span class="free-mix-plus">+</span>
      <select class="free-mix-select" id="fmix-b">${modeOptionsB}</select>
      <button class="free-mix-calc-btn" id="fmix-calc">Calcular</button>
    </div>
    ${state.freeMix.open ? `
      <div class="free-mix-result-area">
        <div class="mix-slider-row">
          <span class="mix-label-a">100% ${MODES.find(m=>m.id===state.freeMix.modeA)?.icon}</span>
          <input type="range" class="mix-slider" id="fmix-slider" min="0" max="1" step="0.01" value="${ratio}">
          <span class="mix-label-b">100% ${MODES.find(m=>m.id===state.freeMix.modeB)?.icon}</span>
        </div>
        <div class="mix-snaps">
          <button class="mix-snap-btn fmix-snap ${Math.abs(ratio-0.2)<0.01?'active':''}" data-ratio="0.2">20 / 80<br><small>Ocasionalmente</small></button>
          <button class="mix-snap-btn fmix-snap ${Math.abs(ratio-0.5)<0.01?'active':''}" data-ratio="0.5">50 / 50<br><small>Mitad y mitad</small></button>
          <button class="mix-snap-btn fmix-snap ${Math.abs(ratio-0.8)<0.01?'active':''}" data-ratio="0.8">80 / 20<br><small>Principalmente A</small></button>
        </div>
        <div class="mix-result">
          <div id="fmix-cost" class="mix-result-cost">${mixResult !== null ? fmt(mixResult)+'/año' : '—'}</div>
          <div id="fmix-delta" class="mix-result-delta ${isSaving?'saving':'spending'}">
            ${mixDelta !== null
              ? (isSaving ? `Ahorrarías ${fmt(Math.abs(mixDelta))}/año vs tu modo actual` : `Gastarías ${fmt(mixDelta)} más/año vs tu modo actual`)
              : ''}
          </div>
        </div>
      </div>` : ''}
  `;

  // Selector change
  wrapper.querySelector('#fmix-a').addEventListener('change', e => {
    state.freeMix.modeA = e.target.value;
    state.freeMix.open = false;
    renderAlternativeCards();
  });
  wrapper.querySelector('#fmix-b').addEventListener('change', e => {
    state.freeMix.modeB = e.target.value;
    state.freeMix.open = false;
    renderAlternativeCards();
  });

  // Calc button
  wrapper.querySelector('#fmix-calc').addEventListener('click', () => {
    if (state.freeMix.modeA === state.freeMix.modeB) {
      alert('Elige dos modos diferentes para combinar.');
      return;
    }
    state.freeMix.open = true;
    renderAlternativeCards();
  });

  // Slider (only wired if open)
  if (state.freeMix.open) {
    const slider = wrapper.querySelector('#fmix-slider');
    if (slider) {
      slider.addEventListener('input', () => {
        state.freeMix.ratio = parseFloat(slider.value);
        updateFreeMixResult(wrapper, myTotal);
      });
      wrapper.querySelectorAll('.fmix-snap').forEach(btn => {
        btn.addEventListener('click', () => {
          state.freeMix.ratio = parseFloat(btn.dataset.ratio);
          slider.value = state.freeMix.ratio;
          updateFreeMixResult(wrapper, myTotal);
          wrapper.querySelectorAll('.fmix-snap').forEach(b =>
            b.classList.toggle('active', Math.abs(parseFloat(b.dataset.ratio) - state.freeMix.ratio) < 0.01)
          );
        });
      });
    }
  }

  return wrapper;
}

function calcFreeMixCost() {
  const { modeA, modeB, ratio } = state.freeMix;
  // ratio = fraction of km on modeA, (1-ratio) on modeB
  const kmA = state.km * ratio;
  const kmB = state.km * (1 - ratio);
  const rA = calcMode(modeA, kmA);
  const rB = calcMode(modeB, kmB);
  let total = rA.total + rB.total;

  // Capital modes: fixed costs don't scale with partial km
  const mA = MODES.find(m => m.id === modeA);
  const mB = MODES.find(m => m.id === modeB);
  if (mA.hasCapital) {
    const full = calcMode(modeA, state.km);
    total = total - rA.depr - rA.opp + full.depr + full.opp;
  }
  if (mB.hasCapital) {
    const full = calcMode(modeB, state.km);
    total = total - rB.depr - rB.opp + full.depr + full.opp;
  }
  return total;
}

function updateFreeMixResult(wrapper, myTotal) {
  const mixTotal = calcFreeMixCost();
  const mixDelta = mixTotal - myTotal;
  const isSaving = mixDelta < 0;
  const costEl  = wrapper.querySelector('#fmix-cost');
  const deltaEl = wrapper.querySelector('#fmix-delta');
  if (costEl)  costEl.textContent  = `${fmt(mixTotal)}/año`;
  if (deltaEl) {
    deltaEl.className = `mix-result-delta ${isSaving ? 'saving' : 'spending'}`;
    deltaEl.textContent = isSaving
      ? `Ahorrarías ${fmt(Math.abs(mixDelta))}/año vs tu modo actual`
      : `Gastarías ${fmt(mixDelta)} más/año vs tu modo actual`;
  }
}



// ── STEP VISIBILITY ────────────────────────────────────────────────────────
function hideStepsFrom(stepNum) {
  for (let i = stepNum; i <= 4; i++) {
    const el = document.getElementById(`step${i}`);
    if (el) {
      el.classList.add('step-hidden');
      el.classList.remove('step-visible');
    }
  }
  if (stepNum <= 4) state.step = Math.min(state.step, stepNum - 1);
}

// ── GLOBAL CONTROLS (advanced panel) ──────────────────────────────────────
function initAdvancedPanel() {
  const toggle = document.getElementById('advanced-toggle');
  const panel  = document.getElementById('advanced-panel');
  toggle.addEventListener('click', () => {
    const open = panel.classList.toggle('open');
    toggle.querySelector('.adv-chevron').textContent = open ? '▲' : '▼';
    toggle.querySelector('.adv-label').textContent = open ? 'Ocultar parámetros avanzados' : 'Ver parámetros avanzados';
  });

  document.getElementById('adv-gas-price').addEventListener('input', e => {
    const v = parseFloat(e.target.value);
    if (!isNaN(v) && v > 0) { state.gasPrice = v; rerenderResults(); }
  });
  document.getElementById('adv-elec-price').addEventListener('input', e => {
    const v = parseFloat(e.target.value);
    if (!isNaN(v) && v > 0) { state.elecPrice = v; rerenderResults(); }
  });
  document.getElementById('adv-cetes-slider').addEventListener('input', e => {
    state.cetes = parseFloat(e.target.value);
    document.getElementById('adv-cetes-display').textContent = pct(state.cetes);
    rerenderResults();
  });
  document.getElementById('adv-opp-toggle').addEventListener('change', e => {
    state.oppOn = e.target.checked;
    rerenderResults();
  });
}

// ── TOOLTIP SYSTEM ─────────────────────────────────────────────────────────
function initTooltips() {
  const popup = document.createElement('div');
  popup.className = 'tt-popup';
  document.body.appendChild(popup);
  let activeEl = null;

  function position(el) {
    const rect = el.getBoundingClientRect();
    const margin = 10;
    const popupW = 280;
    let left = rect.left;
    let top  = rect.bottom + 8;
    if (top + 120 > window.innerHeight) {
      top = rect.top - 8;
      popup.style.transform = 'translateY(-100%)';
    } else {
      popup.style.transform = '';
    }
    if (left + popupW > window.innerWidth - margin) left = window.innerWidth - popupW - margin;
    if (left < margin) left = margin;
    popup.style.left = left + 'px';
    popup.style.top  = top + 'px';
  }

  document.addEventListener('mouseover', e => {
    const el = e.target.closest('.tt');
    if (!el || !el.dataset.tip) return;
    activeEl = el;
    popup.textContent = el.dataset.tip;
    popup.classList.add('visible');
    position(el);
  });
  document.addEventListener('mouseout', e => {
    if (!e.target.closest('.tt')) return;
    activeEl = null;
    popup.classList.remove('visible');
  });
  window.addEventListener('scroll', () => { if (activeEl) position(activeEl); }, { passive: true });
}

// ── PERIOD TOGGLE ──────────────────────────────────────────────────────────
function initPeriodToggle() {
  document.querySelectorAll('.period-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      state.costPeriod = btn.dataset.period;
      renderCurrentCost();
    });
  });
}

// ── KM SLIDER ─────────────────────────────────────────────────────────────
function initKmSlider() {
  document.getElementById('km-slider').addEventListener('input', e => {
    state.km = parseInt(e.target.value);
    document.getElementById('km-display').textContent = fmtKm(state.km) + ' km';
    rerenderResults();
  });
}

// ── INIT ───────────────────────────────────────────────────────────────────
state.presetCondition = 'new';
state.activePreset = null;

renderStep1();
initAdvancedPanel();
initTooltips();
initPeriodToggle();
initKmSlider();
