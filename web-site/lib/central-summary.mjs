import {requestBoardStatus} from './request-board-status.mjs';
export function centralSummary(requests,workflows,hospitals,catalog){
 const groups=new Map();const blank=()=>({total:0,requesting:0,matching:0,matched:0,dailyFee:0,feeKnown:0,feeUnknown:0});
 const totals=blank();
 for(const r of requests){
  const id=r.hospitalId||'unassigned';const registered=hospitals.find(h=>h.id===id);const matches=catalog.filter(h=>h.name===registered?.name);const hospital=catalog.find(h=>h.id===id)||(matches.length===1?matches[0]:null);
  if(!groups.has(id))groups.set(id,{id,name:registered?.name||hospital?.name||'병원 소속 미지정',kind:hospital?.type||hospital?.kind||'미분류',...blank()});
  const group=groups.get(id),w=workflows.get(r.id),status=requestBoardStatus(r,w);
  for(const target of [group,totals]){target.total++;if(['requesting','matching','matched'].includes(status))target[status]++;}
  if(status!=='matched')continue;
  // Prefer the finalized agreement. Never count a draft or both parties' fees.
  const content=w?.patientContract||'';
  const lines=content.split(/\r?\n/).filter(line=>/^간병비:/.test(line));
  let fee=null;
  if(content){const m=lines.length===1?lines[0].match(/^간병비:\s*([\d,]+)원\s*\/\s*지급 단위:\s*24시간\s*$/):null;if(m)fee=Number(m[1].replaceAll(',',''));}
  else if(['1일','24시간','일'].includes(r.feePeriod)&&/^\d+(?:,\d{3})*$/.test(String(r.careFee||'')))fee=Number(String(r.careFee).replaceAll(',',''));
  if(!Number.isSafeInteger(fee)||fee<=0)fee=null;
  for(const target of [group,totals]){if(fee===null)target.feeUnknown++;else{target.feeKnown++;target.dailyFee+=fee;if(!Number.isSafeInteger(target.dailyFee))throw Error('금액 합계를 확인하세요.');}}
 }
 return {totals,hospitals:[...groups.values()].sort((a,b)=>b.total-a.total)};
}