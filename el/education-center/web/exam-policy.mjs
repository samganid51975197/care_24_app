export const examPolicy=Object.freeze({questions:80,passScore:70,durationMinutes:80,examFee:35000,certificateFee:10000,venue:'대한노인돌봄서비스협회(중앙회) 시험장'});
// 매월 첫째 토요일과 그 다음 날 일요일을 한 회차로 운영한다.
export function examDates(year,month){const first=new Date(Date.UTC(year,month-1,1));const saturday=1+(6-first.getUTCDay()+7)%7;return [saturday,saturday+1].map(day=>`${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`);}
export const eligibilityText='요양보호사 자격증 소지자 또는 대한노인돌봄서비스협회(중앙회)가 주관하는 간병사 일반교육을 이수하고 간병사 시험에 합격한 자';

export const levelOneEligibilityText='2급 자격 취득 후 관련 질환자를 현장에서 간병(돌봄)한 경력이 1년 이상인 2급 자격 소지자에 한합니다.';
