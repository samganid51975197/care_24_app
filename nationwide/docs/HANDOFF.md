[1] 최종 웹 (가비아 서버)

> 최신 변경: 2026-09-25 사용자 후속 승인으로 교육 메뉴·실습 양식 배치 반영. 현재 release는 `/opt/care24/releases/20260925-education-placement`, 지정 파일은 `99-education-placement.conf`입니다. 아래는 초기 인계 시점 기록이며, 최신 검증·변경 범위는 STATUS.md 상단을 확인하세요. DNS 및 APK는 변경하지 않았습니다.

- 실행 중인 release 폴더: `/opt/care24/releases/20260924-education-203`
- 해당 systemd override 파일: `/etc/systemd/system/care24.service.d/99-education-203.conf`
- 원본 소스 위치: `C:\care-24-v2\web-site` / 기존 저장소 `samganid51975197/care_24_app`, 기반 커밋 `21c390daa09bd5502e2d07702bba3075bc54d308` / 교육 등 추가 변경은 로컬에만 있었음. 새 소스 커밋 `aeb64cbc9dc673be09942f8b7c90543eaf6f6f74`로 정리.
- 출처 확인: 배포 묶음의 빌드 파일 310개가 서버와 지문 일치. 새 저장소의 공개 파일 51개도 서버와 일치. 교육 문구 3개는 운영 당시 값으로 복원. 운영 release 전체와 일치하는 당시 Git 커밋은 확인 불가. 상세는 `deploy/PROVENANCE.md`.
- 운영 주소(server_name): nginx에 `간병24.com`, `www.간병24.com`, `care.간병24.com` 등록. 이 앱의 기준 주소는 `care.간병24.com`.
- CARE24_ORIGIN: `https://care.xn--24-ts1i486c.com`
- assetlinks.json 응답의 package_name: `kr.or.care24.app`
- assetlinks SHA-256: `A0:4A:B6:D8:8D:FA:9E:C5:6C:C6:60:38:2C:6F:BD:15:7A:9D:07:4B:5F:15:2D:CE:20:47:33:47:39:6A:52:7D`
- 로그인 없이 열리는 주소: `/regional/index.html`, `/education/index.html`, `/downloads/index.html`, `/login`, `/signup`, `/privacy`. `/setup`은 초기 관리자 설정 화면 공개 예외이며 설정 인증은 별도 필요.
- 로그인 필요한 주소: `/`, `/hospitals/[id]`, 병원 업무/의뢰/등록/관리자 화면. `/hospitals`는 전국 목록으로 이동하는 코드.
- 환자·보호자 의뢰서 작성: 로그인 필요. 제출 API도 로그인 검사. 비밀번호 찾기 전용 화면은 확인되지 않음.

[2] 최종 앱

- 로컬 폴더 위치: `C:\care-24-v2\care-24-v2-android\care-24-v2-android` → 새 저장소 `android/`
- 바탕으로 한 프로젝트: v2 `care-24-v2-android`
- 바꾼 내용 요약: 기존 2.0.2에서 교육 메뉴/경로와 문구를 추가한 로컬 최신 2.0.5. 이번 인계에서는 새 기능 추가·앱 빌드·서명을 하지 않음.
- 패키지명 / versionCode / versionName: `kr.or.care24.v2` / `20005` / `2.0.5`
- targetSdk / compileSdk / minSdk: `36` / `36` / `26`
- 웹 여는 방식 / 시작 주소: Custom Tabs / `https://care.xn--24-ts1i486c.com/regional/index.html#hospitals`
- 서명키 파일 이름·위치: 기본 debug 키 후보 `C:\Users\samga\.android\debug.keystore`. 파일은 존재하지만 이 키 파일과 APK의 인증서 일치는 확인 불가. release 키 지정은 코드에서 찾지 못함.
- 기존 APK 2.0.3·2.0.4·2.0.5의 공통 서명 인증서 SHA-256: `81:43:0F:D5:57:A0:C3:00:4C:1B:53:C9:93:73:F8:F4:A0:7A:FD:A3:6A:EA:CD:FE:75:B4:C2:E9:33:27:31:C0`
- 이미 배포했는지: 서버 다운로드 파일 2.0.3·2.0.4 게시 확인. 최신 로컬 2.0.5 APK는 PC에 존재. 2.0.5 서버 게시·Play 업로드·테스터 전달·휴대폰 설치는 확인 불가.

[3] 새 저장소

- 저장소 주소: https://github.com/samganid51975197/care24-v3
- 공개 범위: Private 확인
- 첫 커밋 번호: `aeb64cbc9dc673be09942f8b7c90543eaf6f6f74`
- 비밀값·데이터 파일 제외 검사: 지정 파일 유형과 비밀값 패턴 검사 통과. 비밀 파일/DB/SQL/개인 서류/키/APK·AAB/빌드 결과 제외. 테스트 고정 비밀번호는 무작위 생성으로 교체.
- dokeun98 협업자: 2026-09-25 GitHub API에서 수정 권한(write) 확인, 대기 초대 없음. 초대 수락 완료 상태.
- 이번 재확인 시 원격 HEAD: `300deb56693887d561e9aeefd55bf3fbc98efc8a`. 기존 업로드를 확인한 것이며, 이번에 중복 업로드·초대하지 않았음. 이후 사용자 승인으로 인계 문서 3개만 갱신함. 서버·앱 변경 없음.

[4] 추가로 도근 님이 알아야 할 사항

- DNS(`@`, `www`, `care`)·서버 설정·서비스·assetlinks·인증서·기존 저장소는 변경하지 않았음. Play 작업도 하지 않았음.
- Play 내부 테스트 중인 v1 `kr.or.care24.app`과 이 v2 프로젝트는 다른 앱. v1을 이어서 배포하려면 대상 프로젝트·기존 서명과 versionCode 16 이상을 별도로 확인해야 함.
- 웹 재빌드와 TypeScript 검사 통과. 전체 업무의 실사용 검수나 새 빌드 전체의 서버 바이트 동일성은 확인하지 못함.
- 교육 기록의 기기 간 동기화·기관 접수·평가자 인증은 연결 전. 정식 수료·자격 발급과 구분 필요.
- 사용자 요청으로 모든 SQL을 제외하여 빈 DB 자동 초기화 자료가 미포함. 운영 DB/키/업로드 자료는 별도 안전 경로로 관리해야 함.
- APK는 저장소에 없으므로 실제 웹 재배포 때 기존 다운로드 파일 유지가 별도 필요.
- 이후 변경 시 STATUS.md에 코드·검증·배포 상태를 함께 기록할 것.
