# 운영본 추적 근거

확인일: 2026-09-25. 서버는 읽기만 조사했습니다.

1. systemd WorkingDirectory와 `99-education-203.conf`에서 `/opt/care24/releases/20260924-education-203`를 확인했습니다.
2. 운영 서버의 `.next/server`, `.next/static`에서 map을 제외한 310개 파일 지문을 조사했습니다. `C:\care24\care24-education-release.tar.gz`의 같은 파일 **310/310개가 SHA-256 일치**했습니다. 압축파일은 빌드 결과물이므로 GitHub에 포함하지 않습니다.
3. 운영 public 파일 중 APK를 제외한 **51/51개**를 새 `web/public`에 확보하고 운영 지문과 일치 확인했습니다. 로컬 현재 파일 47개, 배포 묶음에서 가져온 2개, 운영 서버에서 읽기만 하여 가져온 2개입니다. 세부 출처는 `public-file-provenance.json`을 기준으로 합니다.
4. 기존 로컬 빌드의 `.next/server/chunks/167.js`와 static `8669` JS에서 교육 메뉴 문구 3개를 배포 당시 값으로 되돌리면, 서버와 일치한 압축파일의 두 JS와 **바이트 단위 일치**합니다. 따라서 `web/app/caregiver-guide.tsx`, `web/app/hospital-home.tsx`의 해당 문구만 배포 당시 값으로 복원했습니다. 원본 폴더는 수정하지 않았습니다.
5. 위 소스를 새 폴더에서 Next.js 16.2.6으로 빌드했습니다. webpack, TypeScript 검사, 31개 정적 페이지 생성이 성공했습니다. 빌드 경로와 dependency 경로 등이 달라 새 빌드 전체의 바이트 일치를 확인한 것은 아닙니다. 이 확인은 출처 추적의 근거이지 원본 Git 커밋의 완전한 재현 증명은 아닙니다.
6. 기반 Git 커밋 `21c390daa09bd5502e2d07702bba3075bc54d308`은 GitHub `samganid51975197/care_24_app` API로 존재 확인했습니다. 이후 교육 변경과 앱 2.0.5 변경은 커밋되지 않은 로컬 변경이므로 기존 커밋을 전체 운영본이라고 표기하지 않습니다.

## APK 게시 근거

| 파일 | 서버와 PC 파일이 동일한 SHA-256 |
|---|---|
| care-24-v2-2.0.3.apk | `edef1ddf225bdfaffac76e8c7c61609a105525a9fbfe1212315d1a5fafe660ca` |
| care-24-v2-2.0.4.apk | `55747602bb8e174c661da8b0cae997f57e0e3b0730bf8a4647f549dc0d0ee691` |

로컬 기존 2.0.5 debug APK 지문: `946ee3c69a5a341fbf8646ef60f4aa7e65baadd0d17399e19e0377eb90099688`。output-metadata.json도 versionCode 20005 / versionName 2.0.5로 일치합니다. 2.0.5 서버 게시나 Play 배포는 확인 불가입니다.

APK 인증서 지문은 기존 APK의 APK Signature Scheme v2 블록에서 공개 인증서를 읽어 SHA-256으로 계산했습니다. 개인 서명키와 비밀번호는 읽거나 출력하지 않았습니다. 세 APK의 지문이 같으며 값은 STATUS.md에 기록했습니다. APK/서명키 자체는 저장소에 포함하지 않습니다.

## 가져오지 않은 것과 포장 변경

- 모든 `.env`·비밀 파일·DB·SQL·uploads·APK/AAB·빌드 결과·PC 설정을 제외했습니다.
- `.sql`에는 초기화용 스키마도 섞여 있었지만 사용자 요청대로 전부 제외했습니다. 다른 확장자로 우회하지 않았습니다.
- 기존 Sites 전용 설치/lint 호출은 일반 명령으로 정리했고, 제외된 DB 초기화 명령은 package.json에서 제거했습니다.
- 테스트용 고정 비밀번호는 실행마다 무작위 생성하도록 바꿨습니다. 운영 비밀번호를 발견했다는 의미는 아닙니다.
- 원본 웹/앱 폴더와 기존 GitHub 저장소는 그대로 두었습니다.
