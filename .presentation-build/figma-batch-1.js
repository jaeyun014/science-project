const C={bg:{r:0.965,g:0.961,b:0.937},dark:{r:0.063,g:0.243,b:0.251},text:{r:0.086,g:0.235,b:0.243},accent:{r:0.063,g:0.467,b:0.412},muted:{r:0.322,g:0.443,b:0.424},light:{r:0.965,g:0.961,b:0.937},mint:{r:0.675,g:0.824,b:0.784}};
await Promise.all([figma.loadFontAsync({family:'Noto Sans KR',style:'Regular'}),figma.loadFontAsync({family:'Noto Sans KR',style:'Bold'})]);
const createdNodeIds=[];const changedSlides=[];
function frame(parent,name,x,y,w,gap=0,dir='VERTICAL'){const f=figma.createAutoLayout(dir);parent.appendChild(f);f.name=name;f.resize(w,1);f.fills=[];f.primaryAxisSizingMode=dir==='VERTICAL'?'AUTO':'FIXED';f.counterAxisSizingMode=dir==='VERTICAL'?'FIXED':'AUTO';f.itemSpacing=gap;f.x=x;f.y=y;createdNodeIds.push(f.id);return f;}
function txt(parent,str,size,color,bold=false,width=1704){const t=figma.createText();parent.appendChild(t);t.fontName={family:'Noto Sans KR',style:bold?'Bold':'Regular'};t.fontSize=size;t.lineHeight={unit:'PERCENT',value:140};t.characters=str;t.fills=[{type:'SOLID',color}];t.resize(width,1);t.textAutoResize='HEIGHT';t.name=str.slice(0,45);createdNodeIds.push(t.id);return t;}
function at(slide,str,x,y,w,size,color,bold=false){const t=txt(slide,str,size,color,bold,w);t.x=x;t.y=y;return t;}
function rect(parent,x,y,w,h,color){const r=figma.createRectangle();parent.appendChild(r);r.resize(w,h);r.fills=[{type:'SOLID',color}];r.x=x;r.y=y;createdNodeIds.push(r.id);return r;}
const data=[{"section": "", "title": "원소실", "sub": "직접 조작하며 배우는 가상 화학 실험 게임", "cover": true, "body": "화학 반응을 예측하고, 결과를 비교하며 원리를 설명하는 실험실", "notes": "발표자·소속·발표일은 실제 정보로 추가할 수 있습니다. 개발 동기는 프로젝트의 현재 기능에서 도출한 발표 초안이며, 개인적인 경험을 단정하지 않았습니다.", "index": 0}, {"section": "1. 개발 동기", "title": "반응식과 관찰을 연결하는 학습", "lead": "물질을 섞었을 때 생기는 변화를 직접 확인하면 어떨까?", "rows": [["학습에서의 질문", "반응식의 계수가 실제 투입량과 어떤 관계인지, 눈에 보이지 않는 이온이 어떤 역할을 하는지 탐구한다."], ["개발 목표", "시약을 선택하고 조건을 바꾸면서 pH·침전·기체 발생을 비교할 수 있는 가상 실험 환경을 만든다."]], "notes": "개인적인 개발 계기가 있다면 첫 문장에 실제 경험을 덧붙입니다. 실험 교육의 보편적인 실패율이나 효과 크기를 주장하지 않습니다.", "index": 1}, {"section": "1. 개발 동기", "title": "게임 안에서 반복하는 탐구", "lead": "관찰 결과를 바탕으로 다음 실험을 선택한다", "rows": [["가이드 실험", "전기분해·중화·열분해·침전·아연과 산의 반응을 단계별로 수행한다."], ["자유 실험과 퀴즈", "시약과 도구를 선택하고 전도성·염기성 조건을 직접 구성한다."], ["기록과 재시도", "현상 도감과 조작 되돌리기를 활용해 실험 결과를 비교한다."]], "notes": "프로젝트 근거: README.md, app.js의 guides 및 encyclopedia. 현재 코드 기준 가이드 5종, 퀴즈 3종, 현상 도감 8종. 최종 발표 전에 완성본 기능을 다시 확인합니다.", "index": 2}, {"section": "2. 과학 개념", "title": "몰수·농도와 제한 반응물", "equation": "n = cV", "lead": "반응식의 계수는 반응하는 물질의 몰수 비를 나타낸다", "rows": [["게임의 기본 투입량", "수용액 0.010 mol/L × 0.100 L = 용질 0.001 mol\n고체도 한 번에 0.001 mol씩 투입한다."], ["아연과 염산의 예", "Zn(s) + 2H⁺(aq) → Zn²⁺(aq) + H₂(g)\n아연 1회에 염산 1회만 넣으면 산이 먼저 소모된다."]], "notes": "c는 몰농도(mol/L), V는 부피(L), n은 물질량(mol). 아연 0.001 mol과 H+ 0.001 mol이면 H2는 0.0005 mol 생성되고 Zn 0.0005 mol이 남습니다. 염산을 한 번 더 넣으면 총 0.001 mol의 Zn이 반응할 수 있습니다. 출처: https://openstax.org/books/chemistry-2e/pages/4-3-reaction-stoichiometry; 프로젝트 model.js, docs/SCIENCE.md.", "index": 3}, {"section": "2. 과학 개념", "title": "중화 반응과 pH", "equation": "H⁺(aq) + OH⁻(aq) → H₂O(l)", "lead": "남은 수소 이온과 수산화 이온의 농도가 pH를 결정한다", "rows": [["같은 몰수의 강산과 강염기", "염산과 NaOH를 같은 몰수로 섞으면 H⁺와 OH⁻가 소모된다.\n25°C의 이 모델에서는 pH가 약 7이 된다."], ["농도와 pH의 관계", "묽은 이상용액에서 pH ≈ −log₁₀[H⁺]\npH가 1만큼 작아지면 [H⁺]는 10배 커진다."]], "notes": "정확한 pH 정의는 수소 이온의 활동도에 기반합니다. 게임은 묽은 이상용액을 가정하고 농도로 근사합니다. H+는 물속 수화된 양성자의 약식 표기입니다. 모든 산·염기 중화의 당량점이 pH 7인 것은 아닙니다. 중화는 발열 반응이지만 이 게임 수용액은 25°C 항온 조건이므로 온도 상승을 예측하지 않습니다. 일부 게임 설명의 온도 관찰 문구와 계산 모델을 구별해야 합니다. 출처: https://openstax.org/books/chemistry-2e/pages/14-2-ph-and-poh; docs/SCIENCE.md, model.js.", "index": 4}];
for(const d of data){
 const grid=figma.getSlideGrid();const section=d.section||'표지';let rowIndex=grid.length-1;
 const gridNode=figma.currentPage.children.find(n=>n.type==='SLIDE_GRID');
 const lastRow=gridNode&&gridNode.children[gridNode.children.length-1];
 if(!lastRow||lastRow.name!==section){if(lastRow){const row=figma.createSlideRow();row.name=section;createdNodeIds.push(row.id);rowIndex=grid.length;}else rowIndex=0;}
 const slide=figma.createSlide(rowIndex,figma.getSlideGrid()[rowIndex]?.length||0);createdNodeIds.push(slide.id);slide.name=String(d.index+1).padStart(2,'0')+' '+d.title;
 if(!lastRow){const g=figma.currentPage.children.find(n=>n.type==='SLIDE_GRID');g.children[0].name=section;createdNodeIds.push(g.id,g.children[0].id);}
 slide.fills=[{type:'SOLID',color:d.cover?C.dark:C.bg}];const W=slide.width,H=slide.height;const sx=W/1920,sy=H/1080;
 const fg=d.cover?C.light:C.text;rect(slide,0,0,12,H,d.cover?C.mint:C.accent);
 at(slide,d.section,108,53,1660,28,d.cover?C.mint:C.muted);
 at(slide,String(d.index+1).padStart(2,'0'),1750,992,70,26,d.cover?C.mint:C.muted);
 if(d.cover){const content=frame(slide,'표지 제목과 설명',108,230,1704,55);txt(content,d.title,d.index===0?124:76,fg,true);txt(content,d.sub,54,fg);at(slide,d.body||'',108,818,1690,36,C.mint);}
 else{at(slide,d.title,108,140,1704,62,fg,true);
  if(!d.demo){let y=294;const content=frame(slide,'본문',108,y,1704,35);
   if(d.equation)txt(content,d.equation,52,C.accent,true);
   if(d.lead)txt(content,d.lead,40,fg);
   const rows=frame(content,'설명 항목',0,0,1704,d.rows.length===3?36:48);
   for(const row of d.rows){const rr=frame(rows,row[0],0,0,1704,44,'HORIZONTAL');txt(rr,row[0],35,C.accent,true,370);txt(rr,row[1],36,fg,false,1290);}
   if(d.foot)at(slide,d.foot,108,928,1650,27,C.muted);
  }
 }
 slide.speakerNotes=d.notes||'';changedSlides.push(slide);
}
const issues=[];
function check(parent,slide){const children=parent.children||[];for(const n of children){if(n.x< -1||n.y< -1||n.x+n.width>parent.width+2||n.y+n.height>parent.height+2)issues.push({slide:slide.id,type:'bounds',node:n.id,name:n.name});if(n.type==='TEXT'&&n.fontName.family!=='Noto Sans KR')issues.push({slide:slide.id,type:'font',node:n.id});if(n.type==='FRAME')check(n,slide);}for(let i=0;i<children.length;i++)for(let j=i+1;j<children.length;j++){const a=children[i],b=children[j];const ox=Math.min(a.x+a.width,b.x+b.width)-Math.max(a.x,b.x);const oy=Math.min(a.y+a.height,b.y+b.height)-Math.max(a.y,b.y);if(ox>=4&&oy>=4)issues.push({slide:slide.id,type:'overlap',a:a.id,b:b.id});}}
for(const s of changedSlides)check(s,s);
return {createdNodeIds,slides:changedSlides.map(s=>({id:s.id,name:s.name,width:s.width,height:s.height,textCount:s.findAllWithCriteria({types:['TEXT']}).length})),clean:issues.length===0,issues};
