# 전국병원간병 Android 3.0.1

- Play 앱: 전국병원간병 / `applicationId kr.or.care24.app`
- 소스 패키지(namespace): `kr.or.care24.v3`
- versionCode / versionName: `30001` / `3.0.1` — 다음 배포는 30002 이상
- compileSdk·targetSdk 36, minSdk 26, Java 17 소스 수준
- 방식: Android Custom Tabs로 운영 웹 `https://care.xn--24-ts1i486c.com/regional/index.html#hospitals`를 엽니다. 실행 즉시 상황판이 열리고, 뒤로가기 시 버튼 메뉴(상황판·관리자·전문간병사 교육과정)가 보입니다.
- 이전 2.0.5(`kr.or.care24.v2`)의 기능을 모두 포함합니다.

빌드: Android Studio에서 이 폴더의 `settings.gradle`을 열고 `gradlew assembleDebug`. release 서명 설정과 키는 저장소에 없으며 Play 업로드는 서명키 보유자가 직접 진행합니다.

변경 내역·테스트 결과·미해결 문제·작업 규칙은 [HANDOFF-v3.0.1.md](HANDOFF-v3.0.1.md)를 참고하세요.
