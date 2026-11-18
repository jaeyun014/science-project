const C={bg:{r:0.965,g:0.961,b:0.937},dark:{r:0.063,g:0.243,b:0.251},text:{r:0.086,g:0.235,b:0.243},accent:{r:0.063,g:0.467,b:0.412},muted:{r:0.322,g:0.443,b:0.424},light:{r:0.965,g:0.961,b:0.937},mint:{r:0.675,g:0.824,b:0.784}};
await Promise.all([figma.loadFontAsync({family:'Noto Sans KR',style:'Regular'}),figma.loadFontAsync({family:'Noto Sans KR',style:'Bold'})]);
const createdNodeIds=[];const changedSlides=[];
function frame(parent,name,x,y,w,gap=0,dir='VERTICAL'){const f=figma.createAutoLayout(dir);parent.appendChild(f);f.name=name;f.resize(w,1);f.fills=[];f.primaryAxisSizingMode=dir==='VERTICAL'?'AUTO':'FIXED';f.counterAxisSizingMode=dir==='VERTICAL'?'FIXED':'AUTO';f.itemSpacing=gap;f.x=x;f.y=y;createdNodeIds.push(f.id);return f;}
function txt(parent,str,size,color,bold=false,width=1704){const t=figma.createText();parent.appendChild(t);t.fontName={family:'Noto Sans KR',style:bold?'Bold':'Regular'};t.fontSize=size;t.lineHeight={unit:'PERCENT',value:140};t.characters=str;t.fills=[{type:'SOLID',color}];t.resize(width,1);t.textAutoResize='HEIGHT';t.name=str.slice(0,45);createdNodeIds.push(t.id);return t;}
function at(slide,str,x,y,w,size,color,bold=false){const t=txt(slide,str,size,color,bold,w);t.x=x;t.y=y;return t;}
function rect(parent,x,y,w,h,color){const r=figma.createRectangle();parent.appendChild(r);r.resize(w,h);r.fills=[{type:'SOLID',color}];r.x=x;r.y=y;createdNodeIds.push(r.id);return r;}
const data=[{"section": "2. 과학 개념", "title": "기체 발생·열분해와 질량 보존", "equation": "CaCO₃(s) → CaO(s) + CO₂(g)", "lead": "기체가 도구 밖으로 나가도 전체 질량은 보존된다", "rows": [["산과 탄산칼슘의 반응", "CaCO₃(s) + 2H⁺(aq) → Ca²⁺(aq) + H₂O(l) + CO₂(g)\n잔류 질량과 방출 기체의 질량을 함께 비교한다."], ["가상 가열로의 열분해", "게임은 825°C를 단일 전환 기준으로 사용한다.\n실제 분해는 온도·시간·CO₂ 분압에 영향을 받는다."]], "notes": "원자 수와 질량 보존은 반응식의 양쪽에서 성립합니다. 개방계에서는 기체 방출로 도구 안의 질량이 줄어들 수 있습니다. 게임의 825°C는 시연용 기준이며 실제 반응 시작 온도 또는 즉시 완결되는 보편적 값이 아닙니다. 반응 속도·열역학 평형을 계산하지 않습니다. 실물 유리 비커를 그 온도로 가열하라는 지침이 아닙니다. 근거: docs/SCIENCE.md. 화학량론 출처: https://openstax.org/books/chemistry-2e/pages/4-3-reaction-stoichiometry.", "index": 9}, {"section": "2. 과학 개념", "title": "이 모델이 설명하는 범위", "lead": "계산의 가정과 한계를 함께 제시한다", "rows": [["설명할 수 있는 것", "정해진 시약의 몰수 변화, 강산·강염기의 pH,\n일부 용해 평형과 전하량에 따른 기체 생성량"], ["단순화한 것", "25°C 이상용액, 용질 부피 무시, 일부 반응의 완결 근사\n반응 속도·증발·복잡한 경쟁 반응은 계산하지 않음"], ["범위를 벗어난 조합", "미지원 반응은 투입을 제한하고 이유를 안내한다.\n계산할 수 없는 값은 “—”로 표시한다."]], "notes": "프로젝트 근거: docs/SCIENCE.md 및 model.js. 물과 증류수는 동일한 순수 H2O로 취급합니다. 온도 상승이나 실제 실험의 모든 현상을 재현하는 시뮬레이터라고 주장하지 않습니다.", "index": 10}, {"section": "3. 게임 시연, 교육적 효과", "title": "게임 시연", "demo": true, "notes": "시연 영상은 게임 완성 후 촬영해 이 슬라이드에 삽입합니다. 본문은 요청에 따라 비워두었습니다.", "index": 11}, {"section": "3. 게임 시연, 교육적 효과", "title": "기대하는 교육적 효과", "lead": "조작 결과를 과학 개념으로 설명하는 연습", "rows": [["개념 이해", "pH·침전·기체 발생을 반응식과 연결해 설명한다."], ["변인 통제", "한 번에 투입량이나 시약 한 조건을 바꾸며 결과를 비교한다."], ["근거를 통한 추론", "퀴즈를 해결한 뒤 성공 조건을 이온과 몰수로 설명한다."]], "foot": "학습 효과는 기대이며, 학습자 대상 검증 결과는 아직 없음", "notes": "교육적 효과를 실증 결과로 표현하지 않습니다. 가상 실험은 실제 기구 조작이나 실험 안전 습관을 직접 평가하지 못합니다. 기능에 기반한 교육적 가설입니다. 수업 활동 예: 소금물과 설탕물의 전도성 차이를 먼저 예측하고, 같은 물의 양과 투입 몰수에서 비교한 다음 설명문을 작성합니다.", "index": 12}];
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
