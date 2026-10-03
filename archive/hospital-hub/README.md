# care-24 v2 · 간병24 통합접수

기존 주소를 유지하는 전국 병원 간병의뢰·신청 통합 웹앱입니다. 변경 내역은 CHANGELOG.md를 참고하세요.

접수 자료는 서버 D1에 저장됩니다. 통합 접수함과 수정 API는 관리자 권한을 검사합니다. 상황판 API는 위치와 일정 등 필요한 항목만 제공합니다. 브라우저의 이전 로컬 접수 내역은 별도로 표시됩니다.

Build: `node build-worker.mjs`

Checks: `node tests/ward-board.mjs` and `node tests/hospital-home.mjs`.

## 최신 재활교육 (2026-09-21)

환자·보호자 간병인 의뢰 상단의 **재활치료(환자)**를 누르면 별도 화면에서 교육을 볼 수 있습니다. 총 16개 과목에 연하 재활치료(삼킴장애)가 포함됩니다. 기존 언어·삼킴 과목에서도 상세 안내로 이동합니다.

- 교육 목차: `#rehabilitation`
- 연하 재활치료: `#rehabilitation/swallow`
- 안내: [docs/REHABILITATION.md](docs/REHABILITATION.md)
- 운영 사이트: https://care24-hospital-hub.samganid5197259555.chatgpt.site

이 디렉터리에서 `python -m http.server 8092 --bind 127.0.0.1`을 실행하고 `http://127.0.0.1:8092/#rehabilitation`을 열면 정적 교육 화면을 확인할 수 있습니다. 접수·인증 API는 정적 서버에서 작동하지 않으며 Worker와 D1 환경이 필요합니다. `node build-worker.mjs`는 `dist/server/index.js`와 정적 자산을 생성합니다. 운영 환경에는 `.openai/hosting.json`의 바인딩과 `drizzle/` 마이그레이션을 별도로 적용해야 합니다.

운영 데이터·로그인 비밀번호는 포함하지 않습니다. 생성 가능한 `dist`는 Git 추적 대상에서 제외합니다. 원본 Sites 소스 커밋: `d16b28d0f5df770d6ef60479415849c8c204ad85`.
