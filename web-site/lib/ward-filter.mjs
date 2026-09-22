export function inWard(entry, building, label) {
 if(entry.building!==building)return false;
 const compact=value=>String(value||'').replace(/\s/g,'');
 const selected=compact(label),stored=compact(entry.ward);
 const floorPart=selected.split('층')[0];
 const floor=compact(entry.floor).replace(/층$/,'');
 const explicit=selected.match(/·(\d{2,3})병동$/);
 if(explicit){
  const ward=explicit[1];
  if(stored===`${ward}병동`||stored===`${floorPart}층·${ward}병동`)return true;
  return floor===ward.slice(0,-1)&&stored===`${ward.slice(-1)}병동`;
 }
 const [start,end=start]=floorPart.split('~').map(Number);
 return stored===selected||(Number.isFinite(start)&&Number(floor)>=start&&Number(floor)<=end);
}

