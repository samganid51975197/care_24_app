# care-24 v2 · 간병24 통합접수

기존 주소를 유지하는 전국 병원 간병의뢰·신청 통합 웹앱입니다. 변경 내역은 CHANGELOG.md를 참고하세요.

접수 자료는 서버 D1에 저장됩니다. 통합 접수함과 수정 API는 관리자 권한을 검사합니다. 상황판 API는 위치와 일정 등 필요한 항목만 제공합니다. 브라우저의 이전 로컬 접수 내역은 별도로 표시됩니다.

Build: `node build-worker.mjs`

Checks: `node tests/ward-board.mjs` and `node tests/hospital-home.mjs`.
