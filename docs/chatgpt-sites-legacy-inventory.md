# ChatGPT Sites legacy work inventory

> 2026-10-24 read-only inventory. This document does not authorize further use of ChatGPT Sites.

## Important limitation

The repository records source snapshots and commit history, but it does **not** retain an authoritative mapping from ChatGPT Sites display versions (such as 163 or 169) to Git commit IDs. Do not infer an exact version-number-to-commit mapping without an export from the former Sites project.

## Discovered legacy site-source work

| Period / source commits | Work found |
| --- | --- |
| 2026-09-06, `500756d` | Connected a Sites project. |
| 2026-10-03 and 2026-10-13, `ffdb4ab`, `81d0a50`, `8761289`, `a1b0629`, `c1e7c1c`, `9affdc5`, `36d552f` | Repeated source snapshots labelled `Update Site source`; exact visual deltas require comparison with the former Sites version history. |
| 2026-10-16, `08bb8b9` through `e401043` | Hospital finder and specialist-care education/certification source updates, including standalone certification separation, pulmonary education flow, and content-label changes. |
| 2026-10-17, `12863fb` through `0d67e43` | Orthopedic 80-question four-choice exam improvements, answer-number selection styling, association management wording, hospital promo-short sections, custom hospital video registration, server-side promo-video storage schema/worker work, payment/retry flows, and header navigation changes. |
| 2026-10-18 onward, `3227691` and later | Certification screens separated from hospital finder; pulmonary, dementia, and orthopedic course/video experiments; Samsung Seoul Hospital promo drafts, combined direction/care clips, review board, and later HeyGen preflight materials. |

## Artifacts that must be reviewed before Gabia migration

1. `dist/`, `.site-stage/`, and source files (`app.js`, `index.html`, `styles.css`, `hospitals.js`, `worker-template.js`).
2. Generated archives found in historical commits, including `promo-shorts.tgz`, `exam-number-select.tgz`, `orthopedic-exam.tgz`, and `promo-server.tgz`.
3. Database migration `drizzle/0006_hospital_promo_videos.sql` and matching worker behavior.
4. Experimental Samsung Seoul Hospital and Cheonan hospital promotional-video drafts. These are review materials, not approved Gabia production deployments.

## Migration rule

Each item must be compared against the GitHub source, reviewed locally, deployed to Gabia, and verified at `https://care.xn--24-ts1i486c.com` before it can be reported as production complete.
