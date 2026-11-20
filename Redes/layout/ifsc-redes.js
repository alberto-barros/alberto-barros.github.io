/* IFSC Redes · comportamento genérico (copiar, checklist, menu Tópicos, quiz, topo). */
(function(){
  var $ = function(id){ return document.getElementById(id); };
  var PAGE = document.body.getAttribute('data-page') || 'aula';
  // ---------- copiar ----------
  function selectEl(el){ var r=document.createRange(); r.selectNodeContents(el); var s=getSelection(); s.removeAllRanges(); s.addRange(r); }
  document.querySelectorAll('.code .copy').forEach(function(btn){
    btn.addEventListener('click', function(){
      var el = btn.closest('.code').querySelector('pre'), label = btn.innerHTML;
      var done = function(msg){ btn.innerHTML = msg; setTimeout(function(){ btn.innerHTML = label; }, 1600); };
      try { navigator.clipboard.writeText(el.textContent).then(function(){ done('Copiado'); }, function(){ selectEl(el); done('Selecionado: Ctrl+C'); }); }
      catch(e){ selectEl(el); done('Selecionado: Ctrl+C'); }
    });
  });
  // checklist (opcional)
  if ($('checklist')) (function(){
  // ---------- checklist ----------
  var cks = Array.prototype.slice.call(document.querySelectorAll('#checklist input')), ckState = {};
  try { ckState = JSON.parse(localStorage.getItem(PAGE+'-check')||'{}') || {}; } catch(e){}
  function updProg(){ var n = cks.filter(function(c){return c.checked;}).length, pc = Math.round(n/cks.length*100); $('prog').style.width = pc+'%'; $('prog-bar').setAttribute('aria-valuenow', pc); $('prog-txt').innerHTML = '<b>'+pc+'%</b> · '+n+' de '+cks.length+(pc===100?' · concluído':''); $('prog-txt').classList.toggle('done', pc===100); }
  cks.forEach(function(c){
    c.checked = !!ckState[c.id];
    c.addEventListener('change', function(){ ckState[c.id] = c.checked; try{ localStorage.setItem(PAGE+'-check', JSON.stringify(ckState)); }catch(e){} updProg(); });
  });
  updProg();

  })();
  // ---------- menu de tópicos ----------
  (function(){
    var btn = $('tb-topics'), menu = $('tmenu');
    function setOpen(o){ menu.hidden = !o; btn.setAttribute('aria-expanded', o); }
    btn.addEventListener('click', function(e){ e.stopPropagation(); setOpen(menu.hidden); });
    menu.addEventListener('click', function(e){ if (e.target.closest('a')) setOpen(false); });
    document.addEventListener('click', function(e){ if (!menu.hidden && !menu.contains(e.target)) setOpen(false); });
    document.addEventListener('keydown', function(e){ if (e.key==='Escape' && !menu.hidden){ setOpen(false); btn.focus(); } });
  })();
  // quiz (opcional): defina window.IFSC_QUIZ = [{t,q,o:[certa,...],e}] antes deste script
  if ($('q-stage')) // ---------- quiz ----------
  (function(){
    var BANK = window.IFSC_QUIZ || [];
    var MSG = window.IFSC_QUIZ_MSGS || {};
    var Q = [];
    var stage = $('q-stage'), steps = $('q-steps'), cur = 0, ans = [], picks = [], timer = null, lastSet = [];
    function shuffle(a){ a = a.slice(); for (var i=a.length-1;i>0;i--){ var j=Math.floor(Math.random()*(i+1)), t=a[i]; a[i]=a[j]; a[j]=t; } return a; }
    function draw(){
      var seen = [];
      try { seen = JSON.parse(localStorage.getItem(PAGE+'-quiz-seen')||'[]') || []; } catch(e){}
      var fresh = BANK.map(function(_,i){return i;}).filter(function(i){ return seen.indexOf(i)<0 && lastSet.indexOf(i)<0; });
      if (fresh.length < 10){ seen = []; fresh = BANK.map(function(_,i){return i;}).filter(function(i){ return lastSet.indexOf(i)<0; }); }
      var pick = shuffle(fresh).slice(0,10);
      lastSet = pick; seen = seen.concat(pick);
      try { localStorage.setItem(PAGE+'-quiz-seen', JSON.stringify(seen)); } catch(e){}
      return pick.map(function(i){
        var x = BANK[i], ord = shuffle([0,1,2,3]);
        return {t:x.t, q:x.q, e:x.e, o:ord.map(function(k){return x.o[k];}), c:ord.indexOf(0)};
      });
    }
    var reduced = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    var SVG = function(id){ return '<svg><use href="#'+id+'"/></svg>'; };
    function chips(){ var ok = ans.filter(function(a){return a===true;}).length, bad = ans.filter(function(a){return a===false;}).length; $('q-ok').textContent = ok; $('q-bad').textContent = bad; }
    function drawSteps(){ steps.innerHTML = Q.map(function(_,i){ return '<i class="'+(ans[i]===true?'ok':ans[i]===false?'bad':i===cur?'cur':'')+'"></i>'; }).join(''); }
    function swap(html){
      var old = stage.firstElementChild;
      var put = function(){ stage.innerHTML = html; };
      if (old && !reduced){ old.classList.add('out'); setTimeout(put, 280); } else put();
    }
    function show(i){
      clearTimeout(timer); cur = i; drawSteps();
      var x = Q[i];
      swap('<div class="qz-card"><div class="qz-meta"><span class="qz-num">Pergunta '+(i+1)+' de '+Q.length+'</span><span class="qz-tag">'+x.t+'</span></div>'+
        '<p class="qz-q">'+x.q+'</p><div class="qz-opts" role="group" aria-label="Alternativas">'+
        x.o.map(function(o,j){ return '<button type="button" class="qz-opt" data-o="'+j+'"><span class="L">'+'ABCD'[j]+'</span><span>'+o+'</span><span class="st"></span></button>'; }).join('')+
        '</div><div class="qz-after"></div></div>');
    }
    function answer(j){
      var x = Q[cur], right = j===x.c, card = stage.querySelector('.qz-card');
      ans[cur] = right; picks[cur] = j; chips(); drawSteps();
      card.querySelectorAll('.qz-opt').forEach(function(b,k){
        b.disabled = true;
        if (k===x.c){ b.classList.add('right'); b.querySelector('.st').innerHTML = SVG('i-check'); }
        else if (k===j){ b.classList.add('wrong'); b.querySelector('.st').innerHTML = SVG('i-x'); }
        else b.classList.add('dim');
      });
      var last = cur===Q.length-1, dur = right ? 3500 : 7000;
      card.querySelector('.qz-after').outerHTML =
        '<div class="qz-fb" style="--fc:'+(right?'var(--ok)':'var(--bad)')+'"><span class="fi">'+SVG(right?'i-check':'i-x')+'</span><div><h4>'+(right?'Resposta certa!':'Não foi dessa vez. A resposta é a letra '+'ABCD'[x.c]+'.')+'</h4><p>'+x.e+'</p></div></div>'+
        '<div class="qz-next"><button type="button" class="btn" id="q-go">'+(last?'Ver minha nota':'Próxima pergunta')+' <span aria-hidden="true">→</span></button></div>';
      $('q-go').focus({preventScroll:true});
    }
    function review(i){
      var x = Q[i], p = picks[i], box = $('q-review'), ok = ans[i];
      stage.querySelectorAll('[data-r]').forEach(function(b){ b.setAttribute('aria-pressed', +b.dataset.r===i); });
      box.style.setProperty('--fc', ok ? 'var(--ok)' : 'var(--bad)');
      box.innerHTML = '<div class="qz-meta"><span class="qz-num">Pergunta '+(i+1)+' de '+Q.length+'</span><span class="qz-tag">'+x.t+'</span><span class="qz-res">'+(ok?'Você acertou':'Você errou')+'</span></div>'+
        '<p class="qz-rq">'+x.q+'</p><ul class="qz-rl">'+x.o.map(function(o,k){
          var cls = k===x.c ? 'right' : (k===p ? 'wrong' : ''), note = k===x.c ? (k===p?'Sua resposta · correta':'Resposta correta') : (k===p ? 'Sua resposta' : '');
          return '<li class="'+cls+'"><span class="L">'+'ABCD'[k]+'</span><span>'+o+'</span>'+(note?'<em>'+note+'</em>':'')+'</li>'; }).join('')+'</ul>'+
        '<p class="qz-rexp"><b>Explicação: </b>'+x.e+'</p>';
      box.hidden = false;
      box.scrollIntoView({behavior: reduced ? 'auto' : 'smooth', block:'nearest'});
    }
    function next(){ clearTimeout(timer); if (cur < Q.length-1) show(cur+1); else end(); }
    function end(){
      cur = Q.length; drawSteps();
      var ok = ans.filter(function(a){return a;}).length, nota = ok/Q.length*10, c, t, m;
      if (nota>=9){ c='var(--ok)'; t='Excelente!'; m=MSG.top||'Você domina o conteúdo desta aula.'; }
      else if (nota>=7){ c='var(--green)'; t='Muito bem!'; m=MSG.good||'Bom resultado. Revise as perguntas marcadas em vermelho.'; }
      else if (nota>=5){ c='var(--warn)'; t='Quase lá'; m=MSG.mid||'Releia a aula e tente de novo.'; }
      else { c='var(--bad)'; t='Vamos revisar'; m=MSG.low||'Volte ao início da aula e refaça o quiz.'; }
      swap('<div class="qz-end"><div class="qz-ring" style="--gc:'+c+';--p:'+(nota*10)+'"><span>Sua nota</span><b>'+nota.toLocaleString('pt-BR',{minimumFractionDigits:1,maximumFractionDigits:1})+'</b><small>de 10</small></div>'+
        '<div><h3>'+t+'</h3><p style="color:var(--muted);margin-top:6px">'+ok+' de '+Q.length+' acertos. '+m+'</p></div>'+
        '<div class="qz-sumwrap"><p class="qz-hint">Clique em um card para rever a pergunta e a resposta.</p><div class="qz-sum">'+Q.map(function(x,i){ return '<button type="button" data-r="'+i+'" aria-pressed="false" style="--sc:'+(ans[i]?'var(--ok)':'var(--bad)')+'">'+(ans[i]?'✓':'✗')+' '+(i+1)+'<small>'+x.t+'</small></button>'; }).join('')+'</div><div class="qz-review" id="q-review" hidden></div></div>'+
        '<button type="button" class="btn" id="q-redo">'+SVG('i-play')+'Tentar novamente com novas perguntas</button></div>');
    }
    stage.addEventListener('click', function(e){
      var b = e.target.closest('.qz-opt'); if (b && !b.disabled){ answer(+b.dataset.o); return; }
      var r = e.target.closest('[data-r]'); if (r){ review(+r.dataset.r); return; }
      if (e.target.closest('#q-go')) next();
      if (e.target.closest('#q-redo')){ ans = []; picks = []; Q = draw(); chips(); show(0); $('quiz').scrollIntoView({behavior:reduced?'auto':'smooth',block:'start'}); }
    });
    if(BANK.length>=10){ Q = draw(); chips(); show(0); }
  })();
  (function(){ var tb=document.querySelector('.topbar'); if(!tb) return; function f(){ tb.classList.toggle('scrolled',(window.scrollY||document.documentElement.scrollTop)>24); } f(); window.addEventListener('scroll',f,{passive:true}); })();
})();
