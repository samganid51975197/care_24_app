"use client";
import {useState} from 'react';

type SignupResult={ok?:boolean;message?:string;error?:string;notification?:'accepted'|'disabled'|'attention'};

export default function Signup(){
 const[message,setMessage]=useState(''),[done,setDone]=useState(false),[busy,setBusy]=useState(false),[notification,setNotification]=useState<SignupResult['notification']>();
 async function submit(e:React.FormEvent<HTMLFormElement>){
  e.preventDefault();
  const form=e.currentTarget,b=Object.fromEntries(new FormData(form));
  if(b.password!==b.confirm){setMessage('비밀번호 확인이 일치하지 않습니다.');return;}
  setBusy(true);setMessage('');
  try{
   const r=await fetch('/api/auth/signup',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(b)});
   const d:SignupResult=await r.json();
   if(!r.ok)throw Error(d.error||'가입 승인 신청을 처리하지 못했습니다.');
   setDone(true);setNotification(d.notification);setMessage(d.message||'가입 승인 신청이 접수되었습니다.');
  }catch(e){setMessage(e instanceof Error?e.message:'가입 승인 신청을 처리하지 못했습니다.');}
  finally{setBusy(false);}
 }
 return <main className="auth-page"><section className="auth-card">
  <h1>간병24 가입 신청</h1>
  <p>관리자가 신청 역할과 병원 소속을 확인한 뒤 승인합니다.</p>
  {!done&&<form onSubmit={submit}>
   <label>이름<input name="name" required maxLength={80} autoComplete="name"/></label>
   <label>아이디<input name="username" required minLength={4} maxLength={32} pattern="[a-zA-Z0-9][a-zA-Z0-9_.\-]{3,31}" autoComplete="username"/><small>영문·숫자와 . _ - 사용, 4~32자</small></label>
   <label>비밀번호<input name="password" type="password" required minLength={12} maxLength={128} autoComplete="new-password"/><small>12자 이상, 다른 사이트와 다른 비밀번호</small></label>
   <label>비밀번호 확인<input name="confirm" type="password" required minLength={12} maxLength={128} autoComplete="new-password"/></label>
   <label>신청 역할<select name="role" defaultValue="caregiver"><option value="caregiver">간병인</option><option value="hospital">병원 담당자</option></select></label>
   <label>소속 또는 근무 예정 병원<input name="hospital" required maxLength={120}/></label>
   <button disabled={busy}>{busy?'신청 중…':'가입 승인 신청'}</button>
  </form>}
  <p role={done?'status':'alert'}>{message}</p>
  {done&&<section aria-label="신청 접수 결과">
   <h2>승인 대기 목록에 접수되었습니다</h2>
   <p>관리자는 관리자 화면의 ‘가입 승인·소속 관리’에서 신청을 확인합니다.</p>
   {notification==='accepted'&&<p>관리자 문자 발송이 접수되었습니다. 휴대전화 도착까지 확인된 상태는 아닙니다.</p>}
   {notification==='disabled'&&<p>문자 알림이 현재 꺼져 있어 자동 문자는 발송되지 않았습니다. 아래 연락처로 신청 사실을 알려 주세요.</p>}
   {notification==='attention'&&<p>관리자 문자 발송을 확인하지 못했습니다. 신청은 승인 대기 목록에 저장되어 있습니다. 아래 연락처로 신청 사실을 알려 주세요.</p>}
  </section>}
  <aside aria-label="가입 신청 문의">
   <h2>가입 신청 문의</h2>
   <p>간병24 <a href="tel:16005197">1600-5197</a> · <a href="tel:01043849413">010-4384-9413</a></p>
   <p>협회 관리자 <a href="tel:16005197">1600-5197</a> · <a href="tel:01051155197">010-5115-5197</a></p>
  </aside>
  <a href="/login">로그인으로 돌아가기</a>
 </section></main>;
}
