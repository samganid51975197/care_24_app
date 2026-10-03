# 간병24 TWA

앱 ID `kr.or.care24.app`, 표시 버전 1.1.5, versionCode 15. compileSdk/targetSdk 36.
Google Android Browser Helper의 LauncherActivity로 기존 PWA를 실행합니다. 기존 assets/www 양식은 APK에서 제외하며 웹 서버의 로그인과 접근 제어를 그대로 사용합니다.

## 생성 결과와 키 보관

2026-09-13: debug/release APK, release AAB 빌드 및 Android lint 통과(오류 없음, 도구 업데이트·기존 리소스 등 경고는 보고서 참조). 웹 타입 검사와 인증서 미설정/오류/정상 응답 검증 통과. 로컬 assetlinks 경로는 공개 인증서 지문으로 HTTP 200을 반환합니다. 실제 휴대폰 TWA 검증은 운영 TLS와 배포가 없어 미완료입니다.

- APK: app/build/outputs/apk/release/app-release.apk
- AAB: app/build/outputs/bundle/release/app-release.aab
- 개인키: C:/care24/android-signing-private/care24-upload.jks
- 비밀번호: 같은 비공개 폴더의 store-password.txt. 화면에 출력하지 않습니다.
- 공개 인증서: 같은 폴더의 upload-certificate.der 및 certificate-sha256.txt.

폴더는 Git 밖에 있고 Windows 사용자/SYSTEM 및 작업 계정으로 ACL을 제한했습니다. 키는 암호화된 별도 매체에, 비밀번호는 별도 비밀번호 관리 도구에 백업하세요. 별도 매체 백업은 아직 하지 않았습니다. 키/비밀번호를 GitHub, 메일, 채팅, 웹 폴더에 올리지 마세요. 파일 유실 시 동일 서명으로 직접 앱 업데이트가 불가능할 수 있습니다.

연결 주소는 https://care.xn--24-ts1i486c.com/ (care.간병24.com, 신규 병원 서비스 전용 서브도메인)입니다. 앱 리소스 twa.xml의 웹 관계, Gradle의 호스트/URL, 웹 서버 CARE24_ORIGIN이 같은 도메인을 가리켜야 합니다.

## 현재 미완료인 운영 연결

2026-09-13 확인: 공개 도메인 TLS 인증서 이름 불일치(ERR_TLS_CERT_ALTNAME_INVALID). 새 로그인 웹 앱은 PC 127.0.0.1:3100에만 있습니다. 가비아 배포, 정상 TLS, Digital Asset Links 검증 전에는 정상 작동하는 운영 앱으로 전달하지 않습니다. 검증 우회 플래그나 HTTP 허용을 사용하지 않습니다.

## 서명 및 사이트 인증

서명 키/비밀번호는 Git 밖에 보관하고 환경 변수 CARE24_ANDROID_KEYSTORE, CARE24_ANDROID_STORE_PASSWORD로 빌드 프로세스에만 전달합니다. 별칭은 care24-upload입니다. Release 빌드는 설정 없으면 실패합니다. 개발 PC는 Java 21, Gradle 8.13을 사용합니다.

사이트 환경 변수 CARE24_ANDROID_SHA256_CERT_FINGERPRINTS에 콜론으로 구분된 SHA-256 인증서 지문을 설정합니다. 여러 인증서는 쉼표로 구분합니다. `/.well-known/assetlinks.json`은 비로그인으로 JSON을 반환합니다. 미설정/잘못된 값은 503이며 임의 인증서를 신뢰하지 않습니다.

직접 설치 APK는 해당 APK 서명 인증서, Play 설치 앱은 Play Console의 **앱 서명 인증서** 지문을 등록해야 합니다. 업로드 인증서와 앱 서명 인증서를 혼동하지 않습니다. 운영 호스트에 디버그 인증서는 등록하지 않습니다. 이 JSON에는 공개 지문만 들어가며 개인키/비밀번호를 넣지 않습니다.

## 배포 후 실제 기기 검증

1. 공개 도메인의 유효한 HTTPS 및 새 로그인/권한 기능 확인.
2. assetlinks.json HTTP 200, 리다이렉트 없음, application/json 및 실제 앱 서명 일치 확인.
3. `adb shell pm verify-app-links --re-verify kr.or.care24.app`, 이후 `adb shell pm get-app-links kr.or.care24.app` 확인.
4. 앱에서 주소 표시줄 없는 TWA 실행, 로그인/로그아웃, 뒤로 가기, 파일 선택·권한 있는 다운로드 확인.
5. 검증되지 않으면 브라우저가 주소 표시줄 있는 Custom Tab으로 표시할 수 있습니다. 이는 TWA 검증 성공이 아닙니다.

Play 신규 등록은 아직 하지 않았습니다. TWA 형식만으로 심사가 보장되지 않습니다. 개인정보처리방침 확정, Data safety 기재, 계정 삭제 정책/경로 등 실제 서비스에 적용되는 제출 요건도 확인해야 합니다.
