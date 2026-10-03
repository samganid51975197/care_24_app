// Only public certificate fingerprints belong here; never a signing key/password.
export const dynamic = 'force-dynamic';
export function GET() {
  const fingerprints = (process.env.CARE24_ANDROID_SHA256_CERT_FINGERPRINTS || '')
    .split(',').map(value => value.trim().toUpperCase()).filter(Boolean);
  if (!fingerprints.length || fingerprints.some(value => !/^(?:[0-9A-F]{2}:){31}[0-9A-F]{2}$/.test(value))) {
    return Response.json({error: 'Android signing certificate is not configured'}, {status: 503, headers: {'Cache-Control': 'no-store'}});
  }
  return Response.json([{
    relation: ['delegate_permission/common.handle_all_urls'],
    target: {namespace: 'android_app', package_name: 'kr.or.care24.app', sha256_cert_fingerprints: fingerprints},
  }], {headers: {'Cache-Control': 'public, max-age=300'}});
}
