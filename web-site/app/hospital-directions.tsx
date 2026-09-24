export default function HospitalDirections({name,address,region,city}:{name:string;address?:string;region?:string;city?:string}) {
 const bundang=name==='분당서울대학교병원';
 const location=address||(bundang?'경기도 성남시 분당구 구미로173번길 82':'');
 const query=encodeURIComponent([name,location||[region,city].filter(Boolean).join(' ')].filter(Boolean).join(' '));
 const linkStyle={display:'block',padding:'14px 18px',border:'1px solid #096b70',borderRadius:10,color:'#075b60',background:'#fff',fontWeight:700,textDecoration:'none'};
 return <section aria-labelledby="hospital-directions-title" style={{margin:'20px 0',padding:20,border:'1px solid #b8d5cf',borderRadius:16,background:'#f5faf8'}}>
  <h2 id="hospital-directions-title" style={{fontSize:22,fontWeight:800}}>찾아오는 길</h2>
  <p style={{margin:'10px 0',fontWeight:700}}>{name}</p>
  {location&&<p>{location}</p>}
  <p style={{margin:'12px 0',lineHeight:1.7}}>아래 지도에서 병원을 선택한 뒤 ‘도착’ 또는 ‘길찾기’를 누르세요. 출발지를 입력하고 대중교통을 선택하면 지하철·버스 경로를 확인할 수 있습니다.</p>
  <div style={{display:'flex',flexWrap:'wrap',gap:10}}>
   <a style={linkStyle} href={'https://map.naver.com/p/search/'+query} target="_blank" rel="noopener noreferrer">네이버지도 · 지하철·버스 길찾기 ↗</a>
   <a style={linkStyle} href={'https://map.kakao.com/link/search/'+query} target="_blank" rel="noopener noreferrer">카카오맵 · 지하철·버스 길찾기 ↗</a>
  </div>
  <p style={{marginTop:12,fontSize:14}}>지하철·시내버스·마을버스의 최신 경로와 운행시간은 지도에서 확인하세요. 시외버스는 도착 터미널에서 병원까지의 경로를 검색하세요.</p>
  {bundang&&<p style={{marginTop:8}}><a href="https://www.snubh.org/index.do" target="_blank" rel="noopener noreferrer" style={{textDecoration:'underline'}}>분당서울대학교병원 공식 안내 ↗</a></p>}
 </section>;
}