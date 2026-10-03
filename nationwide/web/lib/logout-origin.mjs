// The retired USB preview may end its own session after a public-domain cutover.
// This exception must never authorize login, data reads, or other mutations.
export function isLegacyPreviewLogout(req) {
  return req.headers.get('origin') === 'http://127.0.0.1:3100'
    && req.headers.get('host') === '127.0.0.1:3100';
}
