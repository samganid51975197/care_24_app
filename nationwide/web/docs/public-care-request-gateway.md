# 로그인 없는 간병 의뢰: 운영 배포 전 필수 설정

이 변경은 공개 의뢰를 받되, 간병비·계약 항목은 관리자만 작성하도록 차단한다. 의뢰자는 전화번호와 직접 정한 숫자 4자리 비밀번호로 본인 의뢰를 확인·수정·공개 취소할 수 있다. 비밀번호는 scrypt 해시로만 저장하며, 다섯 번 실패하면 15분 잠긴다.

## 가비아 프록시 설정

운영 Node 서버는 외부 인터넷에 직접 공개하지 않고 Nginx만 공개한다. 기존 운영 설정의 `proxy_pass` 주소와 포트(현재 운영은 3100)를 바꾸지 않고, 해당 `location` 블록에 아래 한 줄만 추가한다. 실제 접속 주소 `$remote_addr`가 `X-Care24-Client-IP`로 전달된다.

```nginx
proxy_set_header X-Care24-Client-IP $remote_addr;
```

운영 환경 변수에는 `CARE24_TRUSTED_PROXY=gabia-nginx`와 별도 생성한 `CARE24_REQUEST_ACCESS_PEPPER`가 필요하다. 값은 저장소·PR·채팅에 기록하지 않는다. 두 값 또는 보안 헤더가 없으면 공개 의뢰 API는 실패 닫힘으로 거절한다.

## DB 변경

첫 공개 의뢰 시 `care_request_access` 테이블과 전화번호 해시 인덱스가 생성된다. 운영 DB 적용 전 도근 님이 백업 후 실행한다. 기존 `care_requests` 데이터는 변경하지 않는다.
