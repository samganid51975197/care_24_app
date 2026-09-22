// Carry the selected hospital through shared workflow components.
export function hospitalFetch(input:string,init?:RequestInit){
 const match=typeof window!=='undefined'?window.location.pathname.match(/^\/hospitals\/([^/]+)\/?$/):null;
 const id=match?decodeURIComponent(match[1]):typeof window!=='undefined'&&window.location.pathname==='/'?'snubh':null;
 if(id&&input.startsWith('/api/')&&!input.startsWith('/api/auth/')){
  const url=new URL(input,window.location.origin);
  url.searchParams.set('hospital',id);
  return globalThis.fetch(url.pathname+url.search,init);
 }
 return globalThis.fetch(input,init);
}
