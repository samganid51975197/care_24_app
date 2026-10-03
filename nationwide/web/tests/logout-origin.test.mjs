import test from 'node:test';
import assert from 'node:assert/strict';
import {isLegacyPreviewLogout} from '../lib/logout-origin.mjs';
const request = (origin, host) => new Request('http://127.0.0.1:3100/api/auth/logout', {headers:{origin,host}});
test('permits the existing loopback preview to end its session',()=>{
  assert.equal(isLegacyPreviewLogout(request('http://127.0.0.1:3100','127.0.0.1:3100')),true);
});
test('rejects cross-origin and public-host requests using the preview exception',()=>{
  for(const [origin,host] of [
    ['https://attacker.example','127.0.0.1:3100'],
    ['http://127.0.0.1:3100','xn--24-ts1i486c.com'],
    ['http://127.0.0.1:3101','127.0.0.1:3100'],
    ['null','127.0.0.1:3100'],
  ]) assert.equal(isLegacyPreviewLogout(request(origin,host)),false);
});
