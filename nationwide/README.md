# 전국병원간병 (신규)

현재 운영 중인 간병24 전국 병원 서비스입니다. 운영 주소: `https://care.간병24.com` (`care.xn--24-ts1i486c.com`)

| 폴더 | 내용 |
|---|---|
| `web/` | 운영 웹 소스 (Next.js, Node.js 22.13 이상). 2026-09-26 운영 release `20260926-sharing-access` 기준 |
| `android/` | Play 앱 "전국병원간병" — `applicationId kr.or.care24.app`, 3.0.1 (versionCode 30001) |
| `deploy/` | 수동 배포 절차, 설정 예시, 공개 파일 지문 |
| `STATUS.md` | 운영 현황과 기능별 변경·검증·배포 기록 (변경 시 반드시 갱신) |
| `docs/` | care24-v3 저장소의 인계 문서 원본 |

## 웹 실행

```bash
cd web
npm ci
npm run build
npm run start
```

실제 로그인·자료 저장에는 별도로 전달받는 서버 환경변수·DB·암호화 키·업로드 저장소가 필요합니다. 빈 DB를 만드는 SQL은 요청에 따라 포함하지 않았으며, 구조는 `web/db/schema.ts`에 있습니다.

## Android

Android Studio에서 `android/`를 엽니다. 변경 이력과 남은 문제(네이버 앱 기본 브라우저 인증서 오류 등)는 [`android/HANDOFF-v3.0.1.md`](android/HANDOFF-v3.0.1.md)를 먼저 읽어 주세요.
