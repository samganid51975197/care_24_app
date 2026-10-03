import { randomBytes, scrypt, timingSafeEqual, createHash } from 'node:crypto';
const options = { N: 32768, r: 8, p: 3, maxmem: 64 * 1024 * 1024 };
let running=0; const waiting=[];
async function derive(password,salt) {
  if(running>=2){if(waiting.length>=16)throw new Error('Password service busy');await new Promise(resolve=>waiting.push(resolve));}else running++;
  try{return await new Promise((resolve,reject)=>scrypt(password,salt,64,options,(e,key)=>e?reject(e):resolve(key)));}
  finally{const next=waiting.shift();if(next)next();else running--;}
}
export async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const key = await derive(password, salt);
  return `scrypt-v1$${salt}$${key.toString('hex')}`;
}
export async function verifyPassword(password, encoded) {
  const parts = String(encoded).split('$');
  if (parts.length !== 3 || parts[0] !== 'scrypt-v1' || !/^[a-f0-9]{32}$/.test(parts[1]) || !/^[a-f0-9]{128}$/.test(parts[2])) return false;
  const key = await derive(password, parts[1]);
  return timingSafeEqual(key, Buffer.from(parts[2], 'hex'));
}
export const newToken = () => randomBytes(32).toString('base64url');
export const tokenHash = token => createHash('sha256').update(token).digest('hex');
