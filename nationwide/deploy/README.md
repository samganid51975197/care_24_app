# 배포 인계 — 문서와 예시만 제공

현재 운영 방식은 수동입니다. 이번 정리에서는 서버 파일과 설정을 읽었을 뿐, 배포·설정 변경·재시작을 하지 않았습니다. 아래 순서는 도근 님의 후속 작업을 위한 설명이며 자동 실행 스크립트가 아닙니다.

## 운영 유지 사항

- `간병24.com`의 `@`, `www`는 구형 앱 `com.fivegram.gb`과 관련되어 있으므로 변경하지 않습니다. `care` DNS도 변경하지 않습니다.
- 기존 `/etc/care24/service.env`, `/etc/care24/data-keyring.json`, nginx, systemd, 인증서와 assetlinks.json을 그대로 보존합니다.
- 비밀 환경·암호화 키·DB·업로드 서류는 GitHub에 보관하지 않습니다. 원격 release를 통째로 저장소로 복사하지 않습니다.
- 사용자에게 별도 승인받기 전 서버 변경 작업을 실행하지 않습니다.

## 향후 수동 배포 순서

1. 이번 저장소의 커밋과 STATUS.md를 확인하고 도근 님이 시험용 환경에서 로그인·접수·권한을 검증합니다. 빈 DB 초기화용 SQL은 사용자 요청으로 미포함이므로 별도 승인된 초기화 절차가 필요합니다.
2. `web/`에서 Node.js 22.13 이상, `npm ci`, `npm run build`를 사용합니다. `.env` 등을 빌드 묶음에 넣지 않습니다. `next.config.ts`는 standalone 출력을 사용합니다.
3. `.next/standalone`의 필요한 실행 파일·의존성, `.next/static`, `public`을 묶습니다. 묶기 전 `.env`, DB, uploads, 키, 개인자료가 섞이지 않았는지 별도로 검사합니다. 서버는 Linux이므로 의존성과 네이티브 모듈 호환성을 확인합니다.
4. `public/downloads/`의 기존 APK는 저장소에 없습니다. 새 release에도 다운로드 서비스를 유지하려면 검증된 기존 APK를 별도 안전 경로로 전달합니다. 새 앱 빌드·서명·업로드는 도근 님이 수행합니다.
5. 승인 후 새 `/opt/care24/releases/<release-name>`에 배치하고 이전 정상 release 위치를 기록합니다. 기존 운영 데이터/키/환경은 덮어쓰지 않습니다.
6. 승인된 기존 systemd 구조에 맞춰 실행 폴더 지정 파일을 갱신하고 daemon-reload·서비스 재시작 후 확인합니다. 현재 마지막 설정은 `99-education-203.conf`입니다. 임의의 낮은 번호를 추가하면 기존 높은 번호가 우선할 수 있으므로 적용 결과를 확인해야 합니다.
7. WorkingDirectory, 서비스 상태, 공개 페이지, assetlinks, 로그인·권한을 확인합니다. 실패 시 기록해 둔 이전 release와 설정으로 복구합니다.
8. STATUS.md에 실제 배포 커밋·release·확인 결과를 기록합니다. 서버 폴더명만으로 동일성을 주장하지 말고 배포 지문도 기록합니다.

환경 변수 이름은 소스의 `process.env` 사용 부분에서 확인하세요. 값은 기존 운영 담당자가 별도 전달하며, 이 문서에 비밀값을 적지 않습니다. 코드상 주요 이름은 `CARE24_ORIGIN`, `CARE24_DATABASE_URL`, `CARE24_KEY_FILE`, `CARE24_UPLOAD_DIR`입니다.

`nginx.example.conf`와 `systemd.example.conf`는 설명용이며 운영 설정을 대신하지 않습니다. 자동 적용하거나 실제 설정 위에 복사하지 마세요.
