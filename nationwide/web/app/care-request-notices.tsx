import styles from './care-request-notices.module.css';

export default function CareRequestNotices() {
  return <aside className={styles.notices} aria-label="간병비 및 개인정보 안내">
    <p className={styles.fee}><strong>간병비 안내</strong><span>간병비는 회사에서 상황을 확인한 뒤 책정해 별도로 안내합니다.</span></p>
    <p className={styles.privacy}><strong>비공개 정보 안내</strong><span>간병비, 성명·연락처, 질환·돌봄 내용, 건물·층·병실·침상 정보는 공개하지 않습니다.</span></p>
  </aside>;
}
