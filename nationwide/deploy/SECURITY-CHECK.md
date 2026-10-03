# 업로드 전 검사

2026-09-25, 새 `care24-v3` 파일만 검사했습니다.

- `.env`, service.env, keyring JSON, 서명키, SSH 키, local.properties, keystore.properties: 업로드 대상 0개.
- DB, SQLite, SQL, uploads, private-access: 업로드 대상 0개.
- APK/AAB, node_modules, .next, build, dist, .gradle: 업로드 대상 0개.
- 소스의 개인키 본문, GitHub/서비스 토큰 형식, 자격증명이 들어간 URL, 직접 지정된 비밀번호·인증키·토큰, JWT 형식: 검사 후 미해결 항목 0개.
- 기존 인증 테스트의 고정 비밀번호 1곳은 무작위 값 생성으로 교체. 운영 코드 비밀번호가 아닌 테스트 자료였음.
- APK 인증서 SHA-256과 공개 assetlinks 정보는 공개 검증 정보이므로 포함.
- 검사 중간 자료는 `.audit/`에만 보관하고 업로드에서 제외.

대상 전체 목록은 루트 `UPLOAD-FILES.txt`입니다. Git의 실제 추가 목록과 일치하는지도 확인합니다. 이 검사는 지정 파일 유형 및 알려진 비밀값 패턴을 검사한 결과이며, 모든 형태의 숨겨진 비밀값 부재를 수학적으로 보증하는 것은 아닙니다.
