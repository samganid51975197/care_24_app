import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const textFiles=['rehabilitation.js','rehabilitation.css','index.html','styles.css','directory.css','care.css','finder.css','brand-standard.css','hospitals.js','care-facilities.js','app.js','care-review.js','room-edit.js','admin-login.js','auth-controls.js','ward-config.js','ward-board.js','ward-board.css','manifest.webmanifest','sw.js'];
const binaryFiles=['assets/rehabilitation-reference.png','assets/care24-brand.webp','assets/care24-logo-original.png','assets/snubh-logo.png','assets/hichart.png','assets/icon-192.png','assets/icon-512.png','assets/icon.svg'];
const textAssets=Object.fromEntries(textFiles.map(name=>['/'+name,fs.readFileSync(path.join(root,name),'utf8')]));
textAssets['/']=textAssets['/index.html'];
const binaryAssets=Object.fromEntries(binaryFiles.map(name=>['/'+name,fs.readFileSync(path.join(root,name)).toString('base64')]));
const template=fs.readFileSync(path.join(root,'worker-template.js'),'utf8')+'\n'+fs.readFileSync(path.join(root,'server-auth.js'),'utf8');
fs.mkdirSync(path.join(root,'dist/server'),{recursive:true});
fs.writeFileSync(path.join(root,'dist/server/index.js'),template.replace('__TEXT_ASSETS__',JSON.stringify(textAssets)).replace('__BINARY_ASSETS__',JSON.stringify(binaryAssets)));

for(const name of [...textFiles,...binaryFiles]){fs.mkdirSync(path.dirname(path.join(root,'dist',name)),{recursive:true});fs.copyFileSync(path.join(root,name),path.join(root,'dist',name));}
