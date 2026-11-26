import {withActor,scope,ownership,privateJson,type Actor} from '@/lib/auth';
import {getDb} from '@/db';
import {applications} from '@/db/schema';
import {desc} from 'drizzle-orm';

const fields={
  id:applications.id,
  applicantName:applications.applicantName,
  applicantPhone:applications.applicantPhone,
  applicantBirth:applications.applicantBirth,
  applicantGender:applications.applicantGender,
  careerYears:applications.careerYears,
  qualification:applications.qualification,
  preferredDate:applications.preferredDate,
  applicationNote:applications.applicationNote,
  status:applications.status,
};
const text=(value:unknown,max:number)=>String(value??'').trim().slice(0,max);
function validate(body:Record<string,unknown>){
  const profile={
    applicantName:text(body.applicantName,80),
    applicantPhone:text(body.applicantPhone,30),
    applicantBirth:text(body.applicantBirth,10),
    applicantGender:text(body.applicantGender,10),
    careerYears:text(body.careerYears,80),
    qualification:text(body.qualification,300),
    preferredDate:text(body.preferredDate,10),
    applicationNote:text(body.applicationNote,2000),
  };
  if(!profile.applicantName||!/^\+?[0-9 ()-]{8,20}$/.test(profile.applicantPhone)||!/^\d{4}-\d{2}-\d{2}$/.test(profile.applicantBirth)||!['남','여'].includes(profile.applicantGender)||!profile.careerYears||!/^\d{4}-\d{2}-\d{2}$/.test(profile.preferredDate))throw Error('이름, 연락처, 생년월일, 성별, 경력과 배정 희망일을 확인해 주세요.');
  const birth=new Date(`${profile.applicantBirth}T00:00:00`);
  if(Number.isNaN(birth.getTime())||birth.toISOString().slice(0,10)!==profile.applicantBirth||birth.getTime()>Date.now())throw Error('생년월일을 확인해 주세요.');
  const preferredDate=new Date(`${profile.preferredDate}T00:00:00`);
  if(Number.isNaN(preferredDate.getTime())||preferredDate.toISOString().slice(0,10)!==profile.preferredDate)throw Error('배정 희망일을 확인해 주세요.');
  return profile;
}
export async function GET(req:Request){return withActor(req,async(actor:Actor)=>{
  if(actor.role!=='caregiver')return privateJson({error:'간병인 본인만 프로필을 확인할 수 있습니다.'},403);
  const rows=await getDb().select(fields).from(applications).where(scope(applications,actor)).orderBy(desc(applications.id)).limit(100);
  return privateJson({profiles:rows});
});}
export async function POST(req:Request){return withActor(req,async(actor:Actor)=>{
  if(actor.role!=='caregiver')return privateJson({error:'간병인만 프로필을 등록할 수 있습니다.'},403);
  try{
    const body=await req.json() as Record<string,unknown>;
    if(body.personalInfoConsent!==true)return privateJson({error:'프로필 개인정보가 의뢰 신청 검토를 위해 관리자에게 전달되는 데 동의해 주세요.'},400);
    const profile=validate(body);
    const [created]=await getDb().insert(applications).values({...profile,caregiverHandwriting:'',status:'saved',sentTargets:'',providerContractVersion:'',...ownership(actor)}).returning({id:applications.id});
    return privateJson({profile:{id:created.id,...profile,status:'saved'}},201);
  }catch(error){return privateJson({error:error instanceof Error?error.message:'프로필을 저장하지 못했습니다.'},400);}
});}
