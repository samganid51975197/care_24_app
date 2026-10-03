"use client";
import { useEffect, useState } from "react";
import { Download, Share, X } from "lucide-react";

interface InstallPromptEvent extends Event { prompt: () => Promise<void>; userChoice: Promise<{ outcome: "accepted" | "dismissed" }> }

export default function PwaInstall() {
  const [promptEvent, setPromptEvent] = useState<InstallPromptEvent | null>(null);
  const [showIosHelp, setShowIosHelp] = useState(false);
  const [visible, setVisible] = useState(false);
  const [installed, setInstalled] = useState(true);
  useEffect(() => {
    if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    const standalone = window.matchMedia("(display-mode: standalone)").matches || ("standalone" in navigator && Boolean((navigator as Navigator & { standalone?: boolean }).standalone));
    setInstalled(standalone);
    if (standalone) return;
    if (/iphone|ipad|ipod/i.test(navigator.userAgent)) setShowIosHelp(true);
    const onPrompt = (event: Event) => { event.preventDefault(); setPromptEvent(event as InstallPromptEvent); };
    const onInstalled = () => { setVisible(false); setInstalled(true); };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => { window.removeEventListener("beforeinstallprompt", onPrompt); window.removeEventListener("appinstalled", onInstalled); };
  }, []);
  function dismiss() { setVisible(false); }
  async function install() { if (!promptEvent) { setVisible(true); return; } await promptEvent.prompt(); const result = await promptEvent.userChoice; if (result.outcome === "accepted") setVisible(false); setPromptEvent(null); }
  if (installed) return null;
  return <><button className="pwa-install-trigger" type="button" onClick={install} aria-label="간병24 앱 설치"><img src="/icons/icon-192.png" alt="간병24 앱 설치" /><span><Download aria-hidden="true" />앱 설치</span></button>{visible && <aside className="pwa-install" aria-label="간병24 스마트폰 앱 설치 안내">
    <img src="/icons/icon-192.png" alt="" />
    <div><b>간병24를 스마트폰 앱으로 사용하세요</b>{showIosHelp ? <p><Share aria-hidden="true" /> 공유 버튼을 누른 뒤 <strong>홈 화면에 추가</strong>를 선택하세요.</p> : <p>브라우저 메뉴에서 <strong>앱 설치</strong> 또는 <strong>홈 화면에 추가</strong>를 선택하세요.</p>}</div>
    <button className="pwa-close" type="button" onClick={dismiss} aria-label="설치 안내 닫기"><X /></button>
  </aside>}</>;
}
