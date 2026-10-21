const {JSDOM}=require('jsdom');const fs=require('fs');const util=require('util');const crypto=require('crypto');
const html=fs.readFileSync('../sito/index.html','utf8');
// mock GitHub
const server={files:{},calls:[]};
function mockFetch(url,opt){opt=opt||{};const m=(opt.method||'GET');server.calls.push(m+' '+url.replace('https://api.github.com',''));
 const auth=opt.headers&&opt.headers.Authorization;
 const res=(status,body)=>Promise.resolve({status,ok:status>=200&&status<300,json:async()=>body});
 if(!url.startsWith('https://api.github.com/repos/'))return Promise.reject(new TypeError('Failed to fetch'));
 if(auth!=='Bearer good')return res(401,{});
 const rest=url.replace('https://api.github.com/repos/','');
 if(!rest.startsWith('me/data'))return res(404,{});
 const sub=rest.slice('me/data'.length);
 if(sub==='')return res(200,{});
 const f=sub.replace('/contents/','');
 if(m==='GET'){const x=server.files[f];return x?res(200,{sha:x.sha,content:x.content}):res(404,{});}
 if(m==='PUT'){const b=JSON.parse(opt.body);const x=server.files[f];
   if(x&&b.sha!==x.sha)return res(409,{}); if(!x&&b.sha)return res(422,{});
   server.files[f]={sha:crypto.randomBytes(6).toString('hex'),content:b.content};return res(200,{});}
 return res(405,{});}
function device(){
 const dom=new JSDOM(html,{runScripts:'dangerously',url:'https://x.test/',pretendToBeVisual:true,beforeParse(w){w.TextEncoder=util.TextEncoder;w.TextDecoder=util.TextDecoder;w.fetch=mockFetch;w.scrollTo=()=>{};}});
 const w=dom.window,d=w.document;
 return {w,d,click:sel=>{const el=d.querySelector(sel);if(!el)throw new Error('missing '+sel+' in view '+d.querySelector('h1').textContent);el.click();},
   wait:ms=>new Promise(r=>setTimeout(r,ms)),h1:()=>d.querySelector('h1').textContent,errs:[]};
}
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const remote=()=>{const x=server.files['scheda-palestra-dati.json'];return x?JSON.parse(Buffer.from(x.content,'base64').toString('utf8')):null;};
async function setup(dv,repo,token){if(dv.h1()!=='Sincronizzazione')dv.click('[data-a="sync-open"]');dv.d.getElementById('sync-repo').value=repo;dv.d.getElementById('sync-token').value=token;dv.click('[data-a="sync-save"]');await wait(300);}
async function workout(dv,profId,i){dv.click('[data-a="profile"][data-id="'+profId+'"]');await wait(30);dv.click('[data-a="open"][data-i="'+i+'"]');dv.click('.set');dv.click('[data-a="finish"]');await wait(30);toP(dv);}
function toP(dv){ if(dv.h1()==='Chi si allena?')return; if(!dv.d.querySelector('[data-a="profiles"]')){ if(dv.d.querySelector('[data-a="back"]'))dv.click('[data-a="back"]'); else dv.click('.nav [data-v="home"]'); } dv.click('[data-a="profiles"]'); }
const ok=(c,m)=>console.log((c?'PASS ':'FAIL ')+m);
(async()=>{
 const A=device(),B=device();A.w.addEventListener('error',e=>A.errs.push(e.message));B.w.addEventListener('error',e=>B.errs.push(e.message));
 // wrong token
 await setup(A,'me/data','bad');ok(/token non valido/.test(A.d.querySelector('.syncmsg').textContent),'token errato mostra errore: '+A.d.querySelector('.syncmsg').textContent);
 // wrong repo
 await setup(A,'me/altro','good');ok(/repository non trovato/.test(A.d.querySelector('.syncmsg').textContent),'repo errato mostra errore');
 // A: work, then configure properly
 A.click('[data-a="sync-back"]');
 await workout(A,'lui',0);
 await setup(A,'me/data','good');
 ok(A.h1()==='Chi si allena?','A torna alla home dopo sync ok');
 let r=remote();ok(r&&r.profiles.lui.state.history.length===1,'A ha pubblicato 1 allenamento di lui');
 // B fresh
 await setup(B,'me/data','good');
 ok(/Ultimo allenamento/.test(B.d.querySelector('.sess .meta').textContent),'B vede l\'allenamento di A nella home: '+B.d.querySelector('.sess .meta').textContent);
 B.click('[data-a="profile"][data-id="lui"]');await B.wait(30);B.click('.nav [data-v="history"]');
 ok(B.d.querySelectorAll('.hist').length===1,'B ha lo storico di A');
 toP(B);
 // conflict: both do a workout, sync in turn
 await wait(5);await workout(A,'lui',1);await wait(5);await workout(B,'lui',2);
 A.click('[data-a="sync-now"]');await wait(300);B.click('[data-a="sync-now"]');await wait(300);A.click('[data-a="sync-now"]');await wait(300);
 r=remote();ok(r.profiles.lui.state.history.length===3,'dopo conflitto il remoto ha 3 allenamenti (no perdite): '+r.profiles.lui.state.history.length);
 A.click('[data-a="profile"][data-id="lui"]');await wait(30);A.click('.nav [data-v="history"]');
 ok(A.d.querySelectorAll('.hist').length===3,'A mostra 3 allenamenti uniti');
 // plan edit on B propagates to A
 B.click('[data-a="profile"][data-id="lui"]');await wait(30);B.click('.nav [data-v="phases"]');B.click('[data-a="ed-phase"]');B.click('[data-a="ed-sess"]');B.click('[data-a="ed-ex"]');
 const n=B.d.querySelector('input[data-f="n"]');n.value='Leg Press MODIFICATA';n.dispatchEvent(new B.w.Event('input',{bubbles:true}));
 B.click('[data-a="ed-back"]');B.click('[data-a="ed-back"]');B.click('[data-a="ed-back"]');toP(B);
 B.click('[data-a="sync-now"]');await wait(300);
 toP(A);A.click('[data-a="sync-now"]');await wait(300);
 A.click('[data-a="profile"][data-id="lui"]');await wait(30);A.click('[data-a="open"][data-i="0"]');
 ok(/Leg Press MODIFICATA/.test(A.d.getElementById('app').textContent),'la modifica alla scheda fatta su B compare su A');
 A.click('[data-a="back"]');A.click('.nav [data-v="history"]');
 // reset history on A propagates
 A.click('[data-a="reset-ask"]');A.click('[data-a="reset-yes"]');toP(A);A.click('[data-a="sync-now"]');await wait(300);
 toP(B);B.click('[data-a="sync-now"]');await wait(300);
 r=remote();ok(r.profiles.lui.state.history.length===0,'reset storico propagato sul remoto');
 B.click('[data-a="profile"][data-id="lui"]');await wait(30);B.click('.nav [data-v="history"]');
 ok(B.d.querySelectorAll('.hist').length===0,'B dopo il sync non ha più storico');
 // offline
 const keep=A.w.fetch;A.w.fetch=()=>Promise.reject(new TypeError('Failed to fetch'));toP(A);A.click('[data-a="sync-now"]');await wait(100);
 ok(/nessuna connessione/.test(A.d.querySelector('.syncmsg').textContent),'offline: messaggio chiaro');
 console.log('errors A/B:',A.errs,B.errs);
 process.exit(0);
})().catch(e=>{console.error('TEST ERROR',e.message);process.exit(1);});
