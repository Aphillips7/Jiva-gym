(function(){
  // ---------- Intro (se muestra en cada carga, arranca cuando logo y letra están listos) ----------
  var intro=document.getElementById('intro');
  function endIntro(){ if(intro.classList.contains('done')) return; intro.classList.add('done'); document.documentElement.classList.remove('intro-on'); startLeds(); setTimeout(function(){intro.style.display='none'},800); }
  if(matchMedia('(prefers-reduced-motion: reduce)').matches){ intro.style.display='none'; setTimeout(startLeds,50); }
  else {
    document.documentElement.classList.add('intro-on');
    var started=false, t;
    function startIntro(){
      if(started) return; started=true;
      setTimeout(function(){intro.classList.add('s1')},80);
      setTimeout(function(){intro.classList.add('s2')},650);
      setTimeout(function(){intro.classList.add('s3')},950);
      setTimeout(function(){intro.classList.add('out')},2500);
      t=setTimeout(endIntro,2900);
    }
    var img=intro.querySelector('img');
    var imgReady=new Promise(function(r){ if(!img||img.complete) return r(); img.addEventListener('load',r); img.addEventListener('error',r); });
    var fontReady=(document.fonts&&document.fonts.ready)?document.fonts.ready:Promise.resolve();
    Promise.all([imgReady,fontReady]).then(startIntro);
    setTimeout(startIntro,1200); // por si algo tarda demasiado
    intro.addEventListener('click',function(){clearTimeout(t);endIntro()});
  }

  // ---------- Hex LED wall ----------
  var svg=document.getElementById('hex'); var cells=[];
  function buildHex(){
    var W=1200,H=900,r=58; svg.setAttribute('viewBox','0 0 '+W+' '+H); svg.innerHTML='';cells=[];
    var w=Math.sqrt(3)*r, h=1.5*r, gap=10;
    for(var row=-1; row*h < H+r; row++){
      for(var col=-1; col*w < W+w; col++){
        var cx=col*(w)+(row%2?w/2:0), cy=row*h, pts=[];
        for(var k=0;k<6;k++){var a=Math.PI/180*(60*k-30);pts.push((cx+(r-gap/2)*Math.cos(a)).toFixed(1)+','+(cy+(r-gap/2)*Math.sin(a)).toFixed(1));}
        var p=document.createElementNS('http://www.w3.org/2000/svg','polygon');p.setAttribute('points',pts.join(' '));svg.appendChild(p);cells.push({el:p,cx:cx,cy:cy});
      }
    }
  }
  buildHex();
  var ledsStarted=false;
  function startLeds(){
    if(ledsStarted) return; ledsStarted=true;
    var order=cells.slice().sort(function(a,b){return (a.cx+a.cy*0.6)-(b.cx+b.cy*0.6)});
    order.forEach(function(c,i){
      var rnd=Math.random(); if(rnd<0.42) return;
      setTimeout(function(){ c.el.classList.add(rnd>0.93?'red':(rnd>0.82?'hot':'on')); }, 40+i*9);
    });
    setInterval(function(){
      var c=cells[Math.floor(Math.random()*cells.length)];
      if(!c) return; var cls=c.el.getAttribute('class');
      c.el.setAttribute('class', cls? '' : (Math.random()>.85?'hot':'on'));
    },700);
  }


  // ---------- Titular: letras que suben desde una máscara ----------
  (function(){
    var h=document.querySelector('#hero h1.roll'); if(!h) return;
    var words=h.dataset.words.split('|');
    function build(text){
      var w=document.createElement('span'); w.className='rw'; var i=0;
      text.split(' ').forEach(function(word,wi){
        var wd=document.createElement('span'); wd.className='rwd';
        for(var k=0;k<word.length;k++){ var c=document.createElement('span'); c.className='rc'; c.textContent=word[k]; c.style.setProperty('--d',(i++*28)+'ms'); wd.appendChild(c); }
        w.appendChild(wd); if(wi<text.split(' ').length-1) w.appendChild(document.createTextNode(' '));
      });
      return w;
    }
    h.textContent=''; h.setAttribute('aria-live','off');
    var els=words.map(function(t){var w=build(t);h.appendChild(w);return w;});
    var cur=0, tA, tB, tNext;
    var bar=document.createElement('span'); bar.className='rwipe'; h.appendChild(bar);
    function show(n){ els.forEach(function(w,i){ if(i!==n) w.classList.remove('in'); }); void els[n].offsetWidth; els[n].classList.add('in'); }
    function go(n){
      var prev=cur; cur=n; clearTimeout(tA); clearTimeout(tB);
      var wp=els[prev].getBoundingClientRect(), wn=els[n].getBoundingClientRect(), hb=h.getBoundingClientRect();
      var w=Math.max(wp.width,wn.width), top=Math.min(wp.top,wn.top)-hb.top, bot=Math.max(wp.bottom,wn.bottom)-hb.top;
      bar.style.width=w+'px'; bar.style.top=top+'px'; bar.style.height=(bot-top)+'px';
      bar.className='rwipe cover';
      tA=setTimeout(function(){
        els.forEach(function(x){ x.classList.add('snap'); x.classList.remove('in'); });
        void h.offsetWidth; els.forEach(function(x){ x.classList.remove('snap'); });
        bar.className='rwipe reveal'; show(cur);
        tB=setTimeout(function(){ bar.className='rwipe'; }, 700);
      }, 480);
    }
    var reduceH=matchMedia('(prefers-reduced-motion: reduce)').matches;
    function next(){ clearTimeout(tNext); if(reduceH) return; tNext=setTimeout(function(){ if(!document.hidden) go((cur+1)%els.length); next(); }, 3800); }
    (function wait(){ var it=document.getElementById('intro'); if(it && !it.classList.contains('done') && it.style.display!=='none') return setTimeout(wait,120); setTimeout(function(){ show(0); next(); },250); })();
    document.addEventListener('visibilitychange',function(){ if(!document.hidden){ show(cur); next(); } });
  })();

  // ---------- Pase de prueba: se abre al pedirlo ----------
  (function(){
    var sec=document.getElementById('pase'); if(!sec) return;
    function openPase(scroll){
      sec.classList.add('open');
      sec.querySelectorAll('.rv').forEach(function(e){e.classList.add('in')});
      if(scroll) requestAnimationFrame(function(){ sec.scrollIntoView({behavior:'smooth',block:'start'}); setTimeout(function(){ var f=document.getElementById('fName'); if(f) f.focus({preventScroll:true}); },700); });
    }
    document.querySelectorAll('a[href="#pase"]').forEach(function(a){
      a.addEventListener('click',function(e){ e.preventDefault(); openPase(true); });
    });
    if(location.hash==='#pase') openPase(true);
  })();


  // ---------- Portada en celular: cargar el video solo en pantallas chicas ----------
  (function(){
    var v=document.querySelector('.hero-video'); if(!v) return;
    if(matchMedia('(max-width: 859px)').matches){
      v.src=v.dataset.src; v.load(); var p=v.play(); if(p&&p.catch)p.catch(function(){});
    }
  })();

  // ---------- Nav + sticky ----------
  var nav=document.getElementById('nav'), sticky=document.getElementById('sticky'), pase=document.getElementById('pase');
  function onScroll(){
    var y=window.scrollY; nav.classList.toggle('solid',y>innerHeight*0.6);
    var pr=pase.getBoundingClientRect(), tr=document.getElementById('telon').getBoundingClientRect(); var inPase=(pr.top<innerHeight && pr.bottom>0)||(tr.top<innerHeight*0.5 && tr.bottom>innerHeight*0.5);
    if(sticky) sticky.classList.toggle('show', y>innerHeight*0.8 && !inPase);
  }
  addEventListener('scroll',onScroll,{passive:true}); onScroll();

  // ---------- Reveal + counters ----------
  var io=new IntersectionObserver(function(es){es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target);} })},{threshold:.15});
  // Efecto Framer solo en Beneficios y Preguntas frecuentes
  document.querySelectorAll('#beneficios .eyebrow, #beneficios h2, #faq .eyebrow, #faq h2').forEach(function(el,i){ el.classList.add('fx'); });
  document.querySelectorAll('.blist, #faq .wrap > div').forEach(function(g){
    [].slice.call(g.children).forEach(function(c,i){ c.classList.add('fx'); c.style.setProperty('--rd',(i*90)+'ms'); });
  });
  document.querySelectorAll('.fx').forEach(function(el){io.observe(el)});
  document.querySelectorAll('.rv,.bolt-sep').forEach(function(el){io.observe(el)});
  document.querySelectorAll('.count').forEach(function(el){
    var to=+el.dataset.to, t0=null;
    function fmt(v){return el.dataset.fmt==='k'? (v/1000).toFixed(1).replace('.',',')+' mil' : Math.round(v)}
    function step(ts){ if(!t0)t0=ts; var p=Math.min((ts-t0)/1600,1); el.textContent=fmt(to*(1-Math.pow(1-p,3))); if(p<1)requestAnimationFrame(step)}
    setTimeout(function(){requestAnimationFrame(step)}, seen?200:2400);
  });


  // ---------- Stack + telón (scroll, con suavizado tipo resorte) ----------
  var scards=[].slice.call(document.querySelectorAll('.scard'));
  // marcadores sin transformación para medir sin "rebote" (evita temblor)
  var marks=scards.map(function(c){var m=document.createElement('i');m.className='smark';c.parentNode.insertBefore(m,c);return m;});
  var cur=document.getElementById('telon'), curS=cur.querySelector('.cur-sticky');
  var state=scards.map(function(){return {e:0,p:0,te:0,tp:0}}), curP={v:0,t:0}, running=false;
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  var touch=matchMedia('(hover: none), (pointer: coarse)').matches;
  if(touch){
    // En celular: entrada por tiempo (una vez) y sin efectos ligados al scroll, para que no vibre
    document.documentElement.classList.add('stack-touch');
    var io3=new IntersectionObserver(function(es){es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('landed'); io3.unobserve(e.target);} })},{threshold:.12});
    scards.forEach(function(c){io3.observe(c)});
  }
  var stTop=[]; function measure(){ stTop=scards.map(function(c){return parseFloat(getComputedStyle(c).top)||86}); } measure(); addEventListener('resize',measure);
  function targets(){
    var vh=innerHeight;
    scards.forEach(function(card,i){
      var st=stTop[i];
      var mt=marks[i].getBoundingClientRect().top;
      var e=Math.min(Math.max((vh-mt)/(vh-st),0),1);
      state[i].te=e;
      if(i<scards.length-1){
        var nt=marks[i+1].getBoundingClientRect().top, h=card.offsetHeight;
        var stuck=Math.max(mt,st);
        state[i].tp=Math.min(Math.max(1-(nt-stuck)/h,0),1);
      }
    });
    var cr=cur.getBoundingClientRect(), span=cr.height-vh;
    var raw=Math.min(Math.max(-cr.top/span,0),1);
    curP.t=Math.min(Math.max((raw-0.02)/0.85,0),1);
  }
  function apply(){
    if(!touch) scards.forEach(function(card,i){
      var s=state[i], e=1-Math.pow(1-s.e,3);
      card.style.setProperty('--ty',((1-e)*80).toFixed(2)+'px');
      card.style.setProperty('--er',((1-e)*(i%2?4:-4)).toFixed(3)+'deg');
      card.style.setProperty('--es',(0.93+0.07*e).toFixed(4));
      card.style.setProperty('--s',(1-s.p*0.07).toFixed(4));
      card.style.setProperty('--dim',(s.p*0.45).toFixed(4));
    });
    var p2=curP.v; p2=p2<.5?2*p2*p2:1-Math.pow(-2*p2+2,2)/2;
    curS.style.setProperty('--p',p2.toFixed(4));
  }
  function loop(){
    var k=(reduce||touch)?1:0.14, moving=false;
    state.forEach(function(s){ s.e+=(s.te-s.e)*k; s.p+=(s.tp-s.p)*k; if(Math.abs(s.te-s.e)>.0005||Math.abs(s.tp-s.p)>.0005) moving=true; });
    curP.v+=(curP.t-curP.v)*((reduce||touch)?1:0.2); if(Math.abs(curP.t-curP.v)>.0005) moving=true;
    apply();
    if(moving) requestAnimationFrame(loop); else running=false;
  }
  function onScrollFx(){ targets(); if(!running){running=true;requestAnimationFrame(loop);} }
  addEventListener('scroll',onScrollFx,{passive:true});
  addEventListener('resize',onScrollFx); targets(); state.forEach(function(s){s.e=s.te;s.p=s.tp}); curP.v=curP.t; apply();

  // ---------- Flip cards ----------
  document.querySelectorAll('.flip').forEach(function(b){b.addEventListener('click',function(){b.classList.toggle('open')})});


  // ---------- Tarjetas con video al pasar el cursor ----------
  document.querySelectorAll('.fcard').forEach(function(c){
    var v=c.querySelector('video'), src=c.dataset.video;
    if(!src) return;
    v.src=src;
    c.addEventListener('mouseenter',function(){ c.classList.add('playing'); var p=v.play(); if(p&&p.catch)p.catch(function(){}); });
    c.addEventListener('mouseleave',function(){ c.classList.remove('playing'); v.pause(); v.currentTime=0; });
  });


  // ---------- Tienda: video al pasar el cursor (en celular, al verse) ----------
  (function(){
    var cards=[].slice.call(document.querySelectorAll('.scat')).filter(function(c){return c.querySelector('video')});
    if(!cards.length) return;
    function play(c){var v=c.querySelector('video');c.classList.add('playing');var p=v.play();if(p&&p.catch)p.catch(function(){c.classList.remove('playing')});}
    function stop(c){var v=c.querySelector('video');c.classList.remove('playing');v.pause();}
    var hover=matchMedia('(hover: hover)').matches;
    if(hover){
      cards.forEach(function(c){c.addEventListener('mouseenter',function(){play(c)});c.addEventListener('mouseleave',function(){stop(c);c.querySelector('video').currentTime=0;});});
    } else if('IntersectionObserver' in window){
      var io2=new IntersectionObserver(function(es){es.forEach(function(e){ if(e.intersectionRatio>=0.6) play(e.target); else stop(e.target); })},{threshold:[0,0.6]});
      cards.forEach(function(c){io2.observe(c)});
    }
  })();

  // ---------- Schedule ----------
  (function(){
    var now=new Date(), d=now.getDay(), h=now.getHours()+now.getMinutes()/60;
    var open = d===0 ? (h>=10&&h<18) : (h>=5&&h<23);
    document.querySelectorAll('#sched div').forEach(function(r){ if(r.dataset.d.split(',').indexOf(String(d))>-1) r.classList.add('today'); });
    document.getElementById('openNow').innerHTML='<span class="dot" style="background:'+(open?'#2ecc71':'#e2231a')+'"></span>'+(open?'Abierto ahora':'Cerrado ahora');
  })();

  // ---------- Day options ----------
  var days=['domingo','lunes','martes','miércoles','jueves','viernes','sábado'];
  var sel=document.getElementById('fDay');
  for(var i=0;i<7;i++){ var dt=new Date(); dt.setDate(dt.getDate()+i); var o=document.createElement('option');
    o.value=dt.toISOString().slice(0,10); o.textContent=(i===0?'Hoy':i===1?'Mañana':days[dt.getDay()][0].toUpperCase()+days[dt.getDay()].slice(1))+' '+dt.getDate()+'/'+(dt.getMonth()+1); sel.appendChild(o); }

  // ---------- Leads store ----------
  var KEY='jivaLeadsV1';
  function seed(){ var d=function(n){var x=new Date();x.setDate(x.getDate()-n);return x.toISOString()};
    return [
      {name:'María González',phone:'6123-4567',when:'Hoy · Noche',goal:'Bajar de peso',code:'JIVA-4821',at:d(0),st:0},
      {name:'José Rodríguez',phone:'6789-1234',when:'Ayer · Madrugada',goal:'Ganar masa muscular',code:'JIVA-3390',at:d(1),st:1},
      {name:'Ana Castillo',phone:'6555-0192',when:'Sáb · Mañana',goal:'Salud y energía',code:'JIVA-1176',at:d(3),st:2},
      {name:'Luis Herrera',phone:'6234-8810',when:'Vie · Tarde',goal:'Volver a entrenar',code:'JIVA-2054',at:d(4),st:1},
      {name:'Carla Ríos',phone:'6901-3345',when:'Jue · Noche',goal:'Bajar de peso',code:'JIVA-7712',at:d(5),st:2}
    ];}
  var leads; try{ leads=JSON.parse(localStorage.getItem(KEY)) }catch(e){}
  if(!Array.isArray(leads)) leads=seed();
  function save(){ try{localStorage.setItem(KEY,JSON.stringify(leads))}catch(e){} }
  var ST=['Nuevo','Visitó','Inscrito'];
  function esc(s){return String(s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
  function render(newIdx){
    var box=document.getElementById('leads'); if(!box) return; box.innerHTML='';
    leads.forEach(function(l,i){
      var row=document.createElement('div'); row.className='lead-row'+(i===newIdx?' new':'');
      row.innerHTML='<div><div class="n">'+esc(l.name)+'</div><div class="d">'+esc(l.phone)+' · '+esc(l.when)+' · '+esc(l.goal)+'</div></div><button class="status st-'+l.st+'" data-i="'+i+'">'+ST[l.st]+'</button>';
      box.appendChild(row);
    });
    var v=leads.filter(function(l){return l.st>=1}).length, j=leads.filter(function(l){return l.st===2}).length;
    document.getElementById('kLeads').textContent=leads.length;
    document.getElementById('kVisit').textContent=v;
    document.getElementById('kJoin').textContent=j;
    document.getElementById('kConv').textContent=leads.length?Math.round(j/leads.length*100)+'%':'0%';
  }
  var leadsBox=document.getElementById('leads'); if(leadsBox) leadsBox.addEventListener('click',function(e){var b=e.target.closest('.status'); if(!b)return; var l=leads[+b.dataset.i]; l.st=(l.st+1)%3; save(); render();});
  var rd=document.getElementById('resetDemo'); if(rd) rd.addEventListener('click',function(){leads=seed();save();render();});
  render();

  // ---------- Toast ----------
  var toast=document.getElementById('toast'), tt;
  function notify(t,s){ document.getElementById('toastT').textContent=t; document.getElementById('toastS').textContent=s; toast.classList.add('show'); clearTimeout(tt); tt=setTimeout(function(){toast.classList.remove('show')},4200); }

  // ---------- Pass form ----------
  var form=document.getElementById('passForm');
  form.addEventListener('submit',function(e){
    e.preventDefault();
    var name=document.getElementById('fName').value.trim(), phone=document.getElementById('fPhone').value.replace(/\D/g,'');
    var ok=true;
    document.getElementById('eName').style.display=name?'none':'block'; if(!name) ok=false;
    var phOk=phone.length===8; document.getElementById('ePhone').style.display=phOk?'none':'block'; if(!phOk) ok=false;
    if(!ok) return;
    var code='JIVA-'+(1000+Math.floor(Math.random()*9000));
    var dayTxt=sel.options[sel.selectedIndex].textContent, time=document.getElementById('fTime').value.split(' (')[0];
    var phoneFmt=phone.slice(0,4)+'-'+phone.slice(4);
    document.getElementById('tName').textContent=name;
    document.getElementById('tCode').innerHTML='<span class="jv">JIVA</span>'+code.slice(4);
    document.getElementById('tWhen').textContent=dayTxt+' · '+time;
    var qr=document.getElementById('qr'); qr.innerHTML='';
    var payload='JIVA:'+code+':'+phone+':'+sel.value;
    if(window.QRCode){ new QRCode(qr,{text:payload,width:240,height:240,colorDark:'#0B0B0C',colorLight:'#ffffff',correctLevel:QRCode.CorrectLevel.M}); }
    else { qr.innerHTML='<div style="width:120px;height:120px;display:flex;align-items:center;justify-content:center;color:#000;font:800 16px Archivo">'+code+'</div>'; }
    var msg='Hola Jiva Gym, soy '+name+'. Tengo mi pase de prueba '+code+' para '+dayTxt.toLowerCase()+' ('+time.toLowerCase()+').';
    document.getElementById('tWa').href='https://wa.me/50769554652?text='+encodeURIComponent(msg);
    form.classList.add('sent');
    var t=document.getElementById('ticket'); t.classList.remove('show'); void t.offsetWidth; t.classList.add('show');
    leads.unshift({name:name,phone:phoneFmt,when:dayTxt+' · '+time,goal:document.getElementById('fGoal').value,code:code,at:new Date().toISOString(),st:0});
    save(); render(0);
    setTimeout(function(){ notify('¡Listo, '+name.split(' ')[0]+'!', 'Tu pase '+code+' está listo · '+dayTxt); },600);
    t.scrollIntoView({behavior:'smooth',block:'center'});
  });
})();
