# Samsung Seoul Hospital building and floor guide

Checked 2026-09-20. The existing `/hospitals/hospital-5` hospital entry now uses the shared Bundang app shell with Samsung-specific navigation. A second Samsung entry with the same name uses the same guide. No Bundang ward numbers, patients or bed assignments are copied.

## Sources and coverage

- Official building/floor pages: https://www.samsunghospital.com/_newhome/info/guide/hospital/1F.html
- Cancer building: https://www.samsunghospital.com/_newhome/info/guide/cancer/6F.html
- Annex: https://www.samsunghospital.com/_newhome/info/guide/etc/5F.html
- Proton center: https://www.samsunghospital.com/_newhome/info/guide/proton/B1F.html
- Relocation notice: https://www.samsunghospital.com/home/info/noticeView.do?seq=2364
- Address and subway: https://www.samsunghospital.com/module/map/map.jsp
- Official transport/schedule link: https://www.samsunghospital.com/home/info/map.do
- Current English shuttle guide and timetable: https://www.samsunghospital.com/en/patient-guide/location-parking.do
- Official route graphic, visually inspected: https://www.samsunghospital.com/en/assets/img/start-your-care/bus-d.svg (SRT exit 3; subway Suseo exit 1; Irwon exit 1; main Gate 1; cancer Gates 7 and 6; Irwon exit 7 and Suseo exit 6 are drop-off only).

`lib/samsung-guide.json` records the exact source URL, facility labels and map image URL for every floor retrieved by `scripts/collect-samsung-guide.ps1`. The script follows each building's published floor navigation rather than guessing floors. Main: B3–20F; cancer: B3–11F in the HTML guide; annex: B3–8F. The map PDF also mentions lower basement levels of the cancer building, but they are not added as selectable wards because they are not in the retrieved HTML floor navigation. The proton guide supplies links without a facility list and is therefore an external supporting link, not an invented inpatient building.

## Accuracy boundaries

These are currently accessible official *published guide pages*, not a guarantee of current clinical assignments. They have no reliable visible revision date; the website advertises remodeling. The app displays this limitation and links to relocation information. Older map PDFs and newer guide pages conflict on some facilities; the HTML guide is used consistently, without inferring current departments or ward codes from either source.

The ward filter selects floors explicitly listing wards, intensive-care units or newborn care. Other floors are available through “전체 층·시설”. Missing facility lists remain empty. Room types on official pages do not establish real room numbers, occupied beds, doors or windows. The common room/bed editor is explicitly a field-survey example and is scoped to 삼성서울병원 through `hospitalName`; the Bundang key plan and legacy ward-board read are suppressed.

## Verification

- TypeScript check: `node node_modules/typescript/bin/tsc --noEmit --incremental false`.
- Regression checks: hospital selection, ward filtering and encrypted ward assignments tests.
- Browser preview uses a separate `.private/samsung-preview.db` containing a synthetic hospital account; production data and authentication settings are unchanged.
- The original workspace contains an encryption-maintenance marker. It was preserved. The preview runs a source copy at `C:/care24/samsung-preview`, with the isolated test DB, on `http://127.0.0.1:3101/hospitals/hospital-5`.
- Browser checks passed for the approved two-line header, three building cards, cancer 6F room/bed navigation, Samsung-only hospital selection, all-floor filter, outpatient-only floor without a bed editor, and the 390px mobile floor list. All six regression tests passed; the TypeScript check passed.

This change updates the local Next.js project. The old Sites publication and live server are not automatically updated by local file edits.
