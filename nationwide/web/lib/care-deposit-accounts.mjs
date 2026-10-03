export const careDepositAccounts=[{bank:'우리은행',account:'1005-804-669803',holder:'대한노인돌봄서비스협회(중앙회)'}];
export const depositGuide='[간병비 입금계좌]\n'+careDepositAccounts.map(a=>a.bank+' '+a.account+' / 예금주: '+a.holder).join('\n')+'\n위 협회 중앙회 계좌로 입금해 주세요.';
export function withDepositGuide(body){return careDepositAccounts.every(a=>body.includes(a.account))?body:body.trim()+'\n\n'+depositGuide;}
