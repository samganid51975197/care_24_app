import fs from 'node:fs';
import {createClient} from '@libsql/client';
import {hospitalRecord} from '../lib/hospital-selection.mjs';
const catalog=JSON.parse(fs.readFileSync(new URL('../lib/hospital-catalog.json',import.meta.url),'utf8'));
const db=createClient({url:process.env.CARE24_DATABASE_URL});
let inserted=0;
const tx=await db.transaction('write');
try{
 for(const h of catalog){if(await hospitalRecord(tx,catalog,h.id))continue;await tx.execute({sql:'INSERT INTO auth_hospitals(id,name) VALUES(?,?)',args:[h.id,catalog.filter(other=>other.name===h.name).length>1?`${h.name} (${[h.region,h.city].filter(Boolean).join(' ')} · ${h.id})`:h.name]});inserted++;}
 await tx.commit();console.log('Hospital directory synchronized:',inserted,'added');
}catch(e){await tx.rollback();throw e;}finally{db.close();}
