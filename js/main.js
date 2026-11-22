(function(){
  // ---------- Intro ----------
  var intro=document.getElementById('intro');
  var seen=false; try{seen=sessionStorage.getItem('jivaIntro')==='1'}catch(e){}
  function endIntro(){ intro.classList.add('done'); startLeds(); try{sessionStorage.setItem('jivaIntro','1')}catch(e){} }
  if(seen || matchMedia('(prefers-reduced-motion: reduce)').matches){ intro.style.display='none'; setTimeout(startLeds,50); }
  else {
    setTimeout(function(){intro.classList.add('s1')},250);
    setTimeout(function(){intro.classList.add('s2')},850);
    setTimeout(function(){intro.classList.add('s3')},1150);
    setTimeout(function(){intro.classList.add('out')},2700);
    var t=setTimeout(endIntro,3100);
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


  // ---------- Titular con efecto de escritura ----------
  (function(){
    var el=document.querySelector('#hero h1 .type'); if(!el) return;
    var words=(el.dataset.words||el.textContent).split('|'); if(words.length<2) return;
    if(matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var wi=0, txt=words[0], deleting=false;
    function tick(){
      var target=words[wi];
      if(!deleting){
        if(txt.length<target.length){ txt=target.slice(0,txt.length+1); el.textContent=txt; return setTimeout(tick,85); }
        deleting=true; return setTimeout(tick,2400);
      } else {
        if(txt.length>0){ txt=txt.slice(0,-1); el.textContent=txt; return setTimeout(tick,40); }
        deleting=false; wi=(wi+1)%words.length; return setTimeout(tick,250);
      }
    }
    setTimeout(function(){deleting=true;tick();}, 5200);
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
  document.querySelectorAll('.rv,.bolt-sep').forEach(function(el){io.observe(el)});
  document.querySelectorAll('.count').forEach(function(el){
    var to=+el.dataset.to, t0=null;
    function fmt(v){return el.dataset.fmt==='k'? (v/1000).toFixed(1).replace('.',',')+' mil' : Math.round(v)}
    function step(ts){ if(!t0)t0=ts; var p=Math.min((ts-t0)/1600,1); el.textContent=fmt(to*(1-Math.pow(1-p,3))); if(p<1)requestAnimationFrame(step)}
    setTimeout(function(){requestAnimationFrame(step)}, seen?200:2400);
  });


  // ---------- Stack + telón (scroll) ----------
  var scards=[].slice.call(document.querySelectorAll('.scard'));
  var cur=document.getElementById('telon'), curS=cur.querySelector('.cur-sticky');
  var ticking=false;
  function onScrollFx(){
    for(var i=0;i<scards.length-1;i++){
      var r=scards[i].getBoundingClientRect(), n=scards[i+1].getBoundingClientRect();
      var p=Math.min(Math.max(1-(n.top-r.top)/r.height,0),1);
      scards[i].style.setProperty('--s',(1-p*0.07).toFixed(3));
      scards[i].style.setProperty('--b',(1-p*0.45).toFixed(3));
    }
    var cr=cur.getBoundingClientRect(), span=cr.height-innerHeight;
    var raw=Math.min(Math.max(-cr.top/span,0),1);
    var p2=Math.min(Math.max((raw-0.05)/0.75,0),1); p2=p2<.5?2*p2*p2:1-Math.pow(-2*p2+2,2)/2;
    curS.style.setProperty('--p',p2.toFixed(4));
    ticking=false;
  }
  addEventListener('scroll',function(){ if(!ticking){ticking=true;requestAnimationFrame(onScrollFx);} },{passive:true});
  addEventListener('resize',onScrollFx); onScrollFx();

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
    document.getElementById('tWa').href='https://wa.me/?text='+encodeURIComponent(msg);
    form.classList.add('sent');
    var t=document.getElementById('ticket'); t.classList.remove('show'); void t.offsetWidth; t.classList.add('show');
    leads.unshift({name:name,phone:phoneFmt,when:dayTxt+' · '+time,goal:document.getElementById('fGoal').value,code:code,at:new Date().toISOString(),st:0});
    save(); render(0);
    setTimeout(function(){ notify('¡Listo, '+name.split(' ')[0]+'!', 'Tu pase '+code+' está listo · '+dayTxt); },600);
    t.scrollIntoView({behavior:'smooth',block:'center'});
  });
})();
