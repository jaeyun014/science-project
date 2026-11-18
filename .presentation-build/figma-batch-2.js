const C={bg:{r:0.965,g:0.961,b:0.937},dark:{r:0.063,g:0.243,b:0.251},text:{r:0.086,g:0.235,b:0.243},accent:{r:0.063,g:0.467,b:0.412},muted:{r:0.322,g:0.443,b:0.424},light:{r:0.965,g:0.961,b:0.937},mint:{r:0.675,g:0.824,b:0.784}};
await Promise.all([figma.loadFontAsync({family:'Noto Sans KR',style:'Regular'}),figma.loadFontAsync({family:'Noto Sans KR',style:'Bold'})]);
const createdNodeIds=[];const changedSlides=[];
function frame(parent,name,x,y,w,gap=0,dir='VERTICAL'){const f=figma.createAutoLayout(dir);parent.appendChild(f);f.name=name;f.resize(w,1);f.fills=[];f.primaryAxisSizingMode=dir==='VERTICAL'?'AUTO':'FIXED';f.counterAxisSizingMode=dir==='VERTICAL'?'FIXED':'AUTO';f.itemSpacing=gap;f.x=x;f.y=y;createdNodeIds.push(f.id);return f;}
function txt(parent,str,size,color,bold=false,width=1704){const t=figma.createText();parent.appendChild(t);t.fontName={family:'Noto Sans KR',style:bold?'Bold':'Regular'};t.fontSize=size;t.lineHeight={unit:'PERCENT',value:140};t.characters=str;t.fills=[{type:'SOLID',color}];t.resize(width,1);t.textAutoResize='HEIGHT';t.name=str.slice(0,45);createdNodeIds.push(t.id);return t;}
function at(slide,str,x,y,w,size,color,bold=false){const t=txt(slide,str,size,color,bold,w);t.x=x;t.y=y;return t;}
function rect(parent,x,y,w,h,color){const r=figma.createRectangle();parent.appendChild(r);r.resize(w,h);r.fills=[{type:'SOLID',color}];r.x=x;r.y=y;createdNodeIds.push(r.id);return r;}
const data=[{"section": "2. 과학 개념", "title": "물의 자동 이온화와 중성 부근의 계산", "equation": "[H⁺][OH⁻] = K_w = 1.0 × 10⁻¹⁴", "lead": "산이나 염기가 거의 남지 않아도 물 자체가 이온을 만든다", "rows": [["25°C에서의 중성", "[H⁺] = [OH⁻] = 1.0 × 10⁻⁷ mol/L\n따라서 중성 용액의 pH는 7이다."], ["게임의 계산 방식", "c = {n(H⁺) − n(OH⁻)} / V\nH − K_w/H = c를 풀고, pH = −log₁₀H로 계산한다."]], "notes": "K_w는 물의 이온곱입니다. H=[H+], 양의 근 H=(c+sqrt(c²+4Kw))/2를 사용하며 코드에서는 수치적으로 안정한 형태를 사용합니다. c=0일 때 H=sqrt(Kw). 온도가 달라지면 Kw와 중성 pH도 달라집니다. 가수분해·탄산 평형 미지원 및 높은 이온 강도 조건에서는 게임이 pH를 표시하지 않습니다. 출처: https://openstax.org/books/chemistry-2e/pages/14-2-ph-and-poh; model.js.", "index": 5}, {"section": "2. 과학 개념", "title": "침전과 용해 평형", "equation": "AgCl(s) ⇌ Ag⁺(aq) + Cl⁻(aq)", "lead": "난용성 물질도 일부는 녹으며, 용해와 침전이 평형을 이룬다", "rows": [["침전의 판단", "이온곱 Q = [Ag⁺][Cl⁻]를 용해도곱 Ksp와 비교한다.\nQ > Ksp이면 침전이 생기는 방향으로 진행한다."], ["게임의 평형 처리", "Ag⁺와 Cl⁻의 양 및 고체량을 함께 계산한다.\n용액을 희석하거나 이온 농도가 달라지면 평형도 달라진다."]], "notes": "순수 고체의 활동도는 1로 취급하므로 Ksp 식에서 고체량을 직접 곱하지 않습니다. 포화 상태에서 고체가 존재하면 Q=Ksp. Q<Ksp이고 고체가 있으면 녹을 수 있습니다. 게임의 AgCl Ksp=1.77×10^-10은 코드에 채택된 25°C 상수로 설명하며 특정 표의 값을 새로 검증한 것으로 주장하지 않습니다. Ca(OH)2는 Ksp=[Ca²+][OH-]²로 처리해 공통 이온 효과를 반영합니다. 출처: https://openstax.org/books/chemistry-2e/pages/15-1-precipitation-and-dissolution; docs/SCIENCE.md, model.js.", "index": 6}, {"section": "2. 과학 개념", "title": "용해와 전기 전도성의 차이", "equation": "NaCl(s) → Na⁺(aq) + Cl⁻(aq)", "lead": "전류는 용액 속에서 이동할 수 있는 이온과 관련된다", "rows": [["소금물과 설탕물 비교", "소금은 물에 녹아 이온을 공급한다.\n설탕은 주로 중성 분자로 녹으므로 전도성 증가가 작다."], ["게임의 전류 추정", "이온별 농도와 몰전도도로 전도도를 합산한다.\n같은 전압에서도 이온의 종류와 농도에 따라 전류가 달라진다."]], "notes": "게임 모델: κ=Σλᵢcᵢ/1000 S/cm (cᵢ 단위 mol/L, λᵢ 단위 S·cm²/mol), I=Uκ/Kcell. 셀 상수 0.5 cm^-1. 순수한 물도 자동 이온화로 매우 작은 전도성을 갖습니다. 이온 이동도 농도 의존성, 점도 및 전극 분극을 생략한 추정치입니다. 근거: docs/SCIENCE.md, model.js. 전도도 비교는 온도·농도·전극 조건을 통제해야 합니다.", "index": 7}, {"section": "2. 과학 개념", "title": "물의 전기분해와 패러데이 법칙", "equation": "2H₂O(l) → 2H₂(g) + O₂(g)", "lead": "전하량이 생성 기체의 몰수를 결정한다", "rows": [["시간에 따른 생성량", "Q = ∫I dt,  n(H₂) = Q/(2F),  n(O₂) = Q/(4F)\nF ≈ 96,485 C/mol, 수소와 산소의 몰수 비는 2 : 1이다."], ["게임의 조건", "황산나트륨 수용액에 6.0 V를 공급한다.\n불활성 전극과 전류 효율 100%를 가정한다."]], "notes": "음극: 2H2O+2e-→H2+2OH-. 양극: 2H2O→O2+4H++4e-. 황산나트륨은 전도성을 높이는 보조 전해질입니다. 같은 온도·압력의 이상기체라면 부피 비도 2:1이지만 게임의 표시량은 포집 부피가 아니라 방출 누적 mol입니다. 실제 생성량에는 과전압, 전류 효율, 기체 용해 및 전극 재질 등이 영향을 줍니다. 염화물이 있으면 경쟁 반응이 가능하므로 게임은 기체 계산을 중지합니다. 출처: https://openstax.org/books/chemistry-2e/pages/17-7-electrolysis; docs/SCIENCE.md.", "index": 8}];
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
