"use client";
import {useEffect,useState} from 'react';
import {usePathname} from 'next/navigation';
type User={name:string;role:string;status:string};
export default function AuthGate({children}:{children:React.ReactNode}) {
 const path=usePathname(),[user,setUser]=useState<User|null>(null),[loading,setLoading]=useState(true),[error,setError]=useState('');
 const publicPage=['/login','/signup','/setup','/privacy'].includes(path);
 useEffect(()=>{if(publicPage){setLoading(false);return;}let live=true;setLoading(true);fetch('/api/auth/me',{cache:'no-store'}).then(async r=>{if(!r.ok)throw Error();return r.json();}).then(d=>{if(!live)return;if(!d.user||d.user.status!=='active'){window.location.replace('/login?next='+encodeURIComponent(path));return;}setUser(d.user);setLoading(false);}).catch(()=>{if(live){setError('로그인 상태를 확인하지 못했습니다. 새로고침해 주세요.');setLoading(false);}});return()=>{live=false};},[path,publicPage]);
 async function logout(){const r=await fetch('/api/auth/logout',{method:'POST'});if(r.ok){setUser(null);window.location.replace('/login');}else setError('로그아웃하지 못했습니다. 다시 시도해 주세요.');}
 if(publicPage)return children;
 if(loading||!user)return <main className="auth-card" role="status">{error||'로그인 확인 중…'}</main>;
 return <><div className="account-bar"><div className="account-identity"><span className="account-role">{({admin:'관리자',hospital:'병원 담당자',caregiver:'간병인'} as Record<string,string>)[user.role]}</span><span className="account-name" title={user.name}>{user.name}<span className="account-honorific"> 님</span></span></div><nav aria-label="계정 메뉴">{user.role==="admin"&&<a className="account-link central-admin-link" href="/admin/central" aria-current={path==="/admin/central"?"page":undefined}>중앙관리</a>}<a className="account-link" href="/hospital-registration">병원별 간병인 등록</a><a className="account-link" href="/" aria-current={path==='/'?'page':undefined}>업무 화면</a><button className="account-logout" type="button" onClick={logout}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 4H5v16h4M13 8l4 4-4 4M8 12h13"/></svg>로그아웃</button></nav></div>{error&&<p role="alert">{error}</p>}{children}</>;
}
