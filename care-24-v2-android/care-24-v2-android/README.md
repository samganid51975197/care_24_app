# care-24 v2 — Android Studio 프로젝트

현재 운영 중인 care-24 v2를 Android 스마트폰에서 실행하는 앱입니다. 앱 버전은 2.0.0입니다.

## Android Studio에서 실행

1. ZIP을 압축 해제하고 Android Studio → Open에서 이 폴더를 선택합니다. `settings.gradle`이 있는 폴더입니다.
2. Settings → Build, Execution, Deployment → Build Tools → Gradle → Gradle JDK를 **JDK 21**로 설정합니다. 이 PC에서는 `C:/Programs/java/jdk-21.0.2`를 사용할 수 있습니다. Gradle 동기화가 완료될 때까지 기다립니다. SDK 설치 안내가 나오면 Android SDK Platform 36을 설치합니다.
3. 스마트폰에서 개발자 옵션 → USB 디버깅을 켜고 USB로 연결합니다. 스마트폰의 디버깅 허용 창을 승인합니다.
4. 상단 실행 구성에서 `app`, 기기 목록에서 스마트폰을 선택하고 ▶ Run을 누릅니다.
5. 로그인 없이 병원 목록·상황판을 확인합니다. 의뢰·신청 저장 시 로그인하고, 관리자 접수함은 관리자 계정으로 로그인합니다.

에뮬레이터에서도 실행할 수 있습니다. Chrome 또는 Custom Tabs를 지원하는 브라우저가 설치된 이미지를 사용하세요.

## 포함된 동작과 범위

- 기존 사이트 주소와 서버 데이터 연결. Android 앱에 환자·간병인 자료를 복사하지 않습니다.
- 앱 실행 시 care-24 v2 홈을 열고, 뒤로 나오면 홈·전국 병원·관리자 접수함 버튼을 표시합니다.
- 로그인 세션을 유지할 수 있는 Android Custom Tabs를 사용합니다. 화면 위에 브라우저 도구막대가 표시됩니다.
- 전화·지도 링크, 날짜·시간 입력과 뒤로 가기는 브라우저가 처리합니다.
- 병실 이동 이력, 담당 간병인 정보 등 기존 웹 기능을 그대로 사용합니다.
- 관리자 접수함 버튼을 눌러도 서버의 관리자 권한 검사를 통과해야 내용을 볼 수 있습니다.
- 인터넷이 필요합니다. 병원 목록과 상황판은 공개되지만 관리자 접수 내용은 관리자 계정으로만 접근할 수 있습니다.
- 네이티브 화면으로 전체 기능을 재작성한 앱이나 오프라인 앱이 아닙니다. 향후 사이트 수정은 앱 재설치 없이 반영됩니다.

## 개발 설정

- applicationId: `kr.or.care24.v2` (기존 1.x 앱을 덮어쓰지 않고 별도 설치)
- minSdk 26 (Android 8.0 이상), compileSdk / targetSdk 36
- AGP 8.13.2 / Gradle 8.13 / JDK 17 또는 21 (JDK 25는 Gradle 8.13과 호환되지 않음)
- `app/src/main/res/values/strings.xml`의 `site_url`이 운영 사이트 주소입니다.
- 로컬 `local.properties`에는 본인 컴퓨터의 Android SDK 경로를 지정합니다. ZIP에는 이 컴퓨터 전용 경로를 포함하지 않습니다.
- Windows 빌드: `gradlew.bat assembleDebug lintDebug`
- 결과: `app/build/outputs/apk/debug/app-debug.apk`
- 제공 APK는 디버그 서명 테스트용입니다. Play Store 배포에는 본인 키로 서명한 별도의 release 빌드가 필요합니다. 서명키·비밀번호는 포함하지 않았습니다.

## 확인 자료

- https://developer.android.com/build/releases/agp-8-13-0-release-notes
- https://developer.android.com/develop/ui/views/layout/webapps/overview-of-android-custom-tabs
