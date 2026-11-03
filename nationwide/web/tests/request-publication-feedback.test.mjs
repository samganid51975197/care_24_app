import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { fileURLToPath } from "node:url";

const sourcePath = fileURLToPath(new URL("../app/live-matching.tsx", import.meta.url));
const routePath = fileURLToPath(new URL("../app/api/care-requests/route.ts", import.meta.url));

test("care request form separates saving, publication, and caregiver application", async () => {
  const source = await readFile(sourcePath, "utf8");

  assert.match(source, /onInvalidCapture=\{showInvalidField\}/);
  assert.match(source, /1\. 의뢰서 저장/);
  assert.match(source, /2\. 상황판 공개/);
  assert.match(source, /3\. 간병인 간병 신청/);
  assert.match(source, /의뢰서 저장/);
  assert.match(source, /상황판 공개하기/);
  assert.match(source, /저장한 비공개 의뢰/);
  assert.match(source, /상황판 저장·공개 완료/);
  assert.match(source, /현황판에서 의뢰 \{savedRequest\}번 보기/);
  assert.match(source, /publishRequest\(savedRequest\)/);
});

test("public visitors can submit only the completed care request", async () => {
  const source = await readFile(routePath, "utf8");

  assert.match(source, /public-care-request:/);
  assert.match(source, /resolvePublicHospital/);
  assert.match(source, /로그인 없이 작성한 의뢰는 이 기기에 임시 저장됩니다/);
  assert.match(source, /actor\?\.role!=="admin"/);
  assert.match(source, /CARE24_REQUEST_ACCESS_PEPPER/);
  assert.match(source, /trustedClientIp/);
  assert.doesNotMatch(source, /get\('hospital'\)\|\|'snubh'/);
});
