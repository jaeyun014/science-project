import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as m from '../model.js';
const near = (a,b,tol=1e-10) => assert.ok(Math.abs(a-b)<tol, `${a} != ${b}`);
const sample = (...ids) => { const t=m.createSample(); for(const id of ids) assert.equal(m.addDose(t,id).issue,null); return t; };
const totalMass=t=>m.mass(t)+m.gasMass(t);
const charge=t=>Object.entries(t.contents).reduce((sum,[id,n])=>sum+n*m.chemicals[id].charge,0);

test('pH derives from mol/L, accounts for dilution and water autoionization',()=>{
  const t=sample('hcl'); near(m.calculatePH(t),2,1e-7);
  m.addDose(t,'water'); near(m.calculatePH(t),2+Math.log10(2),1e-7);
  const b=sample('naoh'); near(m.calculatePH(b),12,1e-7);
  near(m.calculatePH(sample('water')),7);
  near(m.calculatePH(sample('distilled-water')),7);
  const dilute=sample('water'); m.change(dilute,'h',1e-10); m.change(dilute,'cl',1e-10);
  near(m.calculatePH(dilute),6.99782853663822,1e-9);
  assert.equal(m.calculatePH(sample('zinc')),null);
});
test('equal strong acid/base neutralizes, retains spectator ions and conserves mass',()=>{
  const t=sample('hcl'); const before=totalMass(t)+m.WATER_DOSE*18.015+m.DOSE*39.997;
  m.addDose(t,'naoh'); near(m.calculatePH(t),7);
  near(m.amount(t,'h'),0); near(m.amount(t,'oh'),0); near(m.amount(t,'na'),0.001); near(m.amount(t,'cl'),0.001);
  near(totalMass(t),before,1e-9); near(charge(t),0);
});
test('CaO hydrates with either water source; Ca(OH)2 saturates at Ksp and remains solid',()=>{
  for (const water of ['water','distilled-water']) {
    const t=sample('cao','cao',water), v=m.volume(t);
    assert.ok(m.amount(t,'caoh2')>0); near(m.amount(t,'cao'),0);
    near(m.amount(t,'ca')/v * (m.amount(t,'oh')/v)**2,m.KSP_LIME,1e-12);
    assert.ok(m.calculatePH(t)>12 && m.calculatePH(t)<13);
    near(charge(t),0); near(m.amount(t,'ca')+m.amount(t,'caoh2'),0.002);
    const solid=m.amount(t,'caoh2'); m.addDose(t,'water'); assert.ok(m.amount(t,'caoh2')<solid);
  }
});
test('common hydroxide ion suppresses calcium hydroxide dissolution',()=>{
  const a=sample('cao','cao','water','water'); const b=sample('cao','cao','water','naoh');
  assert.ok(m.amount(b,'caoh2')>m.amount(a,'caoh2'));
});
test('acid consumes CaO and CaCO3 with correct limiting reagent and escaped gas',()=>{
  for(const id of ['cao','caco3']) {
    const t=sample(id,'hcl'); near(m.amount(t,'h'),0);
    if(id==='caco3') { near(m.amount(t,id),0.0005); near(m.amount(t,'ca'),0.0005); }
    else { near(m.amount(t,'cao'),0); near(m.amount(t,'ca')+m.amount(t,'caoh2'),0.001); }
    m.addDose(t,'hcl'); near(m.amount(t,id),0); near(m.amount(t,'ca'),0.001); near(charge(t),0);
    if(id==='caco3') { near(t.gases.co2,0.001); assert.ok(!('co2' in t.contents)); }
  }
});
test('Zn + acid uses two H+ per H2 and gas loss balances mass',()=>{
  const t=sample('zinc'); const expected=totalMass(t)+2*(m.WATER_DOSE*18.015+m.DOSE*36.458);
  m.addDose(t,'hcl'); near(m.amount(t,'zinc'),0.0005); near(t.gases.hydrogen,0.0005);
  m.addDose(t,'hcl'); near(m.amount(t,'zinc'),0); near(t.gases.hydrogen,0.001);
  near(totalMass(t),expected,1e-9); near(charge(t),0); assert.equal(m.calculatePH(t),null);
});
test('AgCl precipitation accepts chloride from HCl, solution salt or solid salt in either order',()=>{
  for(const salt of ['hcl','nacl','solid-salt']) for(const reverse of [false,true]) {
    const ids=reverse?[salt,'agno3']:['agno3',salt]; const t=sample(...ids);
    assert.ok(m.amount(t,'agcl')>0.00099);
    near(m.amount(t,'ag')*m.amount(t,'cl')/m.volume(t)**2,m.KSP_AGCL,1e-14);
    near(m.amount(t,'ag')+m.amount(t,'agcl'),0.001); near(charge(t),0);
  }
});
test('finite salt and sugar solubility separate dissolved and residual solid amounts',()=>{
  const t=m.createSample(); m.change(t,'water',0.1); m.change(t,'solid-salt',0.1); m.change(t,'sugar',0.1);
  const initial=totalMass(t); m.react(t);
  assert.ok(m.amount(t,'solid-salt')>0); assert.ok(m.amount(t,'sugar')>0);
  near(m.amount(t,'na')*58.44,0.1*18.015*0.36,1e-10);
  near(m.amount(t,'sugar-aq')*342.297,0.1*18.015*2,1e-10);
  near(totalMass(t),initial,1e-8); assert.equal(m.electricCurrent(t),null);
});
test('conductance has physical units, dilution response and identical pure waters',()=>{
  const t=sample('water','solid-salt'); t.voltage=6;
  near(m.conductivity(t),0.00126405487,1e-10); near(m.electricCurrent(t),15.16865844,1e-8);
  m.addDose(t,'water'); assert.ok(m.electricCurrent(t)<8);
  const a=sample('water'),b=sample('distilled-water'); a.voltage=b.voltage=6;
  near(m.electricCurrent(a),m.electricCurrent(b)); assert.ok(m.electricCurrent(a)<0.1);
  const q=sample('distilled-water','sugar');q.voltage=6;assert.ok(m.electricCurrent(q)<0.1);
});
test('electrolysis uses elapsed seconds and charge, produces 2:1 gas and conserves mass',()=>{
  const t=sample('sulfate');t.voltage=6; const mass=totalMass(t), current=m.electricCurrent(t)/1000;
  assert.equal(t.gases.hydrogen,undefined);
  m.electrolyze(t,10);
  near(t.charge,current*10); near(t.gases.hydrogen,current*10/(2*m.F),1e-14);
  near(t.gases.hydrogen,2*t.gases.oxygen,1e-14); near(totalMass(t),mass,1e-8);
  const h=t.gases.hydrogen; t.voltage=0;m.electrolyze(t,10);near(t.gases.hydrogen,h);
});
test('chloride, silver, sugar, dry and concentrated mixtures do not invent water-electrolysis gases',()=>{
  for(const t of [sample('nacl'),sample('agno3'),sample('water','sugar'),sample('zinc')]) {
    t.voltage=6;assert.ok(m.electrolysisIssue(t));m.electrolyze(t,1000);assert.equal(t.gases.hydrogen,undefined);
  }
});
test('dry decomposition conserves mass and aqueous heating is explicitly refused',()=>{
  const t=sample('caco3');const mass=totalMass(t);t.temperature=824;m.react(t);near(m.amount(t,'cao'),0);
  t.temperature=825;m.react(t);near(m.amount(t,'cao'),0.001);near(t.gases.co2,0.001);near(totalMass(t),mass,1e-9);
  assert.ok(m.heatingIssue(sample('water'))); assert.ok(m.heatingIssue(sample('sugar'))); assert.equal(m.heatingIssue(sample('caco3')),null);
  assert.ok(m.additionIssue(t,'water'));
});
test('unsupported reactions reject before mutation, symmetrically',()=>{
  for(const ids of [['agno3','zinc'],['agno3','naoh'],['sulfate','cao'],['zinc','naoh'],['sugar','hcl'],['caco3','cao']]) {
    for(const pair of [ids,[...ids].reverse()]) { const t=sample(pair[0]), before=JSON.stringify(t);assert.ok(m.addDose(t,pair[1]).issue);assert.equal(JSON.stringify(t),before); }
  }
});
test('all allowed two-dose combinations conserve mass and electrical charge',()=>{
  for(const a of m.inventory) for(const b of m.inventory) {
    const t=sample(a), before=totalMass(t);const result=m.addDose(t,b);if(result.issue)continue;
    const extra=['water','distilled-water'].includes(b)?m.WATER_DOSE*18.015:m.chemicals[b].state==='aqueous'?m.WATER_DOSE*18.015+m.DOSE*m.chemicals[b].mass:m.DOSE*m.chemicals[b].mass;
    near(totalMass(t),before+extra,1e-8);near(charge(t),0,1e-12);
    for(const n of Object.values(t.contents))assert.ok(Number.isFinite(n)&&n>=0);
  }
});
