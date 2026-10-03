# Android Studio 실시간 개발 실행

개발 앱 이름은 **간병24 개발**, 패키지는 `kr.or.care24.app.dev`입니다.
USB를 통해 PC의 Next.js 개발 서버를 앱 내부 WebView로 표시합니다.
정식 release 앱은 간병24.com을 여는 TWA입니다.

1. PC에서 `C:\care24\github-care24\web-site` 폴더로 이동하고 `npm run dev -- --port 3100 --webpack`을 실행합니다. Node 22 이상을 사용합니다.
2. USB 디버깅이 허용된 갤럭시를 USB로 연결합니다.
3. Android Studio에서 `C:\care24\github-care24\android-project`를 엽니다.
4. Gradle JDK는 `C:\Programs\java\jdk-21.0.2`를 사용합니다.
5. `app`의 빌드 변형은 `debug`, 실행 기기는 연결된 갤럭시를 선택하고 ▶ Run을 누릅니다.

debug 빌드 과정에서 `adb reverse tcp:3100 tcp:3100`을 실행합니다. USB를 다시 연결한 후에는 Run을 다시 누릅니다. 여러 기기가 연결되어 있으면 `adb -s 기기번호 reverse tcp:3100 tcp:3100`을 직접 실행합니다.

웹 소스(`web-site`)를 저장하면 Next.js Fast Refresh로 반영됩니다. 반영되지 않으면 앱 위쪽 **새로고침**을 누릅니다. Java나 Android 설정 변경은 다시 Run해야 합니다. PC 개발 서버와 USB 연결은 계속 유지해야 합니다.

개발 앱의 로그인 상태는 기존 앱과 별개입니다. 외부 링크 이동을 제한한 개발 미리보기이므로 정식 TWA의 외부 링크·파일 다운로드 동작 검증은 별도로 필요합니다. 로컬 HTTP 허용 및 WebView 디버깅은 debug 빌드에만 적용되며, 정식 사이트 HTTPS 인증서 문제 해결을 대신하지 않습니다.
