import * as model from './model.js';
const { chemicals, inventory, amount, change, calculatePH, electricCurrent } = model;

const toolTypes = {
  beaker: { name: '비커', symbol: '▱' },
  'test-tube': { name: '시험관', symbol: '▯' },
  flask: { name: '삼각 플라스크', symbol: '△' }
};

const reactions = [
  { equation: '2H₂O(l) → 2H₂(g) + O₂(g)' },
  { equation: 'H⁺(aq) + OH⁻(aq) → H₂O(l)' },
  { equation: 'CaCO₃(s) → CaO(s) + CO₂(g)' },
  { equation: 'Ag⁺(aq) + Cl⁻(aq) ⇌ AgCl(s)' },
  { equation: 'Zn(s) + 2H⁺(aq) → Zn²⁺(aq) + H₂(g)' },
  { equation: 'CaO(s) + H₂O(l) → Ca(OH)₂(s) ⇌ Ca²⁺(aq) + 2OH⁻(aq)' }
];

const reactionExplanations = {
  electrolysis: { observation: '양쪽 전극에서 기포가 발생하고 수소와 산소가 2:1의 몰비로 생성됩니다.', reason: '불활성 전극에서 음극은 환원으로 수소, 양극은 산화로 산소를 만듭니다. 누적 전하량에 비례하며 전류 효율 100%를 가정합니다. 염화물 등 경쟁 전극 반응이 있는 혼합물은 생성량 계산을 지원하지 않습니다.' },
  neutralization: { observation: '같은 양의 강산·강염기가 중화되면 25°C에서 pH가 약 7이 됩니다. 발열하며 항온 조건으로 온도를 유지합니다.', reason: '산의 H⁺와 염기의 OH⁻가 결합해 물이 되며, 이 과정에서 열에너지가 방출됩니다.' },
  decomposition: { observation: '고체가 남은 상태에서 이산화탄소 기체가 발생합니다.', reason: '탄산칼슘이 열을 흡수해 분해됩니다. 825°C는 이 모델의 설정값이며 실제 분해 조건은 CO₂ 분압과 가열 시간 등에 따라 달라집니다.' },
  precipitation: { observation: '투명한 용액이 뿌옇게 변하고 흰색 고체가 바닥에 쌓입니다.', reason: 'Ag⁺와 Cl⁻가 결합해 물에 거의 녹지 않는 염화은 고체를 만들기 때문입니다.' },
  'zinc-acid': { observation: '아연 표면에서 기포가 발생하며 아연의 양이 줄어듭니다.', reason: '아연이 전자를 잃어 Zn²⁺가 되고, 수소 이온은 전자를 받아 수소 기체가 됩니다.' },
  'lime-water': { observation: '수산화칼슘 고체와 용존 Ca²⁺·OH⁻가 생성되어 염기성을 띱니다.', reason: '산화칼슘이 물과 반응해 수산화칼슘을 만들며 OH⁻가 증가하고 열이 방출됩니다.' }
};

const challenges = [
  { id: 'electrolysis', title: '두 종류의 기체', category: '전기분해', goal: '황산나트륨 수용액에 6.0 V를 공급하고 기다려 수소와 산소를 만드시오.', unlockAction: '물이 든 도구에 6.0 V를 공급해 수소와 산소를 생성했습니다.', equation: reactions[0].equation, ...reactionExplanations.electrolysis },
  { id: 'neutralization', title: '중성으로 돌아온 용액', category: '산·염기', goal: '같은 몰수의 염산과 수산화나트륨을 반응시키시오.', unlockAction: '같은 몰수의 염산과 수산화나트륨을 혼합해 중화 반응을 일으켰습니다.', equation: reactions[1].equation, ...reactionExplanations.neutralization },
  { id: 'decomposition', title: '열로 쪼갠 화합물', category: '열분해', goal: '가상 가열로에서 건조 탄산칼슘을 모델 기준 825°C 이상으로 가열하시오.', unlockAction: '탄산칼슘을 825°C 이상으로 가열해 산화칼슘과 이산화탄소로 분해했습니다.', equation: reactions[2].equation, ...reactionExplanations.decomposition },
  { id: 'precipitation', title: '용액 속 흰색 고체', category: '침전', goal: '질산은과 염화나트륨 수용액으로 침전을 만드시오.', unlockAction: '질산은과 염화나트륨 수용액을 혼합해 흰색 염화은 침전을 만들었습니다.', equation: reactions[3].equation, ...reactionExplanations.precipitation },
  { id: 'zinc-acid', title: '금속에서 생긴 기포', category: '산화·환원', goal: '아연과 염산을 1:2 몰비로 반응시키시오.', unlockAction: '아연과 염산을 반응시켜 아연 표면에서 수소 기체를 발생시켰습니다.', equation: reactions[4].equation, ...reactionExplanations['zinc-acid'] },
  { id: 'lime-water', title: 'NaOH 없는 염기', category: '산·염기', goal: '수산화나트륨 없이 pH 10 이상의 용액을 만드시오.', unlockAction: '산화칼슘과 물을 반응시켜 NaOH 없이 염기성 수산화칼슘 용액을 만들었습니다.', equation: reactions[5].equation, ...reactionExplanations['lime-water'] },
  { id: 'insulating-solution', title: '전류가 멈춘 용액', category: '전기적 성질', goal: '증류수와 설탕으로 6.0 V에서 전류가 0.1 mA 미만인 용액을 만드시오.', unlockAction: '증류수와 설탕을 넣고 6.0 V를 공급해 전류를 0.1 mA 미만으로 만들었습니다.', equation: 'I < 0.1 mA (V = 6.0 V)', observation: '설정한 셀 상수에서 추정 전류가 매우 작습니다.', reason: '설탕은 물에 녹아도 이온으로 나뉘지 않고 중성 분자로 존재하므로 이동 가능한 전하 운반자가 거의 없습니다.' },
  { id: 'salt-conductor', title: '소금이 만든 전류의 길', category: '전기적 성질', goal: '고체 염화나트륨을 사용해 10 mA 이상의 전류가 흐르는 용액을 만드시오.', unlockAction: '물에 고체 염화나트륨을 넣고 6.0 V를 공급해 10 mA 이상의 전류를 만들었습니다.', equation: 'NaCl(s) → Na⁺(aq) + Cl⁻(aq)', observation: '고체 소금을 물에 넣자 예상 전류가 크게 증가합니다.', reason: '염화나트륨이 물속에서 Na⁺와 Cl⁻로 해리되고, 이 이온들이 이동하며 전하를 운반합니다.' }
];

const guides = [
  { title: '01 — 물의 전기분해', theory: '황산나트륨 수용액을 넣고 6.0 V를 공급하세요. 불활성 전극·효율 100%에서 실제 경과 시간과 전류로 생성량을 계산합니다.', steps: [['황산나트륨 수용액 넣기', 'add:sulfate'], ['6.0 V 전기 공급하기', 'power'], ['잠시 기다려 발생한 기체 확인하기', 'reaction:electrolysis']] },
  { title: '02 — 산·염기 중화', theory: '같은 몰수의 염산과 수산화나트륨을 반응시킵니다.', steps: [['염산 넣기', 'add:hcl'], ['수산화나트륨 넣기', 'add:naoh'], ['중화 반응 확인하기', 'reaction:neutralization']] },
  { title: '03 — 탄산칼슘 열분해', theory: '건조 시료를 가상 가열로에서 가열합니다. 825°C는 시연용 기준이며 실제 온도·시간·CO₂ 분압에 따른 분해율은 예측하지 않습니다.', steps: [['탄산칼슘 넣기', 'add:caco3'], ['825°C 이상까지 가열하기', 'reaction:decomposition']] },
  { title: '04 — 염화은 침전', theory: '은 이온과 염화 이온을 반응시켜 흰색 침전을 만듭니다.', steps: [['질산은 넣기', 'add:agno3'], ['염화 이온을 포함한 물질 넣기 (NaCl·HCl)', 'add:nacl'], ['침전 확인하기', 'reaction:precipitation']] },
  { title: '05 — 아연과 염산', theory: 'Zn:HCl의 몰비를 1:2로 맞춰 수소를 발생시킵니다.', steps: [['아연 넣기', 'add:zinc'], ['염산 한 번 넣기', 'add:hcl'], ['염산 한 번 더 넣기', 'add:hcl'], ['수소 발생 확인하기', 'reaction:zinc-acid']] },
  {
    title: 'Q1 — 절연성 용액 만들기', quiz: true,
    theory: '이온이 적어 추정 전류가 작은 용액을 만드세요.',
    goal: '증류수와 설탕을 모두 사용하고 6.0 V를 공급했을 때 전류를 0.1 mA 미만으로 만드시오.',
    check: (tool) => !!tool && tool.used['distilled-water'] && tool.used.sugar && tool.voltage > 0 && model.volume(tool) > 0 && electricCurrent(tool) !== null && electricCurrent(tool) < 0.1
  },
  {
    title: 'Q2 — 소금으로 전도성 만들기', quiz: true,
    theory: '이온이 자유롭게 이동할 수 있을 때 수용액에 전류가 흐릅니다.',
    goal: '고체 염화나트륨을 반드시 사용해 6.0 V에서 10 mA 이상의 전류가 흐르게 하시오.',
    check: (tool) => !!tool && tool.used['solid-salt'] && tool.voltage > 0 && model.volume(tool) > 0 && electricCurrent(tool) !== null && electricCurrent(tool) >= 10
  },
  {
    title: 'Q3 — NaOH 없이 염기성 만들기', quiz: true,
    theory: '한 가지 염기만이 용액을 염기성으로 만드는 것은 아닙니다.',
    goal: '수산화나트륨을 사용하지 않고 pH 10 이상의 용액을 만드시오.',
    check: (tool) => !!tool && !tool.used.naoh && !!tool.occurred['lime-water'] && calculatePH(tool) >= 10
  }
];

const state = { tools: [], selectedToolId: null, guideIndex: 0, step: 0, events: [], nextToolId: 1, unlocked: [], unlockActions: {} };
const history = [];
let electricalTimer = null;
let electricalLastTime = 0;
let activeDragToolId = null;
let thermalTimer = null;
let thermalToolId = null;
let selectedChallengeId = challenges[0].id;
let compendiumRenderKey = null;
let achievementToastTimer = null;
const $ = (selector) => document.querySelector(selector);

function makeTool(type) {
  return {
    id: `tool-${state.nextToolId++}`,
    type,
    label: `${toolTypes[type].name} ${state.nextToolId - 1}`,
    ...model.createSample(),
    x: 24 + (state.tools.length % 3) * 195, y: 68
  };
}

function selectedTool() { return state.tools.find((tool) => tool.id === state.selectedToolId) || null; }
function rememberState() {
  settleElectrical();
  history.push({
    tools: structuredClone(state.tools),
    selectedToolId: state.selectedToolId,
    step: state.step,
    events: state.events.map((event) => ({ ...event })),
    nextToolId: state.nextToolId
  });
  if (history.length > 30) history.shift();
}

function addEvent(title, detail, reaction = false) {
  state.events.unshift({ number: (state.events[0]?.number || 0) + 1, title, detail, reaction });
  if (state.events.length > 200) state.events.length = 200;
}

function showAchievementToast(challenge, action) {
  $('#achievementTitle').textContent = challenge.title;
  $('#achievementAction').textContent = action;
  $('#achievementToast').classList.add('show');
  if (achievementToastTimer) clearTimeout(achievementToastTimer);
  achievementToastTimer = setTimeout(() => $('#achievementToast').classList.remove('show'), 6500);
}

function unlockChallenge(id, action) {
  if (state.unlocked.includes(id)) return;
  const challenge = challenges.find((item) => item.id === id);
  if (!challenge) return;
  const completedAction = action || challenge.unlockAction;
  state.unlocked.push(id);
  state.unlockActions[id] = completedAction;
  addEvent('도전과제 해금', `「${challenge.title}」 · 해금 행동: ${completedAction}`, true);
  showAchievementToast(challenge, completedAction);
}

function recordReactions(tool, events) {
  const tags = [];
  events.forEach((reaction) => {
    addEvent(reaction.name, `${tool.label} · ${reaction.equation} · ${reaction.note || ''}`, true);
    tags.push(`reaction:${reaction.id}`);
    if (reaction.id === 'precipitation' || reaction.id === 'decomposition') unlockChallenge(reaction.id);
  });
  checkChallenges(tool);
  return tags;
}

function checkChallenges(tool) {
  const ph = calculatePH(tool);
  if (tool.occurred.neutralization && tool.used.hcl && tool.used.naoh && ph !== null && Math.abs(ph - 7) < 0.05) unlockChallenge('neutralization');
  if (tool.occurred['lime-water'] && !tool.used.naoh && ph !== null && ph >= 10) unlockChallenge('lime-water');
  if (tool.occurred['zinc-acid'] && tool.doses.hcl === 2 * tool.doses.zinc && amount(tool,'zinc') < 1e-12 && amount(tool,'h') < 1e-12) unlockChallenge('zinc-acid');
  if (tool.occurred.electrolysis && (tool.gases.hydrogen || 0) >= 1e-8) unlockChallenge('electrolysis');
  describeElectricalPhenomenon(tool);
}

function runReactions(tool) { return recordReactions(tool, model.react(tool)); }

function guideChecks(tool) {
  if (!tool) return [];
  switch (state.guideIndex) {
    case 0: return [tool.used.sulfate, tool.voltage > 0, (tool.gases.hydrogen || 0) >= 1e-8 && tool.occurred.electrolysis];
    case 1: return [tool.used.hcl, tool.used.naoh, tool.occurred.neutralization && Math.abs((calculatePH(tool) ?? -100) - 7) < 0.05];
    case 2: return [tool.used.caco3, tool.occurred.decomposition];
    case 3: return [tool.used.agno3, tool.used.nacl || tool.used['solid-salt'] || tool.used.hcl, tool.occurred.precipitation];
    case 4: return [tool.used.zinc, tool.doses.hcl >= 1, tool.doses.hcl >= 2, tool.occurred['zinc-acid'] && amount(tool,'zinc') < 1e-12 && tool.doses.hcl === 2 * tool.doses.zinc];
    default: return [];
  }
}
function advanceGuide() {
  if (state.guideIndex < 0) return;
  const guide = guides[state.guideIndex];
  if (guide.quiz) { state.step = guide.check(selectedTool()) ? 1 : 0; return; }
  const checks = guideChecks(selectedTool());
  const firstIncomplete = checks.findIndex(done => !done);
  state.step = firstIncomplete < 0 ? checks.length : firstIncomplete;
}

function perform(tool, tag, title, detail) {
  addEvent(title, tool ? `${tool.label} · ${detail}` : detail);
  if (tool) runReactions(tool);
  advanceGuide();
  render();
}

function requireSelectedTool() {
  const tool = selectedTool();
  if (tool) return tool;
  addEvent('도구 선택 필요', '먼저 자유 실험 도구를 꺼내고 클릭해 선택하세요.');
  render();
  return null;
}

function addChemical(id, targetToolId = state.selectedToolId) {
  const tool = state.tools.find((item) => item.id === targetToolId);
  if (!tool) return requireSelectedTool();
  const issue = model.additionIssue(tool, id);
  if (issue) { addEvent('투입 제한', issue); render(); return; }
  rememberState();
  state.selectedToolId = tool.id;
  const result = model.addDose(tool, id);
  addEvent(`${chemicals[id].name} 투입`, `${tool.label} · ${model.doseLabel(id)}`);
  recordReactions(tool, result.events);
  advanceGuide();
  render();
}

function createLabTool(type) {
  if (state.guideIndex >= 0) return;
  if (state.tools.length >= 6) { addEvent('도구 배치 제한', '최대 6개의 도구를 동시에 사용할 수 있습니다.'); render(); return; }
  rememberState();
  const tool = makeTool(type);
  state.tools.push(tool);
  state.selectedToolId = tool.id;
  addEvent('실험 도구 배치', `${tool.label}을 실험대에 꺼냈습니다.`);
  render();
}

function describeElectricalPhenomenon(tool) {
  const current = electricCurrent(tool);
  if (tool.voltage <= 0 || current === null || !model.volume(tool)) return;
  if (tool.used['distilled-water'] && amount(tool,'sugar-aq') > 0 && current < 0.1) unlockChallenge('insulating-solution', `${tool.label} · 6.0 V에서 추정 전류 ${current.toFixed(3)} mA`);
  if (tool.used['solid-salt'] && amount(tool,'cl') > 0 && current >= 10) unlockChallenge('salt-conductor', `${tool.label} · 용해한 이온의 추정 전류 ${current.toFixed(3)} mA`);
}

function clearElectricalTimer() {
  if (electricalTimer) clearInterval(electricalTimer);
  electricalTimer = null;
}
function stepElectrical(seconds) {
  state.tools.filter(tool => tool.voltage > 0).forEach(tool => {
    recordReactions(tool, model.electrolyze(tool, seconds));
    recordReactions(tool, model.react(tool));
  });
  advanceGuide();
  render();
}
function settleElectrical() {
  if (!electricalTimer) return;
  const now = Date.now();
  if (now > electricalLastTime) stepElectrical((now - electricalLastTime) / 1000);
  electricalLastTime = now;
}
function syncElectricalTimer() {
  clearElectricalTimer();
  if (!state.tools.some(tool => tool.voltage > 0)) return;
  electricalLastTime = Date.now();
  electricalTimer = setInterval(() => {
    const now = Date.now();
    stepElectrical((now - electricalLastTime) / 1000);
    electricalLastTime = now;
  }, 600);
}

function renderGuide() {
  $('#toolSection').hidden = state.guideIndex >= 0;
  if (state.guideIndex < 0) {
    $('#guideIntro').innerHTML = '<h2>자유 실험</h2><p>도구를 꺼내 선택한 뒤 물질과 실험 장치를 자유롭게 조합하세요.</p>';
    $('#guideSteps').innerHTML = '<li class="current"><span>∞</span><p>선택된 도구에만 물질과 조작이 적용됩니다.</p></li>';
    return;
  }
  const guide = guides[state.guideIndex];
  $('#guideIntro').innerHTML = `<h2>${guide.title}</h2><p>${guide.theory}</p>`;
  if (guide.quiz) {
    const complete = state.step === 1;
    $('#guideSteps').innerHTML = `<li class="${complete ? 'done' : 'current'}"><span>${complete ? '✓' : '?'}</span><p>${guide.goal}</p></li>` + (complete ? '<li class="complete"><b>퀴즈 해결</b><p>모든 조건을 만족했습니다.</p></li>' : '');
    return;
  }
  $('#guideSteps').innerHTML = guide.steps.map(([title], index) => `<li class="${index < state.step ? 'done' : index === state.step ? 'current' : ''}"><span>${index < state.step ? '✓' : index + 1}</span><p>${title}</p></li>`).join('') + (state.step === guide.steps.length ? '<li class="complete"><b>실험 완료</b><p>모든 단계를 수행했습니다.</p></li>' : '');
}

function renderCompendium() {
  const key = JSON.stringify([selectedChallengeId, state.unlocked, state.unlockActions]);
  if (key === compendiumRenderKey) return;
  compendiumRenderKey = key;
  const unlockedCount = state.unlocked.length;
  const progress = unlockedCount / challenges.length * 100;
  $('#unlockCount').textContent = `${unlockedCount} / ${challenges.length}`;
  $('#compendiumProgress').textContent = `발견 ${unlockedCount} / ${challenges.length}`;
  $('#compendiumProgressBar').style.width = `${progress}%`;
  $('#challengeList').innerHTML = challenges.map((challenge, index) => {
    const unlocked = state.unlocked.includes(challenge.id);
    return `<button class="challenge-card ${unlocked ? 'unlocked' : 'locked'} ${challenge.id === selectedChallengeId ? 'active' : ''}" data-challenge-id="${challenge.id}"><span>${unlocked ? '✓' : String(index + 1).padStart(2, '0')}</span><div><b>${challenge.title}</b><small>${unlocked ? challenge.category + ' · 발견 완료' : '도전과제 · 미발견'}</small></div></button>`;
  }).join('');

  const challenge = challenges.find((item) => item.id === selectedChallengeId) || challenges[0];
  const unlocked = state.unlocked.includes(challenge.id);
  $('#challengeDetail').innerHTML = `
    <span class="detail-status">${unlocked ? 'UNLOCKED / 발견 완료' : 'LOCKED / 미발견'}</span>
    <h3>${challenge.title}</h3><p class="category">${challenge.category}</p>
    <div class="challenge-goal"><b>도전과제</b><br>${challenge.goal}</div>
    ${unlocked ? `
      <div class="detail-section"><b>해금한 행동</b><p>${state.unlockActions[challenge.id] || challenge.unlockAction}</p></div>
      <div class="detail-section"><b>관찰된 현상</b><p>${challenge.observation}</p></div>
      <div class="detail-section"><b>과학적 원인</b><p>${challenge.reason}</p></div>
      <div class="detail-section"><b>관련 식</b><p class="detail-equation">${challenge.equation}</p></div>
    ` : '<div class="locked-detail"><b>?</b><p>실험에서 목표 현상을 직접 만들어 설명을 해금하세요.</p></div>'}`;
}

function toolVisual(tool) {
  const entries = Object.entries(tool.contents);
  const total = entries.reduce((sum, [, value]) => sum + value, 0);
  const gas = Object.values(tool?.gases || {}).reduce((sum, n) => sum + n, 0);
  const hasSolid = entries.some(([id,n]) => chemicals[id].state === 'solid' && n > 1e-12);
  const liquids = entries.filter(([id]) => ['liquid', 'aqueous'].includes(chemicals[id].state));
  const liquidColor = liquids.length ? chemicals[liquids.at(-1)[0]].color : '#d9e6e5';
  const height = total ? Math.min(68, 10 + model.volume(tool) * 200) : 0;
  return `
    <div class="electrodes" style="display:${tool.voltage ? 'flex' : 'none'}"><i></i><i></i></div>
    <div class="heat-waves" style="display:${tool.heating ? 'flex' : 'none'}"><i></i><i></i><i></i></div>
    <div class="glass"><div class="liquid" style="height:${height}%;background:${liquidColor}">
      <div class="bubbles" style="display:${tool.voltage > 0 && !model.electrolysisIssue(tool) && gas >= 1e-8 ? 'block' : 'none'}"><i></i><i></i><i></i><i></i></div>
      <div class="precipitate" style="display:${hasSolid ? 'block' : 'none'}"></div>
    </div><div class="scale"><i></i><i></i><i></i></div></div>
    <b>${tool.label}</b><span>${total ? `${total.toFixed(2)} mol · ${tool.temperature.toFixed(0)}°C` : `비어 있음 · ${tool.temperature.toFixed(0)}°C`}</span>`;
}

function renderTools() {
  const area = $('#toolArea');
  if (!state.tools.length) {
    area.innerHTML = '<div class="tool-area-empty">위의 LAB TOOLS에서 도구를 클릭해<br>실험대에 꺼내세요.</div>';
    return;
  }
  state.tools.forEach((tool) => {
    tool.x = Math.max(0, Math.min(tool.x, area.clientWidth - 180));
    tool.y = Math.max(0, Math.min(tool.y, area.clientHeight - 280));
  });
  const existing = [...area.querySelectorAll('[data-tool-id]')];
  const sameTools = existing.length === state.tools.length && existing.every((el, i) => el.dataset.toolId === state.tools[i].id);
  if (sameTools) {
    state.tools.forEach((tool, i) => {
      const el = existing[i];
      el.classList.toggle('selected', tool.id === state.selectedToolId);
      if (activeDragToolId !== tool.id) { el.style.left = `${tool.x}px`; el.style.top = `${tool.y}px`; }
      el.setAttribute('aria-pressed', String(tool.id === state.selectedToolId));
      const visual = el.querySelector('.tool-visual');
      visual.innerHTML = toolVisual(tool);
    });
    return;
  }
  area.innerHTML = state.tools.map((tool) => `<div class="beaker-drop ${tool.type} ${tool.id === state.selectedToolId ? 'selected' : ''}" data-tool-id="${tool.id}" tabindex="0" role="button" aria-pressed="${tool.id === state.selectedToolId}" style="left:${tool.x}px;top:${tool.y}px" aria-label="${tool.label}"><div class="tool-handle" aria-hidden="true">⠿ 잡고 이동</div><div class="tool-visual">${toolVisual(tool)}</div></div>`).join('');
  attachToolInteractions();
}

function render() {
  renderGuide();
  renderTools();
  renderCompendium();
  const tool = selectedTool();
  $('#selectedToolName').textContent = tool ? `${tool.label} 선택됨` : '선택한 도구 없음';
  $('#deleteToolButton').hidden = state.guideIndex >= 0;
  $('#deleteToolButton').disabled = !tool;
  const entries = tool ? Object.entries(tool.contents) : [];
  const gas = Object.values(tool?.gases || {}).reduce((sum, n) => sum + n, 0);
  const mass = model.mass(tool);
  $('#temperature').textContent = tool ? `${tool.temperature.toFixed(0)}°C` : '—';
  $('#ph').textContent = calculatePH(tool)?.toFixed(1) ?? '—';
  $('#mass').textContent = tool ? `${mass.toFixed(1)} g` : '—';
  $('#gas').textContent = tool ? `${(gas * 1e6).toPrecision(4)} µmol` : '—';
  $('#voltage').textContent = tool ? `${tool.voltage.toFixed(1)} V` : '—';
  $('#current').textContent = electricCurrent(tool) === null ? '—' : `${electricCurrent(tool).toFixed(3)} mA`;
  $('#volume').textContent = tool ? `${(model.volume(tool)*1000).toFixed(2)} mL` : '—';
  $('#charge').textContent = tool ? `${tool.charge.toPrecision(4)} C / ${tool.elapsed.toFixed(1)} s` : '—';
  const issues = tool ? [model.phIssue(tool), model.currentIssue(tool), tool.voltage > 0 ? model.electrolysisIssue(tool) : null].filter(Boolean) : [];
  $('#modelNotice').textContent = [...new Set(issues)].join(' ');
  $('#composition').classList.toggle('empty', !entries.length);
  $('#composition').innerHTML = entries.length ? entries.map(([id, value]) => `<div><span style="background:${chemicals[id].color}">${chemicals[id].formula}</span><b>${chemicals[id].name}</b><small>${value.toPrecision(4)} mol</small></div>`).join('') : (tool ? '투입된 물질이 없습니다.' : '선택된 실험 도구가 없습니다.');
  if (tool && gas > 0) $('#composition').innerHTML += '<h3>대기로 방출된 기체 (누적)</h3>' + Object.entries(tool.gases).map(([id,n]) => `<div><b>${chemicals[id].formula}</b><small>${(n*1e6).toPrecision(4)} µmol</small></div>`).join('');

  $('#heatButton').innerHTML = tool?.heating ? '<strong>⌁</strong>가열 중지 <small>현재 가열 중</small>' : '<strong>⌁</strong>가열 <small>건조 시료 · 가상 가열로</small>';
  $('#coolButton').innerHTML = tool?.cooling ? '<strong>❄</strong>냉각 중지 <small>현재 냉각 중</small>' : '<strong>❄</strong>냉각 <small>25°C까지 냉각</small>';
  $('#powerButton').innerHTML = tool?.voltage ? '<strong>ϟ</strong>전기 차단 <small>현재 6.0 V</small>' : '<strong>ϟ</strong>전기 공급 <small>선택 도구 6.0 V</small>';
  ['heatButton', 'coolButton', 'powerButton'].forEach((id) => { $(`#${id}`).disabled = !tool; });
  $('#undoButton').disabled = history.length === 0;
  $('#eventCount').textContent = `${state.events.length} events`;
  $('#eventLog').innerHTML = state.events.length ? state.events.map((event) => `<article class="${event.reaction ? 'reaction' : ''}"><time>${String(event.number).padStart(2, '0')}</time><div><b>${event.title}</b><p>${event.detail}</p></div></article>`).join('') : '<p class="empty-log">실험을 시작하면 조작과 반응이 기록됩니다.</p>';
}

function clearThermalTimer() {
  if (thermalTimer) clearInterval(thermalTimer);
  thermalTimer = null;
  thermalToolId = null;
}

function stopOtherThermalProcesses(exceptId) {
  state.tools.forEach((tool) => {
    if (tool.id !== exceptId) { tool.heating = false; tool.cooling = false; }
  });
  clearThermalTimer();
}

function startHeatTimer(toolId) {
  clearThermalTimer();
  thermalToolId = toolId;
  thermalTimer = setInterval(() => {
    const tool = state.tools.find((item) => item.id === toolId);
    if (!tool || !tool.heating) return clearThermalTimer();
    tool.temperature = Math.min(1000, tool.temperature + 100);
    advanceGuide(runReactions(tool));
    if (tool.temperature >= 1000) {
      tool.heating = false;
      clearThermalTimer();
      addEvent('가열 자동 중지', `${tool.label} · 최대 온도 1000°C에 도달했습니다.`);
    }
    render();
  }, 600);
}

function startCoolTimer(toolId) {
  clearThermalTimer();
  thermalToolId = toolId;
  thermalTimer = setInterval(() => {
    const tool = state.tools.find((item) => item.id === toolId);
    if (!tool || !tool.cooling) return clearThermalTimer();
    tool.temperature = Math.max(25, tool.temperature - 50);
    if (tool.temperature <= 25) {
      tool.cooling = false;
      clearThermalTimer();
      addEvent('냉각 자동 중지', `${tool.label} · 실온 25°C에 도달했습니다.`);
    }
    render();
  }, 600);
}

function toggleHeating() {
  const tool = requireSelectedTool(); if (!tool) return;
  if (!tool.heating && model.heatingIssue(tool)) { addEvent('가열 범위', model.heatingIssue(tool)); render(); return; }
  rememberState();
  if (tool.heating) {
    tool.heating = false; clearThermalTimer();
    return perform(tool, 'heat-off', '가열 중지', `현재 온도 ${tool.temperature.toFixed(0)}°C에서 중지했습니다.`);
  }
  stopOtherThermalProcesses(tool.id);
  tool.cooling = false; tool.heating = true;
  perform(tool, 'heat', '가열 시작', '선택된 도구를 가열합니다.');
  startHeatTimer(tool.id);
}

function toggleCooling() {
  const tool = requireSelectedTool(); if (!tool) return;
  rememberState();
  if (tool.cooling) {
    tool.cooling = false; clearThermalTimer();
    return perform(tool, 'cool-off', '냉각 중지', `현재 온도 ${tool.temperature.toFixed(0)}°C에서 중지했습니다.`);
  }
  stopOtherThermalProcesses(tool.id);
  tool.heating = false; tool.cooling = true;
  perform(tool, 'cool', '냉각 시작', '선택된 도구를 냉각합니다.');
  startCoolTimer(tool.id);
}

function togglePower() {
  const tool = requireSelectedTool(); if (!tool) return;
  rememberState();
  tool.voltage = tool.voltage ? 0 : 6;
  const current = electricCurrent(tool);
  syncElectricalTimer();
  describeElectricalPhenomenon(tool);
  perform(tool, tool.voltage ? 'power' : 'power-off', tool.voltage ? '전기 공급' : '전기 차단', tool.voltage ? `6.0 V를 공급했습니다. 추정 전류는 ${current === null ? '계산 범위 밖' : current.toFixed(3) + ' mA'}입니다.` : '전압을 0 V로 차단했습니다.');
}

function deleteSelectedTool() {
  if (state.guideIndex >= 0) return;
  const tool = selectedTool();
  if (!tool) return;
  rememberState();
  if (thermalToolId === tool.id) clearThermalTimer();
  state.tools = state.tools.filter((item) => item.id !== tool.id);
  state.selectedToolId = state.tools.at(-1)?.id || null;
  syncElectricalTimer();
  addEvent('실험 도구 삭제', `${tool.label}을 실험대에서 제거했습니다.`);
  render();
}

function restoreThermalProcess() {
  const active = state.tools.find((tool) => tool.heating || tool.cooling);
  if (active?.heating) startHeatTimer(active.id);
  else if (active?.cooling) startCoolTimer(active.id);
}

function undo() {
  settleElectrical();
  const previous = history.pop(); if (!previous) return;
  clearThermalTimer();
  clearElectricalTimer();
  state.tools = structuredClone(previous.tools);
  state.selectedToolId = previous.selectedToolId;
  state.step = previous.step;
  state.events = previous.events.map((event) => ({ ...event }));
  state.nextToolId = previous.nextToolId;
  addEvent('되돌리기', '직전 조작 이전의 실험 상태를 복원했습니다.');
  restoreThermalProcess();
  syncElectricalTimer();
  render();
}

function reset() {
  clearThermalTimer();
  clearElectricalTimer();
  activeDragToolId = null;
  history.length = 0;
  state.tools = [];
  state.selectedToolId = null;
  state.step = 0;
  state.events = [];
  state.nextToolId = 1;
  if (state.guideIndex >= 0) {
    const tool = makeTool('beaker');
    tool.x = 230; tool.y = 68;
    state.tools.push(tool);
    state.selectedToolId = tool.id;
  }
  render();
}

function attachToolInteractions() {
  const area = $('#toolArea');
  area.querySelectorAll('[data-tool-id]').forEach((element) => {
    const toolId = element.dataset.toolId;
    element.addEventListener('click', () => { state.selectedToolId = toolId; advanceGuide(); render(); });
    element.addEventListener('dragover', (event) => { event.preventDefault(); element.classList.add('dragging'); });
    element.addEventListener('dragleave', () => element.classList.remove('dragging'));
    element.addEventListener('drop', (event) => {
      event.preventDefault(); event.stopPropagation();
      const chemicalId = event.dataTransfer.getData('text/chemical');
      if (chemicals[chemicalId]) addChemical(chemicalId, toolId);
    });
    let drag = null;
    element.addEventListener('pointerdown', (event) => {
      if (event.button !== 0 || !event.isPrimary) return;
      if (event.pointerType !== 'mouse' && !event.target.closest('.tool-handle')) return;
      const rect = element.getBoundingClientRect();
      activeDragToolId = toolId;
      drag = { offsetX: event.clientX - rect.left, offsetY: event.clientY - rect.top, startX: event.clientX, startY: event.clientY, moved: false };
      element.setPointerCapture(event.pointerId);
      element.classList.add('moving');
    });
    element.addEventListener('pointermove', (event) => {
      if (!drag) return;
      if (!drag.moved) {
        if (Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY) < 3) return;
        rememberState(); drag.moved = true;
      }
      const areaRect = area.getBoundingClientRect();
      const tool = state.tools.find((item) => item.id === toolId);
      tool.x = Math.max(0, Math.min(area.clientWidth - element.offsetWidth, event.clientX - areaRect.left - drag.offsetX));
      tool.y = Math.max(0, Math.min(area.clientHeight - element.offsetHeight, event.clientY - areaRect.top - drag.offsetY));
      element.style.left = `${tool.x}px`; element.style.top = `${tool.y}px`;
    });
    const stop = (event) => {
      if (!drag) return;
      drag = null; activeDragToolId = null; element.classList.remove('moving');
      if (element.hasPointerCapture(event.pointerId)) element.releasePointerCapture(event.pointerId);
      render();
    };
    element.addEventListener('pointerup', stop);
    element.addEventListener('pointercancel', stop);
    element.addEventListener('keydown', (event) => {
      const directions = { ArrowLeft: [-12, 0], ArrowRight: [12, 0], ArrowUp: [0, -12], ArrowDown: [0, 12] };
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault(); state.selectedToolId = toolId; advanceGuide(); render();
        document.querySelector(`[data-tool-id="${toolId}"]`)?.focus();
        return;
      }
      if (!directions[event.key]) return;
      event.preventDefault();
      rememberState();
      const tool = state.tools.find((item) => item.id === toolId);
      tool.x = Math.max(0, Math.min(area.clientWidth - element.offsetWidth, tool.x + directions[event.key][0]));
      tool.y = Math.max(0, Math.min(area.clientHeight - element.offsetHeight, tool.y + directions[event.key][1]));
      element.style.left = `${tool.x}px`; element.style.top = `${tool.y}px`;
      render();
    });
  });
}

function initialize() {
  $('#guideSelect').innerHTML = '<option value="-1">자유 실험</option>'
    + '<optgroup label="대표 실험">' + guides.slice(0, 5).map((guide, index) => `<option value="${index}">${guide.title}</option>`).join('') + '</optgroup>'
    + '<optgroup label="과학 퀴즈">' + guides.slice(5).map((guide, index) => `<option value="${index + 5}">${guide.title}</option>`).join('') + '</optgroup>';
  $('#guideSelect').value = String(state.guideIndex);
  $('#guideSelect').addEventListener('change', (event) => { state.guideIndex = Number(event.target.value); reset(); });
  $('#chemicalList').innerHTML = inventory.map((id) => `<button draggable="true" data-id="${id}"><i style="background:${chemicals[id].color}"></i><span><b>${chemicals[id].name}</b><small>${chemicals[id].formula} · ${model.doseLabel(id)}</small></span><em>+</em></button>`).join('');
  document.querySelectorAll('#chemicalList button').forEach((button) => {
    button.addEventListener('click', () => addChemical(button.dataset.id));
    button.addEventListener('dragstart', (event) => event.dataTransfer.setData('text/chemical', button.dataset.id));
  });
  $('#toolList').innerHTML = Object.entries(toolTypes).map(([id, tool]) => `<button data-tool-type="${id}"><i>${tool.symbol}</i><span><b>${tool.name}</b><small>꺼내기</small></span><em>+</em></button>`).join('');
  document.querySelectorAll('#toolList button').forEach((button) => button.addEventListener('click', () => createLabTool(button.dataset.toolType)));
  $('#heatButton').addEventListener('click', toggleHeating);
  $('#coolButton').addEventListener('click', toggleCooling);
  $('#powerButton').addEventListener('click', togglePower);
  $('#undoButton').addEventListener('click', undo);
  $('#deleteToolButton').addEventListener('click', deleteSelectedTool);
  $('#compendiumButton').addEventListener('click', () => {
    renderCompendium();
    $('#compendiumDialog').showModal();
  });
  $('#closeCompendium').addEventListener('click', () => $('#compendiumDialog').close());
  $('#challengeList').addEventListener('click', (event) => {
    const card = event.target.closest('[data-challenge-id]');
    if (!card) return;
    selectedChallengeId = card.dataset.challengeId;
    renderCompendium();
  });
  $('#compendiumDialog').addEventListener('click', (event) => {
    if (event.target === $('#compendiumDialog')) $('#compendiumDialog').close();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Backspace' || state.guideIndex >= 0 || !selectedTool()) return;
    if (event.target.closest('input, textarea, select, [contenteditable="true"]') || $('#compendiumDialog').open) return;
    event.preventDefault();
    deleteSelectedTool();
  });
  $('#resetButton').addEventListener('click', () => { if (confirm('현재 실험을 초기화할까요?')) reset(); });
  window.addEventListener('resize', renderTools);
  reset();
}

initialize();
