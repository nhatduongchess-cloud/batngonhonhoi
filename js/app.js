


/* Standalone, offline page. No external assets, libraries, tracking or network requests.



   Reference curve: y = cbrt(x*x) + sqrt(3-x*x) * sin(m*pi*x).



   Its 3D extension uses z = .38 * sqrt(3-x*x) * cos(m*pi*x).



   The original synthesized note sequence below uses no sampled recording. */



(() => {



 'use strict';



 const $=id=>document.getElementById(id), canvas=$('heart'), ctx=canvas.getContext('2d');



 const reduced=matchMedia('(prefers-reduced-motion: reduce)');



 let paused=reduced.matches,w=0,h=0,time=0,last=0,raf=0,angle=0,drag=null,progress=0,activePage='welcome',nickname='';



 let curve=[],tier=-1,completionShown=false;



 const stars=Array.from({length:36},()=>({x:Math.random(),y:Math.random(),r:.4+Math.random(),p:Math.random()*6.28}));



 function buildCurve(){



  // Match the reference equation, adding an elliptical depth to its oscillations.



  // Higher slider values increase m; this changes geometry rather than opacity.



  const m=.2+99.8*(progress/100)**2,segments=Math.ceil(1000+m*65),depth=.38;



  curve=[];



  for(let i=0;i<=segments;i++){const x=-Math.sqrt(3)+2*Math.sqrt(3)*i/segments,envelope=Math.sqrt(Math.max(0,3-x*x)),phase=m*Math.PI*x;



   curve.push({x:x/1.8,y:-(Math.cbrt(x*x)+envelope*Math.sin(phase)-.6)/1.8,z:depth*envelope*Math.cos(phase)/1.8,p:i*.41});}



 }



 function project(p){const rot=angle+.12+Math.sin(time*.3)*.09,ca=Math.cos(rot),sa=Math.sin(rot),rx=p.x*ca+p.z*sa,rz=p.z*ca-p.x*sa,tilt=.07,y=p.y*Math.cos(tilt)-rz*Math.sin(tilt),z=p.y*Math.sin(tilt)+rz*Math.cos(tilt),perspective=4.5/(4.5+z),scale=Math.min(w*.40,h*.32);return{x:w/2+rx*scale*perspective,y:h*.47+y*scale*perspective,z};}



 function resize(){const rect=canvas.getBoundingClientRect();w=rect.width;h=rect.height;if(!w||!h)return;const dpr=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);ctx?.setTransform(dpr,0,0,dpr,0,0);draw();}



 function draw(){



  if(!ctx||!w||!h)return;ctx.clearRect(0,0,w,h);



  for(const s of stars){ctx.fillStyle=`rgba(237,203,223,${.12+.16*(1+Math.sin(time*.5+s.p))/2})`;ctx.beginPath();ctx.arc(s.x*w,s.y*h,s.r,0,Math.PI*2);ctx.fill();}



  const projected=curve.map(project);ctx.beginPath();for(let i=0;i<projected.length;i++){const p=projected[i];if(i===0)ctx.moveTo(p.x,p.y);else ctx.lineTo(p.x,p.y);}



  ctx.strokeStyle=progress>65?'#ef83b477':'#f79fc9ce';ctx.lineWidth=progress>65?.7:1.35;ctx.shadowColor='#ff87c6';ctx.shadowBlur=progress>60?2:7;ctx.stroke();ctx.shadowBlur=0;



  // Shimmering points follow the actual curve, including on partial drawings.



  const step=Math.max(2,Math.floor(curve.length/380));ctx.globalCompositeOperation='lighter';



  for(let i=0;i<projected.length;i+=step){const p=projected[i],glow=.3+.6*(1+Math.sin(time*1.3+curve[i].p))/2;ctx.fillStyle=`rgba(255,192,216,${glow})`;ctx.beginPath();ctx.arc(p.x,p.y,progress>60?1.05:.8,0,Math.PI*2);ctx.fill();}



  ctx.globalCompositeOperation='source-over';



  drawGrowingFlowers();



 }



 function frame(now){raf=0;if(paused||document.hidden||activePage!=='mainPage'||$('celebration').open)return;if(last)time+=Math.min((now-last)/1000,.05);last=now;draw();raf=requestAnimationFrame(frame);}



 function start(){last=0;if(!paused&&!document.hidden&&activePage==='mainPage'&&!$('celebration').open&&!raf)raf=requestAnimationFrame(frame);}



 function stopFrames(){cancelAnimationFrame(raf);raf=0;}



 reduced.addEventListener('change',e=>{paused=e.matches;if(paused){stopFrames();draw();}else start();});



 function setProgress(value){progress=Math.max(0,Math.min(100,Number(value)||0));$('drawProgress').value=String(progress);$('drawProgress').style.setProperty('--fill',progress+'%');$('progressValue').textContent=Math.round(progress)+'%';$('drawProgress').setAttribute('aria-valuetext',Math.round(progress)+' phần trăm, '+(progress===100?'trái tim hoàn thành':'đang vẽ trái tim'));



  const next=progress===100?4:progress>=65?3:progress>=30?2:progress>0?1:0;



  if(next!==tier){tier=next;$('drawStatus').textContent=['Kéo sang phải để bắt đầu nhé.','Thêm một chút yêu thương…','Trái tim đang hiện ra rồi!','Sắp xong rồi nhé ♡','Dành tặng bạn, trọn vẹn yêu thương ♡'][tier];$('drawStatus').classList.toggle('completion',tier===4);}



  canvas.setAttribute('aria-label','Trái tim đã vẽ '+Math.round(progress)+' phần trăm, hoa nở dần xung quanh. Kéo trên hình để xoay.');



  buildCurve();draw();



  if(progress<95)completionShown=false;



  if(progress===100&&!completionShown){completionShown=true;showCelebration();}



 }



 $('drawProgress').addEventListener('input',e=>setProgress(e.target.value));



 canvas.addEventListener('pointerdown',e=>{drag={x:e.clientX,angle};canvas.setPointerCapture(e.pointerId);});canvas.addEventListener('pointermove',e=>{if(drag){angle=drag.angle+(e.clientX-drag.x)*.008;draw();}});for(const event of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(event,()=>drag=null);



 document.addEventListener('visibilitychange',()=>{if(document.hidden)stopFrames();else start();});



 new ResizeObserver(resize).observe(canvas);buildCurve();





 let routeBusy=false;

 const modalMotions=new Set(),closingDialogs=new WeakSet();

 let modalEpoch=0;

 async function motion(element,frames,options={},bag){if(reduced.matches||document.hidden||!element.animate)return true;let animation;try{animation=element.animate(frames,{duration:280,easing:'cubic-bezier(.2,.7,.25,1)',...options});if(bag)bag.add(animation);await animation.finished;return true;}catch(e){return false;}finally{if(bag&&animation)bag.delete(animation);}}

 function sceneHeight(element){const style=getComputedStyle(element);return element.getBoundingClientRect().height+(parseFloat(style.marginTop)||0)+(parseFloat(style.marginBottom)||0);}


 const cuteEffects=new Map();
 function clearCuteEffects(container){const effect=cuteEffects.get(container);if(!effect)return;effect.animations.forEach(a=>a.cancel());effect.layer.remove();cuteEffects.delete(container);}

 function slowEndingCelebration(scene){
  if(reduced.matches||document.hidden)return;
  const container=scene.closest('dialog');if(!container||!container.open)return;clearCuteEffects(container);
  const layer=document.createElement('div');layer.className='cute-transition in-dialog ending-fireworks';layer.setAttribute('aria-hidden','true');layer.style.top=container.scrollTop+'px';
  const w=container.clientWidth,h=Math.min(innerHeight*.88,scene.scrollHeight+60),small=w<500;layer.style.height=h+'px';container.append(layer);
  const effect={layer,animations:[]};cuteEffects.set(container,effect);
  const run=(el,frames,opts)=>{if(!el.animate)return;effect.animations.push(el.animate(frames,{fill:'both',...opts}));};
  const colors=['#efb2d0','#d3b9ed','#f3d49d'];
  const bursts=[[.11,.16,0],[.90,.30,850],[.73,.075,1750]];
  bursts.forEach(([fx,fy,delay],index)=>{
   const x=w*fx,y=Math.max(28,Math.min(h*.52,h*fy)),color=colors[index],radius=small?43:69;
   const comet=document.createElement('i');comet.className='ending-firework-comet';comet.style.left=x+'px';comet.style.top=y+'px';comet.style.color=color;layer.append(comet);
   run(comet,[{opacity:0,transform:'translate(-50%,95px) scale(.6)'},{opacity:.6,offset:.35},{opacity:.6,offset:.8},{opacity:0,transform:'translate(-50%,0) scale(.8)'}],{delay,duration:1050,easing:'cubic-bezier(.25,.6,.3,1)'});
   for(let i=0;i<16;i++){
    const a=i*Math.PI*2/16,dx=Math.cos(a)*radius,dy=Math.sin(a)*radius;
    const ray=document.createElement('i');ray.className='ending-firework-ray';ray.style.left=x+'px';ray.style.top=y+'px';ray.style.color=color;layer.append(ray);
    const angle=a*180/Math.PI+90;
    run(ray,[{opacity:0,transform:`translate(-50%,-50%) rotate(${angle}deg) scale(.2)`},{opacity:.78,offset:.19},{opacity:.55,offset:.55,transform:`translate(calc(-50% + ${dx*.78}px),calc(-50% + ${dy*.78}px)) rotate(${angle}deg) scale(1)`},{opacity:0,transform:`translate(calc(-50% + ${dx}px),calc(-50% + ${dy+22}px)) rotate(${angle}deg) scale(.3)`}],{delay:delay+850,duration:2650,easing:'cubic-bezier(.16,.5,.3,1)'});
   }
  });
  const blooms=small?[[.07,.48,500],[.94,.61,1350],[.14,.08,2200],[.86,.11,950]]:[[.06,.50,500],[.95,.62,1350],[.24,.065,2200],[.83,.10,950],[.08,.75,1600],[.93,.43,2450]];
  blooms.forEach(([fx,fy,delay],index)=>{
   const flower=document.createElement('span');flower.className='ending-bloom';const size=small?31+(index%2)*7:43+(index%2)*10;flower.style.width=size+'px';flower.style.height=size+'px';flower.style.left=(w*fx-size/2)+'px';flower.style.top=(h*fy-size/2)+'px';
   const ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg');svg.setAttribute('viewBox','0 0 60 60');
   for(let petal=0;petal<5;petal++){const ellipse=document.createElementNS(ns,'ellipse');ellipse.setAttribute('cx','30');ellipse.setAttribute('cy','16');ellipse.setAttribute('rx','9');ellipse.setAttribute('ry','15');ellipse.setAttribute('fill',colors[index%colors.length]);ellipse.setAttribute('transform',`rotate(${petal*72} 30 30)`);svg.append(ellipse);}
   const center=document.createElementNS(ns,'circle');center.setAttribute('cx','30');center.setAttribute('cy','30');center.setAttribute('r','7');center.setAttribute('fill','#f5d49a');svg.append(center);flower.append(svg);layer.append(flower);
   run(flower,[{opacity:0,transform:'scale(.1) rotate(-35deg)'},{opacity:.9,transform:'scale(1) rotate(0deg)',offset:.43},{opacity:.78,transform:'scale(1.06) rotate(9deg)',offset:.72},{opacity:0,transform:'translateY(-13px) scale(.92) rotate(18deg)'}],{delay,duration:3200,easing:'ease-in-out'});
  });
  // The card remains interactive while the slow decorative sequence plays.
  for(const [i,el]of [$('recipientPortrait'),$('endingDecor')].entries()){if(!el.hidden)run(el,[{opacity:0,translate:'0 15px',scale:'.96'},{opacity:1,translate:'0 0',scale:'1'}],{duration:1450,delay:i*220,easing:'cubic-bezier(.2,.65,.25,1)'});}
  Promise.allSettled(effect.animations.map(a=>a.finished)).then(()=>{if(cuteEffects.get(container)===effect){layer.remove();cuteEffects.delete(container);}});
 }

 function cuteEntrance(scene,kind='page'){
  if(kind==='ending'){slowEndingCelebration(scene);return;}
  if(reduced.matches||document.hidden)return;
  const container=scene.closest('dialog')||document.body;clearCuteEffects(container);
  const layer=document.createElement('div');layer.className='cute-transition'+(container===document.body?'':' in-dialog');layer.setAttribute('aria-hidden','true');
  const inDialog=container!==document.body,cw=inDialog?container.clientWidth:innerWidth,ch=inDialog?container.clientHeight:innerHeight;
  if(inDialog){layer.style.top=container.scrollTop+'px';layer.style.height=ch+'px';}
  container.append(layer);const effect={layer,animations:[]};cuteEffects.set(container,effect);
  const anchor=kind==='unlock'?$('welcomeTitle'):kind==='ending'?$('recipientPortrait'):scene.querySelector('h1,h2')||scene;
  const rect=anchor.getBoundingClientRect(),base=inDialog?container.getBoundingClientRect():{left:0,top:0};
  const x=Math.max(40,Math.min(cw-40,rect.left+rect.width*.5-base.left)),y=Math.max(55,Math.min(ch*.55,rect.top+rect.height*.5-base.top));
  const run=(el,frames,options)=>{if(!el.animate)return;const a=el.animate(frames,options);effect.animations.push(a);};
  const halo=document.createElement('i');halo.className='cute-halo';halo.style.left=x+'px';halo.style.top=y+'px';layer.append(halo);
  run(halo,[{opacity:0,transform:'scale(.35)'},{opacity:.75,transform:'scale(1)',offset:.22},{opacity:0,transform:'scale(2.3)'}],{duration:700,easing:'ease-out'});
  const count=innerWidth<600?9:13,reach=innerWidth<600?100:155;
  for(let i=0;i<count;i++){
   const bit=document.createElement('span'),petal=i%3===0;bit.className='cute-bit'+(petal?' petal':'');bit.textContent=petal?'':i%2?'♥':'✦';bit.style.left=x+'px';bit.style.top=y+'px';bit.style.color=i%2?'#f0b2cd':'#cfb8e4';layer.append(bit);
   const angle=(i/count)*Math.PI*2,dx=Math.cos(angle)*reach*(.7+(i%3)*.15),dy=Math.sin(angle)*reach*.65-28;
   run(bit,[{opacity:0,transform:'translate(-50%,-50%) scale(.25) rotate(0deg)'},{opacity:.88,offset:.18},{opacity:0,transform:`translate(calc(-50% + ${dx}px),calc(-50% + ${dy}px)) scale(.85) rotate(${i%2?75:-65}deg)`}],{duration:680+(i%3)*75,delay:i*18,easing:'cubic-bezier(.16,.68,.3,1)'});
  }
  const targets=kind==='ending'?[$('recipientPortrait'),$('endingDecor')]:kind==='unlock'?[]:scene.id==='guide'?[...scene.querySelectorAll('.step')]:scene.id==='mainPage'?[...scene.querySelectorAll('.intro,.audio-panel')]:[];
  targets.forEach((el,i)=>{if(el.hidden)return;run(el,[{opacity:0,translate:'0 12px',scale:'.93'},{opacity:1,translate:'0 -2px',scale:'1.015',offset:.73},{opacity:1,translate:'0 0',scale:'1'}],{duration:480,delay:i*60,easing:'cubic-bezier(.2,.7,.25,1)'});});
  Promise.allSettled(effect.animations.map(a=>a.finished)).then(()=>{if(cuteEffects.get(container)===effect){layer.remove();cuteEffects.delete(container);}});
 }
 reduced.addEventListener('change',()=>{if(reduced.matches)for(const container of [...cuteEffects.keys()])clearCuteEffects(container);});
 document.addEventListener('visibilitychange',()=>{if(document.hidden)for(const container of [...cuteEffects.keys()])clearCuteEffects(container);});

 async function route(id,focusId){if(routeBusy||id===activePage)return false;routeBusy=true;const host=$('sceneHost'),outgoing=$(activePage),incoming=$(id);const oldHeight=host.getBoundingClientRect().height;outgoing.inert=true;stopFrames();host.style.height=oldHeight+'px';host.classList.add('is-changing');try{await motion(outgoing,[{opacity:1,transform:'translateY(0)'},{opacity:0,transform:'translateY(-8px)'}],{duration:150});if(id==='welcome')resetCardEntry();activePage=id;for(const section of ['welcome','guide','mainPage'])$(section).hidden=section!==id;incoming.inert=true;window.scrollTo({top:0,behavior:'instant'});if(id==='mainPage')resize();if(id!=='welcome')cuteEntrance(incoming);const newHeight=sceneHeight(incoming);await Promise.all([motion(host,[{height:oldHeight+'px'},{height:newHeight+'px'}],{duration:300}),motion(incoming,[{opacity:0,transform:'translateY(14px)'},{opacity:1,transform:'translateY(0)'}],{duration:320})]);return true;}finally{host.style.height='';host.classList.remove('is-changing');for(const section of ['welcome','guide','mainPage'])$(section).inert=false;routeBusy=false;if(activePage==='mainPage'){resize();start();}$(focusId||(activePage==='mainPage'?'title':activePage==='guide'?'guideTitle':'welcomeTitle')).focus({preventScroll:true});}}

 function cancelModalMotion(){clearCuteEffects($('celebration'));modalEpoch++;for(const animation of modalMotions)animation.cancel();modalMotions.clear();const host=$('celebrationSceneHost');host.style.height='';host.classList.remove('is-changing');for(const id of ['celebrationIntro','videoLead','videoStage','endingStage','feedbackStage','feedbackThanks'])$(id).inert=false;}

 async function changeModalScene(id,title,onShown,focusId){if(!celebration.open||closingDialogs.has(celebration))return false;cancelModalMotion();const epoch=modalEpoch,host=$('celebrationSceneHost'),ids=['celebrationIntro','videoLead','videoStage','endingStage','feedbackStage','feedbackThanks'],outgoing=ids.map($).find(el=>!el.hidden),incoming=$(id);if(outgoing===incoming){if(onShown)onShown();return true;}const oldHeight=host.getBoundingClientRect().height;host.style.height=oldHeight+'px';host.classList.add('is-changing');if(outgoing){outgoing.inert=true;await motion(outgoing,[{opacity:1,transform:'translateY(0)'},{opacity:0,transform:'translateY(-6px)'}],{duration:140},modalMotions);}if(epoch!==modalEpoch||!celebration.open)return false;for(const stage of ids)$(stage).hidden=stage!==id;incoming.inert=true;celebration.setAttribute('aria-labelledby',title);celebration.scrollTop=0;if(onShown)onShown();if(id==='endingStage')cuteEntrance(incoming,'ending');else if(id==='videoLead')cuteEntrance(incoming);const newHeight=sceneHeight(incoming);await Promise.all([motion(host,[{height:oldHeight+'px'},{height:newHeight+'px'}],{duration:280},modalMotions),motion(incoming,[{opacity:0,transform:'translateY(12px)'},{opacity:1,transform:'translateY(0)'}],{duration:300},modalMotions)]);if(epoch!==modalEpoch||!celebration.open)return false;host.style.height='';host.classList.remove('is-changing');for(const stage of ids)$(stage).inert=false;if(focusId)$(focusId).focus({preventScroll:true});return true;}

 async function requestDialogClose(dialog){if(!dialog.open||closingDialogs.has(dialog))return;closingDialogs.add(dialog);dialog.classList.add('is-closing');if(dialog===$('letter'))finishLetterReveal();if(dialog===$('celebration')){clearCelebrationTimer();videoAttempt++;greetingVideo.pause();cancelModalMotion();}try{await motion(dialog,[{opacity:1,transform:'translateY(0) scale(1)'},{opacity:0,transform:'translateY(8px) scale(.99)'}],{duration:160});if(dialog.open)dialog.close();}finally{dialog.classList.remove('is-closing');closingDialogs.delete(dialog);}}









 // Populate with supplied photos only: {name, aliases:[], photo:"data:image/..."}.
 const recipientProfiles=window.LIBER_RECIPIENTS||[];
 const cardThemes={
  scrapbook:{name:'Tím scrapbook',bg1:'#33203c',bg2:'#201428',ink:'#fff2ec',muted:'#c8b3ca',accent:'#f5b1ce',note:'#f5e2e9',noteInk:'#75435d',back:'#bca4c9',frame:'#fae9ed',photo:'#e4cbd8',tape:'#bfa6d6',button:'#f7a6c4',buttonInk:'#31162c'},
  pastel:{name:'Hồng pastel',bg1:'#fff1f5',bg2:'#f3ccdc',ink:'#603b50',muted:'#795469',accent:'#94496e',note:'#fff9fb',noteInk:'#70445d',back:'#e8afc6',frame:'#fffafb',photo:'#f6dce7',tape:'#e7a8c5',button:'#92436a',buttonInk:'#fff9fc'},
  rose:{name:'Kem hoa hồng',bg1:'#fff9ec',bg2:'#eadcbd',ink:'#584537',muted:'#73604c',accent:'#984e59',note:'#fffdf4',noteInk:'#66503e',back:'#bac3a4',frame:'#fffdf3',photo:'#eae2cd',tape:'#a8b58f',button:'#865146',buttonInk:'#fffaf1'}
 };
 let activeCardTheme='scrapbook';
 function cardPalette(){return cardThemes[activeCardTheme]||cardThemes.scrapbook;}
 function applyCardTheme(){const dialog=$('celebration');dialog.dataset.cardTheme=activeCardTheme;for(const [key,value]of Object.entries(cardPalette()))if(key!=='name')dialog.style.setProperty('--card-'+key,value);document.querySelectorAll('input[name="cardTheme"]').forEach(input=>{input.checked=input.value===activeCardTheme;});$('cardFallback').hidden=true;$('cardStatus').textContent='';}
 function restoreCardTheme(profile){let saved;try{if(profile)saved=localStorage.getItem('liber-card-theme:'+profile.id);}catch{}activeCardTheme=Object.hasOwn(cardThemes,saved)?saved:Object.hasOwn(cardThemes,profile?.theme)?profile.theme:'scrapbook';applyCardTheme();}
 document.querySelectorAll('input[name="cardTheme"]').forEach(input=>input.addEventListener('change',()=>{if(!input.checked)return;activeCardTheme=input.value;applyCardTheme();try{if(activeRecipient)localStorage.setItem('liber-card-theme:'+activeRecipient.id,activeCardTheme);}catch{}drawEndingDecor();}));

 let activeRecipient=null,activeRecipientImage=null,photoVersion=0,photoReady=Promise.resolve();


 let selectedRecipientId=null;
 function profileKey(value){return String(value).normalize('NFC').trim().toLocaleLowerCase('vi-VN').replace(/\s+/gu,' ');}
 function looseProfileKey(value){return profileKey(value).normalize('NFD').replace(/[\u0300-\u036f]/g,'').replaceAll('đ','d');}
 function findRecipient(value){
   const input=profileKey(value),loose=looseProfileKey(value),hasAccent=input!==loose;
   const result=(found,confirm=false)=>found.length===1&&!confirm?{profile:found[0],error:'',candidates:[]}:{profile:null,error:found.length>1?'Có vài tên gần giống nhau. Bạn chọn ảnh và họ tên của mình nhé ♡':found.length?'Bạn xác nhận đúng ảnh và họ tên của mình nhé ♡':'Chưa tìm thấy tên này. Thử tên thật hoặc thêm chữ đệm nhé.',candidates:found};
   if(!input)return{profile:null,error:'Bạn để lại tên trước nha ♡',candidates:[]};
   const keys=p=>[p.name,...(p.aliases||[])];
   // Full names take precedence; identical full names still require a photo choice.
   let found=recipientProfiles.filter(p=>keys(p).some(k=>looseProfileKey(k)===loose));
   if(hasAccent){const exact=found.filter(p=>keys(p).some(k=>profileKey(k)===input));if(exact.length)found=exact;}
   if(found.length)return result(found);
   // Match whole tokens in order, including middle names, to expose all plausible people.
   const contains=(name,query)=>{const parts=name.split(' ');let from=0;return query.split(' ').every(token=>{const i=parts.indexOf(token,from);if(i<0)return false;from=i+1;return true;});};
   found=recipientProfiles.filter(p=>keys(p).some(k=>contains(looseProfileKey(k),loose)));
   if(hasAccent){const precise=found.filter(p=>keys(p).some(k=>contains(profileKey(k),input)));if(precise.length)found=precise;}
   found.sort((a,b)=>a.name.localeCompare(b.name,'vi'));
   const suffix=p=>keys(p).some(k=>looseProfileKey(k).endsWith(' '+loose));
   return result(found,found.length===1&&!suffix(found[0]));
 }
 function showRecipientChoices(profiles=[]){
   const box=$('recipientChoices');box.replaceChildren();box.hidden=!profiles.length;
   profiles.forEach((profile,index)=>{const button=document.createElement('button');button.type='button';button.className='recipient-choice';button.dataset.recipientId=profile.id;
     const img=document.createElement('img');img.src=profile.photo;img.alt='';img.decoding='async';img.width=52;img.height=58;
     const label=document.createElement('span');label.textContent=profile.name;
     if(profiles.filter(p=>profileKey(p.name)===profileKey(profile.name)).length>1){const hint=document.createElement('small');hint.textContent='Chọn theo ảnh '+(index+1);label.append(hint);}
     button.append(img,label);button.addEventListener('click',()=>{selectedRecipientId=profile.id;$('nickname').value=profile.name;showRecipientChoices();$('loginForm').requestSubmit();});box.append(button);
   });
 }
 function renderRecipientPortrait(){const portrait=$('recipientPortrait'),hasPhoto=!!activeRecipientImage;portrait.hidden=!hasPhoto;$('bouquet').hidden=hasPhoto;$('endingStage').classList.toggle('has-portrait',hasPhoto);if(hasPhoto){portrait.src=activeRecipientImage.src;portrait.alt='Ảnh của '+(activeRecipient?.name||nickname);}else{portrait.removeAttribute('src');portrait.alt='';}const failed=!!activeRecipient&&!activeRecipientImage;$('photoStatus').hidden=!failed;$('photoStatus').textContent=failed?'Ảnh chưa mở được. Lời chúc của bạn vẫn ở đây nhé.':'';}
 function prepareRecipientPhoto(profile){const version=++photoVersion;activeRecipient=profile;restoreCardTheme(profile);activeRecipientImage=null;renderRecipientPortrait();if(!profile){photoReady=Promise.resolve();return;}photoReady=new Promise(resolve=>{const img=new Image();let done=false;const finish=success=>{if(done)return;done=true;clearTimeout(timeout);if(version===photoVersion){activeRecipientImage=success?img:null;renderRecipientPortrait();}resolve();};const timeout=setTimeout(()=>finish(false),10000);img.decoding='async';img.onload=()=>finish(img.naturalWidth>0);img.onerror=()=>finish(false);img.src=profile.photo;});}
 function drawRecipientPhoto(g,img){g.save();g.translate(600,505);g.rotate(-.025);g.fillStyle='#f8e7ec';g.shadowColor='#0004';g.shadowBlur=20;g.shadowOffsetY=9;g.fillRect(-240,-288,480,574);g.shadowBlur=0;g.shadowOffsetY=0;const width=440,height=490,ratio=Math.min(width/img.naturalWidth,height/img.naturalHeight),iw=img.naturalWidth*ratio,ih=img.naturalHeight*ratio;g.fillStyle='#ead1dd';g.fillRect(-220,-268,width,height);g.drawImage(img,-iw/2,-268+(height-ih)/2,iw,ih);g.restore();blossom(g,365,726,37,'#efabc5',.25);blossom(g,837,310,30,'#bda2d4',.6);leaf(g,391,761,-.4,23);}

 let unlocking=false,unlockTimer=null;


 function resetCardEntry(){clearTimeout(unlockTimer);unlockTimer=null;unlocking=false;$('lockedCard').classList.remove('is-unlocking');$('cardInside').setAttribute('aria-hidden','true');$('cardCover').removeAttribute('aria-hidden');$('cardCover').inert=false;$('nickname').disabled=false;$('unlockCard').disabled=false;$('unlockStatus').textContent='';}


 function openCardEntry(){cuteEntrance($('welcome'),'unlock');unlocking=true;$('unlockName').textContent=nickname;$('unlockStatus').textContent='Đã mở khóa tấm thiệp dành cho '+nickname+' ♡';$('nickname').disabled=true;$('unlockCard').disabled=true;$('unlockCard').blur();$('cardCover').inert=true;$('cardCover').setAttribute('aria-hidden','true');$('cardInside').setAttribute('aria-hidden','false');$('lockedCard').classList.add('is-unlocking');unlockTimer=setTimeout(()=>{route('guide');},reduced.matches?150:1100);}





 $('loginForm').addEventListener('submit',e=>{e.preventDefault();if(unlocking)return;const name=$('nickname').value.trim().replace(/\s+/g,' ');if(!name){$('nameError').textContent='Bạn để lại một tên nhỏ xinh trước nha ♡';$('nickname').setAttribute('aria-invalid','true');$('nickname').focus();return;}const chosen=recipientProfiles.find(p=>p.id===selectedRecipientId&&profileKey(p.name)===profileKey(name));selectedRecipientId=null;const match=chosen?{profile:chosen,error:'',candidates:[]}:findRecipient(name);showRecipientChoices(match.candidates);if(match.error){$('nameError').textContent=match.error;$('nickname').setAttribute('aria-invalid','true');$('nickname').focus();return;}prepareRecipientPhoto(match.profile);nickname=match.profile?match.profile.name:Array.from(name).slice(0,40).join('');$('nickname').value=nickname;$('nickname').removeAttribute('aria-invalid');$('nameError').textContent='';for(const id of ['guideName','displayName','letterName','completeName','endingName'])$(id).textContent=nickname;completionShown=false;angle=0;setProgress(0);openCardEntry();});



 $('nickname').addEventListener('input',()=>{selectedRecipientId=null;showRecipientChoices();$('nickname').removeAttribute('aria-invalid');$('nameError').textContent='';});



 $('enterMain').onclick=()=>{if(routeBusy)return;route('mainPage');if(!playing)play();};



 function changeName(){if(routeBusy)return;selectedRecipientId=null;showRecipientChoices();prepareRecipientPhoto(null);completionShown=false;stop();updateAudio('Đã tắt nhạc');route('welcome','nickname');}



 $('backWelcome').onclick=changeName;$('changeName').onclick=changeName;



 const letter=$('letter');let letterAnimations=[];
 function finishLetterReveal(){const pending=letterAnimations;letterAnimations=[];for(const a of pending)a.cancel();}
 function revealLetter(){
  finishLetterReveal();if(reduced.matches||document.hidden)return;
  const animations=[];const run=(el,frames,options)=>{if(el?.animate)animations.push(el.animate(frames,{fill:'both',easing:'cubic-bezier(.22,.65,.3,1)',...options}));};
  run(letter.querySelector('.letter-date'),[{opacity:0,transform:'translateY(8px)'},{opacity:1,transform:'translateY(0)'}],{duration:650});
  run(letter.querySelector('.letter-flower'),[{opacity:0,scale:'.65',rotate:'-8deg'},{opacity:1,scale:'1',rotate:'0deg'}],{duration:1100,delay:120});
  run($('letterTitle'),[{opacity:0,transform:'translateY(12px)'},{opacity:1,transform:'translateY(0)'}],{duration:950,delay:180});
  let count=0;
  for(const paragraph of letter.querySelectorAll('p:not(.signature):not(.small)')){
   if(!paragraph.querySelector('.letter-word')){const words=paragraph.textContent.split(/(\s+)/);paragraph.replaceChildren(...words.map(word=>{if(/^\s+$/.test(word))return document.createTextNode(word);const span=document.createElement('span');span.className='letter-word';span.textContent=word;return span;}));}
   for(const word of paragraph.querySelectorAll('.letter-word')){run(word,[{opacity:0,transform:'translateY(9px) rotate(-1deg)'},{opacity:1,transform:'translateY(0) rotate(0deg)'}],{duration:620,delay:600+count*16});count++;}
  }
  for(const [i,el]of [letter.querySelector('.signature'),letter.querySelector('.small'),letter.querySelector('.liber-autograph'),letter.querySelector('.letter-petals')].entries())run(el,[{opacity:0,transform:'translateY(10px)'},{opacity:1,transform:'translateY(0)'}],{duration:850,delay:600+count*16+i*140});
  letterAnimations=animations;Promise.allSettled(animations.map(a=>a.finished)).then(()=>{if(letterAnimations===animations)finishLetterReveal();});
 }
 $('openLetter').onclick=()=>{if(letter.open||closingDialogs.has(letter))return;letter.showModal();letter.scrollTop=0;revealLetter();};
 letter.addEventListener('close',finishLetterReveal);
 reduced.addEventListener('change',()=>{if(reduced.matches)finishLetterReveal();});
 document.addEventListener('visibilitychange',()=>{if(document.hidden)finishLetterReveal();});$('closeLetter').onclick=()=>requestDialogClose(letter);letter.addEventListener('cancel',e=>{e.preventDefault();requestDialogClose(letter);});letter.addEventListener('click',e=>{if(e.target===letter){const r=letter.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)requestDialogClose(letter);}});







 // Audio starts only after a user gesture. User files are kept as local blob URLs.



 let audioCtx=null, master=null,timer=null,nextNote=0,noteIndex=0,playing=false,source='synth',fileURL=null,operation=0;



 const audio=new Audio();audio.loop=true;audio.preload='metadata';audio.volume=.4;



 const melody=[72,76,79,83,79,76,74,79,81,84,81,79,71,74,78,81,78,74,69,72,76,79,76,72,67,71,74,79,74,71,69,74];



 const chords=[[48,55,60,64],[53,60,65,69],[55,62,67,71],[48,55,60,64]];



 function tone(note,at,duration,level){const osc=audioCtx.createOscillator(),gain=audioCtx.createGain();osc.type='sine';osc.frequency.value=440*2**((note-69)/12);gain.gain.setValueAtTime(0,at);gain.gain.linearRampToValueAtTime(level,at+.035);gain.gain.exponentialRampToValueAtTime(.0001,at+duration);osc.connect(gain);gain.connect(master);osc.start(at);osc.stop(at+duration+.05);osc.onended=()=>{osc.disconnect();gain.disconnect();};}



 function schedule(){if(!playing||source!=='synth')return;while(nextNote<audioCtx.currentTime+.25){if(nextNote<audioCtx.currentTime-.5)nextNote=audioCtx.currentTime+.05;tone(melody[noteIndex%melody.length],nextNote,2.3,.18);if(noteIndex%8===0)for(const n of chords[Math.floor(noteIndex/8)%4])tone(n,nextNote,5.1,.055);noteIndex++;nextNote+=.52;}}



 function updateAudio(message){$('play').textContent=playing?'Ⅱ':'▷';$('play').setAttribute('aria-pressed',String(playing));$('play').setAttribute('aria-label',playing?'Tắt nhạc nền':'Bật nhạc nền');$('audioStatus').textContent=message;}



 function stop(){operation++;playing=false;clearInterval(timer);timer=null;audio.pause();if(audioCtx&&audioCtx.state==='running')audioCtx.suspend().catch(()=>{});}



 async function play(){const token=++operation;$('play').disabled=true;try{if(source==='file'){await audio.play();}else{if(!audioCtx){const AC=window.AudioContext||window.webkitAudioContext;if(!AC)throw Error('unsupported');audioCtx=new AC();master=audioCtx.createGain();master.gain.value=Number($('volume').value)/100*.65;master.connect(audioCtx.destination);nextNote=audioCtx.currentTime+.08;}await audioCtx.resume();}



   if(token!==operation){if(source==='file')audio.pause();return;}playing=true;if(source==='synth'){nextNote=Math.max(nextNote,audioCtx.currentTime+.06);schedule();timer=setInterval(schedule,120);}updateAudio('Đang phát');



  }catch(e){if(token===operation){stop();updateAudio(source==='file'?'Không phát được file này. Hãy thử file MP3 hoặc WAV khác.':'Nhấn nút phát để bật nhạc.');}}



  finally{$('play').disabled=false;}}



 $('play').onclick=()=>{if(playing){stop();updateAudio('Đã tắt nhạc');}else play();};



 $('volume').oninput=()=>{const v=Number($('volume').value)/100;audio.volume=v;if(master)master.gain.setTargetAtTime(v*.65,audioCtx.currentTime,.05);};



 $('musicFile').onchange=async e=>{const file=e.target.files[0];if(!file)return;if(!(file.type.startsWith('audio/')||/\.(mp3|wav|ogg|m4a|aac|flac)$/i.test(file.name))){$('audioStatus').textContent='Hãy chọn file âm thanh, ví dụ MP3 hoặc WAV.';e.target.value='';return;}stop();audio.removeAttribute('src');audio.load();if(fileURL)URL.revokeObjectURL(fileURL);fileURL=URL.createObjectURL(file);audio.src=fileURL;source='file';$('trackName').textContent=file.name;$('resetMusic').hidden=false;updateAudio('Đã chọn nhạc · Nhấn phát để nghe.');};



 $('resetMusic').onclick=()=>{stop();source='synth';audio.removeAttribute('src');audio.load();if(fileURL)URL.revokeObjectURL(fileURL);fileURL=null;$('musicFile').value='';$('trackName').textContent='Giai điệu dành cho Liber';$('resetMusic').hidden=true;updateAudio('Đã chọn giai điệu mặc định · Nhấn phát để nghe.');};



 audio.addEventListener('error',()=>{if(source==='file'&&audio.getAttribute('src')){stop();updateAudio('Không đọc được nhạc. Hãy chọn file MP3 hoặc WAV khác.');}});







 // A real greeting video can be embedded here when supplied by the organizer.



 // User-selected video remains local to the device and is never uploaded.



 const bundledGreetingVideo='assets/5a142c5696d4b297a790.mp4';



 const celebration=$('celebration'),greetingVideo=$('greetingVideo');



 let greetingURL='',videoTimer=null,resumeMusic=false,videoAttempt=0;



 function clearCelebrationTimer(){clearTimeout(videoTimer);videoTimer=null;}



 function makeConfetti(){const container=$('confetti');container.replaceChildren();if(reduced.matches)return;for(let i=0;i<52;i++){const piece=document.createElement('i');piece.style.setProperty('--left',Math.random()*100+'%');piece.style.setProperty('--delay',Math.random()*.65+'s');piece.style.setProperty('--drift',(Math.random()-.5)*140+'px');piece.style.setProperty('--spin',(Math.random()-.5)*900+'deg');piece.style.background=['#f7a6c4','#e7c6a1','#fff2ec','#bc81cb'][i%4];container.append(piece);}}



 function configureVideo(){const hasVideo=!!greetingVideo.getAttribute('src');greetingVideo.hidden=!hasVideo;$('videoEmpty').hidden=hasVideo;$('replaceGreeting').hidden=!hasVideo||!!bundledGreetingVideo;$('videoSetup').textContent=hasVideo?'Xem video':'Thêm video';}



 async function playGreeting(){if(!celebration.open||!greetingVideo.getAttribute('src'))return;const attempt=++videoAttempt;$('videoStatus').textContent='';$('startGreeting').hidden=true;try{await greetingVideo.play();if(attempt!==videoAttempt||!celebration.open)greetingVideo.pause();}catch(e){if(attempt!==videoAttempt||!celebration.open)return;$('startGreeting').hidden=false;$('videoStatus').textContent=e.name==='NotAllowedError'?'Nhấn “Phát video” để xem lời chúc.':'Không phát được video. Hãy thử file MP4 khác.';}}



 function showVideo(){clearCelebrationTimer();return changeModalScene('videoStage','videoTitle',()=>{$('confetti').replaceChildren();configureVideo();if(greetingVideo.getAttribute('src')){if(greetingVideo.ended)greetingVideo.currentTime=0;playGreeting();}});}



 function openVideoDialog(){if(celebration.open)return;cancelModalMotion();resumeMusic=playing;stop();updateAudio('Nhạc tạm dừng để xem video');stopFrames();$('videoStatus').textContent='';$('startGreeting').hidden=true;celebration.showModal();}



 function showCelebration(){if(celebration.open)return;cancelModalMotion();clearCelebrationTimer();$('celebrationIntro').hidden=false;$('feedbackStage').hidden=true;$('feedbackThanks').hidden=true;$('videoLead').hidden=true;$('endingStage').hidden=true;$('videoStage').hidden=true;celebration.setAttribute('aria-labelledby','celebrationTitle');openVideoDialog();makeConfetti();if(greetingVideo.getAttribute('src'))greetingVideo.currentTime=0;videoTimer=setTimeout(showVideoLead,2400);}



 $('closeCelebration').onclick=()=>requestDialogClose(celebration);celebration.addEventListener('cancel',e=>{e.preventDefault();requestDialogClose(celebration);});



 celebration.addEventListener('close',()=>{cancelModalMotion();clearCelebrationTimer();videoAttempt++;greetingVideo.pause();$('confetti').replaceChildren();start();if(resumeMusic){resumeMusic=false;play();}else updateAudio('Đã tắt nhạc');});



 $('videoSetup').onclick=()=>{if(greetingVideo.getAttribute('src')){openVideoDialog();showVideo();}else $('greetingFile').click();};



 $('chooseGreeting').onclick=()=>$('greetingFile').click();$('replaceGreeting').onclick=()=>$('greetingFile').click();



 $('startGreeting').onclick=()=>{if(greetingVideo.ended)greetingVideo.currentTime=0;playGreeting();};



 $('greetingFile').onchange=e=>{const file=e.target.files[0];if(!file)return;if(!(file.type.startsWith('video/')||/\.(mp4|webm|mov)$/i.test(file.name))){if(!celebration.open){openVideoDialog();showVideo();}$('videoStatus').textContent='Hãy chọn một file video MP4, WebM hoặc MOV.';e.target.value='';return;}videoAttempt++;greetingVideo.pause();greetingVideo.removeAttribute('src');greetingVideo.load();if(greetingURL)URL.revokeObjectURL(greetingURL);greetingURL=URL.createObjectURL(file);greetingVideo.src=greetingURL;greetingVideo.load();configureVideo();$('videoStatus').textContent='';if(celebration.open&&!$('videoStage').hidden)playGreeting();e.target.value='';};



 greetingVideo.addEventListener('play',()=>{if(!celebration.open){greetingVideo.pause();return;}$('startGreeting').hidden=true;$('videoStatus').textContent='';});



 greetingVideo.addEventListener('ended',showEnding);



 greetingVideo.addEventListener('error',()=>{if(!greetingVideo.getAttribute('src'))return;if(!celebration.open){openVideoDialog();showVideo();}$('videoStatus').textContent='Không đọc được video. Hãy chọn file MP4 khác.';$('startGreeting').hidden=true;});







 function blossom(g,x,y,size,color,rotation=0){g.save();g.translate(x,y);g.rotate(rotation);g.fillStyle=color;for(let i=0;i<5;i++){g.save();g.rotate(i*Math.PI*2/5);g.beginPath();g.ellipse(0,-size*.5,size*.37,size*.56,0,0,Math.PI*2);g.fill();g.restore();}g.fillStyle='#ebc58e';g.beginPath();g.arc(0,0,size*.25,0,Math.PI*2);g.fill();g.restore();}



 function leaf(g,x,y,rotation,size){g.save();g.translate(x,y);g.rotate(rotation);g.fillStyle='#8fae9c';g.beginPath();g.ellipse(0,0,size,size*.4,0,0,Math.PI*2);g.fill();g.restore();}



 function drawGrowingFlowers(){const locations=[[.22,.16],[.82,.25],[.12,.43],[.87,.55],[.19,.74],[.77,.8],[.43,.1],[.58,.88]];const colors=['#efabc5','#bda2d4','#f1d3ac'];let visible=0;for(let i=0;i<locations.length;i++){const growth=Math.max(0,Math.min(1,(progress-8-i*10)/15));if(growth<=0)continue;visible++;const [fx,fy]=locations[i],x=w*fx,y=h*fy,size=Math.min(w,h)*.037*growth;ctx.globalAlpha=growth;leaf(ctx,x+size*.55,y+size*1.2,-.5,size*.55);blossom(ctx,x,y,size,colors[i%3],(paused?0:Math.sin(time*.6+i)*.12)+i*.4);}ctx.globalAlpha=1;canvas.dataset.flowers=String(visible);}



 function drawBouquet(g,cx,cy,scale){g.save();g.translate(cx,cy);g.scale(scale,scale);const heads=[[-76,-64,24,'#efabc5'],[-39,-106,29,'#f3c5d4'],[5,-119,27,'#bda2d4'],[53,-96,28,'#efabc5'],[88,-49,23,'#f1d3ac'],[-17,-48,31,'#e997b8'],[34,-43,25,'#f3d2ac']];g.lineWidth=3;g.strokeStyle='#91ad9b';for(const [x,y] of heads){g.beginPath();g.moveTo(0,112);g.quadraticCurveTo(x*.4,20,x,y);g.stroke();}for(const [x,y,r] of [[-70,-18,-.8],[65,-14,.7],[-42,-69,-.4],[25,-86,.6]])leaf(g,x,y,r,20);g.fillStyle='#f6dedc';g.beginPath();g.moveTo(-94,-11);g.lineTo(29,134);g.lineTo(52,139);g.lineTo(101,-13);g.lineTo(0,28);g.closePath();g.fill();g.fillStyle='#cf94b0';g.beginPath();g.moveTo(-94,-11);g.lineTo(0,28);g.lineTo(101,-13);g.lineTo(32,135);g.lineTo(-28,135);g.closePath();g.fill();g.fillStyle='#eeb7ca';g.beginPath();g.moveTo(0,28);g.lineTo(101,-13);g.lineTo(32,135);g.closePath();g.fill();for(const [x,y,size,color] of heads)blossom(g,x,y,size,color,x*.01);g.strokeStyle='#8f5273';g.lineWidth=6;g.lineCap='round';g.beginPath();g.moveTo(-27,93);g.lineTo(35,93);g.stroke();g.fillStyle='#9f5b7f';for(const direction of [-1,1]){g.beginPath();g.moveTo(3,94);g.bezierCurveTo(direction*65,52,direction*59,124,3,94);g.fill();g.beginPath();g.moveTo(3,96);g.lineTo(direction*24,129);g.lineTo(direction*17,101);g.fill();}g.fillStyle='#f6d4dd';g.beginPath();g.arc(3,93,6,0,Math.PI*2);g.fill();g.restore();}



 async function showVideoLead(){clearCelebrationTimer();const shown=await changeModalScene('videoLead','videoLeadTitle',()=>{$('confetti').replaceChildren();});if(shown&&celebration.open&&!$('videoLead').hidden&&!closingDialogs.has(celebration))videoTimer=setTimeout(showVideo,6000);}



 $('skipVideoLead').onclick=()=>{clearCelebrationTimer();showVideo();};




 // Original canvas doodles shared by the screen card and the downloadable card.
 function tinyHeart(g,x,y,size,color){g.save();g.translate(x,y);g.scale(size,size);g.fillStyle=color;g.beginPath();g.moveTo(0,7);g.bezierCurveTo(-24,-8,-12,-21,0,-10);g.bezierCurveTo(12,-21,24,-8,0,7);g.fill();g.restore();}
 function drawKitten(g,x,y,scale,lavender=false){
   g.save();g.translate(x,y);g.scale(scale,scale);g.lineWidth=2.2;g.lineCap='round';g.lineJoin='round';g.strokeStyle='#80546c';
   const fur=lavender?'#dfd0ed':'#fff1df',ear=lavender?'#c2a6d5':'#edb0ba';
   g.strokeStyle=fur;g.lineWidth=12;g.beginPath();g.moveTo(23,32);g.bezierCurveTo(58,43,59,9,44,12);g.stroke();g.strokeStyle='#80546c';g.lineWidth=2.2;
   g.fillStyle=fur;g.beginPath();g.ellipse(0,25,29,31,0,0,Math.PI*2);g.fill();g.stroke();
   g.beginPath();g.moveTo(-33,-7);g.lineTo(-32,-44);g.quadraticCurveTo(-30,-49,-25,-44);g.lineTo(-10,-29);g.quadraticCurveTo(0,-32,12,-29);g.lineTo(29,-45);g.quadraticCurveTo(34,-48,34,-40);g.lineTo(34,-7);g.bezierCurveTo(40,25,-39,27,-33,-7);g.closePath();g.fill();g.stroke();
   g.fillStyle=ear;for(const sign of [-1,1]){g.beginPath();g.moveTo(sign*26,-36);g.lineTo(sign*17,-25);g.lineTo(sign*28,-22);g.closePath();g.fill();}
   g.strokeStyle='#80546c';for(const x of [-13,13]){g.beginPath();g.moveTo(x-5,-3);g.quadraticCurveTo(x,-10,x+5,-3);g.stroke();}
   g.fillStyle='#eba7b6';for(const x of [-24,24]){g.beginPath();g.ellipse(x,4,7,4,0,0,Math.PI*2);g.fill();}
   g.fillStyle='#a86e83';g.beginPath();g.moveTo(-3,1);g.lineTo(3,1);g.lineTo(0,4);g.closePath();g.fill();g.beginPath();g.moveTo(-5,7);g.quadraticCurveTo(-1,11,0,5);g.quadraticCurveTo(1,11,5,7);g.stroke();
   for(const sign of [-1,1])for(const dy of [0,7]){g.beginPath();g.moveTo(sign*27,dy);g.lineTo(sign*40,dy-3);g.stroke();}
   tinyHeart(g,0,35,1.4,'#d983a6');g.fillStyle=fur;for(const sign of [-1,1]){g.beginPath();g.ellipse(sign*23,27,8,12,sign*.6,0,Math.PI*2);g.fill();g.stroke();g.beginPath();g.ellipse(sign*15,52,12,7,0,0,Math.PI*2);g.fill();g.stroke();}
   blossom(g,lavender?-28:28,-28,10,lavender?'#efb8ce':'#c3acd9',.25);g.restore();
 }
 function floralSprig(g,x,y,scale,flip=1){g.save();g.translate(x,y);g.scale(scale*flip,scale);g.strokeStyle='#9fb5a0';g.lineWidth=2;g.lineCap='round';g.beginPath();g.moveTo(0,52);g.quadraticCurveTo(-12,13,4,-20);g.moveTo(-3,36);g.quadraticCurveTo(16,16,29,13);g.stroke();leaf(g,-11,23,.5,10);leaf(g,9,35,-.6,11);blossom(g,4,-20,16,'#efb4ce',.25);blossom(g,29,13,12,'#cdb7e4',.4);blossom(g,-7,3,9,'#fff0d8',.3);g.restore();}

 function drawLoopy(g,x,y,scale,tilt=0){
  g.save();g.translate(x,y);g.rotate(tilt);g.scale(scale,scale);g.lineJoin='round';g.lineCap='round';
  const oval=(x,y,rx,ry,color,outline=true)=>{g.fillStyle=color;g.beginPath();g.ellipse(x,y,rx,ry,0,0,Math.PI*2);if(outline){g.strokeStyle='#fff4f7';g.lineWidth=7;g.stroke();}g.fill();};
  oval(0,32,34,40,'#efa3bf');oval(-25,65,17,10,'#efa3bf');oval(24,65,17,10,'#efa3bf');
  oval(-43,-33,14,16,'#eda2be');oval(43,-33,14,16,'#eda2be');oval(-43,-33,7,9,'#ce7f9f',false);oval(43,-33,7,9,'#ce7f9f',false);
  oval(0,-13,49,42,'#f3aec8');
  g.strokeStyle='#bd7b9c';g.lineWidth=2.5;g.beginPath();g.moveTo(-9,-53);g.quadraticCurveTo(-19,-67,-5,-64);g.quadraticCurveTo(7,-62,2,-54);g.stroke();
  oval(-20,-20,3.3,4.5,'#5c344c',false);oval(20,-20,3.3,4.5,'#5c344c',false);oval(0,-6,12,8,'#965d83',false);
  oval(-33,-2,10,5,'#ea8faf',false);oval(33,-2,10,5,'#ea8faf',false);
  g.strokeStyle='#87536f';g.lineWidth=2;g.beginPath();g.moveTo(-13,8);g.quadraticCurveTo(0,20,13,8);g.stroke();g.fillStyle='#fff9ef';g.fillRect(-6,13,12,8);g.strokeStyle='#c9a5b9';g.lineWidth=1;g.beginPath();g.moveTo(0,14);g.lineTo(0,20);g.stroke();
  tinyHeart(g,7,43,1.55,'#c8618c');oval(-22,34,10,15,'#f3aec8',false);oval(27,35,9,14,'#f3aec8',false);
  g.restore();
 }
 function drawRose(g,x,y,size,color='#d9789e'){
  g.save();g.translate(x,y);g.scale(size,size);g.fillStyle=color;g.strokeStyle='#fff2f4';g.lineWidth=.12;g.beginPath();for(let i=0;i<7;i++){const a=i*Math.PI*2/7;g.ellipse(Math.cos(a)*.4,Math.sin(a)*.4,.65,.48,a,0,Math.PI*2);}g.stroke();g.fill();g.strokeStyle='#aa527b';g.lineWidth=.09;g.lineCap='round';g.beginPath();for(let t=0;t<Math.PI*4.1;t+=.08){const r=.04+t*.047,x=Math.cos(t)*r,y=Math.sin(t)*r;if(t===0)g.moveTo(x,y);else g.lineTo(x,y);}g.stroke();g.beginPath();g.arc(-.09,.1,.76,.1,2.4);g.stroke();g.restore();
 }
 function roseBouquet(g,x,y,scale,tilt=.25){g.save();g.translate(x,y);g.rotate(tilt);g.scale(scale,scale);g.fillStyle='#eee0cf';g.strokeStyle='#fff5ec';g.lineWidth=3;g.beginPath();g.moveTo(-39,4);g.lineTo(7,93);g.lineTo(44,0);g.closePath();g.fill();g.stroke();g.strokeStyle='#8ba68f';g.lineWidth=2.5;for(const dx of [-22,0,25]){g.beginPath();g.moveTo(5,75);g.quadraticCurveTo(dx,30,dx,-15);g.stroke();}leaf(g,-28,9,-.65,17);leaf(g,26,24,.45,18);leaf(g,2,-21,-.7,15);drawRose(g,-23,-10,21,'#e59ab3');drawRose(g,22,-6,22,'#c9648f');drawRose(g,0,-36,23,'#eab4c7');g.fillStyle='#b694c9';g.beginPath();g.moveTo(6,65);g.bezierCurveTo(-35,30,-39,87,6,65);g.bezierCurveTo(41,28,46,83,6,65);g.fill();g.strokeStyle='#b694c9';g.lineWidth=5;g.beginPath();g.moveTo(6,65);g.quadraticCurveTo(3,90,-8,99);g.moveTo(6,65);g.quadraticCurveTo(15,82,26,81);g.stroke();g.restore();}
 function stickerStar(g,x,y,r,tilt=0){g.save();g.translate(x,y);g.rotate(tilt);g.fillStyle='#f3d18f';g.strokeStyle='#fff3dd';g.lineWidth=r*.15;g.beginPath();for(let i=0;i<10;i++){const a=i*Math.PI/5-Math.PI/2,rr=i%2?r*.48:r;g.lineTo(Math.cos(a)*rr,Math.sin(a)*rr);}g.closePath();g.stroke();g.fill();g.restore();}
 function washiTape(g,x,y,w,angle=0){g.save();g.translate(x,y);g.rotate(angle);g.fillStyle=cardPalette().tape+'bb';g.fillRect(-w/2,-9,w,18);g.fillStyle='#fff5f15c';for(let i=-w/2+6;i<w/2;i+=11){g.beginPath();g.arc(i,0,2,0,Math.PI*2);g.fill();}g.restore();}
 function drawEndingDecor(){const c=$('endingDecor'),art=$('endingArt'),w=art.clientWidth,h=art.clientHeight;if(!w||!h)return;const dpr=Math.min(devicePixelRatio||1,2);c.width=Math.round(w*dpr);c.height=Math.round(h*dpr);const g=c.getContext('2d');g.scale(dpr,dpr);const small=w<400,tiny=w<280;
  washiTape(g,small?w*.37:176,small?34:39,small?64:90,-.24);
  roseBouquet(g,w-(small?42:66),small?79:93,small?.61:.94,.33);
  drawLoopy(g,w-(small?48:84),h-(small?80:115),small?.77:1.04,.13);
  drawKitten(g,small?32:60,h-(small?27:45),small?.45:.58,false);
  stickerStar(g,small?13:33,small?114:150,small?9:13,-.28);stickerStar(g,w-(small?19:30),h-(small?17:48),small?7:10,.2);
  tinyHeart(g,w-(small?27:58),small?154:196,small?.32:.48,'#edb2c9');tinyHeart(g,small?95:149,h-20,.28,'#cdb7e4');drawBunny(g,w*.53,h-28,small?.30:.43,-.12);happyStar(g,small?14:31,small?213:238,small?8:12,.2);
 }
 new ResizeObserver(drawEndingDecor).observe($('endingArt'));

 function recipientWish(){return activeRecipient?.wish||"Mừng ngày 20/10, chúc bạn có thật nhiều niềm vui, những tình bạn chân thành và những khoảnh khắc được yêu thương. Mong các dự định của bạn dần thành hiện thực, những ngày bận rộn vẫn có phút nghỉ ngơi và những ngày bình thường cũng có điều để mỉm cười. Liber gửi bạn lời chúc vui khỏe và một hành trình thật nhiều kỷ niệm đẹp!";}
 function showEnding(){clearCelebrationTimer();return changeModalScene('endingStage','endingTitle',()=>{$('endingName').textContent=nickname||'Bạn';$('endingWish').textContent=recipientWish();renderRecipientPortrait();drawEndingDecor();$('cardStatus').textContent='';$('cardFallback').hidden=true;const bouquet=$('bouquet'),g=bouquet.getContext('2d');g.clearRect(0,0,bouquet.width,bouquet.height);drawBouquet(g,360,290,1.7);},'saveCard');}



 $('replayGreeting').onclick=()=>{greetingVideo.currentTime=0;showVideo();};



 function wrapCardText(g,text,maxWidth){const lines=[];let line='';for(const word of text.normalize('NFC').split(/\s+/)){if(g.measureText(word).width>maxWidth){if(line){lines.push(line);line='';}for(const char of Array.from(word)){if(g.measureText(line+char).width>maxWidth){lines.push(line);line=char;}else line+=char;}}else{const next=line?line+' '+word:word;if(g.measureText(next).width>maxWidth){lines.push(line);line=word;}else line=next;}}if(line)lines.push(line);return lines;}





 function drawBunny(g,x,y,scale,tilt=-.1){
  g.save();g.translate(x,y);g.rotate(tilt);g.scale(scale,scale);g.lineWidth=5;g.strokeStyle='#fff8ef';g.lineJoin='round';
  const oval=(x,y,rx,ry,color,angle=0)=>{g.fillStyle=color;g.beginPath();g.ellipse(x,y,rx,ry,angle,0,Math.PI*2);g.stroke();g.fill();};
  oval(-17,-43,10,31,'#fff0dc',-.18);oval(16,-46,10,31,'#fff0dc',.15);g.lineWidth=0;g.fillStyle='#efbdcf';for(const x of [-17,16]){g.beginPath();g.ellipse(x,-47,4,19,x<0?-.18:.15,0,Math.PI*2);g.fill();}g.lineWidth=4;
  oval(0,36,27,28,'#dfcce9');oval(0,-2,35,29,'#fff0dc');oval(-16,60,12,7,'#fff0dc');oval(16,60,12,7,'#fff0dc');
  g.fillStyle='#80556e';for(const x of [-12,12]){g.beginPath();g.arc(x,-6,2.6,0,Math.PI*2);g.fill();}g.fillStyle='#ebadc5';for(const x of [-24,24]){g.beginPath();g.ellipse(x,4,7,4,0,0,Math.PI*2);g.fill();}g.strokeStyle='#a47489';g.lineWidth=1.5;g.beginPath();g.moveTo(-5,8);g.quadraticCurveTo(0,14,5,8);g.stroke();stickerStar(g,0,32,17,.1);g.strokeStyle='#fff8ef';oval(-23,30,8,11,'#fff0dc',-.3);oval(23,30,8,11,'#fff0dc',.3);blossom(g,27,-20,9,'#c6afd9',.4);g.restore();
 }
 function happyStar(g,x,y,r,tilt=.15){g.save();g.translate(x,y);g.rotate(tilt);stickerStar(g,0,0,r);g.fillStyle='#8f6572';for(const dx of [-.18,.18]){g.beginPath();g.arc(r*dx,0,r*.045,0,Math.PI*2);g.fill();}g.strokeStyle='#a77580';g.lineWidth=Math.max(1,r*.035);g.beginPath();g.arc(0,r*.09,r*.1,0,Math.PI);g.stroke();g.restore();}
 function storySprinkles(g){
  const dots=[[67,290,4],[1005,552,4],[40,790,3],[995,1120,5],[72,1250,4],[1010,1490,3],[570,1785,4],[470,1815,3],[1000,1730,4],[310,185,3]];
  for(const [x,y,r]of dots){g.fillStyle='#cfacd0';g.beginPath();g.arc(x,y,r,0,Math.PI*2);g.fill();}
  tinyHeart(g,68,576,.46,'#d79dbb');tinyHeart(g,994,749,.5,'#d1b1e0');tinyHeart(g,1007,1370,.42,'#efb9d0');happyStar(g,68,390,21,-.15);happyStar(g,1009,1194,18,.2);stickerStar(g,534,1801,12,.3);
 }

 function drawCardHeading(g,width){
  g.save();g.scale(width/1080,width/1080);g.textBaseline='middle';g.textAlign='left';
  g.fillStyle=cardPalette().ink;g.font='700 72px "Nunito", "Segoe UI", sans-serif';g.fillText('L I B E R',85,99);
  g.fillStyle=cardPalette().accent;g.font='600 37px "Dancing Script", "Nunito", cursive';g.fillText('Gửi riêng bạn, với yêu thương',90,166);
  // A tiny flying love letter bridges the free space between the title and date.
  g.save();g.translate(658,118);g.rotate(-.13);g.fillStyle='#eacddd';g.strokeStyle='#fff0f3';g.lineWidth=3;g.beginPath();g.roundRect(-57,-36,114,76,7);g.fill();g.stroke();g.strokeStyle='#c18cab';g.lineWidth=2;g.beginPath();g.moveTo(-54,-32);g.lineTo(0,6);g.lineTo(54,-32);g.moveTo(-54,36);g.lineTo(-17,3);g.moveTo(54,36);g.lineTo(17,3);g.stroke();tinyHeart(g,0,7,.75,'#bf6a94');g.restore();
  g.strokeStyle='#d5afd08c';g.lineWidth=2;g.setLineDash([3,7]);g.beginPath();g.moveTo(545,98);g.bezierCurveTo(553,43,642,41,710,59);g.stroke();g.setLineDash([]);stickerStar(g,743,88,15,.18);tinyHeart(g,571,143,.37,'#e0a3c4');
  g.save();g.translate(917,132);g.rotate(.10);g.fillStyle='#f2d4df';g.shadowColor='#0003';g.shadowBlur=10;g.shadowOffsetY=5;g.fillRect(-111,-62,222,124);g.shadowBlur=0;g.shadowOffsetY=0;g.strokeStyle='#be87a444';g.lineWidth=1.5;g.strokeRect(-102,-53,204,106);g.textAlign='center';g.fillStyle='#8d4c70';g.font='700 46px "Nunito", "Segoe UI", sans-serif';g.fillText('20/10',0,-12);g.font='600 25px "Dancing Script", "Nunito", cursive';g.fillText('Dành cho bạn ♡',0,34);g.restore();
  blossom(g,1020,66,17,'#cbb3df',.3);leaf(g,1038,85,.7,10);g.restore();
 }

 function drawWishNote(g,x,y,width,height,tilt){
  g.save();g.translate(x,y);g.rotate(tilt);g.fillStyle=cardPalette().note;g.shadowColor='#0003';g.shadowBlur=12;g.fillRect(0,0,width,height);g.shadowBlur=0;if(activeCardTheme==='rose'){g.strokeStyle=cardPalette().back;g.lineWidth=2;g.strokeRect(8,8,width-16,height-16);}
  const padX=44,padY=30,available=height-padY*2;let fontSize=34,lines;
  do{g.font=`${fontSize}px "Nunito", "Segoe UI", sans-serif`;lines=wrapCardText(g,recipientWish(),width-padX*2);if(lines.length*fontSize*1.45<=available)break;fontSize--;}while(fontSize>20);
  const lineHeight=Math.min(available/lines.length,fontSize*1.7),top=(height-lines.length*lineHeight)/2+lineHeight/2;
  g.fillStyle=cardPalette().noteInk;g.textAlign='left';g.textBaseline='middle';lines.forEach((line,i)=>g.fillText(line,padX,top+i*lineHeight));washiTape(g,width-145,0,126,-.16);g.restore();
 }

 function drawLiberSignature(g,right,baseline,size){
  g.save();g.fillStyle=cardPalette().accent;g.strokeStyle=cardPalette().accent;g.lineWidth=1.8;g.lineCap='round';g.font=`600 ${size}px "Dancing Script", "Nunito", cursive`;g.textAlign='right';g.textBaseline='alphabetic';g.fillText('Liber',right,baseline);
  const width=g.measureText('Liber').width;g.beginPath();g.moveTo(right-width-8,baseline+9);g.quadraticCurveTo(right-width*.45,baseline-1,right+5,baseline+6);g.moveTo(right-width*.65,baseline+15);g.quadraticCurveTo(right-width*.3,baseline+7,right-7,baseline+12);g.stroke();g.restore();
 }

 function makeStoryKeepsake(){
  const card=document.createElement('canvas');card.width=1080;card.height=1920;const g=card.getContext('2d');const bg=g.createLinearGradient(0,0,1080,1920);bg.addColorStop(0,cardPalette().bg1);bg.addColorStop(1,cardPalette().bg2);g.fillStyle=bg;g.fillRect(0,0,1080,1920);g.textBaseline='middle';g.textAlign='left';storySprinkles(g);
  drawCardHeading(g,1080);
  g.save();g.translate(495,662);g.rotate(.025);g.fillStyle=cardPalette().back;g.fillRect(-365,-422,730,850);g.restore();
  g.save();g.translate(484,654);g.rotate(-.065);g.fillStyle=cardPalette().frame;g.shadowColor='#0005';g.shadowBlur=24;g.shadowOffsetY=12;g.fillRect(-365,-422,730,850);g.shadowBlur=0;g.shadowOffsetY=0;
  if(activeRecipientImage){const img=activeRecipientImage,ratio=Math.min(690/img.naturalWidth,770/img.naturalHeight),iw=img.naturalWidth*ratio,ih=img.naturalHeight*ratio;g.fillStyle=cardPalette().photo;g.fillRect(-345,-402,690,770);g.drawImage(img,-iw/2,-402+(770-ih)/2,iw,ih);}else{g.save();g.translate(-484,-654);drawBouquet(g,484,654,2.7);g.restore();}g.restore();
  washiTape(g,440,233,180,-.13);roseBouquet(g,945,340,1.15,.32);drawLoopy(g,947,979,1.45,.16);drawKitten(g,78,1066,.91);tinyHeart(g,258,1108,.4,'#e7b4ce');
  g.save();g.translate(98,1176);g.rotate(-.02);let size=66,lines;do{g.font=`600 ${size}px "Dancing Script", "Nunito", cursive`;lines=wrapCardText(g,(nickname||'Bạn')+' ơi,',875);if(lines.length<=2)break;size-=2;}while(size>34);g.fillStyle=cardPalette().accent;lines.forEach((line,i)=>g.fillText(line,0,i*70));g.font='35px "Nunito", "Segoe UI", sans-serif';g.fillStyle=cardPalette().ink;g.fillText('Hãy luôn rạng rỡ nhé!',0,lines.length*70+2);g.restore();
  const noteY=lines.length>1?1395:1335;drawWishNote(g,101,noteY,875,330,.025);
  drawBunny(g,184,1836,.85,-.12);happyStar(g,340,1785,27,.13);tinyHeart(g,296,1880,.35,'#e7aac5');floralSprig(g,1000,1794,.58,-1);
  g.textAlign='right';g.fillStyle=cardPalette().accent;g.font='26px "Nunito", "Segoe UI", sans-serif';g.fillText('Thân thương, từ các bạn trai Liber',963,1829);drawLiberSignature(g,951,1894,64);return card;
 }

 function makeKeepsake(format="classic"){
  if(format==='story')return makeStoryKeepsake();
  const story=format==='story',logicalHeight=story?1920/0.9:1600;const card=document.createElement('canvas');card.width=story?1080:1200;card.height=story?1920:1600;const g=card.getContext('2d');if(story)g.scale(.9,.9);const bg=g.createLinearGradient(0,0,1200,logicalHeight);bg.addColorStop(0,cardPalette().bg1);bg.addColorStop(1,cardPalette().bg2);g.fillStyle=bg;g.fillRect(0,0,1200,logicalHeight);if(story)g.translate(0,150);g.textBaseline='middle';g.textAlign='left';drawCardHeading(g,1200);
  g.save();g.translate(475,507);g.rotate(.065);g.fillStyle=cardPalette().back;g.fillRect(-240,-280,480,570);g.restore();
  if(activeRecipientImage){const img=activeRecipientImage;g.save();g.translate(442,509);g.rotate(-.12);g.fillStyle=cardPalette().frame;g.shadowColor='#0005';g.shadowBlur=22;g.shadowOffsetY=10;g.fillRect(-240,-280,480,574);g.shadowBlur=0;g.shadowOffsetY=0;const ratio=Math.min(440/img.naturalWidth,490/img.naturalHeight),iw=img.naturalWidth*ratio,ih=img.naturalHeight*ratio;g.fillStyle=cardPalette().photo;g.fillRect(-220,-260,440,490);g.drawImage(img,-iw/2,-260+(490-ih)/2,iw,ih);g.restore();}else drawBouquet(g,440,530,1.9);
  washiTape(g,418,232,175,-.21);roseBouquet(g,971,371,2.1,.35);drawLoopy(g,938,736,2.6,.14);drawKitten(g,136,803,1.25);stickerStar(g,110,345,24,-.24);stickerStar(g,1105,934,19,.2);tinyHeart(g,1063,595,.9,'#e49ab9');tinyHeart(g,742,879,.6,'#bca3d6');
  if(story)g.translate(0,80);g.save();g.translate(110,939);g.rotate(-.025);g.fillStyle=cardPalette().accent;let size=66,lines;do{g.font=`600 ${size}px "Dancing Script", "Nunito", cursive`;lines=wrapCardText(g,(nickname||'Bạn')+' ơi,',960);if(lines.length<=2)break;size-=2;}while(size>32);lines.forEach((line,i)=>g.fillText(line,0,i*65));g.fillStyle=cardPalette().ink;g.font='38px "Nunito", "Segoe UI", Arial, sans-serif';g.fillText('Hãy luôn rạng rỡ nhé!',0,lines.length*65+2);g.restore();
  const noteY=lines.length>1?1135:1085;drawWishNote(g,131,noteY,940,310,.035);
  if(story)g.translate(0,40);g.textAlign='right';g.fillStyle=cardPalette().accent;g.font='28px "Nunito", "Segoe UI", Arial, sans-serif';g.fillText('Thân thương, từ các bạn trai Liber',1080,1510);drawLiberSignature(g,1068,1574,60);floralSprig(g,104,1481,.9,-1);stickerStar(g,289,1442,12,.4);drawBunny(g,360,1511,.7,-.14);happyStar(g,475,1492,21,.2);return card;
 }


 document.querySelectorAll('input[name="cardFormat"]').forEach(input=>input.addEventListener('change',()=>{$('cardFallback').hidden=true;$('cardStatus').textContent='';}));
 $('saveCard').onclick=async()=>{
   const button=$('saveCard'),choices=[...document.querySelectorAll('input[name="cardFormat"],input[name="cardTheme"]')],format=choices.find(input=>input.name==='cardFormat'&&input.checked)?.value||'classic';button.disabled=true;choices.forEach(input=>input.disabled=true);$('cardFallback').hidden=true;$('cardStatus').textContent='Đang chuẩn bị thiệp của bạn…';
   try{await photoReady;await document.fonts.ready;await document.fonts.load('600 66px "Dancing Script"');await document.fonts.load('400 34px "Nunito"');await document.fonts.load('700 72px "Nunito"');const data=makeKeepsake(format).toDataURL('image/png');const name=(nickname||'ban').normalize('NFC').replace(/[^\p{L}\p{N}]+/gu,'-').replace(/^-|-$/g,'')||'ban';const a=document.createElement('a');a.href=data;a.download='Liber-20-10-'+name+'-'+activeCardTheme+(format==='story'?'-Story-9x16':'')+'.png';document.body.append(a);a.click();a.remove();$('cardFallback').href=data;$('cardFallback').download=a.download;$('cardFallback').hidden=false;$('cardStatus').textContent=(format==='story'?'Thiệp story đã sẵn sàng.':'Thiệp đã sẵn sàng.')+' Nếu chưa thấy ảnh tải xuống, mở ảnh bên dưới để lưu nhé.';
   }catch(e){$('cardStatus').textContent='Chưa tạo được thiệp. Bạn thử nhấn lại nhé.';}finally{button.disabled=false;choices.forEach(input=>input.disabled=false);}
 };








 if(bundledGreetingVideo){greetingVideo.src=bundledGreetingVideo;configureVideo();}



 window.addEventListener('pagehide',()=>{clearCelebrationTimer();greetingVideo.pause();});







 window.addEventListener('pagehide',()=>{clearTimeout(unlockTimer);stop();});


 window.addEventListener('pageshow',e=>{if(e.persisted&&activePage==='welcome')resetCardEntry();});



 // Public Apps Script URL only. No Google credentials are included in this page.
 const FEEDBACK_ENDPOINT = 'https://script.google.com/macros/s/AKfycbxrg-na4Lgu6m0rizikm_Zq0AQQIsw_5Aj2gPtodqZI9gAB2WuTEcRLyum5MryiDVw1AA/exec';
 const feedbackDrafts=new Map();let currentFeedbackId=null,feedbackBusy=false;
 function feedbackMood(score){return score<20?'Buồn một chút':score<40?'Chưa vui lắm':score<60?'Bình thường':score<80?'Khá vui':'Vui hết nấc';}
 function catDrawing(score,thumb=false){
  const t=score/100,curve=94+(t-.5)*30,eye=score>=75?'<path d="M74 73Q81 61 88 73M112 73Q119 61 126 73" fill="none" stroke="#6b4a59" stroke-width="4" stroke-linecap="round"/>':'<ellipse cx="81" cy="72" rx="5" ry="'+(7-t*2)+'" fill="#6b4a59"/><ellipse cx="119" cy="72" rx="5" ry="'+(7-t*2)+'" fill="#6b4a59"/><circle cx="83" cy="70" r="1.6" fill="white"/><circle cx="121" cy="70" r="1.6" fill="white"/>';
  const tears=score<25?'<path d="M69 81Q59 94 68 96Q77 94 69 81M132 81Q123 94 132 96Q141 94 132 81" fill="#aacbdc" opacity="'+(1-t*3)+'"/>':'';
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="'+(thumb?'40 10 120 115':'0 0 220 175')+'">'+(!thumb?'<ellipse cx="108" cy="160" rx="68" ry="8" fill="#b994aa" opacity=".18"/><path class="cat-tail" d="M153 143Q203 154 193 117" fill="none" stroke="#ebcbb7" stroke-width="16" stroke-linecap="round"/><ellipse cx="106" cy="128" rx="46" ry="35" fill="#f6e2ce" stroke="#c99caa" stroke-width="2"/><ellipse cx="79" cy="151" rx="19" ry="10" fill="#fff1df"/><ellipse cx="131" cy="151" rx="19" ry="10" fill="#fff1df"/>':'')+'<path d="M52 57L48 '+(17+(1-t)*13)+'Q68 20 82 41Q100 33 119 41Q137 20 153 '+(17+(1-t)*13)+'L148 60Q162 99 132 112Q100 125 69 112Q39 98 52 57" fill="#fff0dc" stroke="#bb8c9e" stroke-width="2.5"/><path d="M56 49L55 31L74 44M127 44L146 31L145 51" fill="#efb8c8"/>'+eye+'<ellipse cx="65" cy="88" rx="10" ry="5" fill="#ed9fb9" opacity="'+(.25+t*.6)+'"/><ellipse cx="136" cy="88" rx="10" ry="5" fill="#ed9fb9" opacity="'+(.25+t*.6)+'"/><path d="M96 82Q100 79 104 82L100 87Z" fill="#b87e97"/><path d="M87 96Q100 '+curve+' 113 96" fill="none" stroke="#855e73" stroke-width="3" stroke-linecap="round"/><path d="M56 79L43 76M55 86L41 86M146 79L159 76M147 86L161 86" stroke="#bb8c9e" stroke-width="1.5" stroke-linecap="round"/>'+tears+(!thumb?'<g fill="#df8eac" opacity="'+Math.max(0,(t-.65)/.35)+'"><path d="M27 43C9 25 2 48 27 60C53 43 40 26 27 43"/><path d="M184 28C170 14 160 32 184 43C208 30 197 14 184 28"/></g>':'')+'</svg>';
 }
 function updateFeedbackCat(){const score=Number($('catScore').value);$('feedbackCat').innerHTML=catDrawing(score);$('catScoreOutput').value=score+' / 100';$('catMood').textContent=feedbackMood(score);$('catScore').setAttribute('aria-valuetext',score+' trên 100, '+feedbackMood(score));$('catScore').style.setProperty('--cat-fill',score+'%');$('catScore').style.setProperty('--cat-thumb','url("data:image/svg+xml,'+encodeURIComponent(catDrawing(score,true))+'")');}
 function feedbackKey(id){return 'liber-feedback-v1:'+id;}
 function readFeedbackDraft(id){if(feedbackDrafts.has(id))return feedbackDrafts.get(id);try{const d=JSON.parse(localStorage.getItem(feedbackKey(id))||'null');if(d&&typeof d.feelings==='string'&&typeof d.impression==='string'&&Number.isInteger(d.score)&&d.score>=0&&d.score<=100){feedbackDrafts.set(id,d);return d;}}catch{}return {feelings:'',impression:'',score:50,requestId:'',sent:false};}
 function keepFeedbackDraft(id,draft){feedbackDrafts.set(id,draft);try{localStorage.setItem(feedbackKey(id),JSON.stringify(draft));}catch{}}
 function saveFeedbackDraft(){if(!currentFeedbackId||feedbackBusy)return;const old=readFeedbackDraft(currentFeedbackId),next={feelings:$('feedbackFeeling').value,impression:$('feedbackImpression').value,score:Number($('catScore').value)};const changed=next.feelings!==old.feelings||next.impression!==old.impression||next.score!==old.score;keepFeedbackDraft(currentFeedbackId,{...old,...next,...(changed?{requestId:'',sent:false}:{})});}
 function loadFeedbackDraft(){currentFeedbackId=activeRecipient?.id||null;const d=currentFeedbackId?readFeedbackDraft(currentFeedbackId):{feelings:'',impression:'',score:50};$('feedbackName').textContent=nickname||'Bạn';$('feedbackFeeling').value=d.feelings;$('feedbackImpression').value=d.impression;$('catScore').value=d.score;$('feedbackStatus').textContent='';updateFeedbackCat();}
 function openFeedback(edit=false){if(feedbackBusy)return;loadFeedbackDraft();const sent=currentFeedbackId&&readFeedbackDraft(currentFeedbackId).sent;if(sent&&!edit){$('feedbackThanksName').textContent=nickname;return changeModalScene('feedbackThanks','feedbackThanksTitle',null,'feedbackThanksTitle');}return changeModalScene('feedbackStage','feedbackTitle',null,'feedbackTitle');}
 $('openFeedback').onclick=()=>openFeedback();$('feedbackBack').onclick=()=>{saveFeedbackDraft();showEnding();};$('feedbackReturnCard').onclick=showEnding;$('feedbackEdit').onclick=()=>openFeedback(true);
 for(const id of ['feedbackFeeling','feedbackImpression'])$(id).addEventListener('input',saveFeedbackDraft);$('catScore').addEventListener('input',()=>{updateFeedbackCat();saveFeedbackDraft();});
 function sendFeedbackToGoogle(data){return new Promise((resolve,reject)=>{
  if(!/^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(FEEDBACK_ENDPOINT)){reject(new Error('Khảo sát chưa được kết nối. Câu trả lời đã được giữ trên thiết bị này để bạn gửi lại sau.'));return;}
  const channel=crypto.randomUUID(),frame=document.createElement('iframe'),form=document.createElement('form');frame.name='liber-feedback-'+channel;frame.hidden=true;frame.title='Gửi phản hồi tới Liber';form.method='POST';form.action=FEEDBACK_ENDPOINT;form.target=frame.name;form.hidden=true;const input=document.createElement('input');input.name='payload';input.value=JSON.stringify({...data,channel});form.append(input);let timer;
  const cleanup=()=>{clearTimeout(timer);window.removeEventListener('message',receive);form.remove();frame.remove();};
  const receive=event=>{let host;try{const origin=new URL(event.origin);if(origin.protocol!=='https:')return;host=origin.hostname;}catch{return;}if(host!=='script.google.com'&&host!=='script.googleusercontent.com'&&!host.endsWith('-script.googleusercontent.com'))return;const r=event.data;if(!r||r.type!=='liber-feedback-result'||r.channel!==channel||r.requestId!==data.requestId)return;cleanup();if(r.ok===true)resolve(r);else reject(new Error(r.message||'Chưa lưu được phản hồi. Bạn thử gửi lại nhé.'));};
  window.addEventListener('message',receive);document.body.append(frame,form);timer=setTimeout(()=>{cleanup();reject(new Error('Chưa nhận được xác nhận từ Google. Câu trả lời vẫn được giữ lại; bạn kiểm tra mạng rồi nhấn gửi lại nhé.'));},35000);form.submit();
 });}
 $('feedbackForm').addEventListener('submit',async event=>{event.preventDefault();if(feedbackBusy)return;const id=currentFeedbackId;if(!id){$('feedbackStatus').textContent='Bạn quay lại nhập tên để gửi cảm nhận nhé.';return;}for(const input of [$('feedbackFeeling'),$('feedbackImpression')]){if(!input.value.trim()){input.setCustomValidity('Bạn viết một chút cảm nhận tại đây nhé.');input.reportValidity();input.setCustomValidity('');return;}}saveFeedbackDraft();const draft=readFeedbackDraft(id);draft.requestId=draft.requestId||crypto.randomUUID();keepFeedbackDraft(id,draft);const payload={recipientId:id,feelings:draft.feelings.trim(),impression:draft.impression.trim(),score:draft.score,theme:activeCardTheme,requestId:draft.requestId};feedbackBusy=true;const controls=[...$('feedbackForm').querySelectorAll('input,textarea,button'),$('feedbackBack')];controls.forEach(el=>el.disabled=true);$('sendFeedback').textContent='Đang gửi…';$('feedbackStatus').textContent='Đang gửi lời nhắn của bạn tới Liber…';
  try{await sendFeedbackToGoogle(payload);keepFeedbackDraft(id,{...draft,sent:true});if(currentFeedbackId===id){$('feedbackStatus').textContent='Đã lưu cảm nhận của bạn.';if(celebration.open&&!$('feedbackStage').hidden){$('feedbackThanksName').textContent=nickname;await changeModalScene('feedbackThanks','feedbackThanksTitle',null,'feedbackThanksTitle');}}}
  catch(error){if(currentFeedbackId===id)$('feedbackStatus').textContent=error.message;}
  finally{feedbackBusy=false;controls.forEach(el=>el.disabled=false);$('sendFeedback').textContent='Gửi cảm nhận ♡';}
 });

})();



