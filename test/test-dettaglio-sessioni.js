const {JSDOM}=require('jsdom');const fs=require('fs');const util=require('util');const crypto=require('crypto');
const html=fs.readFileSync('../sito/index.html','utf8');
const server={x:null};
const f=(url,opt)=>{opt=opt||{};const m=opt.method||'GET';const r=(st,b)=>Promise.resolve({status:st,ok:st<300,json:async()=>b,headers:{get:()=>null}});
 if(opt.headers.Authorization!=='Bearer good')return r(401,{});
 const rest=url.replace('https://api.github.com/repos/me/data','');
 if(rest==='')return r(200,{});
 if(m==='GET')return server.x?r(200,{sha:server.x.sha,content:server.x.content}):r(404,{});
 const b=JSON.parse(opt.body);if(server.x&&b.sha!==server.x.sha)return r(409,{});server.x={sha:crypto.randomBytes(5).toString('hex'),content:b.content};return r(200,{});};
const wait=ms=>new Promise(r=>setTimeout(r,ms));
function dev(){const dom=new JSDOM(html,{runScripts:'dangerously',url:'https://x.test/',pretendToBeVisual:true,beforeParse(w){w.TextEncoder=util.TextEncoder;w.TextDecoder=util.TextDecoder;w.fetch=f;w.scrollTo=()=>{};}});
 const d=dom.window.document;return {w:dom.window,d,click:s=>{const e=d.querySelector(s);if(!e)throw new Error('missing '+s+' in '+d.querySelector('h1').textContent);e.click();},h1:()=>d.querySelector('h1').textContent};}
const ok=(c,m)=>console.log((c?'PASS ':'FAIL ')+m);
const toHome=dv=>{if(dv.h1()==='Chi si allena?')return;if(dv.d.querySelector('[data-a="back"]'))dv.click('[data-a="back"]');if(!dv.d.querySelector('[data-a="profiles"]'))dv.click('.nav [data-v="home"]');dv.click('[data-a="profiles"]');};
(async()=>{
 const A=dev();A.click('[data-a="profile"][data-id="lui"]');await wait(30);
 // Full Body 1: 8 esercizi. Spunta tutte le serie del primo, 1 sulla seconda, niente sul resto
 A.click('[data-a="open"][data-i="0"]');
 const sets=[...A.d.querySelectorAll('#ex0 .set')];sets.forEach(b=>b.click());
 A.d.querySelector('#ex1 .set').click();
 A.click('[data-a="finish"]');await wait(30);
 A.click('.nav [data-v="history"]');
 ok(A.d.querySelectorAll('button.hist').length===1,'sessione cliccabile nello storico');
 A.click('button.hist');
 const txt=A.d.getElementById('app').textContent;
 console.log('titolo:',A.h1(),'|',A.d.querySelector('.eyebrow').textContent);
 console.log('riepilogo:',[...A.d.querySelectorAll('b')].map(b=>b.textContent).filter(t=>t.startsWith('Esercizi')));
 const rows=[...A.d.querySelectorAll('.erow')].map(r=>r.querySelector('.exname').textContent+' → '+r.querySelector('.pill').textContent+' ('+r.querySelector('.scheme').textContent+')');
 console.log(rows.slice(0,3).join('\n'),'\n...',rows.length,'esercizi');
 ok(/Leg Press → Fatto \(3 di 3 serie · 50 kg\)/.test(rows[0]),'primo esercizio fatto con kg');
 ok(/Parziale \(1 di 3/.test(rows[1]),'secondo parziale');
 ok(/Non fatto \(0 di 3/.test(rows[2]),'terzo non fatto');
 A.w.history.back();await wait(60);ok(A.h1()==='Storico','indietro torna allo storico');
 // vecchia voce senza dettaglio
 const st=JSON.parse(A.w.localStorage.getItem('gym-state'));
 // ---- bug timestamp: reset poi nuovo allenamento deve sopravvivere al sync
 A.click('[data-a="reset-ask"]');A.click('[data-a="reset-yes"]');await wait(60);
 toHome(A);A.click('[data-a="profile"][data-id="lui"]');await wait(30);A.click('[data-a="open"][data-i="1"]');A.d.querySelector('#ex0 .set').click();A.click('[data-a="finish"]');await wait(30);
 toHome(A);
 A.click('[data-a="sync-open"]');A.d.getElementById('sync-repo').value='me/data';A.d.getElementById('sync-token').value='good';A.click('[data-a="sync-save"]');await wait(300);
 const B=dev();B.click('[data-a="sync-open"]');B.d.getElementById('sync-repo').value='me/data';B.d.getElementById('sync-token').value='good';B.click('[data-a="sync-save"]');await wait(300);
 B.click('[data-a="profile"][data-id="lui"]');await wait(30);B.click('.nav [data-v="history"]');
 console.log('B hist count:',B.d.querySelectorAll('button.hist').length,'A local hist:',JSON.parse(A.w.localStorage.getItem('gym-state')).history.length,'remote hist:',JSON.parse(Buffer.from(server.x.content,'base64').toString()).profiles.lui.state.history.length);ok(B.d.querySelectorAll('button.hist').length===1,'dopo reset, il nuovo allenamento passa dal sync (1 su B)');
 B.click('button.hist');ok(/Fatto|Parziale|Non fatto/.test(B.d.getElementById('app').textContent),'dettaglio arriva anche su B tramite sync');
 process.exit(0);})().catch(e=>{console.error('ERR',e.message);process.exit(1);});
