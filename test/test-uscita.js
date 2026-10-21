const {JSDOM}=require('jsdom');const fs=require('fs');
const html=fs.readFileSync('../sito/index.html','utf8');
const dom=new JSDOM(html,{runScripts:'dangerously',url:'https://x.test/',pretendToBeVisual:true});
const w=dom.window,d=w.document;w.scrollTo=()=>{};
const errs=[];w.addEventListener('error',e=>errs.push(e.message));
const click=sel=>{const el=d.querySelector(sel);if(!el)throw new Error('missing '+sel);el.click();};
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const title=()=>d.querySelector('h1').textContent,ex=()=>d.getElementById('exit').hidden;
(async()=>{
 console.log('start',title(),'exit hidden:',ex(),'len',w.history.length);
 w.history.back();await wait(80);console.log('back at root → exit hidden:',ex(),title());
 click('[data-a="exit-no"]');console.log('Resta → hidden:',ex());
 w.history.back();await wait(80);console.log('back again → hidden:',ex());
 click('[data-a="exit-no"]');
 click('[data-a="profile"][data-id="lui"]');await wait(50);console.log('profile',title());
 w.history.back();await wait(80);console.log('back from Oggi →',title(),'exit hidden:',ex());
 console.log('errors',errs);
})();
