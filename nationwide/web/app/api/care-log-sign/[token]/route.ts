import { requireOrigin } from '@/lib/auth';
import { NextRequest } from 'next/server';

type Environment = 'prod' | 'dev';
type RouteContext = { params: Promise<{ token: string }> };

function json(data: unknown, status = 200) {
  return Response.json(data, {
    status,
    headers: { 'Cache-Control': 'no-store, max-age=0', Pragma: 'no-cache' },
  });
}

function environment(value: string | null): Environment | null {
  if (value === null || value === '' || value === 'prod') return 'prod';
  return value === 'dev' ? 'dev' : null;
}

function supabaseConfig(env: Environment) {
  const url = env === 'dev'
    ? process.env.CARE_VIETNAM_DEV_SUPABASE_URL
    : process.env.CARE_VIETNAM_SUPABASE_URL;
  const anonKey = env === 'dev'
    ? process.env.CARE_VIETNAM_DEV_SUPABASE_ANON_KEY
    : process.env.CARE_VIETNAM_SUPABASE_ANON_KEY;
  if (!url || !anonKey || !/^https:\/\//.test(url)) return null;
  return { url: url.replace(/\/$/, ''), anonKey };
}

function validToken(token: string) {
  return /^[a-f0-9]{64}$/.test(token);
}

async function callSupabase(
  env: Environment,
  functionName: string,
  params: Record<string, unknown>,
) {
  const config = supabaseConfig(env);
  if (!config) return { ok: false as const, status: 503, data: null };
  const response = await fetch(`${config.url}/rest/v1/rpc/${functionName}`, {
    method: 'POST',
    headers: {
      apikey: config.anonKey,
      Authorization: `Bearer ${config.anonKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
    cache: 'no-store',
  });
  if (!response.ok) return { ok: false as const, status: response.status, data: null };
  return { ok: true as const, status: response.status, data: await response.json() as unknown };
}

export async function GET(req: NextRequest, { params }: RouteContext) {
  const { token } = await params;
  if (!validToken(token)) return json({ error: '서명 링크가 올바르지 않습니다.' }, 404);
  const env = environment(req.nextUrl.searchParams.get('env'));
  if (!env) return json({ error: '서명 링크가 올바르지 않습니다.' }, 400);
  try {
    const result = await callSupabase(env, 'get_care_log_signature_share', { p_token: token });
    if (!result.ok) return json({ error: result.status === 503 ? '서명 서비스를 준비하고 있습니다.' : '서명 링크를 확인하지 못했습니다.' }, result.status === 503 ? 503 : 502);
    if (!result.data) return json({ error: '서명 링크가 만료되었거나 이미 사용할 수 없습니다.' }, 404);
    return json(result.data);
  } catch {
    return json({ error: '서명 링크를 불러오지 못했습니다.' }, 502);
  }
}

export async function POST(req: NextRequest, { params }: RouteContext) {
  try {
    requireOrigin(req);
  } catch {
    return json({ error: '잘못된 요청입니다.' }, 403);
  }
  const { token } = await params;
  if (!validToken(token)) return json({ error: '서명 링크가 올바르지 않습니다.' }, 404);
  const env = environment(req.nextUrl.searchParams.get('env'));
  if (!env) return json({ error: '서명 링크가 올바르지 않습니다.' }, 400);
  const contentLength = Number(req.headers.get('content-length') || '0');
  if (contentLength > 240_000) return json({ error: '서명 데이터를 확인해 주세요.' }, 413);

  try {
    const body = await req.json();
    const signerName = typeof body.signerName === 'string' ? body.signerName.trim() : '';
    const strokes = body.strokes;
    if (!signerName || signerName.length > 80 || body.consent !== true) {
      return json({ error: '이름과 동의 항목을 확인해 주세요.' }, 400);
    }
    if (!Array.isArray(strokes) || strokes.length === 0 || JSON.stringify(strokes).length > 200_000) {
      return json({ error: '손글씨 서명을 확인해 주세요.' }, 400);
    }
    const result = await callSupabase(env, 'sign_care_log_signature_share', {
      p_token: token,
      p_signer_name: signerName,
      p_strokes: strokes,
      p_consent: true,
    });
    if (!result.ok) return json({ error: result.status === 503 ? '서명 서비스를 준비하고 있습니다.' : '서명 링크가 만료되었거나 이미 제출되었습니다.' }, result.status === 503 ? 503 : 409);
    return json({ ok: true });
  } catch {
    return json({ error: '서명을 제출하지 못했습니다. 링크가 만료되었는지 확인해 주세요.' }, 409);
  }
}
