"use client";
import {useState} from 'react';
import {Button} from '@/components/ui/button';
import {Dialog,DialogTrigger,DialogContent,DialogTitle,DialogDescription,DialogClose} from '@/components/ui/dialog';
export default function CaregiverGuide({onRegister,onRequests,hospitalId,hospitalName}:{onRegister:()=>void;onRequests:()=>void;hospitalId:string;hospitalName:string}){
 const [open,setOpen]=useState(false);
 return <Dialog open={open} onOpenChange={setOpen}><DialogTrigger asChild><Button type="button"><strong>간병 신청</strong><small>신청 방법 · 신청서 작성</small></Button></DialogTrigger><DialogContent className="caregiver-guide" showCloseButton={false}><div className="caregiver-guide-heading"><DialogTitle>간병인용 · 간병 신청 방법</DialogTitle><DialogClose asChild><Button type="button" variant="outline">닫기</Button></DialogClose></div><DialogDescription>공개된 환자 의뢰를 확인하고 다음 순서로 신청하세요.</DialogDescription><ol>
 <li><b>환자 의뢰번호를 누르세요.</b><p>예를 들어 1동 목록의 ‘13’번을 누르면 ‘신청 및 계약 진행’이 열립니다.</p></li>
 <li><b>본인 프로필과 신청 내용을 입력하세요.</b><p>본인 간병인 프로필을 선택하고, 근무 가능한 일정과 신청 내용을 적습니다.</p></li>
 <li><b>‘저장’ 후 ‘협회(간병24) 보내기’를 누르세요.</b><p>저장은 임시 저장입니다. 보내기를 눌러야 협회(간병24)에 접수됩니다.</p></li>
 <li><b>협회의 검토와 선정 결과를 기다리세요.</b><p>신청서를 보냈다고 바로 근무가 확정되는 것은 아닙니다.</p></li>
 <li><b>계약서를 작성·제출하고 통보를 확인하세요.</b><p>선정 후 계약서를 별도로 작성·제출하고, 협회(간병24)가 통보한 계약과 근무 일정을 확인합니다.</p></li>
 <li><b>유니폼과 명찰을 받고 약속한 시간에 근무하세요.</b><p>유니폼과 명찰을 수령한 후, 약속한 날짜와 시간에 ‘근무 시작 확인’을 누르고 ‘간병일지 작성’으로 환자 상태와 간병 내용을 기록합니다.</p></li>
 </ol><section aria-label="병원별 간병인 등록"><h3>병원별 간병인 등록 · 신청/승인</h3><p>협회(간병24)와 해당 병원 병실 담당간호사의 승인이 모두 필요합니다. 병원별 등록은 개별 환자의 매칭·계약과 별도 절차입니다.</p><a className="account-link" href={"/hospital-registration?hospital="+encodeURIComponent(hospitalId)+"&name="+encodeURIComponent(hospitalName)}>이 병원 등록 신청·승인 현황 확인 →</a></section><p className="caregiver-guide-note">본인 프로필이 없다면 먼저 ‘간병인 신청서 작성’에서 등록하세요.</p><div className="caregiver-guide-actions"><Button type="button" onClick={()=>{setOpen(false);onRequests()}}>공개 의뢰 보기</Button><Button type="button" variant="outline" onClick={()=>{setOpen(false);onRegister()}}>간병인 신청서 작성</Button></div></DialogContent></Dialog>
}
