import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./auth.css";
import AuthGate from "./auth-gate";
import PrivacyFooter from "./privacy-footer";

export const metadata: Metadata = {
  title: "분당서울대학교병원 통합간병 앱",
  description: "간병도우미 약정서와 간병활동 평가서 작성 및 간호사실 제출",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    shortcut: "/favicon.svg",
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "간병24", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0a6873",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased"><AuthGate>{children}</AuthGate><PrivacyFooter/></body>
    </html>
  );
}
