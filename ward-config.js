const wardBuildings={"hospital-5": [{"name": "본관", "floors": ["20층", "19층", "18층", "17층", "16층", "15층", "14층", "13층", "12층", "11층", "10층", "9층", "8층", "7층", "6층", "3층", "2층"]}, {"name": "암병원", "floors": ["11층", "10층", "9층", "8층", "7층", "6층", "5층", "3층"]}, {"name": "별관", "floors": ["7층", "6층", "5층", "2층"]}, {"name": "양성자치료센터", "floors": []}]};
wardBuildings.snubh=[{name:"1동",floors:Array.from({length:10},(_,i)=>(i+4)+"층")},{name:"2동",floors:Array.from({length:7},(_,i)=>(i+5)+"층")}];

// 서울성모병원: 사용자가 제공한 12층 비상대피도 기준의 검토용 침대 배치.
// 도면에서 병실 번호와 병실별 침대 1개 표시를 확인했으며, 다른 층은 등록하지 않는다.
const seoulStMary12Rooms=['210','209','208','207','206','205','204','203','202','201','101','102','103','104','105','106','107','108','109','110','211','212','213','214','215','216','116','115','114','113','112','111'];
wardBuildings['seoul-stmary']=[{name:'서울성모병원',floors:['12층'],floorDescriptions:{'12층':'병실 침대 배치안 · 첨부 비상대피도 기준'},roomsByFloor:{'12층':seoulStMary12Rooms},roomBedsByFloor:{'12층':Object.fromEntries(seoulStMary12Rooms.map(room=>[room,1]))},floorRowsByFloor:{'12층':{northWest:['210','209','208','207','206','205','204','203','202','201'],northEast:['101','102','103','104','105','106','107','108','109','110'],southWest:['211','212','213','214','215','216'],southEast:['116','115','114','113','112','111']}},floorNote:'사용자가 제공한 12층 비상대피도에서 병실 번호와 병실당 침대 1개 표시를 바탕으로 정리한 검토용 배치안입니다. 실제 병실 구분·침상 수·가동 여부는 병원 현장 확인 후 확정해 주세요.'}];

wardBuildings['seoul-top']=[{name:'병원 건물',floors:['1층','2층','3층','4층'],floorDescriptions:{'1층':'일반병동','2층':'감염관리병동 · 재활치료실','3층':'일반병동 · 재활치료실','4층':'일반병동'}}];

// 공개 의료기관 정보에서 확인되는 입원실 총 29병상(일반 25·상급 4)과 소재 층(2·3층)만 등록한다. 병실번호·층별 침대 수는 병원 확인 전까지 임의로 만들지 않는다.
wardBuildings['hospital-254']=[{name:'종호빌딩',floors:['2층','3층'],floorDescriptions:{'2층':'2층 입원실 · 병실 번호와 침대 수 확인 필요','3층':'3층 입원실 · 병실 번호와 침대 수 확인 필요'}}];
const hospitalGuides={
 'seoul-top':{address:'서울특별시 동대문구 정릉천동로 102 (제기동)',phone:'02-2088-0580',addressSource:'https://www.nhimc.or.kr/ref/board/hospitalBoard1List.do?page=12',floorSource:'https://ot.chosun.ac.kr/ot/3001/subview.do?enc=Zm5jdDF8QEB8JTJGYmJzJTJGb3QlMkYzOTMlMkYyMzEzOTklMkZhcnRjbFZpZXcuZG8lM0Y%3D',floorNote:'2026년 5월 7일 공개된 병원 채용안내 기준입니다. 지하 1층은 치료실, 지상 1~4층은 병동으로 안내되어 있습니다. 병실 번호·침상 배치와 현재 운영은 병원 확인이 필요합니다.'},
 'snubh':{address:'경기도 성남시 분당구 구미로173번길 82',addressSource:'https://www.snubh.org/dh/en/main/main.do'},
 'hospital-5':{address:'서울특별시 강남구 일원로 81',addressSource:'https://www.samsunghospital.com/' },
 'hospital-254':{address:'경기도 고양시 덕양구 혜음로 9, 2층·3층 (고양동, 종호빌딩)',phone:'031-962-1515',lat:37.7015268,lng:126.9015817,addressSource:'https://hospipedia.com/hospital/goyang-deokyang-seoulsamseongjeonghyeongoegwauiwon',floorSource:'https://www.m7.co.kr/clinic/%EA%B2%BD%EA%B8%B0_%EA%B3%A0%EC%96%91%EB%8D%95%EC%96%91%EA%B5%AC_%EC%84%9C%EC%9A%B8%EC%82%BC%EC%84%B1%EC%A0%95%ED%98%95%EC%99%B8%EA%B3%BC%EC%9D%98%EC%9B%90',floorNote:'공개 의료기관 정보에서 일반입원실 25병상과 상급입원실 4병상, 소재지 2층·3층을 확인했습니다. 병실 번호와 층별 침대 배치는 병원 확인 전까지 표시하지 않습니다.'}
};
