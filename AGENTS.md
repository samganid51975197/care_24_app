# Approved Care24 branding

The user approved the header on 2026-09-13 and explicitly requested that it remain unchanged unless they ask.
- Left: cropped Care24 logo inside a thin #71958d border with 4px corners and 3px padding (2px on narrow mobile).
- Border outer height matches the two-line text: desktop 40px, mobile 36px, narrow mobile 32px.
- Right first line: hospital name + ` 통합간병 앱`; current hospital is `분당서울대학교병원`.
- Right second line: `대한노인돌봄서비스협회 관리`.
- Logo click links to the nationwide hospital site. Never navigate on hover.
- Preserve this layout across hospitals. Do not add another native app branding header or let the fixed home panel cover the web header.
- Verify the actual rendered header after related edits; source diffs alone do not show the user the result.

# Hospital room layout authority
- Current room and bed geometry is a basic example, not a surveyed hospital plan.
- Each hospital app representative will inspect the site and provide a drawn floor plan to the team lead.
- Reconfigure that hospital's rooms, beds, doors, toilets and windows from the supplied plan; do not invent surveyed positions.
- Editable bed numbers and recorded names do not establish the physical accuracy of the example plan.

# Shared hospital app composition
- Use the Bundang Seoul National University Hospital app as the common composition baseline for all hospital apps.
- Preserve the approved Care24 logo and two-line hospital/association branding. Logo alone links to /hospitals, the original regional directory; do not add redundant nationwide back links to hospital introductions.
- Include a brief, source-verified hospital introduction and a "찾아오는 길" section with the hospital-specific address/map search.
- Preserve building → floor/ward → room → bed navigation. Use only that hospital's verified data or clearly marked field-survey placeholders; never copy another hospital's real room/bed/patient assignments.

- In directions, prioritize rail/subway, then intercity bus, city bus, and village bus. Show only verified applicable routes; use map links for current schedules.
- When a hospital operates a shuttle, prioritize shuttle directions above other transport. Include connecting station, exit, boarding point, and the official schedule link. Never infer shuttle availability.

# Hospital caregiver registration policy
- Association (including Care24) and the hospital room nurse must both approve before registration is complete.
- After registration, the caregiver obtains a certificate from the association (including Care24) and wears it as a badge while working.
- Registration approval is not proof that a certificate was issued. Do not fabricate issuance or credential verification.

- On /hospital-registration, finish with the registration/certificate workflow; omit the global privacy-policy footer as requested. Keep /privacy available on other screens.

# Shared document action order
- All hospital document forms use the visible action order: 저장 → 보내기 → 확인. Place close or additional completion controls after these actions. Preserve actual approval and signature requirements; a content review must not imply submission or approval.

- Use 협회(간병24) consistently for the association recipient in every hospital UI; label its send button 협회(간병24) 보내기.

# Patient privacy and contract access
- Patients/guardians may create an initial care request; caregivers can view consented care needs and apply from the board.
- Mask patient names in board responses (홍길동 → 홍○동; two characters → 김○). Do not send contact details, exact rooms, contract content, fees, banking data or financial totals to non-admin accounts.
- Only admins may retrieve/edit private records or enter/edit contract amounts. Enforce this on the server, including attachments and owner access; UI hiding is insufficient.

- The board may show patient birth year and age. Full date of birth is not currently collected; never invent missing month/day.
