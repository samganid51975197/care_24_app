import fs from 'node:fs';
import vm from 'node:vm';
const root=new URL('../public/regional/',import.meta.url);
const context=vm.createContext({});
for(const file of ['hospitals.js','care-facilities.js','inpatient-hospitals.js','hospice-directory.js'])vm.runInContext(fs.readFileSync(new URL(file,root),'utf8'),context);
const rows=vm.runInContext('[...hospitals,...careFacilities,...hospiceDirectory]',context);
const unique=[...new Map(rows.map(h=>[h.id,h])).values()];
fs.writeFileSync(new URL('../lib/hospital-catalog.json',import.meta.url),JSON.stringify(unique,null,2));
console.log('Hospital catalog:',unique.length);
