import {customType} from 'drizzle-orm/sqlite-core';
import {encryptText,decryptText} from '../lib/data-crypto.mjs';
export function encryptedText(column:string,context:string){return customType<{data:string;driverData:string}>({dataType(){return 'text';},toDriver(value){return encryptText(value,context);},fromDriver(value){return decryptText(value,context);}})(column);}
