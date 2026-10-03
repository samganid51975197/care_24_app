import {createClient} from '@libsql/client';
import {mkdir,readFile,writeFile,readdir,rename,unlink,stat} from 'node:fs/promises';
import {resolve,relative,join} from 'node:path';
import {createHash,randomUUID} from 'node:crypto';
import {encryptBytes,decryptBytes,encryptText,decryptText,prefix} from '../lib/data-crypto.mjs';
import {protectedFields} from '../lib/protected-fields.mjs';
const dbUrl=process.env.CARE24_DATABASE_URL,uploads=process.env.CARE24_UPLOAD_DIR;
if(!dbUrl?.startsWith('file:')||!uploads)throw Error('Database and private upload paths are required');
// Validate the key before reading or changing data.
if(decryptBytes(encryptBytes(Buffer.from('test'),'self-test'),'self-test').toString()!=='test')throw Error('Crypto self-test failed');
await mkdir('.private',{recursive:true,mode:0o700});
await writeFile('.private/encryption-maintenance','maintenance',{mode:0o600});
const backupDir=resolve('.private/encrypted-backups',new Date().toISOString().replaceAll(':','-'));
await mkdir(backupDir,{recursive:true,mode:0o700});
const db=createClient({url:dbUrl});
await db.execute('PRAGMA busy_timeout=10000');
const snapshot=join(backupDir,'snapshot.tmp.db');
await db.execute({sql:'VACUUM INTO ?',args:[snapshot]});
const original=await readFile(snapshot),encryptedBackup=encryptBytes(original,'backup:database');
if(!decryptBytes(encryptedBackup,'backup:database').equals(original))throw Error('Backup verification failed');
await writeFile(join(backupDir,'database.enc'),encryptedBackup,{flag:'wx',mode:0o600});
await unlink(snapshot);
const counts={};
const tx=await db.transaction('write');
try{
 for(const[table,fields]of Object.entries(protectedFields)){
  const rows=(await tx.execute(`SELECT id,${fields.join(',')} FROM ${table}`)).rows;
  let changed=0;
  for(const row of rows){const names=[],values=[];
   for(const field of fields){const value=String(row[field]??'');
    if(value.startsWith(prefix)){decryptText(value,`${table}.${field}`);continue;}
    if(!value)continue;
    const encrypted=encryptText(value,`${table}.${field}`);if(decryptText(encrypted,`${table}.${field}`)!==value)throw Error('Field verification failed');
    names.push(field+'=?');values.push(encrypted);
   }
   if(names.length){await tx.execute({sql:`UPDATE ${table} SET ${names.join(',')} WHERE id=?`,args:[...values,row.id]});changed++;}
  }
  counts[table]={rows:rows.length,converted:changed};
 }
 await tx.commit();
}catch(e){await tx.rollback();throw e;}finally{tx.close();}
let files=0;
async function walk(dir){let entries;try{entries=await readdir(dir,{withFileTypes:true});}catch(e){if(e.code==='ENOENT')return;throw e;}
 for(const entry of entries){const path=join(dir,entry.name);if(entry.isSymbolicLink())throw Error('Upload symlink rejected');if(entry.isDirectory()){await walk(path);continue;}
  const rel=relative(resolve(uploads),path).replaceAll('\\','/');
  if(!/^(board\/(공지사항|간병뉴스)|caregiver-documents)\/[a-f0-9-]{36}(\.json)?$/.test(rel))throw Error('Unrecognized file in private uploads');
  const key=rel.endsWith('.json')?rel.slice(0,-5):rel,context=(rel.endsWith('.json')?'metadata:':'upload:')+key;
  const data=await readFile(path);
  if(data.subarray(0,prefix.length).toString()===prefix){decryptBytes(data,context);continue;}
  const encrypted=encryptBytes(data,context);if(!decryptBytes(encrypted,context).equals(data))throw Error('Upload verification failed');
  const backupName=createHash('sha256').update(rel).digest('hex')+'.enc';
  await writeFile(join(backupDir,backupName),encrypted,{flag:'wx',mode:0o600});
  const temp=path+'.encrypting-'+randomUUID();await writeFile(temp,encrypted,{flag:'wx',mode:0o600});await rename(temp,path);files++;
 }
}
await walk(resolve(uploads));
await db.execute('PRAGMA wal_checkpoint(TRUNCATE)');
await db.execute('VACUUM');
await db.execute('PRAGMA wal_checkpoint(TRUNCATE)');
await writeFile(join(backupDir,'report.json'),JSON.stringify({counts,files,date:new Date().toISOString()},null,2),{mode:0o600});
db.close();
await unlink('.private/encryption-maintenance');
console.log(JSON.stringify({counts,files,backupDir}));
