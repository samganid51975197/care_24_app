const main=document.querySelector('main');
if(main){
 const box=document.createElement('section');box.className='beginner-guide';box.setAttribute('aria-label','처음 배우는 분을 위한 안내');
 const add=(tag,text,parent=box)=>{const n=document.createElement(tag);n.textContent=text;parent.append(n);return n;};
 add('h2','처음 배우셔도 괜찮습니다');
 add('p','모집 대상은 베트남 고등학교 졸업자입니다. 의료 지식이나 간병 경험이 없어도 이해할 수 있도록 기초부터 설명합니다. 모르는 내용은 다시 물어보고, 배운 뒤 모형으로 연습하세요.');
 add('p','Đối tượng tuyển dụng: người Việt Nam đã tốt nghiệp trung học phổ thông (THPT). Bài học giải thích từ kiến thức cơ bản. Nếu chưa hiểu, hãy hỏi lại và thực hành trên mô hình.').lang='vi';
 add('p','배우는 순서: 그림 보기 → 쉬운 설명 듣기 → 선생님 시범 보기 → 모형으로 연습하기 → 내 말로 설명하기');
 const details=add('details','');add('summary','어려운 말과 도움 요청 문장 보기',details);
 const terms=[['관찰','평소와 달라진 모습을 살펴보는 것'],['기록','본 것과 한 일을 시간과 함께 적는 것'],['보고','환자의 변화를 담당 간호사에게 알리는 것'],['장루','배에 만든, 대변이 나오는 통로'],['욕창·압박손상','한 부위가 오래 눌려 피부와 그 아래가 다친 상태'],['체위 변경','몸의 자세를 바꾸는 것'],['탈수','몸에 필요한 물이 부족한 상태'],['드레싱','상처를 보호하기 위해 붙이거나 덮는 치료 재료']];
 const dl=add('dl','',details);for(const [word,meaning] of terms){add('dt',word,dl);add('dd',meaning,dl);}
 add('p','“다시 천천히 설명해 주세요.” / Xin giải thích lại chậm hơn. “간호사 선생님, 확인 부탁드립니다.” / Nhờ điều dưỡng kiểm tra giúp.',details);
 add('p','기억하세요: 혼자 판단하지 않기 · 모르면 먼저 물어보기 · 이상하면 바로 알리기. 실제 환자에게 하는 일은 병원에서 교육받고 허용된 범위만 수행합니다.',details);
 main.prepend(box);
}
