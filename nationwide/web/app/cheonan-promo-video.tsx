import styles from "./cheonan-promo-video.module.css";

const cheonanHospitalIds = new Set([
  "hospital-108",
  "hospice-official-23",
  "hira-a095a1911256b9bc",
]);

export default function CheonanPromoVideo({ hospitalId }: { hospitalId?: string }) {
  if (!hospitalId || !cheonanHospitalIds.has(hospitalId)) return null;

  return (
    <section className={styles.promo} aria-labelledby="cheonan-promo-title">
      <h2 id="cheonan-promo-title">간병24 공통 홍보영상</h2>
      <p>간병24 서비스 안내 · 약 33초</p>
      <video
        className={styles.video}
        controls
        playsInline
        preload="none"
        aria-label="간병24 공통 홍보영상, 약 33초"
        src="https://resource2.heygen.ai/video_translate/b42b73393f164b5591e0a632a7c3c163/original.mp4"
      />
      <p><a href="https://app.heygen.com/videos/b42b73393f164b5591e0a632a7c3c163" target="_blank" rel="noopener noreferrer">영상이 재생되지 않으면 HeyGen에서 열기 ↗</a></p>
    </section>
  );
}
