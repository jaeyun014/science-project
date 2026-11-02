// Ideal aqueous model at 25 °C. Units: mol, L, g, s, C, S/cm.
export const F = 96485.33212;
export const KW = 1e-14;
export const KSP_LIME = 5.02e-6;
export const KSP_AGCL = 1.77e-10;
export const WATER_DENSITY = 997; // g/L at 25 °C; solute volume is neglected.
export const DOSE = 0.001;
export const WATER_DOSE = 0.1 * WATER_DENSITY / 18.015;
const species = (name, formula, state, mass, color = '#dce8e8', charge = 0, lambda = 0) => ({ name, formula, state, mass, color, charge, lambda });
export const chemicals = {
  water: species('순수한 물', 'H₂O(l)', 'liquid', 18.015, '#a9dce7'),
  'distilled-water': species('증류수', 'H₂O(l)', 'liquid', 18.015, '#c7e9ef'),
  hcl: species('염산', 'HCl(aq)', 'aqueous', 36.458),
  naoh: species('수산화나트륨', 'NaOH(aq)', 'aqueous', 39.997),
  nacl: species('염화나트륨 수용액', 'NaCl(aq)', 'aqueous', 58.44),
  agno3: species('질산은', 'AgNO₃(aq)', 'aqueous', 169.873),
  sulfate: species('황산나트륨 수용액', 'Na₂SO₄(aq)', 'aqueous', 142.04),
  caco3: species('탄산칼슘', 'CaCO₃(s)', 'solid', 100.086),
  cao: species('산화칼슘', 'CaO(s)', 'solid', 56.077),
  caoh2: species('수산화칼슘 고체', 'Ca(OH)₂(s)', 'solid', 74.092),
  'solid-salt': species('고체 염화나트륨', 'NaCl(s)', 'solid', 58.44),
  sugar: species('고체 설탕', 'C₁₂H₂₂O₁₁(s)', 'solid', 342.297),
  'sugar-aq': species('용해한 설탕', 'C₁₂H₂₂O₁₁(aq)', 'aqueous', 342.297),
  zinc: species('아연', 'Zn(s)', 'solid', 65.38, '#aeb8b8'),
  agcl: species('염화은 침전', 'AgCl(s)', 'solid', 143.318),
  h: species('수소 이온', 'H⁺(aq)', 'aqueous', 1.008, undefined, 1, 349.6),
  oh: species('수산화 이온', 'OH⁻(aq)', 'aqueous', 17.007, undefined, -1, 199.1),
  na: species('나트륨 이온', 'Na⁺(aq)', 'aqueous', 22.99, undefined, 1, 50.1),
  cl: species('염화 이온', 'Cl⁻(aq)', 'aqueous', 35.45, undefined, -1, 76.3),
  ag: species('은 이온', 'Ag⁺(aq)', 'aqueous', 107.868, undefined, 1, 61.9),
  nitrate: species('질산 이온', 'NO₃⁻(aq)', 'aqueous', 62.005, undefined, -1, 71.4),
  ca: species('칼슘 이온', 'Ca²⁺(aq)', 'aqueous', 40.078, undefined, 2, 119),
  zn: species('아연 이온', 'Zn²⁺(aq)', 'aqueous', 65.38, undefined, 2, 105.6),
  so4: species('황산 이온', 'SO₄²⁻(aq)', 'aqueous', 96.06, undefined, -2, 160),
  hydrogen: species('방출 수소', 'H₂(g)', 'gas', 2.016),
  oxygen: species('방출 산소', 'O₂(g)', 'gas', 31.998),
  co2: species('방출 이산화탄소', 'CO₂(g)', 'gas', 44.009),
};
export const inventory = ['water', 'distilled-water', 'hcl', 'naoh', 'caco3', 'cao', 'agno3', 'nacl', 'solid-salt', 'sugar', 'zinc', 'sulfate'];
const solutions = { hcl: { h: 1, cl: 1 }, naoh: { na: 1, oh: 1 }, nacl: { na: 1, cl: 1 }, agno3: { ag: 1, nitrate: 1 }, sulfate: { na: 2, so4: 1 } };
export const amount = (t, id) => t?.contents[id] || 0;
export function change(t, id, delta) {
  const value = amount(t, id) + delta;
  if (value < -1e-12 || !Number.isFinite(value)) throw new Error(`Invalid amount: ${id}`);
  if (value <= 0) delete t.contents[id]; else t.contents[id] = value;
}
export function createSample() {
  return { contents: {}, gases: {}, used: {}, doses: {}, occurred: {}, temperature: 25, voltage: 0, heating: false, cooling: false, charge: 0, elapsed: 0 };
}
export function volume(t) { return amount(t, 'water') * 18.015 / WATER_DENSITY; }
export function mass(t) { return Object.entries(t?.contents || {}).reduce((sum, [id, n]) => sum + n * chemicals[id].mass, 0); }
export function gasMass(t) { return Object.entries(t?.gases || {}).reduce((sum, [id, n]) => sum + n * chemicals[id].mass, 0); }
function emitGas(t, id, n) { t.gases[id] = (t.gases[id] || 0) + n; }
export function doseLabel(id) { return id === 'water' || id === 'distilled-water' ? '100 mL' : solutions[id] ? '0.010 M · 100 mL' : '0.001 mol'; }
export function additionIssue(t, id) {
  if (!inventory.includes(id)) return '등록되지 않은 물질입니다.';
  if (Object.values(t.doses).reduce((a,b)=>a+b,0) >= 200) return '한 도구의 최대 투입 횟수는 200회입니다. 새 도구를 사용하세요.';
  if ((solutions[id] || ['water', 'distilled-water'].includes(id)) && t.temperature !== 25) return '고온 시료와 물의 혼합은 지원하지 않습니다. 먼저 25°C까지 냉각하세요.';
  if (t.heating) return '물질을 넣기 전에 가열을 중지하세요.';
  const has = (...ids) => ids.some(x => x === id || t.used[x]);
  const pair = (left, right) => has(...left) && has(...right);
  if (pair(['agno3'], ['zinc', 'naoh', 'cao', 'caco3', 'sulfate', 'sugar'])) return '이 은 이온 혼합물의 산화·환원/침전/착물 반응은 아직 지원하지 않아 투입하지 않았습니다.';
  if (pair(['zinc'], ['naoh', 'cao', 'caco3', 'sulfate'])) return '아연의 염기성·복합 혼합물 반응은 아직 지원하지 않아 투입하지 않았습니다.';
  if (pair(['sulfate'], ['cao', 'caco3', 'hcl'])) return '황산 이온의 산성 평형·칼슘 침전은 아직 지원하지 않아 투입하지 않았습니다.';
  if (['cao','caco3','zinc'].filter(x => has(x)).length > 1) return '여러 고체가 동시에 산과 경쟁하는 반응은 지원하지 않습니다. 별도 도구를 사용하세요.';
  if (pair(['sugar'], ['hcl'])) return '설탕의 산 촉매 가수분해는 아직 지원하지 않아 투입하지 않았습니다.';
  return null;
}
export function addDose(t, id) {
  const issue = additionIssue(t, id);
  if (issue) return { issue, events: [] };
  t.used[id] = true; t.doses[id] = (t.doses[id] || 0) + 1;
  if (id === 'water' || id === 'distilled-water') change(t, 'water', WATER_DOSE);
  else if (solutions[id]) {
    change(t, 'water', WATER_DOSE);
    for (const [ion, coefficient] of Object.entries(solutions[id])) change(t, ion, DOSE * coefficient);
  } else change(t, id, DOSE);
  return { issue: null, events: react(t) };
}
const reaction = (id, name, equation, note = '') => ({ id, name, equation, note });
export function react(t) {
  const events = new Map();
  const record = (id, name, equation, note) => {
    t.occurred[id] = true;
    if (!events.has(id)) events.set(id, reaction(id, name, equation, note));
  };
  if (volume(t) <= 0) {
    if (t.temperature >= 825 && amount(t, 'caco3') > 0) {
      const n = amount(t, 'caco3'); change(t, 'caco3', -n); change(t, 'cao', n); emitGas(t, 'co2', n);
      record('decomposition', '탄산칼슘 열분해', 'CaCO₃(s) → CaO(s) + CO₂(g)', '825°C는 시연용 전환 기준입니다. 실제 분해는 CO₂ 분압과 시간에 의존합니다.');
    }
    return [...events.values()];
  }
  // Each pass consumes finite reactants; repeat to settle dissolution/neutralization chains.
  for (let pass = 0; pass < 100; pass++) {
    let moved = 0;
    const consume = (a, ca, b, cb, products, event) => {
      const n = Math.min(amount(t, a) / ca, amount(t, b) / cb);
      if (n <= 1e-15) return;
      change(t, a, -n * ca); change(t, b, -n * cb);
      for (const [id, c] of Object.entries(products)) {
        if (chemicals[id].state === 'gas') emitGas(t, id, n * c); else change(t, id, n * c);
      }
      moved += n;
      record(...event);
    };
    consume('h', 1, 'oh', 1, { water: 1 }, ['neutralization', '산·염기 중화', 'H⁺(aq) + OH⁻(aq) → H₂O(l)', '발열 반응이며 수용액은 25°C 항온 조건으로 유지합니다.']);
    consume('cao', 1, 'h', 2, { ca: 1, water: 1 }, ['oxide-acid', '산화칼슘과 산', 'CaO(s) + 2H⁺(aq) → Ca²⁺(aq) + H₂O(l)', '발열 반응입니다.']);
    consume('caoh2', 1, 'h', 2, { ca: 1, water: 2 }, ['lime-acid', '수산화칼슘과 산', 'Ca(OH)₂(s) + 2H⁺(aq) → Ca²⁺(aq) + 2H₂O(l)']);
    consume('caco3', 1, 'h', 2, { ca: 1, water: 1, co2: 1 }, ['carbonate-acid', '탄산칼슘과 산', 'CaCO₃(s) + 2H⁺(aq) → Ca²⁺(aq) + H₂O(l) + CO₂(g)', 'CO₂는 대기로 방출되는 완결 반응 근사입니다.']);
    consume('zinc', 1, 'h', 2, { zn: 1, hydrogen: 1 }, ['zinc-acid', '아연과 산', 'Zn(s) + 2H⁺(aq) → Zn²⁺(aq) + H₂(g)']);
    consume('cao', 1, 'water', 1, { caoh2: 1 }, ['lime-water', '산화칼슘 수화', 'CaO(s) + H₂O(l) → Ca(OH)₂(s)', '발열 반응입니다. 고체 중 일부만 용해됩니다.']);
    const v = volume(t);
    // NaCl solubility: 0.36 g per g solvent, 25 °C. Common-ion effects on highly concentrated mixtures are out of scope.
    const capacity = amount(t, 'water') * 18.015 * 0.36 / 58.44;
    const salt = Math.min(amount(t, 'solid-salt'), Math.max(0, capacity - Math.max(amount(t,'na'), amount(t,'cl'))));
    if (salt > 1e-15) { change(t,'solid-salt',-salt); change(t,'na',salt); change(t,'cl',salt); moved += salt; }
    const sugar = Math.min(amount(t,'sugar'), Math.max(0, amount(t,'water')*18.015*2 / 342.297 - amount(t,'sugar-aq')));
    if (sugar > 1e-15) { change(t,'sugar',-sugar); change(t,'sugar-aq',sugar); moved += sugar; }
    // Signed dissolution extent x (negative = precipitation), solve Ksp with mass balances.
    const equilibrium = (solid, a, b, cb, ksp) => {
      let lo = -Math.min(amount(t,a), amount(t,b)/cb), hi = amount(t,solid);
      const q = x => ((amount(t,a)+x)/v) * ((amount(t,b)+cb*x)/v)**cb;
      if (q(hi) < ksp) lo = hi;
      else for (let i=0;i<70;i++) { const mid=(lo+hi)/2; if(q(mid)<ksp) lo=mid; else hi=mid; }
      const x = (lo+hi)/2;
      if (Math.abs(x) > 1e-15) { change(t,solid,-x); change(t,a,x); change(t,b,cb*x); moved+=Math.abs(x); }
      return x;
    };
    equilibrium('caoh2','ca','oh',2,KSP_LIME);
    const agcl = equilibrium('agcl','ag','cl',1,KSP_AGCL);
    if (agcl < -1e-12) record('precipitation','염화은 침전','Ag⁺(aq) + Cl⁻(aq) ⇌ AgCl(s)', '25°C 용해도곱으로 잔류 이온과 침전량을 계산합니다.');
    if (moved < 1e-13) break;
  }
  return [...events.values()];
}
export function ionicStrength(t) {
  const v = volume(t); if (!v) return 0;
  return Object.entries(t.contents).reduce((s,[id,n])=>s+n*chemicals[id].charge**2/v/2,0);
}
export function phIssue(t) {
  if (!t || !volume(t)) return '수용액이 없습니다.';
  if (amount(t,'zn') > 0 || amount(t,'ag') > 1e-8 || amount(t,'caco3') > 0 || amount(t,'so4') > 0) return '금속 이온·황산 이온의 가수분해 및 탄산 평형은 계산 범위 밖입니다.';
  if (ionicStrength(t) > 0.1) return '고농도 용액의 활동도 보정은 지원하지 않습니다.';
  return null;
}
export function calculatePH(t) {
  if (phIssue(t)) return null;
  const c = (amount(t,'h')-amount(t,'oh'))/volume(t);
  // Stable quadratic solution including water autoionization, also near equivalence.
  const h = c >= 0 ? (c + Math.hypot(c,2*Math.sqrt(KW)))/2 : 2*KW/(Math.hypot(c,2*Math.sqrt(KW))-c);
  return -Math.log10(h);
}
export function currentIssue(t) {
  if (!t || !volume(t)) return '수용액이 없습니다.';
  if (ionicStrength(t) > 0.05 || amount(t,'sugar-aq')/volume(t) > 0.1 || amount(t,'caco3') > 0) return '고농도·탄산 평형 조건의 전도도는 계산 범위 밖입니다.';
  return null;
}
export function conductivity(t) {
  if (currentIssue(t)) return null;
  const v=volume(t), c=(amount(t,'h')-amount(t,'oh'))/v;
  const h=c>=0?(c+Math.hypot(c,2e-7))/2:2e-14/(Math.hypot(c,2e-7)-c);
  let k=(349.6*h+199.1*KW/h)/1000;
  for(const [id,n] of Object.entries(t.contents)) if(!['h','oh'].includes(id)) k+=chemicals[id].lambda*n/v/1000;
  return k;
}
export function electricCurrent(t) { const k=conductivity(t); return k===null?null:(t.voltage||0)*k/0.5*1000; } // Kcell=0.5 cm^-1, mA
export function electrolysisIssue(t) {
  if (currentIssue(t)) return currentIssue(t);
  if (t.temperature !== 25) return '전기분해는 25°C 수용액에서만 지원합니다.';
  if (amount(t,'cl') > 1e-12 || amount(t,'ag') > 1e-12 || amount(t,'zn') > 0 || amount(t,'nitrate') > 0 || Object.entries(t.contents).some(([id,n])=>n>0&&chemicals[id].state==='solid') || amount(t,'sugar-aq') > 0) return '이 혼합물은 경쟁 전극 반응이 가능해 기체 생성 계산을 중지합니다. 전류는 전도도 기반 추정입니다.';
  return null;
}
export function electrolyze(t, seconds) {
  if (!Number.isFinite(seconds) || seconds<=0 || t.voltage<2 || electrolysisIssue(t)) return [];
  const current=electricCurrent(t)/1000;
  const hydrogen=Math.min(amount(t,'water'), current*seconds/(2*F));
  if (hydrogen<=0) return [];
  change(t,'water',-hydrogen); emitGas(t,'hydrogen',hydrogen); emitGas(t,'oxygen',hydrogen/2);
  t.charge+=hydrogen*2*F; t.elapsed+=hydrogen*2*F/current;
  if (!t.occurred.electrolysis) { t.occurred.electrolysis=true; return [reaction('electrolysis','물의 전기분해','2H₂O(l) → 2H₂(g) + O₂(g)','불활성 전극·전류 효율 100% 가정. Q=∫I dt, H₂=Q/(2F), O₂=Q/(4F).')]; }
  return [];
}
export function heatingIssue(t) {
  if (volume(t)>0) return '수용액은 25°C 항온 실험입니다. 끓음·증발을 계산하지 않으므로 가열하지 않습니다.';
  if (!Object.keys(t.contents).length || Object.keys(t.contents).some(id=>!['caco3','cao'].includes(id))) return '건조 탄산칼슘·산화칼슘의 가상 가열로만 지원합니다.';
  return null;
}
