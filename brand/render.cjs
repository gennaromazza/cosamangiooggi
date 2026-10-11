const { chromium } = require('/opt/node-tools/node_modules/playwright');
const fs=require('fs');
const jobs=[
 ['public/icon.svg','public/icon-192.png',192,false],
 ['public/icon.svg','public/icon-512.png',512,false],
 ['brand/icon-maskable.svg','public/icon-maskable-512.png',512,false],
 ['brand/icon-maskable.svg','public/apple-touch-icon.png',180,false],
 ['public/icon.svg','public/favicon-32.png',32,false],
 ['brand/icon-only.svg','assets/icon-only.png',1024,false],
 ['brand/foreground.svg','assets/icon-foreground.png',1024,true],
 ['brand/background.svg','assets/icon-background.png',1024,false],
];
(async()=>{
 fs.mkdirSync('assets',{recursive:true});
 const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
 for(const [src,out,size,transparent] of jobs){
  const p=await b.newPage({viewport:{width:size,height:size}});
  const svg=fs.readFileSync(src,'utf8');
  await p.setContent(`<style>html,body{margin:0;background:transparent}svg{width:${size}px;height:${size}px;display:block}</style>${svg}`);
  await p.screenshot({path:out,omitBackground:true});
  await p.close();
 }
 await b.close();
})();
