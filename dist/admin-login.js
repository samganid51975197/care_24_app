async function admin(){
 app.innerHTML=`<section class="admin-login card" aria-labelledby="adminLoginTitle"><a class="back" href="#home">← 홈으로</a><img src="assets/care24-brand.webp" alt="간병24" width="56" height="56"><p class="eyebrow">care-24 v2 · 관리자 전용</p><h1 id="adminLoginTitle">관리자 통합 접수함</h1><p>관리자 계정으로 로그인하여 간병의뢰와 간병인 신청을 확인하세요.</p><div id="adminLoginState" role="status">로그인 상태를 확인하고 있습니다…</div><p class="admin-login-note">ChatGPT 로그인 화면에서 계정을 인증합니다. 관리자 권한이 있는 계정만 접수 내용과 연락처를 볼 수 있습니다.</p></section>`;
 const box=document.querySelector('#adminLoginState');
 try{
  const response=await fetch('/api/session',{cache:'no-store'});
  if(!response.ok)throw Error('로그인 상태를 확인하지 못했습니다. 잠시 후 다시 시도해 주세요.');
  const session=await response.json();if(!box.isConnected)return;
  if(session.admin){
   if(new URLSearchParams(location.hash.split('?')[1]||'').get('signedIn')==='1'){openAdminInbox();return}
   box.innerHTML='<p class="notice success">관리자 계정으로 로그인되어 있습니다.</p><button class="primary" id="enterAdminInbox">통합 접수함 열기</button><a class="secondary" href="/signout-with-chatgpt?return_to=%2F%23admin" target="_top">로그아웃 · 다른 계정으로 로그인</a>';
   document.querySelector('#enterAdminInbox').onclick=openAdminInbox;
  }else if(session.authenticated){
   box.innerHTML='<p class="notice error">현재 계정에는 관리자 권한이 없습니다. 관리자 계정으로 다시 로그인해 주세요.</p><a class="primary" href="/signout-with-chatgpt?return_to=%2F%23admin" target="_top">로그아웃 후 관리자 계정으로 로그인</a>';
  }else{
   box.innerHTML='<a class="primary" href="/signin-with-chatgpt?return_to=%2F%23admin%3FsignedIn%3D1" target="_top">ChatGPT 계정으로 관리자 로그인</a>';
  }
 }catch(error){if(!box.isConnected)return;box.innerHTML='<p class="notice error">'+escapeHtml(error.message)+'</p><button class="secondary" id="retryAdminLogin">다시 확인</button>';document.querySelector('#retryAdminLogin').onclick=admin}
}
