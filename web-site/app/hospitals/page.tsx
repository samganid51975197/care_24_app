import { redirect } from 'next/navigation';
export const metadata={title:'전국병원 통합간병 앱'};
export default function Page(){redirect('/regional/index.html#hospitals');}
