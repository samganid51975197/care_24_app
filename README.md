# 간병24 통합 저장소

이 저장소에는 **두 가지 앱만** 최신 상태로 둡니다.

| 폴더 | 앱 | 상태 |
|---|---|---|
| [`nationwide/`](nationwide/) | **전국병원간병** (신규, 현재 운영) | 운영 웹 소스 + Android 3.0.1 |
| [`legacy-care24/`](legacy-care24/) | **구 간병24 앱** (`com.fivegram.gb`, 간병24.com) | Android 4.0.2 |
| [`archive/`](archive/) | 참고용 보관 자료 (간병24 1.1.5, hospital-hub) | 실행·배포 대상 아님 |

## 어디를 고치면 되나요?

- 병원 화면·의뢰·신청·교육 등 **웹 기능** → `nationwide/web/`
  - Android 앱은 운영 웹(`https://care.간병24.com`)을 여는 방식이므로, 화면 수정은 대부분 웹만 배포하면 앱에도 반영됩니다.
- **Android 앱**(Play "전국병원간병", `kr.or.care24.app`) → `nationwide/android/`
  - 다음 버전은 versionCode **30002 이상**이어야 합니다.
- **구 간병24 앱**(Play "간병24", `com.fivegram.gb`) → `legacy-care24/android/` (다음 버전 versionCode 40005 이상)
- 운영 현황·배포 기록 → `nationwide/STATUS.md` (코드를 바꾸면 함께 갱신)
- 수동 배포 방법 → `nationwide/deploy/README.md`

## 주의

- 서명키·비밀번호·`.env`·DB·업로드 서류는 절대 커밋하지 않습니다 (`.gitignore`로 차단).
- 가비아 DNS의 `@`, `www`는 구형 서비스용이므로 수정하지 않습니다.
- 공통 작업 규칙은 [`AGENTS.md`](AGENTS.md)를 따릅니다.

## 저장소 정리 이력 (2026-10-03)

- 기존 `samganid51975197/care24-v3`(운영 웹 소스, 2026-09-26)과 `samganid51975197/care24`의 고유 내용을 이 저장소로 모았습니다.
- `care-24-v2-android`(2.0.5)는 3.0.1이 그 코드를 모두 포함하므로 삭제했습니다.
- 이전 `web-site/`는 운영 서버보다 오래된 소스여서 `nationwide/web/`(운영 기준)으로 교체했습니다. 그중 아직 운영에 반영되지 않은 비밀번호 재설정·이메일 설정 코드는 브랜치 `archive/web-site-2026-10-01`에 그대로 남겨 두었습니다.
- 구 간병24 앱(`com.fivegram.gb`) 소스를 도근 님 PC에서 가져와 `legacy-care24/`에 넣었습니다. 업로드 키·키 비밀번호·인증서·local.properties는 제외했습니다.
- 간병24 1.1.5(분당서울대, `kr.or.care24.app`)는 전국병원간병 3.0.x로 대체되어 `archive/care24-1.1.5/`로 옮겼습니다.
- 삭제된 파일은 모두 Git 기록에 남아 있어 언제든 되살릴 수 있습니다.
