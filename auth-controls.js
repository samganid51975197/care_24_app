async function refreshAccountControls(){
 const status=document.querySelector('#accountStatus'),login=document.querySelector('#accountLogin'),logout=document.querySelector('#accountLogout');if(!status||!login||!logout)return;
 login.href='#admin';login.textContent='관리자 로그인';logout.href='#admin';
 login.onclick=()=>{if(location.hash==='#admin')admin()};
 logout.onclick=async e=>{e.preventDefault();try{await adminLogout();if(location.hash.split('?')[0]==='#admin')admin();else location.hash='admin'}catch(error){status.textContent=error.message}};
 try{const r=await fetch('/api/session',{cache:'no-store'});if(!r.ok)throw Error();const session=await r.json();status.textContent=session.admin?'관리자 로그인 중':'관리자 로그인이 필요합니다';login.hidden=!!session.admin;logout.hidden=!session.admin}
 catch{status.textContent='로그인 상태 확인 필요';login.hidden=false;logout.hidden=false}
}
addEventListener('pageshow',refreshAccountControls);addEventListener('hashchange',refreshAccountControls);
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')refreshAccountControls()});refreshAccountControls();
