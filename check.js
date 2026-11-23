
(function(){
var $=function(s){return document.querySelector(s)},$$=function(s){return [].slice.call(document.querySelectorAll(s))};
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
var cfg={tone:'cortes',voice:'p:classico',rate:.95,pitch:.7,appLang:'pt-BR',speechLang:'pt-BR'};
try{var sv=JSON.parse(localStorage.getItem('jv')||'{}');for(var kk in sv)cfg[kk]=sv[kk];}catch(e){}
function save(){try{localStorage.setItem('jv',JSON.stringify(cfg));}catch(e){}}
var OP={cortes:'Certamente, senhor. Estou verificando.',formal:'Claro. Vou realizar essa tarefa.',informal:'Beleza! Vou verificar isso pra vc.'};
var TT={home:'Jarvis',proj:'Projetos',chat:'Projeto',cust:'Personalizar',cal:'Calendário',lib:'Biblioteca',img:'Imagens',conf:'Configurações',conta:'Conta',geral:'Geral',uso:'Uso e limites',sobre:'Sobre',soon:''};
var SRC=[['Wikipédia','W','#6b7280','https://pt.wikipedia.org'],['Google','G','#4285f4','https://www.google.com'],['Reuters','R','#ff8000','https://www.reuters.com']];
// ---------- navegação
function go(v){$$('.view').forEach(function(x){x.classList.remove('on')});$('#v-'+v).classList.add('on');$('#tt').textContent=TT[v];var sub=(v==='conf'||v==='conta'||v==='soon'||v==='geral'||v==='uso'||v==='sobre');$('#hlogo').hidden=v!=='home';$('#tt').hidden=v==='home'||v==='chat';$('#menu').hidden=sub;$('#back').hidden=!sub;if(v!=='home'&&vm)exitVM();if(v==='home')setTimeout(layoutChat,0);if(v==='uso')paintUso();drawer(false);}
function drawer(o){$('#dr').classList.toggle('on',o);$('#sh').classList.toggle('on',o);}
$('#menu').onclick=function(){drawer(true)};$('#sh').onclick=function(){drawer(false)};
$$('#dr a').forEach(function(a){a.onclick=function(){go(a.dataset.v)}});
// ---------- núcleo (orb)
var cv=$('#c'),ctx=cv.getContext('2d'),N=6000,P=[],i,state='idle',t=0,ang=0,lvl=0,w=0,h=0,dpr=1,an=null,buf=null,mic=null;
for(i=0;i<N;i++){var yy=1-2*(i+.5)/N,rr0=Math.sqrt(1-yy*yy),th=i*2.399963;P.push([Math.cos(th)*rr0,yy,Math.sin(th)*rr0]);}
var S={idle:{sp:.35,amp:.12,pulse:.02,rot:.12,l:'Em espera'},listen:{sp:.7,amp:.13,pulse:.3,rot:.2,l:'Ouvindo…'},think:{sp:2.6,amp:.24,pulse:.06,rot:.9,l:'Pensando…'},speak:{sp:.9,amp:.14,pulse:.34,rot:.25,l:'Respondendo'}};
var cur={sp:.35,amp:.12,pulse:.02,rot:.12};
function size(){dpr=Math.min(window.devicePixelRatio||1,2);w=cv.clientWidth;h=cv.clientHeight;cv.width=w*dpr;cv.height=h*dpr;}
window.addEventListener('resize',size);size();
function set(s){state=s;$('#mic').setAttribute('aria-pressed',s==='listen'?'true':'false');}
function startMic(){if(mic||!navigator.mediaDevices)return;try{navigator.mediaDevices.getUserMedia({audio:true}).then(function(s){var AC=window.AudioContext||window.webkitAudioContext,ac=new AC();an=ac.createAnalyser();an.fftSize=512;ac.createMediaStreamSource(s).connect(an);buf=new Uint8Array(an.fftSize);mic=s;}).catch(function(){});}catch(e){}}
function micLevel(){if(!an)return null;an.getByteTimeDomainData(buf);var s=0,k;for(k=0;k<buf.length;k++){var v=(buf[k]-128)/128;s+=v*v;}return Math.min(1,Math.sqrt(s/buf.length)*5);}
var last=performance.now(),px=new Float32Array(N),py=new Float32Array(N),pd=new Float32Array(N);
function paint(c,cw,ch,d,step,k){
 c.setTransform(d,0,0,d,0,0);c.clearRect(0,0,cw,ch);
 var R=Math.min(cw,ch)*(cw<=40?.36:.3),cx=cw/2,cy=ch/2-(cw>40?6:0),ca=Math.cos(ang),sa=Math.sin(ang),ct=Math.cos(.35),st=Math.sin(.35),n=0,j,i2;
 var sc=1+(state==='idle'?.03:.06)*lvl*(cur.pulse*3),LT=document.documentElement.getAttribute('data-t')==='light';
 for(i2=0;i2<N;i2+=step){var p=P[i2],x=p[0],y=p[1],z=p[2],az=Math.atan2(z,x);
  var dd=cur.amp*(Math.sin(x*2.3+t*2)+Math.sin(y*2.8-t*2.4)+Math.sin(z*2.5+t*1.7))/4;
  dd+=cur.amp*1.1*Math.sin(az*6+y*4+t*2.5)*(.3+.7*Math.abs(Math.sin(y*3.2-t*1.3)))*(.3+.7*Math.abs(x*Math.sin(t)+z*Math.cos(t)));
  dd+=cur.amp*.3*Math.sin(az*11-y*7-t*3.2)+cur.amp*.55*Math.sin(y*9+Math.sin(az*3+t)*1.6-t*2.2)+cur.amp*.3*Math.sin(az*4-y*14+t*1.8);
  dd+=cur.pulse*lvl*(.6+.4*Math.sin(y*5+t*6));
  var rr=(1+dd)*sc;x*=rr;y*=rr;z*=rr;
  var x1=x*ca+z*sa,z1=-x*sa+z*ca,y1=y*ct-z1*st,z2=y*st+z1*ct,f=2.6/(2.6-z2);
  px[n]=cx+x1*R*f;py[n]=cy+y1*R*f;pd[n]=z2;n++;}
 for(var b=0;b<5;b++){var lo=-1.3+b*.52,hi=lo+.52,u=b/4;
  c.fillStyle='hsla('+(222-u*16)+',100%,'+(LT?(50-u*20):(38+u*30))+'%,'+(.28+u*.72)+')';var sz=(.8+u)*k;
  for(j=0;j<n;j++){var dz=pd[j];if(dz>=lo&&(dz<hi||(b===4&&dz>=hi)))c.fillRect(px[j]-sz/2,py[j]-sz/2,sz,sz);}}
}
function frame(now){
 requestAnimationFrame(frame);var dt=Math.min(.05,(now-last)/1000);last=now;
 if(!$('#v-home').classList.contains('on'))return;
 if(cv.width!==Math.round(cv.clientWidth*dpr)||cv.height!==Math.round(cv.clientHeight*dpr))size();
 var T=S[state],k=1-Math.exp(-dt*4);
 for(var q in cur)cur[q]+=(T[q]-cur[q])*k;
 t+=dt*cur.sp;ang+=dt*cur.rot;
 var tg=0;
 if(state==='listen'){var ml=micLevel();tg=ml!==null?ml:(.5+.5*Math.sin(now/170))*(.35+.65*Math.abs(Math.sin(now/530)));}
 else if(state==='speak'){tg=Math.abs(Math.sin(now/95))*(.4+.6*Math.abs(Math.sin(now/410+1)));}
 else if(state==='think'){tg=.35+.25*Math.sin(now/120);}
 else{tg=.5+.5*Math.sin(now/1600);}
 lvl+=(tg-lvl)*(1-Math.exp(-dt*(state==='speak'?18:10)));
 var m=Math.min(w,h);paint(ctx,w,h,dpr,m>200?1:m>110?2:3,Math.max(.5,Math.min(1.1,m/250)));
 if(mo&&mo.isConnected)paint(mctx,36,36,dpr,3,.8);
}
requestAnimationFrame(frame);
// ---------- fala e respostas
function say(text){
 set('speak');var done=function(){if(state!=='speak')return;if(vm&&!muted){set('listen');startRec();}else set('idle');};
 if(!window.speechSynthesis){setTimeout(done,2500);return;}
 try{speechSynthesis.cancel();var u=new SpeechSynthesisUtterance(text);u.lang=cfg.speechLang;u.rate=cfg.rate;u.pitch=cfg.pitch;
  var rv=resolveVoice();if(rv)u.voice=rv;
  u.onend=done;u.onerror=done;speechSynthesis.speak(u);}catch(e){setTimeout(done,2500);}
}
function mk(q){var T=cfg.tone;return{q:q,d:OP[T]+' Sobre “'+q+'”: aqui entra a resposta direta, em poucas palavras.',x:(T==='informal'?'Aqui vem a explicação detalhada, tbm com o q vc precisa saber pq isso importa.':T==='cortes'?'Segue, senhor, a explicação detalhada, com o contexto e os fundamentos da resposta.':'A seguir, a explicação detalhada, com contexto e fundamentos.')+' (Simulação: no app real esta parte vem '+IAN()+', com pesquisa na web.)'};}
function reply(r){var b=document.createElement('div');
 b.innerHTML='<div class="direct">'+esc(r.d)+'</div><div class="detail">'+esc(r.x)+'</div><button class="src" type="button" aria-label="Ver fontes">'+SRC.map(function(s){return '<span class="fi" style="background:'+s[2]+'">'+s[1]+'</span>'}).join('')+'<span class="ft">Fontes</span></button>';
 b.querySelector('.src').onclick=function(){openSrc(r.q)};return b;}
var curConv=null,att=null,attFile=null;
function send(q,voice){q=(q||'').trim();if(!q)return;if(voice){try{vrec&&vrec.abort()}catch(e){}}
 $('#q').value='';$('#vq').value='';
 if(!curConv){curConv=[q.length>40?q.slice(0,40)+'…':q,[]];HI.unshift(curConv);renderHist('');}
 US.c++;saveU();if(attFile)saveFile(attFile.f,attFile.kind);
 addU(q);setAtt(null);var jm=addJ();layoutChat();scrollEnd();setTimeout(scrollEnd,560);set('think');
 var c0=curConv;c0[1].push(['u',q]);
 setTimeout(function(){if(c0!==curConv)return;var r=mk(q);c0[1].push(['j',r.d]);jm.querySelector('.mt').appendChild(reply(r));scrollEnd();if(voice)say(r.d);else set('idle');},1700);}
$('#q').onkeydown=function(e){if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send($('#q').value||(att?'Analise o anexo':''))}};
var rec=null;
$('#mic').onclick=function(){
 if(state==='listen'){try{rec&&rec.stop()}catch(e){}set('idle');return;}
 set('listen');startMic();var SR=window.SpeechRecognition||window.webkitSpeechRecognition;
 if(SR){try{rec=new SR();rec.lang=cfg.speechLang;rec.onresult=function(e){send(e.results[0][0].transcript)};rec.onend=rec.onerror=function(){if(state==='listen')set('idle')};rec.start();return;}catch(e){}}
 setTimeout(function(){if(state==='listen')set('idle')},3500);};
// ---------- projetos e histórico
var PR=[{t:'Criar servidor Minecraft',s:'Servidor próprio para jogar sem filas e manter meu mundo.',d:Date.now()-864e5*9,m:[['u','Quero criar um servidor de Minecraft.'],['j','Certo. Vamos começar escolhendo onde hospedar.']]},{t:'Desenvolver meu computador',s:'Planejar componentes, desempenho e orçamento de montagem.',d:Date.now()-864e5*4,m:[['u','Quero montar um PC.'],['j','Qual o seu orçamento e o uso principal?']]},{t:'Estudar no exterior',s:'Pesquisar universidades, bolsas e oportunidades internacionais.',d:Date.now()-864e5,m:[['u','Quero estudar fora.'],['j','Qual curso e país te interessam?']]}];
var HI=[['Como funciona um buraco negro',[['u','Como funciona um buraco negro?'],['j','Resposta direta e explicação detalhada ficam aqui.']]],['Receita de bolo de cenoura',[['u','Receita de bolo de cenoura'],['j','Ingredientes e modo de preparo ficam aqui.']]],['Dicas para estudar melhor',[['u','Dicas para estudar melhor'],['j','Resposta direta e explicação detalhada ficam aqui.']]],['Diferença entre RAM e SSD',[['u','Qual a diferença entre RAM e SSD?'],['j','Resposta direta e explicação detalhada ficam aqui.']]],['Receita de pão caseiro',[['u','Receita de pão caseiro'],['j','Ingredientes e modo de preparo ficam aqui.']]],['Como montar um PC gamer',[['u','Como montar um PC gamer?'],['j','Resposta direta e explicação detalhada ficam aqui.']]]];
var openP=null;
function plist(){$('#pl').innerHTML='';PR.forEach(function(p,k){var c=document.createElement('div');c.className='card';c.innerHTML='<b>'+esc(p.t)+'</b><p>'+esc(p.s)+'</p><small>Criado em '+new Date(p.d).toLocaleDateString('pt-BR')+'</small>';c.onclick=function(){openChat(p)};$('#pl').appendChild(c);});}
function openChat(p){openP=p;$('#ct').textContent=p.t;$('#cs').textContent='';$('#cm').innerHTML='';p.m.forEach(addM);go('chat');$('#cm').scrollTop=$('#cm').scrollHeight;}
function addM(m){var d=document.createElement('div');if(m[0]==='u'){d.className='msg u';d.innerHTML='<div class="bub">'+esc(m[1])+'</div>';}else{d.className='msg j';var a=document.createElement('div');a.className='project-answer';a.textContent=m[1];d.appendChild(a);if(m[2]){var x=document.createElement('div');x.className='project-detail';x.textContent=m[2];d.appendChild(x);}}$('#cm').appendChild(d);}
function cont(){var q=$('#cq').value.trim();if(!q||!openP)return;$('#cq').value='';var z=mk(q),u=['u',q],j=['j',z.d,z.x];openP.m.push(u,j);addM(u);addM(j);$('#cm').scrollTop=$('#cm').scrollHeight;}
$('#cb').onclick=cont;$('#cq').onkeydown=function(e){if(e.key==='Enter')cont()};
$('#np').onclick=function(){$('#nf').hidden=false};
$('#nsv').onclick=function(){var a=$('#nt').value.trim();if(!a)return;PR.unshift({t:a,s:$('#ns').value.trim(),d:Date.now(),m:[]});$('#nt').value=$('#ns').value='';$('#nf').hidden=true;plist();};
var ALL=false;
function renderHist(f){var h=$('#hist');h.innerHTML='';f=(f||'').toLowerCase();var r=HI.filter(function(x){return x[0].toLowerCase().indexOf(f)>-1});if(!r.length){h.innerHTML='<div class="h" style="color:var(--dim)">Nenhuma conversa encontrada</div>';return;}var lim=(ALL||f)?r.length:5;r.slice(0,lim).forEach(function(x){var a=document.createElement('div');a.className='h';a.textContent=x[0];a.onclick=function(){openChat({t:x[0],s:'',d:0,m:x[1]})};h.appendChild(a);});if(!f&&r.length>5){var v=document.createElement('div');v.className='h va';v.textContent=ALL?'Ver menos':'Ver todos…';v.onclick=function(){ALL=!ALL;renderHist('')};h.appendChild(v);}}
renderHist('');
$('#sb').onclick=function(){$('#dh').hidden=true;$('#sf').hidden=false;$('#si').focus();};
$('#si').oninput=function(){renderHist(this.value)};
$('#sx').onclick=function(){$('#si').value='';renderHist('');$('#sf').hidden=true;$('#dh').hidden=false;};
plist();
// ---------- personalizar
function tonesUI(){$$('#tone button').forEach(function(b){b.setAttribute('aria-pressed',b.dataset.t===cfg.tone?'true':'false')});$('#tex').textContent=OP[cfg.tone];}
$$('#tone button').forEach(function(b){b.onclick=function(){cfg.tone=b.dataset.t;save();tonesUI();}});
var PRE={'p:classico':{n:'Jarvis Clássico (grave e calmo)',rate:.95,pitch:.7},'p:sereno':{n:'Jarvis Sereno (suave e pausado)',rate:.88,pitch:.85},'p:imponente':{n:'Jarvis Imponente (mais grave e lento)',rate:.85,pitch:.55}};
function pool(){var vs=window.speechSynthesis?speechSynthesis.getVoices():[],l=cfg.speechLang.slice(0,2),f=vs.filter(function(v){return v.lang.slice(0,2)===l});if(l==='en')f.sort(function(a,b){return (b.lang==='en-GB')-(a.lang==='en-GB')});var m=f.filter(function(v){return /male|masc|daniel|felipe|ricardo|luciano|jorge|diego|alex|google uk/i.test(v.name)&&!/female|fem/i.test(v.name)});return{all:f,main:m.length?m:f};}
function resolveVoice(){var p=pool(),k=PRE[cfg.voice]?cfg.voice:'p:classico';if(PRE[k]){var ix=Object.keys(PRE).indexOf(k);return p.main[ix%(p.main.length||1)]||null;}for(var j=0;j<p.all.length;j++)if(p.all[j].name===k)return p.all[j];return null;}
var SH=null,CH='<svg viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg>';
function sel(id,title,opts,get,pick){var b=$('#'+id);function lab(){var o=opts.filter(function(x){return x.v===get()})[0]||opts[0];b.firstChild.textContent=o.t+(o.d?' ('+o.d+')':'');}
 b.innerHTML='<span></span>'+CH;lab();
 b.onclick=function(){$('#stt').textContent=title;$('#sopts').innerHTML=opts.map(function(o){return '<button class="op'+(o.v===get()?' on':'')+'" data-v="'+o.v+'"><span><b>'+esc(o.t)+'</b>'+(o.d?'<small>'+esc(o.d)+'</small>':'')+'</span><i></i></button>'}).join('');SH=function(v){pick(v);lab();};SHT.open();};}
$('#sopts').onclick=function(e){var o=e.target.closest('.op');if(!o||!SH)return;SH(o.dataset.v);SHT.close();};

var LG=[{v:'pt-BR',t:'Português (Brasil)'},{v:'en-US',t:'English'},{v:'es-ES',t:'Español'}];
sel('vs','Voz',[{v:'p:classico',t:'Jarvis Clássico',d:'grave e calmo'},{v:'p:sereno',t:'Jarvis Sereno',d:'suave e pausado'},{v:'p:imponente',t:'Jarvis Imponente',d:'mais grave e lento'}],function(){return PRE[cfg.voice]?cfg.voice:'p:classico'},function(v){cfg.voice=v;var p=PRE[v];cfg.rate=p.rate;cfg.pitch=p.pitch;$('#rt').value=p.rate;$('#pt').value=p.pitch;save();});
sel('al','Idioma da interface',LG,function(){return cfg.appLang},function(v){cfg.appLang=v;save();});
sel('sl','Idioma do Jarvis',LG,function(){return cfg.speechLang},function(v){cfg.speechLang=v;save();});
$('#rt').value=cfg.rate;$('#pt').value=cfg.pitch;
$('#rt').oninput=function(){cfg.rate=+this.value;save()};$('#pt').oninput=function(){cfg.pitch=+this.value;save()};

var TST={'pt-BR':{cortes:['Seja bem-vindo de volta, senhor. Em que posso ser útil?'],formal:['Olá! Estou à sua disposição.'],informal:['Fala! Manda aí, o que precisa?','Opa! Qual vai ser a missão de hoje?']},'en-US':{cortes:['Welcome back, sir. How may I be of service?'],formal:['Hello! I am at your disposal.'],informal:['Hey! Go ahead, what do you need?','Hey! What’s the mission today?']},'es-ES':{cortes:['Bienvenido de nuevo, señor. ¿En qué puedo serle útil?'],formal:['¡Hola! Estoy a su disposición.'],informal:['¡Eh! Dime, ¿qué necesitas?','¡Hola! ¿Cuál es la misión de hoy?']}};
$('#tv').onclick=function(){var a=TST[cfg.speechLang][cfg.tone];say(a[Math.floor(Math.random()*a.length)])};
tonesUI();
// ---------- calendário (simulado)
(function(){var n=new Date(),y=n.getFullYear(),m=n.getMonth(),f=new Date(y,m,1).getDay(),dn=new Date(y,m+1,0).getDate(),ev={};ev[n.getDate()+1]=1;ev[n.getDate()+3]=1;
$('#cmn').textContent=n.toLocaleDateString('pt-BR',{month:'long',year:'numeric'});var h='';'DSTQQSS'.split('').forEach(function(d){h+='<div class="d">'+d+'</div>'});for(var k=0;k<f;k++)h+='<div></div>';for(var d=1;d<=dn;d++)h+='<div class="'+(d===n.getDate()?'t':ev[d]?'e':'')+'">'+d+'</div>';$('#cg').innerHTML=h;})();
// ---------- biblioteca e imagens
$('#zm').onclick=function(){this.classList.remove('on')};

// ---------- novo, conta e configurações
$('#nw').onclick=function(){if(vm)exitVM();curConv=null;try{speechSynthesis.cancel()}catch(e){}set('idle');resetAns();$('#q').value='';go('home');};
var prof={name:'',photo:''};
try{var pp=JSON.parse(localStorage.getItem('jp')||'{}');prof.name=pp.name||'';prof.photo=pp.photo||'';}catch(e){}
function saveP(){try{localStorage.setItem('jp',JSON.stringify(prof));}catch(e){}}
function ini(){var w=prof.name.trim().split(/\s+/).filter(Boolean);return w.length?(w[0][0]+(w.length>1?w[w.length-1][0]:'')).toUpperCase():'RC';}
function paintAv(){$$('.av').forEach(function(e){e.textContent=prof.photo?'':ini();e.style.backgroundImage=prof.photo?'url('+prof.photo+')':'none';});$('#pnm').textContent='Administrador/Criador';$('#cnm').textContent=prof.name;var hi=$('#hi');if(hi)hi.textContent=greet();}
$('#ni').value=prof.name;
$('#ni').oninput=function(){prof.name=this.value;saveP();paintAv();};
$('#avb').onclick=$('#pen').onclick=function(){$('#pf').click()};
$('#pf').onchange=function(){var f=this.files[0];if(!f)return;var im=new Image();im.onload=function(){var s=256,c=document.createElement('canvas');c.width=c.height=s;var m=Math.min(im.width,im.height);c.getContext('2d').drawImage(im,(im.width-m)/2,(im.height-m)/2,m,m,0,0,s,s);prof.photo=c.toDataURL('image/jpeg',.85);saveP();paintAv();URL.revokeObjectURL(im.src);};im.src=URL.createObjectURL(f);};
$('#rc').onclick=function(){go('conf')};
$('#back').onclick=function(){var v=$('.view.on').id;go(v==='v-conta'||v==='v-soon'||v==='v-geral'||v==='v-uso'||v==='v-sobre'?'conf':'home');};
$$('#v-conf .row').forEach(function(r){r.onclick=function(){if(r.dataset.go==='conta'){go('conta');}else if(r.dataset.t==='Geral'){go('geral');}else if(r.dataset.t==='Uso e limites'){go('uso');}else if(r.dataset.t==='Sobre'){go('sobre');}else if(r.dataset.t==='Armazenamento'){openStore();}else{go('soon');$('#tt').textContent=r.dataset.t;}};});
$('#fq').oninput=function(){var q=this.value.toLowerCase();$$('#v-conf .row').forEach(function(r){r.hidden=r.textContent.toLowerCase().indexOf(q)<0});$$('#v-conf .grp').forEach(function(g){g.hidden=!g.querySelector('.row:not([hidden])')});};
paintAv();

// ---------- saudação, anexos e modo voz
function greet(){var n=prof.name.trim().split(/\s+/)[0];return n?'Olá, '+n:'Olá';}
function resetAns(){msgsEl.innerHTML='';upd();layoutChat();chatEl.scrollTop=0;}
function setAtt(n){att=n;if(!n)attFile=null;$('#att').hidden=!n;$('#atn').textContent=n||'';upd();}
$('#atx').onclick=function(){setAtt(null)};
function am(o){$('#amo').classList.toggle('on',o);}
$('#pl1').onclick=$('#pl2').onclick=function(){am(true)};
$('#amo').onclick=function(e){if(e.target.id==='amo')am(false)};
$$('#am button').forEach(function(b){b.onclick=function(){am(false);$('#'+b.dataset.f).click()};});
['fcam','fpho','ffil'].forEach(function(id){$('#'+id).onchange=function(){var f=this.files[0];if(f){attFile={f:f,kind:id==='ffil'?'file':'image'};setAtt(f.name);}this.value='';};});
var vm=false,muted=false,vrec=null;
function startRec(){if(!vm||muted||state==='think'||state==='speak')return;var SR=window.SpeechRecognition||window.webkitSpeechRecognition;
 if(!SR){note('Este navegador não reconhece voz. Digite sua pergunta abaixo.');return;}
 try{vrec=new SR();vrec.lang=cfg.speechLang;vrec.onresult=function(e){send(e.results[0][0].transcript,true)};vrec.onend=function(){vrec=null;if(vm&&!muted&&state==='listen')setTimeout(startRec,250)};vrec.onerror=function(){};vrec.start();set('listen');}catch(e){}}
function setMute(){var b=$('#vmu');b.setAttribute('aria-pressed',muted?'true':'false');b.querySelector('.mon').hidden=!muted;b.querySelector('.moff').hidden=muted;b.setAttribute('aria-label',muted?'Ligar microfone':'Desligar microfone');}
$('#wv').onclick=function(){vm=true;muted=false;try{rec&&rec.abort()}catch(e){}document.body.classList.add('vm');$('#v-home').classList.add('vm');$('#vbar').hidden=false;layoutChat();setMute();startMic();set('listen');startRec();};
function exitVM(){vm=false;try{vrec&&vrec.abort()}catch(e){}try{speechSynthesis.cancel()}catch(e){}document.body.classList.remove('vm');$('#v-home').classList.remove('vm');$('#vbar').hidden=true;set('idle');layoutChat();}
$('#vx').onclick=exitVM;
$('#vmu').onclick=function(){muted=!muted;setMute();if(muted){try{vrec&&vrec.abort()}catch(e){}if(state==='listen')set('idle');}else{if(state==='idle')set('listen');startRec();}};
$('#vq').onkeydown=function(e){if(e.key==='Enter')send(this.value,true)};
paintAv();

// ---------- tema, fonte, cabeçalho e envio
if(cfg.theme!=='light')cfg.theme='dark';if(!cfg.fs)cfg.fs=100;if(!cfg.ff)cfg.ff='def';
var FF={def:{n:'Padrão',css:'"Segoe UI",system-ui,-apple-system,Roboto,sans-serif'},ser:{n:'Serifada',css:'Georgia,"Times New Roman",serif'},mono:{n:'Monoespaçada',css:'ui-monospace,Menlo,Consolas,monospace'}};
var mq=window.matchMedia?matchMedia('(prefers-color-scheme: light)'):null;
function applyTheme(){document.documentElement.setAttribute('data-t',cfg.theme==='light'?'light':'dark');}
if(mq){if(mq.addEventListener)mq.addEventListener('change',applyTheme);else if(mq.addListener)mq.addListener(applyTheme);}
function applyFont(){var r=document.documentElement.style;r.setProperty('--fs',cfg.fs/100);r.setProperty('--ff',(FF[cfg.ff]||FF.def).css);}
function paintGeral(){$$('#thm button').forEach(function(b){b.setAttribute('aria-pressed',b.dataset.m===cfg.theme?'true':'false')});$('#fsv').textContent=(FF[cfg.ff]||FF.def).n;$('#fzv').textContent=cfg.fs+'%';$('#fz').value=cfg.fs;}
$$('#thm button').forEach(function(b){b.onclick=function(){cfg.theme=b.dataset.m;save();applyTheme();paintGeral();}});
$('#fz').oninput=function(){cfg.fs=+this.value;save();applyFont();$('#fzv').textContent=cfg.fs+'%';};
function sheetOpen(title,opts,get,pick){$('#stt').textContent=title;$('#sopts').innerHTML=opts.map(function(o){return '<button class="op'+(o.v===get()?' on':'')+'" data-v="'+o.v+'"><span><b>'+esc(o.t)+'</b></span><i></i></button>'}).join('');SH=function(v){pick(v)};SHT.open();}
$('#rfs').onclick=function(){sheetOpen('Estilo de fonte',[{v:'def',t:'Padrão'},{v:'ser',t:'Serifada'},{v:'mono',t:'Monoespaçada'}],function(){return cfg.ff},function(v){cfg.ff=v;save();applyFont();paintGeral();});};
applyTheme();applyFont();paintGeral();
$('#hlogo').src=$('#logo').src;
function upd(){var q=$('#q');q.style.height='auto';if(q.value)q.style.height=Math.min(q.scrollHeight,120)+'px';var h=q.value.trim().length>0||!!att;$('#snd').hidden=!h;$('#wv').hidden=h;openBar();}
$('#q').oninput=upd;
$('#snd').onclick=function(){send($('#q').value||(att?'Analise o anexo':''))};
upd();

// ---------- conversa, núcleo na mensagem e aba de fontes
var chatEl=$('#ans'),msgsEl=$('#msgs'),hero=$('#hero'),HH=400,mo=document.createElement('canvas'),mctx=mo.getContext('2d'),B=200;
mo.width=mo.height=Math.round(36*dpr);
function note(t){var n=document.createElement('div');n.className='note';n.textContent=t;msgsEl.appendChild(n);}
function addU(q){var d=document.createElement('div');d.className='msg u';d.innerHTML='<div class="bub">'+esc(q)+(att?'<small>anexo: '+esc(att)+'</small>':'')+'</div>';msgsEl.appendChild(d);}
function addJ(){var d=document.createElement('div');d.className='msg j';d.innerHTML='<span class="mo"></span><div class="mt"></div>';msgsEl.appendChild(d);d.querySelector('.mo').appendChild(mo);return d;}
function shrink(){var p=Math.min(1,chatEl.scrollTop/Math.max(1,HH*.85)),o=$('#orbw');o.style.transform='scale('+(1-p*.75)+')';o.style.opacity=1-p*.9;}
function scrollEnd(){chatEl.scrollTop=chatEl.scrollHeight;shrink();}
function layoutChat(){var H=$('#chatw').clientHeight;if(!H)return;var has=msgsEl.children.length>0;HH=Math.round(has?H*(vm?.55:.42):H);hero.style.height=HH+'px';$('#orbw').style.height=Math.round(has?HH:Math.min(vm?380:300,H*(vm?.6:.45)))+'px';$('#gr').hidden=has||vm;shrink();}
chatEl.addEventListener('scroll',shrink);window.addEventListener('resize',layoutChat);
setTimeout(layoutChat,0);setTimeout(layoutChat,300);

// ---------- abas arrastáveis, offline, armazenamento, uso e barra expandida
function dsheet(root,panel,handle){
 var st='base',drag=false,y0=0,h0=0;
 function open(m){st=m||'base';panel.classList.toggle('full',st==='full');panel.style.height='';panel.style.transform='';root.classList.add('on');}
 function close(){root.classList.remove('on','drag');panel.classList.remove('full');panel.style.height='';panel.style.transform='';st='base';}
 handle.addEventListener('pointerdown',function(e){drag=true;y0=e.clientY;h0=panel.offsetHeight;root.classList.add('drag');try{handle.setPointerCapture(e.pointerId)}catch(x){}});
 handle.addEventListener('pointermove',function(e){if(!drag)return;var dy=e.clientY-y0,H=window.innerHeight;
  if(dy<0){panel.style.transform='';panel.style.height=Math.min(H*.94,h0-dy)+'px';}
  else if(st==='full'){panel.style.transform='';panel.style.height=Math.max(H*.2,h0-dy)+'px';}
  else panel.style.transform='translateY('+dy+'px)';});
 function end(e){if(!drag)return;drag=false;root.classList.remove('drag');var dy=e.clientY-y0,H=window.innerHeight;panel.style.transform='';panel.style.height='';
  if(st==='base'){if(dy>70)close();else if(dy<-40)open('full');else open('base');}
  else{if(dy>H*.4)close();else if(dy>60)open('base');else open('full');}}
 handle.addEventListener('pointerup',end);handle.addEventListener('pointercancel',end);
 root.querySelector('.sbk').addEventListener('click',close);
 return {open:open,close:close};
}
var SHT=dsheet($('#sheet'),$('#sheet .spn'),$('#shh')),SRCSH=dsheet($('#ss'),$('#sp'),$('#sg')),STSH=dsheet($('#stg'),$('#stp'),$('#stgh'));
function openSrc(q){var t=q.length>60?q.slice(0,60)+'…':q;
 $('#ssl').innerHTML=SRC.map(function(s){var host=s[3].replace(/^https?:\/\/(www\.)?/,'');return '<div class="si2"><div class="sh"><span class="fi s" style="background:'+s[2]+'">'+s[1]+'</span><span>'+esc(host)+'</span></div><a href="'+s[3]+'" target="_blank" rel="noopener noreferrer"><b>'+esc(s[0])+': resultado sobre “'+esc(t)+'”</b><span>Trecho da página consultada para a resposta (exemplo). No app real aparecem o título e o resumo de cada fonte.</span></a></div>'}).join('');
 $('#ssl').scrollTop=0;SRCSH.open('base');}
// banco de dados no aparelho (funciona offline)
var DB=null;
function idb(cb){if(DB)return cb(DB);try{var r=indexedDB.open('jarvis',1);r.onupgradeneeded=function(){r.result.createObjectStore('items',{keyPath:'id'})};r.onsuccess=function(){DB=r.result;cb(DB)};r.onerror=function(){cb(null)};}catch(e){cb(null)}}
function putItem(it,done){idb(function(d){if(!d){done&&done(false);return;}var tx=d.transaction('items','readwrite');tx.objectStore('items').put(it);tx.oncomplete=function(){done&&done(true)};tx.onerror=function(){done&&done(false)};});}
function allItems(cb){idb(function(d){if(!d){cb([]);return;}var q=d.transaction('items').objectStore('items').getAll();q.onsuccess=function(){cb(q.result||[])};q.onerror=function(){cb([])};});}
function delItems(ids,cb){idb(function(d){if(!d){cb&&cb();return;}var tx=d.transaction('items','readwrite'),os=tx.objectStore('items');ids.forEach(function(i){os.delete(i)});tx.oncomplete=function(){cb&&cb()};});}
function fmtB(n){if(n<1024)return n+' B';if(n<1048576)return Math.round(n/1024)+' KB';var m=n/1048576;return (m<10?m.toFixed(1):Math.round(m))+' MB';}
function saveFile(f,kind,cb){putItem({id:Date.now()+'-'+Math.random().toString(36).slice(2,7),kind:kind,name:f.name,size:f.size,type:f.type,date:Date.now(),blob:f},function(ok){if(kind==='book')renderLib();if(kind==='image')renderImgs();cb&&cb(ok);});}
function renderLib(){allItems(function(a){var l=a.filter(function(x){return x.kind==='book'}).sort(function(x,y){return y.date-x.date}),h=$('#ll');h.innerHTML='';
 if(!l.length){h.innerHTML='<p class="empty">Nenhum livro ainda. Adicione um livro e ele fica salvo no aparelho para ler offline.</p>';return;}
 l.forEach(function(x){var d=document.createElement('div');d.className='card';d.innerHTML='<b>'+esc(x.name)+'</b><small>'+fmtB(x.size)+' · salvo offline</small>';d.onclick=function(){window.open(URL.createObjectURL(x.blob),'_blank')};h.appendChild(d);});});}
function renderImgs(){allItems(function(a){var l=a.filter(function(x){return x.kind==='image'}).sort(function(x,y){return y.date-x.date}),h=$('#ig');h.innerHTML='';
 l.forEach(function(x){var im=document.createElement('img');im.alt=x.name;im.src=URL.createObjectURL(x.blob);im.onclick=function(){$('#zm img').src=im.src;$('#zm').classList.add('on')};h.appendChild(im);});});}
$('#lf').onchange=function(){var f=this.files[0];if(f)saveFile(f,'book');this.value='';};
$('#imf').onchange=function(){[].forEach.call(this.files,function(f){saveFile(f,'image')});this.value='';};
renderLib();renderImgs();
// armazenamento
var LIM=512*1048576;
function paintStore(cb){allItems(function(a){var t={file:0,image:0,book:0},tot=0;a.forEach(function(x){t[x.kind]=(t[x.kind]||0)+x.size;tot+=x.size});
 $('#sut').textContent=fmtB(tot)+' de 512 MB usados';var b=$('#sbi');b.style.display=tot?'block':'none';b.style.width=Math.max(14,Math.min(88,tot/LIM*100))+'%';
 ['file','image','book'].forEach(function(k){$('#sz-'+k).textContent=fmtB(t[k])});cb&&cb(a);});}
function openStore(){paintStore();STSH.open('base');}
$$('#stc .row').forEach(function(r){r.onclick=function(){openPick(r.dataset.k)}});
var pickK='all',selI={},urls=[],ICN={book:'<svg viewBox="0 0 24 24"><path d="M5 5.5A1.5 1.5 0 016.5 4H19v14H6.5A1.5 1.5 0 005 19.5z"/><path d="M5 19.5A1.5 1.5 0 006.5 21H19"/></svg>',file:'<svg viewBox="0 0 24 24"><path d="M7 3.5h7l4 4V20a1 1 0 01-1 1H7a1 1 0 01-1-1V4.5a1 1 0 011-1z"/><path d="M14 3.5V8h4"/></svg>'};
function openPick(k){pickK=k;selI={};$('#pick').classList.add('on');paintPick();}
function updActs(){$('#pka').classList.toggle('dis',!Object.keys(selI).some(function(k){return selI[k]}));}
function paintPick(){allItems(function(a){urls.forEach(function(u){URL.revokeObjectURL(u)});urls=[];
 $$('#pkt .tab').forEach(function(b){b.classList.toggle('on',b.dataset.k===pickK)});var tn=$('#pkt .tab.on');if(tn&&tn.scrollIntoView)tn.scrollIntoView({inline:'center',block:'nearest'});
 var l=a.filter(function(x){return pickK==='all'||x.kind===pickK}).sort(function(x,y){return y.date-x.date}),g=$('#pkg');g.innerHTML='';
 if(!l.length)g.innerHTML='<p class="empty">Nenhum item aqui ainda.</p>';
 l.forEach(function(x){var d=document.createElement('div');d.className='pc'+(selI[x.id]?' on':'');
  if(x.kind==='image'){var u=URL.createObjectURL(x.blob);urls.push(u);d.style.backgroundImage='url('+u+')';}
  d.innerHTML='<span class="pn">'+(x.kind==='image'?'':esc(x.name))+'</span><i class="ck"></i>'+(x.kind==='image'?'':'<span class="pt">'+ICN[x.kind]+'</span>');
  d.onclick=function(){selI[x.id]=!selI[x.id];d.classList.toggle('on',!!selI[x.id]);updActs();};g.appendChild(d);});
 updActs();});}
$$('#pkt .tab').forEach(function(b){b.onclick=function(){pickK=b.dataset.k;paintPick();}});
$('#pkx').onclick=function(){$('#pick').classList.remove('on');paintStore();renderLib();renderImgs();};
function selIds(){return Object.keys(selI).filter(function(k){return selI[k]});}
$('#pkd').onclick=function(){var ids=selIds();if(!ids.length)return;delItems(ids,function(){selI={};paintPick();});};
$('#pkl').onclick=function(){var ids=selIds();allItems(function(a){a.filter(function(x){return ids.indexOf(x.id)>-1}).forEach(function(x){var u=URL.createObjectURL(x.blob),l=document.createElement('a');l.href=u;l.download=x.name;document.body.appendChild(l);l.click();l.remove();setTimeout(function(){URL.revokeObjectURL(u)},4000);});});};
// uso e limites (medido de verdade neste aparelho)
function dayKey(){return new Date().toLocaleDateString('sv')}
var US={d:dayKey(),c:0,lib:0,ai:0,oth:0},lastAct=Date.now(),hidAt=0,tickN=0;
try{var uu=JSON.parse(localStorage.getItem('ju')||'{}');if(uu.d===dayKey())US=uu;}catch(e){}
function saveU(){try{localStorage.setItem('ju',JSON.stringify(US))}catch(e){}}
['pointerdown','keydown','touchstart','scroll'].forEach(function(ev){addEventListener(ev,function(){lastAct=Date.now()},{passive:true,capture:true});});
function actKey(){var v=$('.view.on').id;return v==='v-lib'?'lib':(v==='v-home'||v==='v-chat')?'ai':'oth';}
function fmtT(ms){var m=Math.floor(ms/60000),h=Math.floor(m/60);return h?h+'h '+(m%60)+'m':m+'m';}
function paintUso(){var tot=US.lib+US.ai+US.oth,p=function(x){return tot?Math.round(x/tot*100):0};
 $('#u1').textContent=US.c;$('#u2').textContent=fmtT(US.lib+US.ai);
 [['lib',1],['ai',2],['oth',3]].forEach(function(a){var v=p(US[a[0]]);$('#p'+a[1]).textContent=v+'%';$('#b'+a[1]).style.width=v+'%';});}
setInterval(function(){if(document.hidden)return;if(US.d!==dayKey())US={d:dayKey(),c:0,lib:0,ai:0,oth:0};
 var idle=Date.now()-lastAct>60000&&state==='idle',k=idle?'oth':actKey();US[k]+=1000;if(++tickN%5===0)saveU();if($('#v-uso').classList.contains('on'))paintUso();},1000);
document.addEventListener('visibilitychange',function(){if(document.hidden){hidAt=Date.now();saveU();}else if(hidAt){US.oth+=Math.min(Date.now()-hidAt,30*60000);hidAt=0;saveU();}});
$('#slogo').src=$('#logo').src;
// barra expandida e escolha da IA
function openBar(){var b=$('#bar'),a=document.activeElement,on=(a&&b.contains(a))||$('#q').value||att;b.classList.toggle('open',!!on);}
$('#bar').addEventListener('focusin',openBar);$('#bar').addEventListener('focusout',function(){setTimeout(openBar,150)});
var AIN={gpt:'ChatGPT',gem:'Gemini',both:'ChatGPT e Gemini'};
function IAN(){var k=cfg.ai||'gpt';return k==='both'?'do ChatGPT e do Gemini (juntos)':'do '+AIN[k];}
function paintAI(){$('#mdlt').textContent=AIN[cfg.ai||'gpt'];}
$('#mdl').onclick=function(){sheetOpen('Modelo de IA',[{v:'gpt',t:'ChatGPT'},{v:'gem',t:'Gemini'},{v:'both',t:'ChatGPT e Gemini'}],function(){return cfg.ai||'gpt'},function(v){cfg.ai=v;save();paintAI();});};
paintAI();upd();
try{if('serviceWorker' in navigator&&/^https?:$/.test(location.protocol))navigator.serviceWorker.register('sw.js').catch(function(){});}catch(e){}
})();
