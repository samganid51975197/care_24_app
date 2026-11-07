# 작업·보고 규칙 (2026-11-07 도근 확정 — 이 파일의 다른 규칙보다 우선)

이 저장소에서 작업하는 모든 AI(Codex, ChatGPT 등)는 아래 규칙을 먼저 따른다.

## 1. 작업 위치 확인 (매 작업 시작 시)
- 이 저장소 `samganid51975197/care_24_app`의 로컬 클론에서만 작업한다.
- 시작할 때 `git remote -v`로 origin이 `https://github.com/samganid51975197/care_24_app`인지 확인하고, `git fetch origin` 후 최신 `origin/main`에서 새 브랜치를 만든다.
- origin이 다르면(예: `scsa-korea/care-app`) 그 폴더에서는 아무것도 고치지 말고, "작업 폴더가 공식 저장소가 아님"이라고 황세옥 님께 알린다.

## 2. 대상 앱과 폴더
| 코드 | 앱 | 폴더 |
| --- | --- | --- |
| GB | 간병24 (구형, com.fivegram.gb) | `legacy-care24/` |
| NW | 전국병원간병 (kr.or.care24.app, care.간병24.com) | `nationwide/` |
| EL | 전문간병사 교육 | `el/` (공식 위치 확정 전 임시) |
| VN | 베트남 간병사 시범사업 (com.scsakorea.careapp) | 이 저장소 아님 — `samganid51975197/care-vietnam` |

모든 요청에는 요청번호 `앱코드-YYYYMMDD-NN`을 붙인다.

## 3. 결과 제출: PR로만
- `main`에 직접 push하지 않는다. 새 브랜치 → 커밋 → push → Pull Request.
- PR 제목 앞에 요청번호를 붙이고, PR 설명에 작업 보고서(양식 B: 대상 앱, 변경 내용, 커밋, 테스트 결과, 서버 반영 = "도근에게 반영 요청", DB 변경, Play 배포 필요 여부, 알려진 문제)를 적는다.
- 운영 기능을 바꾸는 PR은 바뀌는 화면·문구를 PR 설명에 적는다.

## 4. 운영 반영은 도근만
- AI는 운영 서버(114.108.153.57) 접속, 서버 파일 수정, release 생성, 서비스 재시작을 하지 않는다.
- 운영 DB·Supabase에 마이그레이션을 적용하지 않고, 운영 데이터를 지우지 않는다.
- Google Play에 업로드하지 않고, `applicationId`를 바꾸지 않으며, 서명키를 새로 만들지 않는다.
- 배포는 도근이 PR을 검토·머지한 뒤 직접 한다.

## 5. 보고·질문 경로
- 작업 결과는 PR로, 질문·결정 요청은 dokeun98@gmail.com 메일로 보낸다(메일 도구가 있으면 AI가 직접 발송, 제목 앞에 요청번호).
- 메일 도구가 없으면 PR 설명이나 PR 댓글에 남기고, 황세옥 님께는 "PR #번호 확인 요청" 한 줄만 전달하도록 안내한다.
- 카카오톡에 붙여 넣을 대화 내용이나 긴 초안은 만들지 않는다.

## 6. 현재 결정 사항
- 전문간병사 교육은 EL로 옮긴다(2026-11-05 황세옥 님 결정). `nationwide/web/public/education/`에는 새 기능을 추가하지 않는다.
- 민간자격 등록이 끝나기 전에는 '자격시험', '1급·2급', '자격 발급' 표현을 쓰지 않는다('합격/불합격'은 실습 평가 결과에만).
- 비밀번호, API 키, 서명키, Supabase `service_role` 키, 환자 정보는 커밋·PR·메일·대화에 쓰지 않는다.
- 가비아 DNS의 `@`, `www` 레코드는 바꾸지 않는다.

---

# Approved Care24 branding

The user approved the header on 2026-09-13 and explicitly requested that it remain unchanged unless they ask.
- Left: cropped Care24 logo inside a thin #71958d border with 4px corners and 3px padding (2px on narrow mobile).
- Border outer height matches the two-line text: desktop 40px, mobile 36px, narrow mobile 32px.
- Right first line: hospital name + ` 통합간병 앱`; current hospital is `분당서울대학교병원`.
- Right second line: `대한노인돌봄서비스협회 관리`.
- Logo click links to the nationwide hospital site. Never navigate on hover.
- Preserve this layout across hospitals. Do not add another native app branding header or let the fixed home panel cover the web header.
- Verify the actual rendered header after related edits; source diffs alone do not show the user the result.

# Hospital room layout authority
- Current room and bed geometry is a basic example, not a surveyed hospital plan.
- Each hospital app representative will inspect the site and provide a drawn floor plan to the team lead.
- Reconfigure that hospital's rooms, beds, doors, toilets and windows from the supplied plan; do not invent surveyed positions.
- Editable bed numbers and recorded names do not establish the physical accuracy of the example plan.

# Shared hospital app composition
- Use the Bundang Seoul National University Hospital app as the common composition baseline for all hospital apps.
- Preserve the approved Care24 logo and two-line hospital/association branding. Logo alone links to /hospitals, the original regional directory; do not add redundant nationwide back links to hospital introductions.
- Include a brief, source-verified hospital introduction and a "찾아오는 길" section with the hospital-specific address/map search.
- Preserve building → floor/ward → room → bed navigation. Use only that hospital's verified data or clearly marked field-survey placeholders; never copy another hospital's real room/bed/patient assignments.

- In directions, prioritize rail/subway, then intercity bus, city bus, and village bus. Show only verified applicable routes; use map links for current schedules.
- When a hospital operates a shuttle, prioritize shuttle directions above other transport. Include connecting station, exit, boarding point, and the official schedule link. Never infer shuttle availability.

# Hospital caregiver registration policy
- Association (including Care24) and the hospital room nurse must both approve before registration is complete.
- After registration, the caregiver obtains a certificate from the association (including Care24) and wears it as a badge while working.
- Registration approval is not proof that a certificate was issued. Do not fabricate issuance or credential verification.

- On /hospital-registration, finish with the registration/certificate workflow; omit the global privacy-policy footer as requested. Keep /privacy available on other screens.

# Shared document action order
- All hospital document forms use the visible action order: 저장 → 보내기 → 확인. Place close or additional completion controls after these actions. Preserve actual approval and signature requirements; a content review must not imply submission or approval.

- Use 협회(간병24) consistently for the association recipient in every hospital UI; label its send button 협회(간병24) 보내기.

# Patient privacy and contract access
- Patients/guardians may create an initial care request; caregivers can view consented care needs and apply from the board.
- Mask patient names in board responses (홍길동 → 홍○동; two characters → 김○). Do not send contact details, exact rooms, contract content, fees, banking data or financial totals to non-admin accounts.
- Only admins may retrieve/edit private records or enter/edit contract amounts. Enforce this on the server, including attachments and owner access; UI hiding is insufficient.

- The board may show patient birth year and age. Full date of birth is not currently collected; never invent missing month/day.

# Deployment completion preference (2026-09-24) — 폐기
- 2026-11-07부로 폐기. 운영 서버·APK 반영은 AI가 하지 않고, 맨 위 "작업·보고 규칙" 4번에 따라 도근이 PR 머지 후 수행한다.
