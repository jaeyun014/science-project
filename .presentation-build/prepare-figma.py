import json
from pathlib import Path
base=Path('.presentation-build')
data=json.loads((base/'content.json').read_text())
data[11]['notes']='시연 영상은 게임 완성 후 촬영해 이 슬라이드에 삽입합니다. 본문은 요청에 따라 비워두었습니다.'
preamble='''const C={bg:{r:0.965,g:0.961,b:0.937},dark:{r:0.063,g:0.243,b:0.251},text:{r:0.086,g:0.235,b:0.243},accent:{r:0.063,g:0.467,b:0.412},muted:{r:0.322,g:0.443,b:0.424},light:{r:0.965,g:0.961,b:0.937},mint:{r:0.675,g:0.824,b:0.784}};
await Promise.all([figma.loadFontAsync({family:'Noto Sans KR',style:'Regular'}),figma.loadFontAsync({family:'Noto Sans KR',style:'Bold'})]);
const createdNodeIds=[];const changedSlides=[];
function frame(parent,name,x,y,w,gap=0,dir='VERTICAL'){const f=figma.createAutoLayout(dir);parent.appendChild(f);f.name=name;f.resize(w,1);f.fills=[];f.primaryAxisSizingMode=dir==='VERTICAL'?'AUTO':'FIXED';f.counterAxisSizingMode=dir==='VERTICAL'?'FIXED':'AUTO';f.itemSpacing=gap;f.x=x;f.y=y;createdNodeIds.push(f.id);return f;}
function txt(parent,str,size,color,bold=false,width=1704){const t=figma.createText();parent.appendChild(t);t.fontName={family:'Noto Sans KR',style:bold?'Bold':'Regular'};t.fontSize=size;t.lineHeight={unit:'PERCENT',value:140};t.characters=str;t.fills=[{type:'SOLID',color}];t.resize(width,1);t.textAutoResize='HEIGHT';t.name=str.slice(0,45);createdNodeIds.push(t.id);return t;}
function at(slide,str,x,y,w,size,color,bold=false){const t=txt(slide,str,size,color,bold,w);t.x=x;t.y=y;return t;}
function rect(parent,x,y,w,h,color){const r=figma.createRectangle();parent.appendChild(r);r.resize(w,h);r.fills=[{type:'SOLID',color}];r.x=x;r.y=y;createdNodeIds.push(r.id);return r;}
'''
body='''for(const d of data){
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
'''
for batch,(a,b) in enumerate([(0,5),(5,9),(9,13),(13,17)]):
 rows=[dict(d,index=i) for i,d in enumerate(data) if a<=i<b]
 (base/f'figma-batch-{batch+1}.js').write_text(preamble+'const data='+json.dumps(rows,ensure_ascii=False)+';\n'+body)
