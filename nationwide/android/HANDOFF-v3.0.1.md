# care-24 v3 — 3.0.1 변경 내역 및 인계 사항

작성: 도근 · 작성일: 2026-09-25
대상: 황세옥 님 및 care-24 v3 개발을 담당하는 AI 에이전트(Codex 등)

> 이 문서를 먼저 읽고 작업을 시작해 주세요. 아래 "작업 규칙"은 반드시 지켜 주세요.

---

## 1. 이번에 배포한 버전

| 항목 | 값 |
|---|---|
| Play 앱 | 전국병원간병 (`applicationId` = `kr.or.care24.app`) |
| 소스 패키지(namespace) | `kr.or.care24.v3` |
| 이전 버전 | versionCode 30000 / versionName 3.0.0 |
| **이번 버전** | **versionCode 30001 / versionName 3.0.1** |
| 트랙 | 내부 테스트 (2026-09-25 출시) |
| 서명 | 3.0.0과 동일한 업로드 키 (키 파일·비밀번호는 저장소에 넣지 않음) |

## 2. 변경 내용

### 2-1. `app/build.gradle`
- `versionCode 30000 → 30001`, `versionName '3.0.0' → '3.0.1'`

### 2-2. `app/src/main/java/kr/or/care24/v3/MainActivity.java`
**목적**: 앱 실행 시 버튼 메뉴가 잠깐 보였다가 상황판으로 전환되는 깜빡임 제거.
실행하면 바로 "전국 병원 · 상황판"(`/regional/index.html#hospitals`)이 열리고, 뒤로가기를 누르면 버튼 메뉴가 보이는 동작은 그대로 유지.

- `ScrollView scroll`을 지역변수에서 **필드**로 변경
- 첫 실행(`savedInstanceState == null`) 시 `scroll.setVisibility(View.INVISIBLE)` 후 `openSite("home")`
- `onRestart()` 추가: Custom Tab에서 뒤로 돌아오면 `scroll.setVisibility(View.VISIBLE)`
- `openSite()`의 두 `catch` 블록에서 `scroll.setVisibility(View.VISIBLE)` (브라우저 실행 실패 시 빈 화면 방지)
- import `android.view.View` 추가

## 3. 테스트 결과 (2026-09-25)

| 기기 | 결과 |
|---|---|
| Galaxy S25 | 설치·실행·상황판 표시 정상 |
| 도근 님 안드로이드 폰 | 설치·실행 정상, 3.0.0에서 메뉴 깜빡임 확인 → 3.0.1에서 수정 |
| 황세옥 님 폰 (기본 브라우저: 네이버 앱) | **인증서 오류** `net::ERR_CERT_COMMON_NAME_INVALID`, 오류 화면의 주소가 `kr.or.care24.app` |

## 4. 미해결 문제 — 다음 버전(30002)에서 처리 필요

### 4-1. [중요] 네이버 앱이 기본 브라우저인 폰에서 인증서 오류
- **원인(추정, 근거 강함)**: Custom Tab 인텐트에는 호출 앱 정보(`android-app://kr.or.care24.app`)가 referrer로 실립니다. 네이버 앱이 이것을 주소로 잘못 해석해 `https://kr.or.care24.app`에 접속하려다 인증서 불일치가 발생합니다. 오류 화면의 호스트명이 `applicationId`와 정확히 일치합니다.
- **폰 설정 문제로 보면 안 됨**: 실제 사용자 중 네이버 앱을 기본 브라우저로 쓰는 사람이 많습니다.
- **수정안**: Custom Tab을 열 때 브라우저를 명시 지정 (Chrome → 삼성 인터넷 순, 둘 다 없을 때만 기본 브라우저).

```java
// openSite()에서 tab.launchUrl(...) 직전
String pkg = CustomTabsClient.getPackageName(this,
    java.util.Arrays.asList("com.android.chrome", "com.sec.android.app.sbrowser"),
    true);
if (pkg != null) tab.intent.setPackage(pkg);
```
- import `androidx.browser.customtabs.CustomTabsClient` 추가
- `AndroidManifest.xml`에 아래 추가 (Android 11+ 패키지 가시성, 없으면 `getPackageName()`이 항상 null):
```xml
<queries>
    <intent>
        <action android:name="android.support.customtabs.action.CustomTabsService" />
    </intent>
</queries>
```
- 검증: 네이버 앱을 기본 브라우저로 설정한 폰에서 실행해 상황판이 정상 표시되는지 확인.

### 4-2. Play Console 앱 설정 미완료 (4/11)
정식 출시 전 필수. 남은 항목: 개인정보처리방침, 로그인 세부정보, 콘텐츠 등급, 타겟층, 데이터 보안, 건강, 앱 카테고리·연락처.
- **로그인 세부정보**: 심사자가 쓸 수 있는 **승인된 테스트 계정**을 별도로 만들어 제공해야 합니다. 없으면 반려 사유가 됩니다.
- **개인정보처리방침**: 현재 `https://care.xn--24-ts1i486c.com/privacy`는 검토본입니다. 운영주체·담당자·보관기간·제3자 제공 확정은 협회 결정 사항입니다.

### 4-3. Play 심사 리스크 (참고)
현재 구조(버튼 메뉴 + 외부 브라우저 Custom Tab)는 실제 기능이 전부 브라우저에서 동작하므로, Google Play **최소 기능 정책**에 걸릴 위험이 있습니다. 정식 출시 전에 TWA(검증된 전체화면) 또는 앱 내 WebView 전환 검토를 권장합니다.

## 5. 작업 규칙 (반드시 지켜 주세요)

1. **versionCode는 30001보다 커야 합니다.** 다음은 `30002 / 3.0.2`, 큰 변경은 `30100 / 3.1.0` 형식을 권장합니다.
2. **이 문서의 변경(2절)을 되돌리지 마세요.** 이전 코드로 다시 빌드하면 깜빡임 수정이 사라집니다.
3. **서명 키(keystore)와 비밀번호를 저장소·대화·로그에 절대 넣지 마세요.**
4. **가비아 DNS(`@`, `www`)는 절대 수정하지 마세요.** 루트 도메인은 구형 간병24 서비스(211.47.74.39)용이고, 신형 서비스는 `care.간병24.com`(114.108.153.57)입니다. 루트를 바꾸면 구형 앱이 즉시 동작하지 않습니다.
5. **운영 서버(114.108.153.57) 배포나 설정 변경 전에는 도근 님과 먼저 시간을 조율해 주세요.** 동시 작업으로 설정이 덮어써질 위험이 있습니다.
6. 커밋할 때마다 README 또는 CHANGELOG에 **"이번에 완성된 것 / 남은 것"**을 명시해 주세요.
7. 새 앱 폴더·새 저장소 생성 같은 큰 구조 변경은 **황세옥 님께 먼저 확인**받아 주세요.
