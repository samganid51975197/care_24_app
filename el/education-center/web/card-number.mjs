export function cardNumber(year, sequence) {
  if (!/^\d{4}$/.test(String(year)) || !Number.isSafeInteger(sequence) || sequence < 1 || sequence > 999999) throw new Error('자격번호 순번 범위를 확인해 주세요.');
  return 'KCARE-' + year + '-' + String(sequence).padStart(6, '0');
}
export function reserveCardNumber(storage, year, next = false) {
  const key = 'care-card-sequence-v1-' + year;
  const saved = storage.getItem(key);
  const previous = saved === null ? 0 : Number(saved);
  if (!Number.isSafeInteger(previous) || previous < 0) throw new Error('저장된 순번을 확인할 수 없습니다.');
  const sequence = previous === 0 ? 1 : previous + (next ? 1 : 0);
  const number = cardNumber(year, sequence);
  storage.setItem(key, String(sequence));
  return number;
}
