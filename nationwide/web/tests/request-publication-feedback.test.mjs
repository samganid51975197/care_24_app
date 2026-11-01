import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { fileURLToPath } from "node:url";

const sourcePath = fileURLToPath(new URL("../app/live-matching.tsx", import.meta.url));

test("care request form explains publication and identifies missing fields", async () => {
  const source = await readFile(sourcePath, "utf8");

  assert.match(source, /onInvalidCapture=\{showInvalidField\}/);
  assert.match(source, /상황판에 저장·공개하기/);
  assert.match(source, /별도의 ‘보내기’ 버튼은 필요 없습니다/);
  assert.match(source, /상황판 저장·공개 완료/);
});
