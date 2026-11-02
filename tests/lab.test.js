import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import * as model from '../model.js';
function lab() {
  const timers=new Map();let next=1,now=0;
  const context=vm.createContext({ model, structuredClone, Date:{now:()=>now},
    setTimeout:()=>1,clearTimeout(){},setInterval(fn){const id=next++;timers.set(id,fn);return id;},clearInterval(id){timers.delete(id);} });
  const source=fs.readFileSync(new URL('../app.js',import.meta.url),'utf8').replace(/^import \* as model from .*;\n/,'').replace(/initialize\(\);\s*$/,'');
  vm.runInContext(source+'\nrender = () => {}; showAchievementToast = () => {};',context);
  return {setDocument:doc=>{context.document=doc;},run:s=>vm.runInContext(s,context),tick:()=>{now+=600;[...timers.values()].forEach(fn=>fn());},timers};
}
const sequences=[['sulfate','power'],['hcl','naoh'],['caco3','heat'],['agno3','nacl'],['zinc','hcl','hcl'],['distilled-water','sugar','power'],['distilled-water','solid-salt','power'],['cao','distilled-water']];
sequences.forEach((sequence,index)=>test(`guide/quiz ${index+1} completes in either input order`,()=>{
  for(const reverse of [false,true]) {
    const app=lab();app.run(`state.guideIndex=${index};reset()`);
    const ops=reverse?[...sequence].reverse():sequence;
    for(const id of ops)app.run(id==='power'?'togglePower()':id==='heat'?'toggleHeating()':`addChemical('${id}')`);
    // Heating before adding is refused; start after adding the sample.
    if(index===2&&reverse)app.run('toggleHeating()');
    for(let i=0;i<10;i++)app.tick();
    assert.equal(app.run('state.step'),app.run('guides[state.guideIndex].quiz?1:guides[state.guideIndex].steps.length'));
  }
}));
test('electrolysis is not instantaneous and power off/reset stop the timer',()=>{
  const a=lab();a.run("reset();addChemical('sulfate');togglePower()");assert.equal(a.run('selectedTool().gases.hydrogen'),undefined);
  a.tick();assert.ok(a.run('selectedTool().gases.hydrogen')>0);
  a.run('togglePower()');assert.equal(a.timers.size,0);a.run('togglePower();reset()');assert.equal(a.timers.size,0);
});
test('undo restores gases, charge, doses, guide and resumes electrical processing from the restored state',()=>{
  const a=lab();a.run("reset();addChemical('sulfate');togglePower()");a.tick();
  const before=a.run('selectedTool().gases.hydrogen');a.run("addChemical('water')");a.tick();a.run('undo()');
  assert.equal(a.run('selectedTool().gases.hydrogen'),before);assert.equal(a.run('selectedTool().doses.water'),undefined);
  a.tick();assert.ok(a.run('selectedTool().gases.hydrogen')>before);
  a.run('undo()');assert.equal(a.run('selectedTool().voltage'),0);assert.equal(a.timers.size,0);
});
test('unsupported heating and additions preserve sample state',()=>{
  const a=lab();a.run("reset();addChemical('water');toggleHeating()");assert.equal(a.timers.size,0);assert.equal(a.run('selectedTool().temperature'),25);
  a.run("reset();addChemical('agno3')");const before=a.run('JSON.stringify(selectedTool().contents)');a.run("addChemical('zinc')");assert.equal(a.run('JSON.stringify(selectedTool().contents)'),before);
});
test('thermal reset/undo cancel processing; cooling stops at 25°C',()=>{
  const a=lab();a.run("reset();addChemical('caco3');toggleHeating()");a.tick();a.run('undo()');assert.equal(a.timers.size,0);assert.equal(a.run('selectedTool().temperature'),25);
  a.run('toggleHeating()');a.tick();a.run('toggleCooling()');for(let i=0;i<4;i++)a.tick();assert.equal(a.run('selectedTool().temperature'),25);assert.equal(a.timers.size,0);
});
test('free tools remain independent; delete/undo restore timers and sample',()=>{
  const a=lab();a.run("state.guideIndex=-1;reset();createLabTool('beaker');addChemical('sulfate');togglePower();createLabTool('flask');addChemical('hcl')");a.tick();
  assert.equal(a.run("amount(state.tools[0],'h')"),0);assert.equal(a.run('state.tools[1].gases.hydrogen'),undefined);
  a.run('deleteSelectedTool();undo()');assert.equal(a.run('state.tools.length'),2);assert.equal(a.timers.size,1);
});
test('achievements enforce equal acid/base, zinc ratio and no NaOH for lime',()=>{
  const a=lab();a.run("reset();addChemical('hcl');addChemical('hcl');addChemical('naoh')");assert.equal(a.run("state.unlocked.includes('neutralization')"),false);
  a.run("reset();addChemical('naoh');addChemical('cao');addChemical('water')");assert.equal(a.run("state.unlocked.includes('lime-water')"),false);
  a.run("reset();addChemical('zinc');addChemical('hcl')");assert.equal(a.run("state.unlocked.includes('zinc-acid')"),false);
});
test('session limits cap events, tools and dose count',()=>{
  const a=lab();a.run("state.guideIndex=-1;reset();for(let i=0;i<9;i++)createLabTool('beaker');for(let i=0;i<300;i++)addChemical('water')");
  assert.equal(a.run('state.tools.length'),6);assert.equal(a.run('selectedTool().doses.water'),200);assert.equal(a.run('state.events.length'),200);
});

test('touch body permits scrolling; touch handle moves the tool and undo restores it',()=>{
  const a=lab();a.run("state.guideIndex=-1;reset();createLabTool('beaker')");
  const handlers=new Map();let captured=false;
  const element={dataset:{toolId:'tool-1'},style:{},offsetWidth:180,offsetHeight:280,
    addEventListener:(name,fn)=>handlers.set(name,fn),classList:{add(){},remove(){}},
    getBoundingClientRect:()=>({left:24,top:68}),setPointerCapture:()=>{captured=true;},hasPointerCapture:()=>captured,releasePointerCapture:()=>{captured=false;}};
  const area={clientWidth:600,clientHeight:440,querySelectorAll:()=>[element],getBoundingClientRect:()=>({left:0,top:0})};
  a.setDocument({querySelector:()=>area});a.run('attachToolInteractions()');
  const event={button:0,isPrimary:true,pointerType:'touch',pointerId:1,clientX:40,clientY:80,target:{closest:()=>null}};
  handlers.get('pointerdown')(event);assert.equal(captured,false);
  event.target.closest=()=>({});handlers.get('pointerdown')(event);assert.equal(captured,true);
  handlers.get('pointermove')({...event,clientX:100,clientY:140});assert.equal(a.run('selectedTool().x'),84);assert.equal(a.run('selectedTool().y'),128);
  handlers.get('pointercancel')(event);assert.equal(captured,false);a.run('undo()');assert.equal(a.run('selectedTool().x'),24);assert.equal(a.run('selectedTool().y'),68);
});
