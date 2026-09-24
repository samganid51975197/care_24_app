import {getClient} from '@/db';
import {withActor,privateJson} from '@/lib/auth';
import {recordPayment} from '@/lib/contribution-ledger.mjs';
import {ensureMonthly,monthlySummary,weeklySummary,totals,accountFor,saveAccount,confirmPayout,koreaToday} from '@/lib/monthly-contribution.mjs';
import catalog from '@/lib/hospital-catalog.json';
export async function GET(req:Request){return withActor(req,async actor=>{
 const db=getClient();await ensureMonthly(db);const url=new URL(req.url),today=koreaToday(),month=url.searchParams.get('month')||today.slice(0,7),year=url.searchParams.get('year')||month.slice(0,4);
 if(!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)||!/^\d{4}$/.test(year))return privateJson({error:'조회 월·연도를 확인하세요.'},400);
 const hospitalId=actor.contextHospitalId;
 const [payments,payouts,hospitals]=await Promise.all([db.execute(hospitalId?{sql:'SELECT * FROM care_payments WHERE hospital_id=? ORDER BY paid_on DESC',args:[hospitalId]}:'SELECT * FROM care_payments ORDER BY paid_on DESC'),db.execute(hospitalId?{sql:'SELECT * FROM care_donation_payouts WHERE hospital_id=?',args:[hospitalId]}:'SELECT * FROM care_donation_payouts'),db.execute('SELECT id,name FROM auth_hospitals ORDER BY name')]);
 const names=new Map(hospitals.rows.map(h=>[String(h.id),String(h.name)])),rows=monthlySummary(payments.rows,payouts.rows,today).map(r=>({...r,hospitalName:names.get(r.hospitalId)||'병원 미지정 — 배분 확인 필요'}));
 const yearly=rows.filter(r=>r.month.startsWith(year+'-')),selected=rows.filter(r=>r.month===month),account=hospitalId?await accountFor(db,hospitalId):null;
 const week=weeklySummary(payments.rows,url.searchParams.get('week')||today);
 const ids=[...new Set([...week.rows,...selected,...yearly].map(r=>r.hospitalId))];
 const selectable=hospitals.rows.flatMap(h=>{const exact=catalog.find(c=>c.id===h.id);const named=catalog.filter(c=>c.name===h.name);const match=exact||(named.length===1?named[0]:null);return match?[{id:match.id,name:h.name}]:[];});
 return privateJson({admin:true,today,month,year,weekRange:week.range,weekly:totals(week.rows),hospitalId:hospitalId||null,hospitalName:hospitalId?names.get(hospitalId):'전국 전체',account,automaticTransferEnabled:false,monthly:totals(selected),annual:totals(yearly),allTime:totals(rows),rows:yearly,byHospital:ids.map(id=>({id,name:names.get(id)||'병원 미지정',weekly:totals(week.rows.filter(r=>r.hospitalId===id)),monthly:totals(selected.filter(r=>r.hospitalId===id)),annual:totals(yearly.filter(r=>r.hospitalId===id))})),entries:payments.rows.map(p=>({id:p.id,reference:p.reference,kind:p.kind,amount:p.amount,paid_on:p.paid_on,hospital_id:p.hospital_id})),hospitals:hospitalId?[]:selectable});
 },true);}
export async function POST(req:Request){return withActor(req,async actor=>{try{if(!actor.contextHospitalId)return privateJson({error:'입금·환불 또는 지급 대상 병원을 선택하세요.'},400);const input=await req.json();if(input.action!=='account'&&String(input.paidOn||'')>koreaToday())return privateJson({error:'미래 날짜를 실제 입금·이체일로 등록할 수 없습니다.'},400);if(input.confirmed!==true)return privateJson({error:'실제 내역 확인이 필요합니다.'},400);const db=getClient();await ensureMonthly(db);if(input.action==='account')await saveAccount(db,actor.contextHospitalId,input,actor.id);else if(input.action==='payout')await confirmPayout(db,actor.contextHospitalId,input,actor.id);else await recordPayment(db,{...input,hospitalId:actor.contextHospitalId},actor.id);return privateJson({ok:true},201);}catch(e){return privateJson({error:e instanceof Error?e.message:'등록하지 못했습니다.'},400);}},true);}
