const {JSDOM}=require('jsdom');const fs=require('fs');const util=require('util');
const html=fs.readFileSync('../sito/index.html','utf8');
const days=n=>new Date(Date.now()+n*86400000);
function run(label,hdrDate,manual){return new Promise(async res=>{
 const files={};
 const f=(url,opt)=>{opt=opt||{};const m=opt.method||'GET';const r=(st,b,h)=>Promise.resolve({status:st,ok:st<300,json:async()=>b,headers:{get:k=>h&&h[k]||null}});
  if(opt.headers.Authorization!=='Bearer good')return r(401,{});
  const rest=url.replace('https://api.github.com/repos/me/data','');
  const hd=hdrDate?{'github-authentication-token-expiration':hdrDate}:null;
  if(rest==='')return r(200,{},hd);
  if(m==='GET')return files.x?r(200,{sha:'s1',content:files.x},hd):r(404,{},hd);
  files.x=JSON.parse(opt.body).content;return r(200,{},hd);};
 const dom=new JSDOM(html,{runScripts:'dangerously',url:'https://x.test/',pretendToBeVisual:true,beforeParse(w){w.TextEncoder=util.TextEncoder;w.TextDecoder=util.TextDecoder;w.fetch=f;w.scrollTo=()=>{};}});
 const d=dom.window.document,w=dom.window,wait=ms=>new Promise(r=>setTimeout(r,ms));
 const foot=()=>d.getElementById('foot');
 console.log('['+label+'] senza sync:',foot().textContent);
 d.querySelector('[data-a="sync-open"]').click();
 d.getElementById('sync-repo').value='me/data';d.getElementById('sync-token').value='good';if(manual)d.getElementById('sync-exp').value=manual;
 d.querySelector('[data-a="sync-save"]').click();await wait(300);
 console.log('['+label+'] con sync:',foot().textContent,'| warn:',foot().classList.contains('warn'));
 res();});}
(async()=>{
 const fmt=d=>d.toISOString().replace('T',' ').replace(/\.\d+Z/,' UTC');
 await run('header 30 giorni',fmt(days(30)),null);
 await run('header 3 giorni',fmt(days(3)),null);
 await run('solo data manuale +10',null,days(10).toISOString().slice(0,10));
 await run('scaduto',null,days(-2).toISOString().slice(0,10));
 await run('nessuna info',null,null);
 process.exit(0);})();
