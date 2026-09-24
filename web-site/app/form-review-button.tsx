"use client";
import {useRef,useState} from 'react';
import {Button} from '@/components/ui/button';

export default function FormReviewButton({disabled=false}:{disabled?:boolean}) {
 const dialog=useRef<HTMLDialogElement>(null);
 const [items,setItems]=useState<{label:string;value:string}[]>([]);
 return <><Button type="button" variant="outline" disabled={disabled} onClick={event=>{
  const form=event.currentTarget.form;
  if(!form)return;
  const entries:{label:string;value:string}[]=[];
  for(const element of Array.from(form.elements)){
   if(!(element instanceof HTMLInputElement||element instanceof HTMLTextAreaElement||element instanceof HTMLSelectElement))continue;
   if(!element.name||['hidden','password','file','submit','button'].includes(element.type))continue;
   if(element instanceof HTMLInputElement&&['radio','checkbox'].includes(element.type)&&!element.checked)continue;
   const label=Array.from(element.labels||[]).map(label=>label.textContent?.trim()).filter(Boolean).join(' ')||'작성 내용';
   const value=element instanceof HTMLSelectElement?element.selectedOptions[0]?.textContent||'':element.value;
   entries.push({label,value:value||'미작성'});
  }
  setItems(entries);dialog.current?.showModal();
 }}>확인</Button><dialog ref={dialog} className="form-review-dialog" aria-label="작성 내용 확인"><h3>작성 내용 확인</h3><p>현재 입력한 내용입니다. 저장·보내기 결과는 완료 안내에서 확인해 주세요.</p><dl>{items.map((item,index)=><div key={index}><dt>{item.label}</dt><dd>{item.value}</dd></div>)}</dl><Button type="button" onClick={()=>dialog.current?.close()}>닫기</Button></dialog></>;
}
