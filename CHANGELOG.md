# care-24 v2

Released 2026-09-21. Existing Site URL, application identity and D1 data are retained.

- Shared hospital home layout, care request board and directions across 431 hospital entries.
- Caregiver applications linked to a selected request number.
- Required start/end dates and times for new patient requests and caregiver applications.
- Request review and save confirmation, followed by the matching hospital board.
- Administrator-only unified inbox and room/bed editing.
- Timestamped room relocation history retained in the private reception record.
- Assigned caregiver name, qualification and contact recorded in the administrator workflow.
- Seoul Top Hospital and updated Samsung cancer ward room guidance.
- Directory title logo aligned to adjacent text height.

Older records without an end time remain marked as unregistered. Assigned caregiver contact and relocation history are not included in the situation-board API. This release does not add automatic assignment, payroll or notifications.

## Public browsing

Hospital listings and the sanitized request board allow anonymous access. Admin APIs, editing, own messages and submission remain authenticated. Site audience changed to public at the owner's explicit request.
