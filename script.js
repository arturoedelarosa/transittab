// ═══════════════════════════════════════════════════════════════════════════
// ── EDITABLE DATA BLOCK — actualiza estos valores cuando cambien los datos ──
// ═══════════════════════════════════════════════════════════════════════════
// Fuente: PETROIntelligence via nacionalgasolinero.com — mayo 2026
const DEFAULT_GAS_PRICE  = 23.68;  // MXN/litro · Magna promedio nacional
// Fuente: CFE tarifa doméstica estimada
const DEFAULT_ELEC_PRICE = 2.00;   // MXN/kWh
// Fuente: CetesDirecto.com — CETES 28 días mayo 2026 (usando tasa conservadora de instrumentos estables)
const DEFAULT_CETES      = 0.075;  // 7.5% anual — rendimiento conservador instrumentos financieros estables
// Fuente: El Universal / estimación uso urbano México
const DEFAULT_KM         = 10000;  // km/año promedio conductor mexicano
// Fuente: INEGI — inflación promedio México 2024-2026
const DEFAULT_INFL_RATE  = 0.045;  // 4.5% anual
// ═══════════════════════════════════════════════════════════════════════════

const MODES = [
  {
    id: 'car',
    icon: '🚗',
    name: 'Auto de gasolina',
    hasCapital: true,
    params: {
      // Fuente A01: Motorpasión / J.D. Power 2024
      purchasePrice:  { label: 'Precio de compra', value: 516000, unit: 'MXN', min: 50000, max: 2000000, step: 5000, isCurrency: true, tip: 'Precio que pagaste (o pagarías) por el vehículo. Promedio nacional auto nuevo: $516,000 MXN. Fuente: J.D. Power / Motorpasión MX 2024. Los autos usados aplica el precio que pagaste tú, no el valor actual.' },
      fuelEfficiency: { label: 'Rendimiento', value: 12, unit: 'km/litro', min: 6, max: 25, step: 0.5, tip: 'Kilómetros que recorre tu auto por litro de gasolina. Promedio nacional: ~12 km/l en uso urbano real (con tráfico, arranques y paradas). Autos compactos en carretera: 14-17 km/l. SUVs y camionetas: 8-11 km/l. Puedes calcularlo llenando el tanque, reseteando el odómetro y dividiendo km recorridos entre litros en la siguiente carga.' },
      // Fuente A04: CONDUSEF / Rastreator 2025
      insurance:      { label: 'Seguro anual', value: 12338, unit: 'MXN/año', min: 0, max: 50000, step: 500, isCurrency: true, tip: 'Prima anual de tu seguro de auto. Promedio nacional: ~$12,338 MXN/año para cobertura amplia. Fuente: CONDUSEF / Rastreator.mx 2025. Varía según valor del vehículo, edad del conductor, cobertura contratada y estado donde vives.' },
      // Fuente A07: Autofact.mx
      maintenance:    { label: 'Mantenimiento anual', value: 6000, unit: 'MXN/año', min: 0, max: 30000, step: 500, isCurrency: true, tip: 'Suma de todos los gastos de mantenimiento en un año: afinaciones, cambios de aceite, llantas, frenos, filtros. Promedio estimado: ~$6,000 MXN/año para auto compacto con uso normal. Fuente: Autofact.mx. Autos más nuevos o de mayor gama pueden tener costos mucho más altos.' },
      // Fuente A08: El Universal
      fees:           { label: 'Tenencia + trámites', value: 2500, unit: 'MXN/año', min: 0, max: 15000, step: 100, isCurrency: true, tip: 'Tenencia vehicular, verificación, refrendo de placas y otros trámites anuales obligatorios. Varía mucho por estado: CDMX cobró tenencia hasta 2012, pero muchos estados la mantienen. Incluye también verificación vehicular si aplica en tu ciudad.' },
      // Fuente A05: KBB / mercado MX
      deprRate:       { label: 'Depreciación anual', value: 0.18, unit: '%', min: 0.05, max: 0.35, step: 0.01, isPct: true, tip: 'Porcentaje del valor del vehículo que se pierde cada año. Promedio nacional: ~18% anual. Los primeros años la caída es mayor (25-30% el año 1), luego se estabiliza. Autos de marcas premium o con alta demanda en reventa deprecian menos. Fuente: KBB / mercado secundario MX.' },
    },
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
    params: {
      // Fuente AE01: RappiCard / El Informador 2025
      purchasePrice: { label: 'Precio de compra', value: 600000, unit: 'MXN', min: 200000, max: 2000000, step: 10000, isCurrency: true, tip: 'Precio del vehículo eléctrico. Promedio nacional auto eléctrico nuevo: ~$600,000 MXN. Fuente: El Informador / RappiCard 2025. El rango va desde ~$350k (BYD Dolphin, Ora) hasta más de $1.2M (Tesla Model 3/Y). El precio de compra más alto es la razón principal por la que el EV sale más caro a pocos km/año.' },
      consumption:   { label: 'Consumo eléctrico', value: 16, unit: 'kWh/100km', min: 10, max: 30, step: 0.5, tip: 'Energía que consume el vehículo por cada 100 km. Promedio: ~16 kWh/100km. Autos compactos eléctricos (BYD, Ora): 13-17 kWh/100km. SUVs eléctricas: 18-25 kWh/100km. Lo encuentras en las especificaciones del fabricante o en la computadora de a bordo.' },
      insurance:     { label: 'Seguro anual', value: 11000, unit: 'MXN/año', min: 0, max: 50000, step: 500, isCurrency: true, tip: 'Prima anual de seguro para vehículo eléctrico. Promedio estimado: ~$11,000 MXN/año. Suele ser ligeramente menor al auto de gasolina equivalente porque los EVs tienen menos partes móviles y menor riesgo de incendio por combustible. Sin embargo, la reparación de baterías puede encarecer las coberturas.' },
      maintenance:   { label: 'Mantenimiento anual', value: 3000, unit: 'MXN/año', min: 0, max: 20000, step: 500, isCurrency: true, tip: 'Los autos eléctricos tienen costos de mantenimiento significativamente menores: sin cambios de aceite, menos desgaste en frenos (frenado regenerativo), sin bujías ni filtros de combustible. El costo principal es la revisión anual de sistema eléctrico y neumáticos. Promedio estimado: ~$3,000 MXN/año.' },
      fees:          { label: 'Tenencia + trámites', value: 2500, unit: 'MXN/año', min: 0, max: 15000, step: 100, isCurrency: true, tip: 'En varios estados los vehículos eléctricos tienen exenciones o descuentos en tenencia y verificación como incentivo a la electromovilidad. Verifica el esquema de tu estado — en algunos casos este costo puede ser $0.' },
      deprRate:      { label: 'Depreciación anual', value: 0.20, unit: '%', min: 0.05, max: 0.40, step: 0.01, isPct: true, tip: 'Los autos eléctricos deprecian más rápido que los de gasolina equivalentes por la incertidumbre sobre la vida útil de la batería y la rápida evolución tecnológica del segmento. Promedio estimado: ~20% anual. Una batería degradada puede reducir el valor de reventa drásticamente.' },
    },
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
    params: {
      purchasePrice:  { label: 'Precio de compra', value: 45000, unit: 'MXN', min: 10000, max: 300000, step: 1000, isCurrency: true, tip: 'Precio de compra de la motocicleta. El rango es muy amplio: motos de trabajo (Honda CB, Italika) desde $20-35k, motos deportivas o de marca desde $80k en adelante. Usa el precio que pagaste tú.' },
      fuelEfficiency: { label: 'Rendimiento', value: 32, unit: 'km/litro', min: 15, max: 60, step: 1, tip: 'Kilómetros por litro de la moto. Las motos son significativamente más eficientes que los autos: motos de trabajo 35-50 km/l, motos deportivas 20-30 km/l, motos grandes/touring 15-20 km/l. Promedio estimado: ~32 km/l.' },
      insurance:      { label: 'Seguro básico anual', value: 2500, unit: 'MXN/año', min: 0, max: 15000, step: 100, isCurrency: true, tip: 'Prima anual de seguro básico para motocicleta. Promedio estimado: ~$2,500 MXN/año para cobertura de responsabilidad civil. Muchos motociclistas circulan sin seguro, lo cual es un riesgo financiero significativo en caso de accidente.' },
      maintenance:    { label: 'Mantenimiento anual', value: 3000, unit: 'MXN/año', min: 0, max: 15000, step: 100, isCurrency: true, tip: 'Mantenimiento anual de la moto: aceite, cadena, llantas, filtros, frenos. El mantenimiento es más frecuente que en autos pero más barato por servicio. Promedio estimado: ~$3,000 MXN/año con uso normal.' },
      deprRate:       { label: 'Depreciación anual', value: 0.20, unit: '%', min: 0.05, max: 0.40, step: 0.01, isPct: true, tip: 'Las motocicletas deprecian rápido, especialmente en los primeros años. Motos populares de trabajo mantienen mejor su valor por alta demanda de reventa. Motos deportivas o de importación deprecian más. Promedio estimado: ~20% anual.' },
    },
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
    params: {
      purchasePrice: { label: 'Precio de compra', value: 20000, unit: 'MXN', min: 1000, max: 100000, step: 500, isCurrency: true, tip: 'Precio de compra de tu vehículo. Ebikes de entrada: ~$12,000–$20,000 MXN, de buena calidad: $30,000–$80,000+. Scooters eléctricos básicos: $8,000–$15,000. Modelos premium: $25,000–$60,000. Usa el precio que pagaste tú.' },
      kmPerKwh:      { label: 'Eficiencia energética', value: 30, unit: 'km/kWh', min: 5, max: 80, step: 1, tip: 'Kilómetros recorridos por cada kWh consumido. Ebikes urbanas: ~30–50 km/kWh. Scooters ligeros: ~20–35 km/kWh. Scooters más pesados o rápidos: ~10–20 km/kWh. El costo se calcula automáticamente con la tarifa CFE que configuraste arriba.' },
      maintenance:   { label: 'Mantenimiento anual', value: 1500, unit: 'MXN/año', min: 0, max: 8000, step: 100, isCurrency: true, tip: 'Mantenimiento anual: llantas, frenos, cadena (ebike), revisión eléctrica. Muy bajo comparado con vehículos de combustión. El gasto mayor a mediano plazo suele ser el reemplazo de batería (3–5 años de vida útil). Promedio estimado: ~$1,500 MXN/año.' },
      deprRate:      { label: 'Depreciación anual', value: 0.18, unit: '%', min: 0.02, max: 0.40, step: 0.01, isPct: true, tip: 'Porcentaje del valor que se pierde por año. Ebikes y scooters eléctricos deprecian más que bicicletas mecánicas (~8%) por la degradación de la batería y la rápida evolución del mercado. Promedio estimado: ~18% anual.' },
    },
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
    params: {
      purchasePrice: { label: 'Precio de compra', value: 8000, unit: 'MXN', min: 1000, max: 80000, step: 500, isCurrency: true, tip: 'Precio de compra de la bicicleta. El rango es enorme: bici básica de uso urbano $1,500-4,000 MXN, bici de buena calidad $5,000-15,000 MXN, bici de carbono o eléctrica $20,000+. El default asume una bici urbana de buena calidad.' },
      maintenance:   { label: 'Mantenimiento anual', value: 2000, unit: 'MXN/año', min: 0, max: 10000, step: 100, isCurrency: true, tip: 'Mantenimiento anual de la bicicleta: llantas, cadena, cables, frenos, ajustes. Para un ciclista urbano con uso diario, ~$2,000 MXN/año es una estimación conservadora. Incluye eventuales reparaciones por ponchaduras y desgaste normal.' },
      deprRate:      { label: 'Depreciación anual', value: 0.08, unit: '%', min: 0.02, max: 0.25, step: 0.01, isPct: true, tip: 'Las bicicletas deprecian mucho menos que los vehículos motorizados, especialmente las de buena marca. Una bici bien mantenida puede conservar el 70-80% de su valor por años. Promedio estimado: ~8% anual.' },
    },
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
    params: {
      // Fuente TP01: Ciudadanos Observando — promedio 26 ciudades MX excl. CDMX
      farePerTrip:   { label: 'Tarifa por viaje', value: 12.00, unit: 'MXN/viaje', min: 3, max: 30, step: 0.50, tip: 'Tarifa promedio por viaje en transporte público. Promedio nacional (excluyendo CDMX): ~$12 MXN. CDMX es un caso especial subsidiado ($5-7.50). Monterrey: ~$17. Guadalajara: ~$11. Fuente: Ciudadanos Observando, comparativo 26 ciudades 2025. Usa la tarifa de tu ciudad.' },
      tripsPerMonth: { label: 'Viajes al mes', value: 44, unit: 'viajes/mes', min: 10, max: 120, step: 2, tip: 'Número de viajes en transporte público por mes. 44 viajes/mes equivale a ~2 viajes por día hábil (ida y vuelta al trabajo). Si usas transporte público también fines de semana o para múltiples destinos, aumenta este número.' },
    },
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
    params: {
      // Fuente U01: post-reforma laboral julio 2025
      costPerKm:  { label: 'Tarifa por km', value: 8.00, unit: 'MXN/km', min: 3, max: 25, step: 0.50, tip: 'Costo por kilómetro en Uber/Didi. Varía según ciudad, hora del día y demanda. Estimado post-reforma laboral julio 2025 que incrementó costos operativos. Ciudad de México y Monterrey suelen ser más caros. En ciudades medianas puede ser menor.' },
      baseFare:   { label: 'Tarifa base por viaje', value: 12.00, unit: 'MXN/viaje', min: 5, max: 50, step: 1, tip: 'Cargo fijo por viaje, independiente de la distancia. Se aplica al inicio de cada trayecto y cubre el tiempo de espera y los primeros kilómetros. Varía por ciudad y plataforma.' },
      avgTripKm:  { label: 'Km por viaje promedio', value: 8, unit: 'km/viaje', min: 2, max: 30, step: 1, tip: 'Distancia promedio de cada viaje que tomas en Uber o Didi. Afecta el número de viajes necesarios para cubrir tus kilómetros anuales. Un viaje urbano típico en ciudades mexicanas es de 6-12 km.' },
    },
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

// ── State ──────────────────────────────────────────────────────────────────
const state = {
  km:        DEFAULT_KM,
  gasPrice:  DEFAULT_GAS_PRICE,
  elecPrice: DEFAULT_ELEC_PRICE,
  cetes:     DEFAULT_CETES,
  oppOn:     true,
  inflOn:    false,
  inflRate:  DEFAULT_INFL_RATE,
  params:    {}
};
MODES.forEach(m => {
  state.params[m.id] = {};
  Object.entries(m.params).forEach(([k, v]) => { state.params[m.id][k] = v.value; });
});

// ── Helpers ────────────────────────────────────────────────────────────────
const fmt    = n => new Intl.NumberFormat('es-MX', { style:'currency', currency:'MXN', maximumFractionDigits:0 }).format(n);
const fmtKm  = n => new Intl.NumberFormat('es-MX').format(n);
const fmtNum = n => new Intl.NumberFormat('es-MX').format(n);
const pct    = n => (n * 100).toFixed(1) + '%';

function formatCurrencyInput(val) {
  const num = parseFloat(val);
  if (isNaN(num)) return '';
  return new Intl.NumberFormat('es-MX', { maximumFractionDigits: 0 }).format(num);
}
function parseCurrencyInput(str) {
  return parseFloat(str.replace(/,/g, '').replace(/\./g, '')) || 0;
}

function computeAll() {
  return MODES.map(m => {
    const p = state.params[m.id];
    let effectiveParams = p;
    if (state.inflOn && p.deprRate !== undefined) {
      const realDepr = Math.max(0, p.deprRate - state.inflRate);
      effectiveParams = { ...p, deprRate: realDepr };
    }
    const r = m.calc(effectiveParams, state.km, state.gasPrice, state.cetes, state.elecPrice, state.oppOn);
    const total = r.op + r.depr + r.opp;
    return { ...m, result: r, total, perKm: total / state.km, perMonth: total / 12 };
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// RENDER
// ═══════════════════════════════════════════════════════════════════════════

function renderChart(data) {
  const sorted = [...data].sort((a, b) => a.total - b.total);
  const max    = sorted[sorted.length - 1].total;
  const el     = document.getElementById('chart-container');
  el.innerHTML = '';

  sorted.forEach((d, i) => {
    const barPct = (d.total / max) * 100;
    const isMin  = i === 0;
    const isMax  = i === sorted.length - 1;
    const inside = barPct > 32;
    const color  = BAR_COLORS[d.id];

    const row = document.createElement('div');
    row.className = 'chart-row' + (isMin ? ' best' : isMax ? ' worst' : '');
    row.innerHTML = `
      <div class="mode-label">
        <span class="mode-icon">${d.icon}</span>
        <span>${d.name}</span>
      </div>
      <div class="bar-wrapper">
        <div class="bar-fill" style="width:${barPct}%;background:${color}">
          ${inside ? `<span class="bar-label">${fmt(d.perKm)}/km</span>` : ''}
        </div>
        ${!inside ? `<span style="position:absolute;left:calc(${barPct}% + 6px);top:50%;transform:translateY(-50%);font-family:var(--mono);font-size:11px;font-weight:600;color:${color};white-space:nowrap">${fmt(d.perKm)}/km</span>` : ''}
      </div>
      <div class="mode-total">${fmt(d.total)}/año</div>
      <span class="badge ${isMin ? 'best' : isMax ? 'worst' : 'empty'}">${isMin ? '✓ Más barato' : isMax ? '✗ Más caro' : ''}</span>
    `;
    el.appendChild(row);
  });
}

function renderInsight(data) {
  const sorted     = [...data].sort((a, b) => a.total - b.total);
  const cheapest   = sorted[0];
  const expensive  = sorted[sorted.length - 1];
  const car        = data.find(d => d.id === 'car');
  const transit    = data.find(d => d.id === 'transit');
  const diff       = expensive.total - cheapest.total;
  const oppCar     = car.result.opp;
  const transitYrs = (car.total / transit.total).toFixed(1);

  const evBreakeven = (() => {
    const evM  = MODES.find(m => m.id === 'ev');
    const carM = MODES.find(m => m.id === 'car');
    for (let k = 5000; k <= 60000; k += 500) {
      const evR  = evM.calc(state.params['ev'],  k, state.gasPrice, state.cetes, state.elecPrice, state.oppOn);
      const carR = carM.calc(state.params['car'], k, state.gasPrice, state.cetes, state.elecPrice, state.oppOn);
      if ((evR.op + evR.depr + evR.opp) <= (carR.op + carR.depr + carR.opp)) return k;
    }
    return null;
  })();

  let text = `A <strong>${fmtKm(state.km)} km/año</strong>, tu modo más caro —
    <strong>${expensive.name}</strong> — genera un egreso de
    <strong>${fmt(expensive.total)}/año</strong> (${fmt(expensive.perKm)}/km),
    es decir <strong>${fmt(diff)} más</strong> que la alternativa más económica. `;

  if (state.oppOn && oppCar > 0) {
    text += `De ese total, <strong>${fmt(oppCar)}</strong> corresponde al costo de oportunidad:
      capital que permanece inmovilizado en lugar de generar el ${pct(state.cetes)} anual
      que ofrecen los CETES. `;
  }

  text += `El presupuesto anual de un auto cubre <strong>${transitYrs} años</strong> de transporte público.`;

  if (evBreakeven) {
    text += ` El auto eléctrico se vuelve más económico que el de gasolina a partir de
      <strong>${fmtKm(evBreakeven)} km/año</strong> — el punto de quiebre donde el ahorro en combustible
      supera la diferencia en capital y depreciación.`;
  }

  if (state.inflOn) {
    text += ` <span style="color:#F4A642">Con inflación al ${pct(state.inflRate)}, la depreciación real de los vehículos es menor en términos de poder adquisitivo — parte de la pérdida nominal queda absorbida por el alza general de precios.</span>`;
  }

  document.getElementById('insight-text').innerHTML = text;
}

function renderTable(data) {
  const tbody  = document.getElementById('breakdown-body');
  tbody.innerHTML = '';
  const sorted = [...data].sort((a, b) => a.total - b.total);

  const oppHdr = document.getElementById('opp-header');
  oppHdr.textContent = 'Oportunidad';
  oppHdr.style.color   = state.oppOn ? 'var(--blue)' : 'var(--muted)';
  oppHdr.style.opacity = state.oppOn ? '1' : '0.4';

  const deprHdr = document.getElementById('depr-header');
  if (deprHdr) {
    deprHdr.textContent = state.inflOn ? `Depreciación real (−${pct(state.inflRate)})` : 'Depreciación';
    deprHdr.style.color = state.inflOn ? '#F4A642' : 'var(--muted2)';
  }

  sorted.forEach(d => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${d.icon} ${d.name}</td>
      <td>${fmt(d.result.op)}</td>
      <td class="depr-col" style="${state.inflOn ? 'color:#F4A642' : ''}">${d.result.depr > 0 ? fmt(d.result.depr) : '—'}</td>
      <td class="opp-col" style="${!state.oppOn ? 'opacity:0.3' : ''}">${d.result.opp > 0 ? fmt(d.result.opp) : '—'}</td>
      <td class="total-col">${fmt(d.total)}</td>
      <td class="perkm-col">${fmt(d.perKm)}</td>
      <td>${fmt(d.perMonth)}</td>
      <td style="color:var(--muted)">${d.result.cap > 0 ? fmt(d.result.cap) : '—'}</td>
    `;
    tbody.appendChild(tr);
  });
}

function buildFieldHTML(mode, key, param) {
  const rawVal = state.params[mode.id][key];
  const tipHTML = param.tip ? `<span class="tt" data-tip="${param.tip.replace(/"/g, '&quot;')}">?</span>` : '';

  if (param.isPct) {
    return `
      <div class="field">
        <label>${param.label} ${tipHTML}</label>
        <input class="plain-input" type="number"
          data-mode="${mode.id}" data-param="${key}" data-ispct="1"
          value="${(rawVal * 100).toFixed(0)}"
          step="1" min="${param.min*100}" max="${param.max*100}">
        <span class="field-unit">${param.unit}</span>
      </div>`;
  }

  if (param.isCurrency) {
    return `
      <div class="field">
        <label>${param.label} ${tipHTML}</label>
        <div class="currency-wrap">
          <span class="currency-prefix">$</span>
          <input type="text"
            data-mode="${mode.id}" data-param="${key}" data-iscurrency="1"
            value="${formatCurrencyInput(rawVal)}"
            inputmode="numeric">
        </div>
        <span class="field-unit">${param.unit}</span>
      </div>`;
  }

  return `
    <div class="field">
      <label>${param.label} ${tipHTML}</label>
      <input class="plain-input" type="number"
        data-mode="${mode.id}" data-param="${key}"
        value="${rawVal}"
        step="${param.step}" min="${param.min}" max="${param.max}">
      <span class="field-unit">${param.unit}</span>
    </div>`;
}

function renderPanels() {
  const container = document.getElementById('mode-panels');
  container.innerHTML = '';
  const allData = computeAll();

  MODES.forEach(mode => {
    const d     = allData.find(x => x.id === mode.id);
    const panel = document.createElement('div');
    panel.className = 'mode-panel';

    const fieldsHTML = Object.entries(mode.params)
      .map(([k, p]) => buildFieldHTML(mode, k, p))
      .join('');

    const odoHTML = mode.id === 'car' ? `
      <div class="odometer-helper">
        <strong>📍 Calcula tus kilómetros reales</strong>
        <p>Divide el odómetro actual entre los años que llevas con el vehículo para obtener tu promedio anual real.</p>
        <div class="oh-fields">
          <input type="number" id="oh-odo" placeholder="Odómetro (km)" min="0" max="999999">
          <input type="number" id="oh-years" placeholder="Años de uso" min="1" max="30">
        </div>
        <div class="oh-result" id="oh-result">—</div>
      </div>` : '';

    panel.innerHTML = `
      <div class="panel-header" data-id="${mode.id}">
        <div class="panel-title">
          <span>${mode.icon}</span>
          <span>${mode.name}</span>
        </div>
        <div style="display:flex;align-items:center;gap:6px">
          <span class="panel-subtitle" id="psub-${mode.id}">${fmt(d.perKm)}/km</span>
          <span class="panel-chevron" id="chevron-${mode.id}">▼</span>
        </div>
      </div>
      <div class="panel-body" id="body-${mode.id}">
        ${fieldsHTML}
        ${odoHTML}
      </div>
    `;
    container.appendChild(panel);
  });

  // Panel toggle
  container.querySelectorAll('.panel-header').forEach(hdr => {
    hdr.addEventListener('click', () => {
      const id      = hdr.dataset.id;
      const body    = document.getElementById(`body-${id}`);
      const chevron = document.getElementById(`chevron-${id}`);
      const open    = body.classList.toggle('open');
      hdr.classList.toggle('open', open);
      chevron.classList.toggle('open', open);
    });
  });

  // Plain numeric inputs
  container.querySelectorAll('input.plain-input[data-mode]').forEach(inp => {
    inp.addEventListener('input', () => {
      const { mode, param } = inp.dataset;
      const isPct = !!inp.dataset.ispct;
      const val   = parseFloat(inp.value);
      if (!isNaN(val)) {
        state.params[mode][param] = isPct ? val / 100 : val;
        update();
      }
    });
  });

  // Currency text inputs
  container.querySelectorAll('input[data-iscurrency]').forEach(inp => {
    inp.addEventListener('input', () => {
      const raw = inp.value.replace(/,/g, '');
      const val = parseFloat(raw);
      if (!isNaN(val)) {
        state.params[inp.dataset.mode][inp.dataset.param] = val;
        update();
      }
    });
    inp.addEventListener('blur', () => {
      inp.value = formatCurrencyInput(state.params[inp.dataset.mode][inp.dataset.param]);
    });
    inp.addEventListener('focus', () => {
      inp.value = state.params[inp.dataset.mode][inp.dataset.param];
    });
  });

  // Odometer helper (in car panel)
  const odo = document.getElementById('oh-odo');
  const yrs = document.getElementById('oh-years');
  const res = document.getElementById('oh-result');
  if (odo && yrs && res) {
    [odo, yrs].forEach(el => {
      el.addEventListener('input', () => {
        const o = parseFloat(odo.value);
        const y = parseFloat(yrs.value);
        if (!isNaN(o) && !isNaN(y) && y > 0) {
          const kmAnual = Math.round(o / y);
          res.textContent = `→ ${fmtKm(kmAnual)} km/año — haz clic para aplicar`;
          res.style.cursor = 'pointer';
          res.onclick = () => {
            state.km = kmAnual;
            document.getElementById('km-slider').value = Math.min(Math.max(kmAnual, 2000), 75000);
            document.getElementById('km-display').textContent = fmtKm(kmAnual) + ' km';
            update();
          };
        } else {
          res.textContent = '—';
          res.style.cursor = 'default';
        }
      });
    });
  }
}

function update() {
  const data = computeAll();
  renderChart(data);
  renderInsight(data);
  renderTable(data);
  MODES.forEach(m => {
    const sub = document.getElementById(`psub-${m.id}`);
    if (sub) sub.textContent = fmt(computeAll().find(x => x.id === m.id).perKm) + '/km';
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// KM ESTIMATOR DIALOG
// ═══════════════════════════════════════════════════════════════════════════

let kmeActivityMultiplier = 1.50;
let kmeCurrentTab = 'car';
let kmeCurrentValue = null;

function toggleKmEstimator() {
  const backdrop = document.getElementById('kme-backdrop');
  const isOpen   = backdrop.classList.toggle('open');
  document.body.style.overflow = isOpen ? 'hidden' : '';
  if (isOpen) {
    setTimeout(() => {
      const firstInput = document.querySelector('.kme-panel.active input');
      if (firstInput) firstInput.focus();
    }, 50);
  }
}

function handleBackdropClick(e) {
  if (e.target === document.getElementById('kme-backdrop')) toggleKmEstimator();
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && document.getElementById('kme-backdrop').classList.contains('open')) {
    toggleKmEstimator();
  }
});

function switchKmeTab(tab) {
  kmeCurrentTab = tab;
  document.getElementById('tab-car').classList.toggle('active', tab === 'car');
  document.getElementById('tab-other').classList.toggle('active', tab === 'other');
  document.getElementById('kme-panel-car').classList.toggle('active', tab === 'car');
  document.getElementById('kme-panel-other').classList.toggle('active', tab === 'other');
  tab === 'car' ? calcKmeCar() : calcKmeOther();
}

function updateKmeResult(value) {
  kmeCurrentValue = value;
  const display  = document.getElementById('kme-result-display');
  const applyBtn = document.getElementById('kme-apply-btn');
  display.textContent = value !== null ? fmtKm(value) + ' km/año' : '— km/año';
  applyBtn.disabled   = value === null;
}

function calcKmeCar() {
  const odo   = parseFloat(document.getElementById('kme-odo').value);
  const years = parseFloat(document.getElementById('kme-years').value);
  ((!isNaN(odo) && !isNaN(years) && years > 0 && odo > 0))
    ? updateKmeResult(Math.round(odo / years))
    : updateKmeResult(null);
}

function setActivity(level) {
  const map = { low: 1.20, med: 1.50, high: 2.00 };
  kmeActivityMultiplier = map[level];
  ['low', 'med', 'high'].forEach(l =>
    document.getElementById(`act-${l}`).classList.toggle('active', l === level)
  );
  calcKmeOther();
}

function calcKmeOther() {
  const commute = parseFloat(document.getElementById('kme-commute').value);
  const days    = parseFloat(document.getElementById('kme-days').value);
  (!isNaN(commute) && !isNaN(days) && commute > 0 && days > 0)
    ? updateKmeResult(Math.round(commute * 2 * days * 50 * kmeActivityMultiplier))
    : updateKmeResult(null);
}

function applyKme() {
  if (kmeCurrentValue === null) return;
  const clamped = Math.min(Math.max(kmeCurrentValue, 2000), 75000);
  state.km = clamped;
  document.getElementById('km-slider').value        = clamped;
  document.getElementById('km-display').textContent = fmtKm(clamped) + ' km';
  update();
  toggleKmEstimator();
  const display = document.getElementById('km-display');
  display.style.transition = 'color 0.15s';
  display.style.color = '#fff';
  setTimeout(() => { display.style.color = ''; }, 700);
}

function resetKmeUI() {
  document.getElementById('kme-backdrop').classList.remove('open');
  document.body.style.overflow = '';
  ['kme-odo', 'kme-years', 'kme-commute', 'kme-days'].forEach(id => {
    document.getElementById(id).value = '';
  });
  kmeActivityMultiplier = 1.50;
  kmeCurrentValue = null;
  ['low', 'med', 'high'].forEach(l =>
    document.getElementById(`act-${l}`).classList.toggle('active', l === 'med')
  );
  updateKmeResult(null);
  switchKmeTab('car');
}

// ── Global listeners ───────────────────────────────────────────────────────
document.getElementById('km-slider').addEventListener('input', e => {
  state.km = parseInt(e.target.value);
  document.getElementById('km-display').textContent = fmtKm(state.km) + ' km';
  update();
});
document.getElementById('gas-price').addEventListener('input', e => {
  const v = parseFloat(e.target.value);
  if (!isNaN(v) && v > 0) { state.gasPrice = v; update(); }
});
document.getElementById('cetes-slider').addEventListener('input', e => {
  state.cetes = parseFloat(e.target.value);
  document.getElementById('cetes-display').textContent = pct(state.cetes);
  update();
});
document.getElementById('elec-price').addEventListener('input', e => {
  const v = parseFloat(e.target.value);
  if (!isNaN(v) && v > 0) { state.elecPrice = v; update(); }
});
document.getElementById('opp-toggle').addEventListener('change', e => {
  state.oppOn = e.target.checked;
  update();
});
document.getElementById('infl-toggle').addEventListener('change', e => {
  state.inflOn = e.target.checked;
  const wrap = document.getElementById('infl-rate-wrap');
  const hint = document.getElementById('infl-hint');
  wrap.classList.toggle('visible', state.inflOn);
  hint.style.display = state.inflOn ? 'none' : '';
  update();
});
document.getElementById('infl-rate').addEventListener('input', e => {
  const v = parseFloat(e.target.value);
  if (!isNaN(v) && v >= 0 && v <= 25) { state.inflRate = v / 100; update(); }
});

// ── Reset to defaults ──────────────────────────────────────────────────────
function resetToDefaults() {
  state.km        = DEFAULT_KM;
  state.gasPrice  = DEFAULT_GAS_PRICE;
  state.elecPrice = DEFAULT_ELEC_PRICE;
  state.cetes     = DEFAULT_CETES;
  state.oppOn     = true;
  state.inflOn    = false;
  state.inflRate  = DEFAULT_INFL_RATE;

  MODES.forEach(m => {
    Object.entries(m.params).forEach(([k, v]) => { state.params[m.id][k] = v.value; });
  });

  document.getElementById('km-slider').value            = DEFAULT_KM;
  document.getElementById('km-display').textContent     = fmtKm(DEFAULT_KM) + ' km';
  document.getElementById('gas-price').value            = DEFAULT_GAS_PRICE;
  document.getElementById('cetes-slider').value         = DEFAULT_CETES;
  document.getElementById('cetes-display').textContent  = pct(DEFAULT_CETES);
  document.getElementById('elec-price').value           = DEFAULT_ELEC_PRICE;
  document.getElementById('opp-toggle').checked         = true;
  document.getElementById('infl-toggle').checked        = false;
  document.getElementById('infl-rate').value            = (DEFAULT_INFL_RATE * 100).toFixed(1);
  document.getElementById('infl-rate-wrap').classList.remove('visible');
  document.getElementById('infl-hint').style.display    = '';

  renderPanels();
  resetKmeUI();
  update();

  const btn = document.getElementById('btn-reset');
  btn.classList.add('flash');
  btn.innerHTML = `
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="width:14px;height:14px;flex-shrink:0">
      <polyline points="2,8 6,12 14,4"/>
    </svg>
    Restablecido`;
  setTimeout(() => {
    btn.classList.remove('flash');
    btn.innerHTML = `
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="width:14px;height:14px;flex-shrink:0;transition:transform 0.35s">
        <path d="M1.5 8a6.5 6.5 0 1 0 1.2-3.8"/>
        <polyline points="1.5,2 1.5,6 5.5,6"/>
      </svg>
      Restablecer valores`;
  }, 1800);
}

// ═══════════════════════════════════════════════════════════════════════════
// TOOLTIP SYSTEM
// ═══════════════════════════════════════════════════════════════════════════

(function initTooltips() {
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

    // Flip above if not enough room below
    if (top + 120 > window.innerHeight) {
      top = rect.top - 8;
      popup.style.transform = 'translateY(-100%)';
    } else {
      popup.style.transform = '';
    }

    // Keep within viewport horizontally
    if (left + popupW > window.innerWidth - margin) {
      left = window.innerWidth - popupW - margin;
    }
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
    const el = e.target.closest('.tt');
    if (!el) return;
    activeEl = null;
    popup.classList.remove('visible');
  });

  window.addEventListener('scroll', () => {
    if (activeEl) position(activeEl);
  }, { passive: true });
})();

// ── Init ───────────────────────────────────────────────────────────────────
renderPanels();
update();
