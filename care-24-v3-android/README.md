# 간병24 v2 Android 인계

이 폴더는 `C:\care-24-v2\care-24-v2-android\care-24-v2-android`의 최신 로컬 소스 2.0.5입니다. 실제 서버 다운로드에 게시된 버전은 2.0.3과 2.0.4로 확인되었습니다. Play 게시/테스터 전달/휴대폰 설치는 확인하지 못했습니다.

- applicationId: `kr.or.care24.v2`
- versionCode / versionName: `20005` / `2.0.5`
- compileSdk / targetSdk / minSdk: `36` / `36` / `26`
- AGP 8.13.2, Gradle wrapper 8.13, Java 소스 수준 17.
- 방식: Android Custom Tabs. 지원 브라우저와 인터넷 필요.
- 최초 주소: `https://care.xn--24-ts1i486c.com/regional/index.html#hospitals`.
- 병원 상세·의뢰·신청은 웹 로그인 및 서버 권한 검사 대상.

도근 님은 Android Studio에서 이 폴더의 `settings.gradle`을 열고 본인 SDK 경로를 설정하세요. `local.properties`와 서명키는 포함하지 않았습니다. JDK 17 또는 21 등 Gradle/AGP가 지원하는 환경을 사용하세요. 개발 APK 빌드 명령은 `gradlew.bat assembleDebug`, 점검은 `gradlew.bat lintDebug`입니다. 이번 인계 작업에서는 두 명령을 실행하지 않았습니다.

release 서명 설정은 현재 프로젝트에 없습니다. Play 업로드는 도근 님이 서명키와 대상 앱을 확인한 후 직접 진행해야 합니다. 이 v2 앱은 기존 `kr.or.care24.app`과 패키지가 다릅니다. v1의 versionCode 15를 업데이트하려면 v1 프로젝트·서명을 별도로 확인하고 versionCode 16 이상을 사용해야 합니다.

APK에서 확인한 공통 인증서 지문은 상위 `STATUS.md`를 참고하세요. 서명키 파일/비밀번호/인증 토큰은 저장소에 넣지 마세요.
