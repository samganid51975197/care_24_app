import {createCipheriv,createDecipheriv,randomBytes} from 'node:crypto';
import {readFileSync} from 'node:fs';
export const prefix='care24enc:v1:';
function keyring(){
 const path=process.env.CARE24_KEY_FILE;
 if(!path)throw new Error('Encryption key is not configured');
 const ring=JSON.parse(readFileSync(path,'utf8'));
 if(!/^[a-zA-Z0-9_-]{1,64}$/.test(ring.active)||!ring.keys?.[ring.active])throw new Error('Invalid encryption key configuration');
 return ring;
}
function key(ring,id){const value=ring.keys[id];if(typeof value!=='string'||!/^[A-Za-z0-9+/]{43}=$/.test(value))throw new Error('Encryption key unavailable');const k=Buffer.from(value,'base64');if(k.length!==32)throw new Error('Invalid key size');return k;}
export function encryptBytes(plain,context){
 const ring=keyring(),iv=randomBytes(12),cipher=createCipheriv('aes-256-gcm',key(ring,ring.active),iv,{authTagLength:16});
 cipher.setAAD(Buffer.from(context,'utf8'));
 const ciphertext=Buffer.concat([cipher.update(plain),cipher.final()]);
 return Buffer.from(prefix+[ring.active,iv.toString('base64'),cipher.getAuthTag().toString('base64'),ciphertext.toString('base64')].join(':'),'utf8');
}
export function decryptBytes(encoded,context){
 const text=Buffer.isBuffer(encoded)?encoded.toString('utf8'):String(encoded);
 if(!text.startsWith(prefix))throw new Error('Unencrypted protected data rejected');
 const parts=text.slice(prefix.length).split(':');if(parts.length!==4)throw new Error('Invalid encrypted data');
 const[id,ivText,tagText,ciphertext]=parts,iv=Buffer.from(ivText,'base64'),tag=Buffer.from(tagText,'base64');
 if(iv.length!==12||tag.length!==16)throw new Error('Invalid encrypted data');
 const decipher=createDecipheriv('aes-256-gcm',key(keyring(),id),iv,{authTagLength:16});
 decipher.setAAD(Buffer.from(context,'utf8'));decipher.setAuthTag(tag);
 return Buffer.concat([decipher.update(Buffer.from(ciphertext,'base64')),decipher.final()]);
}
export function encryptText(value,context){return value===''?'':encryptBytes(Buffer.from(value,'utf8'),context).toString('utf8');}
export function decryptText(value,context){if(value===''||value==='{}'||value==='[]'||(context==='document_bundles.criminal_result'&&value==='확인 대기'))return value;return decryptBytes(value,context).toString('utf8');}
