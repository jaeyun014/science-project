const C={bg:{r:0.965,g:0.961,b:0.937},dark:{r:0.063,g:0.243,b:0.251},text:{r:0.086,g:0.235,b:0.243},accent:{r:0.063,g:0.467,b:0.412},muted:{r:0.322,g:0.443,b:0.424},light:{r:0.965,g:0.961,b:0.937},mint:{r:0.675,g:0.824,b:0.784}};
await Promise.all([figma.loadFontAsync({family:'Noto Sans KR',style:'Regular'}),figma.loadFontAsync({family:'Noto Sans KR',style:'Bold'})]);
const createdNodeIds=[];const changedSlides=[];
function frame(parent,name,x,y,w,gap=0,dir='VERTICAL'){const f=figma.createAutoLayout(dir);parent.appendChild(f);f.name=name;f.resize(w,1);f.fills=[];f.primaryAxisSizingMode=dir==='VERTICAL'?'AUTO':'FIXED';f.counterAxisSizingMode=dir==='VERTICAL'?'FIXED':'AUTO';f.itemSpacing=gap;f.x=x;f.y=y;createdNodeIds.push(f.id);return f;}
function txt(parent,str,size,color,bold=false,width=1704){const t=figma.createText();parent.appendChild(t);t.fontName={family:'Noto Sans KR',style:bold?'Bold':'Regular'};t.fontSize=size;t.lineHeight={unit:'PERCENT',value:140};t.characters=str;t.fills=[{type:'SOLID',color}];t.resize(width,1);t.textAutoResize='HEIGHT';t.name=str.slice(0,45);createdNodeIds.push(t.id);return t;}
function at(slide,str,x,y,w,size,color,bold=false){const t=txt(slide,str,size,color,bold,w);t.x=x;t.y=y;return t;}
function rect(parent,x,y,w,h,color){const r=figma.createRectangle();parent.appendChild(r);r.resize(w,h);r.fills=[{type:'SOLID',color}];r.x=x;r.y=y;createdNodeIds.push(r.id);return r;}
const data=[{"section": "3. 게임 시연, 교육적 효과", "title": "교육 효과를 확인하는 방법", "lead": "완성 후에는 성취도와 설명의 변화를 확인한다", "rows": [["사전·사후 평가", "중화 몰비, 침전 조건, 전도성, 전기분해 생성비 문항을 비교한다."], ["설명 문항", "정답 여부와 함께 이온·몰수·보존 법칙을 사용했는지 평가한다."], ["후속 확인", "일정 시간이 지난 뒤 새 조건의 문제로 개념 유지와 적용을 확인한다."]], "foot": "참여 인원·결과 그래프는 실제 평가 후 추가", "notes": "검증 계획 초안입니다. 가능하면 같은 학습 시간과 내용의 비교집단을 두고 사전 점수 차이를 고려합니다. 표본 수, 문항, 채점 기준, 학습 시간 및 지연 검사 시점을 기록합니다. 만족도나 재미 점수만으로 개념 이해 향상을 결론 내리지 않습니다. 수집 전의 성취도 수치는 제시하지 않습니다.", "index": 13}, {"section": "4. 마무리", "title": "현재 성과와 다음 과제", "rows": [["현재까지의 성과", "화학 반응을 이온·몰수 기반 계산과 연결하는\n가상 실험 게임의 기본 구조를 구현했다."], ["남은 개발 과제", "완성본 조작과 설명 문구를 점검하고 시연 영상을 촬영한다.\n모델의 적용 범위를 화면에서도 일관되게 안내한다."], ["다음 검증", "학습자 평가를 통해 설명의 정확성과 학습 효과를 확인한다."]], "notes": "현재 성과는 README.md, model.js, app.js의 기능을 근거로 정리했습니다. 완성·배포·학습 효과 검증을 이미 마쳤다고 주장하지 않습니다. 발표 전에는 실제 진행 상황에 맞게 남은 과제를 수정합니다.", "index": 14}, {"section": "4. 마무리", "title": "관찰 결과를 설명하는 화학 실험", "cover": true, "sub": "원소실은 직접 실험 조건을 바꾸며\n화학 반응의 이유를 탐구하는 학습을 목표로 합니다", "body": "질문 받겠습니다", "notes": "마무리에서는 기능을 다시 나열하기보다 관찰을 설명하는 학습이라는 개발 목표를 강조합니다.", "index": 15}, {"section": "참고 자료", "title": "과학 개념과 구현 근거", "refs": true, "rows": [["OpenStax, Chemistry 2e", "4.3 Reaction Stoichiometry\n14.2 pH and pOH\n15.1 Precipitation and Dissolution\n17.7 Electrolysis"], ["프로젝트 자료", "README.md: 게임 목적과 기능\ndocs/SCIENCE.md: 과학 모델·상수·가정·한계\nmodel.js, app.js: 계산과 게임 흐름"]], "notes": "https://openstax.org/books/chemistry-2e/pages/14-2-ph-and-poh\nhttps://openstax.org/books/chemistry-2e/pages/4-3-reaction-stoichiometry\nhttps://openstax.org/books/chemistry-2e/pages/15-1-precipitation-and-dissolution\nhttps://openstax.org/books/chemistry-2e/pages/17-7-electrolysis\n외부 교재는 개념의 근거, 프로젝트 자료는 실제 구현 범위의 근거입니다. 상수와 구현 선택을 일반적인 실험 사실과 구분했습니다.", "index": 16}];
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
