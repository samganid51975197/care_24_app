# 구 간병24 앱 (com.fivegram.gb)

간병24.com 루트 사이트를 여는 구형 Play 앱 "간병24"의 소스입니다.

| 항목 | 내용 |
|---|---|
| `android/` | Android 프로젝트 (Kotlin, WebView) — `applicationId com.fivegram.gb`, 4.0.2 (versionCode 40004), compileSdk·targetSdk 36, minSdk 24 |
| `releases/gb_4.0.2-release.aab` | 4.0.2 서명된 AAB (2026-09-29 빌드) |

- 앱은 WebView로 `https://xn--24-ts1i486c.com/?ref=and`(간병24.com, 구형 서비스 서버)를 엽니다.
- 다음 업데이트는 versionCode **40005 이상**이어야 합니다.
- 가비아 DNS의 `@`, `www`는 이 앱이 쓰므로 수정하지 않습니다. 신규 서비스는 `care.간병24.com`입니다.

## 저장소에 넣지 않은 파일 (원본 PC에만 보관)

업로드 키(`gb24-upload.jks`), 키 비밀번호 파일(`key.properties`), 업로드 인증서(`upload_certificate.pem`), `local.properties`, 빌드·IDE 캐시(`build/`, `.gradle/`, `.idea/`, `.kotlin/`), 이전 설정 백업(`_backup_20260919`).

release 서명 설정이 build.gradle.kts에 없으므로 Android Studio의 **Build → Generate Signed Bundle** 마법사에서 키 파일을 직접 선택해 서명합니다.
