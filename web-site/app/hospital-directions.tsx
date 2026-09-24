import {MapPin,TrainFront,ArrowUpRight} from 'lucide-react';
import styles from './hospital-directions.module.css';
export default function HospitalDirections({name,address,region,city}:{name:string;address?:string;region?:string;city?:string}) {
 const bundang=name==='분당서울대학교병원';
 const location=address||(bundang?'경기도 성남시 분당구 구미로173번길 82':'');
 const query=encodeURIComponent([name,location||[region,city].filter(Boolean).join(' ')].filter(Boolean).join(' '));
 return <section aria-labelledby="hospital-directions-title" className={styles.card}>
  <span className={styles.badge}><TrainFront size={16} aria-hidden="true"/>간병인 방문 안내</span>
  <h2 id="hospital-directions-title" className={styles.title}><MapPin size={28} aria-hidden="true"/>찾아오는 길</h2>
  <p className={styles.hospital}>{name}</p>
  {location&&<p className={styles.address}>{location}</p>}
  <p className={styles.guide}>지하철·버스로 병원까지<br/>출발지를 입력하고 경로를 확인하세요.</p>
  <div className={styles.links}>
   <a className={styles.naver} href={'https://map.naver.com/p/search/'+query} rel="noopener noreferrer">네이버지도 길찾기<ArrowUpRight size={22} aria-hidden="true"/></a>
   <a className={styles.kakao} href={'https://map.kakao.com/link/search/'+query} rel="noopener noreferrer">카카오맵 길찾기<ArrowUpRight size={22} aria-hidden="true"/></a>
  </div>
  <p className={styles.help}>지도에서 병원 선택 → 도착·길찾기 → 출발지 입력 → 대중교통 선택. 앱으로 돌아오려면 뒤로가기를 누르세요.</p>
  {bundang&&<a className={styles.official} href="https://www.snubh.org/index.do" rel="noopener noreferrer">병원 공식 안내 ↗</a>}
 </section>;
}