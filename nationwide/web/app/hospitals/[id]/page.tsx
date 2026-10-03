import {notFound,redirect} from 'next/navigation';
import catalog from '@/lib/hospital-catalog.json';
import HospitalApp from './hospital-app';
export async function generateMetadata({params}:{params:Promise<{id:string}>}){const {id}=await params;return {title:(catalog.find(h=>h.id===id)?.name||'병원')+' 통합간병 앱'};}
export default async function Page({params}:{params:Promise<{id:string}>}){
 const {id}=await params;
 if(id==='snubh')redirect('/');
 const hospital=catalog.find(h=>h.id===id);
 if(!hospital)notFound();
 if(hospital.name==='혜민병원')redirect('/hospitals/hyemin');
 return <HospitalApp hospital={hospital}/>;
}
