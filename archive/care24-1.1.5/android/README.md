# 간병24 Android 1.1.5

- versionName 1.1.5 / versionCode 15 / compileSdk·targetSdk 36
- 빌드 환경: Java 21, Gradle wrapper
- Debug: kr.or.care24.app.dev, LocalPreviewActivity, PC http://127.0.0.1:3100/ (USB adb reverse 필요)
- Release: kr.or.care24.app, TWA, https://care.xn--24-ts1i486c.com/
- 웹 기능은 서버에서 제공하므로 APK만 설치해도 운영 웹이 갱신되는 것은 아닙니다.
- 기존 서명키로 배포해야 하며 개인키와 비밀번호는 프로젝트 밖에 보관합니다.
- 운영 배포·HTTPS·Digital Asset Links 검증과 Play 출시는 별도로 진행해야 합니다.

자세한 설명은 LOCAL-PREVIEW.md 및 TWA-DEPLOYMENT.md를 참고하세요.
