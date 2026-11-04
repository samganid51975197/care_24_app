# 2026-09-28 운영 release 복원 기록

## 기준과 범위

- 기준 브랜치: `main`의 `566908d` (PR #5 머지 포함)
- 복원 대상 운영 release: `20260928-remove-hospital-intro`
- 이 문서는 운영 서버 설정을 적용하기 위한 지침이 아니다. 운영 배포와 nginx 변경은 도근의 검토·승인 및 직접 작업으로만 수행한다.

## 확인되어 복원한 항목

| 항목 | 복원 근거 | 반영 파일 |
| --- | --- | --- |
| 전국 병원 목록의 ‘기타’ 병원 구분 필터 | 운영 release `20260928-remove-hospital-intro`와 `main`의 파일 단위 대조 | `public/regional/directory-navigation.js` |
| 전국 병원 목록 스크립트 캐시 버전 | 운영 release `20260928-remove-hospital-intro`와 대조 | `public/regional/index.html` |
| Play 계정 삭제 안내 | 운영 release 원문(띄어쓰기 3곳만 보정) | `public/delete-account.html` |

## 아직 원본을 찾지 못한 항목

- 보험 영수증 및 보험 안내의 정확한 9/28 소스
- 강남세브란스 세부 평면도 전체 연결 코드
- 병원 소개 제거의 전체 범위
- care24tv 기능의 원본 소스
- 서버에서 직접 수정된 `public/delete-account.html`

위 항목은 빌드 산출물에만 남아 있어 원본 소스 형태로 복원할 수 없다. 추정 구현으로 다시 만들지 않고, 도근의 별도 결정 또는 원본 소스를 받은 뒤 처리한다.

## 서버 직접 수정 파일

- `public/regional/directory-navigation.js`: 운영본과 대조하여 `기타` 분류 및 `보건의료원`·`치과병원` 조건만 반영했다. `기타` 지역, `coreRegions`, `matchesRegion`, `의료원` 분류는 운영본에 없으므로 이번 PR에 포함하지 않는다.
- `public/delete-account.html`: 운영 원문을 반영하고 `hospital) and`, `records legally`, `before disposal`의 띄어쓰기만 보정했다.

## nginx 변경 설명

2026-10-20 운영 nginx에 직접 변경이 있었다는 사실만 확인했다. 인증서, 비밀값, 실제 가상호스트 설정은 저장소에 기록하지 않는다. 이번 복원 PR에는 nginx 설정 변경을 포함하지 않는다.

## 검증과 서버 반영

- TypeScript 검사와 회귀 테스트 결과는 PR 설명에 기록한다.
- 서버 반영: **도근에게 반영 요청**. AI는 운영 서버에 접속·수정·release 생성·배포하지 않는다.
