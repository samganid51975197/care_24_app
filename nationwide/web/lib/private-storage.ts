import {mkdir,writeFile,readFile,unlink} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import {encryptBytes,decryptBytes} from './data-crypto.mjs';
function filePath(key:string) {
  if(!/^(board\/(공지사항|간병뉴스)|caregiver-documents)\/[a-f0-9-]{36}$/.test(key)) throw new Error('Invalid storage key');
  const root=process.env.CARE24_UPLOAD_DIR;
  if(!root) throw new Error('CARE24_UPLOAD_DIR is required');
  return resolve(root,key);
}
export const privateBucket={
  async put(key:string,stream:ReadableStream,options:{httpMetadata:{contentType:string}}) {
    const path=filePath(key); await mkdir(dirname(path),{recursive:true,mode:0o700});
    await writeFile(path,encryptBytes(Buffer.from(await new Response(stream).arrayBuffer()),'upload:'+key),{mode:0o600,flag:'wx'});
    await writeFile(path+'.json',encryptBytes(Buffer.from(JSON.stringify(options.httpMetadata)),'metadata:'+key),{mode:0o600,flag:'wx'});
  },
  async get(key:string) {
    const path=filePath(key);
    try { const body=decryptBytes(await readFile(path),'upload:'+key); const metadata=JSON.parse(decryptBytes(await readFile(path+'.json'),'metadata:'+key).toString('utf8')); return {body,httpEtag:'',writeHttpMetadata(headers:Headers){headers.set('content-type',metadata.contentType || 'application/octet-stream');}}; }
    catch(e) {if((e as NodeJS.ErrnoException).code==='ENOENT')return null;throw e;}
  },
  async delete(key:string) { const path=filePath(key); await unlink(path); await unlink(path+'.json').catch(()=>{}); }
};
