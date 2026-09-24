export const careDepositAccounts=[{bank:'우리은행',account:'1005-804-669803',holder:'대한노인돌봄서비스협회(중앙회)'},{bank:'우리은행',account:'1005-304-803945',holder:'간병24'}];
export const depositGuide='[간병비 입금계좌]\n'+careDepositAccounts.map(a=>a.bank+' '+a.account+' / 예금주: '+a.holder).join('\n')+'\n협회(간병24)에서 안내받은 계좌 한 곳으로 입금해 주세요. 두 계좌 모두에 입금하는 것이 아닙니다.';
export function withDepositGuide(body){return careDepositAccounts.every(a=>body.includes(a.account))?body:body.trim()+'\n\n'+depositGuide;}
