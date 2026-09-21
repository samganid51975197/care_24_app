const wardBuildings={"hospital-5": [{"name": "본관", "floors": ["20층", "19층", "18층", "17층", "16층", "15층", "14층", "13층", "12층", "11층", "10층", "9층", "8층", "7층", "6층", "3층", "2층"]}, {"name": "암병원", "floors": ["11층", "10층", "9층", "8층", "7층", "6층", "5층", "3층"]}, {"name": "별관", "floors": ["7층", "6층", "5층", "2층"]}, {"name": "양성자치료센터", "floors": []}]};
wardBuildings.snubh=[{name:"1동",floors:Array.from({length:10},(_,i)=>(i+4)+"층")},{name:"2동",floors:Array.from({length:7},(_,i)=>(i+5)+"층")}];

wardBuildings['seoul-top']=[{name:'병원 건물',floors:['1층','2층','3층','4층'],floorDescriptions:{'1층':'일반병동','2층':'감염관리병동 · 재활치료실','3층':'일반병동 · 재활치료실','4층':'일반병동'}}];
const hospitalGuides={
 'seoul-top':{address:'서울특별시 동대문구 정릉천동로 102 (제기동)',phone:'02-2088-0580',addressSource:'https://www.nhimc.or.kr/ref/board/hospitalBoard1List.do?page=12',floorSource:'https://ot.chosun.ac.kr/ot/3001/subview.do?enc=Zm5jdDF8QEB8JTJGYmJzJTJGb3QlMkYzOTMlMkYyMzEzOTklMkZhcnRjbFZpZXcuZG8lM0Y%3D',floorNote:'2026년 5월 7일 공개된 병원 채용안내 기준입니다. 지하 1층은 치료실, 지상 1~4층은 병동으로 안내되어 있습니다. 병실 번호·침상 배치와 현재 운영은 병원 확인이 필요합니다.'},
 'snubh':{address:'경기도 성남시 분당구 구미로173번길 82',addressSource:'https://www.snubh.org/dh/en/main/main.do'},
 'hospital-5':{address:'서울특별시 강남구 일원로 81',addressSource:'https://www.samsunghospital.com/' }
};
