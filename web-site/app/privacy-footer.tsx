"use client";
import {usePathname} from 'next/navigation';
export default function PrivacyFooter(){
 const path=usePathname();
 if(path==='/hospital-registration')return null;
 return <footer className="privacy-footer"><a href="/privacy">개인정보처리방침</a></footer>;
}
