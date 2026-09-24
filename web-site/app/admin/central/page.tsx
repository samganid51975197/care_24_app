import {headers} from 'next/headers';
import {redirect} from 'next/navigation';
import {currentActor} from '@/lib/auth';
import CentralDashboard from './central-dashboard';
export const dynamic='force-dynamic';
export default async function CentralPage(){
 const incoming=await headers();
 const actor=await currentActor(new Request('http://care24.internal/admin/central',{headers:{cookie:incoming.get('cookie')||''}}));
 if(!actor)redirect('/login?next=%2Fadmin%2Fcentral');
 if(actor.status!=='active'||actor.role!=='admin')return <main className="auth-card"><h1>접근할 수 없습니다</h1><p>중앙관리는 관리자만 이용할 수 있습니다.</p><a href="/">업무 화면으로 돌아가기</a></main>;
 return <CentralDashboard/>;
}
