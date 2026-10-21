const {JSDOM}=require('jsdom');const fs=require('fs');
const html=fs.readFileSync('../sito/index.html','utf8');
const dom=new JSDOM(html,{runScripts:'dangerously',url:'https://x.test/',pretendToBeVisual:true});
const w=dom.window,d=w.document;w.scrollTo=()=>{};
const errs=[];w.addEventListener('error',e=>errs.push(e.message));
const click=sel=>{const el=d.querySelector(sel);if(!el)throw new Error('missing '+sel);el.click();};
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const title=()=>d.querySelector('h1').textContent;
(async()=>{
 click('[data-a="profile"][data-id="lui"]');await wait(50);console.log('1',title());
 click('[data-a="open"][data-i="0"]');console.log('2 workout',title());
 w.history.back();await wait(80);console.log('back→',title());
 click('.nav [data-v="phases"]');click('[data-a="ed-phase"]');console.log('edit',title());
 w.history.back();await wait(80);console.log('back→',title());
 w.history.back();await wait(80);console.log('back→',title());
 w.history.back();await wait(80);console.log('back→',title(), d.querySelector('.nav').hidden);
 w.history.forward();await wait(80);console.log('fwd→',title());
 console.log('errors',errs);
})();
