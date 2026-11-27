'use client';

import { useEffect, useRef, useState } from 'react';
import type { FormEvent, PointerEvent } from 'react';
import styles from './signature-form.module.css';

type Environment = 'prod' | 'dev';
type Point = [number, number];
type Share = {
  log_date: string;
  data: Record<string, unknown>;
  signer_name?: string | null;
  signed_at?: string | null;
};

const labels: Record<string, string> = {
  conditions: '환자 상태',
  common: '공통 기록',
  section1: '1. 기본 정보',
  section2: '2. 근무 확인',
  section3: '3. 환자 안전 및 환경 관리',
  section4: '4. 개인 위생 및 청결 관리',
  section5: '5. 식사 관리',
  section6: '6. 배설 관리',
  section7: '7. 체위 변경 및 피부 관리',
  section8: '8. 이동 및 활동 보조',
  section9: '9. 정서 지원 및 인권 보호',
  section10: '10. 감염 예방',
  section11: '11. 관찰 및 보고',
  section12: '12. 금지 행위 확인',
  section13: '13. 근무 종료 및 인계',
};

function visibleValue(value: unknown): boolean {
  if (value == null || value === '') return false;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === 'object') return Object.keys(value as object).length > 0;
  return true;
}

function printable(value: unknown): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'boolean') return value ? '예' : '아니요';
  if (value == null) return '';
  return JSON.stringify(value, null, 2) || '';
}

export default function CareLogSignatureForm({
  token,
  environment,
}: {
  token: string;
  environment: Environment;
}) {
  const [share, setShare] = useState<Share | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [, setStrokeRevision] = useState(0);
  const canvas = useRef<HTMLCanvasElement>(null);
  const strokes = useRef<Point[][]>([]);
  const drawing = useRef(false);

  useEffect(() => {
    let active = true;
    fetch(`/api/care-log-sign/${token}?env=${environment}`, { cache: 'no-store' })
      .then(async response => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || '서명 링크를 불러오지 못했습니다.');
        if (active) {
          setShare(result as Share);
          setDone(!!result.signed_at);
        }
      })
      .catch(reason => {
        if (active) setError(reason instanceof Error ? reason.message : '서명 링크를 불러오지 못했습니다.');
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [environment, token]);

  function point(event: PointerEvent<HTMLCanvasElement>): Point {
    const rect = event.currentTarget.getBoundingClientRect();
    return [
      Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width)),
      Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height)),
    ];
  }

  function draw(event: PointerEvent<HTMLCanvasElement>, start: boolean) {
    const element = canvas.current;
    if (!element) return;
    const next = point(event);
    const list = strokes.current;
    if (start) list.push([next]);
    else if (list.length) list[list.length - 1].push(next);
    const context = element.getContext('2d');
    if (!context) return;
    const last = list[list.length - 1];
    const from = last.length > 1 ? last[last.length - 2] : next;
    context.strokeStyle = '#142f39';
    context.lineWidth = 5;
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.beginPath();
    context.moveTo(from[0] * element.width, from[1] * element.height);
    context.lineTo(next[0] * element.width, next[1] * element.height);
    context.stroke();
    setStrokeRevision(value => value + 1);
  }

  function pointerDown(event: PointerEvent<HTMLCanvasElement>) {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    drawing.current = true;
    draw(event, true);
  }

  function pointerMove(event: PointerEvent<HTMLCanvasElement>) {
    if (!drawing.current) return;
    event.preventDefault();
    draw(event, false);
  }

  function pointerUp() { drawing.current = false; }

  function clearSignature() {
    strokes.current = [];
    const context = canvas.current?.getContext('2d');
    if (context && canvas.current) context.clearRect(0, 0, canvas.current.width, canvas.current.height);
    setStrokeRevision(value => value + 1);
  }

  function signatureValid() {
    const points = strokes.current.flat();
    if (points.length < 3) return false;
    const xs = points.map(value => value[0]);
    const ys = points.map(value => value[1]);
    return Math.max(...xs) - Math.min(...xs) >= 0.02 || Math.max(...ys) - Math.min(...ys) >= 0.02;
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!signatureValid()) { setError('서명 칸에 손글씨 서명을 입력해 주세요.'); return; }
    if (!consent) { setError('서명 제출 동의 항목을 확인해 주세요.'); return; }
    setBusy(true);
    setError('');
    try {
      const response = await fetch(`/api/care-log-sign/${token}?env=${environment}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signerName: name, strokes: strokes.current, consent }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || '서명을 제출하지 못했습니다.');
      setDone(true);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : '서명을 제출하지 못했습니다.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <p>간병24 · 모바일 간병일지</p>
        <h1>간병일지 확인·서명</h1>
        <span>받은 일지 내용을 확인하고 서명해 제출하세요.</span>
      </header>
      {loading ? <p className={styles.notice}>간병일지를 불러오는 중입니다…</p> : null}
      {!loading && error && !share ? <p className={styles.error} role="alert">{error}</p> : null}
      {share ? <>
        <section className={styles.record} aria-label="간병일지 내용">
          <h2>간병일지</h2>
          <p className={styles.date}>작성일 · {share.log_date}</p>
          {Object.entries(share.data || {}).filter(([key, value]) =>
            !key.toLowerCase().includes('attachment') && visibleValue(value),
          ).map(([key, value]) => (
            <details className={styles.section} key={key} open>
              <summary>{labels[key] || key}</summary>
              <pre>{printable(value)}</pre>
            </details>
          ))}
        </section>
        {done ? <section className={styles.success} role="status">
          <strong>서명이 제출되었습니다.</strong>
          <span>{share.signer_name || name} · {share.signed_at ? new Date(share.signed_at).toLocaleString('ko-KR') : '제출 완료'}</span>
        </section> : <form className={styles.form} onSubmit={submit}>
          <label className={styles.nameLabel}>서명자 이름
            <input value={name} onChange={event => setName(event.target.value)} maxLength={80} required autoComplete="name" />
          </label>
          <div className={styles.signatureHeading}><strong>손글씨 서명</strong><button type="button" onClick={clearSignature}>지우기</button></div>
          <canvas
            ref={canvas}
            className={styles.canvas}
            width={1000}
            height={300}
            aria-label="손글씨 서명 입력"
            onPointerDown={pointerDown}
            onPointerMove={pointerMove}
            onPointerUp={pointerUp}
            onPointerCancel={pointerUp}
          />
          <label className={styles.consent}>
            <input type="checkbox" checked={consent} onChange={event => setConsent(event.target.checked)} />
            <span>내용을 확인했고, 본인의 서명을 제출하는 데 동의합니다.</span>
          </label>
          {error ? <p className={styles.error} role="alert">{error}</p> : null}
          <button className={styles.submit} type="submit" disabled={busy}>
            {busy ? '제출 중…' : '서명 제출'}
          </button>
        </form>}
      </> : null}
      <footer className={styles.footer}>개인정보 보호를 위해 받은 분께만 링크를 전달해 주세요.</footer>
    </main>
  );
}
